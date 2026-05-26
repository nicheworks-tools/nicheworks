# Old Kanji Toolkit Report Engine Scaffold (OKJ-P08-A)

## 1) Status block

- Status: Implemented scaffold only (no UI wiring).
- Ticket: OKJ-P08-A.
- Date: 2026-05-26.
- Scope: Static client-side report helper module for future Pro investigation/report output.

## 2) Scope of OKJ-P08-A

This change adds reusable report helpers only:

- `assets/okj-report-engine.js`
- no report button wiring
- no click-handler wiring
- no automatic download trigger
- no Pro unlock behavior
- no Stripe/webhook integration

## 3) Supported feature IDs

Primary feature ID:

- `okj.report`

Related feature IDs (for future cross-module use, not activated here):

- `okj.exportMarkdown`
- `okj.exportJson`
- `okj.scanHistory`
- `okj.oldKanjiCollection`

## 4) Input shape

Supported input shape:

```js
{
  title: "Old Kanji OCR Report",
  sourceLabel: "",
  ocrText: "",
  modernPreview: "",
  detectedOldKanji: [],
  historyRecords: [],
  collectionRecords: [],
  notes: "",
  createdAt: "2026-01-01T00:00:00.000Z"
}
```

`normalizeReportInput(input)` performs defensive normalization:

- missing strings become `""`
- missing arrays become `[]`
- title falls back to `"Old Kanji OCR Report"`
- detected old-kanji entries normalize to `{ old, modern, count }`
- history/collection records normalize into safe text-first records

## 5) Report sections

Markdown report is structured with these sections:

1. Title
2. Metadata
3. OCR text
4. Modern preview
5. Detected old-kanji summary
6. History summary
7. Collection summary
8. Notes
9. Disclaimer / verification note

## 6) Gate behavior

All report functions require an explicit gate object, for example:

```js
const gate = {
  productId: "okj.toolkit_pro",
  featureId: "okj.report",
  active: false,
  state: "billing-unavailable"
};
```

Gate rules:

- If `gate.active !== true`, return `{ ok: false, error: "pro_required" }`.
- Gate product must be `okj.toolkit_pro`.
- Gate feature must be `okj.report`.
- No URL-parameter entitlement reads.
- No localStorage entitlement reads.
- No entitlement inference from mock files.
- Module does not set active entitlement state.

## 7) Markdown report contract

`buildMarkdownReport(input, gate)` behavior:

- inactive/invalid gate: `{ ok: false, error: "pro_required" }`
- active valid gate (future explicit pass only):

```js
{
  ok: true,
  filename: "old-kanji-report.md",
  mimeType: "text/markdown;charset=utf-8",
  content: "..."
}
```

Requirements:

- escape `<`, `>`, `&`
- do not include image binary/blob/base64
- do not include entitlement/payment state

## 8) JSON report contract

`buildJsonReport(input, gate)` behavior:

- inactive/invalid gate: `{ ok: false, error: "pro_required" }`
- active valid gate (future explicit pass only):

```js
{
  ok: true,
  filename: "old-kanji-report.json",
  mimeType: "application/json;charset=utf-8",
  content: "{...}"
}
```

JSON payload requirements:

- includes `schemaVersion` (current: `okj-report-v1`)
- includes `generatedAt`
- includes normalized report data
- excludes image binary/blob/base64
- excludes entitlement/payment state

## 9) Privacy constraints

- Report outputs include only text/metadata passed by caller after normalization.
- No binary image data or base64 blobs are exported.
- No payment state or entitlement state is embedded in report payload content.
- No network calls, remote writes, or server persistence are introduced.

## 10) What remains disabled

Still intentionally disabled after OKJ-P08-A:

- report UI buttons
- click-handler integration
- automatic file download trigger paths
- Pro unlock logic
- Stripe checkout/webhook integration
- D1/KV/server persistence paths

## 11) Future phase relationship

- **P08-B (future):** may wire report actions into existing locked UI placeholders with explicit gate checks.
- **Billing resume phase:** may connect server-verified entitlement with payment/webhook infra.
- **Current phase (P08-A):** scaffold only, no runtime unlock, no UI activation.

## 12) Validation checklist

- [x] `assets/okj-report-engine.js` created.
- [x] `docs/old-kanji-toolkit/report-engine-scaffold.md` created.
- [x] Inactive gate returns `pro_required` for report builders.
- [x] No active entitlement assignment added.
- [x] No Stripe/webhook/fetch integration added.
- [x] No localStorage entitlement reads added.
- [x] No OCR/report UI wiring added.
