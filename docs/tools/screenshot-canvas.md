# Screenshot Canvas — canonical tool specification

- **Slug:** `screenshot-canvas`
- **Display name (JA):** スクショ自由配置・比較
- **Display name (EN):** Screenshot Canvas
- **Implementation:** `tools/screenshot-canvas/`
- **Registry state:** active
- **Category:** screenshot, image, compare, canvas
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX` (pending live behavior review)

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

Image pixels stay in browser memory. No uploaded-image endpoint or localStorage/sessionStorage persistence is used. Analytics and advertising, if later integrated, must remain separate from image content.

## 8. Responsive contract

Hybrid layout: toolbars wrap on narrow screens and the wide Canvas is scrollable. Verify touch input separately and preserve minimum 360px support.

## 9. Language contract

`bilingual single-page` via JA/EN dropdown, with tool-specific strings localized in-place.

## 10. SEO contract

One canonical `https://nicheworks.app/tools/screenshot-canvas/`, matching og:url, descriptive title, and WebApplication JSON-LD. Do not index preview domains as canonical.

## 11. Advertising contract

Classification is ADS_DONATION. Suite advertisement placement, GA4, and AdSense shell integration remain to be completed and must not obstruct image editing.

## 12. Donation/support contract

The common NicheWorks OFUSE/Ko-fi support links must be integrated before final quality acceptance; no payment function is required for core image editing.

## 13. Help/usage/FAQ contract

Usage documentation is provided in `tools/screenshot-canvas/usage.html` and `usage-en.html`. Main controls have short guidance; dedicated FAQ is optional.

## 14. Functional acceptance tests

- [ ] Import multiple local images with picker, drop, and paste.
- [ ] Move images, resize each corner, multi-select, reorder, delete, and duplicate.
- [ ] Verify row/column/grid/overlay layouts and transparent PNG export.
- [ ] Verify undo/redo restores geometry, opacity, background, and dimensions.
- [ ] Verify mobile touch and keyboard/accessibility behavior and JA/EN labels.

No browser-behavior test has been certified for this commit. Syntax/CI checks alone do not satisfy these tests.

## 15. Explicit tool-specific exceptions

This is a freeform compositor, not Screenshot Stitcher (vertical joiner) or a remote URL screenshot capture tool. The main editing Canvas is allowed horizontal scrolling on mobile. No private image upload is authorized.

### Implementation evidence

- `tools/screenshot-canvas/index.html`
- `tools/screenshot-canvas/app.js`
- `tools/screenshot-canvas/style.css`
- `tools/screenshot-canvas/SPEC.md`
