1. **Goal**
   - Prepare aligned English-primary public scaffolding for `ui-atlas`, `vibe-lexicon`, and `motion-atlas` under `tools/`, with EN root + `ja/` subtree and no paid gating behavior.

2. **Scope**
   - targets:
     - `tools/ui-atlas/*` (excluding existing `docs/*` and `mock/*` content edits)
     - `tools/vibe-lexicon/*` (excluding existing `docs/*` and `mock/*` content edits)
     - `tools/motion-atlas/*` (excluding existing `docs/*` and `mock/*` content edits)
     - add one plan file under `.agent/plans/`
   - excluded:
     - all other tools, `apps/`, `_archive/`, and `common-spec/`

3. **Rules / Prohibitions**
   - Keep files inside each tool root public-facing (no moving into nested build folders).
   - Preserve `docs/` as specification notes and `mock/` as working references.
   - No cross-tool nav menu; only per-tool local page links and EN/JA counterpart links.
   - No always-visible logo image in header.
   - Keep `ad-top`, optional `ad-bottom`, and donation area as separate blocks.
   - Static HTML/CSS/JS only; no paid gating implementation.

4. **Change List**
   - Create consistent pages in each tool:
     - `index.html`, `usage/index.html`, `about/index.html`, `pro/index.html`
     - `ja/index.html`, `ja/usage/index.html`, `ja/about/index.html`, `ja/pro/index.html`
   - Add root shared files per tool: `styles.css`, `app.js`.
   - Add `data/` directory with placeholder JSON.
   - Add short per-tool root README note covering public root/docs/mock/language/free-first policy.

5. **Step-by-step Procedure**
   1. Inspect common spec and per-tool specs for required language/layout policies.
   2. Create aligned directory structure and pages for each tool.
   3. Wire consistent relative links and shared class naming conventions.
   4. Add minimal JS helper pattern (per-tool `app.js`) without introducing overengineering.
   5. Run checks to ensure no broken internal refs in created files.

6. **Test Plan**
   - Run `find` on the three tools to verify required files/directories exist.
   - Run `rg` checks for required page links and scripts.
   - Run `git diff --stat` for review scope.

7. **Manual Verification for User**
   - Open each EN/JA page pair and confirm language separation and reciprocal links.
   - Confirm ad-top, ad-bottom placeholder, and donation area are visually separate blocks.
   - Confirm `docs/` and `mock/` remain available as internal references.
