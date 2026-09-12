# Outsource Spec Generator — canonical tool specification

- **Slug:** `outsource-spec-generator`
- **Display name (JA):** 外注仕様書ジェネレーター
- **Display name (EN):** Outsource Spec Generator
- **Implementation:** `tools/outsource-spec-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** outsource, spec, request, business
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `outsource-spec-generator` implementation at `/tools/outsource-spec-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Draft an outsourcing specification from scope, deliverables, deadline, budget, acceptance method, revision rules, and related handoff details.

## 3. Inputs

- Work type and purpose.
- Deliverables/scope and out-of-scope work.
- Deadline, budget, delivery format, acceptance method/period, communication, and revision terms.
- JP/EN display language.
- Pro actions when the expected shared entitlement is active.

## 4. Processing behavior

- Require work type, deliverables/scope, deadline, budget, and acceptance method before producing a usable spec.
- Accept purpose, out-of-scope items, delivery format, acceptance period, communication method, revision-round details, and other handoff conditions.
- Free mode generates a lightweight outsourcing specification, acceptance criteria, and revision rules.
- Free output can be copied for review before purchase/contract work proceeds.
- Shared NicheWorks Pro adds the full outsource handoff pack, deliverable pack, acceptance checklist, vendor questions, Codex task, GitHub Issue format, Markdown save, and JSON export.
- Pro activates only for an active shared `nicheworks_pro` entitlement; another product-scoped active entitlement is not authoritative for this tool.
- Pro purchase uses the shared Stripe/NicheWorks Pro flow and is browser-bound after activation.
- Switch JP/EN UI on the same page.
- Generate all drafting logic locally in the browser.

## 5. Outputs

- Free lightweight specification.
- Free acceptance-criteria draft.
- Free revision-rule draft.
- Pro outsource handoff and implementation/vendor artifacts.
- Pro Markdown and JSON exports.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Invalid or unsupported input:** The implementation has no separate unsupported-input mode beyond its current controls and validation path; that observed path is canonical.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/outsource-spec-generator/app.js`, `tools/outsource-spec-generator/index.html`.

## 7. Privacy/data handling

Specification generation runs in the browser. Project names, company names, private URLs, and personal information are not sent to a drafting backend. Ads/analytics and the external Stripe/shared-Pro status flow may communicate independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The tool contains a long project-specification form, multiple outputs, and Pro handoff artifacts; desktop width is the primary working layout while responsive use remains possible.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The implemented `bilingual single-page` mode above is the canonical language behavior; repository HTML/JavaScript establishes the switching or page-separation mechanism.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/outsource-spec-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Required work type, deliverables, deadline, budget, and acceptance method are enforced before generation.
- [ ] Free mode remains able to generate the lightweight spec, acceptance criteria, and revision rules without Pro.
- [ ] Pro-only handoff, Codex/GitHub, Markdown, and JSON outputs require active shared `nicheworks_pro` and stay locked for unrelated product entitlements.
- [ ] Draft generation does not send user-entered outsourcing details to an AI/spec-generation backend.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/outsource-spec-generator/index.html`
- `tools/outsource-spec-generator/app.js`
- `tools/outsource-spec-generator/style.css`
