# Per-tool specification contract — wave 1

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

The repository has strong cross-cutting SEO and publication contracts, but the 87 registered NicheWorks tools also need a stable per-tool functional contract. `common-spec/spec-ja.md` remains the suite-wide source of truth; `tools/{slug}/SPEC.md` records current tool-specific behavior, language scope, persistence/privacy behavior, layout class, limits, and acceptance criteria so future cleanup work cannot silently change what a tool is for.

This PR establishes the specification standard, the full 87-tool manifest, and a read-only CI checker. Registry-order wave 1 adds 15 new substantive specs. During implementation one pre-existing `tools/screenshot-stitcher/SPEC.md` was discovered; it was preserved and migrated into the common format, bringing the actual completed coverage to 16 tools rather than hiding or deleting it.

## Progress

- [x] Confirmed base main HEAD `bc03ed5ba84c47b7f7409feee09cbc29d31db9c5` after PR #507.
- [x] Confirmed `tools/tools-index.json` contains 87 registered tools.
- [x] Confirmed the common specification requires tool-specific language/layout decisions.
- [x] Created branch `feat/tool-spec-contract-wave1-20260912` from the exact main commit.
- [x] Added `docs/tool-spec-standard.md` and the full 87-tool coverage manifest.
- [x] Added `scripts/check-tool-spec-contract.mjs` and `.github/workflows/tool-spec-audit.yml`.
- [x] Inspected current implementation and added substantive specs for the 15 registry-order wave-1 tools.
- [x] Discovered the existing Screenshot Stitcher v1.1 spec; migrated its existing functional/quality requirements into the new standard and tracked it as complete.
- [x] Raised the monotonic coverage floor to 16 complete / 71 pending.
- [x] Confirmed PR changed files contain only plan/workflow/standard/checker/manifest/SPEC documentation; production HTML/JS/CSS is unchanged.
- [x] Tool spec audit run `34670919148` completed successfully, including the clean-working-tree step.
- [ ] Squash merge PR #508 and confirm main-side tool-spec audit.

## Wave 1 scope

New substantive specs added in registry order:

1. `ai-interaction-atlas`
2. `ai-project-pack`
3. `analytics-privacy-kit`
4. `api-key-token-redactor`
5. `ats-paste-doctor`
6. `codex-product-shipping-playbooks`
7. `codex-usage-forecaster`
8. `codex-work-os`
9. `cold-email-requirement-checker`
10. `color-replace`
11. `command-safety-checker`
12. `construction-tools-atlas`
13. `contract-cleaner`
14. `contract-risk-highlighter`
15. `cosmetic-ingredient-checker-lite`

Additional existing spec migrated and retained:

16. `screenshot-stitcher`

## Surprises & Discoveries

- The initial code search did not reveal an existing per-tool convention, but the first CI run correctly detected `tools/screenshot-stitcher/SPEC.md` as an untracked existing specification. The file contained real functional and quality requirements and therefore must be preserved, not overwritten by a placeholder or ignored.
- Several registered items are repository/reference guides rather than interactive browser transformers (`ai-project-pack`, `codex-product-shipping-playbooks`, `codex-work-os`). Their specs therefore use `None` for user data inputs and treat external GitHub navigation/documentation as the current functional contract.
- Some tools load suite-wide analytics/advertising while their actual transformation remains local. Specs deliberately distinguish “tool input is not uploaded by the workflow” from the inaccurate claim that the page makes no network requests.
- `cosmetic-ingredient-checker-lite` explicitly implements a Japanese-only UI. The spec records that exception so a future generic bilingual cleanup cannot silently add/remove language scope.
- `contract-risk-highlighter` contains inconsistent copy around PDF extraction. The truthful current contract is pasted contract text as input; Pro PDF means browser Print/Save PDF of review output. The spec records that boundary without changing production behavior in this documentation PR.

## Decision Log

- Decision: store individual specifications at `tools/{slug}/SPEC.md`.
  Rationale: the contract belongs next to the implementation and is easy for humans and coding agents to discover.
  Date: 2026-09-12.

- Decision: do not duplicate the entire common specification inside every tool spec.
  Rationale: `common-spec/spec-ja.md` remains authoritative for suite-wide rules; individual specs hold only tool-specific contracts.
  Date: 2026-09-12.

- Decision: do not create placeholder specs for pending tools.
  Rationale: pending state belongs in the manifest; a TODO file would create false confidence.
  Date: 2026-09-12.

- Decision: maintain a complete 87-tool manifest with `complete` / `pending` states and a monotonically non-decreasing `required_complete` floor.
  Rationale: CI can prevent completed specifications from silently disappearing.
  Date: 2026-09-12.

- Decision: specs describe current implemented behavior, not aspirational roadmap features.
  Rationale: the contract is intended for regression control and quality review.
  Date: 2026-09-12.

- Decision: every complete spec explicitly declares language mode and layout class.
  Rationale: these are tool-specific decisions required by the common responsive/language rules.
  Date: 2026-09-12.

- Decision: preserve and migrate the existing Screenshot Stitcher v1.1 specification, increasing wave-1 completion to 16.
  Rationale: it contained substantive current requirements; deleting or leaving it untracked would weaken the contract layer.
  Date: 2026-09-12.

## Specification structure

Each complete `SPEC.md` contains the exact standard identity block plus:

- purpose and intended job;
- current functional contract;
- inputs;
- outputs;
- state / persistence;
- privacy / network behavior;
- language mode;
- layout class (`mobile-oriented`, `pc-oriented`, or `hybrid`);
- limits / non-goals;
- testable acceptance criteria;
- implementation evidence.

## Validation and Acceptance

Acceptance requires:

- manifest has exactly the same 87 slugs as `tools/tools-index.json`, with no duplicates or extras;
- `required_complete` is 16 and actual coverage is 16 complete / 71 pending;
- every complete spec exists at `tools/{slug}/SPEC.md` with matching identity and all 11 required headings;
- language and layout declarations use allowed values;
- every complete spec contains at least three checklist acceptance criteria;
- no pending registered tool has an untracked `SPEC.md`;
- production HTML/JS/CSS is unchanged by this PR;
- tool-spec CI and existing repository checks remain green.

## Idempotence and Recovery

The checker is read-only. Specs and manifest are documentation/contract files only. All writes remain on `feat/tool-spec-contract-wave1-20260912`; main changes only through squash merge.

## Outcomes & Retrospective

The repository now has a machine-checked individual-specification layer for 16 of 87 tools. The remaining 71 tools are explicitly visible as pending rather than implicitly undocumented. This converts the next quality waves from broad visual/code cleanup into contract-driven review: inspect implementation, write/verify the spec, then repair deviations in bounded follow-up PRs.

## Artifacts and Notes

- Base/main SHA: `bc03ed5ba84c47b7f7409feee09cbc29d31db9c5`.
- Parent quality work: PR #502 through #507.
- Successful PR tool-spec audit: run `34670919148`, job `103491989710`.

## Interfaces and Dependencies

No new package dependency is required. The checker uses Node.js built-ins and reads `tools/tools-index.json`, `tools/tool-spec-manifest.json`, and `tools/{slug}/SPEC.md`.
