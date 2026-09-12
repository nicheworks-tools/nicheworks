# Niche Job Starter Kit — canonical tool specification

- **Slug:** `niche-job-starter-kit`
- **Display name (JA):** ニッチ仕事スターターキット
- **Display name (EN):** Niche Job Starter Kit
- **Implementation:** `tools/niche-job-starter-kit/`
- **Registry state:** active (registered implementation present)
- **Category:** job, niche, startup, planning
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `niche-job-starter-kit` implementation at `/tools/niche-job-starter-kit/`. It does not authorize a production rewrite.

## 2. Purpose

Create a browser-local draft job kit for niche roles, side work, and contractor recruiting, including a job post, screening questions, and candidate-sheet columns.

## 3. Inputs

- Role and engagement details.
- Compensation and workload.
- Responsibilities and qualification lists.
- Working conditions, process, location, and application method.
- JP/EN display language.

## 4. Processing behavior

- Accept role, contract/employment type, compensation, workload, responsibilities, required/preferred qualifications, working conditions, process, location, and application method.
- Generate a structured job-post draft and screening-question set in the active UI language.
- Provide default placeholder guidance when fields are blank instead of inventing concrete employer facts.
- Generate candidate-management CSV column headers for spreadsheet use.
- Copy the current job kit and save it as TXT.
- Copy candidate CSV columns and download a one-row CSV header template with UTF-8 BOM.
- Generate wording variants plus caution prompts about discriminatory criteria and contractor-control wording.
- Switch JP/EN UI and persist only the shared language setting.

## 5. Outputs

- Job post draft.
- Screening questions.
- TXT download and clipboard copy.
- Candidate-sheet CSV column header copy/download.
- Wording variants and pre-publication cautions.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Draft generation is browser-local. The tool does not send role/company/applicant data to a generation backend. Ads and analytics may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The page is a vertically stacked drafting form followed by output/export controls.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/niche-job-starter-kit/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Current inputs generate a job-post draft and screening questions without an external generation API.
- [ ] Blank fields use generic `not specified`/review guidance rather than fabricated employer facts.
- [ ] Candidate-sheet copy/download contains the documented management columns and no applicant records.
- [ ] Wording variants retain warnings about discriminatory criteria and contractor/employment distinctions.
- [ ] JP/EN output follows the active UI language and only language preference is persisted.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/niche-job-starter-kit/index.html`
- `tools/niche-job-starter-kit/app.js`
- `tools/niche-job-starter-kit/style.css`
