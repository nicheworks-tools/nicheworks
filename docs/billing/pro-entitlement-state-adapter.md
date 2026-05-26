# Pro Entitlement State Adapter Contract (OKJ-P05-A)

Status:
- Phase: OKJ-P05-A
- State: contract + optional disabled runtime scaffold
- Stripe mode: `not_connected`
- Real entitlement issuance: not implemented
- Real Pro unlock: not implemented
- Runtime default state: `billing-unavailable`

## 1. Scope of OKJ-P05-A

P05-A defines a future-swappable entitlement state adapter contract so OKJ runtime and Pro UI can integrate against one stable interface.

This phase adds only:
- a state model contract
- provider mode contract
- adapter return shape contract
- optional tiny disabled runtime scaffold

This phase does not activate billing, webhook entitlement, or Pro unlock.

## 2. Why this exists

Without a shared adapter contract, each tool would need direct rewrites when billing state changes (disabled -> mock -> server -> Stripe/D1).

This adapter isolates change to one layer so tools keep the same call pattern:

```js
getProState({ productId: "okj.toolkit_pro", featureId: "okj.exportCsv" })
```

## 3. Supported products

In scope now:
- `okj.toolkit_pro`

Future products may be added via existing billing registry rules, but are out of scope for P05-A runtime behavior.

## 4. Supported feature IDs

P05-A adapter contract supports feature checks for OKJ Pro feature IDs already defined in billing docs, including examples:
- `okj.exportCsv`
- `okj.exportMarkdown`
- `okj.exportJson`
- `okj.report`
- and other `okj.*` Pro feature IDs mapped by product entitlement

P05-A does not add or modify feature catalog values.

## 5. State model

Allowed adapter `state` values:
- `billing-unavailable`
- `checkout-available`
- `checkout-pending`
- `free`
- `pro-active`
- `restore-required`
- `entitlement-error`

Runtime default for this phase must be:
- `billing-unavailable`

P05-A scaffold behavior:
- always inactive
- never returns `pro-active`

## 6. Adapter interface

Adapter should provide a stable interface from client runtime:

- `getProState({ productId, featureId })`
- `getFeatureState({ productId, featureId })`
- `getProductState({ productId })`

Return shape contract:

```js
{
  productId: "okj.toolkit_pro",
  featureId: "okj.exportCsv",
  state: "billing-unavailable",
  active: false,
  source: "disabled",
  reason: "billing_not_connected"
}
```

Notes:
- `active` is derived from trusted entitlement state only.
- In P05-A, `active` is always `false`.

## 7. Provider modes

Allowed provider modes:
- `disabled`
- `mock-dev`
- `server`
- `stripe-d1`

Rules:
- default is `disabled`
- `mock-dev` must never be enabled by default
- `mock-dev` must never be treated as real purchase state
- `server` is a future entitlement API mode
- `stripe-d1` is a future verified webhook + D1-backed mode

## 8. Mock/dev constraints

Mock/dev mode rules (for future controlled development only):
- must require explicit non-default enablement
- must be clearly labeled as non-production
- must not be used as source of truth for real paid access
- must not silently auto-upgrade to `pro-active`

## 9. Server entitlement API placeholder

Future `server` mode may use a server-verified entitlement endpoint (placeholder only in P05-A).

Expected contract direction:
- endpoint returns verified entitlement state for `productId`/`featureId`
- client maps response into adapter return shape
- unverified or unavailable response maps to safe inactive state

P05-A does not require adding a new API route.

## 10. Client UI state mapping

Recommended mapping from adapter `state` to UI behavior:

- `billing-unavailable`: show locked panel + billing unavailable message
- `checkout-available`: show locked panel + checkout CTA path
- `checkout-pending`: show locked panel + pending/verify message
- `free`: show free mode behavior, keep Pro locked
- `pro-active`: unlock relevant Pro features
- `restore-required`: show restore/recovery guidance
- `entitlement-error`: show retry/support guidance, remain locked

P05-A runtime must map to locked/inactive behavior.

## 11. Security constraints

- Do not trust URL params as paid access proof.
- Do not trust `localStorage` as paid access source of truth.
- Do not write client-side self-unlock flags.
- Do not call Stripe directly from this adapter scaffold.
- Do not call webhook endpoints from this adapter scaffold.
- Do not expose secrets or internal tokens in client responses.
- Never return `active: true` in P05-A scaffold.

## 12. Privacy constraints

- Do not include OCR payload/content in entitlement checks.
- Do not expose customer billing internals in client adapter state.
- Keep adapter payload minimal (`productId`, optional `featureId`, state flags/reason).

## 13. What this PR does not implement

- real Stripe Checkout activation
- real webhook signature verification
- entitlement issuance/storage
- D1 write/read implementation for production entitlement
- Pro unlock logic
- subscription logic
- URL/localStorage unlock shortcuts

## 14. Future Stripe/D1 replacement path

Planned replacement sequence:
1. Keep adapter interface stable (`getProState` / `getFeatureState` / `getProductState`).
2. Switch provider mode from `disabled` to `server` once entitlement read API is available.
3. Implement verified entitlement source backed by Stripe webhook lifecycle + D1 storage (`stripe-d1`).
4. Keep client call sites unchanged; swap provider internals only.
5. Enable `pro-active` only from verified entitlement pipeline.

## 15. Validation checklist

- [x] State model includes all required states.
- [x] Runtime default is `billing-unavailable`.
- [x] Provider modes include `disabled`, `mock-dev`, `server`, `stripe-d1`.
- [x] `mock-dev` is non-default and non-authoritative.
- [x] Adapter return shape is documented.
- [x] No Pro unlock introduced.
- [x] No Stripe connection introduced.
- [x] No URL/localStorage unlock source introduced.
- [x] Future Stripe/D1 replacement path is documented.
