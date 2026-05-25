# Logistics Compliance Kit JP common Pro integration

## Scope
- Target only `tools/logistics-compliance-kit-jp/` plus this plan file.
- Do not edit shared specs, archived files, deployment, CI, or unrelated tools.

## Files to inspect/touch
- Inspect: `tools/logistics-compliance-kit-jp/index.html`, `app.js`, `style.css`, related static pages if needed for residue checks.
- Touch as needed: `tools/logistics-compliance-kit-jp/index.html`, `tools/logistics-compliance-kit-jp/app.js`, `tools/logistics-compliance-kit-jp/style.css`, optional new `tools/logistics-compliance-kit-jp/pro-bridge.js`.

## Steps
1. Inspect current Pro/payment/localStorage behavior and free feature wiring.
2. Add the shared `/assets/nw-pro.js` client and a scoped bridge that reads `NWPro.getLocalStatus()`, sets `documentElement.dataset.proActive`, updates `data-pro-*` UI, and points `data-pro-buy` to the common Payment Link.
3. Replace legacy individual Pro/manual unlock/payment placeholders with shared Pro preview/locked/free behavior while preserving free checks, Markdown preview, FAQ, links, and current tool logic.
4. Ensure Pro-only copy/export/save buttons are disabled when inactive and active when common Pro is active.
5. Run syntax/residue checks and manual DOM/static checks; report results.

## Manual verification for user
- Open `/tools/logistics-compliance-kit-jp/` with no common Pro local status: free form works, preview visible, Pro buttons locked, Buy Pro opens common Payment Link.
- Set common Pro active through the shared unlock flow, reload: status says Pro unlocked, Pro-only blocks/buttons are enabled, Markdown/JSON/handoff exports and copy actions work.
