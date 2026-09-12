# Tool Specification — Outsource Spec Generator

- Slug: `outsource-spec-generator`
- Public URL: `https://nicheworks.app/tools/outsource-spec-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Draft an outsourcing specification from scope, deliverables, deadline, budget, acceptance method, revision rules, and related handoff details.

## Current functional contract

- Require work type, deliverables/scope, deadline, budget, and acceptance method before producing a usable spec.
- Accept purpose, out-of-scope items, delivery format, acceptance period, communication method, revision-round details, and other handoff conditions.
- Free mode generates a lightweight outsourcing specification, acceptance criteria, and revision rules.
- Free output can be copied for review before purchase/contract work proceeds.
- Shared NicheWorks Pro adds the full outsource handoff pack, deliverable pack, acceptance checklist, vendor questions, Codex task, GitHub Issue format, Markdown save, and JSON export.
- Pro activates only for an active shared `nicheworks_pro` entitlement; another product-scoped active entitlement is not authoritative for this tool.
- Pro purchase uses the shared Stripe/NicheWorks Pro flow and is browser-bound after activation.
- Switch JP/EN UI on the same page.
- Generate all drafting logic locally in the browser.

## Inputs

- Work type and purpose.
- Deliverables/scope and out-of-scope work.
- Deadline, budget, delivery format, acceptance method/period, communication, and revision terms.
- JP/EN display language.
- Pro actions when the expected shared entitlement is active.

## Outputs

- Free lightweight specification.
- Free acceptance-criteria draft.
- Free revision-rule draft.
- Pro outsource handoff and implementation/vendor artifacts.
- Pro Markdown and JSON exports.

## State and persistence

Form inputs and generated drafts are current-page state. Shared NicheWorks Pro entitlement is handled through the common browser-bound Pro layer and may require reactivation on another browser/device or after site-data removal.

## Privacy and network behavior

Specification generation runs in the browser. Project names, company names, private URLs, and personal information are not sent to a drafting backend. Ads/analytics and the external Stripe/shared-Pro status flow may communicate independently.

## Language mode

`bilingual single-page`

## Layout class

`pc-oriented`

The tool contains a long project-specification form, multiple outputs, and Pro handoff artifacts; desktop width is the primary working layout while responsive use remains possible.

## Limits and non-goals

- The output is not a contract, purchase order, legal advice, acceptance agreement, or final payment term.
- It cannot establish ownership/IP, confidentiality, tax, employment/contractor, liability, or dispute terms.
- Generated acceptance criteria and revision rules require explicit agreement with the vendor.
- Pro artifacts are handoff drafts, not proof that a vendor or Codex task has been executed.
- A different product entitlement must not unlock this tool's shared Pro actions.

## Acceptance criteria

- [ ] Required work type, deliverables, deadline, budget, and acceptance method are enforced before generation.
- [ ] Free mode remains able to generate the lightweight spec, acceptance criteria, and revision rules without Pro.
- [ ] Pro-only handoff, Codex/GitHub, Markdown, and JSON outputs require active shared `nicheworks_pro` and stay locked for unrelated product entitlements.
- [ ] Draft generation does not send user-entered outsourcing details to an AI/spec-generation backend.

## Implementation evidence

- `tools/outsource-spec-generator/index.html`
- `tools/outsource-spec-generator/app.js`
- `tools/outsource-spec-generator/pro-bridge.js`
- `tools/outsource-spec-generator/style.css`
