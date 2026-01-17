# ExecPlan: Task 3 INCI FastScan mobile-first UI/UX

- Scope: tools/inci-fastscan/
- Files to touch:
  - tools/inci-fastscan/index.html
  - tools/inci-fastscan/style.css
  - tools/inci-fastscan/js/web_ui.js (only if needed for reset/support)

## Steps
1. Review current layout, tab structure, and reset behavior.
2. Update HTML structure to match required mobile-first layout, including header support pill, tabs, usage/disclaimer/unknown sections, and footer links.
3. Adjust CSS to enforce single-column layout, mobile-first sizing, bottom sheet styling, and accessible tap targets.
4. Update JS only if needed for reset or support sheet behavior.
5. Manually verify at 360px width: no horizontal scroll, buttons aligned, support sheet opens/closes, reset clears inputs/results/files.

## Manual verification
- Load tools/inci-fastscan/index.html at 360px width.
- Toggle tabs and confirm reset clears input, results, file input, and OCR button state.
- Click Support pill, confirm bottom sheet opens/closes by close button or backdrop tap.
- Confirm action rows and primary button layout and results cards display vertically.
