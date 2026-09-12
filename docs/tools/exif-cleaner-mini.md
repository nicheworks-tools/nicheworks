# EXIF Cleaner Mini — canonical tool specification

- **Slug:** `exif-cleaner-mini`
- **Display name (JA):** EXIF削除ミニ
- **Display name (EN):** EXIF Cleaner Mini
- **Implementation:** `tools/exif-cleaner-mini/`
- **Registry state:** active (registered implementation present)
- **Category:** exif, image, metadata, privacy
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `exif-cleaner-mini` implementation at `/tools/exif-cleaner-mini/`. It does not authorize a production rewrite.

## 2. Purpose

Regenerate supported photos in browser canvas so most EXIF metadata is not carried into the downloaded copy, reducing accidental sharing of GPS, timestamp, device, and related metadata.

## 3. Inputs

- JPEG, PNG, or WebP image.
- Output-format selection and JPEG quality where applicable.
- JP/EN language selection.

## 4. Processing behavior

- Accept JPEG, PNG, and WebP images through file selection/drag-and-drop.
- Show a preview and implemented inspection/status information for the selected image.
- Redraw the image in browser Canvas to create a new file rather than editing the source file.
- Keep the original supported format where implemented or convert to JPEG; JPEG quality is adjustable from the provided range.
- Warn that JPEG conversion can remove transparency and that Canvas regeneration does not guarantee removal of every app-specific/file-level trace.
- Download the regenerated image and provide reset/next-action links.
- Provide JP/EN UI and safety/usage guidance.

## 5. Outputs

- Image preview and metadata-cleaning status/verification information.
- Regenerated local image download in the implemented output format.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **File read or parsing failure:** The implementation’s documented error path applies and no failed parse is represented as a valid output.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Image decoding/regeneration occurs in the browser and the selected image is not intentionally uploaded by the cleaning workflow. Advertising, GA4, and Cloudflare analytics resources may load separately from image processing.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ns.adobe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The upload → preview → format/quality → download workflow is designed as a narrow stacked interaction.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same image-cleaning UI, with supporting language-specific guidance links.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/exif-cleaner-mini/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/exif-cleaner-mini/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] A supported image can be loaded and previewed without intentional application upload.
- [ ] Cleaning regenerates a new browser-created image rather than mutating the original source file.
- [ ] Format/quality controls affect the downloaded result according to the implemented options and transparency warnings remain visible where relevant.
- [ ] JP/EN switching preserves the complete cleaning workflow and non-guarantee disclaimer.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/exif-cleaner-mini/index.html`
- `tools/exif-cleaner-mini/app.js`
- `tools/exif-cleaner-mini/style.css`
- `tools/exif-cleaner-mini/usage.html`
