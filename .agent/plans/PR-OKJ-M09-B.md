# ExecPlan PR-OKJ-M09-B

- Scope: tools/name-old-kanji-checker, tools/place-old-kanji-checker, tools/old-document-kanji-highlighter, tools/unicode-kanji-checker, tools/variant-kanji-compare
- Files: each tool HTML/CSS/JS as needed for static locked Pro panel and i18n text wiring
- Steps:
  1) Verify repository and required directories exist
  2) Inspect existing i18n/rendering patterns per tool
  3) Add locked Pro panel markup/styles/text in existing language system
  4) Validate no prohibited files changed and run node --check for changed JS
  5) Commit and prepare PR message
- Manual verification:
  - Confirm panel appears in all five tools at requested placement
  - Confirm JP/EN text switches with no mixing
  - Confirm CTA disabled with aria-disabled=true and no Stripe links
  - Confirm mobile 360px has no horizontal scroll
