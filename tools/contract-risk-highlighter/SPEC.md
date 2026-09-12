# Tool Specification — Contract Risk Highlighter

- Slug: `contract-risk-highlighter`
- Public URL: `https://nicheworks.app/tools/contract-risk-highlighter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Canonical per-tool specification: `docs/tools/contract-risk-highlighter.md`
- Monetization class: `PRO_BUNDLE`

## Purpose

Highlight implemented contract-clause risk patterns in pasted contract text and organize them into a preliminary review result, with optional Pro handoff material for human consultation and follow-up.

## Current functional contract

- Accept pasted contract text and a supported contract type such as services, NDA, or sales.
- Analyze text locally for implemented clause/risk patterns and display an overall risk badge, explanation, and findings.
- Free mode exposes up to three findings plus the Lite Markdown preview/copy path.
- The current legacy shared-Pro surface contains four paid value boundaries: full findings, the bundled Full Review Pack, Markdown download, and browser Print/Save PDF.
- The Full Review Pack includes Full Review Markdown, consultation memo, counterparty questions, missing-clause checklist, Next Action Memo, and the current copy controls for those artifacts.
- Current legacy Pro activation requires both `status.active === true` and exact entitlement `nicheworks_pro`; generic active-like fields are not sufficient.
- Pro-only actions are guarded at execution time as well as by visibility. Manually unhiding Pro controls while inactive must not execute Show All, Pro pack copy, Markdown download, or Print/Save PDF.
- When Pro is inactive, hidden Pro review-pack content is cleared after relevant interactions/status refresh and the visible findings list is forced back to the Free three-item cap even if a previous Pro session left Show All enabled internally.
- Provide example text, clear behavior, JP/EN UI, usage pages, and explicit legal/privacy disclaimers.

## Inputs

- Pasted contract text.
- Contract type selection.
- Analyze/clear/example actions.
- JP/EN mode selection.
- Current legacy shared NicheWorks Pro entitlement state.

## Outputs

- Overall risk badge/explanation and clause-pattern findings.
- Free Lite Markdown preview/copy output.
- Pro-only complete findings set.
- Pro-only bundled Full Review Pack: Full Review Markdown, consultation memo, counterparty questions, missing-clause checklist, and Next Action Memo.
- Pro-only Markdown download.
- Pro-only browser Print/Save PDF path.

## State and persistence

The current contract text and analysis result are page-session state. Legacy shared Pro state is browser-local through the common NicheWorks Pro mechanism and is migration-only authority, not the future server-verified purchase proof. Explicit downloads/printed PDFs are user-controlled outputs; contract history is not part of the current contract.

## Privacy and network behavior

Text analysis runs in the browser; pasted contract content is not intentionally uploaded by the analysis workflow. The page may load analytics, advertising, and shared Pro resources independently. Users are warned not to paste confidential or personal data unnecessarily.

Billing/entitlement migration must use fixed product/feature metadata only. Pasted contract text, clause snippets, findings, generated Markdown, consultation memos, counterparty questions, missing-clause/next-action content, filenames, print payloads, and personal/company/confidential details must not be sent through billing or entitlement requests.

## Product-scoped migration staging

`MONETIZATION_CLASSIFICATION_87.md` classifies `contract-risk-highlighter` as an approved `PRO_BUNDLE` member. The future shared product authority for this tool is therefore `nicheworks.pro`; legacy `nicheworks_pro` is compatibility/migration state only.

`tools/contract-risk-highlighter/product-scoped-controller.mjs` stages exactly four operations without changing the public paid runtime:

1. `fullFindings`
2. `fullReviewPack`
3. `markdownExport`
4. `printPdf`

The staged wrapper requires an explicit configured product ID parameter and complete unique feature map, delegates server verification to `assets/nw-product-scoped-controller.mjs`, and fails closed for wrong-product, local-only, unverified, incomplete/duplicate mapping, or entitlement-refresh failure states.

For live migration of this approved bundle member, the configured product ID must be `nicheworks.pro` plus the approved Contract Risk operation/feature mapping. The parameterized wrapper is a non-live test/migration adapter and does not imply a separate per-tool product.

No Contract-Risk-specific paid product, NicheWorks Pro price/currency, Stripe Product/Price, price-tier mapping, production feature namespace, historical-purchaser policy, or live/test policy is authorized by this staging contract.

## Language mode

`bilingual single-page`

The main tool switches JP/EN in place, with supporting usage pages for both languages.

## Layout class

`hybrid`

The paired input/result and review-pack areas benefit from desktop width while remaining stackable for narrow screens.

## Limits and non-goals

- The tool does not provide legal advice, determine enforceability, or guarantee the correctness of suggested review actions.
- Risk labels are heuristic review signals, not legal conclusions.
- The operative input contract is pasted contract text. Pro Print/Save PDF saves the generated result through the browser print path and is not direct contract-PDF analysis.
- Important agreements require qualified human review.
- Boundary/product-scoped staging does not launch the shared paid product or authorize Stripe commercial configuration.

## Acceptance criteria

- [ ] Analyzing supported sample/pasted text produces an overall result and clause-pattern findings without transmitting the contract to an application backend.
- [ ] Free mode exposes the overall result, at most three findings, and Lite Markdown preview/copy without paid entitlement.
- [ ] Exact legacy `nicheworks_pro` plus active state is required for current legacy Pro; generic active-like state alone does not unlock.
- [ ] Manually unhiding Pro controls while inactive cannot execute full findings, Pro pack copy, Markdown download, or Print/Save PDF.
- [ ] Inactive hidden Pro review-pack fields are cleared after relevant interactions/status refresh.
- [ ] A stale previous-Pro Show All state cannot leave more than three findings visible after entitlement becomes inactive.
- [ ] The staged product-scoped wrapper represents exactly four runtime-backed paid value boundaries and fails closed unless server-verified state matches the configured product/features.
- [ ] Canonical monetization classification is `PRO_BUNDLE`, and future live product authority is shared `nicheworks.pro`, not a Contract-Risk-specific product.
- [ ] Billing/entitlement traffic is contract-content-free.
- [ ] Pro review outputs are derived from the current analysis and Print/Save PDF uses the browser printing path rather than claiming direct contract-PDF analysis.
- [ ] JP/EN switching retains the legal disclaimer, privacy warning, and analysis controls.

## Implementation evidence

- `tools/contract-risk-highlighter/index.html`
- `tools/contract-risk-highlighter/app.js`
- `tools/contract-risk-highlighter/pro-bridge.js`
- `tools/contract-risk-highlighter/product-scoped-controller.mjs`
- `tools/contract-risk-highlighter/usage.html`
- `tools/contract-risk-highlighter/usage-en.html`
- `scripts/check-contract-risk-product-scoped-staging.mjs`
- `MONETIZATION_CLASSIFICATION_87.md`
- `docs/billing/pro-product-contracts-wave3.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
