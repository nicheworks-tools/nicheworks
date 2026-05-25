# NicheWorks Common Billing Architecture

Status:
- Planning spec
- Runtime unchanged
- Stripe not implemented yet
- Checkout not implemented yet
- Webhook not implemented yet
- Entitlement not implemented yet
- Pro unlock not implemented yet
- Based on OKJ-M01 to OKJ-M10

## 1. Purpose

NicheWorks common billing foundation is a shared billing architecture for small paid NicheWorks products.

It should support:
- one-time purchases
- multiple products
- different product prices
- common Stripe Checkout flow
- common webhook handling
- common entitlement issuing
- common Pro UI state
- future product expansion

Common billing foundation does not mean common price. Old Kanji Toolkit Pro can be $4.99 one-time while smaller tools can remain $2.99 one-time.

## 2. Initial product

Initial product definition:

- Product: Old Kanji Toolkit Pro
- Product ID: `okj.toolkit_pro`
- Price: `$4.99` one-time
- Currency: `USD`
- Purchase type: `one-time`

Primary feature groups:
- OCR batch / history / crop / zoom / marking
- export / report
- batch name/place/text checks
- saved sets / collections
- learning history

## 3. Future products

This architecture should support multiple product IDs in the same common billing foundation.

Example future product IDs:
- `nw.small_tool_pro`
- `nw.toolkit_pro`
- `ai_cost_scope_pro`
- `pattern_atlas_pro`

These examples are planning references only and are not implemented in this PR.

## 4. Billing model

Purchase model:
- one-time purchase
- no subscription in initial OKJ phase
- product-level entitlement
- feature-level checks derived from product entitlement

Entitlement model:
A user who owns `okj.toolkit_pro` should have access to all OKJ Pro feature IDs:
- `okj.batchOcr`
- `okj.scanHistory`
- `okj.oldKanjiCollection`
- `okj.exportCsv`
- `okj.exportMarkdown`
- `okj.exportJson`
- `okj.report`
- `okj.cropOcr`
- `okj.zoomInspect`
- `okj.imageMarking`
- `okj.batchNameCheck`
- `okj.batchPlaceCheck`
- `okj.batchTextHighlight`
- `okj.savedCompareSets`
- `okj.unicodeAuditExport`
- `okj.quizHistory`

## 5. Product registry design

Future product registry shape (example only):

```json
{
  "products": [
    {
      "productId": "okj.toolkit_pro",
      "displayName": "Old Kanji Toolkit Pro",
      "price": {
        "amount": 4.99,
        "currency": "USD",
        "type": "one_time"
      },
      "stripePriceIdEnv": "STRIPE_PRICE_OKJ_TOOLKIT_PRO",
      "features": [
        "okj.batchOcr",
        "okj.scanHistory",
        "okj.exportCsv"
      ],
      "status": "planned"
    }
  ]
}
```

Rules:
- no real Stripe price IDs in repo
- use env var names only
- no secret keys
- product IDs must be stable
- feature IDs must be stable
- display copy can be localized separately

## 6. Stripe integration boundaries

Future Stripe role boundaries:

Checkout creation:
- server-side only
- uses `productId`
- validates product exists
- uses environment variable for Stripe price ID
- redirects to Stripe Checkout
- `success_url` and `cancel_url` must be controlled
- no secret key in client files

Webhook:
- server-side only
- verifies Stripe signature
- handles `checkout.session.completed`
- maps Stripe price/customer/payment to `productId`
- issues entitlement
- must be idempotent
- must not trust client-provided payment state

Client:
- can request checkout session
- can display locked panel
- can check entitlement status
- must not contain Stripe secret key
- must not self-unlock Pro features

## 7. Entitlement design

Required entitlement fields:
- `entitlementId`
- `productId`
- `userId` or `customerId`
- email hash or customer reference if no login
- `status`
- `source`
- `stripeCustomerId`
- `stripeCheckoutSessionId`
- `stripePaymentIntentId` if available
- `createdAt`
- `updatedAt`
- `revokedAt`
- `features`

Status values:
- `active`
- `revoked`
- `refunded`
- `disputed`
- `test`
- `unknown`

Important:
The final identity model is not implemented in P01. If no account/login exists, later PRs must decide how a purchaser restores access.

## 8. Restore access / identity decision

Unresolved but required identity/restore options:
- A. email-based magic link
- B. Stripe customer portal / lookup
- C. license key
- D. account login
- E. local-only unlock token

Initial recommendation:
Use email-based restore or license-token style entitlement only if it can be implemented safely. Do not rely only on `localStorage` for paid access. `localStorage` may be used for cached UI state, not source of truth.

## 9. Storage options

Possible storage:
- Cloudflare D1
- Cloudflare KV
- simple JSON not acceptable for real entitlement
- `localStorage` only acceptable for mock/dev state

Recommendation:
Use D1 for durable entitlements if Cloudflare stack is used. KV can cache entitlement checks but should not be the only source of truth for payments/refunds.

## 10. API route design

Future route names (planning only; not implemented in P01):
- `POST /api/billing/create-checkout-session`
- `POST /api/billing/stripe-webhook`
- `GET /api/billing/entitlement`
- `POST /api/billing/restore-access`

Request examples:

Create checkout:
```json
{
  "productId": "okj.toolkit_pro",
  "returnPath": "/tools/old-kanji-ocr-scanner/"
}
```

Entitlement check:
```json
{
  "productId": "okj.toolkit_pro"
}
```

Rules:
- route names are planning only
- no route files in P01
- no Worker implementation in P01

## 11. Client Pro state design

Future client states:
- `free`
- `billing-unavailable`
- `checkout-available`
- `checkout-pending`
- `pro-active`
- `entitlement-error`
- `restore-required`

Current state:
- `billing-unavailable`

After P05:
- OKJ tools may show `pro-active` if entitlement is valid.

## 12. Security requirements

- never commit Stripe secret keys
- never commit webhook signing secrets
- never expose secret keys in frontend
- verify webhook signatures
- make webhook idempotent
- do not trust client-side purchase state
- do not unlock paid features from URL parameter alone
- do not unlock paid features from `localStorage` alone
- do not log personal/payment data unnecessarily
- do not store full card data
- support revocation/refund/dispute state later

## 13. Privacy requirements

- do not send old kanji user input to billing endpoints
- do not include OCR text in checkout metadata
- do not include names/addresses/documents in Stripe metadata
- only send product/payment metadata required for purchase
- avoid storing user tool content with payment records
- analytics/ad identifiers must not be embedded in exports or entitlement records

## 14. Old Kanji Toolkit integration plan

P02:
- billing config and mock entitlement
- no real Stripe
- dev/test only Pro state

P03:
- Stripe Checkout success / cancel flow
- create checkout session
- no webhook entitlement yet unless explicitly included later

P04:
- Stripe webhook
- entitlement issue
- idempotency

P05:
- apply real Pro unlock to OKJ tools
- locked panels can become active when entitlement is valid

P06-P10:
- implement actual Pro features after unlock system exists

## 15. Pricing policy

Old Kanji Toolkit Pro:
- `$4.99` one-time

Other NicheWorks small Pro tools:
- `$2.99` one-time may remain valid

Rules:
- product-specific pricing allowed
- common billing foundation supports different prices
- price copy must come from product config later
- UI hardcoded price is acceptable only until billing config exists

## 16. Failure states

Failure states:
- checkout unavailable
- Stripe API error
- webhook delay
- entitlement not found
- payment succeeded but unlock pending
- refunded/revoked entitlement
- network error
- user changed device/browser

UI should:
- show clear non-technical message
- never claim access if entitlement is unknown
- provide restore/help path later

## 17. Legal / disclaimer

Billing unlock does not change product disclaimer.

Old Kanji Toolkit Pro:
- does not guarantee legal validity
- does not verify official registered glyphs
- does not guarantee OCR accuracy
- does not replace professional/legal/academic/archive review

## 18. Relationship to OKJ docs

This architecture is aligned with and enables the billing phases described in:
- `docs/old-kanji-toolkit/free-pro-ocr-billing-roadmap.md`
- `docs/old-kanji-toolkit/pro-feature-matrix.md`
- `docs/old-kanji-toolkit/pro-gate-ui-design.md`
- `docs/old-kanji-toolkit/export-report-format-spec.md`

## 19. Validation

This PR is docs only.

Validation checklist:
- confirm `docs/billing/nicheworks-common-billing-architecture.md` exists
- confirm no runtime files changed
- confirm no tool HTML/CSS/JS changed
- confirm no SEO/sitemap/tools-index/tools-meta changed
- confirm no data files changed
- confirm no Stripe/billing code implemented
