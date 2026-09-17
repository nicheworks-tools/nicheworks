# Old Kanji Completion Wave 10 — dictionary/data/documentation finalization

## Baseline
- Start from current main `c979c8a06a2a6491d66a0647533cb572a183602d`.
- Scope is limited to the Old Kanji dictionary audit/data-governance layer and the Old Kanji cluster/reference contracts.
- Do not change unrelated tools, billing, affiliate behavior, or publish additional per-kanji pages.

## Objective
Make the dictionary audit self-consistent after PR8 and make every remaining anomaly class explicit rather than leaving stale or unexplained counts.

## Work
1. Make the audit generator consume `dictionary-repair-evidence.json` as repository-held authoritative evidence for records already verified in PR8.
2. Add machine-readable maintenance dispositions for:
   - raw duplicate keys;
   - metadata overlay duplicates;
   - reverse-only issues;
   - unresolved records.
3. Regenerate `dictionary-audit.json` from the updated generator and require `--check` stability.
4. Rewrite `DICTIONARY_AUDIT.md` from the regenerated current snapshot.
5. Update `OLD_KANJI_CLUSTER.md` and Old Kanji Reference `SPEC.md` to describe the existing evidence-gated individual-page allowlist (currently three pages) rather than saying such URLs are not part of the current contract.
6. Update `OLD_KANJI_COMPLETION_AUDIT.md` with Wave 10 closure evidence.

## Guardrails
- Authoritative repair evidence may classify a relation only when its `afterTarget` still matches the current forward mapping.
- A verified relation does not automatically become an SEO candidate; the existing standalone-data gate remains required.
- Remaining unresolved mappings are deferred, not guessed.
- Reverse-only candidates are not deleted in this wave because Modern→Old runtime behavior must be exercised in Completion Wave 11 before candidate-table cleanup.
- Metadata overlays are recorded as deferred field-level review, not silently normalized.

## Validation
- Run `node scripts/build-old-kanji-dictionary-audit.mjs` and `node scripts/build-old-kanji-dictionary-audit.mjs --check` in CI/workflow context.
- Standard repository CI remains green.
- Final diff contains only Old Kanji Wave 10 plan/audit/contract files and the audit generator/artifact.
- Re-read latest main and mergeability immediately before squash merge.