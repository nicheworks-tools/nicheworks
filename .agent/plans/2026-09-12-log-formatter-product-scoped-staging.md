# ExecPlan — LogFormatter product-scoped staging

## Goal

Prepare LogFormatter for migration from the live legacy shared NicheWorks Pro gate to the common product-scoped, server-verified entitlement foundation without inventing commercial configuration or changing the public runtime.

## Base

- Base main SHA: `fa4fbdff3e064eb069086df78349ece430407535`
- Branch: `feat/log-formatter-product-scoped-staging-20260912`
- Shared controller core: `assets/nw-product-scoped-controller.mjs`
- Final integration rule: normalize the staged files onto the latest `main` before opening the PR and preserve concurrent unrelated work.

## Current Free contract to preserve

- paste logs and use the existing built-in samples;
- parse/format recognized Nginx combined-style and one-line JSON records while preserving unparsed lines;
- keyword include/exclude filtering;
- numeric/status-preset filtering;
- current summary cards/lists;
- copy visible results;
- copy 4xx/5xx results;
- TXT download;
- JP/EN UI and dark display mode.

## Current paid delta to stage

Runtime evidence supports five paid operations:

1. `regexFilter` — enable include/exclude regular-expression filtering.
2. `csvExport` — enable structured CSV output, including the 4xx/5xx CSV variant.
3. `jsonExport` — enable structured JSON export.
4. `markdownReport` — enable generated Markdown report copy/save.
5. `advancedAnalysis` — expose detailed User-Agent/bot, IP/URL and sensitive-string analysis currently rendered in the Pro layer.

The current hard-coded `$2.99` copy and historical shared Stripe Payment Link are legacy commerce copy only and do not establish future product price or commercial terms.

## Scope

- Add a thin LogFormatter wrapper around the shared product-scoped controller core.
- Require an explicit future `productId` and complete unique feature mapping for all five paid operations.
- Add deterministic LogFormatter staging contracts.
- Add path-scoped CI that also runs when the shared controller core changes.
- Update LogFormatter SPEC to distinguish current live legacy gating from non-live product-scoped staging.
- Update Wave 1 billing contract documentation with the exact LogFormatter Free/Paid boundary and future live migration requirements.

## Non-goals

- Do not register a LogFormatter product.
- Do not invent product ID, display name, price, currency, billing model, price tier, Stripe Price env, production feature namespace, or live/test policy.
- Do not replace `pro-bridge.js`, `NWPro`, or public gating yet.
- Do not change parsing, filtering, analysis, report, export, language, theme, or privacy behavior.
- Do not move current Free copy/TXT/filter behavior behind Pro.
- Do not touch ManualFinder, affiliate, Amazon, TrashNavi, or unrelated billing products.

## Acceptance

- [x] Exactly five paid operations are represented once each.
- [x] LogFormatter wrapper delegates entitlement state logic to the shared core.
- [x] Wrong/local/unverified/failed entitlement states fail closed through the shared core contract.
- [x] Partial verified feature lists unlock only mapped LogFormatter operations.
- [x] Free keyword/status filtering, visible/error copy and TXT download remain explicitly protected.
- [x] Current runtime evidence for regex/CSV/JSON/Markdown/advanced-analysis gating is covered by deterministic checks.
- [x] Path-scoped CI reruns on shared controller core changes.
- [x] Public runtime remains legacy until commercial configuration is authorized.
- [x] No commercial values are invented.

## Completion state

Implementation staging is complete on the feature branch. Remaining integration work is branch normalization onto latest `main`, pull-request CI, and squash merge. No public runtime or live billing activation is included in this wave.
