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

## Phase 1B: cross-tool browser-local Workspaces

A single entitlement `okj.workspaces` enables opt-in workspaces on all eight Old Kanji pages. Users can create named cases, import the current tool input, add multiple labeled records from different tools, copy or delete entries, and export Markdown/JSON locally. Storage is per browser (`okj.workspaces.v1`) and must not be described as cross-device sync. Every write/read/export requires the feature entitlement; each user action rechecks server-side via the shared entitlement adapter. No raw source text is submitted to billing, Amazon or analytics. Existing Free controls are unchanged. Unit/Chrome regression checks verify that both unentitled and entitled paths behave as documented. Pro sales remain gated and off.

## Phase 1C: actual Name / Place batch checking

Two existing tools now load a shared browser-only batch analyzer and Pro UI. A single product grant permits `okj.name.batch` and `okj.place.batch`, each rechecked independently. Inputs support multiline pastes or a small UTF-8 CSV; outputs show dictionary forward/reverse candidates, unmatched rows and downloadable CSV/JSON. The implementation is NOT an official name/address validator. Existing Free checks and affiliate links continue. Batch UI only mounts after verified entitlement; commercial pricing remains undecided and selling disabled.

## Phase 1D: OCR report and advanced export UI

The existing `assets/okj-report-engine.js` and `assets/okj-export-engine.js` now have a usable browser UI on Old Kanji OCR Scanner, gated by `okj.reports` or `okj.advancedExport` respectively. Users can generate research reports in Markdown/JSON or export their current OCR text, dictionary detections and modern preview in CSV/Markdown/JSON. Inclusion of saved history and collection is opt-in and independently rechecks `okj.history` / `okj.collections`; the output remains entirely local. Pro sales are not enabled. The reports do not attest to official spelling.
