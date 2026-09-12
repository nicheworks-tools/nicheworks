# Tool Specification — Design Request Builder

- Slug: `design-request-builder`
- Public URL: `https://nicheworks.app/tools/design-request-builder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Turn structured design-project requirements into a reviewable production brief so clients and creators can clarify deliverables, schedule, budget, references, constraints, revisions, and handoff conditions before work starts.

## Current functional contract

- Collect required project type, purpose, deliverables, deadline, and budget.
- Collect recommended/optional information including size/specs, references/assets, must-have items, audience, tone, avoided expressions, constraints, delivery format, revision count, and contact.
- Display readiness/missing-field status before generation.
- Support short, standard, and detailed output tiers.
- Generate a design-request/production brief from the entered fields in the browser.
- Provide JP/EN UI and generated-copy/export actions implemented by the current tool.
- Keep copyright, asset permission, commercial-use scope, extra fees, and portfolio permission as matters for the parties to confirm rather than silently deciding them.

## Inputs

- Project type, purpose, deliverables, deadline, and budget.
- Optional/recommended size, references, assets, audience, tone, constraints, delivery format, revisions, contact, and other project notes.
- Output tier and UI language.

## Outputs

- Readiness/missing-field guidance.
- Structured design brief/request text in the selected level of detail.
- Current copy/download outputs provided by the implementation.

## State and persistence

The entered brief fields and generated result are current-page working state. The current contract does not promise persistent project history or cloud storage.

## Privacy and network behavior

Brief generation runs in the browser. The page may load advertising and analytics resources separately, so users are warned to mask confidential project names, internal URLs, private contacts, and unreleased asset locations.

## Language mode

`bilingual single-page`

JP/EN controls switch the same form and generated brief experience.

## Layout class

`mobile-oriented`

The tool is primarily a long structured form and output block that can be used as a single-column workflow on narrow screens.

## Limits and non-goals

- Generated text is a drafting aid, not a binding contract or automatic statement of work.
- The tool does not determine copyright ownership, licensing, extra-fee rules, or portfolio permission.
- Required/readiness checks confirm form completeness only, not whether the commercial terms are adequate.

## Acceptance criteria

- [ ] Missing required fields are surfaced before a complete-ready state is shown.
- [ ] Supplying required fields produces a brief whose level of detail follows the selected short/standard/detailed tier.
- [ ] Optional project constraints and delivery/revision information are preserved when included in the generated brief.
- [ ] JP/EN switching retains the same form requirements and contract/permission disclaimers.

## Implementation evidence

- `tools/design-request-builder/index.html`
- `tools/design-request-builder/app.js`
- `tools/design-request-builder/style.css`
