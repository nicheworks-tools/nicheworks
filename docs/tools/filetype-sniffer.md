# FileType Sniffer — canonical tool specification

- **Slug:** `filetype-sniffer`
- **Display name (JA):** ファイル種別判定ツール
- **Display name (EN):** FileType Sniffer
- **Implementation:** `tools/filetype-sniffer/`
- **Registry state:** active (registered implementation present)
- **Category:** file, type, sniffer, privacy
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `filetype-sniffer` implementation at `/tools/filetype-sniffer/`. It does not authorize a production rewrite.

## 2. Purpose

Inspect a file's leading signature bytes in the browser to estimate its actual file format and help users notice extension/signature mismatches without opening or executing the file.

## 3. Inputs

- Local file.
- Analyze/reset/copy actions.

## 4. Processing behavior

- Accept an arbitrary local file through file selection or drag-and-drop.
- Read only the leading 4096 bytes for implemented Magic Number/signature detection.
- Estimate supported formats including common documents, images, audio/video, archives, executables, and ZIP-container-based formats.
- Compare the detected type with the visible filename/extension and surface relevant mismatch/container warnings.
- Produce a human-readable summary and JSON representation that can be copied.
- Provide reset behavior and separate Japanese/English tool pages.

## 5. Outputs

- Estimated file type/signature summary.
- Extension/signature or container warnings where applicable.
- JSON result and copied summary/JSON.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** No additional clipboard failure policy is implemented beyond the browser operation.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/filetype-sniffer/app.js`, `tools/filetype-sniffer/en/index.html`, `tools/filetype-sniffer/howto/en/index.html`, `tools/filetype-sniffer/howto/index.html`, `tools/filetype-sniffer/index.html`.

## 7. Privacy/data handling

The selected file is not intentionally uploaded by the detection workflow; only its leading bytes are read locally in the browser. Suite-wide analytics and advertising resources may load independently.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The file drop/select → analyze → result flow is compact and naturally stacks on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The canonical root is Japanese and `/en/` provides the English tool page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/filetype-sniffer/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/filetype-sniffer/en/usage.html`, `tools/filetype-sniffer/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Selecting a supported file reads only the implemented leading-byte window and produces a signature-based estimate without executing the file.
- [ ] A visible extension/signature mismatch or container case can be surfaced in the result/warning path when recognized.
- [ ] Summary and JSON copy actions reflect the current analysis and reset clears current working state.
- [ ] Japanese and English pages retain equivalent core detection behavior and the non-antivirus warning.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/filetype-sniffer/index.html`
- `tools/filetype-sniffer/app.js`
- `tools/filetype-sniffer/en/usage.html`
- `tools/filetype-sniffer/style.css`
- `tools/filetype-sniffer/usage.html`
