# ExecPlan: Vibe Lexicon non-index page full UI correction pass

## Scope
- Target only `tools/vibe-lexicon` non-index static pages and shared stylesheet adjustments needed for those pages.
- In scope:
  - `tools/vibe-lexicon/about/index.html`
  - `tools/vibe-lexicon/pro/index.html`
  - `tools/vibe-lexicon/usage/index.html`
  - `tools/vibe-lexicon/ja/about/index.html`
  - `tools/vibe-lexicon/ja/pro/index.html`
  - `tools/vibe-lexicon/ja/usage/index.html`
  - `tools/vibe-lexicon/styles.css` (only if required for shared non-index page quality)
- Out of scope (must not touch):
  - `tools/vibe-lexicon/index.html`
  - `tools/vibe-lexicon/ja/index.html`
  - `tools/vibe-lexicon/app.js` index catalog behavior
  - `tools/vibe-lexicon/data/terms.js`

## Files to touch
- The six non-index pages above.
- Potential minimal extension in `tools/vibe-lexicon/styles.css`.

## High-level steps
1. Inspect current non-index pages and existing shared visual language in `styles.css`.
2. Define a consistent, PC-first, text-first content structure for About / Usage / Pro pages.
3. Rewrite EN pages with production-quality copy and clear section hierarchy.
4. Rewrite JA pages with localized parity (not machine-literal, but matching intent and structure).
5. Apply focused CSS enhancements for spacing, readable width, section cards, status/info blocks, and responsive behavior.
6. Validate no prohibited files were modified and run basic checks.
7. Capture requested screenshots (EN desktop: usage/about/pro; JA mobile: usage/about/pro).
8. Commit changes and prepare PR summary.

## Manual verification for user
- Open each of the six pages and confirm:
  - Page has clear hero intro, structured sections, and readable desktop width.
  - Usage page keeps return link as text link (not button CTA).
  - Pro page has honest status (future-facing, no fake live payment UI).
  - Donation support block remains present and styled.
  - EN/JA pages show parity in section intent.
  - Mobile layout remains readable without excessive empty vertical gaps.
