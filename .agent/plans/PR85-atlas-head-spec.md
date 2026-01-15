1. **Goal**
   - Apply NicheWorks common spec SEO v2 (spec-ja.md section 9) for consistent head metadata (favicons/manifest, canonical/hreflang, OGP/Twitter, JSON-LD) across Construction Tools Atlas pages.

2. **Scope**
   - targets:
     - tools/construction-tools-atlas/index.html
     - tools/construction-tools-atlas/pages/*.html
     - tools/construction-tools-atlas/howto/index.html
     - tools/construction-tools-atlas/howto/en/index.html
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - No out-of-scope edits.
   - Do not modify common-spec/spec-ja.md.
   - Do not change body/UI behavior; head-only updates.
   - Keep existing language scheme intact; update hreflang only where applicable.

4. **Change List**
   - For each scoped HTML file:
     - Ensure favicon and manifest links use absolute paths.
     - Ensure canonical uses https://nicheworks.app domain.
     - Ensure hreflang ja/en pairs (when applicable).
     - Normalize OGP/Twitter meta tags to use og:site_name, og:type, og:url, og:image, twitter:card, twitter:image.
     - Add minimal JSON-LD for Organization, WebSite, and WebPage with correct current URL.

5. **Step-by-step Procedure**
   1) Inspect existing head sections in all scoped files.
   2) Update favicon/manifest links to required absolute paths.
   3) Set canonical and hreflang values to nicheworks.app URLs.
   4) Normalize OGP/Twitter tags to fixed values and per-page og:url.
   5) Add minimal JSON-LD blocks for Organization, WebSite, WebPage.
   6) Re-check for any remaining nicheworks.pages.dev references in head.

6. **Test Plan**
   - No automated tests; manual verification:
     - Open each page and verify head tags are correct.
     - Confirm canonical/og:url match the page URL.
     - Confirm no nicheworks.pages.dev remains in head.

7. **Rollback Plan**
   - Use git revert on the commit to restore previous head sections.
