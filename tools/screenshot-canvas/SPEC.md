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
- Canvas width and height (100–12000 px), background, layout, gap, and opacity.
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
- Device memory and browser maximum Canvas dimensions may limit high-resolution export.
- Image upload is not implemented.
- Full common-shell monetization and analytics integration is tracked separately.

## Acceptance criteria

- [ ] Import at least three files using image picker and drag/drop, move and resize selected images.
- [ ] Undo/redo restore image geometry, opacity, background, and Canvas dimensions.
- [ ] PNG export matches composition without including blue selection handles.
- [ ] Verify JP/EN mode and narrow mobile Canvas handling.
- [ ] Complete website shell integration and browser smoke before release.

## Implementation evidence

- `tools/screenshot-canvas/index.html`
- `tools/screenshot-canvas/app.js`
- `tools/screenshot-canvas/style.css`
- `tools/screenshot-canvas/usage.html`
- `tools/screenshot-canvas/usage-en.html`
