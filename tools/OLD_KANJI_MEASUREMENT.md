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

Amazon is currently **dormant for the Old Kanji cluster** under the canonical monetization SSOT:

- Old Kanji Reference: `ADS_DONATION`
- Old Kanji OCR Scanner: `HOLD`
- neither tool is in the canonical `AFFILIATE` class
- both production affiliate configs remain `enabled: false` with no tracking ID or outbound target

The shared `/assets/amazon-affiliate.js` event name is `affiliate_outbound`. It is the only authorized Amazon outbound event if a tool is explicitly moved into the canonical `AFFILIATE` class in the future. `assets/old-kanji-analytics.js` must not duplicate `affiliate_outbound` or emit any legacy `affiliate_click` event.

In the current dormant state, Old Kanji Reference and Old Kanji OCR Scanner must emit **no Amazon outbound event** because no active Amazon destination exists.

## Privacy boundary

No GA4 event in this contract may include searched kanji, names, addresses, pasted document text, OCR text, image filenames, conversion content, exported data, localStorage/sessionStorage values, link labels, or raw URLs/query strings. Only the coarse allowlisted identifiers above are permitted.

## Evaluation

Use these events together with settled GA4 landing/session data and GSC impressions/clicks/CTR/position. Internal handoffs, support clicks, and future enabled Pro clicks are current Old Kanji measurement signals. `affiliate_outbound` becomes an Old Kanji monetization KPI only after an explicit canonical `AFFILIATE` classification and enabled runtime; while the cluster remains non-affiliate/HOLD it is expected to be absent.