# ExecPlan — TrashNavi coverage enrichment Wave 1

## 1. Goal

Execute the Phase-1 coverage audit on repository data, establish the actual municipality/link-type baseline, and use that baseline to start verified official-link enrichment for municipalities with demonstrated search demand or strong readiness potential.

This wave is intentionally data-first. It does not generate municipality landing pages yet.

## 2. Scope

In scope:

- `.agent/plans/2026-09-12-trashnavi-coverage-enrichment-wave1.md`
- `.github/workflows/check-trashnavi-coverage.yml` (new, TrashNavi-path-scoped)
- `tools/trashnavi/data/**` only for verified official-link additions/repairs selected after the baseline audit
- `tools/trashnavi/SPEC.md` / `DATA_MODEL.md` only if a concrete compatibility issue found during the audit requires documentation

Out of scope:

- other tools
- root/mother-site pages
- common spec
- generic monetization files
- Amazon affiliate blocks
- municipality landing-page generation
- inferred waste rules, fees, collection dates or unverified URLs
- changes to unrelated workflows

## 3. Coverage execution

Add one path-scoped workflow that runs:

```bash
node tools/trashnavi/scripts/audit-coverage.mjs
node tools/trashnavi/scripts/audit-coverage.mjs --strict
```

The workflow must:

- run on pull requests only when TrashNavi data/runtime/audit files or this workflow change;
- support manual dispatch;
- use only repository data and Node built-ins;
- make no municipal-site network requests;
- expose the human-readable audit output in the Actions log.

This is a structural/data-quality check, distinct from the existing scheduled external URL checker.

## 4. Wave-1 prioritization

After the baseline is visible, choose the first enrichment set by the following order:

1. Municipalities already appearing in observed GSC municipality × waste-intent queries.
2. Municipalities one official link type short of the two-type landing-page readiness threshold.
3. Large municipalities/prefectural capitals where a missing core type is straightforward to verify from an official source.

Known demand signals to consider first include:

- 世田谷区 × 粗大ごみ
- 御浜町 × ごみカレンダー
- 海津市 × ごみカレンダー 2026
- 結城市 × ごみカレンダー 2026

These names are prioritization inputs only. No URL or content may be added without direct official-source verification.

## 5. Core enrichment targets

Prefer official links that add a new coverage dimension rather than duplicate URLs of an existing type:

- `waste_sorting`
- `waste_search`
- `collection_calendar`
- `bulky_waste`
- `bulky_application`
- `dropoff_facility`
- `waste_app`

A municipality should not be marked page-ready merely because it has multiple URLs of the same canonical type.

## 6. Verification contract

Every added direct link must have:

- municipality identity (`lgcode` where available);
- official municipality or municipality-designated public source URL;
- a canonical/legacy type that maps cleanly to the TrashNavi taxonomy;
- a page label reflecting the official page function;
- no unsupported waste-rule summary.

If a source is year-specific, retain the year/fiscal-year signal in the label or forward metadata where practical; do not imply perpetual validity.

## 7. Tests

- TrashNavi coverage workflow passes non-strict and strict audit.
- Existing Tool spec audit and SEO audit remain green.
- `app.js` declares only existing direct-link datasets.
- No duplicate municipality/type/URL records are introduced.
- No unknown type labels are introduced.
- Diff remains limited to this ExecPlan, TrashNavi data/support files, and the dedicated coverage workflow.

## 8. Exit criteria

Wave 1 is complete when:

- the actual current coverage baseline has been captured from Actions logs;
- the strict coverage audit passes or any pre-existing failures are explicitly repaired/accounted for;
- a first verified enrichment batch has been added based on demand/readiness priority;
- the resulting coverage delta is visible in a second audit;
- no municipality landing pages are generated prematurely.

## 9. Rollback

Revert the Wave-1 merge. No user data, billing state or deployment configuration is migrated by this work.
