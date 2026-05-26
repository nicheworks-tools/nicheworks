# OCR History / Collection Persistence Scaffold (OKJ-P06-C)

## 1) Status block
- **Task ID:** OKJ-P06-C
- **Date:** 2026-05-26
- **Status:** Disabled-safe local persistence scaffold added (deny-by-default)
- **Runtime entitlement state:** unchanged / inactive by default
- **Stripe / webhook / D1-KV:** not implemented in this PR

## 2) Scope of OKJ-P06-C
This phase introduces a local persistence scaffold contract and helper APIs for OCR history and old-kanji collection data.

Included:
- Local storage key boundary definition
- Explicit entitlement-gated persistence helper shape
- Save/list/clear helper behavior for future wiring
- Disabled-safe behavior when entitlement is inactive or unavailable

Excluded:
- Pro unlock implementation
- Stripe/webhook/server persistence
- OCR UI save/list/clear wiring
- Automatic writes on OCR flow or page load

## 3) Feature IDs
- `okj.scanHistory`
- `okj.oldKanjiCollection`

## 4) Storage boundary
Local browser storage is scoped to user data records only:
- OCR history records
- Old-kanji collection records

No entitlement state, billing state, or purchase proof may be stored in these data keys.

## 5) Entitlement gating rule
Persistence APIs must deny unless the caller provides an explicit gate object with:
- `gate.active === true`

Example:
```js
const gate = {
  productId: 'okj.toolkit_pro',
  featureId: 'okj.scanHistory',
  active: false,
  state: 'billing-unavailable'
};
```

Deny rules:
- If `gate.active !== true`, return `{ ok: false, error: 'pro_required' }`.
- If storage is unavailable/fails, return `{ ok: false, error: 'persistence_disabled' }`.

## 6) Allowed local storage keys
- `okj.scanHistory.v1`
- `okj.oldKanjiCollection.v1`

Rules:
- Keys store OCR history / collection data only.
- Keys must never be used as proof of paid access.
- Keys must never store entitlement or billing state.
- Keys must never store image binary/blob/base64.
- Keys must never auto-sync to cloud.

## 7) Save/load/delete behavior plan
Current scaffold behavior:
- `save*` validates/normalizes records before write.
- `list*` normalizes loaded records.
- `clear*` removes only scoped keys.
- Persisted record cap: max 100 records per key (trim oldest tail).
- Storage errors are caught and returned as `persistence_disabled`.

## 8) Privacy constraints
- Store text-level OCR outputs and metadata only.
- Do not store original image files or encoded binary payloads.
- No server upload in this phase.
- No cloud sync in this phase.

## 9) Clear data behavior
- Clear operations are explicit function calls only.
- No implicit background deletion behavior.
- Clear targets are limited to the two allowed keys.

## 10) Import/export relationship
- P06-C does not add import/export UI or runtime wiring.
- Future import/export (P06-D+) must reuse normalized schema records.
- Exported payloads should include schema versions for migration safety.

## 11) What remains disabled
- Entitlement remains inactive by default.
- No UI unlock, no save/list/clear button wiring.
- No auto-save on page load.
- No auto-save after OCR execution.
- No Stripe/webhook/server integration.

## 12) Future P06-D handoff
P06-D should build on this scaffold to add controlled import/export and migration hooks, still behind explicit entitlement checks.

## 13) Future phase relationship
- **P06-D:** may add controlled import/export and migration hooks, still behind explicit entitlement checks.
- **P07-A:** may build export engine scaffolding using the normalized history/collection record shapes, without enabling Pro unlock.
- **P08-A:** may build report engine scaffolding using the normalized history/collection record shapes, without enabling Pro unlock.
- **Stripe-resume phase / P04-B + P05-C:** may connect real webhook verification, durable entitlement storage, and runtime Pro unlock after payment infrastructure is ready.

## 14) Validation checklist
- [x] Persistence scaffold contract document added.
- [x] Allowed storage keys documented.
- [x] Data-only key constraints documented.
- [x] Explicit `gate.active === true` requirement documented.
- [x] Inactive gate deny behavior documented.
- [x] No unlock / Stripe / webhook activation introduced.
- [x] No auto-save behavior introduced.
