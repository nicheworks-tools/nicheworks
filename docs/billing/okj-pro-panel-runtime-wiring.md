# OKJ Pro Panel Runtime Wiring (OKJ-P05-B)

## 1) Status
- **Task**: OKJ-P05-B
- **State**: Implemented
- **Billing provider**: Disabled adapter only (`/assets/nw-pro-entitlement.js`)
- **Unlock behavior**: Not enabled (all Pro panels remain locked)

## 2) Scope of OKJ-P05-B
This task only wires existing OKJ tool Pro panels to the shared entitlement state adapter contract.
No Stripe checkout, webhook, entitlement issuance, D1/KV storage, or Pro feature unlock logic is added.

## 3) Target tools
- `tools/old-kanji-ocr-scanner/`
- `tools/old-kanji-reference/`
- `tools/name-old-kanji-checker/`
- `tools/place-old-kanji-checker/`
- `tools/old-document-kanji-highlighter/`
- `tools/unicode-kanji-checker/`
- `tools/variant-kanji-compare/`

## 4) How panels read adapter state
Each target tool now:
1. Loads `/assets/nw-pro-entitlement.js` on the page.
2. Reads existing panel feature IDs from `data-okj-feature-id`.
3. Calls `window.NicheWorksProEntitlement.getFeatureState(featureId)` if available.
4. Writes non-authoritative runtime attributes:
   - `data-okj-runtime-pro-state`
   - `data-okj-runtime-pro-active`

The static lock attributes (`data-okj-pro-state="billing-unavailable"`, disabled CTA, `aria-disabled="true"`) are preserved.

## 5) Why all panels remain locked
The current adapter is intentionally disabled and returns inactive entitlement state:
- `state: "billing-unavailable"`
- `active: false`
- `source: "disabled"`
- `reason: "billing_not_connected"`

Runtime wiring reflects this state into panel data attributes only. It does not grant access.

## 6) Future replacement path
When Stripe + entitlement storage is connected, keep the same tool-side runtime wiring and replace only adapter internals (or provider wiring) so `getFeatureState()` returns real entitlement state. The tool panels can then react without per-tool rewrite.

## 7) Validation checklist
- [ ] All target pages include `/assets/nw-pro-entitlement.js`
- [ ] Runtime helper safely handles adapter presence/absence
- [ ] Runtime attributes are set from adapter state
- [ ] No `active: true` assignment introduced
- [ ] Existing locked panel attributes remain
- [ ] Disabled CTA remains disabled
- [ ] No Stripe call, webhook call, URL-param unlock, or localStorage unlock added
