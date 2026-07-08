# Execution Plan - Command Safety Checker Improvement

This plan outlines the steps to improve the Command Safety Checker by adding deterministic interaction analysis, cleaning up the static UI, and ensuring correct language switching behavior.

## 1. Static UI Cleanup
- [x] Move CSS from JavaScript injection to `style.css`.
- [x] Move static HTML (capabilities box, result summary container, presets) to `index.html`.
- [x] Update `index.html` to load `app.js` and remove `app-core.js`.
- [x] Remove runtime UI injection from `app.js`.
- [x] Verify UI remains visually identical and functional.

## 2. Deterministic Command Segmentation
- [x] Implement quote-aware segmentation in `app.js` that handles `\n`, `;`, `&&`, `||`, and `|`.
- [x] Update analysis engine to use these segments.
- [x] Preserve original separators for faithful command reconstruction.
- [x] Verify segmentation logic handles quoted separators correctly.

## 3. Interaction Analysis Layer
- [x] Implement OS-aware interaction rules for:
    - Remote download + execution (Unix/PowerShell specific)
    - Secret source + external transfer (Directional outbound evidence required)
    - Elevated privilege + destructive operation (Unix only)
    - Destructive Git sequence (Flexible flag ordering)
- [x] Implement multi-occurrence detection and index-based deduplication.
- [x] Update risk calculation to escalate based on interaction severity.

## 4. UI/UX Enhancements & Language Switching
- [x] Show interaction findings separately with specific styling.
- [x] Implement snapshot-based language switching to preserve analyzed state.
- [x] Ensure faithful command reconstruction in UI cards, Copy results, and Pro-bridge exports.
- [x] Preserve all Pro boundaries and behavior.

## 5. Final Validation
- [x] Verify all 30+ validation points, including mode strictness and directional exfiltration accuracy.
- [x] Ensure no unrelated files or artifacts are modified.
- [x] Complete pre-commit steps.
