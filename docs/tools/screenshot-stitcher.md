# Screenshot Stitcher — canonical tool specification

- **Slug:** `screenshot-stitcher`
- **Display name (JA):** スクショ結合ツール
- **Display name (EN):** Screenshot Stitcher
- **Implementation:** `tools/screenshot-stitcher/`
- **Registry state:** active (registered implementation present)
- **Category:** screenshot, image, stitch, record
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `screenshot-stitcher` implementation at `/tools/screenshot-stitcher/`. It does not authorize a production rewrite.

## 2. Purpose

Combine multiple screenshots vertically in the browser, with ordering and output controls, then save one stitched image or split output without uploading source screenshots through the tool workflow.

## 3. Inputs

- One or more PNG, JPEG, or WebP image files from file picker, drag/drop, or clipboard.
- Image order and remove/clear actions.
- Width mode and optional target width.
- Trim toggle/threshold, inter-image spacing, background mode, output format, and optional split height.
- UI language selection.

## 4. Processing behavior

- Accept PNG, JPEG, and WebP screenshots through file selection, drag and drop, or clipboard paste.
- Show a source list with thumbnail, file name, dimensions, up/down ordering, individual removal, and clear-all behavior.
- Support width normalization by maximum width, explicit width, or minimum width.
- Support optional top/bottom margin trimming with threshold from 0 to 40, inter-image spacing from 0 to 200 px, and white or transparent background.
- Render a Canvas preview of the stitched result and warn when resulting height exceeds 20,000 px.
- Export a single stitched image as PNG, WebP, or JPEG.
- Split output by a user-specified pixel height and save the resulting parts as ZIP.
- Provide JP/EN UI and an always-visible local-processing privacy statement.

## 5. Outputs

- Ordered screenshot list and stitched Canvas preview.
- Height/load warnings where applicable.
- Single PNG/WebP/JPEG download or split-image ZIP download.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** No additional clipboard failure policy is implemented beyond the browser operation. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/screenshot-stitcher/app.js`, `tools/screenshot-stitcher/index.html`.

## 7. Privacy/data handling

Image composition runs locally in the browser and source screenshots are not intentionally uploaded by the stitching workflow. Suite-wide advertising and analytics resources may load independently from image processing.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The preview and image list benefit from desktop width, while core add/reorder/configure/export actions are required to remain usable at narrow mobile widths, including around 320 px.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch titles, explanatory copy, controls, and status text on the same tool page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/screenshot-stitcher/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/screenshot-stitcher/usage-en.html`, `tools/screenshot-stitcher/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] PNG/JPEG/WebP screenshots can be added through the supported input paths, reordered, individually removed, and cleared.
- [ ] Width, trim, spacing, and background settings affect the stitched preview without modifying the original source files.
- [ ] A stitched result can be exported in each supported single-image format, and split mode can produce a ZIP of parts.
- [ ] JP/EN switching keeps the complete stitching workflow usable and local-processing wording visible.
- [ ] Basic controls remain operable at approximately 320 px width with visible keyboard focus and recoverable error handling.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/screenshot-stitcher/index.html`
- `tools/screenshot-stitcher/README.md`
- `tools/screenshot-stitcher/app.js`
- `tools/screenshot-stitcher/style.css`
- `tools/screenshot-stitcher/usage-en.html`
- `tools/screenshot-stitcher/usage.html`
