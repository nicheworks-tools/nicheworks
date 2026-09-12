# ExecPlan — Incident Update Generator bundle boundary freeze

Date: 2026-09-13
Status: implementation

## Goal

Freeze the current runtime-backed Free/Pro boundary for `incident-update-generator`, harden the legacy shared entitlement check, and stage the tool for future server-verified `nicheworks.pro` migration without changing commercial settings or inventing new paid capabilities.

## Current evidence

Free runtime already provides:

- incident fact/status/tone input;
- customer, internal, and social draft generation;
- optional unconfirmed-field wording;
- individual draft copy;
- selected-audience TXT download;
- JA/EN UI and human-review warnings.

Current legacy Pro adds one bundled value surface: the **Incident Communication Pack**, generated from the current incident facts and drafts. It includes Statuspage, Slack/Teams, support macro, public-review checklist, postmortem outline, GitHub incident ticket, and next-update draft material, with copy and Markdown-download delivery.

The current bridge still treats a missing entitlement as implicit `nicheworks_pro`; this must be tightened to exact entitlement matching while the legacy gate remains live.

## Scope

1. Fix current legacy entitlement isolation to require exact `nicheworks_pro` + active state.
2. Freeze `communicationPack` as the single paid value boundary.
3. Add a thin staged wrapper over the common product-scoped controller.
4. Update local and canonical tool specifications.
5. Add a Wave 6 billing boundary contract.
6. Add deterministic source/entitlement contract validation and path-scoped CI.

## Non-goals

- no NicheWorks Pro price or currency;
- no Stripe Product/Price configuration;
- no D1 migration;
- no live checkout/runtime connection;
- no direct Statuspage/Slack/Teams/GitHub publishing;
- no new incident-generation feature;
- no storage/history system;
- no weakening of legal/security/human-review warnings.

## Definition of done

- Free drafting/copy/TXT remains unchanged;
- legacy missing/unrelated entitlement cannot unlock Pro;
- staged wrapper exposes exactly `communicationPack`;
- future live authority is documented as shared `nicheworks.pro`;
- incident/user-generated content is excluded from billing/entitlement payloads;
- dedicated CI passes;
- PR is mergeable and squash-merged after all relevant checks pass.
