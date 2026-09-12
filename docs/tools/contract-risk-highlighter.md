# Contract Risk Highlighter — canonical tool specification

- **Slug:** `contract-risk-highlighter`
- **Display name (JA):** 契約書リスクハイライト
- **Display name (EN):** Contract Risk Highlighter
- **Implementation:** `tools/contract-risk-highlighter/`
- **Registry state:** active (registered implementation present)
- **Category:** contract, risk, review, legal
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `contract-risk-highlighter` implementation at `/tools/contract-risk-highlighter/`. It does not authorize a production rewrite.

## 2. Purpose

Highlight implemented contract-clause risk patterns in pasted contract text and organize them into a preliminary review result, with optional Pro handoff material for human consultation and follow-up.

## 3. Inputs

- Pasted contract text.
- Contract type selection.
- Analyze/clear/example actions.
- JP/EN mode selection.
- Shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Accept pasted contract text and a supported contract type such as services, NDA, or sales.
- Analyze text for implemented clause/risk patterns and display an overall risk badge, explanation, and findings.
- Provide free Markdown preview/copy behavior for the current result.
- With active NicheWorks Pro, expose the full findings set and generate/download review artifacts including Full Review Markdown, consultation memo, counterparty questions, missing-clause checklist, Next Action Memo, Markdown download, and browser Print/Save PDF.
- Provide example text, clear behavior, JP/EN UI, usage pages, and explicit legal/privacy disclaimers.

## 5. Outputs

- Overall risk badge/explanation and clause-pattern findings.
- Free Markdown-oriented preview/copy output.
- Pro-only full review pack, consultation/questions/checklist/next-action outputs, Markdown download, and print-to-PDF path.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Text analysis runs in the browser; pasted contract content is not intentionally uploaded by the analysis workflow. The page may load analytics, advertising, and shared Pro resources independently. Users are warned not to paste confidential or personal data unnecessarily.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The paired input/result and review-pack areas benefit from desktop width while remaining stackable for narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

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

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **present**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Analyzing supported sample/pasted text produces an overall result and clause-pattern findings without transmitting the contract to an application backend.
- [ ] Free mode exposes the implemented limited review output while Pro-only full findings/artifacts remain gated by shared entitlement.
- [ ] Pro review outputs are derived from the current analysis and Print/Save PDF uses the browser printing path rather than claiming direct contract-PDF analysis.
- [ ] JP/EN switching retains the legal disclaimer, privacy warning, and analysis controls.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/contract-risk-highlighter/index.html`
- `tools/contract-risk-highlighter/app-complete.js`
- `tools/contract-risk-highlighter/app.js`
- `tools/contract-risk-highlighter/howto-en.html`
- `tools/contract-risk-highlighter/howto.html`
- `tools/contract-risk-highlighter/style.css`
- `tools/contract-risk-highlighter/usage-en.html`
- `tools/contract-risk-highlighter/usage.html`
