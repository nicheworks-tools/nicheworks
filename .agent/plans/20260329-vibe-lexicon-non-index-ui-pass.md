# ExecPlan: Vibe Lexicon non-index page full UI correction pass

## Scope
- Target directory: `tools/vibe-lexicon/`
- Files to touch:
  - `tools/vibe-lexicon/styles.css`
  - `tools/vibe-lexicon/about/index.html`
  - `tools/vibe-lexicon/usage/index.html`
  - `tools/vibe-lexicon/pro/index.html`
  - `tools/vibe-lexicon/ja/about/index.html`
  - `tools/vibe-lexicon/ja/usage/index.html`
  - `tools/vibe-lexicon/ja/pro/index.html`
- Explicitly untouched:
  - `tools/vibe-lexicon/index.html`
  - `tools/vibe-lexicon/ja/index.html`
  - `tools/vibe-lexicon/app.js` core index behavior
  - `tools/vibe-lexicon/data/terms.js`

## High-level steps
1. Inspect existing EN/JA non-index pages and shared CSS to identify placeholder-like UI issues.
2. Refactor static-page HTML structure and copy for About/Usage/Pro (EN+JA) into production-quality support/product reference pages.
3. Add scoped `.vl-static-page` styles in `styles.css` to deliver deliberate desktop-first layouts with sensible mobile adaptation, without altering index-page behavior.
4. Validate formatting and parity across EN/JA pages.
5. Capture requested screenshots (EN desktop: usage/about/pro, JA mobile: usage/about/pro).
6. Run quick checks (`git diff`, optional html lint via visual/manual inspection), then commit and prepare PR message.

## Manual verification steps
- Open each of the six pages and confirm:
  - Strong intro/hero and section hierarchy.
  - Readable desktop width and spacing.
  - Usage links remain text links (not button CTAs).
  - Donation block remains present and properly styled.
  - Pro page honestly states planned status (no fake live paywall UI).
- Confirm EN/JA parity in structure and intent.
- Verify mobile rendering (JA pages) and desktop rendering (EN pages) from screenshots.
