# Image Redact — canonical tool specification

- **Slug:** `image-redact`
- **Display name (JA):** 画像ぼかし・黒塗りツール
- **Display name (EN):** Image Redact
- **Implementation:** `tools/image-redact/`
- **Registry state:** active (registered implementation present)
- **Category:** image, redact, privacy, screenshot
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `image-redact` implementation at `/tools/image-redact/`. It does not authorize a production rewrite.

## 2. Purpose

Hide sensitive visual regions in screenshots/photos with solid blackout, blur, or pixelation and export a redacted PNG without uploading the source image through the tool workflow.

## 3. Inputs

- PNG/JPEG/WebP image.
- Mask rectangles, selected mask, mask type, and strength.
- Add/Edit/Pan and zoom/view controls.
- JP/EN language selection.

## 4. Processing behavior

- Accept PNG, JPEG, and WebP images through file selection or drag-and-drop.
- Provide Canvas view controls including fit, 100%, zoom, and Add/Edit/Pan interaction modes.
- Create multiple rectangular redaction masks and support selecting, moving, duplicating, deleting, and clearing masks.
- Support Solid, Blur, and Pixelate mask types with adjustable strength; recommend Solid for critical information and stronger settings for Blur/Pixelate.
- Provide preview-lock and a pre-save safety checklist covering names, addresses, identifiers, QR/barcodes, faces, plates, context clues, and mask strength.
- Save the rendered result as PNG.
- Downscale very large images when needed for browser protection as implemented.
- Provide JP/EN UI and explicitly separate visual redaction from EXIF/metadata cleaning.

## 5. Outputs

- Interactive redacted Canvas preview.
- Safety-check state/status.
- User-triggered redacted PNG download.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **File read/parsing failure:** `NEEDS_DECISION` — the file-read or parsing-failure fallback is not established by repository evidence.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Image editing and PNG rendering run in the browser and the source image is not intentionally uploaded by the redaction workflow. Suite-wide advertising and analytics resources may load independently.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The Canvas/mask-control editor benefits from desktop width but includes explicit mobile Add/Edit/Pan behavior and responsive controls.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same editor and safety guidance.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/image-redact/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] A supported image can be loaded and multiple redaction rectangles can be added/edited without intentional application upload.
- [ ] Solid, Blur, and Pixelate masks render according to the selected type/strength and can be individually managed.
- [ ] The pre-save safety checklist remains accessible and saving exports the current rendered result as PNG.
- [ ] JP/EN and mobile interaction modes preserve the same manual redaction capabilities and metadata disclaimer.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/image-redact/index.html`
- `tools/image-redact/app-final.js`
- `tools/image-redact/app.js`
- `tools/image-redact/style.css`
