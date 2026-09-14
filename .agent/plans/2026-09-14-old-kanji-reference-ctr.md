# ExecPlan — Old Kanji Reference CTR and search-intent alignment

## Scope

Target only `tools/old-kanji-reference/` plus a dedicated read-only checker and the existing runtime-audit workflow.

Files:
- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/SPEC.md`
- `scripts/check-old-kanji-reference-seo.mjs`
- `.github/workflows/tool-runtime-contract-audit.yml`

## Evidence

Latest settled Search Console window (2026-08-15 through 2026-09-11): Old Kanji Reference has 234 impressions, 0 clicks, average position about 20.2. Individual queries already include `計画 旧字体`, `御 旧字体`, `将 旧字体`, `霧 旧字体`, `鯨 旧字体`, while generic `旧字体一覧` / `旧字体検索` visibility is weaker.

## Goals

1. Make the SERP message explicit: searchable old-kanji reference/list, free, old/new comparison.
2. Keep full-text conversion out of this page's primary intent and point it to Kanji Modernizer.
3. Keep canonical, WebApplication JSON-LD, and visible FAQ/FAQ schema aligned with actual behavior.
4. Reduce the Reference footer handoffs to the four roles defined by `tools/OLD_KANJI_CLUSTER.md`: full-text conversion, image OCR, Unicode inspection, variant comparison.
5. Do not create individual-kanji URLs in this PR. Existing mapping quality must be audited before any indexable per-character pilot.
6. Add a regression checker for title/meta/H1/canonical/structured-data intent and the four bounded handoffs.

## Non-goals

- no dictionary/mapping edits;
- no bulk SEO landing pages;
- no Amazon expansion;
- no Pro gating changes;
- no GA4 event implementation yet (separate measurement PR).

## Manual verification

- Search result metadata says what the page does and includes `無料` without claiming full-text conversion.
- H1 is `旧字体検索・旧字体一覧`.
- Intro distinguishes single-character/reference lookup from full-text conversion and image OCR.
- Footer has exactly four Old Kanji task handoffs and includes OCR Scanner.
- Canonical remains self-canonical.
- FAQPage schema still corresponds to visible FAQ content.
