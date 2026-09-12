# Tool Specification — Release Guardian

- Slug: `release-guardian`
- Public URL: `https://nicheworks.app/tools/release-guardian/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Document and link to the Release Guardian repository asset for practical web-repository release preflight, structured verdicts, and narrow safe-fix workflows.

## Current functional contract

- Explain four repository operating modes: report-only, safe-fix, blocker-first, and release-report.
- Document practical release checks covering public metadata, crawl files, 404 handling, accidental noindex, docs drift, public-facing basics, and repo-defined build/lint/typecheck/test signals when applicable.
- Describe supported public web-repository shapes such as static HTML, Vite/React-style, and Next.js-like metadata structures.
- Explain narrow safe-fix boundaries and require users to review findings first, commit/stash work, and inspect the resulting diff.
- Describe the external repository's scripts, tests, templates, examples, and documentation.
- Link to the public GitHub repository rather than executing repository checks from the NicheWorks web page.
- Provide separate English and Japanese pages.

## Inputs

The NicheWorks page accepts no repository input. Actual Release Guardian use occurs in the linked external repository/CLI workflow.

## Outputs

- Release Guardian documentation and safety boundaries.
- Usage/CLI guidance and examples.
- Links to the external GitHub repository and support options.

## State and persistence

The NicheWorks page does not store repository files, scan results, or release reports. Any durable reports/changes are produced in the user's target repository/environment by the external Release Guardian workflow.

## Privacy and network behavior

The page is informational. Following GitHub/support links uses external services. Ads/analytics may load on NicheWorks. No target repository is uploaded or scanned by this page itself.

## Language mode

`separate JA/EN pages`

The English root and `/ja/` page are separate public language surfaces.

## Layout class

`hybrid`

The page is long-form reference documentation with desktop/mobile-readable sections.

## Limits and non-goals

- Release Guardian is a practical preflight helper, not a security, legal, accessibility, privacy, or compliance audit.
- It does not guarantee a successful launch or replace human release ownership.
- `safe-fix` can modify files and must be preceded by report-only/review and followed by diff review.
- The NicheWorks page itself does not run the CLI or edit user repositories.
- Repository behavior/content can evolve independently; the external repository remains the operational source.

## Acceptance criteria

- [ ] The page distinguishes documentation from the actual external repository/CLI execution environment.
- [ ] All four operating modes are described without presenting safe-fix as broad autonomous rewriting.
- [ ] Safety copy requires review/backup or commit/stash discipline around safe-fix use.
- [ ] The page does not present the preflight as a security/compliance audit or release guarantee.

## Implementation evidence

- `tools/release-guardian/index.html`
- `tools/release-guardian/ja/index.html`
- `tools/release-guardian/style.css`
