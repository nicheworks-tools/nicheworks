# Phone QuickCheck maintenance wave 9 — 2026-10-31

## Scope
- tools/phone-quickcheck/ only, with the two tool-specific data/completion validators under scripts/.
- One Japan-market Motorola model addition; no cross-tool UI, common spec, or deployment changes.

## Evidence
- Official Japanese specification and in-box contents: https://store.motorola.co.jp/item/EDGE70FUSION.html
- Japan launch notice: https://store.motorola.co.jp/topics_list.html
- Conflicting marketing summary and specification table resolved in favor of the explicit technical table, corroborated by Motorola Japan launch release.

## Changes
1. Add motorola edge 70 fusion with primary-sourced physical, water, charging, battery, package, and provenance fields.
2. Update dataset updatedAt and displayed/contract model counts 204 → 205.
3. Record Wave 9 in COMPLETION_AUDIT.md without altering the V1 closure baseline.

## Validation
- Check JSON parses, 205 distinct IDs, 9 manufacturers, 36 foldables.
- Run scripts/check-phone-quickcheck-data.mjs.
- Run scripts/check-phone-quickcheck-completion.mjs.
- Run scripts/check-phone-quickcheck-source-semantics.mjs.
- Run tools/phone-quickcheck/tests/behavior.test.mjs and affiliate/responsive checks as configured.
- After CI, manually inspect 320/390px sheet and 1280px desktop for new model, JP/EN, provenance and accessories.

## Guardrails
- Do not infer wireless or PPS support from silence.
- Do not alter shared styling, advertising, analytics, affiliate routing, or the source contract.
