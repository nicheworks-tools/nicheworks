# Construction Tools Atlas: remaining five canonical identities (2026-11-03)

## Scope
Only `tools/construction-tools-atlas/` and this ExecPlan. Apply existing canonical redirect and identity override mechanisms; no new dependencies, fabricated aliases, images, or SEO pages.

## Decisions (same physical/procedural entity)
- `corner_float` -> `q016_corner_trowel` (same shaped inside/outside corner-finishing trowel).
- `sandpaper` -> `q011_sanding_paper` (same paper/cloth-backed abrasive sheet; retain reviewed, material-typed definition).
- `as_built` -> `as_built_drawing` (same record/竣工図; preserve maintained drawing definition).
- `ground_fault_breaker` -> `q015_earth_leakage_breaker` (leakage-sensitive protective breaker). Retire incorrect `GFCI/RCD` English canonical on the source, avoiding confusion with separate `gfci_rcd` RCD/GFCI family; keep `gfci_rcd` separate.
- `toolbox_talk` -> `q016_toolbox_meeting` (same pre-task safety discussion). Retire misleading source name `朝礼（TBM）`: a site-wide morning assembly is not intrinsically a TBM.

## Compat and invariants
Stored source records are not deleted. Published IDs decrease 870 -> 865; redirect count increases 66 -> 71. The surviving 865 require actual JA+EN aliases, not synthetic filler. Legacy ID deep links, favorites, searches, image attribution, and existing SEO pages must remain functional. Old incorrect terms are excluded from the inherited vocabulary.

## Work
1. Review current main and all five source/target definitions and types.
2. Apply identity name/type overrides before redirects, add 5 redirects, remove retired alias holds and obsolete as_built definition promotion.
3. Refresh publication and image snapshot ledgers from **real** loader (not invented hashes), update fixed-count and collision tests.
4. Run complete CI (not only narrowed tests), including 360px local/public Chromium, public image attribution, legacy links/favorites and search semantics.
5. Merge after all checks green. Confirm main separately from production release. If snapshots cannot be reproducibly regenerated, leave PR unmerged with explicit blocker.

## No scope expansion
Do not modify unrelated tools or common specs. Do not add '朝礼（TBM）' as an equivalent phrase on the TBM canonical; do not add generic 'GFCI/RCD' to the leakage breaker canonical.
