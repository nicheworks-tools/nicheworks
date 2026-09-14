# Old Kanji Reference layout repair

## Goal
Repair the middle-page Old Kanji Reference list layout shown in the production screenshots without changing dictionary data, Amazon targets, SEO copy, or Pro entitlement behavior.

## Root cause addressed
An older CSS hotfix forces `#groupContainer` into a nested `68–72vh` scroll box. In the current page composition this visually detaches the main reference list from the normal page flow and can produce the broken middle-page block shown in production.

## Changes
1. Remove the nested-scroll/max-height hotfix from `verified-badge.css` while preserving the responsive two-column desktop / one-column mobile card grid.
2. Bump the stylesheet cache key in `index.html` so production browsers do not reuse the old CSS.
3. Add a dedicated read-only runtime layout contract that rejects nested scrolling/max-height on `#groupContainer` and confirms the responsive grid contract.
4. Wire the layout contract into the existing runtime audit workflow.

## Non-goals
- no old-kanji mapping or metadata changes
- no Amazon target changes
- no SEO/cluster work in this hotfix
- no Pro billing changes

## Verification
- Tool runtime contract audit
- Tool spec audit
- SEO audit
- Construction Tools Atlas validation
- PR mergeability recheck before merge
