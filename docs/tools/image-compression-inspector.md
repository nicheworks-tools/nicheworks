# Image Compression Inspector — canonical tool specification

- **Slug:** `image-compression-inspector`
- **Display name (JA):** 画像圧縮確認ツール
- **Display name (EN):** Image Compression Inspector
- **Implementation:** `tools/image-compression-inspector/`
- **Registry state:** active (registered implementation present)
- **Category:** image, compression, size, web
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `image-compression-inspector` implementation at `/tools/image-compression-inspector/`. It does not authorize a production rewrite.

## 2. Purpose

Re-compress a browser-readable static image as JPEG or WebP and compare original size/resolution with generated output size and reduction before downloading the new image.

## 3. Inputs

- PNG/JPEG/WebP or another browser-decodable supported static image.
- Output format: JPEG or WebP.
- Quality value from the implemented range.
- UI language.

## 4. Processing behavior

- Accept supported browser-readable static images such as PNG, JPEG, and WebP through file selection/drag-and-drop.
- Report original filename, format, file size, resolution, total pixels, and transparency status.
- Generate JPEG or WebP output in browser Canvas using an adjustable quality setting.
- Show generated size, percentage reduction/change, output format, advice/status, and a generated preview.
- Flatten transparent areas onto white when JPEG output is selected and warn that JPEG cannot preserve transparency.
- Download the generated image and reset current working state.
- Provide JP/EN UI.

## 5. Outputs

- Original-image metadata summary.
- Generated-image size/reduction/format summary and preview.
- JPEG or WebP download.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Image reading, re-compression, size calculation, and output generation run in the browser; the image is not intentionally uploaded by the tool workflow. Advertising and analytics resources may load separately.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The original/generated comparison and preview benefit from wider screens while upload and compression controls remain usable in a stacked mobile layout.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same compression-inspection workflow.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/image-compression-inspector/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Loading a supported image shows original format/size/resolution information without intentional application upload.
- [ ] Changing JPEG/WebP or quality regenerates the preview and generated-size/reduction information.
- [ ] JPEG output with transparent input follows the implemented white-background behavior and displays the transparency warning.
- [ ] Download saves the currently generated image and JP/EN switching preserves all controls.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/image-compression-inspector/index.html`
- `tools/image-compression-inspector/app.js`
- `tools/image-compression-inspector/style.css`
