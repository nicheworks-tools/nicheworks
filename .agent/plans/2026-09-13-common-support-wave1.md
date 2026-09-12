# ExecPlan — Common support hard-gap repair wave

## Scope

Close the eight confirmed hard common-spec gaps recorded by the Phase 1 all-tool quality matrix. All eight gaps have the same root cause: the main tool surface lacks the mandatory NicheWorks support block with both OFUSE and Ko-fi.

Target tools:

- `ats-paste-doctor`
- `message-generator`
- `old-document-kanji-highlighter`
- `old-kanji-ocr-scanner`
- `place-old-kanji-checker`
- `unicode-kanji-checker`
- `url-title-collector`
- `variant-kanji-compare`

## Files allowed to change

- the target tools' public `index.html` files, plus `tools/url-title-collector/en/index.html` when present
- `assets/nw-support.css`
- the eight matching `docs/tools/<slug>.md` canonical records
- `audits/tool-quality-matrix.json`
- `audits/tool-quality-matrix.md`
- `scripts/check-common-support-contract.mjs`
- `.github/workflows/tool-spec-audit.yml`
- this ExecPlan

A temporary branch-only apply workflow may be created solely to run the deterministic repair script, then must be deleted before the PR is opened.

## Implementation contract

1. Preserve every tool's runtime behavior, language mode, analytics/advertising identifiers, Pro/billing behavior, SEO metadata, and existing internal links.
2. Add only a quiet footer-near support block using the common-spec OFUSE and Ko-fi destinations.
3. Use one shared support stylesheet under `/assets/`; do not duplicate support CSS per tool.
4. Update the canonical audit records and matrix from `FIX` to `PASS` only after the support evidence exists.
5. Preserve all recommendation-only usage/FAQ/test gaps as recommendations; do not turn them into blockers or silently claim they are fixed.
6. Add a permanent read-only checker so the eight support blocks cannot regress.

## Verification

- Every target public page contains both `https://ofuse.me/nicheworks` and `https://ko-fi.com/nicheworks`.
- The support surface is footer-near and separate from ads and primary actions.
- The eight canonical audit records say support evidence is present and audit state is `PASS`.
- Quality matrix counts become PASS 87 / FIX 0 / BLOCKED 0 / NEEDS_DECISION 0 if no new unrelated hard gap exists.
- `node scripts/check-common-support-contract.mjs` passes without modifying the repository.
- Existing Tool spec audit, Tool runtime contract audit, and SEO audit remain green.
