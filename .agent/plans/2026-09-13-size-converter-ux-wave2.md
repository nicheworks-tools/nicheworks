# ExecPlan: Size Converter direct-answer UX wave

## Goal
Make the primary Size Converter workflow answer search-intent queries such as `US 4 -> JP` with fewer steps, while preserving the disabled-by-default Amazon insertion point.

## Scope
- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/style.css`
- `tools/size-converter/SPEC.md`
- this plan

## Changes
1. Replace the long size dropdown with a typeable size input plus datalist suggestions.
2. Accept prefixed input such as `US 4`, `EU 42`, and `JP 26.5` and switch the base system accordingly.
3. Keep the selected conversion row stable when changing the base system.
4. Show a concise source-to-target result sentence in addition to the three-system cards.
5. Add a one-click copy action for the current conversion result.
6. Keep full tables and measurement workflows secondary.
7. Do not add UK/kids data without a verified source contract.
8. Preserve the existing Amazon helper/config; CTA remains immediately after the quick result and hidden while disabled.

## Verification
- plain size input resolves an exact row;
- `US 4`, `EU 42`, and `JP 26.5` prefixes are parsed without sending data anywhere;
- invalid sizes show a local no-match state;
- switching JP/US/EU preserves the same row;
- Amazon remains hidden with current config;
- existing runtime/spec/SEO audits pass.
