# Money Template Checker — canonical tool specification

- **Slug:** `money-template-checker`
- **Display name (JA):** お金テンプレート確認
- **Display name (EN):** Money Template Checker
- **Implementation:** `tools/money-template-checker/`
- **Registry state:** active (registered implementation present)
- **Category:** money, template, check, finance
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `money-template-checker` implementation at `/tools/money-template-checker/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a simple JPY household-budget organization check from monthly income, spending totals, and a savings target.

## 3. Inputs

- Monthly net income, required.
- Fixed costs total, optional.
- Variable costs total, optional.
- Savings target, optional.
- JP/EN display language.

## 4. Processing behavior

- Require monthly net income and accept optional fixed-cost, variable-cost, and savings-target totals.
- Treat all monetary values as Japanese yen even when the UI is English.
- Calculate remaining balance and percentage-based reference checks when income is greater than zero.
- Surface reference warnings around fixed costs over 60%, variable costs over 50%, and savings targets over 30% of income.
- Skip percentage judgments when income is zero.
- Present missing spending-category prompts and a reusable budget template.
- Allow result copy plus Markdown and CSV template downloads.
- Switch JP/EN display language.

## 5. Outputs

- Remaining-balance summary.
- Ratio/reference warnings and missing-category prompts.
- Copyable result text.
- Markdown and CSV budget-template downloads.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Budget calculations run in the browser. The entered amounts are not sent to a calculation backend. Advertising and analytics resources may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary interaction is four numeric fields followed by a single result and export actions.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/money-template-checker/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] All displayed/exported monetary amounts are treated as JPY in both languages.
- [ ] Input amounts and results are not written to localStorage; only `nw_lang` may persist.
- [ ] Percentage warnings are not presented as valid ratios when income is zero.
- [ ] Copy, Markdown download, and CSV download operate on the locally generated result/template.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/money-template-checker/index.html`
- `tools/money-template-checker/app.js`
- `tools/money-template-checker/style.css`
