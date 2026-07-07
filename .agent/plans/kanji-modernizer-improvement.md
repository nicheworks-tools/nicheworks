# Execution Plan - Kanji Modernizer Improvement

Improve Modern → Old conversion safety and transparency by adding ambiguity-aware policies and a review section.

## User Review Required

> [!IMPORTANT]
> This plan involves refactoring the core conversion loop in `app.js` to track ambiguities and adding a new UI section for review.

## Proposed Changes

### 1. `tools/kanji-modernizer/index.html`
- Add a "Conversion Policy" fieldset with radio buttons for "Conservative" and "First candidate" (Modern → Old only).
- Add a new section `#ambiguityBlock` (hidden by default) with a table to show ambiguous characters encountered.
- Add i18n strings for:
  - Policy labels (Conservative, First candidate) and descriptions.
  - Review section title, table headers (Modern, Candidates, Count, Action).
  - Actions (Preserved, Auto-selected).

### 2. `tools/kanji-modernizer/style.css`
- Add styles for the `.policy-fieldset` and `.ambiguity-table`.
- Update the existing `@media (max-width: 480px)` block to include the new UI elements for vertical stacking.

### 3. `tools/kanji-modernizer/app.js`
- **Persistence**: Save/load `km-policy` (Modern → Old policy) in `localStorage`.
- **Mapping Logic**:
  - Update `pickMappedChar` to take `direction` and `policy`.
  - If `direction` is `new-to-old` and `policy` is `conservative`, and `mapped` is an array with > 1 unique candidate, return `sourceChar` (preserve original).
- **Conversion Loop**:
  - Update `convertText` to track ambiguities in a `Map`.
  - Exclude characters inside skipped segments (ASCII, URLs, code blocks) from ambiguity tracking.
  - Return an `ambiguities` array in the result object.
- **UI & Reporting**:
  - Implement `renderAmbiguityReview(ambiguities, policy)` to populate `#ambiguityBlock`.
  - Update `copyTableBtn` handler to append the ambiguity report (deterministic list) to the replacement list in the clipboard.
  - Ensure `resetBtn` clears the new section.

## Verification Plan

### Automated/Scripted Tests
- No automated test suite exists, so I will perform manual verification using the tool's UI.

### Manual Verification
1. **Old → Modern**: Verify conversion works as before (e.g., '舊' → '旧').
2. **Modern → Old (Single)**: Verify '旧' → '舊' works.
3. **Modern → Old (Multi - Conservative)**:
   - Input '辺'.
   - Select "Conservative".
   - Result: '辺' (preserved).
   - Review section: Shows '辺', candidates '邊, 邉', action 'Preserved'.
4. **Modern → Old (Multi - First candidate)**:
   - Input '辺'.
   - Select "First candidate".
   - Result: '邊' (replaced).
   - Review section: Shows '辺', candidates '邊, 邉', action 'Auto-selected'.
5. **Aggregation**: Input '辺辺'. Verify review section shows one row for '辺' with count 2.
6. **Exclusions**:
   - Input `辺 https://example.com/辺 ```辺````.
   - Verify only the first '辺' is converted and reported as an ambiguity.
7. **i18n**: Toggle between JA and EN and verify all new UI elements and reports translate correctly.
8. **Persistence**: Select "Conservative", reload page, and verify it's still selected.
9. **Responsive**: Check layout at 375px width (via dev tools or simulated environment) to ensure vertical stacking of policy options.
10. **Reporting**: Copy replacement list and verify it contains the ambiguity review data.
