# ExecPlan — Minutes to Ops bundle boundary freeze

## Objective

Freeze the current runtime-backed Free/Pro boundary for Minutes to Ops and stage migration from legacy shared `nicheworks_pro` browser state to the future shared `nicheworks.pro` product without activating live billing.

## Scope

- preserve all current Free generation/copy/download behavior;
- define exactly five paid capabilities from existing runtime behavior;
- harden the legacy ordinary UI path against DOM-only Pro activation;
- add a non-live wrapper around the common product-scoped controller;
- synchronize local/canonical specifications and billing contract;
- add path-scoped regression CI.

## Paid capability map

- `history`: local history save + comparison;
- `outputPack`: bundled JSON output pack;
- `githubIssue`: GitHub Issue artifact, including copy/download delivery;
- `codexRequest`: Codex request artifact, including copy/download delivery;
- `sopHandoff`: SOP handoff Markdown artifact, including copy/download delivery.

## Non-goals

- no price/currency decision;
- no Stripe Product/Price;
- no live `/api/billing/*` connection;
- no D1 production migration;
- no change to extraction heuristics;
- no meeting-note upload or account-synced history;
- no new paid feature invented beyond current runtime.

## Privacy invariant

Billing/entitlement traffic may carry fixed product/feature metadata only. Meeting notes, meeting metadata, extracted tasks/decisions/SOPs, history, generated GitHub/Codex/handoff artifacts, output-pack payloads, and user-derived filenames stay outside billing. Analytics remains limited to fixed tool/language/feature identifiers.

## Acceptance

1. Free generation, copy, CSV, and Markdown flows remain usable without Pro.
2. Legacy Pro requires `active === true` plus exact `nicheworks_pro`.
3. Ordinary Pro UI actions re-check legacy entitlement before executing.
4. Product-scoped staging fails closed for local-only, wrong-product, unverified, mapping-invalid, or refresh-failure state.
5. Future shared product authority is documented as `nicheworks.pro`.
6. Dedicated CI and existing repository audits pass.
