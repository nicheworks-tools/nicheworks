# Tool Specification — Growth Log Template Generator

- Slug: `growth-log-template-generator`
- Public URL: `https://nicheworks.app/tools/growth-log-template-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Turn KPI notes, hypotheses, learnings, and freeform notes into a structured growth-log draft for internal or public reporting, with privacy-oriented controls before publishing.

## Current functional contract

- Provide SEO, Product, Sales, and Content presets with preset-specific KPI fields.
- Accept hypothesis, learnings, and notes alongside the selected KPI inputs.
- Generate a structured growth log and rule-based next-action suggestions in the browser.
- Support optional number anonymization by replacing numeric values with `XXX`.
- Support optional bilingual JP+EN output.
- Provide example insertion/sample generation, clipboard copy, Markdown download, and TXT download.
- Warn users to review revenue, conversion, DAU/WAU, ad metrics, customer information, internal initiatives, and tentative KPIs before publishing.

## Inputs

- Preset selection and its KPI values.
- Hypothesis, learnings, and notes.
- Anonymization toggle and bilingual-output toggle.
- UI language selection.

## Outputs

- Structured growth-log draft.
- Rule-based next-action suggestions.
- Copied output and Markdown/TXT downloads.

## State and persistence

Inputs and generated log content are current-page state. The current contract does not include server-side storage or persistent growth-log history.

## Privacy and network behavior

Growth-log generation runs in the browser. Advertising and analytics resources may load separately. The anonymization option is only a simple numeric replacement aid and does not guarantee that a log is safe to publish.

## Language mode

`bilingual single-page`

The tool UI switches JP/EN in place and can additionally generate a bilingual output when requested.

## Layout class

`mobile-oriented`

The primary flow is a preset-driven input form followed by a generated text output and publishing caution block.

## Limits and non-goals

- Generated next actions are simple rule-based suggestions and are not business/analytics advice.
- Number anonymization does not remove names, internal strategy, identifiers, or all potentially sensitive context.
- The tool does not fetch analytics data automatically or validate whether KPI values are final/correct.

## Acceptance criteria

- [ ] Each supported preset renders its corresponding KPI inputs and can generate a structured log.
- [ ] Enabling number anonymization replaces numeric values according to the implemented behavior without claiming complete de-identification.
- [ ] Bilingual output, copy, Markdown, and TXT actions use the current generated draft.
- [ ] JP/EN modes preserve the publication/privacy warnings and the rule-based nature of next actions.

## Implementation evidence

- `tools/growth-log-template-generator/index.html`
- inline tool logic in `tools/growth-log-template-generator/index.html`
- `tools/growth-log-template-generator/style.css`
