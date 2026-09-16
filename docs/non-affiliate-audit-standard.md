# NicheWorks non-affiliate 72-tool audit standard

Status: active audit contract  
Updated: 2026-09-16

## Scope

This audit covers only the tools defined by `audits/non-affiliate-scope.json`.

- Registered tools: 88
- Affiliate workstream: 16 — explicitly excluded here
- Non-affiliate workstream: 72
- Audit waves: 6
- Tools per wave: 12

Wave assignment is deterministic: take `tools/tools-index.json` in registry order, remove the 16 Affiliate slugs, then split the remaining 72 into consecutive groups of 12.

The existing `audits/tool-quality-matrix.json` remains valid evidence, but its `PASS` state is not a completion gate for this program. In particular, a tool may currently be `PASS` there while behavior-level regression coverage is still missing. This stricter audit is intended to identify the remaining work required before a tool is treated as complete.

## Audit discipline

Audit PRs and repair PRs are separate.

An audit wave may update audit evidence, specifications when they are factually stale, and audit-only tooling. It must not silently repair production behavior just to obtain a better audit result. Production defects discovered in a wave are recorded as findings and repaired later in dedicated PRs.

Every audited tool must be inspected against its current `tools/{slug}/SPEC.md`, runtime implementation, relevant data files, current tests/checkers, common specification, and the existing quality matrix. Search/traffic/monetization evidence may be attached where relevant, but low traffic does not excuse a functional defect.

## Required categories

Every tool receives a result for all of these categories:

1. `identity_spec` — registry identity, public URL, title/purpose and SPEC alignment.
2. `core_behavior` — principal happy paths and actual outputs match the documented contract.
3. `error_empty_states` — invalid, empty, unsupported and failure paths are safe and understandable.
4. `data_correctness` — static/reference data, formulas, mappings and source-backed claims are internally consistent and sufficiently evidenced for the tool's job.
5. `privacy_network` — local/remote processing, external requests and user-data handling match the declared contract.
6. `persistence` — browser storage, restore/reset behavior and state boundaries are correct where applicable.
7. `responsive_ui` — primary workflows remain usable at narrow and wide widths appropriate to the tool's layout class.
8. `accessibility` — labels, keyboard-relevant controls, semantic structure and obvious contrast/interaction defects are checked.
9. `language` — JA/EN or explicit language exception matches the tool contract without broken or misleading mixed-language states.
10. `seo_technical` — indexability, canonical, title/description, headings, structured data and internal discoverability are technically coherent.
11. `seo_content` — landing copy and supporting pages explain the real job accurately and do not rely on generic/thin boilerplate where search intent requires substance.
12. `analytics` — GA4/common analytics are present as required and meaningful tool outcomes can be distinguished where the current product contract needs them.
13. `monetization_contract` — current monetization class is respected; legacy Pro/affiliate code must not contradict the canonical classification.
14. `regression_tests` — critical transformations and failure paths have behavior-level automated coverage, or an explicit evidence-backed `NOT_APPLICABLE` reason exists for a genuinely non-interactive surface.

## Category result states

- `PASS`
- `ISSUE_MINOR`
- `ISSUE_MAJOR`
- `BLOCKED`
- `NOT_APPLICABLE`

`NOT_APPLICABLE` requires a reason and evidence. It must not be used merely because testing a category is inconvenient.

## Overall states

- `PASS` — all required categories are `PASS` or justified `NOT_APPLICABLE`, with no open findings.
- `MINOR_FIX` — only bounded non-blocking defects remain.
- `MAJOR_FIX` — a functional, data, privacy, major UX/SEO, monetization-contract or regression-coverage gap remains.
- `BLOCKED` — completion cannot be judged because required evidence or an external dependency is unavailable.
- `HOLD_REVIEW` — the tool belongs to canonical `HOLD` and has been audited, but product completion/retention still requires a deliberate decision.

There is no automatic upgrade from the old quality-matrix `PASS` to this audit's `PASS`.

## Required record evidence

Each wave record must include:

- `slug`
- `monetization_class`
- `overall_state`
- `last_audited_sha`
- `audited_at`
- one result for every required category
- evidence paths or evidence notes for conclusions
- explicit findings with severity and repair direction when anything is not clean

A `PASS` record is invalid when any category is unresolved or any finding remains open.

## Completion sequence

1. Audit all six waves without mixing in production repairs.
2. Aggregate findings by shared/common issue versus tool-specific issue.
3. Repair shared defects first.
4. Repair tool-specific `MAJOR_FIX` findings, then `MINOR_FIX` findings.
5. Re-audit affected records against the repair commit.
6. Only after every non-HOLD tool reaches strict `PASS` and each HOLD tool has a deliberate disposition is the 72-tool quality pass complete.
