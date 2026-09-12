# ExecPlan — TrashNavi link freshness Phase 4

## Goal

Expand TrashNavi's scheduled direct-link health check from one legacy data file to every `direct-waste-links*.json` dataset used by the repository, without auto-mutating official-source records from transient network failures.

## Current gap

`scripts/check-trashnavi-direct-links.mjs` currently reads only `tools/trashnavi/data/direct-waste-links.json`. Wave 1/2/3, Tokyo bulky-waste, and prefectural-capital enrichment datasets are therefore outside the monthly health check.

## Implementation

- discover all `tools/trashnavi/data/direct-waste-links*.json` files deterministically
- validate that every discovered root value is an array
- flatten records with source file and row index provenance
- deduplicate outbound requests by URL while preserving all record references
- try HEAD first, then GET for status 0 / 403 / 405 / 429
- classify 404 / 410 as hard errors
- classify timeout / blocked / server errors as warnings unless a hard error is observed
- record redirects when the final URL differs from the source URL
- write an optional JSON report for scheduled/manual workflow artifacts
- keep strict mode limited to hard broken-link errors
- add an inventory-only mode for PR/CI validation without contacting municipality sites

## Workflow

Keep the existing monthly schedule and manual strict input. Add report upload and step summary. Do not run live external link checks on every pull request.

Use the existing TrashNavi repository-local CI to run inventory-only validation when checker/data contracts change.

## Safety boundary

- never rewrite source URLs automatically from redirects
- never stamp `last_checked` from CI network probes into source data
- never mark a municipality source inactive solely because of a timeout, 403, 429, or transient 5xx
- manual source verification remains required before source-data changes

## Acceptance

- all current direct-link datasets are discovered
- inventory mode exits successfully with zero network requests
- scheduled/manual mode can emit a machine-readable report
- duplicate URLs cause one network request but preserve all source references
- strict mode fails only for 404/410 hard errors
- existing TrashNavi coverage and generation CI remains green
