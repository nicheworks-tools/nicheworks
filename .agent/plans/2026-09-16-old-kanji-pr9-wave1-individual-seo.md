# ExecPlan — Old Kanji PR9 individual-kanji SEO Wave 1

## 1. Goal

Publish a deliberately small first wave of indexable individual-kanji reference pages only where all three gates are satisfied:

1. actual Google Search Console demand exists;
2. the old/new-form relation is safe after the PR7/PR8 dictionary audit and is independently supported by an authoritative source;
3. the record has enough standalone information to avoid a bare mapping-only thin page.

Wave 1 is limited to two records: `画（畫）` and `将（將）`.

## 2. Baseline

Branch: `seo/old-kanji-pr9-wave1`

Branch baseline `main` SHA at creation:

`b33d70508d553927049359a04d2391d6a000c44a`

This SHA is only the implementation baseline. Re-read current `main`, changed-file scope, PR mergeability, and CI immediately before merge because unrelated work advances `main` frequently.

PR8 has already completed the verified dictionary repair and reports zero canonical issue records and zero conflicting raw duplicate keys. PR9 must not reopen that work unless a new authoritative contradiction is discovered.

## 3. Demand evidence

Search Console property: `sc-domain:nicheworks.app`

Settled query window checked: `2026-03-18` through `2026-09-13`.

Relevant observed queries include:

- `計画 旧字体`: 11 impressions, average position 9.09, landing on Old Kanji Reference.
- `将 旧字体`: 1 impression, average position 2.0, landing on Old Kanji Reference.

Other observed individual-character queries such as `臨 旧字体`, `霧 旧字体`, `魂 旧字体`, `鯨 旧字体`, `倉 旧字`, `贈 旧字`, and `輝 旧字` are not sufficient publication evidence because their current repository records are identity/reference records rather than safe old-to-modern substitutions. They remain blocked from individual-page publication.

## 4. Authoritative character evidence

Primary Japanese source:

- Agency for Cultural Affairs (文化庁), current 常用漢字表（平成22年内閣告示第2号）
- index: `https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/index.html`
- PDF: `https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf`

The table explicitly lists:

- `画（畫）`, readings `ガ・カク`, with example words including `計画`;
- `将（將）`, reading `ショウ`, with examples including `将来`, `将棋`, and `大将`.

Unicode evidence:

- `画`: U+753B
- `畫`: U+756B
- `将`: U+5C06
- `將`: U+5C07

Unicode/Unihan data also records the traditional-variant relationships for these code points. Japanese old/new-form wording on the public page remains grounded primarily in the Culture Agency source, not in Unicode normalization alone.

## 5. Repository data evidence

Existing verified metadata already provides standalone content:

- `將 -> 将`: reading, meaning, verified status and current metadata in `tools/old-kanji-reference/meta.json`.
- `畫 -> 画`: reading, meaning, usage, verified status and current metadata in `tools/old-kanji-reference/meta-extra-5.json`.

The shared dictionary contains both old-to-modern mappings. PR9 does not need to change dictionary data.

## 6. Scope

In scope:

- exactly two static individual-kanji pages under Old Kanji Reference;
- stable ASCII/code-point URLs:
  - `/tools/old-kanji-reference/kanji/u753b/` for `画（畫）`;
  - `/tools/old-kanji-reference/kanji/u5c06/` for `将（將）`;
- a small evidence ledger for Wave 1 demand/source/provenance;
- a small parent-page discovery section linking to only these two pages;
- Old Kanji Reference SPEC and cluster-contract updates reflecting the now-active limited Wave 1;
- sitemap inclusion if it can be changed safely without replacing or losing unrelated entries;
- tests/checks required to validate canonical/meta/indexability/internal links and prevent accidental expansion beyond the two approved records.

Explicitly out of scope:

- any identity or unresolved record;
- compatibility/variant-only candidates not separately approved;
- any third individual-kanji page;
- automatic page generation across the dictionary;
- ManualFinder;
- Amazon affiliate expansion;
- billing/Stripe/Pro implementation;
- unrelated tools, Construction Atlas, Phone QuickCheck, or all-site cleanup.

## 7. Page contract

Each Wave 1 page must provide more than a pair-only mapping. It must contain:

- direct answer above the fold;
- clear modern/old-form pair;
- supported reading;
- Unicode code points for both characters;
- at least one search-intent-relevant example (`計画 -> 計畫` or `将来 -> 將来`) framed as a character substitution example, not as a claim that the Culture Agency table literally prints the old-form word;
- source/caution text explaining that the Culture Agency table lists the pair in its parenthesized historical-form notation;
- direct links back to Old Kanji Reference and appropriate task tools such as Kanji Modernizer / Unicode Kanji Checker;
- self-canonical, `index,follow`, Open Graph/Twitter metadata and suitable structured data;
- no unsupported legal/name-authority claims;
- no Amazon block and no unfinished Pro sales UI.

## 8. Anti-thin / anti-programmatic guardrail

Wave 1 must remain hand-selected and exactly two records. The implementation must not introduce a generic route, loop, template generator, build step, manifest rule, or fallback capable of publishing all dictionary entries as indexable pages.

The evidence ledger is the allowlist. Future expansion requires a new settled GSC review plus record-level authority/standalone-value review.

## 9. Implementation procedure

1. Verify branch descends from the captured baseline.
2. Preserve the GSC and authoritative-source evidence in a Wave 1 ledger.
3. Add the two static pages only.
4. Add a minimal parent-page section linking to the two published pages without changing the existing four task-handoff links.
5. Update `tools/old-kanji-reference/SPEC.md` and `tools/OLD_KANJI_CLUSTER.md` from “not currently part of contract” to a two-page evidence-gated Wave 1 contract.
6. Add sitemap entries if safely possible with no unrelated sitemap loss.
7. Add/extend a focused validation check if existing SEO checks do not enforce Wave 1 allowlist/canonical/content requirements.
8. Run existing SEO/runtime/repository checks and any focused Wave 1 check without weakening them.
9. Compare branch against current `main`; confirm changed-file scope is limited to PR9.
10. Open PR `Old Kanji PR9: publish evidence-gated kanji SEO Wave 1`.
11. Inspect CI and mergeability; do not merge known failures.
12. Re-read latest `main` immediately before merge and re-check mergeability.
13. Squash merge only when clean.

## 10. Acceptance criteria

- exactly two individual-kanji URLs are introduced;
- both correspond to actual GSC queries and authoritative old/new-form evidence;
- neither is identity/unresolved;
- each page contains standalone information beyond the pair itself;
- direct answer, canonical, robots, title/description and source links are present;
- code points are correct and source-backed;
- parent Old Kanji Reference links to both pages while existing task handoffs remain intact;
- no generic mass-generation mechanism is introduced;
- no unrelated tool files are changed;
- existing CI remains enabled and green;
- current `main` and mergeability are rechecked before squash merge.

## 11. Rollback

PR9 must remain one squash-revertable logical change. Reverting the squash removes the two indexable pages, their discovery links, evidence contract updates and any sitemap/check entries without requiring external migrations or dictionary rollback.
