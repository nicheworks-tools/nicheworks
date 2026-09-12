# ExecPlan — 解約どこナビ Phase 2 Wave 5

## Goal

Continue the staged/unregistered 解約どこナビ expansion from 75 public-visible services toward the 100-service target using only official-source-verified cancellation, renewal-stop, or downgrade procedures.

## Scope

In scope:

- `tools/unsubscribe-navi/data/additions/2026-09-12-phase2-wave5.json`
- `tools/unsubscribe-navi/app.js`
- `tools/unsubscribe-navi/ROADMAP.md`
- this ExecPlan

Out of scope:

- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- root sitemap / mother-site publication
- common-spec
- deployment / workflows
- any other registered tool
- standalone `nicheworks-tools/unsubscribe-navi`

## Starting state

After Phase 2 Wave 4:

- effective records: 79
- public-visible: 75
- verified: 72
- retired: 1
- needs_review: 2
- placeholder: 4

## Wave 5 verified additions

Add 11 services with direct official procedure evidence:

1. BOOK☆WALKER 読み放題
2. コミックシーモア 読み放題
3. 楽天ミュージック
4. Crunchyroll Premium
5. Midjourney
6. Airtable paid workspace
7. monday.com paid product
8. ClickUp paid Workspace
9. Calendly paid subscription
10. Zapier paid plan
11. Patreon paid membership

## Data rules

Each new record must include:

- unique `id`
- canonical category
- official site URL
- official procedure URL
- concise summary grounded in the official procedure source
- `publication_state: verified`
- actual verification date `2026-09-12`
- official source title
- procedure type
- material billing routes

No third-party article may be used as the canonical procedure source.

## Expected effective state

After adding 11 records:

- effective records: 90
- public-visible: 86
- verified: 83
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: 86%

## Implementation

1. Add the Wave 5 JSON file under `data/additions/`.
2. Add the Wave 5 file to the staged browser runtime `ADDITION_FILES` list.
3. Update ROADMAP with Wave 5 contents and effective metrics.
4. Run repository CI through a PR merge ref.

## Verification

- no existing addition/base ID collision
- all 11 records have HTTPS official/procedure URLs
- all 11 records are `verified` with verification metadata
- app runtime references the new file
- repository SEO/tool/runtime CI remains green
- registered 87-tool denominator is unchanged

## Rollback

Revert the Wave 5 PR. No account, billing, deployment or external database state is changed.
