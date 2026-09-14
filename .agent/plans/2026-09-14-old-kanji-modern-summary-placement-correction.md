# Old Kanji Reference — grouped-by-modern placement correction

## Context

The production screenshots identify `新字体別まとめ` / `Grouped by modern form` as the broken middle-page block. The previous diagnosis incorrectly changed the independent scrolling behavior of `#groupContainer`, which is a separate all-entries list.

## Correct target

- Keep `#groupContainer` bounded and independently scrollable so the complete reference list does not make the whole page excessively tall.
- Move `#modernSummary` after the all-entries list/empty-state, not before the filters or between the controls and the list.
- Retain the compact responsive grid for the modern-summary items.
- Update the regression contract so it distinguishes the two blocks instead of treating them as the same layout problem.

## Acceptance

- Filter and display-mode controls appear before `新字体別まとめ`.
- The bounded all-entries list remains intact.
- `新字体別まとめ` appears after the list and is compact: 3 columns desktop, 2 columns normal mobile, 1 column only on very narrow screens.
- Runtime and SEO checks remain green.
