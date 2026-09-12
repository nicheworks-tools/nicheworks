# ExecPlan — TrashNavi official information gateway Phase 1

## 1. Goal

Prepare TrashNavi for monetization-driven growth without turning it into an unverified nationwide waste-rule database.

Phase 1 establishes a measurable data baseline and a migration contract for evolving the current single-page official-link directory into an official municipal waste-information gateway with municipality landing pages in later phases.

The public product boundary remains unchanged: NicheWorks does not decide municipal waste classification, quote municipality-specific fees as its own answer, submit bulky-waste applications, or replace the municipality's official information.

## 2. Scope

Runtime/tool files in scope:

- `tools/trashnavi/SPEC.md`
- `tools/trashnavi/app.js` only if needed to remove a confirmed stale dataset reference
- `tools/trashnavi/DATA_MODEL.md` (new)
- `tools/trashnavi/scripts/audit-coverage.mjs` (new)

Planning file in scope:

- `.agent/plans/2026-09-12-trashnavi-official-gateway-phase1.md`

Explicitly out of scope:

- all other `tools/**`
- root/mother-site pages
- `common-spec/**`
- monetization master documents
- Cloudflare/deployment settings
- `.github/workflows/**` and other CI changes
- adding unverified municipality URLs or waste rules
- generating municipality landing pages in this phase
- Amazon affiliate blocks or product recommendations in this phase

## 3. Current-state findings

- TrashNavi currently loads the nationwide municipality master plus supplementary and direct-waste-link JSON datasets.
- Runtime filtering is browser-side by prefecture, municipality, current Japanese link-type label and keyword.
- The current data contract is essentially `pref`, `city`, `name`, `type`, `url`, `lgcode`.
- The runtime source list references `data/direct-waste-links-calendars-tokyo.json`, but that file is currently absent. Because the fetch is optional, the 404 is silently ignored.
- Direct-link coverage is therefore not explicitly measurable from the product UI or specification.

## 4. Phase-1 data contract

Document a canonical forward model while preserving compatibility with the existing JSON files.

Municipality identity:

- `lgcode`
- `pref`
- `city`
- official municipality home URL when available

Official waste-link fields for the forward model:

- `lgcode`
- `pref`
- `city`
- `name` / page title
- `link_type`
- `url`
- `fiscal_year` when the source is year-specific
- `last_checked`
- `status`
- `final_url` when a redirect is observed
- `language`

Canonical link-type direction:

- `municipal_home`
- `waste_sorting`
- `collection_calendar`
- `bulky_waste`
- `bulky_application`
- `waste_search`
- `dropoff_facility`
- `waste_app`
- `special_disposal`

Existing Japanese `type` values remain supported by a compatibility mapping; Phase 1 does not require rewriting all existing records.

## 5. Coverage audit contract

Add a dependency-free Node script under the TrashNavi directory that reads the repository JSON datasets and reports:

- source files discovered
- runtime-declared dataset files that are missing
- total records and valid HTTP(S) link records
- invalid records
- duplicate link records
- municipality count
- municipalities with an official home page
- municipalities with at least one waste-specific direct link
- municipalities with at least two distinct waste-specific link types
- municipalities with at least three distinct waste-specific link types
- counts by canonical link type
- prefecture-level coverage
- municipality-level booleans/counts suitable for backlog generation

The audit must not make external network requests and must not fabricate verification dates or source status.

## 6. Municipality-page readiness rule

Phase 1 only defines the gate; it does not generate pages.

A municipality becomes a first-pass landing-page candidate when it has at least **two distinct waste-specific official link types**, excluding the generic municipality home page.

Preferred high-confidence candidates have at least three distinct waste-specific types, especially among:

- waste sorting/search
- collection calendar
- bulky-waste guidance/application

Municipalities with only a generic official home page must not receive thin landing pages merely to increase URL count.

## 7. Implementation steps

1. Record this ExecPlan before tool changes.
2. Add the forward data model / migration contract.
3. Add the repository-local coverage audit script.
4. Remove the confirmed stale calendar dataset reference from runtime loading unless the file is added with verified data in this phase.
5. Extend `SPEC.md` with the official-information-gateway direction, audit requirement, readiness gate and non-goals.
6. Review the branch diff to ensure no unrelated paths changed.

## 8. Verification

Manual/static verification for Phase 1:

- `app.js` must only declare data files that exist on the branch.
- The audit script must use only Node built-ins and repository files.
- The script must handle missing/invalid optional JSON without inventing data.
- Current browser-side filtering and result rendering remain unchanged.
- No municipality URLs or waste rules are added unless independently verified in a later data-enrichment phase.
- `common-spec/**`, other tools, mother-site pages, deployment and CI remain unchanged.

Recommended local command when a checkout is available:

```bash
node tools/trashnavi/scripts/audit-coverage.mjs
node tools/trashnavi/scripts/audit-coverage.mjs --json
```

## 9. Later phases (not executed here)

- Phase 2: enrich official direct links for demand-priority municipalities and add verification metadata.
- Phase 3: generate indexable municipality landing pages only for readiness-qualified municipalities.
- Phase 4: automated link/freshness checks and update history.
- Phase 5: a small set of nationwide explanatory guides plus separated monetization surfaces.

## 10. Rollback

Revert the Phase-1 branch/commit. No user data, billing state, deployment state or external database migration is involved.
