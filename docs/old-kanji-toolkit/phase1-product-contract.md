# Old Kanji Toolkit Pro — Phase 1 canonical contract

## Status — 2026-10-31

**Staged implementation, NOT launched or completed.** No approved price, real live Stripe purchase, D1 deployment, mobile browser checkout or recovery test is yet verified. Do not display a Pro purchase CTA until all launch gates pass.

- Product: **Old Kanji Toolkit Pro**, Product ID `okj.toolkit_pro`.
- A **single purchase** authorizes all eight Old Kanji tools, not eight individual sales.
- Existing Free functions remain Free, especially Reference's **CSV, JSON, Markdown, Print**.
- Amazon Associates remains live for 8/8 tools under AFFILIATE and is separate from Pro.
- Canonical feature IDs and per-tool guarantees: `config/old-kanji-toolkit-pro-phase1.json`.

## Product value

Pro adds multi-file/record processing, opt-in persistent History and Collections, case-based Workspaces, and consolidated Reports/Advanced Export. Do not charge for existing Free output actions. The initial functional priority is OCR Batch and OCR History. Name/Place CSV Batch are subsequent work under the same product.

## Billing and entitlement

Reuse NicheWorks's existing server-side endpoints: `POST /api/billing/create-checkout-session`, verified `/api/billing/stripe-webhook`, `/api/billing/entitlement`, with D1 `BILLING_DB`. Apply `schema/billing_entitlements.sql` before enabling sales. Redirect success is not evidence of payment. Product flags must remain closed while price and real Stripe Price ID are undecided.

Phase 1 completion requires paid, cancel, error, refund/revoke, browser restore, JP/EN and mobile/desktop coverage. New devices without a stored checkout session are not currently a verified recovery path. Never describe same-device stored checkout as account-wide or cross-device restore.

## Privacy and security

No scanned text, image data, typed names/addresses, source filenames, documents or reports in billing databases, URLs or analytics. Browser-local history is explicitly saved only by a user action and is not cloud sync. No claim that Pro OCR determines official registered name glyphs or legal addresses. A browser-only feature gate can be manipulated by its user and must not be presented as cryptographic access control.

## Commercial decision outstanding

The legacy internal USD $4.99 entry was an unapproved planning remnant. It is removed from the staged product record, not restored as a live price. Price, currency and purchase terms must be agreed before live configuration and sales.

## Conditional purchase UI (staged behind server launch gate)

All eight pages load the shared `assets/old-kanji-pro-sales.js`, which **renders nothing** while `GET /api/billing/product-availability?productId=okj.toolkit_pro` returns `available:false`. The availability endpoint requires an approved registry, a live Stripe secret, matching configured Stripe Price ID, webhook secret, `BILLING_DB` table, opt-in live flags, and `OKJ_TOOLKIT_PRO_LAUNCH_APPROVED=true`. The POST checkout route independently rechecks the launch guard, and verifies the Stripe Price currency/amount before charging. The purchase CTA is only shown after the same task-result activation already used for contextual Amazon; Reference remains always eligible after real launch. This is source wiring, not real paid QA or authorization to sell.
