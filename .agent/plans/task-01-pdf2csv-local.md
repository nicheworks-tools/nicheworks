1. **Goal**
   - Scaffold the new `tools/pdf2csv-local/` tool and apply the NicheWorks common spec v3 skeleton (head/meta/JSON-LD, ad placeholders, donate block, internal links, responsive frame), following `common-spec/spec-ja.md` (including v2 additions such as SEO + JSON-LD).

2. **Scope**
   - targets: `tools/pdf2csv-local/index.html`, `tools/pdf2csv-local/style.css`, `tools/pdf2csv-local/app.js`, `tools/pdf2csv-local/usage.html`, `tools/pdf2csv-local/howto.html`, `tools/pdf2csv-local/faq.html`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation except the small footer-near internal links block allowed by spec v2 section 9-7.
   - Do not edit files outside `tools/pdf2csv-local/`.
   - Do not modify `common-spec/spec-ja.md`.
   - Follow language rules: provide JP/EN toggle (tool is not marked JP-only).
   - No new external dependencies.

4. **Change List**
   - `index.html`: add full head block (title/description/canonical/OGP/Twitter/favicon/JSON-LD), AdSense loader, Cloudflare beacon (copied from existing tool), language toggle, ad-top placement above UI, donate block (OFUSE + Ko-fi), internal links block, footer, usage text link.
   - `usage.html`, `howto.html`, `faq.html`: add same head requirements + JSON-LD, minimal doc layout (max-width 600px), no ads in body, and a link back to index.
   - `style.css`: add layout styles for main page (960–1200px max width), doc pages (600px max width), ad slots, donate block, internal links, and responsive breakpoints at 768px/480px including stacked controls and table-scroll wrapper frame.
   - `app.js`: provide language toggle skeleton and placeholder hooks only.

5. **Step-by-step Procedure**
   1) Create `tools/pdf2csv-local/` files with scaffolded HTML/CSS/JS.
   2) Copy AdSense + Cloudflare beacon snippets from an existing tool without modification.
   3) Add layout and responsive CSS rules required by spec.
   4) Verify all pages include head requirements and canonical URL.

6. **Test Plan**
   - Open `tools/pdf2csv-local/index.html` and confirm: ad-top appears above UI, donate block and internal links are near the footer, JP/EN toggle swaps copy, and layout fits within 960–1200px on desktop.
   - Open `usage.html`, `howto.html`, `faq.html` and confirm: max-width ~600px, no ad slots in body, and a link back to index.
   - Resize viewport to 768px and 480px to confirm stacked controls and table wrapper still readable.

7. **Rollback Plan**
   - `git restore tools/pdf2csv-local/` and delete the plan file if needed.
