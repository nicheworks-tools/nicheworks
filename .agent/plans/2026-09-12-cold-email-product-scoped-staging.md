# ExecPlan — Cold Email Requirement Checker product-scoped staging

## Goal

Prepare Cold Email Requirement Checker for future product-scoped, server-verified entitlement migration while preserving the Free checker and tightening the current legacy shared-Pro entitlement isolation.

## Base

- Base main SHA: `3428deae25e6ce126ca9f47c4fbf2907a866e9fb`
- Branch: `feat/cold-email-product-scoped-staging-20260912`
- Shared controller core: `assets/nw-product-scoped-controller.mjs`
- Billing contract: `docs/billing/pro-product-contracts-wave2.md`

## Free contract to preserve

- pasted subject/body review;
- implemented structural checklist and missing/attention findings;
- Free review copy;
- presets, clear/reset, JA/EN UI;
- legal/compliance/deliverability disclaimers.

## Paid delta to stage

Current runtime supports four paid value boundaries:

1. `score` — reveal the current structure score.
2. `suggestions` — reveal the current improvement-candidate list.
3. `draftCompare` — compare Draft A and Pro Draft B.
4. `markdownExport` — export the Pro review Markdown.

## Legacy gate hardening

`NWPro.getLocalStatus()` always returns an entitlement identifier. Remove the Cold Email add-on fallback that substitutes `nicheworks_pro` when entitlement is missing. Current legacy Pro must require both `status.active === true` and exact `status.entitlement === 'nicheworks_pro'`.

## Privacy boundary

Email subject/body and comparison Draft B can contain names, companies, offers, URLs, contact details, and confidential sales context. Billing/entitlement traffic may contain fixed product/feature metadata only and must not contain any draft or generated review content.

## Scope

- Add a thin Cold Email wrapper over the shared product-scoped controller core.
- Require explicit future product ID and complete unique feature mapping for all four operations.
- Harden current legacy shared-Pro entitlement matching to exact entitlement.
- Add deterministic fail-closed/runtime/privacy regression checks and path-scoped CI.
- Update SPEC and Wave 2 billing contract.

## Non-goals

- Do not register a product or invent product ID/name/price/currency/billing model/price tier/Stripe Price env/production feature namespace/live-test policy.
- Do not connect the public runtime to the staged product-scoped wrapper yet.
- Do not change checklist/scoring/suggestion algorithms, presets, Markdown content, or disclaimers.
- Do not send draft content to billing/entitlement requests.
- Do not touch ManualFinder, affiliate, Amazon, or unrelated tools.

## Acceptance

- [x] Exactly four paid operations are represented once each.
- [x] Wrapper delegates entitlement state to the shared core.
- [x] Local-only, wrong-product, unverified and refresh-failure states fail closed.
- [x] Partial verified feature lists unlock only mapped operations.
- [x] Free checklist/review copy remains protected.
- [x] Legacy Cold Email gate requires exact `nicheworks_pro`; missing entitlement cannot unlock.
- [x] Billing privacy contract excludes subject/body/Draft B and generated review content.
- [x] Public product-scoped migration remains staged until commercial configuration is authorized.
- [x] No commercial values are invented.
