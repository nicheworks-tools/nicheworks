# Tool Specification — EXIF Cleaner Mini

- Slug: `exif-cleaner-mini`
- Public URL: `https://nicheworks.app/tools/exif-cleaner-mini/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Regenerate supported photos in browser canvas so most EXIF metadata is not carried into the downloaded copy, reducing accidental sharing of GPS, timestamp, device, and related metadata.

## Current functional contract

- Accept JPEG, PNG, and WebP images through file selection/drag-and-drop.
- Show a preview and implemented inspection/status information for the selected image.
- Redraw the image in browser Canvas to create a new file rather than editing the source file.
- Keep the original supported format where implemented or convert to JPEG; JPEG quality is adjustable from the provided range.
- Warn that JPEG conversion can remove transparency and that Canvas regeneration does not guarantee removal of every app-specific/file-level trace.
- Download the regenerated image and provide reset/next-action links.
- Provide JP/EN UI and safety/usage guidance.

## Inputs

- JPEG, PNG, or WebP image.
- Output-format selection and JPEG quality where applicable.
- JP/EN language selection.

## Outputs

- Image preview and metadata-cleaning status/verification information.
- Regenerated local image download in the implemented output format.

## State and persistence

Selected image pixels and controls are current-session browser state. Source images are not stored as history and downloaded cleaned copies are user-controlled files.

## Privacy and network behavior

Image decoding/regeneration occurs in the browser and the selected image is not intentionally uploaded by the cleaning workflow. Advertising, GA4, and Cloudflare analytics resources may load separately from image processing.

## Language mode

`bilingual single-page`

JP/EN controls switch the same image-cleaning UI, with supporting language-specific guidance links.

## Layout class

`mobile-oriented`

The upload → preview → format/quality → download workflow is designed as a narrow stacked interaction.

## Limits and non-goals

- Supported input is JPEG/PNG/WebP; HEIC is not currently supported.
- Canvas regeneration removes most common EXIF carry-over but does not guarantee every app-specific metadata/file trace is removed.
- This is not malware scanning or forensic sanitization.
- JPEG conversion can lose transparency and quality depending on the selected setting.

## Acceptance criteria

- [ ] A supported image can be loaded and previewed without intentional application upload.
- [ ] Cleaning regenerates a new browser-created image rather than mutating the original source file.
- [ ] Format/quality controls affect the downloaded result according to the implemented options and transparency warnings remain visible where relevant.
- [ ] JP/EN switching preserves the complete cleaning workflow and non-guarantee disclaimer.

## Implementation evidence

- `tools/exif-cleaner-mini/index.html`
- `tools/exif-cleaner-mini/app.js`
- `tools/exif-cleaner-mini/style.css`
- `tools/exif-cleaner-mini/usage.html`
- `tools/exif-cleaner-mini/howto/en/`
