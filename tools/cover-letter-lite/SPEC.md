# Tool Specification — Cover Letter Lite

- Slug: `cover-letter-lite`
- Public URL: `https://nicheworks.app/tools/cover-letter-lite/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Create an editable English cover-letter draft from structured role information using deterministic templates rather than an AI API.

## Current functional contract

- Accept applicant name, company, role/title, key skills, and optional experience summary.
- Support Formal/Neutral tone, Short/Medium length, and Formal/Modern/Entry-level/Direct/Skill-focused template styles.
- Generate an English draft locally from the selected template and entered fields.
- Show a word count and allow copy or TXT save of the generated draft.
- Keep the output explicitly positioned as an editable starting point that must be reviewed for the actual role/company.

## Inputs

- Applicant name, company, position, key skills, optional experience summary.
- Tone, length guide, and template style.

## Outputs

- English cover-letter draft.
- Word-count metadata.
- Clipboard copy and TXT download.

## State and persistence

Form fields and the generated draft are current-page state. The current implementation does not define saved draft history across reloads.

## Privacy and network behavior

Draft generation is template-based and runs in the browser; it does not call an AI API. The page still loads advertising and analytics resources, so users are warned not to enter sensitive personal or confidential employer information unnecessarily.

## Language mode

`English-only`

The current product intentionally focuses on English cover letters and does not provide a Japanese drafting UI.

## Layout class

`mobile-oriented`

The primary workflow is a vertical form followed by a generated draft and checklist and is naturally usable in a narrow single-column layout.

## Limits and non-goals

- The generated text is not hiring, immigration, legal, or career advice.
- It does not guarantee interviews or hiring outcomes.
- It does not inspect a job description automatically or generate text through an AI model.
- Users must replace generic wording and verify company/role details before sending.

## Acceptance criteria

- [ ] Supplying the required role details and submitting the form produces an editable English draft from the selected deterministic template.
- [ ] Tone, length, and template-style selections affect the generated draft without an AI API request.
- [ ] Copy and TXT save operate on the currently generated draft.
- [ ] The page remains explicitly English-only and retains the review/privacy warnings.

## Implementation evidence

- `tools/cover-letter-lite/index.html`
- `tools/cover-letter-lite/app.js`
- `tools/cover-letter-lite/style.css`
