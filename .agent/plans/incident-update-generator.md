# ExecPlan: incident-update-generator templates + timeline

## Scope
- Target app: `tools/incident-update-generator`
- Files to touch:
  - `tools/incident-update-generator/index.html`
  - `tools/incident-update-generator/app.js`
  - `tools/incident-update-generator/style.css`
  - (Optional) `tools/incident-update-generator/howto/index.html`
  - (Optional) `tools/incident-update-generator/howto/en/index.html`

## Plan
1. Inspect current UI structure, form fields, and output generation logic.
2. Add selectors for status/tone/audience and timeline input block; update styling for new sections.
3. Update template generation logic to produce consistent outputs with required fields, copy buttons, and download support per audience.
4. Validate in browser (manual checks): switch status/tone/audience, fill timeline fields, verify output includes status/impact/actions/next update.

## Manual Verification Steps
- Open `tools/incident-update-generator/index.html` in a browser.
- Confirm selectors for status/tone/audience render and update output.
- Enter timeline details; ensure output always includes required fields.
- Use copy buttons per audience and download `.txt` output.
