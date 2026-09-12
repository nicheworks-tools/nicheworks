# ExecPlan — 解約どこナビ Phase 2 Wave 6 / 100 public-visible target

## Goal

Complete the first 100-public-visible-service milestone for the staged/unregistered 解約どこナビ database while preserving the official-source verification standard.

## Scope

In scope:

- `tools/unsubscribe-navi/data/additions/2026-09-12-phase2-wave6.json`
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
- formal publication/registration of unsubscribe-navi
- service-specific SEO pages

## Starting state

After Phase 2 Wave 5:

- effective records: 90
- public-visible: 86
- verified: 83
- retired: 1
- needs_review: 2
- placeholder: 4

## Wave 6 verified additions

Add 14 services with official cancellation/termination procedure evidence:

1. dマガジン
2. pixivプレミアム
3. Apple Arcade
4. Dashlane personal plan
5. JetBrains subscription
6. Bitwarden Premium
7. ExpressVPN
8. Surfshark
9. Clipchamp Premium
10. Leminoプレミアム
11. LYPプレミアム スタンダードプラン
12. 食べログプレミアム
13. Schoo プレミアムプラン
14. メルカリモバイル

## Data rules

Each new record must include:

- unique `id`
- canonical category
- official site URL
- official procedure URL
- concise summary grounded in official evidence
- `publication_state: verified`
- actual verification date `2026-09-12`
- official source title
- procedure type
- material billing routes when applicable

Do not use third-party articles as canonical procedure evidence. An official service-operator article is acceptable where it directly documents the current procedure.

## Expected effective state

After adding 14 records:

- effective records: 104
- public-visible: 100
- verified: 97
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: **100%**

The remaining two review records, Amazon Prime and Disney+, remain review-required unless separately closed with sufficiently stable Japan-relevant official evidence.

## Implementation

1. Add the Wave 6 JSON file under `data/additions/`.
2. Add the Wave 6 file to the staged browser runtime `ADDITION_FILES` list.
3. Update ROADMAP to record the 100-public-visible milestone and Phase 2 status.
4. Run repository CI through the pull-request merge ref.

## Verification

- no base/addition ID collisions
- all 14 additions have HTTPS official/procedure URLs
- all 14 are `verified` with verification metadata
- app runtime references Wave 6
- effective metrics reach 104 / 100 visible / 97 verified
- SEO/runtime repository CI remains green
- registered 87-tool denominator remains unchanged
- staged landing remains `index.staged.html` and unregistered

## Rollback

Revert the Wave 6 PR. No account, billing, deployment or external database state is changed.
