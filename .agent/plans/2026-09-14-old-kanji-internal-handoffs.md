# ExecPlan — Old Kanji internal handoff alignment

## Scope

Align the user-facing related-tool handoffs with `tools/OLD_KANJI_CLUSTER.md` without adding sitewide navigation.

This PR fixes the pages whose current destination set is structurally wrong:
- `tools/old-kanji-ocr-scanner/index.html`
- `tools/old-document-kanji-highlighter/index.html`
- `tools/place-old-kanji-checker/index.html`

It also adds a cluster-wide read-only checker so all eight pages stay within the 2–4 destination rule and required role handoffs.

## Required changes

- OCR Scanner: reduce five links to Reference + Highlighter + Modernizer.
- Old Document Highlighter: Reference + Modernizer + OCR Scanner (replace Place Checker).
- Place Checker: Reference + Modernizer + Name Checker (replace Highlighter).
- Use task-oriented visible anchor text on changed pages.
- Keep related links content/footer-near; do not add cross-tool header navigation.

## Non-goals

- no title/meta rewrites;
- no analytics events yet;
- no Pro/billing text changes;
- no Amazon changes;
- no mapping/dictionary changes.

## Validation

Add a checker that reads the eight current HTML pages, validates required destination URLs and enforces 2–4 Old Kanji related destinations for each page's related-link block where present. Existing pages whose destination sets already match the cluster contract are left functionally unchanged in this PR.
