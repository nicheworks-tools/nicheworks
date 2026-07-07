# Execution Plan - Command Safety Checker Improvement

This plan outlines the steps to improve the Command Safety Checker by adding deterministic interaction analysis, cleaning up the static UI, and ensuring correct language switching behavior.

## 1. Static UI Cleanup
- [ ] Move CSS from `app.js`'s `injectUiPolish` to `style.css`.
- [ ] Move static HTML (capabilities box, result summary container, presets) from `app.js` to `index.html`.
- [ ] Update `index.html` to load `app.js` and remove `app-core.js`.
- [ ] Remove `injectUiPolish` from `app.js`.
- [ ] Verify UI remains visually identical and functional.

## 2. Deterministic Command Segmentation
- [ ] Implement `splitCommands(input)` in `app.js` that handles `\n`, `;`, `&&`, `||`, and `|` while respecting quotes.
- [ ] Update `analyzeCommand` to use these segments.
- [ ] Add a note about parser limitations in the UI.
- [ ] Verify segmentation logic with various inputs.

## 3. Interaction Analysis Layer
- [ ] Define interaction rules for:
    - Remote download + execution
    - Secret source + external transfer
    - Elevated privilege + destructive operation
    - Destructive Git sequence
- [ ] Implement interaction analysis in `app.js`.
- [ ] Update risk calculation to escalate based on interaction severity.
- [ ] Verify detection of dangerous combinations.

## 4. UI/UX Enhancements & Language Switching
- [ ] Update `renderResult` to show interaction findings separately.
- [ ] Refactor language switching to update existing results without re-analysis.
- [ ] Preserve Pro boundaries and behavior.
- [ ] Verify language switching updates interaction findings.

## 5. Final Validation
- [ ] Verify all 30 validation points from the task description.
- [ ] Ensure no unrelated files are modified.
- [ ] Run pre-commit steps.
