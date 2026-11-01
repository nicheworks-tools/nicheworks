# Tool Specification — Image Compression Inspector

- Slug: `image-compression-inspector`
- Public URL: `https://nicheworks.app/tools/image-compression-inspector/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Re-compress a browser-readable static image as JPEG or WebP and compare original size/resolution with generated output size and reduction before downloading the new image.

## Current functional contract

- Accept supported browser-readable static images such as PNG, JPEG, and WebP through file selection/drag-and-drop.
- Report original filename, format, file size, resolution, total pixels, and transparency status.
- Generate JPEG or WebP output in browser Canvas using an adjustable quality setting.
- Show generated size, percentage reduction/change, output format, advice/status, and a generated preview.
- Only accept the newest asynchronous canvas conversion result for the current file, output format, and quality; switching selection or reset cancels the previous result as a download candidate.
- Reject a mismatched output Blob MIME (including a silent PNG browser fallback from requested WebP) rather than showing the wrong format or saving a mislabeled extension.
- Flatten transparent areas onto white when JPEG output is selected and warn that JPEG cannot preserve transparency.
- Download the generated image and reset current working state.
- Provide JP/EN UI.

## Inputs

- PNG/JPEG/WebP or another browser-decodable supported static image.
- Output format: JPEG or WebP.
- Quality value from the implemented range.
- UI language.

## Outputs

- Original-image metadata summary.
- Generated-image size/reduction/format summary and preview.
- JPEG or WebP download.

## State and persistence

Selected image pixels, format, quality, and generated preview are current-session browser state. The current contract does not include persistent image history.

## Privacy and network behavior

Image reading, re-compression, size calculation, and output generation run in the browser; the image is not intentionally uploaded by the tool workflow. Advertising and analytics resources may load separately.

## Language mode

`bilingual single-page`

JP/EN controls switch the same compression-inspection workflow.

## Layout class

`hybrid`

The original/generated comparison and preview benefit from wider screens while upload and compression controls remain usable in a stacked mobile layout.

## Limits and non-goals

- Output is JPEG or WebP; lossless PNG optimization is not performed.
- RAW, HEIC, SVG, some AVIF, and full-frame animated-image processing are not supported.
- Generated output can be larger than the original when the source is already efficiently compressed.
- A browser may not support the chosen WebP/JPEG encoder and may silently return PNG; this tool must report a mismatch and never claim it is the selected format.
- JPEG output cannot preserve alpha transparency and uses a white background in this tool.

## Acceptance criteria

- [ ] Loading a supported image shows original format/size/resolution information without intentional application upload.
- [ ] Changing JPEG/WebP or quality regenerates the preview and generated-size/reduction information.
- [ ] JPEG output with transparent input follows the implemented white-background behavior and displays the transparency warning.
- [ ] Download saves the currently generated image and JP/EN switching preserves all controls.
- [ ] Out-of-order `toBlob` completions and stale file-reader/image callbacks cannot restore/download old results after a later format, quality, file-selection, or reset action.
- [ ] Generated Blob MIME must match the requested image format before preview/download; unsupported browser fallback shows a bilingual error and leaves Download disabled.

## Implementation evidence

- `tools/image-compression-inspector/index.html`
- `tools/image-compression-inspector/app.js`
- `tools/image-compression-inspector/tests/behavior.test.mjs`
- `tools/image-compression-inspector/style.css`
