# Incident Update Generator — canonical tool specification

- **Slug:** `incident-update-generator`
- **Display name (JA):** 障害報告文ジェネレーター
- **Display name (EN):** Incident Update Generator
- **Implementation:** `tools/incident-update-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** incident, status, ops, communication
- **Common specification:** `common-spec/spec-ja.md`
- **Monetization class:** `PRO_BUNDLE`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `incident-update-generator` implementation at `/tools/incident-update-generator/`. It does not authorize a production rewrite or live billing launch.

## 2. Purpose

Turn confirmed incident facts into draft customer, internal, and social-status updates while preserving human review for factual, legal, PR, security, SLA, and compensation decisions.

## 3. Inputs

- Incident/service facts and status/tone selections.
- Selected download audience.
- Optional unconfirmed-field behavior.
- JP/EN UI selection.
- Current legacy shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Accept service name, incident status, tone, start/recovery time, impact, affected components, mitigation, next-update timing, duration, cause summary, and follow-up notes.
- Support Investigating, Identified, Monitoring, and Resolved status states plus Short, Standard, and Polite tone variants.
- Generate separate customer, internal, and social update drafts in the active language.
- Optionally mark missing optional facts as unconfirmed instead of inventing them.
- Free mode allows individual draft copy and selected-audience TXT download.
- The current legacy shared-Pro surface is one paid value boundary: the Incident Communication Pack. It includes the already-generated Free drafts plus Statuspage, Slack/Teams, support macro, public-review checklist, postmortem outline, GitHub incident ticket, and next-update draft material, delivered through full-pack copy and Markdown download.
- Current legacy activation requires both `status.active === true` and exact entitlement `nicheworks_pro`; missing or unrelated entitlement state is not authoritative.
- Keep every generated artifact positioned as a draft requiring responsible-owner review before publication.

## 5. Outputs

- Customer-facing, internal, and social update drafts.
- Free clipboard copies and selected TXT download.
- Pro-only Incident Communication Pack as copyable/downloadable Markdown.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** Implemented required-field validation blocks generation and surfaces the existing visible form/toast feedback.
- **Invalid or unsupported input:** The implementation has no separate unsupported-input mode beyond current controls and validation; that observed path is canonical.
- **External/network failure:** Not applicable to the core local generation path; suite analytics, advertising, and entitlement resources are not result fallbacks.
- **Copy/download failure:** Clipboard rejection follows the implemented fallback/feedback path. Download creation is offered only from the current generated result; failure is not represented as successful export.
- **Paid-action failure/absence:** Inactive or non-matching legacy entitlement state leaves the full Free drafting/copy/TXT workflow usable and keeps the Communication Pack unavailable.
- **Safe fallback/reset:** The current generated state is invalidated when inputs change so stale drafts are not silently treated as current facts.
- **Runtime evidence inspected:** `tools/incident-update-generator/app.js`, `tools/incident-update-generator/pro-bridge.js`, `tools/incident-update-generator/index.html`.

## 7. Privacy/data handling

Update generation runs in the browser and incident input is not intentionally uploaded by the generation workflow. Advertising, analytics, and shared Pro resources may load independently. Sensitive incident facts should still be minimized before entry.

Current persistence evidence: `localStorage` for language/shared site state; the tool contract does not include persistent incident history. Network-capable application code for incident generation: **not found**; non-suite hosts observed include the historical Stripe Payment Link and support links.

Product-scoped billing/entitlement migration may contain fixed product/feature metadata only. It must not include service names, incident facts, impact/components/mitigation/timing/cause/follow-up text, customer/internal/social drafts, Communication Pack sections, filenames, export payloads, or extracted personal/customer/vendor/security/legal/SLA/compensation/confidential details.

## 8. Responsive contract

- **Layout class:** `mobile-oriented`.
- The core interaction is a structured incident-fact form followed by stacked audience-specific outputs and Pro review material.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same incident-drafting interface and generated copy.
- Existing languages must not be removed.

## 10. SEO contract

The main public page must meet common-spec section 9-3: tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/incident-update-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `optional-absent`. No current usage page is implementation evidence.
- **FAQ:** `optional-present`.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any future usage link must remain a subdued text link separated from advertising per common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Confirmed incident fields can generate distinct customer, internal, and social drafts for the selected status/tone.
- [ ] Missing optional information can be marked unconfirmed rather than silently fabricated when the option is enabled.
- [ ] Free copy/TXT actions remain usable without Pro while the Incident Communication Pack remains the only paid value boundary.
- [ ] Current legacy Pro requires both active state and exact `nicheworks_pro`; missing/unrelated entitlement state cannot unlock the pack.
- [ ] Product-scoped staging fails closed unless server-verified entitlement state matches the configured product and the mapped `communicationPack` feature.
- [ ] Canonical monetization classification is `PRO_BUNDLE`, and future live product authority is `nicheworks.pro` rather than a tool-specific paid product.
- [ ] Billing/entitlement traffic contains no incident facts or generated communication content.
- [ ] JP/EN modes retain the same fact fields and mandatory human-review warning.

Automated regression/source-contract evidence: `scripts/check-tool-runtime-contracts.mjs` and `scripts/check-incident-update-generator-product-scoped-staging.mjs`. The dedicated staging check is not represented as a full browser E2E test. Browser behavior-level status remains **behavior-test-missing** until an actual browser scenario test is added.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.
- Direct publishing to Statuspage, Slack/Teams, GitHub, or other incident systems is outside the current contract; the pack only generates local draft text.

### Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `incident-update-generator` as an approved `PRO_BUNDLE` member. Its future paid product authority is therefore the shared `nicheworks.pro` product; legacy `nicheworks_pro` remains compatibility/migration state only.

Current Free behavior is fixed: incident fact/status/tone input, customer/internal/social draft generation, optional unconfirmed wording, individual copy, and selected-audience TXT download remain available without paid entitlement.

The exact additive paid value boundary is:

1. `communicationPack` — the complete Incident Communication Pack, including Statuspage, Slack/Teams, support macro, public-review checklist, postmortem outline, GitHub incident ticket, next-update draft, the generated Free drafts, and full-pack copy/Markdown save delivery.

Copy and Markdown download are delivery actions for the same generated pack, not separate commercial entitlements.

The public runtime remains on the hardened legacy shared-Pro mechanism until the shared bundle is commercially configured and this migration wave is authorized. `tools/incident-update-generator/product-scoped-controller.mjs` is staging only and delegates future server verification to `assets/nw-product-scoped-controller.mjs`.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved Incident Communication Pack feature mapping. No Incident-specific paid product is created by this contract.

The NicheWorks Pro price/currency, Stripe Product/Price, price-tier mapping, production feature ID, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved. Detailed staging requirements are in `docs/billing/pro-product-contracts-wave6.md`; shared-bundle authority is in `docs/billing/nicheworks-pro-bundle-contract.md`.

### Implementation evidence

- `tools/incident-update-generator/index.html`
- `tools/incident-update-generator/app.js`
- `tools/incident-update-generator/pro-bridge.js`
- `tools/incident-update-generator/product-scoped-controller.mjs`
- `scripts/check-incident-update-generator-product-scoped-staging.mjs`
- `MONETIZATION_CLASSIFICATION_87.md`
- `docs/billing/pro-product-contracts-wave6.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
