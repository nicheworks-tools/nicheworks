# Tool Specification — Cold Email Requirement Checker

- Slug: `cold-email-requirement-checker`
- Public URL: `https://nicheworks.app/tools/cold-email-requirement-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Review a cold-outreach or sales-email draft for structural completeness and risky wording before the user sends it, while keeping legal/compliance judgment outside the tool.

## Current functional contract

- Accept a pasted cold-email draft and evaluate implemented checklist dimensions such as greeting, self-introduction, recipient reference, contact reason, call to action, signature, and overly promotional wording.
- Present free checklist-style findings and missing/attention items.
- Provide Japanese and English UI on the same page plus separate short-guide and usage pages.
- Expose Pro-only scoring, improvement candidates, draft comparison, and Markdown-oriented output when the shared NicheWorks Pro entitlement is active.
- Display explicit warnings that the tool does not guarantee legal compliance, consent requirements, opt-out wording, sender identity accuracy, deliverability, or reply rate.

## Inputs

- Pasted cold-email or sales-email draft text.
- UI language selection.
- Pro-only comparison/input state where exposed by the current add-on.
- Shared NicheWorks Pro entitlement state.

## Outputs

- Checklist findings about the current draft.
- Missing/attention indicators and structural guidance.
- Pro-only score, improvement material, comparison output, and Markdown-oriented export/copy features.

## State and persistence

The free draft-review workflow is current-page state and is not specified as durable history. Shared Pro entitlement is handled by the common NicheWorks Pro mechanism. Any explicit download/export is user-controlled.

## Privacy and network behavior

Draft analysis runs in the browser and the pasted email body is not intentionally uploaded by the checker workflow. The page may load suite-wide advertising, analytics, and shared Pro resources independently.

## Language mode

`bilingual single-page`

JP/EN controls switch the main tool UI; language-specific guide/usage pages support the same tool.

## Layout class

`mobile-oriented`

The primary task is a focused text-input → review-results flow designed to remain usable in a narrow single-column layout.

## Limits and non-goals

- This is not legal advice and does not determine whether an outreach message is lawful in a target jurisdiction.
- A high score or complete checklist does not mean the email should be sent.
- The tool does not send email, validate recipients, verify consent, or predict deliverability/reply rates.

## Acceptance criteria

- [ ] A pasted draft produces checklist findings for the implemented structural and wording requirements.
- [ ] Empty/reset state does not fabricate a positive compliance result.
- [ ] Legal/compliance warnings remain visible in both JP and EN modes.
- [ ] Pro-only scoring/comparison/export actions remain gated by shared Pro state without disabling the free checker.

## Implementation evidence

- `tools/cold-email-requirement-checker/index.html`
- `tools/cold-email-requirement-checker/app.js`
- `tools/cold-email-requirement-checker/pro-addon.js`
- `tools/cold-email-requirement-checker/usage.html`
- `tools/cold-email-requirement-checker/howto/`
