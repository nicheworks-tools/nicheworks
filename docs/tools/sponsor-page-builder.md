# Sponsor Page Builder — canonical tool specification

- **Slug:** `sponsor-page-builder`
- **Display name (JA):** スポンサー募集ページ作成
- **Display name (EN):** Sponsor Page Builder
- **Implementation:** `tools/sponsor-page-builder/`
- **Registry state:** active (registered implementation present)
- **Category:** sponsor, support, page, marketing
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

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

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/sponsor-page-builder/app.js`, `tools/sponsor-page-builder/index.html`.

## 7. Privacy/data handling

Draft generation is browser-local and does not send project details to a copy-generation service. Ads/analytics and external support links may communicate independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The page is a vertically stacked drafting form followed by a single-language visible output.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The implemented `bilingual single-page` mode above is the canonical language behavior; repository HTML/JavaScript establishes the switching or page-separation mechanism.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/sponsor-page-builder/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-absent`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Tier generation respects the selected tier count and does not fabricate exact prices for missing price inputs.
- [ ] Both JP and EN drafts derive from user-entered project/support facts rather than an external generation service.
- [ ] Copy and text-download actions use the current generated draft.
- [ ] Public copy retains warnings about rewards, refunds, logo/trademark use, invoices, and platform terms.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/sponsor-page-builder/index.html`
- `tools/sponsor-page-builder/app.js`
- `tools/sponsor-page-builder/style.css`
