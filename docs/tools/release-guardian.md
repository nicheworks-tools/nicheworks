# Release Guardian — canonical tool specification

- **Slug:** `release-guardian`
- **Display name (JA):** 公開前ガーディアン
- **Display name (EN):** Release Guardian
- **Implementation:** `tools/release-guardian/`
- **Registry state:** active (registered implementation present)
- **Category:** release, checklist, qa, launch
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `release-guardian` implementation at `/tools/release-guardian/`. It does not authorize a production rewrite.

## 2. Purpose

Document and link to the Release Guardian repository asset for practical web-repository release preflight, structured verdicts, and narrow safe-fix workflows.

## 3. Inputs

The NicheWorks page accepts no repository input. Actual Release Guardian use occurs in the linked external repository/CLI workflow.

## 4. Processing behavior

- Explain four repository operating modes: report-only, safe-fix, blocker-first, and release-report.
- Document practical release checks covering public metadata, crawl files, 404 handling, accidental noindex, docs drift, public-facing basics, and repo-defined build/lint/typecheck/test signals when applicable.
- Describe supported public web-repository shapes such as static HTML, Vite/React-style, and Next.js-like metadata structures.
- Explain narrow safe-fix boundaries and require users to review findings first, commit/stash work, and inspect the resulting diff.
- Describe the external repository's scripts, tests, templates, examples, and documentation.
- Link to the public GitHub repository rather than executing repository checks from the NicheWorks web page.
- Provide separate English and Japanese pages.

## 5. Outputs

- Release Guardian documentation and safety boundaries.
- Usage/CLI guidance and examples.
- Links to the external GitHub repository and support options.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

The page is informational. Following GitHub/support links uses external services. Ads/analytics may load on NicheWorks. No target repository is uploaded or scanned by this page itself.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The page is long-form reference documentation with desktop/mobile-readable sections.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The English root and `/ja/` page are separate public language surfaces.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/release-guardian/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] The page distinguishes documentation from the actual external repository/CLI execution environment.
- [ ] All four operating modes are described without presenting safe-fix as broad autonomous rewriting.
- [ ] Safety copy requires review/backup or commit/stash discipline around safe-fix use.
- [ ] The page does not present the preflight as a security/compliance audit or release guarantee.

Automated test evidence: `tools/release-guardian/test`.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/release-guardian/index.html`
- `tools/release-guardian/style.css`
