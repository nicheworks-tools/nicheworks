# ExecPlan PR-OKJ-35

## Scope
- tools/old-kanji-reference/index.html
- tools/old-kanji-reference/app-meaning-v4.js
- tools/old-kanji-reference/style.css (only if needed)
- tools/kanji-modernizer/index.html
- tools/kanji-modernizer/app.js
- tools/kanji-modernizer/style.css (only if needed)

## Steps
1. Inspect existing markup/scripts for search, detector, card actions, detail panel, i18n, and converter input flow.
2. Implement Old Kanji Reference -> Kanji Modernizer actions (card, detail, detector full text), plus q/text URL parameter handling in old-kanji-reference.
3. Implement Kanji Modernizer q parameter intake and return link to old-kanji-reference with current input.
4. Add minimal CSS for mobile-safe action layout if needed.
5. Run required validation checks and review git diff scope.

## Manual verification
1. /tools/old-kanji-reference/?q=舊 preloads search and renders expected mapping.
2. Card/detail action opens kanji-modernizer with q for selected character.
3. Detector full-text button sends textarea content; empty text shows localized toast.
4. /tools/kanji-modernizer/?q=舊字體 preloads input and conversion remains usable.
5. Kanji Modernizer return link opens old-kanji-reference with current input in q.
6. JP/EN toggles localize all new labels without mixing languages.
