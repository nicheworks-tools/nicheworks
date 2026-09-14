# Old Kanji Measurement Contract

Status: canonical measurement supplement to `tools/OLD_KANJI_CLUSTER.md`.

## GA4 events

### `old_kanji_handoff`

Emitted when a user follows a link from one of the eight Old Kanji tools to another cluster tool.

Allowed parameters only:
- `source_tool`
- `target_tool`
- `placement` (`related_tools` or `task_handoff`)

### `support_click`

Emitted for OFUSE / Ko-fi support links.

Allowed parameters only:
- `tool`
- `provider` (`ofuse` or `ko-fi`)
- `placement` (`support`)

### `old_kanji_pro_click`

Emitted only for an actually enabled Pro CTA. A disabled control, `aria-disabled=true`, or a panel with `data-okj-pro-state=billing-unavailable` must never emit this event.

Allowed parameters only:
- `tool`
- `placement` (`pro_panel`)

## Amazon measurement

Amazon remains contextual and separately instrumented by `/assets/amazon-affiliate.js`. Its existing event is `affiliate_click`. The Old Kanji measurement module must not duplicate Amazon click events.

Current production Amazon scope remains:
- Old Kanji Reference: dictionary, magnifier, book stand searches.
- Old Kanji OCR Scanner: non-destructive book scanner and magnifier searches.

## Privacy boundary

No GA4 event in this contract may include searched kanji, names, addresses, pasted document text, OCR text, image filenames, conversion content, exported data, localStorage/sessionStorage values, link labels, or raw URLs/query strings. Only the coarse allowlisted identifiers above are permitted.

## Evaluation

Use these events together with settled GA4 landing/session data and GSC impressions/clicks/CTR/position. `affiliate_click` is a formal Old Kanji monetization KPI alongside internal handoffs, support clicks, and future enabled Pro clicks.