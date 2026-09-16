# ExecPlan — Old Kanji PR8 verified dictionary inconsistency repair

## 1. Goal

Repair only Old Kanji dictionary inconsistencies that can be verified record-by-record from primary or authoritative character sources.

PR7 established the repository-only audit boundary and identified 17 canonical records with data-quality issues plus 53 reverse-table issues. PR8 must not infer intended mappings from model knowledge, JSON last-write behavior, Unicode normalization alone, or bulk conversion libraries. A dictionary change is allowed only when the relationship and intended canonical contract are supported by authoritative evidence.

Individual-kanji SEO generation is explicitly deferred. `identity` and `unresolved` records remain blocked from individual SEO publication.

## 2. Baseline

Branch created from current `main` at:

`4593b59cb9062691bab8fea86a182c28d5694c03`

This SHA is a starting baseline only. Before PR merge, refresh current `main`, re-check changed-file scope, mergeability, and CI because the repository has substantial parallel work.

PR7 audit artifact on this baseline reports:

- canonical `old_to_new`: 358 records
- raw `old_to_new`: 367 entries
- old_to_modern: 153
- variant: 1
- compatibility: 21
- identity: 115
- unresolved: 68
- raw duplicate keys: 9
- conflicting raw duplicate keys: 1
- metadata duplicate keys: 61
- reverse issues: 53
- canonical issue records: 17
- repository-supported SEO candidates: 158, still gated on actual search demand

## 3. Scope

In scope:

- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/meta.json`
- `tools/old-kanji-reference/meta-extra-2.json`
- `tools/old-kanji-reference/meta-extra-3.json`
- `tools/old-kanji-reference/meta-extra-4.json`
- `tools/old-kanji-reference/meta-extra-5.json`
- `tools/old-kanji-reference/meta-extra-6.json`
- `tools/old-kanji-reference/compatibility-notes.json`
- `tools/old-kanji-reference/dictionary-audit.json`
- `scripts/build-old-kanji-dictionary-audit.mjs` only if a verified data shape exposes an audit-contract defect
- evidence/provenance documentation directly required to preserve record-level repair rationale
- runtime/check files only when required to keep all eight Old Kanji tools consistent with repaired shared data

Old Kanji runtime impact must be checked for:

1. Old Kanji Reference
2. Kanji Modernizer
3. Old Kanji OCR Scanner
4. Old Document Kanji Highlighter
5. Unicode Kanji Checker
6. Variant Kanji Compare
7. Place Old Kanji Checker
8. Name Old Kanji Checker

Explicitly out of scope:

- ManualFinder
- Amazon affiliate work
- Stripe / billing connection or Pro implementation
- site-wide / all-tool improvement work
- Construction Atlas
- Phone QuickCheck and other parallel tool families
- mass individual-kanji SEO page generation
- GSC-based SEO publication selection in this PR

## 4. Non-negotiable Rules

- Do not decide an old/new/variant relationship from model knowledge alone.
- Do not use NFKC output alone as proof of Japanese old/new-form equivalence.
- Do not apply a bulk normalization or replacement library to the dictionary.
- Do not delete the 115 identity mappings as a batch.
- Do not delete or rewrite the 53 reverse issues as a batch.
- Do not merge the 61 metadata duplicate keys as a batch.
- Do not treat a duplicate JSON key's parse-last value as authoritative.
- Do not publish `identity` or `unresolved` records as individual SEO pages.
- Preserve a record-level evidence trail for every data repair.
- Prefer Unicode Consortium / UCD / Unihan for code-point and compatibility relationships; Culture Agency, Ministry of Justice family-register character resources, MJ/character-information infrastructure, and JIS/public character material for Japanese glyph/old-form relationships.
- Wikipedia or general web pages may help discovery but cannot be the sole repair authority.
- If one source character legitimately maps to multiple modern targets under different semantics or standards, stop data editing for that record and define the schema requirement before changing the canonical mapping.

## 5. Initial 17 Issue Records

The current PR7 audit identifies these canonical issue records for first-pass verification:

| source | current canonical target | current audit issue(s) | PR8 verification question |
|---|---|---|---|
| 藝 | 芸 | reverse target mismatch | Is `藝 -> 芸` the verified Japanese old/new-form relation, and should the reverse self-entry be removed? |
| 據 | 据 | reverse target mismatch; conflicting raw duplicate key; metadata modern mismatch | Which target is authoritative (`拠`, `据`, or a schema requiring more than one relation)? |
| 淚 | 涙 | reverse mapping missing; reverse target mismatch | Confirm `淚 -> 涙` and correct the reverse table only if authoritative evidence supports it. |
| 獨 | 獨 | metadata modern mismatch | Confirm whether the canonical forward mapping itself is wrong and whether `獨 -> 独` is the proper Japanese old/new-form relation. |
| 髓 | 髄 | reverse mapping missing | Confirm relation before adding reverse coverage. |
| 虜 | 虜 | reverse mapping missing; reverse target mismatch | Confirm the Unicode compatibility decomposition / Japanese relation and remove the current `魯` reverse association only if verified. |
| 躰 | 体 | reverse mapping missing | Determine whether this is an old form, variant, or another relation and repair only to the supported contract. |
| 邨 | 村 | reverse mapping missing | Determine whether this is an old form, variant, or another relation and repair only to the supported contract. |
| 霸 | 覇 | reverse mapping missing | Confirm relation before adding reverse coverage. |
| 雜 | 雑 | reverse mapping missing | Confirm relation before adding reverse coverage. |
| 頰 | 頬 | reverse mapping missing | Verify carefully against current Japanese standard character treatment; do not assume this is a simple old/new pair. |
| 顏 | 顔 | reverse mapping missing | Confirm relation before adding reverse coverage. |
| 顯 | 顕 | reverse mapping missing | Confirm relation before adding reverse coverage. |
| 驪 | 麗 | reverse mapping missing | Verify semantics/code-point relation before any reverse addition; if no authoritative variant/old-new relation exists, repair the forward record instead. |
| 齋 | 斎 | reverse mapping missing | Confirm relation and name-glyph implications before adding reverse coverage. |
| 齡 | 齢 | reverse mapping missing | Confirm relation before adding reverse coverage. |
| 齒 | 歯 | reverse mapping missing | Confirm relation before adding reverse coverage. |

The table is a verification queue, not a statement that all current mappings are correct.

## 6. Secondary Reverse-Issue Triage

After the 17 canonical issue records are resolved, triage reverse-only / reverse-source-missing-forward items by risk rather than bulk editing.

Priority order:

1. obvious destructive or semantically suspicious reverse associations;
2. compatibility ideographs whose Unicode decomposition can be authoritatively checked;
3. reverse entries that imply a missing forward variant relationship;
4. identity-like reverse entries;
5. low-risk residual inconsistencies.

Examples already isolated by PR7 include `鄉 -> 郷`, `聯 -> 連`, `踐 -> 践`, `醬 -> 醤`, `銳 -> 鋭`, and compatibility-glyph entries. Each must be independently verified before a change.

## 7. Evidence Record Contract

For each repaired record, preserve at minimum:

- source character and code point;
- prior forward/reverse state;
- authoritative source name;
- authoritative source URL or stable identifier;
- what that source actually establishes (old/new form, compatibility decomposition, variant, name glyph, etc.);
- repair action;
- reason the action matches the repository's canonical contract;
- any unresolved ambiguity.

Where practical, keep this provenance in a repository document or structured data adjacent to the dictionary audit rather than only in the PR description.

## 8. Step-by-step Procedure

1. Verify the current branch still descends from the captured latest-main baseline.
2. Re-read `dictionary-audit.json` and preserve the exact pre-repair summary.
3. Verify each of the 17 issue records against authoritative external sources.
4. For ambiguous records, leave data unchanged and record the unresolved finding unless the schema must change first.
5. Apply only the smallest supported changes to `dict.json`, metadata, and compatibility data.
6. Triage high-risk reverse-only anomalies and repair only independently verified cases that are safe to include in PR8.
7. Regenerate `dictionary-audit.json` with the existing builder.
8. Confirm issue counts decrease for legitimate reasons and that no new data-quality conflicts are introduced.
9. Check behavior/contract impact across all eight Old Kanji tools.
10. Run existing Old Kanji/runtime/SEO/repository checks without weakening them.
11. Compare the branch against current `main` and confirm no out-of-scope files changed.
12. Open PR titled `Old Kanji PR8: repair verified dictionary inconsistencies`.
13. Inspect CI and PR mergeability; do not merge with known failing checks.
14. Re-check `main` advancement immediately before merge.
15. Squash merge only when the evidence ledger, diff, CI, and mergeability are all clean.

## 9. Test / Acceptance Plan

Acceptance requires all of the following:

- every modified character relationship has authoritative record-level evidence;
- the `據` conflicting duplicate is no longer silently resolved by JSON last-write behavior;
- no repaired reverse mapping contradicts its forward mapping;
- no known destructive compatibility association remains merely because NFKC or a prior reverse table happened to contain it;
- `identity` records are not newly required to self-reference in `new_to_old`;
- unresolved ambiguity remains explicitly unresolved rather than guessed;
- the audit artifact is regenerated and deterministic;
- issue counts and reverse-issue counts are explained by the actual diff, not merely reduced numerically;
- all eight Old Kanji tools retain expected behavior for unaffected records;
- no individual-kanji SEO pages are introduced;
- no ManualFinder or unrelated tool files are changed;
- existing CI remains enabled and green.

## 10. Rollback Plan

PR8 must remain a single squash-revertable logical change. If a later authoritative source invalidates a repair, revert the affected record using the preserved evidence trail or revert the PR squash commit as a whole. Do not require migrations, external state changes, billing changes, or SEO-page cleanup for rollback.
