# ExecPlan: Motion Atlas common Pro integration

## Scope
- Primary target: `tools/motion-atlas/` only.
- Pages: `tools/motion-atlas/index.html`, `tools/motion-atlas/ja/index.html`, `tools/motion-atlas/pro/index.html`, `tools/motion-atlas/ja/pro/index.html`.
- Runtime: `tools/motion-atlas/app.js`, `tools/motion-atlas/styles.css`, new/updated `tools/motion-atlas/pro-bridge.js`.
- Optional shared file: `pro/unlock/index.html` only if a minimal Motion Atlas return link is needed.
- Explicitly out of scope: UI Atlas, Vibe Lexicon, AI Interaction Atlas, Accessibility Atlas, deployment/CI, common spec files, archive files.

## Files to touch
- `tools/motion-atlas/index.html`
- `tools/motion-atlas/ja/index.html`
- `tools/motion-atlas/pro/index.html`
- `tools/motion-atlas/ja/pro/index.html`
- `tools/motion-atlas/app.js`
- `tools/motion-atlas/styles.css`
- `tools/motion-atlas/pro-bridge.js`

## High-level steps
1. Inspect existing Motion Atlas free and Pro behavior, current Pro remnants, and common `assets/nw-pro.js` API assumptions.
2. Add `/assets/nw-pro.js` and Motion Atlas `pro-bridge.js` to EN/JA tool and Pro pages.
3. Implement bridge logic that reads `NWPro.getLocalStatus()`, sets `data-pro-active`, updates `data-pro-status`, toggles `data-pro-preview` / `data-pro-only`, and points `data-pro-buy` to the common Payment Link.
4. Preserve free dictionary, demos, detail, favorites/recent, reduced motion, basic prompt copy, and free 2-item compare.
5. Extend `app.js` so compare limit becomes 4 only when common Pro is active; expose `window.NWMotionAtlas` handoff/export/prompt methods; lock Pro-only actions in Preview mode and enable copy/export in Active mode.
6. Rewrite Motion Atlas Pro pages to explain free capabilities, Pro outputs, Preview/Active states, purchase flow, limitations, and common Pro infrastructure.
7. Add focused CSS for Pro status cards, preview/active sections, locked actions, and export panels without changing unrelated tools.
8. Run syntax checks, residue searches, and scoped git diff/status checks.

## Manual verification for user
- Free/private browser: open `/tools/motion-atlas/` and `/tools/motion-atlas/ja/`; confirm Preview mode status, free search/demo/replay/pause/speed/reduced-motion/basic-copy/2-item compare, locked Pro copy/export, and common Payment Link CTA.
- Pro-active browser after `/pro/unlock/?session_id=...`: confirm `NWPro.getLocalStatus().active === true`, Pro unlocked status, `data-pro-only` content, 4-item compare, Pro copy actions, Markdown export, and JSON export.
- Pro pages: open EN/JA Pro pages and confirm purchase CTA, purchase flow, common Pro explanation, and no legacy placeholder/coming-soon/manual-unlock wording.
