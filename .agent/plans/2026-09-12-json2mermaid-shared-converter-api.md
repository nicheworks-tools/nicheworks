# ExecPlan — JSON2Mermaid shared converter API

## Goal

Make the current Free JSON2Mermaid UI and the staged Pro batch engine use the exact same conversion implementation, without duplicating the JSON→Mermaid algorithm or activating any paid/public Pro UI.

## Base

- Base main SHA: `6c601ea422d9b4bbeee5196ac43cec58363101f9`
- Branch: `feat/json2mermaid-shared-converter-api-20260912`

## Scope

- Expose the existing converter implementation through a small browser-local API from `tools/json2mermaid/app.js`.
- Route the current Free single-item conversion through that same API.
- Preserve the current Free limits and defaults: 300 KB input, depth 12, array expansion 50, TD / separate / expand defaults.
- Add a staged Pro integration module that injects that shared browser converter API into the existing `runBatch` engine.
- Add deterministic contract checks proving the Free handler and Pro batch integration share the same converter path and that no second JSON→Mermaid algorithm is introduced.
- Update the JSON2Mermaid SPEC implementation evidence/state.

## Non-goals

- Do not expose a public Pro UI.
- Do not add or select a Mermaid CDN/package/bundle.
- Do not add product ID, price, Stripe Price mapping, entitlement lookup, checkout, affiliate, or Amazon integration.
- Do not increase parsing/input limits.
- Do not send JSON, Mermaid source, filenames, labels, or values to a remote service or analytics.
- Do not change the current Free visual layout or Free export behavior.

## Shared converter contract

The browser-local API must:

- expose a versioned `convert(jsonText, options, lang)` function;
- expose the current limits as fixed metadata;
- accept only `TD`/`LR`, `separate`/`inline`, and `expand`/`summarize` conversion options, falling back to the current Free defaults;
- preserve current localized warning labels for depth/array truncation;
- reject empty and over-limit input with fixed error codes;
- return the same `{ code, warnings, stats }` shape used by the current Free UI;
- remain local-only and not persist or transmit input.

## Pro batch integration contract

The staged integration module must accept the browser converter API and call the existing `runBatch(items, convertOne)` engine with `converterApi.convert(...)` as `convertOne`. It must not contain its own parser/tree-walk/Mermaid generation implementation.

## Acceptance

- [x] Free single conversion calls the exposed shared converter API.
- [x] The JSON→Mermaid tree-walk implementation exists only once.
- [x] Free defaults and limits are unchanged.
- [x] Existing `.mmd` / `.txt`, copy, presets, JP/EN, statistics, warning/error behavior remain available in the runtime contract.
- [x] Pro batch integration uses the shared converter API through the existing `runBatch` engine.
- [x] Batch results do not echo raw JSON input.
- [x] No public Pro UI, billing configuration, Mermaid dependency, or network transport is introduced.
- [x] Path-scoped CI executes the shared-converter integration checks.

## Result

Implementation is staged on this branch. The public Free page now owns one versioned browser-local converter API and calls it for normal single-item conversion. The staged Pro integration injects that same API into the existing batch engine. Public Pro UI, Mermaid bundle delivery, entitlement, pricing, and checkout remain intentionally unresolved/out of scope.
