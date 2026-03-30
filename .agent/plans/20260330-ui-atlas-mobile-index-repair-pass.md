# ExecPlan — UI Atlas mobile index repair pass (2026-03-30)

## 1. Goal
- Repair mobile interaction architecture on `tools/ui-atlas` index pages so detail and compare behavior match the completed audit requirements while preserving existing desktop-first identity, live samples, compare, favorites/history, and EN/JA parity.
- This task is implementation-focused and does not modify common specs.

## 2. Scope
- targets:
  - `tools/ui-atlas/index.html`
  - `tools/ui-atlas/ja/index.html`
  - `tools/ui-atlas/app.js`
  - `tools/ui-atlas/styles.css`
- excluded:
  - all other repository paths

## 3. Rules / Prohibitions
- No folder/file rename or move.
- No edits outside listed scope.
- No new external dependencies.
- Preserve compare feature (max 2), live samples, favorites/history, and desktop layout behavior.
- Keep EN/JA parity for interaction and structure.
- Do not modify common spec files.

## 4. Change List
- `index.html`, `ja/index.html`
  - Add dedicated mobile detail sheet header region (title + close) and wrapper grouping to ensure mobile reading order contract.
  - Add mobile compare sticky bar and compare sheet/modal containers.
  - Keep existing desktop compare tray + lower-page blocks, while preventing inline detail leakage into feed.
- `app.js`
  - Add mobile state management for detail sheet open/close (closed by default, scroll lock, scroll position restore).
  - Rework compare rendering to support quiet 0-state on mobile, sticky compare bar at 1–2 selected, and compare sheet open/close behavior.
  - Keep desktop compare tray behavior and compare max=2.
  - Rebalance card compare CTA semantics/state labels for mobile clarity without dominating the card.
- `styles.css`
  - Mobile-only modal/sheet styling for detail and compare sheet.
  - Body scroll lock class, sticky compare bar styling, and mobile top-area compression.
  - Card sample sizing tweaks for compact readable catalog cards.

## 5. Step-by-step Procedure
1. Inspect current EN/JA HTML structure and JS/CSS bindings for detail/compare.
2. Update EN/JA index markup to add mobile detail header + compare bar/sheet hooks while preserving existing desktop sections.
3. Update app state logic in `app.js` for mobile modal architecture and compare UX transitions.
4. Update CSS for mobile sheet, sticky bar, compact card sample, and top-area compression without desktop regressions.
5. Run static checks (syntax-level via Node parse) and inspect git diff for scope compliance.

## 6. Test Plan
- Run JS syntax parse check for `tools/ui-atlas/app.js`.
- Manual verification checklist (EN + JA mobile viewport):
  - initial state: detail closed, no inline empty shell/stray close
  - open detail from card: opens as sheet, body scroll locked
  - close detail: returns to prior list scroll position
  - compare 0 selected: no loud compare block
  - compare 1–2 selected: sticky bar appears and opens compare sheet
  - compare max 2 still enforced
  - favorites/history/FAQ remain below catalog flow
- Manual verification (desktop viewport): existing multi-column layout and inline compare tray still functional.

## 7. Rollback Plan
- Revert only scoped files if regressions occur:
  - `git checkout -- tools/ui-atlas/index.html tools/ui-atlas/ja/index.html tools/ui-atlas/app.js tools/ui-atlas/styles.css`
