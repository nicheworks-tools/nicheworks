# ExecPlan — JSON Repair bundle boundary freeze

Date: 2026-09-13
Status: implementation

## Goal

Freeze the current runtime-backed Free/Pro boundary for `json-repair`, harden the embedded legacy shared entitlement check, and stage the tool for future server-verified `nicheworks.pro` migration without inventing commercial settings or removing current Free behavior.

## Current evidence

Free runtime already provides JSON/text paste and file load, validation, Safe/Standard repair, Pretty/Minify, repair log, simple diff, copy, normal `.json` download, and Free samples.

Current legacy Pro adds six additive value boundaries:

1. Aggressive repair.
2. Candidate Use/Repair actions.
3. Simple schema check.
4. Local repair history.
5. Repair report + Markdown/JSON advanced export.
6. Pro-only samples.

The public app currently accepts a missing entitlement when `status.active` is true. That fallback must be removed while the legacy gate remains live.

## Scope

1. Require exact legacy `nicheworks_pro` + active state in `app.js`.
2. Freeze the six runtime-backed paid operations above.
3. Add a thin staged wrapper over the common product-scoped controller.
4. Update local/canonical specifications.
5. Add a Wave 7 billing boundary contract.
6. Add deterministic source/entitlement contract validation and path-scoped CI.

## Non-goals

- no NicheWorks Pro price or currency;
- no Stripe Product/Price configuration;
- no D1 migration;
- no live checkout/runtime connection;
- no parser/repair algorithm rewrite;
- no JSON Schema expansion;
- no change that moves current Free validation/repair/export behind Pro;
- historical `$2.99` copy is legacy commerce copy, not future price authority.

## Definition of done

- Free behavior remains unchanged;
- missing/unrelated legacy entitlement cannot unlock Pro;
- staged wrapper exposes exactly six operations;
- future live authority is shared `nicheworks.pro`;
- JSON input/repaired content/schema/history/report data is excluded from billing/entitlement payloads;
- dedicated CI passes;
- PR is mergeable and squash-merged after relevant checks pass.
