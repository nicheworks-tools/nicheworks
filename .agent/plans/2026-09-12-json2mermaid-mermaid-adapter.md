# ExecPlan — JSON2Mermaid local Mermaid renderer adapter

## Goal

Add a non-live adapter between the staged JSON2Mermaid Pro engine and the current official Mermaid render API without choosing a CDN/package delivery mechanism or exposing new public UI.

## Base

- Base main SHA: `0470f65a0941555199f17ace93db90fa8644fd36`
- Branch: `feat/json2mermaid-mermaid-adapter-20260912`

## Source contract

Current Mermaid documentation describes programmatic rendering through `mermaid.initialize({ startOnLoad: false })` and `await mermaid.render(id, graphDefinition)`, which returns SVG output. The adapter targets that public API shape rather than deprecated `mermaid.init`/internal `mermaidAPI` paths.

## Scope

- Add an adapter factory that accepts an already-loaded Mermaid API object.
- Force `startOnLoad: false` and `securityLevel: "strict"` even if a style preset attempts to override them.
- Generate deterministic, DOM-safe render IDs.
- Return SVG markup in the shape expected by `renderWithAdapter`.
- Extend the existing Pro engine contract test and CI paths.
- Record the adapter as staged/non-live implementation evidence in the tool SPEC.

## Non-goals

- Do not choose or add a Mermaid CDN, npm package, vendored bundle, or version lock in this PR.
- Do not load the adapter from the public JSON2Mermaid page.
- Do not add a Pro UI, entitlement, product ID, price, or checkout.
- Do not send Mermaid source or JSON to a remote renderer.

## Outcome

- Added `tools/json2mermaid/mermaid-renderer-adapter.mjs` for an already-loaded Mermaid API object.
- Adapter calls public `initialize()` and `render()` only.
- `startOnLoad: false` and `securityLevel: "strict"` are forced after style config so presets cannot weaken them.
- Render IDs are normalized to a DOM-safe prefix plus a monotonic sequence.
- Existing JSON2Mermaid Pro engine tests now exercise the adapter through `renderWithAdapter`.
- Static regression checks reject network transports/remote URLs, internal `mermaidAPI`, and deprecated `.init()` usage.
- Public JSON2Mermaid HTML/app remain disconnected from the staged adapter; no billing or product configuration was added.

## Acceptance

- [x] Adapter requires `initialize` and `render` functions.
- [x] `securityLevel` is always `strict`.
- [x] `startOnLoad` is always `false`.
- [x] `render(id, source)` is used and SVG is returned.
- [x] No deprecated `init` or internal `mermaidAPI` is used.
- [x] Adapter contains no network transport or remote URL.
- [x] Existing engine tests cover the adapter contract and are wired into the path-scoped CI workflow.