# Tool Specification — Screenshot Stitcher

- Slug: `screenshot-stitcher`
- Public URL: `https://nicheworks.app/tools/screenshot-stitcher/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Combine multiple screenshots vertically in the browser, with ordering and output controls, then save one stitched image or split output without uploading source screenshots through the tool workflow.

## Current functional contract

- Accept PNG, JPEG, and WebP screenshots through file selection, drag and drop, or clipboard paste.
- Show a source list with thumbnail, file name, dimensions, up/down ordering, individual removal, and clear-all behavior.
- Support width normalization by maximum width, explicit width, or minimum width.
- Support optional top/bottom margin trimming with threshold from 0 to 40, inter-image spacing from 0 to 200 px, and white or transparent background.
- Render a Canvas preview of the stitched result and warn when resulting height exceeds 20,000 px.
- Export a single stitched image as PNG, WebP, or JPEG.
- Split output by a user-specified pixel height and save the resulting parts as ZIP.
- Provide JP/EN UI and an always-visible local-processing privacy statement.

## Inputs

- One or more PNG, JPEG, or WebP image files from file picker, drag/drop, or clipboard.
- Image order and remove/clear actions.
- Width mode and optional target width.
- Trim toggle/threshold, inter-image spacing, background mode, output format, and optional split height.
- UI language selection.

## Outputs

- Ordered screenshot list and stitched Canvas preview.
- Height/load warnings where applicable.
- Single PNG/WebP/JPEG download or split-image ZIP download.

## State and persistence

Loaded screenshots, ordering, and transform settings are current-session browser state. Source images are not specified as persistent history. User-triggered image/ZIP downloads are saved by the browser.

## Privacy and network behavior

Image composition runs locally in the browser and source screenshots are not intentionally uploaded by the stitching workflow. Suite-wide advertising and analytics resources may load independently from image processing.

## Language mode

`bilingual single-page`

JP/EN controls switch titles, explanatory copy, controls, and status text on the same tool page.

## Layout class

`hybrid`

The preview and image list benefit from desktop width, while core add/reorder/configure/export actions are required to remain usable at narrow mobile widths, including around 320 px.

## Limits and non-goals

- The tool vertically stitches screenshots; it is not a general freeform image compositor or editor.
- Margin trimming is top/bottom threshold-based rather than semantic content detection.
- Very tall results can exceed practical canvas/browser limits; the UI warns at the implemented 20,000 px threshold and split output is available.
- Rendering/export capability still depends on browser Canvas/image support and available device memory.

## Acceptance criteria

- [ ] PNG/JPEG/WebP screenshots can be added through the supported input paths, reordered, individually removed, and cleared.
- [ ] Width, trim, spacing, and background settings affect the stitched preview without modifying the original source files.
- [ ] A stitched result can be exported in each supported single-image format, and split mode can produce a ZIP of parts.
- [ ] JP/EN switching keeps the complete stitching workflow usable and local-processing wording visible.
- [ ] Basic controls remain operable at approximately 320 px width with visible keyboard focus and recoverable error handling.

## Implementation evidence

- `tools/screenshot-stitcher/SPEC.md` (pre-standard v1.1 contract migrated into this format)
- `tools/screenshot-stitcher/index.html`
- `tools/screenshot-stitcher/app.js`
- `tools/screenshot-stitcher/style.css`
