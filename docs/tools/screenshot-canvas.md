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

Each loaded image is decoded into an in-memory Image. The tool renders them on one Canvas without network upload; selection allows pointer movement, four-corner proportional resizing, Shift-click multiple selection, duplication, deletion, and layer operations. Keyboard-accessible layer buttons allow selection; arrows move selected images, Shift+arrows move by ten pixels, Delete removes them, and Ctrl+Z/Ctrl+Y perform history operations when Canvas is focused. Layout buttons arrange images in rows, columns, grid, or overlay. Undo/redo stores bounded edit history.

## 5. Outputs

Canvas preview and locally generated `screenshot-canvas.png` via Canvas toBlob. Selection handles are preview-only, not exported.

## 6. Error behavior

Unsupported or corrupt image inputs are rejected with an accessible on-page error. Individual files must be at most 32MiB and 24MP; combined source image pixels across layers must remain within 48MP. Each canvas dimension must be 100–12,000px with a 24MP total limit, which prevents accidental 12,000×12,000px allocations. Images decode in sequence to preserve selection order and temporary object URLs are revoked. PNG export errors are recoverable and shown in the page. These caps are defensive and do not guarantee performance on low-memory devices.

## 7. Privacy/data handling

Image pixels stay in browser memory. No uploaded-image endpoint or localStorage/sessionStorage persistence is used. GA4 and AdSense scripts load as separate site services, and image content is not intentionally transmitted to them.

## 8. Responsive contract

Hybrid layout: toolbars wrap on narrow screens, the wide Canvas is scrollable, and image layers can be selected with keyboard-accessible buttons. Minimum 360px content width has automated Chromium regression coverage; physical touch input remains unverified.

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

- [x] Import PNG, JPEG and WebP files and exercise file picker, drag/drop, and browser clipboard image paste.
- [x] Move, resize each corner, multi-select, reorder, duplicate and delete local images.
- [x] Verify row, column, grid and overlay layouts, PNG pixel colors, and alpha transparency.
- [x] Verify undo/redo for position, corner resizing, background, opacity, dimensions and deletion.
- [x] Verify keyboard-accessible image layer selection, Shift+Arrow movement, Ctrl+Z and Delete.
- [x] Simulate touch-type PointerEvents and verify 1440px / 390px / 360px layouts and JA/EN switch.
- [ ] Confirm on actual iOS/Android hardware and with screen-reader assistive technology.
- [x] Reject over-limit canvas requests, corrupted image files, and oversized files with the existing composition retained.
- [ ] Stress-test allowed high-resolution compositions on low-memory physical devices.

GitHub Actions runs `tools/screenshot-canvas/tests/browser-smoke.mjs` in Chromium against committed source files. The constrained layouts set body content widths to 390px and 360px because Chrome's headless window has a 500px minimum. Touch-type PointerEvents and browser ClipboardEvents are synthetic and do not certify physical gestures or OS clipboard permissions. The PNG export test inspects the actual export canvas pixels and MIME type and confirms that a downloadable PNG blob is created.

## 15. Explicit tool-specific exceptions

This is a freeform compositor, not Screenshot Stitcher (vertical joiner) or a remote URL screenshot capture tool. The main editing Canvas is allowed horizontal scrolling on mobile. No private image upload is authorized.

### Implementation evidence

- `tools/screenshot-canvas/index.html`
- `tools/screenshot-canvas/app.js`
- `tools/screenshot-canvas/style.css`
- `tools/screenshot-canvas/SPEC.md`
- `tools/screenshot-canvas/tests/browser-smoke.mjs`
