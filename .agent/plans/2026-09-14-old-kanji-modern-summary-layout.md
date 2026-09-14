# Old Kanji Reference — grouped-by-modern layout repair

## Problem

The production mobile screenshots show the dynamically generated `新字体別まとめ` / `Grouped by modern form` block occupying several screens before the filter and display-mode controls. `renderGroupedByModern()` inserts the block before `#filterButtons` and emits an unstyled two-line `<li>` for every modern form with multiple old-form candidates.

## Scope

- Keep the existing grouped-by-modern data and semantics.
- Move the summary below the list controls/status so it no longer blocks the filters.
- Render entries as a compact responsive grid with modern form and old-form candidates on one row when space permits.
- Preserve the existing Old Kanji Reference list, dictionary data, Amazon targets, SEO text, and Pro contract.
- Extend the existing read-only layout regression check to lock the repaired placement and compact styles.

## Acceptance

- Mobile no longer shows a several-screen vertical bullet list before the filters.
- `#modernSummary` is repositioned after `#statusMessage`.
- Desktop uses a three-column compact summary; normal mobile uses two columns; very narrow screens fall back to one column.
- Existing runtime/spec/SEO CI remains green.
