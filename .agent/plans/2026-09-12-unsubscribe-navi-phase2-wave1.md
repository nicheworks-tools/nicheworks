# ExecPlan — 解約どこナビ Phase 2 expansion wave 1

## Goal

Begin Phase 2 expansion from the Phase 1 effective 40-record dataset toward 100 public-visible services, while keeping the tool staged/unregistered and preserving the current 87-tool registry denominator.

## Scope

In scope:

- `tools/unsubscribe-navi/app.js`
- `tools/unsubscribe-navi/scripts/audit-services.mjs`
- `tools/unsubscribe-navi/data/additions/2026-09-12-phase2-wave1.json`
- `tools/unsubscribe-navi/DATA_MODEL.md`
- `tools/unsubscribe-navi/ROADMAP.md`
- `tools/unsubscribe-navi/SPEC.md`
- this ExecPlan

Out of scope:

- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- existing registered tools
- sitemap / mother-site publication
- common-spec
- deployment configuration
- archiving the standalone repository

## Architecture change

Phase 1 used:

- `data/services.json` — immutable legacy migration snapshot
- `data/reverification/*.json` — last-wins corrections to existing ids

Phase 2 adds:

- `data/additions/*.json` — new service records not present in the legacy base

Merge order is:

1. legacy base
2. additions in filename order; ids must be globally new
3. re-verification overlays in filename order; overlays may target ids from either base or additions

Runtime and audit must use the same semantics.

## Wave 1 verified additions

Add ten official-source verified services:

- DAZN
- FOD Premium
- TELASA
- Audible
- Zoom paid plans
- Evernote paid plans
- Claude Pro / Max
- mineo
- UQ mobile
- IIJmio

Each record must include an official procedure URL, verification date/source title, procedure type, and meaningful billing/contract route metadata.

## Expected effective counts

Starting Phase 1 state:

- effective records: 40
- public-visible: 36
- verified: 33
- retired: 1
- needs_review: 2
- placeholder: 4

After this wave:

- effective records: 50
- public-visible: 46
- verified: 43
- retired: 1
- needs_review: 2
- placeholder: 4
- progress to 100 public-visible target: 46%

## Verification

- no id collision with legacy base
- no duplicate id within or across addition files
- all new records satisfy verified-record requirements
- runtime loads additions before overlays
- audit loads additions before overlays using identical semantics
- no current 87-tool registry changes
- repository CI remains green
