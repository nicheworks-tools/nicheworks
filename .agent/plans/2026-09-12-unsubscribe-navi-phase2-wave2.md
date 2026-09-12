# ExecPlan — 解約どこナビ Phase 2 expansion wave 2

## Goal

Continue the verified-first expansion toward 100 public-visible services without changing the staged/unregistered publication state or the current 87-tool registry denominator.

## Scope

In scope:

- `tools/unsubscribe-navi/data/additions/2026-09-12-phase2-wave2.json`
- `tools/unsubscribe-navi/app.js`
- `tools/unsubscribe-navi/ROADMAP.md`
- `tools/unsubscribe-navi/SPEC.md`
- this ExecPlan

Out of scope:

- tool registry / manifest
- sitemap / mother-site publication
- common-spec
- existing registered tools
- deployment configuration

## Wave 2 verified additions

Add seven official-source verified services:

- WOWOW
- GitHub Copilot Pro / Pro+ / Max
- Perplexity Pro
- LinkedIn Premium
- Microsoft Copilot Pro
- Apple One
- Google Workspace Individual

Do not pad the wave to ten if the official cancellation source is weak. Canva and other candidates remain research candidates until a sufficiently direct official procedure source is fixed.

## Expected effective counts

Before wave 2:

- effective: 50
- public-visible: 46
- verified: 43
- retired: 1
- needs_review: 2
- placeholder: 4

After wave 2:

- effective: 57
- public-visible: 53
- verified: 50
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible: 53%

## Verification

- all seven IDs are new and unique
- every new record is `verified`
- every new record has official procedure URL, verification date/title, procedure type and billing routes
- runtime explicitly loads wave 2 after wave 1
- repository audit discovers both addition waves automatically
- no changes outside the declared scope
- repository CI remains green
