# ExecPlan: PR87 Atlas search modes + examples

## Scope
- tools/construction-tools-atlas/index.html
- tools/construction-tools-atlas/app.js
- tools/construction-tools-atlas/style.css
- tools/construction-tools-atlas/data/** (only if needed)

## Files to touch
- tools/construction-tools-atlas/index.html
- tools/construction-tools-atlas/app.js
- tools/construction-tools-atlas/style.css
- tools/construction-tools-atlas/data/** (if examples need updates)

## Plan
1. Inspect existing Atlas UI, search modes, and data schema to understand current behavior.
2. Update data schema and UI to support explicit search modes and examples presets/details.
3. Implement search logic updates (term/category/action) with normalization rules and reset behavior.
4. Adjust layout for mobile-first chips (sticky, horizontal scroll) and selected styling.
5. Verify empty state presets, detail examples, and mode behaviors.

## Manual verification steps
- On 360px width, confirm mode chips are sticky, action chips scroll horizontally, and no horizontal overflow.
- Validate term/category/action modes and keyword narrowing behavior.
- Confirm presets in empty state trigger correct mode/chip/query.
- Open a detail and verify examples display in current language.
