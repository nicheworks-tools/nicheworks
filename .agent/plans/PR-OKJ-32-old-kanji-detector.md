# ExecPlan: PR-OKJ-32 Old Kanji inline detector

## Scope
- Target: `tools/old-kanji-reference/` only
- Out of scope: SEO audit/sitemap/tools-index/other tools

## Files to touch
- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/style.css`
- `tools/old-kanji-reference/app-meaning-v4.js`

## Steps
1. Inspect current UI/data flow and identify safe integration points for detector UI and detail panel linkage.
2. Add detector section in HTML with JA/EN labels, textarea, copy buttons, result area, and highlight preview.
3. Implement detection logic in JS using existing `entriesCache` map:
   - count occurrences per old char
   - de-duplicate result rows by old char
   - keep separate entries for distinct old chars that map to same modern char
   - render highlight text and result click -> existing detail panel
   - add copy old-only and copy pair-list actions
4. Add responsive CSS for 360px stability and no horizontal overflow.
5. Run required validation commands.

## Manual verification
- Use sample inputs in request and confirm detection/count/highlight/copy.
- Click detector result row and confirm detail panel opens.
- Confirm existing search/filter/detail/copy/lang switch still operate.
- Check 360px viewport has no horizontal scroll.
