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
- Pro purchase currently uses the shared Stripe/NicheWorks Pro flow and is browser-bound after activation.
- Switch JP/EN UI on the same page.
- Generate all drafting logic locally in the browser.

## Inputs

- Work type and purpose.
- Deliverables/scope and out-of-scope work.
- Deadline, budget, delivery format, acceptance method/period, communication, and revision terms.
- Payment terms, rights/usage, portfolio permission, confidentiality notes, must-have conditions, and reference links when entered.
- JP/EN display language.
- Pro actions when the expected shared entitlement is active.

## Outputs

- Free lightweight specification.
- Free acceptance-criteria draft.
- Free revision-rule draft.
- Pro full outsource handoff pack.
- Pro deliverable pack, acceptance checklist, vendor questions, Codex task, and GitHub Issue draft.
- Pro Markdown and JSON exports.

## State and persistence

Form inputs and generated drafts are current-page state. Language preference may use local browser storage. Current live Pro entitlement remains the legacy shared NicheWorks Pro state until an authorized product-scoped migration occurs.

## Paid-operation boundary

Current runtime/SPEC evidence supports eight product-scoped paid operations:

1. **Full Handoff Pack** — generate/copy the full outsource handoff pack.
2. **Deliverable Pack** — generate the selected deliverable pack.
3. **Acceptance Checklist** — generate/copy the acceptance checklist.
4. **Vendor Questions** — generate/copy the vendor preflight question list.
5. **Codex Task** — generate/copy the Codex task draft.
6. **GitHub Issue** — generate/copy the GitHub Issue draft.
7. **Markdown Export** — save the full handoff pack as Markdown.
8. **JSON Export** — save the structured outsource handoff as JSON.

Generate/copy controls for the same artifact are the same paid value boundary, not separate entitlements. The current lightweight specification, acceptance criteria, revision rules, and Free copy action remain Free.

## Product-scoped migration staging

`tools/outsource-spec-generator/product-scoped-controller.mjs` is a **non-live staging wrapper** over `assets/nw-product-scoped-controller.mjs`. It does not register or activate a real Outsource Spec Generator product and does not replace the current public `pro-bridge.js`.

The staged contract requires:

- explicit future `productId` with no default/fallback;
- complete and unique feature-ID mapping for all eight paid operations;
- common server-backed `refreshProState({ productId })` verification through the shared controller core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, and refresh-failure states fail closed through the shared core.

The current legacy bridge's entitlement isolation must remain intact until live migration: an unrelated active product entitlement must not satisfy the current shared `nicheworks_pro` gate. Historical shared Payment Link and `$2.99` copy are migration evidence only and do not establish future product or pricing truth.

## Privacy and network behavior

Specification generation runs in the browser. Project names, company names, budgets, deadlines, private URLs, personal information, confidentiality notes, and other form details are not intentionally sent to a drafting backend. Ads/analytics and the external Stripe/shared-Pro status flow may communicate independently.

Product-scoped billing/entitlement requests may contain only fixed product/feature entitlement metadata. They must not contain form inputs, project/company names, budgets, private/reference URLs, deliverable/scope text, acceptance/revision/payment/rights/confidentiality details, generated Free/Pro drafts, Codex/GitHub content, or Markdown/JSON export payloads or filenames.

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
- A different product entitlement must not unlock this tool's current shared Pro actions.
- Product-scoped staging does not authorize product ID, price, Stripe Price ID, production feature namespace, or live checkout.

## Acceptance criteria

- [ ] Required work type, deliverables, deadline, budget, and acceptance method are enforced before generation.
- [ ] Free mode remains able to generate the lightweight spec, acceptance criteria, and revision rules without Pro.
- [ ] Free lightweight output remains copyable without Pro.
- [ ] Current Pro-only handoff, deliverable/checklist/questions, Codex/GitHub, Markdown, and JSON outputs require active shared `nicheworks_pro` and stay locked for unrelated product entitlements.
- [ ] Staged wrapper defines exactly eight paid operations and delegates entitlement-state logic to the shared core.
- [ ] Staged wrapper contains no user-entered project/form content or legacy browser/payment authority.
- [ ] Draft generation does not send user-entered outsourcing details to an AI/spec-generation backend.
- [ ] Public runtime remains on the current legacy gate until authoritative commercial configuration and explicit live migration are authorized.

## Implementation evidence

- `tools/outsource-spec-generator/index.html`
- `tools/outsource-spec-generator/app.js`
- `tools/outsource-spec-generator/pro-bridge.js`
- `tools/outsource-spec-generator/product-scoped-controller.mjs`
- `scripts/check-outsource-spec-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave2.md`
- `tools/outsource-spec-generator/style.css`
