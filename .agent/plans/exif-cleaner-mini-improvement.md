# Execution Plan - EXIF Cleaner Mini Improvement

Improve EXIF Cleaner Mini with format-aware metadata scanning and post-clean verification.

## 1. Metadata Scanner Implementation
- Implement `scanMetadata(arrayBuffer, format)` in `app.js`.
- JPEG:
  - Parse markers (0xFFXX).
  - Identify APP1 (0xFFE1) and check for "Exif\0\0" or "http://ns.adobe.com/xap/1.0/\0".
  - Identify COM (0xFFFE).
- PNG:
  - Parse chunks (Length, Type, Data, CRC).
  - Identify `tEXt`, `zTXt`, `iTXt` (textual metadata).
  - Identify `eXIf` (EXIF metadata).
- WebP:
  - Parse RIFF structure.
  - Identify `EXIF` and `XMP ` chunks.

## 2. UI Updates
- `index.html`:
  - Add `#inspection-summary` for input results.
  - Add `#verification-summary` for post-clean results.
- `style.css`:
  - Add styles for summary boxes, tables, and status indicators.

## 3. Logic Integration
- `app.js`:
  - Update `handleFile` to run `scanMetadata` and display input summary.
  - Update `cleanExif` to run `scanMetadata` on the output Blob and display verification summary.
  - Update `renderDynamicMessages` to handle language switching for summaries.
  - Update `resetTool` to clear all new summaries.

## 4. Verification
- Test with sample files (JPEG, PNG, WebP) with and without metadata.
- Verify size change calculation.
- Verify language switching updates UI correctly.
- Verify mobile responsiveness.
