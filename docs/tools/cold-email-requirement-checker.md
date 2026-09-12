# Cold Email Requirement Checker — canonical tool specification

- **Slug:** `cold-email-requirement-checker`
- **Display name (JA):** コールドメール要件チェッカー
- **Display name (EN):** Cold Email Requirement Checker
- **Implementation:** `tools/cold-email-requirement-checker/`
- **Registry state:** active (registered implementation present)
- **Category:** email, compliance, sales, check
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `cold-email-requirement-checker` implementation at `/tools/cold-email-requirement-checker/`. It does not authorize a production rewrite.

## 2. Purpose

Review a cold-outreach or sales-email draft for structural completeness and risky wording before the user sends it, while keeping legal/compliance judgment outside the tool.

## 3. Inputs

- Pasted cold-email or sales-email draft text.
- UI language selection.
- Pro-only comparison/input state where exposed by the current add-on.
- Shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Accept a pasted cold-email draft and evaluate implemented checklist dimensions such as greeting, self-introduction, recipient reference, contact reason, call to action, signature, and overly promotional wording.
- Present free checklist-style findings and missing/attention items.
- Provide Japanese and English UI on the same page plus separate short-guide and usage pages.
- Expose Pro-only scoring, improvement candidates, draft comparison, and Markdown-oriented output when the shared NicheWorks Pro entitlement is active.
- Display explicit warnings that the tool does not guarantee legal compliance, consent requirements, opt-out wording, sender identity accuracy, deliverability, or reply rate.

## 5. Outputs

- Checklist findings about the current draft.
- Missing/attention indicators and structural guidance.
- Pro-only score, improvement material, comparison output, and Markdown-oriented export/copy features.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- [ ] Empty/reset state does not fabricate a positive compliance result.

## 7. Privacy/data handling

Draft analysis runs in the browser and the pasted email body is not intentionally uploaded by the checker workflow. The page may load suite-wide advertising, analytics, and shared Pro resources independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`, `buy.stripe.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary task is a focused text-input → review-results flow designed to remain usable in a narrow single-column layout.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the main tool UI; language-specific guide/usage pages support the same tool.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/cold-email-requirement-checker/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **present**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] A pasted draft produces checklist findings for the implemented structural and wording requirements.
- [ ] Empty/reset state does not fabricate a positive compliance result.
- [ ] Legal/compliance warnings remain visible in both JP and EN modes.
- [ ] Pro-only scoring/comparison/export actions remain gated by shared Pro state without disabling the free checker.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/cold-email-requirement-checker/index.html`
- `tools/cold-email-requirement-checker/app.js`
- `tools/cold-email-requirement-checker/style.css`
- `tools/cold-email-requirement-checker/usage-en.html`
- `tools/cold-email-requirement-checker/usage.html`
