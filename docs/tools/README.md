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

Production fixes must happen in later scoped repair waves and should update a tool specification only when the intended contract itself changes.
