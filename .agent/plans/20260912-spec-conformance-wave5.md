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

## Progress

- [x] Branch created from current main.
- [ ] Audit tools 61–65.
- [ ] Audit tools 66–70.
- [ ] Audit tools 71–75.
- [ ] Fix P0/P1 findings and synchronize affected specs.
- [ ] Add Wave 5 runtime-contract coverage.
- [ ] Reconcile final branch with latest main.
- [ ] Run CI, open PR, and merge only when green.

## Acceptance

Wave 5 closes only after all 15 tools have been inspected against their current specifications and active runtime, all discovered P0/P1 failures are fixed or explicitly justified, runtime-contract coverage reaches 75 tools, and relevant repository checks are green on the final integrated head.
