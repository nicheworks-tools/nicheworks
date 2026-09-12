# ExecPlan — 解約どこナビ Phase 2 Wave 3

## Goal

Continue the staged/unregistered 解約どこナビ expansion from 53 public-visible services toward the 100-service target using only official-source-verified cancellation or renewal-stop procedures.

## Scope

In scope:

- `tools/unsubscribe-navi/data/additions/2026-09-12-phase2-wave3.json`
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

After Phase 2 Wave 2:

- effective records: 57
- public-visible: 53
- verified: 50
- retired: 1
- needs_review: 2
- placeholder: 4

The two remaining `needs_review` records are Amazon Prime and Disney+. They are not promoted in this wave unless a sufficiently stable, Japan-relevant official cancellation source is pinned.

## Wave 3 verified additions

Add 11 services with direct official procedure evidence:

1. X Premium
2. Discord Nitro / Nitro Basic
3. 1Password
4. Grammarly paid subscription
5. Strava Subscription
6. Todoist Pro
7. Miro Starter / Business
8. Figma Professional
9. Google Play Pass
10. NordVPN
11. Skillshare membership

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

- effective records: 68
- public-visible: 64
- verified: 61
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: 64%

## Implementation

1. Add the Wave 3 JSON file under `data/additions/`.
2. Add the Wave 3 file to the staged browser runtime `ADDITION_FILES` list.
3. Update ROADMAP with Wave 3 contents and effective metrics.
4. Run repository CI through a PR merge ref; the database audit must continue to reject duplicate IDs or malformed verified records.

## Verification

- no existing addition/base ID collision
- all 11 records have HTTPS official/procedure URLs
- all 11 records are `verified` with verification metadata
- app runtime references the new file
- repository SEO/tool/runtime CI remains green
- registered 87-tool denominator is unchanged

## Rollback

Revert the Wave 3 PR. No account, billing, deployment or external database state is changed.
