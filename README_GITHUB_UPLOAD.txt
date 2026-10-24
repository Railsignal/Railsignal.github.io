RailSNTGyan — Refined HMIS Login (24 October 2026)

WHAT CHANGED
- Removed LOGIN-page-only Home/About/Important Links/Help/Login navbar.
- Desktop: compact centered Welcome Back sign-in card (maximum 460px wide).
- Mobile: taller railway image with lower red LED ON; compact form directly underneath.
- Tablet portrait/landscape: responsive, content-sized card and better proportions.
- Typical screen sizes: no login page scroll, with login button accessible.
- Kept existing RailSNTGyan SVG logo, Firebase login field IDs, authentication functions, admin/user management and logged-in website unchanged.

GITHUB UPLOAD — https://github.com/Railsignal/Railsignal.github.io
1) First keep a backup of your existing index.html.
2) Replace ROOT index.html with this index.html.
3) Ensure assets/hmis-header-rail.webp, assets/hmis-signal.webp, assets/hmis-tracks.webp exist in /assets/ (upload these only if missing).
4) DO NOT delete existing background images, other assets, Firestore, or Firebase files.
5) Reload https://railsignal.github.io with Ctrl+Shift+R or open in a private window after GitHub Pages deployment.

NOTE
- Visual layout screenshots were tested locally on 10 viewports using static CSS rendering.
- LIVE Firebase sign-in and Cloudflare setup were NOT tested.
- Some very small viewport/keyboard-open scenarios may need internal scrolling so inputs remain accessible.
