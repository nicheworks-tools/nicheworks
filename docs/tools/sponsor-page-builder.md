# Sponsor Page Builder — canonical tool specification

- **Slug:** `sponsor-page-builder`
- **Display name (JA):** スポンサー募集ページ作成
- **Display name (EN):** Sponsor Page Builder
- **Implementation:** `tools/sponsor-page-builder/`
- **Registry state:** active (registered implementation present)
- **Category:** sponsor, support, page, marketing
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `sponsor-page-builder` implementation at `/tools/sponsor-page-builder/`. It does not authorize a production rewrite.

## 2. Purpose

Draft sponsor/support page copy for an OSS or independent project, including funding use, tier ideas, benefit boundaries, FAQ content, and pre-publication cautions.

## 3. Inputs

- Project/support narrative fields.
- Offered and unavailable benefits.
- Tier count and optional pricing ideas.
- Corporate support, contact, logo, and refund/cancellation policy settings.
- JP/EN display language.

## 4. Processing behavior

- Accept project name/summary, target supporters, reason for support, use of funds, offered/not-offered benefits, tier count, optional price ideas, corporate-support handling, contact method, logo policy, and refund/cancellation policy.
- Generate Japanese and English sponsor-page drafts from the entered details.
- Generate the requested number of tier suggestions and mark missing price ideas as needing adjustment rather than inventing exact prices.
- Include cautions around rewards, refunds, invoices, logo/trademark use, corporate handling, and sponsorship-platform terms.
- Allow the active-language draft to be copied and downloaded as text.
- Switch JP/EN UI.
- Generate locally in the browser without an AI copywriting backend.

## 5. Outputs

- Japanese sponsor/support page draft.
- English sponsor/support page draft.
- Tier ideas and FAQ/pre-publication checks.
- Clipboard copy and text download.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Draft generation is browser-local and does not send project details to a copy-generation service. Ads/analytics and external support links may communicate independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The page is a vertically stacked drafting form followed by a single-language visible output.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/sponsor-page-builder/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Tier generation respects the selected tier count and does not fabricate exact prices for missing price inputs.
- [ ] Both JP and EN drafts derive from user-entered project/support facts rather than an external generation service.
- [ ] Copy and text-download actions use the current generated draft.
- [ ] Public copy retains warnings about rewards, refunds, logo/trademark use, invoices, and platform terms.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/sponsor-page-builder/index.html`
- `tools/sponsor-page-builder/app.js`
- `tools/sponsor-page-builder/style.css`
