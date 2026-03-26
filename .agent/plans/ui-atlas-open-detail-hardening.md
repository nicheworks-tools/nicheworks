# ExecPlan — UI Atlas open detail hardening

## Scope
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/styles.css`

## Files to touch
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/styles.css`

## Steps
1. Inspect current detail/card sample render flow and identify where exceptions can block detail open.
2. Refactor sample rendering into safe wrappers with fallback UI so exceptions never block card rendering or detail open.
3. Harden detail open sequence: populate text fields, open panel, then render sample in guarded path.
4. Harden card rendering and click wiring to avoid brittle per-card assumptions.
5. QA dataset sample definitions for all current patterns and run targeted checks.

## Manual verification
- Open several cards and click **Open detail** to confirm panel opens every time.
- Verify on narrow/mobile viewport that detail panel opens.
- Trigger a sample-render failure path (temporarily malformed sample config or forced exception) and confirm fallback appears while detail text remains readable.
