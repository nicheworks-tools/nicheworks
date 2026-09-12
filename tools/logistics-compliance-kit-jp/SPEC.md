# Tool Specification — Logistics Compliance Kit JP

- Slug: `logistics-compliance-kit-jp`
- Public URL: `https://nicheworks.app/tools/logistics-compliance-kit-jp/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Help Japanese shippers organize logistics-efficiency conditions such as waiting time, delivery-window constraints, visibility gaps, outsourcing, and congestion into a practical review level, next actions, and planning draft without presenting the result as a legal/compliance determination.

## Current functional contract

- Collect the implemented logistics-efficiency conditions and generate a simple review/priority level with supporting signals.
- Generate next-action guidance and a medium/long-term improvement-plan draft.
- Preserve a freeform current-state memo in output without using that memo as an input to the scoring/decision logic.
- Provide free on-screen result, evidence signals, next actions, planning draft, current-state memo, and Markdown preview.
- With the current live legacy NicheWorks Pro gate active, unlock the implemented Markdown save, internal-share memo, contractor/vendor confirmation memo, improvement plan, GitHub Issue draft, Codex task, handoff Markdown, and JSON export.
- Keep official/regulatory/legal interpretation outside the tool and point users to government, legal, logistics, and internal responsible teams.

## Inputs

- Implemented shipper/logistics condition fields rendered by the application.
- Optional current-state memo.
- Current live legacy shared NicheWorks Pro state for the existing paid operations.

## Outputs

- Review/priority level and supporting signals.
- Next actions and medium/long-term planning draft.
- Current-state memo in the generated output.
- Free Markdown preview and Pro-only operational/export artifacts.

## State and persistence

Current inputs and generated result are page-session state unless the implementation explicitly exposes user-controlled exports. The current public page still uses the legacy shared Pro bridge. The current contract does not define cloud storage of logistics assessments.

## Paid-operation boundary

The current runtime implements exactly these eight paid operations:

1. internal-share memo copy;
2. contractor/vendor confirmation memo copy;
3. improvement-plan copy;
4. GitHub Issue draft copy;
5. Codex task copy;
6. handoff Markdown export;
7. JSON export;
8. Markdown save.

The assessment itself, supporting signals, next actions, planning draft, current-state memo, and on-screen Markdown preview remain Free.

## Product-scoped migration staging

`tools/logistics-compliance-kit-jp/product-scoped-controller.mjs` is a **non-live staging module** for the future migration away from the legacy shared `nicheworks_pro` authority.

The staged controller:

- requires an explicit future `productId`; it has no default product;
- requires an explicit feature ID mapping for all eight paid operations;
- calls the common server-backed entitlement client through `refreshProState({ productId })`;
- treats entitlement as active only when the returned state matches the requested product and reports `active: true`, `source: "server"`, and `reason: "verified_entitlement"`;
- enables only operations whose mapped feature IDs are present in the server-returned feature list;
- rejects wrong-product, local-only, unverified, missing-map, duplicate-map, and failed-refresh states;
- does not read localStorage, `NWPro.getLocalStatus()`, a shared Payment Link, assessment data, or memo content.

This staged controller is **not loaded by the current public page** and does not replace `pro-bridge.js` yet. Product ID, product display name, price, currency, billing model, price tier, Stripe Price environment mapping, and test/live enablement remain unresolved until explicitly authorized.

When product-scoped migration eventually goes live, the JSON export must also stop emitting the legacy `nicheworks_pro` entitlement marker and use the authorized product-scoped contract instead.

## Privacy and network behavior

Assessment/draft generation runs in the browser and the entered logistics information is not intentionally uploaded by that workflow. Advertising, analytics, and current shared Pro resources may load separately.

The staged product-scoped controller handles fixed entitlement metadata only. It must not add assessment answers, memo content, generated Markdown, handoff text, filenames, or other user-entered/generated content to billing or entitlement requests.

## Language mode

`Japanese-only`

The tool is scoped to Japanese logistics/business context and the current public UI is Japanese-only.

## Layout class

`hybrid`

The experience is document/form oriented and usable on narrow screens, while detailed output and Pro handoff material benefit from wider layouts.

## Limits and non-goals

- The result is not a legal-compliance, shipper-liability, administrative-filing, or contract-obligation determination.
- Generated material is not an official government submission document.
- The freeform current-state memo is recorded in output but does not affect the implemented decision logic.
- Users must verify制度・法令・契約 requirements against official sources and responsible specialists.
- The staging module does not authorize a Logistics product, price, Stripe Price, or live checkout.

## Acceptance criteria

- [ ] Entered implemented logistics conditions produce the current review level/signals, next actions, and planning draft locally.
- [ ] The current-state memo appears in output but does not alter the scoring/decision result.
- [ ] Free result/Markdown preview remains available without Pro while operational handoff/export artifacts stay gated.
- [ ] The page remains Japanese-only and clearly states that the result is not a legal or administrative determination.
- [ ] The staged product-scoped controller represents all eight paid operations exactly once and fails closed without authoritative server verification.
- [ ] The staged controller remains disconnected from the public runtime until commercial configuration and migration are explicitly authorized.

## Implementation evidence

- `tools/logistics-compliance-kit-jp/index.html`
- `tools/logistics-compliance-kit-jp/app.js`
- `tools/logistics-compliance-kit-jp/pro-bridge.js` — current live legacy shared gate.
- `tools/logistics-compliance-kit-jp/product-scoped-controller.mjs` — staged, non-live product-scoped controller.
- `tools/logistics-compliance-kit-jp/usage.html`
- `scripts/check-logistics-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave1.md`
