# OCR History / Old-Kanji Collection Data Model (OKJ-P06-A)

## 1) Status block
- **Task ID:** OKJ-P06-A
- **Date:** 2026-05-26
- **Status:** Draft scaffold defined (no unlock, no billing activation)
- **Runtime entitlement state:** unchanged / inactive
- **Stripe / webhook / D1-KV:** not implemented in this PR

## 2) Scope of OKJ-P06-A
This PR defines only the **data model** and a **safe local runtime scaffold** for future Pro-only OCR history and old-kanji collection features.

Included:
- OCR history record schema definition
- Old-kanji collection record schema definition
- Storage/privacy/retention policy definitions
- Adapter gating plan for future integration
- Optional pure helper runtime scaffold

Excluded:
- Pro unlock implementation
- Any active entitlement behavior
- Stripe/webhook/server-side integration
- Visible history/collection UI wiring

## 3) Feature IDs
Primary feature IDs for this scope:
- `okj.scanHistory`
- `okj.oldKanjiCollection`

Related feature IDs (future relationship/reference):
- `okj.batchOcr`
- `okj.report`
- `okj.exportJson`

## 4) Free vs Pro boundary
- **Free tier (current behavior):** existing OCR and old-kanji analysis behavior remains as-is.
- **Pro tier (future only):** OCR history persistence and old-kanji collection persistence.

Boundary rule for this phase:
- Data model and helper functions can exist in codebase.
- No runtime path may expose Pro features as available.
- Entitlement remains inactive and gating stays deny-by-default.

## 5) OCR history record schema
Canonical record shape (v1):

```json
{
  "id": "okj-history-...",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "sourceType": "image|manual",
  "sourceLabel": "optional local filename or user label",
  "ocrText": "string",
  "detectedOldKanji": [
    {
      "old": "舊",
      "modern": ["旧"],
      "count": 2
    }
  ],
  "notes": "",
  "tags": [],
  "schemaVersion": "okj-ocr-history-v1"
}
```

Field intent:
- `id`: local unique record id (`okj-history-` prefix recommended)
- `createdAt`: ISO-8601 UTC timestamp
- `sourceType`: origin category (`image` or `manual`)
- `sourceLabel`: optional human-readable source label only
- `ocrText`: OCR output text snapshot
- `detectedOldKanji`: normalized detected pairs and counts
- `notes`: optional free text
- `tags`: optional user labels
- `schemaVersion`: fixed version marker for migrations

## 6) Old-kanji collection record schema
Canonical record shape (v1):

```json
{
  "id": "okj-collection-...",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "old": "舊",
  "modern": ["旧"],
  "source": "ocr|manual|reference",
  "notes": "",
  "tags": [],
  "schemaVersion": "okj-old-kanji-collection-v1"
}
```

Field intent:
- `id`: local unique record id (`okj-collection-` prefix recommended)
- `createdAt`: ISO-8601 UTC timestamp
- `old`: old-kanji character
- `modern`: mapped modern-kanji list
- `source`: source category (`ocr`, `manual`, `reference`)
- `notes`: optional memo
- `tags`: optional labels
- `schemaVersion`: fixed version marker for migrations

## 7) Storage strategy
For OKJ-P06-A, storage is design-only and disabled-safe:
- No active storage writes are required in this PR.
- If local persistence is added later, it must be gated by Pro entitlement and explicit user action.
- No server persistence in this phase.
- No cloud sync in this phase.

## 8) Privacy constraints
Mandatory constraints:
- Local filename may be stored **only as `sourceLabel` text**.
- Do **not** store image binary/blob/base64 in initial scaffold.
- Do **not** auto-upload OCR text or collection data.
- Do **not** perform automatic cloud sync.

## 9) Retention / clear data behavior
Planned behavior (future implementation):
- User can manually clear OCR history.
- User can manually clear old-kanji collection.
- Clear behavior is local-only for local data stores.
- No implicit retention extension through remote sync (none in this phase).

## 10) Import/export relationship
Planned relationship:
- Export/import of history/collection should align with future `okj.exportJson` gating.
- Export format should include `schemaVersion` for migration safety.
- Import must normalize and validate incoming records before use.
- No import/export UI or runtime wiring is added in OKJ-P06-A.

## 11) UI integration plan
UI wiring is deferred to P06-B:
- Add locked UI entry points for history/collection only after adapter gating path is finalized.
- Keep free OCR flow unchanged.
- Ensure any visible Pro affordance remains clearly locked when entitlement is inactive.

## 12) Adapter gating plan
Future gating contract (no activation in this PR):
1. Query feature state via existing object-shape adapter call:
   - `getFeatureState({ productId: 'okj.toolkit_pro', featureId: 'okj.scanHistory' })`
   - `getFeatureState({ productId: 'okj.toolkit_pro', featureId: 'okj.oldKanjiCollection' })`
2. Allow history/collection persistence paths only when adapter returns active entitlement.
3. Keep deny-by-default when adapter is unavailable or inactive.

Current PR behavior:
- No entitlement state changes.
- No feature availability changes.

## 13) What this PR does not implement
- Pro unlock / purchase flow
- Stripe calls / webhook handling
- D1/KV persistence
- Cloud sync
- Real history/collection UI
- OCR engine behavior changes
- Billing product or entitlement config changes

## 14) Future implementation steps
1. P06-B: add minimal locked UI and read-only placeholders.
2. P06-C: gated local persistence implementation for active entitlement only.
3. P06-D: import/export flow with schema validation and migration hooks.
4. Future billing phase: connect real entitlement after Stripe/webhook path is approved.

## 15) Validation checklist
- [x] Data model document added.
- [x] OCR history schema includes `schemaVersion: okj-ocr-history-v1`.
- [x] Collection schema includes `schemaVersion: okj-old-kanji-collection-v1`.
- [x] Privacy constraints explicitly documented.
- [x] Free vs Pro boundary explicitly documented.
- [x] Future adapter gating plan documented.
- [x] No Pro unlock introduced.
- [x] No Stripe/D1/webhook activation introduced.
