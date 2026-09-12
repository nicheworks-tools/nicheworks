# Tool Specification — Ops Weekly Report Generator

- Slug: `ops-weekly-report-generator`
- Public URL: `https://nicheworks.app/tools/ops-weekly-report-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Create a bilingual weekly operations-report draft from manually entered KPIs, changes, results, risks, open items, decisions, and next actions.

## Current functional contract

- Require a report period and at least one substantive report field before generation.
- Accept team/owner, KPI, changes, results/impact, wins, issues/risks, open items, next actions, next-week focus, and decisions needed.
- Generate Japanese and English weekly-report drafts from the same entered facts.
- Omit blank sections rather than fabricating missing content.
- Allow JP and EN report copy actions.
- Allow JP TXT, EN TXT, and Markdown downloads.
- Switch surrounding UI between JP and EN.
- Generate locally in the browser; no AI/report-generation API is used.

## Inputs

- Required report period.
- Optional team/owner.
- KPI and operational narrative fields.
- JP/EN display selection.

## Outputs

- Japanese weekly operations report draft.
- English weekly operations report draft.
- Clipboard copies.
- JP TXT, EN TXT, and Markdown files.

## State and persistence

Entered report data and generated output are current-page state and are not stored as report history by the tool. Shared language preference may persist in the browser.

## Privacy and network behavior

Report generation is browser-local. Entered KPIs, revenue notes, customer references, or internal initiatives are not sent to a generation backend. Advertising and analytics resources may load separately.

## Language mode

`bilingual single-page`

The page exposes JP/EN UI while generating both-language report drafts from the entered source facts.

## Layout class

`mobile-oriented`

The workflow is a vertically stacked report form followed by text outputs and export actions.

## Limits and non-goals

- Output is a draft, not verified operational truth.
- It does not verify KPI accuracy, distinguish confirmed/provisional numbers automatically, or resolve open issues.
- English wording is template-based and requires review for terminology, proper nouns, and internal language.
- The tool does not connect to analytics, finance, CRM, ticketing, or project-management systems.
- Confidential or personal information should be masked before entry.

## Acceptance criteria

- [ ] Generation is blocked or warned when the report period is missing or no substantive report field is supplied.
- [ ] Blank optional sections are omitted instead of being populated with invented facts.
- [ ] Both JP and EN report drafts can be copied or downloaded from the same entered source data.
- [ ] Entered operational data is not sent to an AI/report-generation backend.

## Implementation evidence

- `tools/ops-weekly-report-generator/index.html`
- `tools/ops-weekly-report-generator/app.js`
- `tools/ops-weekly-report-generator/style.css`
