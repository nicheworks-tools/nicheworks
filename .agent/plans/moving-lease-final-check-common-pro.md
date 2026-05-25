# ExecPlan: Moving / Lease Final Check Common Pro Integration

## Scope
- Target only: `tools/moving-lease-final-check/`
- Do not touch `apps/`, `_archive/`, `common-spec/`, deployment settings, or unrelated tools.

## Files to touch
- `tools/moving-lease-final-check/index.html`
- `tools/moving-lease-final-check/app.js`
- `tools/moving-lease-final-check/pro-bridge.js` (new)
- `tools/moving-lease-final-check/style.css`

## High-level steps
1. Inspect current tool behavior and remove old per-tool Pro remnants from app code.
2. Add common Pro scripts and HTML attributes/sections to the tool page.
3. Implement `pro-bridge.js` to read `NWPro.getLocalStatus()`, update `data-pro-active`, `data-pro-status`, `data-pro-preview`, `data-pro-only`, and common buy links.
4. Update `app.js` so free checklist/copy/save/print behavior stays available, while Pro pack actions are gated by the common Pro active state.
5. Add Pro card/preview/unlocked styling and print layout CSS.
6. Run searches for forbidden remnants and syntax checks.

## Manual verification for user
- Open `/tools/moving-lease-final-check/` with no Pro entitlement and confirm the free checklist, basic TXT copy/save, browser print, preview card, and common Buy Pro link work.
- After completing common Pro unlock at `/pro/unlock/?session_id=...`, revisit this tool and confirm Pro-only buttons and Pro pack output are enabled.
- Confirm Pro output remains an organizing/checklist pack and does not claim to judge lease costs, restoration duties, deposits, repair fees, or legal outcomes.
