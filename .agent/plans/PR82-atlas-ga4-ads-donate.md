1. **Goal**
   - Ensure GA4 + AdSense loaders, consistent ad slots, and donation buttons across Construction Tools & Slang Atlas pages in `tools/construction-tools-atlas`, while keeping layout mobile-safe and updating any remaining URL hygiene per spec.

2. **Scope**
   - targets:
     - `tools/construction-tools-atlas/index.html`
     - `tools/construction-tools-atlas/pages/about.html`
     - `tools/construction-tools-atlas/pages/method.html`
     - `tools/construction-tools-atlas/pages/disclaimer.html`
     - `tools/construction-tools-atlas/pages/credits.html`
     - `tools/construction-tools-atlas/howto/index.html`
     - `tools/construction-tools-atlas/howto/en/index.html`
     - `tools/construction-tools-atlas/style.css`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation or header-based global nav additions.
   - Do not edit files outside the scope above.
   - Do not modify `common-spec/spec-ja.md` or `spec.md`.
   - Keep layout minimal and mobile-safe (360px).
   - Do not add new dependencies or localStorage requirements.

4. **Change List**
   - Add AdSense loader in `<head>` for pages missing it.
   - Add a shared top ad slot markup (`.ad-slot.ad-top`) near top of content on pages without it.
   - Add a shared donation links block (Ko-fi + OFUSE) in the footer (single placement).
   - Add shared CSS for `.ad-slot`, `.ad-top`, `.ad-bottom`, `.donation-links`, `.donation-link` in `style.css` and mirror in inline styles for how-to pages.
   - Confirm URLs use `https://nicheworks.app` only.

5. **Step-by-step Procedure**
   1. Inspect all target HTML files for GA4, AdSense, ad-slot markup, and donation blocks.
   2. Add AdSense loader to missing pages’ `<head>`.
   3. Insert `.ad-slot.ad-top` near the top of content on missing pages.
   4. Insert donation block in footer for each page.
   5. Update `style.css` and inline styles for consistent ad-slot and donation styling.
   6. Re-scan for `nicheworks.pages.dev` references.

6. **Test Plan**
   - Open each target page and verify:
     - GA4 loader and AdSense loader present in `<head>`.
     - One top ad slot visible near content start.
     - Donation buttons visible and do not overflow at 360px width.
   - Run `rg "nicheworks\\.pages\\.dev" tools/construction-tools-atlas -S` and confirm zero matches.

7. **Rollback Plan**
   - Revert the changed files with `git checkout -- <files>` if layout or scripts regress.
