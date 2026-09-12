# Tool Specification — Color Replace Lite

- Slug: `color-replace`
- Public URL: `https://nicheworks.app/tools/color-replace/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Replace a selected color in a local image with another color using an adjustable tolerance, then save the processed result as PNG without uploading the image through the tool workflow.

## Current functional contract

- Load PNG, JPEG, or WebP images into browser canvas processing.
- Let the user click the source preview to pick the color to replace or select the source color manually.
- Let the user choose a destination color and tolerance from 0 to 100.
- Apply RGB color replacement while generally preserving alpha/transparency.
- Show before/after canvases and a replacement-result summary.
- Reset the working result and save an applied result as PNG.
- Downscale large images to roughly a 4-megapixel processing ceiling; output reflects the processed dimensions.
- Switch the same page between Japanese and English copy.

## Inputs

- PNG, JPEG, or WebP image file.
- Source color, destination color, and tolerance.
- Canvas click used for source-color picking.
- UI language selection.

## Outputs

- Before and after canvas previews.
- Replacement summary/status.
- User-triggered PNG download of the processed image.

## State and persistence

Loaded image pixels and replacement settings are working memory for the current page session. The tool does not promise project/history persistence. Saved output is a user-downloaded PNG.

## Privacy and network behavior

Image decoding and color replacement run in browser canvas and the selected image is not intentionally uploaded by the tool workflow. NicheWorks advertising and analytics resources may load separately. Canvas re-encoding may remove source metadata such as EXIF.

## Language mode

`bilingual single-page`

JP/EN controls change labels and explanatory text on the same tool page.

## Layout class

`hybrid`

The dual before/after canvas workspace benefits from width, while controls and previews can stack for narrow screens.

## Limits and non-goals

- Output format is PNG only in the current implementation.
- Large source images can be downscaled for processing; this is not a lossless/original-resolution editor.
- Replacement is tolerance-based RGB matching, not semantic object selection, masking, or professional color grading.
- Transparency is generally preserved but display appearance can depend on the viewer/background.

## Acceptance criteria

- [ ] A supported image can be loaded and clicking the source canvas can populate the source-color selection.
- [ ] Applying a destination color and tolerance updates the processed canvas without modifying the source file on disk.
- [ ] PNG download is available after processing and uses the processed canvas dimensions/content.
- [ ] JP/EN switching preserves all image controls and privacy/format notices.

## Implementation evidence

- `tools/color-replace/index.html`
- `tools/color-replace/app.js`
- `tools/color-replace/style.css`
