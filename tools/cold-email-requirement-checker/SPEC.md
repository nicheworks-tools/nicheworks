# Tool Specification — Cold Email Requirement Checker

- Slug: `cold-email-requirement-checker`
- Public URL: `https://nicheworks.app/tools/cold-email-requirement-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Review a cold-outreach or sales-email draft for structural completeness and risky wording before the user sends it, while keeping legal/compliance judgment outside the tool.

## Current functional contract

- Accept a pasted cold-email draft and evaluate implemented checklist dimensions such as greeting, self-introduction, recipient reference, contact reason, call to action, signature, and overly promotional wording.
- Present free checklist-style findings and missing/attention items.
- Allow Free review results to be copied.
- Provide Japanese and English UI on the same page plus separate short-guide and usage pages.
- Expose Pro-only structure score, improvement candidates, Draft A/B comparison, and Markdown review export when the shared NicheWorks Pro entitlement is active.
- Current legacy Pro requires both an active state and exact shared `nicheworks_pro` entitlement; missing or unrelated entitlement must not unlock the paid surface.
- Display explicit warnings that the tool does not guarantee legal compliance, consent requirements, opt-out wording, sender identity accuracy, deliverability, or reply rate.

## Inputs

- Pasted cold-email or sales-email subject and body text.
- UI language selection.
- Pro-only Draft B comparison text when exposed by the current add-on.
- Shared NicheWorks Pro entitlement state.

## Outputs

- Free checklist findings about the current draft.
- Free missing/attention indicators and structural guidance.
- Free copied review text.
- Pro-only score and improvement-candidate list.
- Pro-only Draft A/B comparison output.
- Pro-only Markdown review export.

## State and persistence

The Free draft-review workflow is current-page state and is not specified as durable history. UI language preference may use browser storage. Current live Pro entitlement remains the legacy shared NicheWorks Pro state until an authorized product-scoped migration occurs. Any explicit download/export is user-controlled.

## Paid-operation boundary

Current runtime evidence supports four product-scoped paid operations:

1. **Score** — reveal the current structure score.
2. **Suggestions** — reveal the current improvement-candidate list.
3. **Draft Compare** — compare Draft A with Pro Draft B.
4. **Markdown Export** — save the Pro review Markdown containing the selected drafts and stats.

The structural checklist, missing/attention indicators, presets, reset, and Free review copy remain Free.

## Product-scoped migration staging

`tools/cold-email-requirement-checker/product-scoped-controller.mjs` is a **non-live staging wrapper** over `assets/nw-product-scoped-controller.mjs`. It does not register or activate a real Cold Email product and does not replace the current public add-on.

The staged contract requires:

- explicit future `productId` with no default/fallback;
- complete and unique feature-ID mapping for all four paid operations;
- common server-backed `refreshProState({ productId })` verification through the shared controller core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, and refresh-failure states fail closed through the shared core.

The current legacy add-on is separately hardened to require exact `status.entitlement === "nicheworks_pro"` together with `status.active`. `NWPro.getLocalStatus()` always supplies an entitlement identifier, so missing entitlement is not accepted as implicit shared Pro. Historical shared Payment Link copy is migration evidence only and does not establish future product or pricing truth.

## Privacy and network behavior

Draft analysis runs in the browser and the pasted email subject/body is not intentionally uploaded by the checker workflow. The page may load suite-wide advertising, analytics, and shared Pro resources independently.

Product-scoped billing/entitlement requests may contain only fixed product/feature entitlement metadata. They must not contain subject text, Draft A body, Draft B body, names, companies, offers, contact details, URLs, checklist findings, score/suggestion content, comparison output, generated Markdown review text, or export filenames/payloads.

## Language mode

`bilingual single-page`

JP/EN controls switch the main tool UI; language-specific guide/usage pages support the same tool.

## Layout class

`mobile-oriented`

The primary task is a focused text-input → review-results flow designed to remain usable in a narrow single-column layout.

## Limits and non-goals

- This is not legal advice and does not determine whether an outreach message is lawful in a target jurisdiction.
- A high score or complete checklist does not mean the email should be sent.
- The tool does not send email, validate recipients, verify consent, or predict deliverability/reply rates.
- Product-scoped staging does not authorize product ID, price, Stripe Price ID, production feature namespace, or live checkout.

## Acceptance criteria

- [ ] A pasted draft produces checklist findings for the implemented structural and wording requirements.
- [ ] Empty/reset state does not fabricate a positive compliance result.
- [ ] Legal/compliance warnings remain visible in both JP and EN modes.
- [ ] Free checklist/review copy remains usable without Pro.
- [ ] Current Pro score/suggestions/comparison/Markdown actions require active exact shared `nicheworks_pro`.
- [ ] Missing or unrelated entitlement cannot unlock the current legacy Pro surface.
- [ ] Staged wrapper defines exactly four paid operations and delegates entitlement-state logic to the shared core.
- [ ] Staged wrapper contains no email draft/user content or legacy browser/payment authority.
- [ ] Public product-scoped runtime migration remains staged until authoritative commercial configuration is supplied.

## Implementation evidence

- `tools/cold-email-requirement-checker/index.html`
- `tools/cold-email-requirement-checker/app.js`
- `tools/cold-email-requirement-checker/pro-addon.js`
- `tools/cold-email-requirement-checker/product-scoped-controller.mjs`
- `scripts/check-cold-email-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave2.md`
- `tools/cold-email-requirement-checker/usage.html`
- `tools/cold-email-requirement-checker/howto/`
