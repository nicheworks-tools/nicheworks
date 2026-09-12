# Canonical NicheWorks tool specifications

This directory is the canonical, machine-auditable per-tool contract layer for the tools registered in `tools/tools-index.json`. The suite-wide source of truth remains `common-spec/spec-ja.md`; these records specialize it without changing production code.

## Coverage and naming

- There is exactly one `<slug>.md` document for every registered slug.
- A specification must not exist for an unregistered slug.
- The registered slug, implementation path, and audit state are explicit in every document.
- `NEEDS_DECISION` identifies only behavior that repository evidence cannot determine. It must not be replaced with invented product behavior.

## Required sections

Each tool document contains these exact numbered level-two sections:

1. Identity
2. Purpose
3. Inputs
4. Processing behavior
5. Outputs
6. Error behavior
7. Privacy/data handling
8. Responsive contract
9. Language contract
10. SEO contract
11. Advertising contract
12. Donation/support contract
13. Help/usage/FAQ contract
14. Functional acceptance tests
15. Explicit tool-specific exceptions

An optional `Implementation evidence` subsection records the inspected files. Specifications describe the required contract; the quality matrix separately records current non-compliance so existing bugs are not promoted into intended behavior.

## Audit artifacts

- `audits/tool-quality-matrix.json` is the machine-readable inventory and compliance baseline.
- `audits/tool-quality-matrix.md` is its human-readable rendering.
- `scripts/check-tool-spec-coverage.mjs` verifies registry/spec bijection, unique slugs, required sections, and count agreement.
- `scripts/check-tool-quality-contract.mjs` validates matrix structure, enums, per-tool fields, and agreement with the registry/spec layer.

## Help-status semantics

Usage documentation and FAQ are classified independently as `required-and-present`, `required-and-missing`, `recommended-and-present`, `recommended-and-missing`, `optional-present`, `optional-absent`, `not-applicable`, or `NEEDS_DECISION`. Common-spec sections 10–11 make `usage.html` optional (recommended for tools needing extended guidance) and FAQ conditional. Therefore, a missing recommended or optional document is not a hard compliance failure and cannot independently produce `FIX`.

The exact-file fields `usage_html_present` and `usage_en_html_present` mean only that `tools/<slug>/usage.html` or `tools/<slug>/usage-en.html` exists. `help_documentation.usage_evidence` may additionally record an established directory-based equivalent. The contract classification describes applicability and is not a synonym for exact filename presence.

## Test and final-state semantics

Each `test_evidence` item classifies an existing path as `behavior test`, `regression/contract test`, `data validation`, `build script`, `generator`, `audit script`, or `other maintenance tooling`. Only `behavior test` evidence can produce `functional_test_status: behavior-test-present`; build and generation scripts never count as functional tests.

Final states use deterministic precedence: `BLOCKED` (implementation evidence unavailable), then `NEEDS_DECISION` (one or more unresolved product-contract decisions), then `FIX` (hard compliance gap), then `PASS`. Recommendation-only documentation/test gaps remain visible but do not independently produce `FIX`.

Runtime HTML and JavaScript are valid specification evidence. An implemented guard, error message, failure path, or deliberate absence of a special recovery branch is documented as current behavior when it does not conflict with the common specification. Missing prose alone is never a decision gap; `NEEDS_DECISION` is reserved for cases where repository evidence leaves two or more plausible product contracts.

Production fixes must happen in later scoped repair waves and should update a tool specification only when the intended contract itself changes.
