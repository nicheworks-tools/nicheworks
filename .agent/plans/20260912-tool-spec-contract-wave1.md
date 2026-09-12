# Per-tool specification contract — wave 1

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

The repository now has strong cross-cutting SEO and publication contracts, but the 87 registered NicheWorks tools still lack a consistent per-tool functional specification layer. `common-spec/spec-ja.md` defines suite-wide rules, yet several of those rules explicitly require tool-by-tool decisions (for example language exceptions and mobile/PC layout classification). Without a per-tool specification, future repairs can satisfy common CI while silently changing a tool's intended behavior.

This PR establishes a human-readable `tools/{slug}/SPEC.md` contract, a complete 87-tool coverage manifest, and a CI checker. Wave 1 writes substantive specifications for the first 15 registry tools. Remaining tools stay explicitly `pending`; they are not represented by placeholder SPEC files.

## Progress

- [x] Confirmed main HEAD `bc03ed5ba84c47b7f7409feee09cbc29d31db9c5` after PR #507.
- [x] Confirmed `tools/tools-index.json` contains 87 registered tools.
- [x] Searched the repository for `SPEC.md`, `仕様書`, `specification`, and `acceptance criteria`; no existing per-tool specification convention was found.
- [x] Confirmed the common specification requires tool-specific decisions for language exceptions and mobile/PC layout behavior.
- [x] Created branch `feat/tool-spec-contract-wave1-20260912` from the exact main commit.
- [ ] Add the per-tool specification standard and 87-tool coverage manifest.
- [ ] Add a read-only CI checker that validates registry/manifest parity and complete-spec structure.
- [ ] Inspect the implemented behavior of the wave-1 tools and write substantive `SPEC.md` files for all 15.
- [ ] Wire the checker into CI without changing production behavior.
- [ ] Run the checker and existing repository validation; fix only specification/contract defects in this PR.
- [ ] Update this ExecPlan, open/complete PR, squash merge, and confirm main.

## Wave 1 scope

The wave follows the current registry order and contains exactly 15 tools:

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

## Decision Log

- Decision: store the individual specification at `tools/{slug}/SPEC.md`.
  Rationale: the specification belongs next to the implementation it constrains, is easy for humans and coding agents to discover, and does not alter public static output because Markdown is not linked as a user-facing page.
  Date: 2026-09-12.

- Decision: do not duplicate the entire common specification inside every tool spec.
  Rationale: `common-spec/spec-ja.md` remains the suite-wide source of truth. Individual specs record only tool-specific purpose, behavior, exceptions, and acceptance criteria.
  Date: 2026-09-12.

- Decision: no placeholder `SPEC.md` files for the remaining 72 tools.
  Rationale: a file that merely says TODO creates false confidence. Pending coverage is represented explicitly in the central manifest until a substantive spec is written.
  Date: 2026-09-12.

- Decision: maintain a complete 87-tool manifest with `complete` / `pending` state and a monotonically non-decreasing `required_complete` floor.
  Rationale: CI can prove there are no missing/orphan registry entries and can prevent a completed spec from silently disappearing in later changes.
  Date: 2026-09-12.

- Decision: specifications describe current implemented behavior, not aspirational features.
  Rationale: the immediate goal is a reliable contract for quality review and future regression control. Desired enhancements belong in plans/issues until implemented.
  Date: 2026-09-12.

- Decision: each complete spec must explicitly state language mode and layout class.
  Rationale: the common specification makes these tool-specific decisions and warns agents not to infer them globally.
  Date: 2026-09-12.

## Specification structure

Each complete `SPEC.md` must contain:

- tool identity: slug and canonical public URL;
- purpose and intended job;
- current functional contract;
- inputs;
- outputs;
- state / persistence;
- privacy / network behavior;
- language mode;
- layout class (mobile-oriented, PC-oriented, or hybrid);
- limits / non-goals;
- acceptance criteria;
- implementation evidence (the files whose current behavior supports the contract).

The standard may add narrowly useful fields, but the checker should avoid enforcing prose wording beyond stable headings/identity fields.

## Validation and Acceptance

Acceptance requires:

- manifest has exactly the same 87 slugs as `tools/tools-index.json`, with no duplicates or extras;
- `required_complete` is 15 and at least 15 entries are `complete`;
- exactly the 15 wave-1 tools have complete specs in this PR;
- every complete spec exists at `tools/{slug}/SPEC.md` and contains all required headings plus matching slug/public URL;
- no registered tool has an untracked `SPEC.md` while manifest state is `pending`;
- no orphan spec exists for a non-registered tool;
- production HTML/JS/CSS behavior is unchanged by this PR;
- existing repository CI remains green.

## Idempotence and Recovery

The checker is read-only. Specs and manifest are documentation/contract files only. All writes remain on `feat/tool-spec-contract-wave1-20260912`; main changes only through squash merge.

## Artifacts and Notes

Base/main SHA: `bc03ed5ba84c47b7f7409feee09cbc29d31db9c5`.

Parent quality work: PR #502 through #507.

## Interfaces and Dependencies

No new package dependency is required. The checker uses Node.js built-ins and reads `tools/tools-index.json`, `tools/tool-spec-manifest.json`, and `tools/{slug}/SPEC.md`.
