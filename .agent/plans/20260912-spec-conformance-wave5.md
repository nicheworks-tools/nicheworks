# SPEC conformance audit — wave 5

## Purpose

Continue the 87-tool implementation-quality cycle by auditing registry tools 61–75 against their complete per-tool specifications and current active runtime.

## Base and scope

- Base main SHA: `414aea942980cca85b594e9c56f94f90a4383a68`.
- Branch: `audit/spec-conformance-wave5-20260912`.
- Scope: registry tools 61–75.

## Wave 5 tools

1. `ops-weekly-report-generator`
2. `outsource-spec-generator`
3. `pages-deploy-guide`
4. `pattern-atlas`
5. `pdf-page-tools-mini`
6. `pdf2csv-local`
7. `place-old-kanji-checker`
8. `product-founder-os`
9. `redirect-unwrapper`
10. `release-guardian`
11. `rename-wizard`
12. `screenshot-stitcher`
13. `size-converter`
14. `sponsor-page-builder`
15. `sql-db-risk-checker`

## Audit method

For each tool:
1. Read `SPEC.md` acceptance criteria and implementation evidence.
2. Inspect the public page and active runtime actually loaded.
3. Verify privacy/network, persistence, language, limits, export/copy, billing/gating, and safety/non-goal boundaries.
4. Classify findings P0/P1/P2.
5. Fix every in-scope P0/P1 and synchronize affected specifications.
6. Preserve runtime-contract coverage for tools 1–60 and add Wave 5 coverage for tools 61–75.
7. Reconcile with latest main before PR; do not overwrite newer accepted parallel work.
8. Merge only when runtime/spec/SEO repository checks are green.

## Priority

- P0: privacy/security/data loss, false trust/safety claim, destructive behavior, broken core action.
- P1: material acceptance-criterion failure, broken state/export/language/network contract, billing bypass, or materially misleading behavior.
- P2: cleanup, dead code, copy precision, or edge-case hardening that does not block the core contract.

## Findings and fixes

### P0

None found in this wave.

### P1 — Outsource Spec Generator accepted unrelated active entitlement

The shared Pro bridge previously trusted `status.active` without checking which entitlement produced that active state. A product-scoped entitlement for another tool could therefore be interpreted as common NicheWorks Pro.

Fix:
- require both `status.active` and `status.entitlement === 'nicheworks_pro'`;
- keep all Free generation/copy paths unchanged;
- update the specification to make cross-product entitlement isolation explicit.

### P1 — Pages Deploy Guide local code was forgeable

The existing `NW-PDG-...` code was validated entirely by a public client-side checksum and persisted in `pdg_pro_key`. Anyone could construct a valid code without purchase, so it was not an entitlement boundary.

Fix:
- load the shared `/assets/nw-pro.js` client before the tool runtime;
- add `pro-bridge.js`, which treats active shared `nicheworks_pro` as the only authoritative Pro source;
- remove a forged/stale `pdg_pro_key` before the legacy app initializes when shared Pro is inactive;
- when shared Pro is valid, provide only a temporary compatibility value for the old app and remove it immediately after initialization;
- hide the legacy manual activation controls from the public workflow and update public copy/specification to the shared Pro model.

### P1 — SQL DB Risk Checker could mistake nested WHERE for row limiter

The active SQL checker used `/\bwhere\b/i` for UPDATE/DELETE risk detection. An UPDATE with no outer row-limiting WHERE but a WHERE inside a nested subquery could suppress the full-table warning.

Fix:
- install a top-level WHERE scanner that ignores quoted text and nested parentheses;
- preserve existing destructive/read-only/environment rules;
- add a runtime executable regression test proving nested-only WHERE returns false while a true outer WHERE returns true;
- synchronize the specification and implementation evidence.

## No P0/P1 findings in the other twelve tools

The following were checked against their active runtime/current specification with no material P0/P1 mismatch found:

- `ops-weekly-report-generator`
- `pattern-atlas`
- `pdf-page-tools-mini`
- `pdf2csv-local`
- `place-old-kanji-checker`
- `product-founder-os`
- `redirect-unwrapper`
- `release-guardian`
- `rename-wizard`
- `screenshot-stitcher`
- `size-converter`
- `sponsor-page-builder`

Notable verified boundaries include browser-local report/sponsor drafting; Pattern Atlas cultural-warning acknowledgement before flagged export; PDF Page Tools bundled local processing; PDF2CSV's 30 MB/selectable-text/no-OCR boundary with only the SheetJS library loader using its external CDN; filename-only Rename Wizard behavior; and Redirect Unwrapper's no-fetch string analysis.

## Runtime regression coverage

`scripts/check-tool-runtime-contracts-wave5.mjs` covers registry tools 61–75 and is wired into `.github/workflows/tool-runtime-contract-audit.yml` after the existing waves 1–4 checks.

Wave 5 adds structural/executable checks for:

- Ops required-field gating and bilingual local exports;
- Outsource shared-entitlement isolation;
- Pages Deploy shared-Pro adapter, script order, legacy-code cleanup, and compatibility checksum validity;
- Pattern Atlas dataset/export/cultural-warning flow;
- PDF page range/protection behavior and PDF2CSV no-OCR/local-bytes boundary;
- Old Kanji same-site reference lookup and official-use caution;
- Product Founder OS / Release Guardian documentation-only boundaries;
- Redirect Unwrapper no-fetch behavior;
- Rename Wizard filename-only processing;
- Screenshot Stitcher local supported formats and split export;
- Size Converter local heuristic/reference behavior;
- Sponsor Page Builder tier/missing-price behavior;
- SQL destructive/read-only rules and an executable nested-vs-top-level WHERE regression test.

## Verification

PR `#586` on head `0d0336ef4c624c183d65355fdf6b76f13cb350c9` passed the first integrated CI cycle:

- Tool runtime contract audit: run `34698081521` — success.
- Tool spec audit: run `34698081522` — success.
- Pro migration safety: run `34698081526` — success.
- Validate Construction Tools Atlas Data: run `34698081555` — success.
- SEO audit: run `34698081592` — success.

The PR was `mergeable: true` after those checks. This documentation-only commit records the verified state; the final head must rerun the same relevant checks before merge.

## Progress

- [x] Branch created from current main.
- [x] Audit tools 61–65.
- [x] Audit tools 66–70.
- [x] Audit tools 71–75.
- [x] Fix P0/P1 findings and synchronize affected specs.
- [x] Add Wave 5 runtime-contract coverage.
- [x] Reconcile final branch with latest main.
- [x] Open PR and complete first integrated CI cycle.
- [ ] Rerun CI on final documentation head and merge only when green.

## Acceptance

Wave 5 closes only after all 15 tools have been inspected against their current specifications and active runtime, all discovered P0/P1 failures are fixed or explicitly justified, runtime-contract coverage reaches 75 tools, and relevant repository checks are green on the final integrated head.
