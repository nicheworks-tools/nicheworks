# ExecPlan — 解約どこナビ Phase 2 manifest-backed expansion foundation

## Goal

Prepare the staged 解約どこナビ database for expansion from the cleaned 40-record migration set toward 100 public-visible services without hard-coding every research wave in browser JavaScript and without changing the current registered 87-tool denominator.

Phase 2 starts from the Phase 1 effective state:

- 40 effective legacy-seed records
- 33 verified
- 1 retired
- 2 needs_review
- 4 hidden placeholders
- 0 legacy_review_required
- 36 public-visible effective records

## Scope

In scope:

- `tools/unsubscribe-navi/data/manifest.json` (new)
- `tools/unsubscribe-navi/app.js`
- `tools/unsubscribe-navi/scripts/audit-services.mjs`
- `tools/unsubscribe-navi/DATA_MODEL.md`
- `tools/unsubscribe-navi/ROADMAP.md`
- `tools/unsubscribe-navi/SPEC.md`
- later Phase 2 expansion dataset files under `tools/unsubscribe-navi/data/expansion/`

Out of scope for this foundation PR:

- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- current 87 registered tools
- root sitemap / mother-site exposure
- `common-spec/**`
- deployment / root workflows
- promoting `index.staged.html` to `index.html`
- affiliate blocks / monetization UI

## Problem

Phase 1 runtime currently contains a hard-coded list of re-verification JSON files. That is acceptable for three cleanup waves but is not a durable contract for 60+ new service records.

The audit currently discovers re-verification overlays independently while the browser runtime uses its own explicit list. At 100–200 records this creates a risk that runtime and audit read different data.

## Manifest contract

Add `data/manifest.json` as the single ordered dataset inventory.

Initial kinds:

- `migration_base` — exactly one legacy migration snapshot, currently `data/services.json`
- `overlay` — ordered last-wins corrections/re-verifications for existing IDs
- `addition` — Phase 2+ dataset fragments that introduce new service IDs

Manifest entries contain:

- `path`
- `kind`
- `wave`
- optional `note`

The manifest order is authoritative. Runtime and audit must load the same entries in the same order.

## Merge semantics

1. `migration_base` initializes the record map.
2. `overlay` requires the ID to already exist at that point and replaces/merges that record using last-wins semantics.
3. `addition` requires a new ID that does not already exist; duplicate additions fail the audit.
4. A later correction to a Phase 2 addition should use a future `overlay`, not another `addition` with the same ID.
5. Within one dataset file, duplicate IDs are invalid.
6. Verification metadata objects merge shallowly so a later wave may update evidence without erasing unrelated fields unless explicitly replaced.

## Runtime

`app.js` will:

1. fetch `./data/manifest.json`
2. fetch every manifest dataset
3. apply the manifest merge contract
4. render the same search/filter UI over the effective record set

No service data is fetched from third parties at runtime.

## Audit

`audit-services.mjs` will:

- validate manifest syntax and kinds
- require exactly one `migration_base`
- require all referenced files to exist
- apply the same ordered merge semantics as runtime
- reject overlay IDs that do not yet exist
- reject addition IDs that already exist
- reject duplicate IDs within a dataset file
- retain existing field/state/URL verification rules
- report counts for base, overlays, additions, effective records, verified, review, retired, placeholders and progress to 100/200

## Phase 2 data expansion

After the manifest foundation passes CI, new services should be added in research waves under `data/expansion/`.

Priority is quality rather than raw count. New `addition` records should normally enter as `verified` only when an official procedure source is available. Candidates without sufficient evidence should be kept out of the public database rather than added as thin placeholders merely to raise the count.

## Verification

- current 87-tool registry remains unchanged
- staged/unregistered state remains unchanged
- manifest references every Phase 1 dataset exactly once
- runtime no longer hard-codes individual re-verification files
- audit and runtime use the same manifest order/kinds
- no network verification occurs at runtime or in the repository-local audit
- all existing CI must remain green

## Rollback

Revert this scoped branch/PR. Phase 1 data files remain intact and no external database migration or deployment state is involved.
