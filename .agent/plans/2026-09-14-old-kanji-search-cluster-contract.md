# ExecPlan — Old Kanji search cluster contract

## Scope

Define the current eight-tool Old Kanji cluster as one search/usage system without changing tool runtime behavior in this PR.

Target tools:
- `tools/old-kanji-reference/`
- `tools/kanji-modernizer/`
- `tools/old-kanji-ocr-scanner/`
- `tools/old-document-kanji-highlighter/`
- `tools/unicode-kanji-checker/`
- `tools/variant-kanji-compare/`
- `tools/place-old-kanji-checker/`
- `tools/name-old-kanji-checker/`

Files to add/change:
- `tools/OLD_KANJI_CLUSTER.md`
- `scripts/check-old-kanji-cluster-contract.mjs`
- `.github/workflows/tool-runtime-contract-audit.yml`

## Goals

1. Freeze one primary search intent per tool so pages do not all compete for generic `旧字体`.
2. Define primary/secondary query families and a bounded 2–4-link internal handoff contract per tool.
3. Define the Free/Pro boundary without weakening current Free functions.
4. Define measurement event names and safe metadata for internal-link, Pro, and donation clicks.
5. Keep Amazon contextual and optional; do not expand it across the whole cluster.
6. Record the decision gate for individual-kanji URLs: no bulk thin pages; only source-backed, standalone-useful entries may become indexable URLs later.

## Steps

1. Inspect current tool specs and current Search Console exposure.
2. Add the canonical cluster contract document under `tools/`.
3. Add a read-only checker that verifies all eight tools remain represented and key anti-cannibalization/measurement/individual-page rules remain present.
4. Wire the checker into the existing runtime audit workflow.
5. Run CI, verify mergeability, and merge only on green.

## Manual verification

- Confirm the cluster document lists exactly eight current tools.
- Confirm `old-kanji-reference` is the generic lookup/list/search entry point, not the full-text conversion page.
- Confirm every tool has one distinct primary intent and only 2–4 related handoffs.
- Confirm current Free exports/functions are not reclassified as paid.
- Confirm no user-entered kanji/text is required in analytics event parameters.
