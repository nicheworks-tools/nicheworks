# Screenshot Canvas — canonical tool specification

- **Slug:** `screenshot-canvas`
- **Display name (JA):** スクショ自由配置・比較
- **Display name (EN):** Screenshot Canvas
- **Implementation:** `tools/screenshot-canvas/`
- **Registry state:** active
- **Category:** screenshot, image, compare, canvas
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS` (automated Chromium desktop and 390px content-layout regression; physical touch QA remains recommended)

## 1. Identity

The standalone Screenshot Canvas utility is published under `/tools/screenshot-canvas/` and is separate from Screenshot Stitcher and Screenshot Collector.

## 2. Purpose

Compose multiple local screenshots on a freeform Canvas, rearrange or overlay them for comparisons, and download a PNG.

## 3. Inputs

PNG/JPEG/WebP image files through file picker, drag/drop, and clipboard paste; pointer input for moving and resizing; Canvas size; layer order; background; opacity; arrangement gap; JA/EN mode.

## 4. Processing behavior

Each loaded image is decoded into an in-memory Image. The tool renders them on one Canvas without network upload; selection allows pointer movement, four-corner proportional resizing, Shift-click multiple selection, duplication, deletion, and layer operations. Layout buttons arrange images in rows, columns, grid, or overlay. Undo/redo stores bounded edit history.

## 5. Outputs

Canvas preview and locally generated `screenshot-canvas.png` via Canvas toBlob. Selection handles are preview-only, not exported.

## 6. Error behavior

Unsupported image formats are ignored. Image read errors revoke the temporary object URL. Canvas dimensions outside 100–12000px are rejected. PNG export failure displays an alert. Browser memory limits can prevent very large Canvas exports.

## 7. Privacy/data handling

Image pixels stay in browser memory. No uploaded-image endpoint or localStorage/sessionStorage persistence is used. GA4 and AdSense scripts load as separate site services, and image content is not intentionally transmitted to them.

## 8. Responsive contract

Hybrid layout: toolbars wrap on narrow screens and the wide Canvas is scrollable. Verify touch input separately and preserve minimum 360px support.

## 9. Language contract

`bilingual single-page` via JA/EN dropdown, with tool-specific strings localized in-place.

## 10. SEO contract

One canonical `https://nicheworks.app/tools/screenshot-canvas/`, matching og:url, descriptive title, and WebApplication JSON-LD. Do not index preview domains as canonical.

## 11. Advertising contract

Classification is ADS_DONATION. GA4 tracking and AdSense script tags are present in the page shell. They must not access local screenshot pixels or obstruct editing.

## 12. Donation/support contract

The common NicheWorks OFUSE and Ko-fi support links are present in the page shell. No payment function is required for core image editing.

## 13. Help/usage/FAQ contract

Usage documentation is provided in `tools/screenshot-canvas/usage.html` and `usage-en.html`. Main controls have short guidance; dedicated FAQ is optional.

## 14. Functional acceptance tests

- [ ] Import multiple local images with picker, drop, and paste.
- [ ] Move images, resize each corner, multi-select, reorder, delete, and duplicate.
- [ ] Verify row/column/grid/overlay layouts and transparent PNG export.
- [x] Verify undo/redo restores geometry, opacity, background, and dimensions (Chromium smoke).
- [ ] Verify mobile touch and keyboard/accessibility behavior and JA/EN labels.

GitHub Actions runs `tools/screenshot-canvas/tests/browser-smoke.mjs` in Chromium against the repository files at desktop content width 1425px and constrained content width 390px. Passed coverage includes two-image import, row/grid/column/overlay arrangement, pointer drag, undo/redo, background, opacity, canvas dimensions, duplicate/delete, PNG export, and language switch. Tests do not certify hardware touch interaction, clipboard paste, drag/drop, all four resize corners, or keyboard accessibility. The 390px mode constrains body layout because headless Chrome's minimum viewport is 500px.

## 15. Explicit tool-specific exceptions

This is a freeform compositor, not Screenshot Stitcher (vertical joiner) or a remote URL screenshot capture tool. The main editing Canvas is allowed horizontal scrolling on mobile. No private image upload is authorized.

### Implementation evidence

- `tools/screenshot-canvas/index.html`
- `tools/screenshot-canvas/app.js`
- `tools/screenshot-canvas/style.css`
- `tools/screenshot-canvas/SPEC.md`
- `tools/screenshot-canvas/tests/browser-smoke.mjs`
