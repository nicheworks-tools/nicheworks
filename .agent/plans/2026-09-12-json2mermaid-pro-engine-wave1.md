# ExecPlan — JSON2Mermaid Pro engine Wave 1

## Goal

Implement the non-live, local-only engine needed by the additive JSON2Mermaid Pro package defined in `docs/billing/pro-product-contracts-wave1.md`, without changing the current public Free UI or activating billing.

## Base

- Base main SHA: `6f0bb67534952663cd083146bf33ca7a7a866c53`
- Branch: `feat/json2mermaid-pro-engine-wave1-20260912`

## Scope

- Add a standalone local Pro engine that can be wired to the public tool later.
- Implement batch orchestration around an injected single-item converter so the existing Free converter logic remains the authority and is not duplicated.
- Implement local style-preset persistence that stores presentation configuration only, never JSON input or generated Mermaid content.
- Implement a renderer-adapter contract for embedded Mermaid rendering; the engine itself must not make network requests.
- Implement SVG Blob export and browser-side SVG→PNG conversion utilities.
- Add deterministic Node tests and a path-scoped CI workflow.
- Update JSON2Mermaid SPEC implementation evidence/state to record that the engine exists but is not yet public or billable.

## Non-goals

- Do not edit the current public `app.js` conversion flow in this PR.
- Do not add visible Pro UI, purchase CTA, product ID, price, Stripe Price mapping, entitlement lookup, or checkout activation.
- Do not vendor or select a Mermaid rendering library in this PR.
- Do not increase current parser/input limits.
- Do not send JSON, Mermaid source, filenames, labels, or values to analytics or a remote renderer.
- Do not touch ManualFinder or affiliate runtime.

## Engine contract

### Batch

`runBatch(items, convertOne)` accepts multiple items and an injected converter callback. Returned records contain fixed item metadata, conversion output/statistics/warnings, or an error; raw JSON input is not copied into result records.

### Style presets

A storage adapter is injected. Presets contain an ID, display name, and JSON-safe renderer/style config. Storage is isolated under a JSON2Mermaid Pro key. The engine rejects unsafe prototype keys and does not accept input/source fields in preset config.

### Render adapter

`renderWithAdapter(mermaidCode, preset, renderer)` requires an injected renderer function and passes source/config locally. The engine contains no `fetch`, XHR, WebSocket, beacon, or remote endpoint.

### Export

- SVG: create a standards-based SVG Blob from renderer output.
- PNG: convert SVG to PNG through browser Image + Canvas APIs with injectable factories for deterministic tests.

## Acceptance

- [ ] Current public Free app files remain unchanged except SPEC documentation.
- [ ] Batch orchestration uses an injected existing converter rather than a forked converter implementation.
- [ ] Batch result records do not echo raw JSON input.
- [ ] Preset persistence cannot store JSON input/source fields through the supported API.
- [ ] Engine source contains no network transport or remote URL.
- [ ] SVG export produces `image/svg+xml` Blob data.
- [ ] PNG conversion has deterministic failure/success behavior through injected browser adapters.
- [ ] Node tests pass in CI.
- [ ] No billing/product/price configuration is introduced.
