# ExecPlan — CSV Tidy Pro purchase recovery and checkout-session privacy (2026-10-31)

## Goal
Complete the minimum **self-service, account-free, cross-device purchase restoration** for NicheWorks CSV Tidy Pro while keeping all real sales disabled. A user with a server-verified purchase can copy a confidential recovery code (the existing Stripe Checkout Session ID), enter it on another device, have the first-party server verify the active product entitlement, and regain access. A refunded/revoked/invalid session never unlocks Pro.

## Privacy issue and containment
The existing /billing/success.html embeds GA4 while its query string includes a Checkout Session ID used as a bearer-like entitlement secret. GA4 may collect full page_location. Remove GA4 from this page; add no-referrer policy and scrub session_id query with history.replaceState **immediately after reading it**, before any async verification. Restore page has no analytics/external embeds; avoid exposing recovery tokens in URL, logs or client error text.

## Changes
- `billing/success.html`: add a secure opt-in recovery code reveal/copy box **only after successful server entitlement validation**, localized EN/JA; no token in analytics; secret input not exposed in page until verified.
- `billing/restore.html`: accessible standalone EN/JA copy/paste restore form for CSV Tidy Pro. Submits to existing NicheWorksProEntitlement.activateFromSession; requires server active entitlement AND all CSV Tidy Pro feature IDs. Store verified token using existing helper; never persist fake/invalid/revoked input. Provide safe return to CSV Tidy.
- `billing/tests/restore-browser-acceptance.html` + scoped Chrome test workflow and test-only local entitlement fixture. Test no token leakage to external/URL and verified/fake/unavailable.
- Update `tools/csv-tidy/PRO-SPEC.md` with exact recovery caveat and status.
- An isolated plan (this file).

## Constraints
- No live Stripe credentials or billing activation; catalog remains status planning and product checkout.enabled=false.
- No new accounts, email provider or D1 schema/secret configuration.
- Treat recovery code like a password; possession conveys access. It is not the Stripe receipt or the purchase email. Lost code after a lost device requires a **separately implemented** support verification method; do not claim email-based account recovery exists.
- No CSV files or preset data transmitted, no purchase identifier in any analytics.
- Tested without network to real Stripe through a local-only QA entitlement fixture. Do not claim real Stripe checkout certified.
- No changes to CSV Tidy Free transform paths.

## Acceptance
- Success page without verification does NOT reveal the code.
- Success page after verified entitlement shows code and restore instructions; immediately scrubs sensitive query from address bar.
- Restore page rejects invalid/fake session and wrong-product attempts; a valid verified code stores session for CSV Tidy, not other products.
- On a freshly opened browser page in same device, Pro panel unlocks after restoration (mocked server entitlement in CI).
- Chrome and all existing repository CI PASS before merge.
