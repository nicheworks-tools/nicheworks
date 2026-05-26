# OCR History / Collection Locked UI (OKJ-P06-B)

## 1) Status
- Status: Implemented as **locked UI placeholders only**.
- Billing state: `billing-unavailable`.
- Entitlement active state: `false`.

## 2) Scope of OKJ-P06-B
- Add visible, Pro-locked placeholders for:
  - OCR History
  - Old-Kanji Collection
- Keep this phase non-functional (no save/load/unlock behavior).

## 3) Target page
- `tools/old-kanji-ocr-scanner/index.html`

## 4) Locked UI sections
- OCR History placeholder card in Pro panel.
- Old-Kanji Collection placeholder card in Pro panel.
- Both include disabled locked buttons and `aria-disabled="true"`.

## 5) Feature IDs
- OCR History: `okj.scanHistory`
- Old-Kanji Collection: `okj.oldKanjiCollection`

## 6) Adapter state mapping
- Runtime reads from:
  - `window.NicheWorksProEntitlement.getFeatureState({ productId: 'okj.toolkit_pro', featureId })`
- Runtime writes **non-authoritative** attributes only:
  - `data-okj-runtime-pro-state`
  - `data-okj-runtime-pro-active`

## 7) Why no storage is active
- This phase intentionally excludes persistence.
- No local/browser/server/cloud persistence path is enabled.
- UI placeholders are for visibility and future wiring only.

## 8) What this PR does not implement
- No Pro unlock.
- No Stripe checkout or webhook usage.
- No D1/KV integration.
- No localStorage/sessionStorage/IndexedDB persistence.
- No OCR history or collection business logic.

## 9) Future P06-C handoff
- P06-C can wire real history/collection behavior behind entitlement checks.
- P06-C can add storage strategy and migration rules.
- P06-C should keep locked/fallback state safe when billing is unavailable.

## 10) Validation checklist
- [x] OCR page loads `/assets/okj-history-collection.js`
- [x] OCR History placeholder exists and is locked.
- [x] Old-Kanji Collection placeholder exists and is locked.
- [x] Feature IDs are `okj.scanHistory` and `okj.oldKanjiCollection`.
- [x] Runtime state attributes are written from entitlement adapter.
- [x] No storage write behavior added.
- [x] No unlock behavior added.
- [x] No Stripe/webhook activation added.
