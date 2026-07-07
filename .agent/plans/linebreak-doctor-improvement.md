# ExecPlan: LineBreak Doctor Improvement

## Scope
- `tools/linebreak-doctor/index.html`
- `tools/linebreak-doctor/app.js`
- `tools/linebreak-doctor/style.css`
- `.agent/plans/linebreak-doctor-improvement.md`

## Steps

### 1. Preparations
- Initialize the ExecPlan file at `.agent/plans/linebreak-doctor-improvement.md`.
- 1.1. Verify the creation of `.agent/plans/linebreak-doctor-improvement.md` using `list_files`.

### 2. Update UI and Styles (index.html & style.css)
- Add the language switch (`JP / EN`) to the header area in `index.html`.
- Add the "Invisible-character policy" radio control to the input section.
- Add `data-i18n` attributes to all translatable elements in `index.html`.
- Update `style.css` for:
    - Language switch styling.
    - Policy control styling.
    - Diagnostic summary styling.
    - Ensuring responsive behavior (v2 spec compliance).
- 2.1. Use `read_file` and `list_files` to verify the added `data-i18n` attributes, new UI controls, and styles.

### 3. Refactor SNS Profile Model and i18n (app.js)
- Define a comprehensive `snsProfiles` object that includes:
    - Key (id)
    - Display Name (i18n)
    - Formatter logic
    - Bilingual explanations/guides
    - Whether it defaults to using zero-width characters.
- Define a `translations` object for all UI strings, status messages, toast messages, and FAQ items.
- Implement a language management system that:
    - Checks `localStorage.getItem('nw_lang')`.
    - Detects browser language as fallback.
    - Updates `data-i18n` elements and dynamic content.
    - Saves preference to `localStorage`.
- 3.1. Use `read_file` to verify the refactored data model and i18n logic in `app.js`.

### 4. Implement Invisible-Character Policy and Diagnostics (app.js)
- Add logic to the formatter functions to respect a `policy` setting ("platform-safe" vs "plain-text").
- Create a diagnostic function that compares input and output (Unicode-safe):
    - Line count.
    - Blank line count.
    - Zero-width character count.
    - Visible text change flag.
- 4.1. Use `read_file` to verify the policy and diagnostic logic in `app.js`.

### 5. Wire up Logic (app.js)
- Update `renderResults` to:
    - Read the current policy.
    - Generate results for each platform using the new data model.
    - Calculate diagnostics.
    - Render cards with translated labels and diagnostics.
- Update language switch event listeners to trigger re-rendering of results if they exist.
- 5.1. Use `read_file` to confirm the logic integration in `app.js`.

### 6. Verification and Testing
- Test all scenarios mentioned in the requirements:
    - Empty input.
    - Simple one-line.
    - CRLF.
    - Multiple blank lines.
    - Leading/trailing spaces.
    - Emoji + line breaks.
    - Existing zero-width chars.
    - Platform-safe vs Plain-text for all 5 profiles.
    - Line/Blank-line counts.
    - Zero-width insertion counts.
    - JA/EN initial and toggle.
    - Copy functionality.
    - Reset.
    - Mobile/Desktop layout.

### 7. Final Steps
- Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
- 7.1. Verify that no temporary files, logs, or unrelated changes are present.
- Submit the changes.
