# Old Kanji Completion Wave 18 — SEO inventory final gate

Date: 2026-09-18

## Goal

Re-audit the existing individual-kanji inventory and prevent repository-side SEO candidates from becoming pages without both source safety and settled search demand.

## Starting state

- Completion Waves 10–17 are complete.
- Production allowlist contains three individual pages: 画/畫, 将/將, 旧/舊.
- Current dictionary audit reports 168 repository-side SEO candidates and zero blocking issue records.
- The three existing pages retain Culture Agency primary-source links and current safe `old_to_modern` records.

## Demand evidence

The repository preserves authenticated Search Console evidence in the Wave 1–3 ExecPlans.

A fresh GSC read was attempted on 2026-09-18 through GSC Wizard but failed with `payment_required` because the integration subscription/trial is inactive. No fresh-demand claim is made from unavailable data.

## Decision

- Revalidate the existing three pages.
- Authorize zero new individual pages in Wave 18.
- Add a CI inventory gate that fails if filesystem/sitemap inventory expands beyond the allowlist without an explicit reviewed change.
- Keep the dual dictionary/source + settled-demand publication rule.

## Guardrails

- No mass/programmatic page generation.
- No new individual-kanji page.
- No sitemap expansion.
- No dictionary changes.
- No invented or extrapolated Search Console evidence.
- No unrelated runtime, billing, affiliate, or analytics changes.

## Validation

- Run the new SEO inventory gate in Tool runtime contract audit.
- Keep existing Old Kanji Reference SEO, search-cluster, browser, behavior, privacy/measurement, Amazon, Pro-boundary, and dictionary checks green.
- Merge only with required CI green and a clean current-main merge state.
