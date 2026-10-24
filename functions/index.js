'use strict';
// RailSNTGyan user management. Deploy as Firebase Cloud Function (Gen 2).
// Admin SDK credentials MUST NEVER be shipped to GitHub Pages or index.html.
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const {getAuth} = require('firebase-admin/auth');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
initializeApp();

const auth = getAuth();
const store = getFirestore();
const OPTIONS = {region: 'us-central1', memory:'256MiB', timeoutSeconds:30, maxInstances:5};
const clean = (x, max = 120) => String(x == null ? '' : x).trim().slice(0,max);
const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
function ensureValid(test, message) { if (!test) throw new HttpsError('invalid-argument', message); }
function errSafe(e) {
  if (e instanceof HttpsError) return e;
  const code = String(e.code || '');
  if (code.includes('email-already-exists')) return new HttpsError('already-exists','An account with this email already exists.');
  if (code.includes('user-not-found')) return new HttpsError('not-found','User not found. Refresh and try again.');
  if (code.includes('invalid-email')) return new HttpsError('invalid-argument','Invalid email address.');
  if (code.includes('invalid-password')) return new HttpsError('invalid-argument','Password rejected by Firebase password policy.');
  console.error('railManageUsers internal error',e);
  return new HttpsError('internal','User management action failed. Check Firebase Function logs.');
}
async function checkAdmin(req) {
  if (!req.auth || !req.auth.uid || req.auth.token.admin !== true) {
    throw new HttpsError('permission-denied','Only a signed-in RailSNTGyan administrator can manage users.');
  }
  // Recheck current Firebase Auth user, not only an old signed token.
  const user = await auth.getUser(req.auth.uid);
  if (user.disabled || user.customClaims?.admin !== true) {
    throw new HttpsError('permission-denied','Admin access was disabled or revoked.');
  }
  return user;
}
function publicUser(u, details={}) {
  return {uid:u.uid,email:u.email || '',name:u.displayName || '',
    disabled:!!u.disabled,admin:u.customClaims?.admin === true,
    createdAt:u.metadata?.creationTime || '',lastLoginAt:u.metadata?.lastSignInTime || '',
    designation:details.designation||'',division:details.division||'',department:details.department||'',
    contact:details.contact||''};
}
async function detailsFor(uid) {
  const s=await store.collection('rail_user_profiles').doc(uid).get();
  return s.exists ? s.data() : {};
}
async function audit(actor,action,target,metadata={}) {
  // Never log user passwords, reset tokens, or raw credentials.
  await store.collection('rail_admin_audit').add({actorUid:actor,action,targetUid:target,
    metadata,createdAt:FieldValue.serverTimestamp()});
}
function readDetails(d) {
  return {designation:clean(d.designation,100),division:clean(d.division,100),
    department:clean(d.department,100),contact:clean(d.contact,35)};
}
async function protectTarget(uid,actorUid) {
  ensureValid(uid && uid.length <=128,'Select a valid user.');
  const existing=await auth.getUser(uid);
  if (existing.customClaims?.admin === true || uid===actorUid) {
    throw new HttpsError('permission-denied','Admin accounts cannot be changed from this screen.');
  }
  return existing;
}

exports.railManageUsers = onCall(OPTIONS, async req => {
  const actor=await checkAdmin(req);
  const d=req.data || {};
  const action=clean(d.action,30);
  try {
    if (action==='list') {
      const pageToken=clean(d.pageToken,1000) || undefined;
      const result=await auth.listUsers(100,pageToken);
      // Batch read user profile records, including historic Firebase Auth users.
      const refs=result.users.map(u=>store.collection('rail_user_profiles').doc(u.uid));
      const docs=refs.length ? await store.getAll(...refs) : [];
      const users=result.users.map((u,i)=>publicUser(u,docs[i]?.exists ? docs[i].data() : {}));
      return {users,nextPageToken:result.pageToken || null};
    }
    if (action==='create') {
      const email=clean(d.email,254).toLowerCase(),name=clean(d.name,100),password=String(d.password||'');
      ensureValid(validEmail(email),'Enter a valid email address.');
      ensureValid(name.length>=2,'Enter a display name (minimum 2 characters).');
      ensureValid(password.length>=10 && password.length<=128,'Temporary password must be 10–128 characters.');
      // Never grant an admin claim from the browser (no client-role elevation).
      const u=await auth.createUser({email,displayName:name,password,disabled:false,emailVerified:false});
      const extra=readDetails(d);
      try {
        await store.collection('rail_user_profiles').doc(u.uid).set({...extra,
          email,name,role:'user',createdBy:actor.uid,createdAt:FieldValue.serverTimestamp(),
          updatedAt:FieldValue.serverTimestamp()},{merge:true});
      } catch(error) {
        // Avoid leaving an orphan Auth user after a profile write failure.
        await auth.deleteUser(u.uid).catch(e=>console.error('rollback failure',e));
        throw error;
      }
      await audit(actor.uid,'create',u.uid,{email}).catch(e=>console.error('audit failure',e));
      return {user:publicUser(u,extra)};
    }
    if (action==='update') {
      const uid=clean(d.uid,128),existing=await protectTarget(uid,actor.uid);
      const name=clean(d.name,100),email=clean(d.email,254).toLowerCase();
      ensureValid(name.length>=2,'Enter a display name (minimum 2 characters).');
      ensureValid(validEmail(email),'Enter a valid email.');
      const update={displayName:name};
      if(email !== (existing.email||'').toLowerCase()) {update.email=email;update.emailVerified=false;}
      // Firebase Auth is authoritative for identity. Profile is metadata only.
      const updated=await auth.updateUser(uid,update);
      const extra=readDetails(d);
      await store.collection('rail_user_profiles').doc(uid).set({...extra,name,email,
        role:'user',updatedBy:actor.uid,updatedAt:FieldValue.serverTimestamp()},{merge:true});
      await audit(actor.uid,'update',uid,{email}).catch(e=>console.error('audit failure',e));
      return {user:publicUser(updated,extra)};
    }
    if (action==='setDisabled') {
      const uid=clean(d.uid,128);await protectTarget(uid,actor.uid);
      ensureValid(typeof d.disabled==='boolean','Invalid enabled/disabled value.');
      const updated=await auth.updateUser(uid,{disabled:d.disabled});
      if (d.disabled) await auth.revokeRefreshTokens(uid);
      await audit(actor.uid,d.disabled?'disable':'enable',uid).catch(e=>console.error('audit failure',e));
      return {user:publicUser(updated,await detailsFor(uid))};
    }
    if (action==='setPassword') {
      const uid=clean(d.uid,128),password=String(d.password||'');
      await protectTarget(uid,actor.uid);
      ensureValid(password.length>=10 && password.length<=128,'New password must be 10–128 characters.');
      await auth.updateUser(uid,{password});
      await auth.revokeRefreshTokens(uid);
      await audit(actor.uid,'set-password',uid).catch(e=>console.error('audit failure',e));
      return {ok:true};
    }
    throw new HttpsError('invalid-argument','Unknown action.');
  } catch(e) {throw errSafe(e);}
});
