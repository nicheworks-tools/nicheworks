# ExecPlan: Motion Atlas Studio (separate paid creation workflow)

## Scope
- `tools/motion-atlas/studio/` EN/JA pages, first-party CSS and JS
- `functions/api/motion-atlas/studio-export.js` and `studio-core.js` server-side paid code export
- `tools/motion-atlas/tests/studio-contract.test.mjs`, `tools/motion-atlas/tests/studio-browser.test.mjs`, existing `behavior.test.mjs` test entry point
- `.github/workflows/motion-atlas-studio-qa.yml`
- `.agent/plans/20261101-motion-atlas-studio-v1.md`
- No changes to existing free Motion Atlas content, free four-way compare, billing product registry, shared CSS or other tools.

## Goal
Ship a functional MVP of the separately priced Motion Atlas Studio while retaining all existing free features. Preview editor: add/remove/edit timeline tracks, choose from explicitly supported effects, modify delay/duration/easing, preview using Web Animations API, save/load/rename/delete local presets, and show total duration. Paid differentiator: batch implementation code export from server, not embedded in the client.

## Price and entitlement
The user has not finalized a price or activated Stripe for Studio. Therefore this implementation MUST remain **draft** and must not open checkout, describe a price as approved, or claim paid access is already on sale. The server export accepts a valid configured product-specific paid entitlement only, verified with the existing D1 storage function; no localStorage-only grant, URL query grant or payment-link impersonation. Production fails closed without a real paid record. The editor is an interactive preview and may be publicly visible only after explicit release approval.

## Steps
1. Inspect existing Motion Atlas and shared D1 entitlement interfaces.
2. Build local preview editor, full Japanese and English UI with distinct route, no added dependencies. Only support effects with implemented keyframes. Presets remain browser-local.
3. Build pure server-side generator for two artifacts (CSS and React module) and strict input validation; respect prefers-reduced-motion.
4. Add gated Cloudflare Pages Function that validates a private Stripe checkout session against D1 for product `motion_atlas.studio_v1`, required `motionAtlas.studioExport` feature, with generic failures and no caching.
5. Add Node tests for timeline parsing, malicious payload rejection, output generation, entitlement allow/deny, static client contract and a dedicated Chrome DevTools Protocol UI test at exact 390px and desktop in EN/JA. Update existing behavior test entrypoint to discover the separate Studio test.
6. Open Draft PR and run CI. Do not merge or sell until payment product/price, webhook, D1, checkout and human QA are confirmed.

## Manual QA
390px mobile/1280px desktop, light/dark if supported, JA/EN, keyboard, add/remove track, overlap, preset import/export? (not included; local only), reduced-motion static state, fake entitlement rejection, valid D1 fake entitlement success, no secret material in browser. Validate existing free Atlas unchanged.

## Implementation verification (2026-11-01)
- PR #1527 draft includes actual independent editor routes, paid server-only code generator, browser-local preset storage and D1 entitlement gate.
- Dedicated Chrome Studio QA on commit `c0507e1` passed: EN+JA 390px & 1280px; normal and reduced motion, timeline edits, presets, generated preview, no entitlement bypass.
- Contract tests passed: two-track generator, CSS/React bundle, invalid effects/timing, D1 valid/invalid/revoked/no-feature/no-binding and origin checks.
- Existing free Motion Atlas runtime and public page are unchanged.
- No selling or main merge until price, product config/Stripe, real D1 webhook and human release QA are confirmed. Runtime source is only in PR branch at this stage.
