# ExecPlan — UI Atlas mobile compare repair pass (2026-03-30)

## Scope
- `tools/ui-atlas/index.html`
- `tools/ui-atlas/ja/index.html`
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/styles.css`

## Goals
- Replace ambiguous mobile compare behavior (floating bar + separate sheet) with one stable compare area.
- Keep compare anchored below catalog list and above favorites/recent on mobile.
- Make 0/1/2 compare states deterministic and always discoverable.
- Ensure clear/reset is visibly available whenever at least one item is selected.
- Keep EN/JA architecture parity and preserve existing live sample/detail behavior.

## Steps
1. Inspect current compare-related markup, JS state transitions, and mobile CSS behavior.
2. Remove duplicate mobile compare UI elements (mobile trigger + compare sheet) from EN/JA HTML and keep one inline compare container.
3. Refactor compare rendering in `app.js` to explicit 0/1/2-state rendering in the stable tray with:
   - header count,
   - clear/reset button for >=1,
   - compact empty hint,
   - one-item summary,
   - two-item compare body,
   - max-2 guard message + disabled add controls when full.
4. Update `styles.css` mobile rules so compare tray remains inline, compact at empty, and expanded naturally at 2 selections.
5. Validate with quick checks (syntax/load sanity), inspect diff, and capture proof screenshots if tool support exists.

## Manual verification checklist
- Mobile EN and JA: compare area is always located below catalog and above favorites/recent.
- Mobile 0 selected: compact, visible, with count + hint.
- Mobile 1 selected: item summary + visible Clear.
- Mobile 2 selected: compare diff appears in same area, with Clear + per-item remove.
- Selecting a third item at max 2 does not silently replace; blocked with clear feedback.
- Opening/closing detail does not clear compare and does not move compare UI.
