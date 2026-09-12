# Tool Specification — Image Redact

- Slug: `image-redact`
- Public URL: `https://nicheworks.app/tools/image-redact/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Hide sensitive visual regions in screenshots/photos with solid blackout, blur, or pixelation and export a redacted PNG without uploading the source image through the tool workflow.

## Current functional contract

- Accept PNG, JPEG, and WebP images through file selection or drag-and-drop.
- Provide Canvas view controls including fit, 100%, zoom, and Add/Edit/Pan interaction modes.
- Create multiple rectangular redaction masks and support selecting, moving, duplicating, deleting, and clearing masks.
- Support Solid, Blur, and Pixelate mask types with adjustable strength; recommend Solid for critical information and stronger settings for Blur/Pixelate.
- Provide preview-lock and a pre-save safety checklist covering names, addresses, identifiers, QR/barcodes, faces, plates, context clues, and mask strength.
- Save the rendered result as PNG.
- Downscale very large images when needed for browser protection as implemented.
- Provide JP/EN UI and explicitly separate visual redaction from EXIF/metadata cleaning.

## Inputs

- PNG/JPEG/WebP image.
- Mask rectangles, selected mask, mask type, and strength.
- Add/Edit/Pan and zoom/view controls.
- JP/EN language selection.

## Outputs

- Interactive redacted Canvas preview.
- Safety-check state/status.
- User-triggered redacted PNG download.

## State and persistence

Source image, masks, editor mode, and preview state are current-session browser state. The current contract does not include server/cloud project persistence. Downloaded PNG is user-controlled output.

## Privacy and network behavior

Image editing and PNG rendering run in the browser and the source image is not intentionally uploaded by the redaction workflow. Suite-wide advertising and analytics resources may load independently.

## Language mode

`bilingual single-page`

JP/EN controls switch the same editor and safety guidance.

## Layout class

`hybrid`

The Canvas/mask-control editor benefits from desktop width but includes explicit mobile Add/Edit/Pan behavior and responsive controls.

## Limits and non-goals

- Solid blackout is the safer visual-redaction option; weak blur/pixelation can remain readable.
- The tool does not guarantee removal of EXIF or other file metadata; EXIF Cleaner Mini is a separate tool.
- HEIC is not currently supported.
- The tool does not perform automatic face/text/QR detection; users manually place redaction masks.

## Acceptance criteria

- [ ] A supported image can be loaded and multiple redaction rectangles can be added/edited without intentional application upload.
- [ ] Solid, Blur, and Pixelate masks render according to the selected type/strength and can be individually managed.
- [ ] The pre-save safety checklist remains accessible and saving exports the current rendered result as PNG.
- [ ] JP/EN and mobile interaction modes preserve the same manual redaction capabilities and metadata disclaimer.

## Implementation evidence

- `tools/image-redact/index.html`
- `tools/image-redact/app.js`
- `tools/image-redact/style.css`
- `tools/image-redact/image-redact-safety.css`
