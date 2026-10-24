RAILSNTGYAN — TABLET PORTRAIT LOGIN LAYOUT FIX (24 OCT 2026)

MAIN CHANGE
- Tablet portrait, 601–900 CSS px wide: resize the large full-height white sign-in panel
  into a centered content-sized form, enlarge railway artwork and remove blank space.
- Fits without page scrolling on tested iPad Mini 768x1024, 800x1280, 768x850.
- Phone, laptop/desktop and tablet landscape login rules remain unchanged.
- Firebase login, user/admin management, portal features and Firestore logic untouched.

GITHUB UPLOAD (EASIEST)
1. First keep a copy of your old index.html.
2. Replace only root /index.html in GitHub repository Railsignal.github.io.
3. Existing assets/hmis-header-rail.webp, assets/hmis-signal.webp,
   assets/hmis-tracks.webp do not need re-upload.
4. Clear Chrome cache / hard refresh before comparing.
5. Test an actual tablet and desktop login after publishing. These are layout tests,
   not live Firebase account sign-in tests.

COMPLETE PACKAGE
The assets/ folder is included for convenience if you are restoring/redeploying
from scratch. Do not delete any other assets, PDFs, JS or data in your repo.

NOTE
A 'fit to window' browser DevTools screenshot may scale down the tablet preview;
judge legibility at 100% on the actual tablet device.
