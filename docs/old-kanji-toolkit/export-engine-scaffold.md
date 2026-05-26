# Old Kanji Toolkit Export Engine Scaffold (OKJ-P07-A)

## 1) Status

- Status: Implemented scaffold only (no UI wiring).
- Ticket: OKJ-P07-A.
- Date: 2026-05-26.
- Scope: Static client-side helper module for future Pro export execution.

## 2) Scope of OKJ-P07-A

This change adds a reusable export engine scaffold for Pro-format output generation:

- `assets/okj-export-engine.js`
- no OCR UI button wiring
- no click-handler wiring
- no automatic download wiring
- no entitlement unlock logic
- no Stripe/webhook integration

## 3) Supported feature IDs

The module recognizes these feature IDs:

- `okj.exportCsv`
- `okj.exportMarkdown`
- `okj.exportJson`
- `okj.report` (reserved/related future feature)

Active export functions in this scaffold:

- `buildCsvExport(input, gate)` → requires `okj.exportCsv`
- `buildMarkdownExport(input, gate)` → requires `okj.exportMarkdown`
- `buildJsonExport(input, gate)` → requires `okj.exportJson`

## 4) Input record shapes

Supported input shape:

```js
{
  historyRecords: [],
  collectionRecords: [],
  detectedOldKanji: [],
  ocrText: "",
  modernPreview: "",
  sourceLabel: "",
  createdAt: "2026-01-01T00:00:00.000Z"
}
```

`normalizeExportInput(input)` applies defensive normalization:

- missing arrays become `[]`
- missing strings become `""`
- detected old-kanji records are normalized to `{ old, modern, count }`
- history/collection records are normalized without changing persistence behavior
- export payload includes `schemaVersion: "okj-export-v1"`

## 5) CSV export contract

`buildCsvExport(input, gate)` contract:

- inactive gate: `{ ok: false, error: "pro_required" }`
- active gate (explicit pass only):

```js
{
  ok: true,
  filename: "old-kanji-export.csv",
  mimeType: "text/csv;charset=utf-8",
  content: "..."
}
```

CSV behavior:

- includes safe header row
- includes schema/version marker in content (`schemaVersion` column)
- escapes quotes by doubling (`"` → `""`)
- quotes fields containing commas/newlines/quotes
- does not include image binary/blob/base64 fields

## 6) Markdown export contract

`buildMarkdownExport(input, gate)` contract:

- inactive gate: `{ ok: false, error: "pro_required" }`
- active gate (explicit pass only):

```js
{
  ok: true,
  filename: "old-kanji-export.md",
  mimeType: "text/markdown;charset=utf-8",
  content: "..."
}
```

Markdown behavior:

- includes document title
- includes OCR text section
- includes detected old-kanji section
- includes history/collection summary counts
- escapes `<`, `>`, `&` to reduce unsafe HTML injection risk

## 7) JSON export contract

`buildJsonExport(input, gate)` contract:

- inactive gate: `{ ok: false, error: "pro_required" }`
- active gate (explicit pass only):

```js
{
  ok: true,
  filename: "old-kanji-export.json",
  mimeType: "application/json;charset=utf-8",
  content: "{...}"
}
```

JSON behavior:

- includes `schemaVersion: "okj-export-v1"`
- includes normalized export input data
- excludes image binary/blob/base64 fields
- excludes entitlement/payment state from exported payload

## 8) Gate behavior

Every export entry point requires a gate object.

Example:

```js
const gate = {
  productId: "okj.toolkit_pro",
  featureId: "okj.exportCsv",
  active: false,
  state: "billing-unavailable"
};
```

Rules:

- If `gate.active !== true`, return `{ ok: false, error: "pro_required" }`.
- Gate must match product `okj.toolkit_pro`.
- Gate feature must match each export function’s expected feature ID.
- No URL-param entitlement lookup.
- No localStorage entitlement lookup.
- No entitlement inference from mock/local files.
- This scaffold does not set `active: true` anywhere.

## 9) Privacy constraints

- Export payloads avoid binary image data and base64 image blobs.
- Export payloads include only normalized text/metadata records provided by caller.
- Export payloads do not embed billing or entitlement state.
- No network or remote persistence calls are introduced.

## 10) What remains disabled

Still intentionally disabled after P07-A:

- export UI buttons
- click-handler integrations
- automatic file download trigger paths
- Pro unlock logic
- Stripe checkout/webhook integration
- server-side persistence integration (D1/KV/etc.)

## 11) Future P07-B / P08 relationship

Planned follow-up responsibilities:

- P07-B: wire export actions to existing locked UI placeholders through explicit gate checks
- P08: integrate real entitlement resolution and billing flow, then allow active gates from server-verified state

P07-A intentionally provides only reusable pure helper functions.

## 12) Validation checklist

- [x] `assets/okj-export-engine.js` created.
- [x] `docs/old-kanji-toolkit/export-engine-scaffold.md` created.
- [x] Inactive gate returns `pro_required` for all export builders.
- [x] No `active: true` assignment exists.
- [x] No Stripe/webhook/fetch integration added.
- [x] No localStorage entitlement reads for export gating.
- [x] No OCR UI wiring added.
