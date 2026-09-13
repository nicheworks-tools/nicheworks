# Contract Risk Highlighter — canonical tool specification

- **Slug:** `contract-risk-highlighter`
- **Display name (JA):** 契約書リスクハイライト
- **Display name (EN):** Contract Risk Highlighter
- **Implementation:** `tools/contract-risk-highlighter/`
- **Registry state:** active (registered implementation present)
- **Category:** contract, risk, review, legal
- **Common specification:** `common-spec/spec-ja.md`
- **Monetization class:** `PRO_BUNDLE`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `contract-risk-highlighter` implementation at `/tools/contract-risk-highlighter/`. It does not authorize a production rewrite or live billing launch.

## 2. Purpose

Highlight implemented contract-clause risk patterns in pasted contract text and organize them into a preliminary review result, with optional Pro handoff material for human consultation and follow-up.

## 3. Inputs

- Pasted contract text.
- Contract type selection.
- Analyze/clear/example actions.
- JP/EN mode selection.
- Current legacy shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Accept pasted contract text and a supported contract type such as services, NDA, or sales.
- Analyze text locally for implemented clause/risk patterns and display an overall risk badge, explanation, and findings.
- Free mode exposes up to three findings and the Lite Markdown preview/copy path.
- The current legacy shared-Pro surface has four paid value boundaries: full findings, the bundled Full Review Pack, Markdown download, and browser Print/Save PDF.
- The Full Review Pack includes Full Review Markdown, consultation memo, counterparty questions, missing-clause checklist, Next Action Memo, and the current copy controls for those artifacts.
- Current legacy Pro activation requires both `status.active === true` and exact entitlement `nicheworks_pro`; generic active-like fields are not authoritative.
- Paid controls are guarded at execution time as well as by visibility. Manually unhiding current Pro controls while inactive must not execute Show All, Pro pack copy, Markdown download, or Print/Save PDF.
- When Pro is inactive, hidden Pro review-pack fields are cleared after relevant interactions/status refresh. The visible findings list is also forced back to the Free three-item cap if a previous Pro session left Show All enabled internally.
- Provide example text, clear behavior, JP/EN UI, usage pages, and explicit legal/privacy disclaimers.

## 5. Outputs

- Overall risk badge/explanation and clause-pattern findings.
- Free Lite Markdown preview/copy output.
- Pro-only complete findings set.
- Pro-only bundled Full Review Pack: Full Review Markdown, consultation memo, counterparty questions, missing-clause checklist, and Next Action Memo.
- Pro-only Markdown download.
- Pro-only browser print-to-PDF path.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics, advertising, and entitlement resources are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Paid-action failure/absence:** Inactive or non-matching legacy entitlement state leaves the Free checker usable and blocks current Pro-only actions rather than treating UI visibility as authority.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/contract-risk-highlighter/app-complete.js`, `tools/contract-risk-highlighter/app.js`, `tools/contract-risk-highlighter/pro-bridge.js`, `tools/contract-risk-highlighter/index.html`.

## 7. Privacy/data handling

Text analysis runs in the browser; pasted contract content is not intentionally uploaded by the analysis workflow. The page may load analytics, advertising, and shared Pro resources independently. Users are warned not to paste confidential or personal data unnecessarily.

Current persistence evidence: `localStorage`. Network-capable application code for contract analysis: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

Product-scoped billing/entitlement migration may contain fixed product/feature metadata only. It must not include pasted contract text, clause snippets, findings, generated Markdown, consultation memo, counterparty questions, missing-clause/next-action content, filenames, print payloads, or extracted personal/company/confidential details.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The paired input/result and review-pack areas benefit from desktop width while remaining stackable for narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The main tool switches JP/EN in place, with supporting usage pages for both languages.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/contract-risk-highlighter/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/contract-risk-highlighter/usage-en.html`, `tools/contract-risk-highlighter/usage.html`.
- **FAQ:** `recommended-and-present`.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Analyzing supported sample/pasted text produces an overall result and clause-pattern findings without transmitting the contract to an application backend.
- [ ] Free mode exposes the overall result, at most three findings, and Lite Markdown preview/copy while the complete findings/artifacts remain paid.
- [ ] Current legacy Pro requires both active state and exact `nicheworks_pro`; generic active-like fields alone cannot unlock it.
- [ ] Manually unhiding paid controls while inactive cannot execute Show All, Pro pack copy, Markdown download, or Print/Save PDF.
- [ ] Inactive hidden Pro review-pack fields are cleared after relevant interactions/status refresh.
- [ ] A stale previous-Pro Show All state cannot leave more than three findings visible after entitlement becomes inactive.
- [ ] Product-scoped staging fails closed unless server-verified entitlement state matches the configured product and operation features.
- [ ] Canonical monetization classification is `PRO_BUNDLE`, and future live product authority is `nicheworks.pro` rather than a tool-specific paid product.
- [ ] Billing/entitlement traffic is contract-content-free.
- [ ] Pro review outputs are derived from the current analysis and Print/Save PDF uses the browser printing path rather than claiming direct contract-PDF analysis.
- [ ] JP/EN switching retains the legal disclaimer, privacy warning, and analysis controls.

Automated regression/source-contract evidence: `scripts/check-tool-runtime-contracts.mjs` and `scripts/check-contract-risk-product-scoped-staging.mjs`. The dedicated staging check validates entitlement isolation, operation mapping, source-level Free/Pro boundaries, bundle classification/authority, and hardening invariants; it is not represented as a full browser E2E test. Browser behavior-level status remains **behavior-test-missing** until an actual browser-level scenario test is added.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.
- Direct PDF contract-text extraction is not part of the current operative input contract; Print/Save PDF refers to browser printing of the generated result.

### Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `contract-risk-highlighter` as an approved `PRO_BUNDLE` member. Its future paid product authority is therefore the shared `nicheworks.pro` product; legacy `nicheworks_pro` remains compatibility/migration state only.

Current Free behavior is fixed: local analysis, overall result, up to three findings, and Lite Markdown preview/copy remain available without paid entitlement.

The exact additive paid value boundaries are:

1. `fullFindings`
2. `fullReviewPack`
3. `markdownExport`
4. `printPdf`

The public runtime remains on the legacy shared-Pro mechanism until the shared bundle is commercially configured and this migration wave is authorized. `tools/contract-risk-highlighter/product-scoped-controller.mjs` is staging only and delegates future server verification to `assets/nw-product-scoped-controller.mjs`.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved Contract Risk operation/feature mapping. No Contract-Risk-specific paid product is created by this contract.

The NicheWorks Pro price/currency, Stripe Product/Price, price-tier mapping, production Contract Risk feature namespace, historical-purchaser treatment, and live/test rollout policy remain unresolved. Detailed staging requirements are in `docs/billing/pro-product-contracts-wave3.md`; shared-bundle authority is in `docs/billing/nicheworks-pro-bundle-contract.md`.

### Implementation evidence

- `tools/contract-risk-highlighter/index.html`
- `tools/contract-risk-highlighter/app-complete.js`
- `tools/contract-risk-highlighter/app.js`
- `tools/contract-risk-highlighter/pro-bridge.js`
- `tools/contract-risk-highlighter/product-scoped-controller.mjs`
- `tools/contract-risk-highlighter/howto-en.html`
- `tools/contract-risk-highlighter/howto.html`
- `tools/contract-risk-highlighter/style.css`
- `tools/contract-risk-highlighter/usage-en.html`
- `tools/contract-risk-highlighter/usage.html`
- `scripts/check-contract-risk-product-scoped-staging.mjs`
- `MONETIZATION_CLASSIFICATION_87.md`
- `docs/billing/pro-product-contracts-wave3.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
