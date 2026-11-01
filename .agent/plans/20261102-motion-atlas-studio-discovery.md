# ExecPlan — Motion Atlas free → Studio preview discovery (2026-11-02)

## Objective
Make the separate Motion Atlas Studio interactive preview discoverable from the already published free Motion Atlas EN/JA pages. User traffic cannot convert to Studio if there is no navigation path. Preserve all free catalog, demos, four-way comparison and free exports.

## Scope
- `tools/motion-atlas/index.html`
- `tools/motion-atlas/ja/index.html`
- `tools/motion-atlas/styles.css`
- `tools/motion-atlas/tests/behavior.test.mjs`
- `.agent/plans/20261102-motion-atlas-studio-discovery.md` (this plan)

Do not modify Studio Stripe product, price, checkout flags, server entitlement, analytics, shared specifications, or other tools.

## Requirements
1. A brief clearly labelled Studio **preview** link appears adjacent to the free Motion Atlas introduction, with EN/JA language matched destination.
2. Free vs Studio distinction is explicit: existing catalog/compare/prompts/exports remain free, Studio composes and previews multi-track animations; paid code bundle is not on sale.
3. Same-origin relative links to `studio/` and `../ja/studio/` only; no Stripe link or paid unlock assertion.
4. Desktop and 360–390px mobile layouts stay readable with no horizontal overflow; no new dependency.
5. Add static regression assertions and let existing CI/browser smoke run on PR and main. Test by opening free and Studio pages where available.
6. Do not set a price or activate billing without the user's instruction.

## Completion criteria
Static and browser checks pass in both languages, link destinations correct, all 42 free motions preserved, Cloudflare deploy succeeds. Any remaining unsupported claims are reported as unverified.
