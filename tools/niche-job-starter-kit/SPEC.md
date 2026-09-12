# Tool Specification — Niche Job Starter Kit

- Slug: `niche-job-starter-kit`
- Public URL: `https://nicheworks.app/tools/niche-job-starter-kit/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Create a browser-local draft job kit for niche roles, side work, and contractor recruiting, including a job post, screening questions, and candidate-sheet columns.

## Current functional contract

- Accept role, contract/employment type, compensation, workload, responsibilities, required/preferred qualifications, working conditions, process, location, and application method.
- Generate a structured job-post draft and screening-question set in the active UI language.
- Provide default placeholder guidance when fields are blank instead of inventing concrete employer facts.
- Generate candidate-management CSV column headers for spreadsheet use.
- Copy the current job kit and save it as TXT.
- Copy candidate CSV columns and download a one-row CSV header template with UTF-8 BOM.
- Generate wording variants plus caution prompts about discriminatory criteria and contractor-control wording.
- Switch JP/EN UI and persist only the shared language setting.

## Inputs

- Role and engagement details.
- Compensation and workload.
- Responsibilities and qualification lists.
- Working conditions, process, location, and application method.
- JP/EN display language.

## Outputs

- Job post draft.
- Screening questions.
- TXT download and clipboard copy.
- Candidate-sheet CSV column header copy/download.
- Wording variants and pre-publication cautions.

## State and persistence

Recruiting inputs and generated artifacts are page state and are not saved as applicant/recruiting history. The shared `nw_lang` preference may persist in localStorage.

## Privacy and network behavior

Draft generation is browser-local. The tool does not send role/company/applicant data to a generation backend. Ads and analytics may load separately.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The page is a vertically stacked drafting form followed by output/export controls.

## Limits and non-goals

- The tool does not determine whether an engagement is employment or independent contracting.
- It does not guarantee compliance with labor law, minimum wage, anti-discrimination requirements, contracts, or job-board policies.
- The candidate CSV is only a header/template; it is not an applicant tracking system.
- Users should not enter confidential applicant information because the tool is for drafting, not candidate record management.

## Acceptance criteria

- [ ] Current inputs generate a job-post draft and screening questions without an external generation API.
- [ ] Blank fields use generic `not specified`/review guidance rather than fabricated employer facts.
- [ ] Candidate-sheet copy/download contains the documented management columns and no applicant records.
- [ ] Wording variants retain warnings about discriminatory criteria and contractor/employment distinctions.
- [ ] JP/EN output follows the active UI language and only language preference is persisted.

## Implementation evidence

- `tools/niche-job-starter-kit/index.html`
- `tools/niche-job-starter-kit/app.js`
- `tools/niche-job-starter-kit/style.css`
