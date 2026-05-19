# ExecPlan: PR-OKJ-29 Old Kanji Reference metadata foundation

## Scope
- Target directory only: `tools/old-kanji-reference/`
- In-scope files:
  - `meta.json`
  - `meta-extra-2.json`
  - `meta-extra-3.json`
  - `meta-extra-4.json` (new)
  - `validate-meta.js`
  - `missing-meta.txt`
- Out of scope:
  - SEO audit related files
  - `sitemap.xml`
  - `tools-index.json`
  - Any other tools/apps

## Steps
1. Inspect current metadata/validator format and identify required schema gaps.
2. Update existing meta files to support `dataStatus`, `confidence`, `sourceNote` where needed without deleting existing entries.
3. Create `meta-extra-4.json` and add ~30 prioritized old-form entries (name/place-use heavy), with verified entries including required reading/meaning fields.
4. Update `validate-meta.js` to validate new fields and output expectations.
5. Regenerate/align `missing-meta.txt` with validator output.
6. Run validation checks and lightweight UI safety checks (syntax check; do not modify UI files).

## Manual verification for user
- Run:
  - `node --check tools/old-kanji-reference/validate-meta.js`
  - `node tools/old-kanji-reference/validate-meta.js`
- Confirm:
  - no fatal error
  - new `meta-extra-4.json` exists
  - entries increased around 30 for person/place-relevant old forms
  - `dataStatus/confidence/sourceNote` are accepted
  - UI pages still load as before (no UI files changed)
