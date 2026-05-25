# ExecPlan: ATS Paste Doctor common Pro integration

## Scope
- Target: `tools/ats-paste-doctor/` only.
- Allowed files to touch:
  - `tools/ats-paste-doctor/index.html`
  - `tools/ats-paste-doctor/style.css`
  - `tools/ats-paste-doctor/app.js`
  - `tools/ats-paste-doctor/pro-bridge.js` (new)
  - remove obsolete `tools/ats-paste-doctor/public-fix.js` and `tools/ats-paste-doctor/app-final.js` if they are only late overrides
  - `tools/ats-paste-doctor/README.md` and stale docs under `tools/ats-paste-doctor/docs/` only where needed to remove old Pro unlock instructions
- Do not modify `common-spec/`, `_archive/`, deployment settings, or other tools.

## Goals
- Integrate ATS Paste Doctor with the shared NicheWorks Pro client only.
- Remove old individual Pro/payment/manual unlock placeholders and stale JS roles.
- Preserve all free ATS cleaning, counting, checking, copy, TXT save, FAQ, and JA/EN UI behavior.
- Add clear Preview vs Pro-unlocked UI and operations.

## High-level steps
1. Inspect existing ATS Paste Doctor HTML/CSS/JS and identify old Pro/payment remnants.
2. Refactor `index.html` to load `/assets/nw-pro.js`, `app.js`, and new `pro-bridge.js` only; add common Pro attributes and FAQ purchase explanation.
3. Refactor `app.js` so it owns free processing and Pro operation execution but not entitlement detection.
4. Add `pro-bridge.js` to read `NWPro.getLocalStatus()`, set `data-pro-active`, update common Pro UI attributes, and keep free functionality available on errors.
5. Update `style.css` for Preview/Pro visibility and ad hiding when Pro is active.
6. Run targeted searches and browser-free/static checks.

## Manual verification for user
- Open `tools/ats-paste-doctor/index.html` in a browser.
- Confirm free cleaning/copy/TXT works while Pro status is Preview or Unknown.
- Confirm Buy Pro links point to the shared Stripe Payment Link.
- Simulate Pro by setting `localStorage.setItem("nicheworks:pro", "true")` and `localStorage.setItem("nicheworks:pro:entitlement", "nicheworks_pro")`, then reload and verify Pro-only controls display and ads hide.
