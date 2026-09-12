# Tool Specification — Money Template Checker

- Slug: `money-template-checker`
- Public URL: `https://nicheworks.app/tools/money-template-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a simple JPY household-budget organization check from monthly income, spending totals, and a savings target.

## Current functional contract

- Require monthly net income and accept optional fixed-cost, variable-cost, and savings-target totals.
- Treat all monetary values as Japanese yen even when the UI is English.
- Calculate remaining balance and percentage-based reference checks when income is greater than zero.
- Surface reference warnings around fixed costs over 60%, variable costs over 50%, and savings targets over 30% of income.
- Skip percentage judgments when income is zero.
- Present missing spending-category prompts and a reusable budget template.
- Allow result copy plus Markdown and CSV template downloads.
- Switch JP/EN display language.

## Inputs

- Monthly net income, required.
- Fixed costs total, optional.
- Variable costs total, optional.
- Savings target, optional.
- JP/EN display language.

## Outputs

- Remaining-balance summary.
- Ratio/reference warnings and missing-category prompts.
- Copyable result text.
- Markdown and CSV budget-template downloads.

## State and persistence

Input amounts and generated results are not persisted. Only the display language is stored in localStorage as `nw_lang`.

## Privacy and network behavior

Budget calculations run in the browser. The entered amounts are not sent to a calculation backend. Advertising and analytics resources may load separately.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The primary interaction is four numeric fields followed by a single result and export actions.

## Limits and non-goals

- Currency is fixed to JPY; this is not a general currency-aware budget planner.
- The 60% / 50% / 30% thresholds are general reference heuristics, not individualized recommendations.
- The tool does not provide financial, investment, tax, debt, insurance, or life-planning advice.
- It does not connect to bank accounts, cards, or financial-data providers.
- A zero-income case can show arithmetic remaining balance but cannot produce meaningful expense ratios.

## Acceptance criteria

- [ ] All displayed/exported monetary amounts are treated as JPY in both languages.
- [ ] Input amounts and results are not written to localStorage; only `nw_lang` may persist.
- [ ] Percentage warnings are not presented as valid ratios when income is zero.
- [ ] Copy, Markdown download, and CSV download operate on the locally generated result/template.

## Implementation evidence

- `tools/money-template-checker/index.html`
- `tools/money-template-checker/app.js`
- `tools/money-template-checker/style.css`
