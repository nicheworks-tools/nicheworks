# Rename Wizard — canonical tool specification

- **Slug:** `rename-wizard`
- **Display name (JA):** ファイル名リネーム補助
- **Display name (EN):** Rename Wizard
- **Implementation:** `tools/rename-wizard/`
- **Registry state:** active (registered implementation present)
- **Category:** rename, file, batch, organize
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `rename-wizard` implementation at `/tools/rename-wizard/`. It does not authorize a production rewrite.

## 2. Purpose

Generate batch filename cleanup candidates from selected local file names without renaming or reading the files themselves.

## 3. Inputs

- Multiple local file selections.
- Filename cleanup rule toggles.

## 4. Processing behavior

- Accept multiple local files through picker or drag-and-drop and use their file names only.
- Generate candidate names using configurable rules including Unicode NFKC width normalization, whitespace→underscore, lowercase extension, optional lowercase base name, separator collapse, edge trimming, and forbidden-character replacement.
- Detect candidate-name collisions and optionally append `_2`, `_3`, and later suffixes.
- Warn about Windows reserved names and problematic filename shapes such as excessive length, leading dots, trailing dots, or trailing spaces.
- Show an original→candidate preview table with status/warnings.
- Copy the mapping as TSV and download it as CSV.
- Do not rename the actual selected files and do not generate execution commands in the current version.
- Provide separate Japanese and English public tool pages.

## 5. Outputs

- Original→candidate filename mapping.
- Per-row status/warnings.
- TSV clipboard copy.
- CSV download.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **File read or parsing failure:** The implementation’s documented error path applies and no failed parse is represented as a valid output.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

The tool references file names in the browser and does not read/upload file contents for rename candidate generation. Ads/analytics may load separately.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- Multiple-file controls and the original/candidate/status/warning table are most effective on wider screens, though responsive use remains supported.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The Japanese root and `/en/` English page are separate public tool surfaces.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/rename-wizard/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Selecting files reads file names for preview without reading/uploading file contents as part of rename logic.
- [ ] Enabled normalization rules deterministically change candidate names and disabled rules do not silently apply.
- [ ] Duplicate candidate names are detected and can be disambiguated with sequential suffixes.
- [ ] TSV/CSV export contains the preview mapping and does not modify the selected local files.
- [ ] The UI continues to state that the tool does not perform actual renames or execution-command generation.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/rename-wizard/index.html`
- `tools/rename-wizard/app.js`
- `tools/rename-wizard/style.css`
