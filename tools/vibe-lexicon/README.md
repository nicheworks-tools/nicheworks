# Vibe Lexicon — Base Structure Note

## Public root
- Public-facing files live at this tool root (`index.html`, `styles.css`, `app.js`) and page folders (`usage/`, `about/`, `pro/`, `ja/...`).
- English is the primary entry at root. Japanese lives under `ja/`.

## docs/
- `docs/` is for internal specification notes and planning context.
- It is not the runtime entrypoint for public pages.

## mock/
- `mock/` keeps working references and exploratory layouts.
- Mock files remain as non-canonical references while the public root is stabilized.

## Language policy
- English-first publication model.
- Japanese counterpart pages are maintained under `/ja/` with explicit language-separated URLs.

## Free-first policy
- Core features are planned to remain available without paywall.
- `pro/` exists as a roadmap disclosure page only; no paid gating behavior is wired.

## Helper file convention
- A tiny per-tool `app.js` helper is kept for shared metadata wiring (tool/page/lang).
- No extra framework or cross-tool runtime dependency is introduced at this stage.
