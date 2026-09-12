# ExecPlan — Size Converter Amazon-ready conversion workflow

## Scope

Only:

- `.agent/plans/2026-09-13-size-converter-amazon-ready.md`
- `tools/size-converter/index.html`
- `tools/size-converter/style.css`
- `tools/size-converter/app.js`
- `tools/size-converter/app-complete.js` (remove after canonicalizing `app.js`)
- `tools/size-converter/affiliate-config.js`
- `tools/size-converter/SPEC.md`

The shared Amazon helper from PR #600 is reused. Manual Finder and unrelated tools are out of scope.

## Goal

Make Size Converter useful for the actual search intent "convert one size now" while preserving the detailed table and measurement-fit utilities. Wire it to the disabled-by-default Amazon affiliate foundation so activation later requires only real target URLs plus `enabled: true`.

## Changes

1. Make direct one-size conversion the primary workflow.
2. Expand representative shoe ranges so common smaller/larger queries such as US 4 can be answered instead of falling outside the table.
3. Keep JP/US/EU scope for this PR; UK/kids remain follow-up work.
4. Keep detailed table and measurement fit as secondary sections.
5. Remove the disabled/unverified brand adjustment UI from the active workflow.
6. Canonicalize runtime JavaScript to `app.js` and remove redundant `app-complete.js`.
7. Add `affiliate-config.js` with Amazon disabled and empty targets.
8. Load `/assets/amazon-affiliate.js`; mount contextual `shoes` or `clothing` CTA only if configuration becomes valid and enabled.
9. Never pass size, measurement, gender, or other user state to affiliate analytics.
10. Update the tool specification to the new runtime contract.

## Verification

- Quick conversion works for shoes and clothing, men and women, JP/US/EU base systems.
- US women's size 4 has a representative conversion result.
- Detailed table reflects the same bundled data as quick conversion.
- Shoe fit and clothing fit still work locally.
- No brand dropdown or numerical brand correction remains in the active UI.
- With default affiliate config, no Amazon CTA or disclosure is visible.
- With a valid enabled configuration, only the coarse target (`shoes` or `clothing`) is sent to the shared affiliate helper.
- GA4/AdSense/head metadata from the existing page remain present.

## Non-goals

- No live Amazon Associate link is committed.
- No Amazon price, rating, inventory, or product image is displayed.
- No UK/kids/brand-specific official chart dataset is introduced in this PR.
