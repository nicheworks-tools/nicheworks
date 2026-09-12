# Cover Letter Lite — canonical tool specification

- **Slug:** `cover-letter-lite`
- **Display name (JA):** カバーレター Lite
- **Display name (EN):** Cover Letter Lite
- **Implementation:** `tools/cover-letter-lite/`
- **Registry state:** active (registered implementation present)
- **Category:** cover-letter, job, writing, template
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `cover-letter-lite` implementation at `/tools/cover-letter-lite/`. It does not authorize a production rewrite.

## 2. Purpose

Create an editable English cover-letter draft from structured role information using deterministic templates rather than an AI API.

## 3. Inputs

- Applicant name, company, position, key skills, optional experience summary.
- Tone, length guide, and template style.

## 4. Processing behavior

- Accept applicant name, company, role/title, key skills, and optional experience summary.
- Support Formal/Neutral tone, Short/Medium length, and Formal/Modern/Entry-level/Direct/Skill-focused template styles.
- Generate an English draft locally from the selected template and entered fields.
- Show a word count and allow copy or TXT save of the generated draft.
- Keep the output explicitly positioned as an editable starting point that must be reviewed for the actual role/company.

## 5. Outputs

- English cover-letter draft.
- Word-count metadata.
- Clipboard copy and TXT download.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Draft generation is template-based and runs in the browser; it does not call an AI API. The page still loads advertising and analytics resources, so users are warned not to enter sensitive personal or confidential employer information unnecessarily.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary workflow is a vertical form followed by a generated draft and checklist and is naturally usable in a narrow single-column layout.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `English-only`.
- The current product intentionally focuses on English cover letters and does not provide a Japanese drafting UI.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/cover-letter-lite/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Supplying the required role details and submitting the form produces an editable English draft from the selected deterministic template.
- [ ] Tone, length, and template-style selections affect the generated draft without an AI API request.
- [ ] Copy and TXT save operate on the currently generated draft.
- [ ] The page remains explicitly English-only and retains the review/privacy warnings.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/cover-letter-lite/index.html`
- `tools/cover-letter-lite/app.js`
- `tools/cover-letter-lite/style.css`
