# ExecPlan — UI Atlas fix pass

## Scope
- tools/ui-atlas/index.html
- tools/ui-atlas/ja/index.html
- tools/ui-atlas/app.js
- tools/ui-atlas/styles.css
- tools/ui-atlas/about/index.html
- tools/ui-atlas/usage/index.html
- tools/ui-atlas/pro/index.html
- tools/ui-atlas/ja/about/index.html
- tools/ui-atlas/ja/usage/index.html
- tools/ui-atlas/ja/pro/index.html

## Files to touch
Only the files listed in scope.

## Steps
1. Inspect current index/app/styles mobile compare and CTA behavior.
2. Implement a stable mobile sticky compare bar + panel model without duplicating compare UIs or changing compare max behavior.
3. Rebalance card CTA emphasis and preserve selected state clarity.
4. Improve desktop detail panel inner horizontal spacing while keeping three-column layout.
5. Style donation links as quiet but clear button controls across all UI Atlas pages.
6. Rebuild EN/JA usage/about/pro content into substantial product-support pages.
7. Run basic static checks and capture screenshots for required proof.
8. Commit and prepare PR message summarizing all required proof points.

## Manual verification
- Mobile: add 1-2 compare items from cards, confirm sticky compare bar remains reachable near active browsing and clear/reset is obvious.
- Mobile: confirm 0-selected state is compact/quiet.
- Desktop: confirm right detail column has clear inner side padding.
- All pages: confirm support links render as button-like controls (not plain text links).
- EN/JA non-index pages: confirm content is substantial and aligned in structure/quality.
