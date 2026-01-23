# ExecPlan: PDF2CSV Local i18n (Task 02)

## Scope
- tools/pdf2csv-local/index.html
- tools/pdf2csv-local/usage.html
- tools/pdf2csv-local/howto.html
- tools/pdf2csv-local/faq.html
- tools/pdf2csv-local/app.js

## Goals
- Implement JP/EN language toggle on index + docs pages following v3 i18n guidance.
- Centralize UI strings in a dictionary for easy future additions.
- Persist language choice and default to browser language when unset.

## Steps
1. Inspect existing markup and language toggle behavior in target pages.
2. Move UI strings into a shared I18N dictionary in app.js.
3. Replace inline bilingual markup with data-i18n bindings for text, HTML, and meta attributes.
4. Implement language selection persistence via localStorage and browser default detection.
5. Manually verify language switch across all target pages.

## Manual Verification
- Open each page (index/usage/howto/faq), switch JP/EN, confirm main UI text and notes change.
- Refresh to confirm persisted language selection is applied.

