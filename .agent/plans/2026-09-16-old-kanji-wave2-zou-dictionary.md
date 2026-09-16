# Old Kanji Wave 2 — demand-exposed 贈 / 贈 dictionary repair

## Goal
Repair exactly one dictionary omission exposed by authenticated Search Console demand: add the compatibility old-form relationship `贈 → 贈` before any Wave 2 individual SEO page is published.

## Demand evidence
Source: authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-16 with finalized results.

- `贈 旧字`: 1 impression in the 2026-03-18 through 2026-09-13 extraction, average position 20.
- The same query has 1 impression in the most recent finalized 30-day window (2026-08-15 through 2026-09-13), average position 20.
- Other demand-exposed candidates such as `臨`, `魂`, `霧`, `倉`, `輝`, and `鯨` are not converted into individual old/new pages merely because the query exists; current repository data treats them as identity mappings or otherwise does not establish an old/new relation suitable for publication.
- `御` is not treated as `禦`'s simple old/new pair for SEO because authoritative references describe a write-replacement relationship, not a blanket old-form identity.

## Authoritative evidence
This repair requires both external authority and repository consistency.

1. Agency for Cultural Affairs (文化庁), 常用漢字表 / 音訓索引: lists `贈（贈）`, establishing the historical/parenthesized form associated with current `贈`.
   - https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/index.html
2. Unicode NamesList: U+FA65 CJK COMPATIBILITY IDEOGRAPH-FA65 has compatibility equivalence to U+8D08 `贈`.
   - https://www.unicode.org/charts/nameslist/n_FA00.html

No model-knowledge-only mapping decision is permitted.

## Scope
Change only the Old Kanji shared dictionary/data layer and audit artifacts needed for this one repair:

1. `tools/kanji-modernizer/dict.json`
   - retain the existing identity record `贈 → 贈` if present;
   - add `贈 → 贈` to `old_to_new`;
   - add `贈` under reverse `贈` conversion candidates, without adding a redundant self reverse.
2. `tools/old-kanji-reference/meta-extra-2.json`
   - add verified metadata for `贈 → 贈`, with restrained reading/meaning and an explicit old/new-form source note.
3. `tools/old-kanji-reference/compatibility-notes.json`
   - add a compatibility-ideograph warning for U+FA65 / `贈`.
4. `tools/old-kanji-reference/dictionary-audit.json`
   - regenerate using the existing audit builder; do not weaken its rules.
5. `tools/old-kanji-reference/dictionary-demand-repair-evidence.json`
   - record GSC demand plus the Culture Agency and Unicode evidence for this repair.

No individual SEO page is created in this PR. No generator, no bulk normalization, no unrelated mapping changes.

## Expected audit effect
Starting from the post-PR8 audit:

- canonical mappings: 356 → 357
- raw forward entries: 364 → 365
- compatibility class: 22 → 23
- issue records: remain 0
- conflicting raw duplicate keys: remain 0
- reverse issues: must not increase from 35
- SEO candidates: expected 168 → 169 if the verified metadata and standalone signals satisfy the existing gate

Treat these as assertions to validate, not numbers to force by changing the audit logic.

## Stop conditions
- Stop rather than publish if the authoritative relation cannot be reproduced.
- Stop if adding `贈` introduces an audit issue, reverse mismatch, or conflicting duplicate.
- Do not change audit classification rules to make the new record pass.
- Do not turn identity/unresolved mappings into SEO candidates.
- Keep unrelated tools and parallel work untouched.

## Validation
- Run `node scripts/build-old-kanji-dictionary-audit.mjs`.
- Run `node scripts/build-old-kanji-dictionary-audit.mjs --check`.
- Confirm `贈` targets `贈`, classification is `compatibility`, issues are empty, and `seoCandidate=true`.
- Confirm issueRecords=0 and conflictingRawDuplicateKeys=0.
- Run repository CI without weakening or bypassing checks.
- Re-read latest `main` and confirm PR mergeability immediately before merge.
- Squash merge only after required checks pass.