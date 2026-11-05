# Tool Specification — Screenshot Canvas

- Slug: `screenshot-canvas`
- Public URL: `https://nicheworks.app/tools/screenshot-canvas/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Arrange multiple screenshots in one editable browser Canvas for comparison and PNG export. Separate from vertical-only Screenshot Stitcher and Screenshot Collector.

## Current functional contract

- Import PNG/JPEG/WebP using file picker, drag/drop, or paste.
- Select one or multiple images (Shift+click), drag to move, and proportionally resize using a corner.
- Duplicate, delete, change layer order, and apply row/column/grid/overlay layout.
- Set canvas width/height, background white/transparent, opacity, undo/redo, and export PNG.

## Inputs

- Local PNG/JPEG/WebP image files.
- Canvas width and height (100–12,000px per side, no more than 24MP total), background, layout, gap, and opacity.
- Pointer interactions, language toggle, and image-selection controls.

## Outputs

- Interactive Canvas composition and local PNG file download.

## State and persistence

Canvas images and edit history remain in memory for this page session. Undo/redo is bounded in memory. No server-side image storage.

## Privacy and network behavior

Source screenshot pixels are rendered and exported in-browser and never sent to an image upload endpoint by the tool.

## Language mode

`bilingual single-page`

Japanese and English switch on the tool page.

## Layout class

`hybrid`

Toolbar wraps at narrow widths; Canvas viewport is horizontally scrollable when larger than available space.

## Limits and non-goals

- This is not website capture, OCR, or screenshot stitching with smart overlap detection.
- Individual PNG/JPEG/WebP files must be at most 32MiB and 24MP. Total source pixels across image layers must stay within 48MP. Canvas size/export is limited to 24MP, and rejected/corrupt files report errors without losing the composition.
- Device memory and browser maximum Canvas dimensions can still limit high-resolution export.
- Image upload is not implemented.
- Full common-shell monetization and analytics integration is tracked separately.

## Acceptance criteria

- [ ] Import at least three files using image picker and drag/drop, move and resize selected images.
- [x] Undo/redo restores image geometry, opacity, background, and Canvas dimensions in Chromium CI.
- [x] PNG export matches composition without selection handles, verified against export canvas pixels.
- [x] Verify JP/EN mode and constrained 390px and 360px layouts in Chromium.
- [x] Reject oversized/corrupt image inputs and invalid canvas requests safely.
- [x] Website shell integration and browser smoke verified; physical-device testing remains separate.

## Implementation evidence

- `tools/screenshot-canvas/index.html`
- `tools/screenshot-canvas/app.js`
- `tools/screenshot-canvas/style.css`
- `tools/screenshot-canvas/usage.html`
- `tools/screenshot-canvas/usage-en.html`
