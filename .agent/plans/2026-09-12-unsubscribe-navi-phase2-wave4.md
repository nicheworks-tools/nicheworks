# ExecPlan — 解約どこナビ Phase 2 Wave 4

## Goal

Continue the staged/unregistered 解約どこナビ expansion from 64 public-visible services toward the 100-service target, with a stronger Japan-facing mix and only official-source-verified cancellation or renewal-stop procedures.

## Scope

In scope:

- `tools/unsubscribe-navi/data/additions/2026-09-12-phase2-wave4.json`
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

After Phase 2 Wave 3:

- effective records: 68
- public-visible: 64
- verified: 61
- retired: 1
- needs_review: 2
- placeholder: 4

## Wave 4 verified additions

Add 11 services with direct official procedure evidence:

1. Y!mobile
2. BIGLOBEモバイル
3. radikoプレミアム
4. マネーフォワード ME プレミアムサービス
5. Chatwork 有料プラン
6. Udemy 個人向け定額プラン
7. Medium Membership
8. Proton paid subscription
9. Asana paid plan
10. Trello Standard / Premium
11. Dropbox Sign

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

- effective records: 79
- public-visible: 75
- verified: 72
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: 75%

## Implementation

1. Add the Wave 4 JSON file under `data/additions/`.
2. Add the Wave 4 file to the staged browser runtime `ADDITION_FILES` list.
3. Update ROADMAP with Wave 4 contents and effective metrics.
4. Run repository CI through a PR merge ref.

## Verification

- no existing addition/base ID collision
- all 11 records have HTTPS official/procedure URLs
- all 11 records are `verified` with verification metadata
- app runtime references the new file
- repository SEO/tool/runtime CI remains green
- registered 87-tool denominator is unchanged

## Rollback

Revert the Wave 4 PR. No account, billing, deployment or external database state is changed.
