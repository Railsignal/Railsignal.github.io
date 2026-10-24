RailSNTGyan HMIS-style Login V1 — GitHub Pages upload

Contents
- index.html : full existing portal; only login markup/CSS and public login navigation enhanced
- assets/hmis-tracks.webp : railway tracks artwork (from approved assistant-created visual preview)
- assets/hmis-signal.webp : S-28 signal; bottom RED ON, upper two OFF
- assets/hmis-header-rail.webp : small decorative railway header image
- assets/login-desktop-4k.webp, assets/login-mobile-4k.webp : old wallpaper originals kept for safety

UPLOAD:
1. Back up existing GitHub index.html first.
2. Upload index.html to the root of Railsignal.github.io repository.
3. Upload hmis-tracks.webp, hmis-signal.webp, hmis-header-rail.webp into the existing assets folder.
4. Do not delete existing assets or data files, particularly assets/rail-user-worker-config.js if present.
5. Refresh the site (Ctrl+Shift+R) and check phone/tablet/desktop.

PRESERVED:
Firebase signInWithEmailAndPassword, custom-claim roles, profile and Admin Management,
Cloudflare Worker integration hooks, Firestore application logic, all authenticated pages,
V4.4 welcome transition, original SVG logo.

Login page design notes:
- Modern light government-portal style inspired by approved reference, not an official ministry website.
- Mobile view: railway hero above white sign-in form.
- Desktop view: two columns with navy navigation.
- "Forgot password?" uses existing Firebase Auth and requires no added backend.
- Because the site deliberately uses SESSION Firebase persistence, no misleading Remember Me toggle was added.
- Log in with test account on your deployed site to verify live Firebase/network, which cannot be exercised offline.

Security: No admin passwords/private keys added. Do NOT upload service-account keys to GitHub.
