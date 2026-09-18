# Completion Wave 16 — Old Kanji search-cluster final reconciliation

Date: 2026-09-18

## Scope

Reconcile the eight Old Kanji landing pages against `tools/OLD_KANJI_CLUSTER.md` without creating new search intent or expanding the indexable inventory.

## Work

- Preserve already-correct task-specific titles, H1s, descriptions, canonicals, WebApplication schema, and bounded internal handoffs.
- Synchronize the seven non-Reference `SPEC.md` files with their existing cluster search roles and query families.
- Remove the OCR Scanner's stale pre-live SERP/schema/UI copy that still described OCR as an initial preparation screen even though OCR is active.
- Add a durable eight-tool search-cluster checker for title/H1/description/canonical/schema/spec-role drift and anti-cannibalization.
- Do not add individual-kanji pages or change the three-page allowlist.

## Exit condition

Existing SEO/runtime/spec CI and the new search-cluster checker must be green. Completion Audit may mark C-03/Wave 16 closed only after that evidence exists.
