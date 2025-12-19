1. **Goal**
   - Install and normalize the Cloudflare Web Analytics beacon with token `aeec938336694c99bc864cdf859b5e37` across the mother ship and all tools.
   - Aligns with the common spec requirement to include the Cloudflare analytics snippet (spec-ja v2 common blocks).

2. **Scope**
   - targets: all `*.html` and `*.htm` files under the repository root and `tools/**`, `apps/**`, `templates/**`, and other site content.
   - excluded: `.git`, `node_modules`, `dist`, `build`, `.next`, `.vercel`, `_archive`.

3. **Rules / Prohibitions**
   - No cross-tool navigation or new shared headers/footers.
   - Do not move or rename files; only insert/normalize the beacon snippet.
   - Do not modify `common-spec/*`.
   - Keep all unrelated content unchanged (no reformatting or incidental edits).

4. **Change List**
   - For each targeted HTML/HTM file, ensure the exact beacon snippet is present immediately before `</head>`.
   - Normalize existing Cloudflare beacon tags so `data-cf-beacon` uses token `aeec938336694c99bc864cdf859b5e37`.
   - Add files to version control only if modified for the beacon.

5. **Step-by-step Procedure**
   - Enumerate HTML/HTM files excluding forbidden directories.
   - Inspect each file for the Cloudflare beacon; insert the required snippet before `</head>` when missing.
   - If a beacon exists, adjust `data-cf-beacon` to the exact token while leaving other content untouched.
   - Re-scan all HTML/HTM files to confirm presence of `beacon.min.js` and the correct token.
   - Summarize counts: total scanned, OK, changed, remaining NG.

6. **Test Plan**
   - After edits, spot-check a few pages in both mother site and tools to ensure layout remains unchanged around `<head>`.
   - Confirm via search that every HTML/HTM includes the beacon with the correct token and there are no duplicates.

7. **Rollback Plan**
   - Revert the commit or reset the branch to the previous state (`git reset --hard` to prior commit / checkout main`).
