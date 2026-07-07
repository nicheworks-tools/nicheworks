# Execution Plan - JSON2Mermaid Lite Improvements

This plan outlines the steps to add diagram direction control, leaf rendering modes, array rendering modes, and generation statistics to the JSON2Mermaid Lite tool.

## 1. Preparation and Exploration
- [x] Read `AGENTS.md` and `common-spec/spec-ja.md`.
- [x] Inspect current `index.html`, `app.js`, and `style.css`.
- [x] Create this ExecPlan.

## 2. UI Enhancement (`index.html`)
- Add a new section for conversion options:
    - Direction: TD (default) / LR.
    - Leaf mode: Separate (default) / Inline.
    - Array mode: Expand (default) / Summarize.
- Add a statistics display area (`#statsBox`).
- Add appropriate `data-i18n` and `data-i18n-key` attributes for new labels.

## 3. Styling (`style.css`)
- Style the options section (grid/flex) to be responsive.
- Style the statistics box (deterministic, small labels).
- Ensure consistency with NicheWorks common spec v3 (soft borders, responsive stacking).

## 4. Logic Implementation (`app.js`)
- Update `labels` with new translations for UI and stats.
- Refactor the main conversion function (`jsonToMermaid`) to:
    - Accept an `options` object.
    - Handle `direction` (set the first line of output).
    - Handle `leafMode`:
        - `separate`: current behavior.
        - `inline`: for primitive values, combine key and value into one node label.
    - Handle `arrayMode`:
        - `expand`: current behavior.
        - `summarize`: represent array as a summary node (length, etc.).
    - Collect stats during traversal: node count, edge count, max depth, omitted items, depth limit flag.
- Update the convert button handler to:
    - Read options from the DOM.
    - Pass options to the conversion function.
    - Display results and statistics.
- Update the language switch logic to re-trigger conversion if output exists.
- Update the reset handler to clear new UI elements and stats.

## 5. Verification
- Create a test script `tools/json2mermaid/test_logic.js` to verify the `jsonToMermaid` logic with various JSON inputs and option combinations.
- Run the test script with `node`.
- Perform manual verification:
    - Check JA/EN switching.
    - Verify TD/LR direction in output.
    - Verify Inline vs Separate leaf nodes.
    - Verify Summarize vs Expand arrays.
    - Verify stats are accurate.
    - Verify download (.mmd, .txt) includes correct direction.
    - Verify responsive layout.
- Use `grep` to ensure no `console.log` or debug artifacts remain.

## 6. Finalization
- [ ] Complete pre-commit steps.
- [ ] Submit changes.
