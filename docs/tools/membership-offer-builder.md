# Membership Offer Builder — canonical tool specification

- **Slug:** `membership-offer-builder`
- **Display name (JA):** 会員向けオファー作成
- **Display name (EN):** Membership Offer Builder
- **Implementation:** `tools/membership-offer-builder/`
- **Registry state:** active (registered implementation present)
- **Category:** membership, offer, marketing, template
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `membership-offer-builder` implementation at `/tools/membership-offer-builder/`. It does not authorize a production rewrite.

## 2. Purpose

Turn membership/community assumptions into a draft offer that organizes target members, deliverables, frequency, pricing candidate, operating limits, cancellation/refund terms, onboarding, and retention ideas before launch.

## 3. Inputs

- Membership topic, audience, deliverables, frequency, time, price, plan count, exclusions, cancellation/refund, bonus, retention, community, and workload fields.
- JP/EN UI selection.

## 4. Processing behavior

- Accept theme/expertise, target members, deliverables, delivery frequency, available operating time, pricing candidate, number of plans, exclusions, cancellation/refund terms, first-month bonus, retention benefits, community presence, and workload limit.
- Generate an offer draft locally from the entered fields and support copying the current result.
- Include pre-launch reminders around recurring billing, cancellation/refunds, seller/legal notices, taxes, payment fees, platform terms, moderation, participation rules, and operating workload.
- Provide JP/EN UI.
- Treat pricing and retention suggestions as draft framing rather than market-validated recommendations.

## 5. Outputs

- Structured membership-offer draft and launch/review considerations.
- Clipboard copy of the generated offer.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Invalid or unsupported input:** The implementation has no separate unsupported-input mode beyond its current controls and validation path; that observed path is canonical.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/membership-offer-builder/app.js`, `tools/membership-offer-builder/index.html`.

## 7. Privacy/data handling

Offer generation runs in the browser and entered business/member information is not intentionally uploaded by the generation workflow. Advertising and analytics resources may load independently. Confidential member counts, revenue, customer information, and private content URLs should be omitted or masked when possible.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The experience is a long stacked form followed by a text output, suitable for narrow-screen use.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same offer-building workflow and warnings.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/membership-offer-builder/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Entered audience/deliverables/frequency/pricing/terms are represented in the generated membership draft.
- [ ] Copy uses the current generated offer and generation remains browser-local.
- [ ] The output keeps pricing/retention ideas framed as draft planning rather than verified business outcomes.
- [ ] JP/EN switching preserves the form and the recurring-billing/legal/platform review warnings.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/membership-offer-builder/index.html`
- `tools/membership-offer-builder/app.js`
- `tools/membership-offer-builder/style.css`
