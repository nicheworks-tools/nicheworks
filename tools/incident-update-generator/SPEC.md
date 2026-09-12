# Tool Specification — Incident Update Generator

- Slug: `incident-update-generator`
- Public URL: `https://nicheworks.app/tools/incident-update-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Canonical per-tool specification: `docs/tools/incident-update-generator.md`
- Monetization class: `PRO_BUNDLE`

## Purpose

Turn confirmed incident facts into draft customer, internal, and social-status updates while preserving human review for factual, legal, PR, security, SLA, and compensation decisions.

## Current functional contract

- Accept service name, incident status, tone, start/recovery time, impact, affected components, mitigation, next-update timing, duration, cause summary, and follow-up notes.
- Support Investigating, Identified, Monitoring, and Resolved status states plus Short, Standard, and Polite tone variants.
- Generate separate customer, internal, and social update drafts in the active language.
- Optionally mark missing optional facts as unconfirmed instead of inventing them.
- Free mode allows individual draft copy and selected-audience TXT download.
- The current legacy shared-Pro surface is one paid value boundary: the Incident Communication Pack. It contains the already-generated Free drafts plus Statuspage, Slack/Teams, support macro, public-review checklist, postmortem outline, GitHub incident ticket, and next-update draft material, delivered through full-pack copy and Markdown download.
- Current legacy Pro activation requires both `status.active === true` and exact entitlement `nicheworks_pro`; missing or unrelated entitlement state is not authoritative.
- Keep all generated text positioned as a draft requiring responsible-owner review before publication.

## Inputs

- Incident/service facts and status/tone selections.
- Selected download audience.
- Optional unconfirmed-field behavior.
- JP/EN UI selection.
- Current legacy shared NicheWorks Pro entitlement state.

## Outputs

- Customer-facing, internal, and social update drafts.
- Free clipboard copies and selected TXT download.
- Pro-only Incident Communication Pack as copyable/downloadable Markdown.

## State and persistence

Incident facts and generated outputs are current-page state. The current contract does not include persistent incident history or incident-management storage. Legacy shared Pro state is browser-local through the common NicheWorks mechanism and is migration-only authority, not the future server-verified purchase proof.

## Privacy and network behavior

Update generation runs in the browser and incident input is not intentionally uploaded by the generation workflow. Advertising, analytics, and shared Pro resources may load independently. Sensitive incident facts should still be minimized before entry.

Billing/entitlement migration must use fixed product/feature metadata only. Service names, incident facts, times, impact, components, mitigation, cause/follow-up content, generated audience drafts, communication-pack sections, export payloads, filenames, and personal/customer/vendor/security/legal/confidential details must not enter billing or entitlement requests.

## Product-scoped migration staging

`MONETIZATION_CLASSIFICATION_87.md` classifies `incident-update-generator` as an approved `PRO_BUNDLE` member. The future shared product authority is therefore `nicheworks.pro`; legacy `nicheworks_pro` is compatibility/migration state only.

`tools/incident-update-generator/product-scoped-controller.mjs` stages exactly one operation without changing the public paid runtime:

1. `communicationPack`

The staged wrapper requires an explicit configured product ID and complete unique feature map, delegates server verification to `assets/nw-product-scoped-controller.mjs`, and fails closed for wrong-product, local-only, unverified, incomplete mapping, or entitlement-refresh failure states.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved Incident Communication Pack feature mapping. The parameterized wrapper is a non-live migration/test adapter and does not imply a separate per-tool product.

No Incident-specific paid product, NicheWorks Pro price/currency, Stripe Product/Price, price-tier mapping, production feature namespace, restore/account policy, historical-purchaser treatment, or live/test rollout policy is authorized by this contract.

## Language mode

`bilingual single-page`

JP/EN controls switch the same incident-drafting interface and generated copy.

## Layout class

`mobile-oriented`

The core interaction is a structured incident-fact form followed by stacked audience-specific outputs and Pro review material.

## Limits and non-goals

- The tool does not verify incident facts, severity, root cause, security impact, or legal-reporting obligations.
- It does not automatically generate SLA credits, refund/compensation commitments, or legal-responsibility statements.
- It is not an incident-management system, status-page publisher, notification service, or postmortem database.
- Product-scoped staging does not launch billing or direct integrations with Statuspage, Slack, Teams, GitHub, or other external systems.

## Acceptance criteria

- [ ] Confirmed incident fields can generate distinct customer, internal, and social drafts for the selected status/tone.
- [ ] Missing optional information can be marked unconfirmed rather than silently fabricated when the option is enabled.
- [ ] Free copy/TXT actions remain usable without Pro while the Incident Communication Pack remains the only paid value boundary.
- [ ] Current legacy Pro requires both active state and exact `nicheworks_pro`; missing/unrelated entitlement state cannot unlock the pack.
- [ ] The staged product-scoped wrapper represents exactly `communicationPack` and fails closed unless server-verified state matches the configured product/feature.
- [ ] Canonical monetization classification is `PRO_BUNDLE`, and future live product authority is shared `nicheworks.pro` rather than a tool-specific product.
- [ ] Billing/entitlement traffic contains no incident facts or generated communication content.
- [ ] JP/EN modes retain the same fact fields and mandatory human-review warning.

## Implementation evidence

- `tools/incident-update-generator/index.html`
- `tools/incident-update-generator/app.js`
- `tools/incident-update-generator/pro-bridge.js`
- `tools/incident-update-generator/product-scoped-controller.mjs`
- `scripts/check-incident-update-generator-product-scoped-staging.mjs`
- `MONETIZATION_CLASSIFICATION_87.md`
- `docs/billing/pro-product-contracts-wave6.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
