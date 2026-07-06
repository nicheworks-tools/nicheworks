# Execution Plan - OG Image Maker Phase 1 Refactor

Refactor and extend OG Image Maker to support a template system, better background controls, text alignment, safe-area preview, and persistence.

## Scope
- `tools/og-image-maker/index.html`
- `tools/og-image-maker/app.js`
- `tools/og-image-maker/style.css`
- `.agent/plans/og-image-maker-refactor.md` (this file)

## Steps

### 1. UI Extension (index.html)
- Add a template selector (Minimal, Split, Gradient).
- Add background color, gradient start, and gradient end color inputs.
- Add text alignment selector (Left, Center).
- Add a safe-area preview toggle.
- Add a Reset button.
- Ensure all new elements have proper `data-i18n` attributes for JA/EN support.

### 2. Styling (style.css)
- Add styles for the new control fields.
- Implement responsive adjustments for the new controls, especially for mobile widths (< 480px).
- Add styles for the Reset button (danger style).

### 3. Logic Refactor - State and Persistence (app.js)
- Update the `state` object to include new properties: `template`, `bgColor`, `gradientStart`, `gradientEnd`, `textAlign`, `showSafeArea`.
- Implement `saveSettings()` and `loadSettings()` using `localStorage`.
- Implement `resetSettings()` to restore default values and update the UI.

### 4. Logic Refactor - Rendering System (app.js)
- Refactor `renderCanvas` to delegate to template-specific functions: `drawMinimal`, `drawSplit`, `drawGradient`.
- Update `renderCanvas` to take an optional `isExport` flag to skip drawing the safe-area guide during PNG download.
- Update `drawTextBlock` to support left/center alignment.

### 5. Event Binding and Initialization (app.js)
- Update `initTool` to bind listeners to the new UI elements.
- Ensure `loadSettings` is called on startup.
- Wire up the Reset button.

### 6. Validation
- Verify all three templates render correctly.
- Verify JA/EN switching for all UI elements.
- Verify PNG download does not include the safe-area guide.
- Verify localStorage persistence (reload page and check settings).
- Verify Reset button restores defaults.
- Verify responsive layout on mobile-sized screens.
