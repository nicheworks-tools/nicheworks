# ExecPlan: API Key Token Redactor - Post-Redaction Verification Layer

Implementation plan for adding a deterministic post-redaction verification pass and coverage summary to the API Key Token Redactor.

## 1. Goal
- Add a second scanning pass on the redacted output to verify if any secrets remain.
- Show a coverage summary indicating enabled/disabled detection modes.
- Display residual findings separately from original findings.
- Avoid false positives from the tool's own placeholders.
- Maintain existing free and Pro behaviors.
- Ensure full JA/EN support.

## 2. Technical Approach

### 2.1 UI Changes (`index.html`)
- Add a `.coverage-summary` container in the Output section.
- Add a new `.tool-card` for "Verification" after the findings list.
- Use `data-i18n` for all new text elements.

### 2.2 Styling (`style.css`)
- Style coverage tags (e.g., green for enabled, gray/muted for disabled).
- Style verification section, including residual finding items and success/warning states.

### 2.3 Logic Changes (`app.js`)
- **Refactor `redactContent`**:
  - Extract scanning logic into `scanContent(text, options)`.
  - `redactContent` will call `scanContent`, apply redactions, and importantly, return an array of `placeholderRanges` (start/end positions of generated placeholders).
- **Update `runRedaction`**:
  - Call `redactContent` to get `output`, `originalFindings`, and `placeholderRanges`.
  - Call `scanContent` on the `output` to get `allResidualFindings`.
  - Filter `allResidualFindings` by excluding any finding that overlaps with `placeholderRanges`.
  - Capture current `coverage` state based on `options`.
  - Update `lastResult` with `originalFindings`, `residualFindings`, and `coverage`.
- **UI Rendering**:
  - Update `renderFindings` to display two sections: "Original Findings" and "Residual Findings".
  - Implement `renderCoverage` to show enabled modes.
  - Ensure `updateSummary` only reflects `originalFindings`.
  - Update `updateSafetySummary` to include verification status.
- **Language Switching**:
  - Update `applyLang` to re-render findings, verification, and coverage without rerunning the redaction process.

## 3. Data Model (`lastResult`)
```javascript
{
  output: "...",
  originalFindings: [...],
  residualFindings: [...],
  coverage: {
    modeApiKeys: true,
    modeBearer: true,
    // ...
  },
  counts: { ... } // Original counts only
}
```

## 4. Validation Plan
- All 28 validation checks specified in the issue.
- Verify no regressions in Pro features.
- Verify no regressions in samples or generic detection.
- Verify that a secret intentionally left (by disabling a mode) shows up in the verification section.
- Verify that generated placeholders like `[REDACTED]` are never reported as residual findings.

## 5. File Scope
- `tools/api-key-token-redactor/index.html`
- `tools/api-key-token-redactor/app.js`
- `tools/api-key-token-redactor/style.css`
- `.agent/plans/verification-layer.md` (this file)
