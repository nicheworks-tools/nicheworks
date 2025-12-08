1. Goal
   - Apply default JA/EN meta descriptions per common spec v2 (spec-ja.md section 9 SEO) to NicheWorks tools where descriptions are missing.
   - Generate a list of tools that received the default description so they can be manually refined later.

2. Scope
   - targets: `tools/*/index.html`
   - excluded: everything else

3. Rules / Prohibitions
   - No cross-tool navigation or layout changes beyond description meta updates.
   - Do not edit files outside `tools/*/index.html` and supporting report file.
   - Do not modify `common-spec/spec-ja.md`.
   - Respect language rules: keep existing JA/EN content; add defaults only when missing.

4. Change List
   - For each tool index.html: ensure JA and EN description meta + related OGP/Twitter/JSON-LD descriptions use existing text; if missing, insert default template values.
   - Update report file listing tools where default descriptions were applied.

5. Step-by-step Procedure
   1) Inspect each `tools/*/index.html` to see if JA/EN descriptions are present in meta/OGP/Twitter/JSON-LD.
   2) Where a language description is absent, fill with the provided default template values (keeping tool names/paths intact).
   3) Record the tool in a report list whenever a default description is used (JA, EN, or both).
   4) Re-run a quick check across tools to confirm descriptions now exist.
   5) Commit changes and prepare PR.

6. Test Plan
   - Open a few updated `index.html` files to confirm meta description, OGP description, Twitter description, and JSON-LD description all contain text in both JA and EN.
   - Ensure no layout/behavior changes (static HTML only).

7. Rollback Plan
   - Revert the commit or reset the modified files (`git checkout -- tools/*/index.html <report file>`).
