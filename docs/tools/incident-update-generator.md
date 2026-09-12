# Incident Update Generator — canonical tool specification

- **Slug:** `incident-update-generator`
- **Display name (JA):** 障害報告文ジェネレーター
- **Display name (EN):** Incident Update Generator
- **Implementation:** `tools/incident-update-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** incident, status, ops, communication
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `incident-update-generator` implementation at `/tools/incident-update-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Turn confirmed incident facts into draft customer, internal, and social-status updates while preserving human review for factual, legal, PR, security, SLA, and compensation decisions.

## 3. Inputs

- Incident/service facts and status/tone selections.
- Selected download audience.
- Optional unconfirmed-field behavior.
- JP/EN UI selection and shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Accept service name, incident status, tone, start/recovery time, impact, affected components, mitigation, next-update timing, duration, cause summary, and follow-up notes.
- Support Investigating, Identified, Monitoring, and Resolved status states plus Short, Standard, and Polite tone variants.
- Generate separate customer, internal, and social update drafts in the active language.
- Optionally mark missing optional facts as unconfirmed instead of inventing them.
- Allow individual copy and selected-audience TXT download in free mode.
- With active NicheWorks Pro, generate a Markdown Incident Communication Pack covering Statuspage, Slack/Teams, support macro, public-review checklist, postmortem outline, and related review material.
- Keep all generated text positioned as a draft requiring responsible-owner review before publication.

## 5. Outputs

- Customer-facing, internal, and social update drafts.
- Clipboard copies and selected TXT download.
- Pro-only Incident Communication Pack as copyable/downloadable Markdown.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Invalid or unsupported input:** The implementation has no separate unsupported-input mode beyond its current controls and validation path; that observed path is canonical.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/incident-update-generator/app.js`, `tools/incident-update-generator/index.html`.

## 7. Privacy/data handling

Update generation runs in the browser and incident input is not intentionally uploaded by the generation workflow. Advertising, analytics, and shared Pro resources may load independently. Sensitive incident facts should still be minimized before entry.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The core interaction is a structured incident-fact form followed by stacked audience-specific outputs and Pro review material.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same incident-drafting interface and generated copy.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/incident-update-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Confirmed incident fields can generate distinct customer, internal, and social drafts for the selected status/tone.
- [ ] Missing optional information can be marked unconfirmed rather than silently fabricated when the option is enabled.
- [ ] Free copy/TXT actions remain usable without Pro while the Incident Communication Pack stays gated by shared entitlement.
- [ ] JP/EN modes retain the same fact fields and mandatory human-review warning.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/incident-update-generator/index.html`
- `tools/incident-update-generator/app.js`
- `tools/incident-update-generator/style.css`
