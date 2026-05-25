# ExecPlan: Atlas UI overlap/donate/theme hotfix

## Scope
- tools/construction-tools-atlas/index.html
- tools/construction-tools-atlas/pages/*.html
- tools/construction-tools-atlas/howto/**/index.html
- tools/construction-tools-atlas/style.css
- tools/construction-tools-atlas/app.js
- tools/construction-tools-atlas/404.html (only if needed for theme consistency)

## Files to touch
- tools/construction-tools-atlas/style.css
- tools/construction-tools-atlas/app.js
- tools/construction-tools-atlas/index.html
- tools/construction-tools-atlas/pages/about.html
- tools/construction-tools-atlas/howto/index.html
- tools/construction-tools-atlas/howto/en/index.html

## Steps
1. Inspect current HTML/CSS/JS for sticky layout, theme handling, and donate links.
2. Implement sticky wrapper + padding/offset fixes in CSS and align HTML structure to prevent overlap.
3. Add fixed-position donate FAB with button styling for OFUSE/Ko-fi and ensure visibility at 360x740.
4. Centralize theme initialization in app.js and ensure all pages load it without title flicker.
5. Verify markup/CSS for light/dark variables across pages.

## Manual verification
- Open index.html: confirm sticky filter doesn’t overlap results in 1- and 2-column layouts; donate FAB visible; theme toggle persists after reload.
- Open pages/about.html: confirm dark mode persists from index and sticky gaps are opaque.
- Open howto/index.html and howto/en/index.html: confirm theme persists and layout unaffected.
