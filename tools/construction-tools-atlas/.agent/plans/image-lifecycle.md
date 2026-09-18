# Image lifecycle ExecPlan and checkpoint

Scope: tools/construction-tools-atlas/ only. The user scope takes precedence over
AGENTS.md's root plan location; keep the plan here. No UI or source-row changes.
Starting main: 447c1beb0e5490b5dfc8b45a2a9a4afb0d7122d3.
Branch: feat/construction-atlas-image-lifecycle-20260918.

## Inspected baseline
- Clean clone, main/HEAD/origin/main all equal starting SHA; staged/unstaged empty.
- Registry, both image inventories, exception ledger, canonical redirects and
  identity resolutions, image identity resolutions, Wave 1–4 source conventions,
  Wave 4 builder/promotion and attribution, audit workflows inspected.
- Corpus 5536; quarantined 4600; retired redirects 66; published 870.
- Public formal images 30 (24 direct, 6 inherited); not_required 8; unresolved 832.
- Public bilingual independent core 870; runtime fallback dependent 0.
- All 31 no-argument check/audit CJS scripts passed. The parameterized batch
  auditor initially returned usage exit 2; rerun with --batch=014 passed.
- Baseline inventories checked without rewriting. No acquisition/build downloads.

## Accepted design
- One public-canonical lifecycle ledger, explicit unreviewed rows for 832 entries.
- Existing exception ledger remains authoritative for no-image reasons.
- Existing registry/source ledgers remain authoritative for promoted assets.
- Replayable state histories; immutable candidate evidence; reviewable migration
  imports must reference existing decisions, not invent new reviewer identities.
- States: unreviewed, not_required, awaiting_source, candidate,
  provenance_verified, subject_verified, verified, promoted.
- Hold is orthogonal, reason + resume condition required; no terminal unobtainable
  state in v1. Illustrations/legacy SVG cannot become formal photographs.
- Public inventory remains based on actual public loader IDs and publication hash.
- Extend existing CI-invoked auditor inside scope rather than edit .github/.
- Tests must include illegal combinations and redirect provenance cases.

## Units / next action
1. DONE: baseline inspection and plan; commit this known-good checkpoint.
2. NEXT: implement ledger, machine-readable state policy, validator and migration;
   validate against current data and commit.
3. Add inventory reporting and adversarial fixtures via existing CI audit entry;
   regenerate deterministic snapshots, run existing tests, commit.
4. Final documentation/results, push branch and open review PR (do not merge).

## Unresolved implementation details
- Final on-disk review evidence shape and candidate history binding.
- Exact fixture count and final validation commands/results to record below.

## Unit 2 checkpoint
- Implemented lifecycle ledger (870 records), policy, JSON Schema, validation and
  review protocol. Migration preserves 30 promoted (6 inherited), 8 not_required,
  832 unreviewed. No source rows, registry, exceptions, assets or UI rewritten.
- Evidence shape resolved: append-only full-state events; candidates reference
  existing source ledgers or inline prospective source metadata; SHA-256 binds
  candidate evidence. Initial 38 decisions are pinned imports, not new reviews.
- `node .../scripts/image-lifecycle-v2.3.cjs`: PASS, 870 records, 38 reviewed,
  30 required/promoted, 8 not_required, 832 unreviewed, 0 hold.
- `node .../scripts/check-image-lifecycle-v2.3.cjs`: 50 PASS / 0 FAIL.
- Existing public image frozen inventory `--check`: PASS (no behavior change).
- NEXT: connect lifecycle reporting and fixture execution to existing CI-invoked
  public inventory auditor, add corpus reporting, freeze snapshots, full regression.

## Unit 3 checkpoint
- DONE: both existing inventories include lifecycle reporting; public inventory
  contains one row per actual published canonical, full corpus summary separates
  4666 non-public stored entries. Old compatibility asset counters preserved.
- Existing CI public auditor --check now executes lifecycle validation and 58
  isolated fixtures. No .github file changes, dependencies, UI or source edits.
- Relevant integration commands PASS; repeat regeneration 2/2 byte-identical.
- Existing CI audit workflow 72/72 PASS; existing CJS checks 32/32 PASS.
- Fixtures expanded from 50 to 58: holds, source changes, ambiguous inheritance,
  direct precedence, partial candidates. Synthetic fixtures do not require a real
  unreviewed backlog, so classification completion will not invalidate tests.
- Exact command list/results: IMAGE_LIFECYCLE_VALIDATION_V2.3.md.
- No unresolved architecture decisions. Historical deletion across rewritten
  snapshots remains a git-diff review concern, explicitly documented; state replay,
  pinned initial imports and source-evidence hashes are machine-enforced.
- NEXT: commit this verified integration; push branch and open PR against main;
  check remote head and CI status. Do not classify/acquire remaining 832 entries.
