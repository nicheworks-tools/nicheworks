# ExecPlan: OKJ-48 Old Document Kanji Highlighter

## Scope
- Target only: `tools/old-document-kanji-highlighter/`
- Reuse read-only data from: `tools/old-kanji-reference/*.json`
- Do not modify unrelated tools or SEO/index/sitemap metadata files.

## Files to touch
- `tools/old-document-kanji-highlighter/index.html`
- `tools/old-document-kanji-highlighter/style.css`
- `tools/old-document-kanji-highlighter/app.js`

## Steps
1. Inspect existing nearby tool shell for analytics/ad/cloudflare snippets and shared UI conventions.
2. Implement static page shell with JP/EN labels, required meta, canonical, related links, privacy note, and placeholders.
3. Implement browser-only app logic:
   - load dict + optional metadata safely
   - analyze/count matches
   - safe highlighted rendering via DOM APIs
   - detected cards with metadata + compatibility notes + fallback notes
   - modern mechanical preview
   - copy actions + clipboard fallback + toast
   - language switching with no mixed labels
4. Style for desktop/mobile (including 360px no overflow and wrapping behavior).
5. Run required validation commands.

## Manual verification
1. Open `/tools/old-document-kanji-highlighter/`.
2. Paste `舊字體で書かれた國の文章を讀む` and confirm highlighting/list/preview.
3. Paste `古い驛名と縣の資料` and confirm highlight for `驛` and `縣` if mapped.
4. Paste `﨑` and confirm rendering/compatibility note appears.
5. Click highlighted character and confirm matching card is focused/scrolled.
6. Test copy buttons: old forms only / pair table / modern preview.
7. Switch EN and confirm labels become English-only while results persist.
8. (Optional) simulate metadata load failure and confirm dict-based highlighting still works.
9. Check 360px width for no horizontal overflow and wrapping buttons/text.
