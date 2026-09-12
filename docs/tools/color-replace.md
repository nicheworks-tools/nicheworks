# Color Replace — canonical tool specification

- **Slug:** `color-replace`
- **Display name (JA):** 画像カラー置換ツール
- **Display name (EN):** Color Replace
- **Implementation:** `tools/color-replace/`
- **Registry state:** active (registered implementation present)
- **Category:** image, color, replace, browser
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `color-replace` implementation at `/tools/color-replace/`. It does not authorize a production rewrite.

## 2. Purpose

Replace a selected color in a local image with another color using an adjustable tolerance, then save the processed result as PNG without uploading the image through the tool workflow.

## 3. Inputs

- PNG, JPEG, or WebP image file.
- Source color, destination color, and tolerance.
- Canvas click used for source-color picking.
- UI language selection.

## 4. Processing behavior

- Load PNG, JPEG, or WebP images into browser canvas processing.
- Let the user click the source preview to pick the color to replace or select the source color manually.
- Let the user choose a destination color and tolerance from 0 to 100.
- Apply RGB color replacement while generally preserving alpha/transparency.
- Show before/after canvases and a replacement-result summary.
- Reset the working result and save an applied result as PNG.
- Downscale large images to roughly a 4-megapixel processing ceiling; output reflects the processed dimensions.
- Switch the same page between Japanese and English copy.

## 5. Outputs

- Before and after canvas previews.
- Replacement summary/status.
- User-triggered PNG download of the processed image.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** No additional clipboard failure policy is implemented beyond the browser operation. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/color-replace/app.js`, `tools/color-replace/howto/en/index.html`, `tools/color-replace/howto/index.html`, `tools/color-replace/index.html`.

## 7. Privacy/data handling

Image decoding and color replacement run in browser canvas and the selected image is not intentionally uploaded by the tool workflow. NicheWorks advertising and analytics resources may load separately. Canvas re-encoding may remove source metadata such as EXIF.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The dual before/after canvas workspace benefits from width, while controls and previews can stack for narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls change labels and explanatory text on the same tool page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/color-replace/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] A supported image can be loaded and clicking the source canvas can populate the source-color selection.
- [ ] Applying a destination color and tolerance updates the processed canvas without modifying the source file on disk.
- [ ] PNG download is available after processing and uses the processed canvas dimensions/content.
- [ ] JP/EN switching preserves all image controls and privacy/format notices.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/color-replace/index.html`
- `tools/color-replace/app.js`
- `tools/color-replace/style.css`
