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
