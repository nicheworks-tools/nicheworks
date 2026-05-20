# ExecPlan: PR-OKJ-47 Place Old Kanji Checker

## Scope
- Target only `tools/place-old-kanji-checker/`.
- Read-only reference from `tools/old-kanji-reference/` data and nearby tool shell values.
- No changes to SEO audit, sitemap, tools-index/meta, or unrelated tools.

## Files to touch
- `tools/place-old-kanji-checker/index.html`
- `tools/place-old-kanji-checker/style.css`
- `tools/place-old-kanji-checker/app.js`
- Optional: `tools/place-old-kanji-checker/README.md` (if needed)

## Steps
1. Inspect existing Old Kanji Reference data format and nearby page shell values (analytics/ads/cloudflare/favicons).
2. Implement new static page shell with JP/EN UI, required notes, related links, and placeholders.
3. Implement browser-only app logic:
   - mandatory dict load
   - optional metadata safe-fail loads
   - reverse lookup from `old_to_new`
   - per-character result rendering
   - compatibility note + fallback detection
   - copy actions and toast
4. Add responsive styles for 360px behavior and readable warning panels.
5. Run required validations and confirm only target files changed.

## Manual verification
1. Open `/tools/place-old-kanji-checker/`.
2. Input `廣島`: confirm `廣 → 広` and detail link works.
3. Input `濱松`: confirm `濱 → 浜`.
4. Input `浜`: confirm reverse candidate includes `濱` if present.
5. Input `﨑`: confirm rendering/compatibility warning appears.
6. Switch EN and confirm English-only labels while keeping results visible.
7. Simulate optional metadata load fail and confirm dict pair output still works.
8. Check mobile 360px: no horizontal overflow, button wrapping OK.
