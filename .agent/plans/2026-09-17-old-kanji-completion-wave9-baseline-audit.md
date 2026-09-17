# Old Kanji Completion Wave 9 — baseline audit

## Baseline
- Start from current main `6df0320312bd97b327b42917dd175ad304b4c7db`.
- Scope is limited to the eight-tool Old Kanji cluster defined by `tools/OLD_KANJI_CLUSTER.md`.
- This wave is audit/documentation only. Do not change tool behavior, dictionary data, SEO inventory, billing, affiliate behavior, or unrelated tools.

## Objective
Freeze the post-SEO-wave completion baseline and convert the remaining work into a finite defect/backlog list for Completion Waves 10–20.

## Audit basis
- `tools/OLD_KANJI_CLUSTER.md`
- each of the eight tool `SPEC.md` files
- current Old Kanji Reference implementation and dictionary audit artifacts
- merged SEO Waves 1–8 already present on main

## Deliverables
1. Add `tools/OLD_KANJI_COMPLETION_AUDIT.md` with:
   - baseline SHA;
   - tool-by-tool completion state;
   - cross-cluster findings;
   - severity/priority;
   - owner wave for each unresolved item;
   - explicit completion exit criteria.
2. Do not mark acceptance criteria complete without direct verification evidence.
3. Record documentation drift introduced by post-spec implementation instead of silently rewriting history.

## Validation
- Final diff is documentation-only and limited to this plan plus `tools/OLD_KANJI_COMPLETION_AUDIT.md`.
- Standard repository CI must remain green.
- Re-read latest main and PR mergeability before squash merge.
