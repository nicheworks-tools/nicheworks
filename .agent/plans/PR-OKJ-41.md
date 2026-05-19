# ExecPlan PR-OKJ-41
- Scope: tools/old-kanji-reference/
- Files: meta-extra-6.json, missing-meta.txt, validate-meta.js (if needed), app-meaning-v4.js (if needed)
- Steps:
  1) Inspect dict/meta coverage and validator/app loading.
  2) Generate meta-extra-6.json with missing entries classified (default pair_only).
  3) Update loader/validator only where required for meta-extra-6 and schema rules.
  4) Run validator and JS syntax checks; refresh missing-meta.txt.
  5) Confirm diff limited to target scope and commit.
- Manual verification:
  - Run validator output and confirm missing count 0.
  - Open tool and ensure unresolved entries render as mapping-only without UI behavior change.
