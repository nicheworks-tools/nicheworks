# Tool Specification — Cover Letter Lite

- Slug: `cover-letter-lite`
- Public URL: `https://nicheworks.app/tools/cover-letter-lite/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Create an editable English cover-letter draft from structured role information using deterministic templates rather than an AI API.

### Search intent contract

The public search intent is a free English cover-letter template generator for job applications. The page SHOULD make the differentiators explicit: deterministic template generation, browser-local draft generation, five template styles, editable output, and no AI API.

The page MUST NOT imply job-placement, hiring, immigration, or career-advice outcomes. It MUST NOT claim that the generated draft is personalized from a job description unless the user actually supplies and reviews that information.

### Monetization boundary

The canonical monetization class is `ADS_DONATION`. Amazon affiliate monetization is not applicable to the current product intent. Cover Letter Lite remains an organic-search / advertising / donation surface plus an internal entry point to related job-application utilities.

Do not add Amazon product offers merely to monetize the page. A future career/job-service partner offer may be considered only as a separate verified partner integration with explicit contextual relevance and its own review; it must never be presented as required to complete the cover letter, as a hiring recommendation, or as evidence that a service improves interview/hiring probability.

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
- [ ] Public title, description, H1, and intro state that the tool is a free English cover-letter template generator and that no AI API is used.
- [ ] No Amazon affiliate offer is rendered under the current `ADS_DONATION` classification.

## Implementation evidence

- `tools/cover-letter-lite/index.html`
- `tools/cover-letter-lite/app.js`
- `tools/cover-letter-lite/style.css`
