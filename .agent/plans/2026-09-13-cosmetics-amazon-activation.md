# Cosmetics Amazon activation

## Goal
Activate the already-frozen Amazon affiliate insertion points for Cosmetic Ingredient Checker Lite and INCI FastScan using the verified NicheWorks Amazon Associates Special Link supplied on 2026-09-13.

## Scope
- Current `main` only.
- No parser, dictionary, OCR, matching, or result-semantics changes.
- Keep stable slot IDs and placements: Lite `after-summary`, FastScan `after-results`.
- Use `https://amzn.to/4xNbcDO` as a verified Amazon search handoff for generic skincare.
- Treat the destination as a Special Link. Do not invent a separate Associate tag.
- Render neutral commercial copy only: `Amazonでスキンケアを探す [PR]` / `Find skincare on Amazon [PR]`.
- Render the required Amazon Associates disclosure whenever the slot is active.
- Keep analytics coarse: `tool`, `provider`, `placement`, `link_key` only.
- Never send ingredient input, OCR text/images, filenames, matched ingredients, unknown names, filters, or analysis output through affiliate analytics.

## Acceptance
- Affiliate config is explicitly active in `special_link` mode.
- Both tools render the same verified Special Link in their pre-existing slots.
- Amazon URL validation is fail-closed to HTTPS `amzn.to` / `amazon.co.jp` hosts.
- Existing cosmetics quality gates still pass.
- Affiliate contract checker is updated from pre-activation assertions to the live Special Link contract.
- No unrelated files change.
