# Tool Specification — JSON2Mermaid Lite

- Slug: `json2mermaid`
- Public URL: `https://nicheworks.app/tools/json2mermaid/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Convert JSON structure into Mermaid `flowchart` source code locally so users can inspect, copy, and save a diagram definition for use in Mermaid-compatible tools.

## Current functional contract

- Accept pasted JSON and built-in simple-tree, nested-object, and array-object presets.
- Support top-down (`TD`) and left-to-right (`LR`) directions.
- Support separate or inline leaf values and expanded or summarized array handling.
- Enforce the implemented safety/size limits: approximately 300 KB input, maximum depth 12, and up to 50 expanded array items.
- Parse JSON and emit Mermaid flowchart source with node/edge/depth/omission statistics plus warning/error states.
- Copy generated Mermaid source and download it as `.mmd` or `.txt`.
- Link to Mermaid Live Editor only as an external preview option; the current tool does not render the Mermaid diagram itself.

## Inputs

- JSON text or built-in preset.
- Direction, leaf-value mode, and array mode.
- JP/EN UI selection.

## Outputs

- Mermaid `flowchart TD` or `flowchart LR` source text.
- Generation statistics and limit warnings.
- Clipboard copy and `.mmd` / `.txt` downloads.

## State and persistence

Input, conversion settings, generated source, and statistics are current-page state. The current contract does not include saved diagram projects or cloud persistence.

## Planned additive Pro contract

This section defines a future additive paid package. It does not claim that JSON2Mermaid currently has a paid runtime or registered product.

The complete current functional contract remains Free, including current parsing limits, all direction/leaf/array controls, Mermaid source generation, statistics/warnings, clipboard copy, `.mmd` download, `.txt` download, and the external Mermaid Live Editor handoff.

Wave 1 Pro may add only functionality that is not part of that current Free contract:

- **Batch workspace** — process multiple JSON inputs in one local session and produce a separate Mermaid result for each item.
- **Embedded diagram render** — render generated Mermaid inside NicheWorks instead of requiring the external Mermaid Live Editor for preview.
- **SVG export** — download the locally rendered diagram as SVG.
- **PNG export** — download the locally rendered diagram as PNG.
- **Reusable style presets** — save and apply local diagram-presentation presets supported by the implementation.

Higher parsing/input limits are explicitly not promised by this Wave 1 contract. Any larger input, depth, or array limits require benchmark evidence and a separate contract update before they are advertised as paid value.

When implemented, paid activation must use a product-specific server-verified entitlement. Browser-local flags, query parameters, success-page arrival, or a shared entitlement name are not payment proof. The common billing flow must return to `/tools/json2mermaid/`, and inactive/failed entitlement checks must leave the entire current Free converter usable.

Product ID, price, billing model, price tier, Stripe Price environment mapping, and live/test enablement policy remain unresolved until explicitly authorized. Detailed authority: `docs/billing/pro-product-contracts-wave1.md`.

### Staged implementation status

`tools/json2mermaid/pro-engine.mjs` implements non-live local infrastructure for the future paid package:

- batch orchestration around an injected single-item converter, without forking the current Free conversion algorithm;
- local style-preset persistence that rejects JSON/input/source fields from the supported preset API;
- a renderer-adapter contract for embedded local rendering, with no built-in network transport or remote renderer;
- SVG Blob export;
- browser Image/Canvas based SVG-to-PNG conversion with injectable adapters for deterministic tests.

`tools/json2mermaid/mermaid-renderer-adapter.mjs` implements the staged Mermaid API adapter expected by that engine. It accepts an already-loaded Mermaid object, calls the public `initialize()` and `render()` API, forces `startOnLoad: false` and `securityLevel: "strict"`, and returns SVG markup to the Pro engine. It does not use deprecated `init()`, internal `mermaidAPI`, a remote renderer, or a built-in CDN/package loader.

The current Free runtime now exposes its single JSON→Mermaid implementation as the versioned browser-local `window.NWJSON2MermaidConverter` API. The visible Free single-item conversion calls this same API, preserving the existing 300 KB / depth 12 / array 50 limits and TD / separate / expand defaults.

`tools/json2mermaid/pro-shared-converter-integration.mjs` connects the staged Pro batch engine to that same browser converter API by injecting `converterApi.convert(...)` into `runBatch`. It contains no second parser/tree-walk/Mermaid-generation algorithm.

`tools/json2mermaid/pro-workspace.mjs` composes the staged components into one non-live workspace API. It can run batch conversion through the shared Free converter, manage the existing safe local style presets, render a successful batch result through the Mermaid adapter, and export that rendered result as SVG or PNG. The workspace does not implement its own parser, tree walk, flowchart generator, or network transport.

The staged workspace is covered end-to-end by `scripts/check-json2mermaid-pro-workspace.mjs`, which exercises shared conversion → batch result → saved preset → Mermaid initialization/render → SVG Blob → PNG Blob and verifies `securityLevel: "strict"` / `startOnLoad: false` remain forced.

These staged Pro modules are **not loaded by the current public page**, have no purchase CTA, have no product ID or entitlement mapping, and do not make the current tool a live Pro product. Mermaid bundle/version delivery and public Pro UI wiring remain later implementation steps.

## Privacy and network behavior

JSON parsing and Mermaid-source generation run in the browser; input JSON is not intentionally uploaded by the conversion workflow. Opening or pasting into Mermaid Live Editor is an explicit external-site action governed by that site. Suite-wide analytics/advertising may load separately.

For future Pro implementation, batch processing, embedded rendering, exports, and style presets must remain local unless a later specification explicitly changes that contract. Billing/analytics payloads must not contain JSON content, generated Mermaid source, filenames, node labels, or values derived from user input.

The staged Pro engine, shared-converter integration, workspace, and Mermaid adapter contain no built-in network transport. Raw batch JSON is passed to the shared converter only and is not copied into the engine's result records.

## Language mode

`bilingual single-page`

JP/EN controls switch the same converter and guidance.

## Layout class

`hybrid`

Large JSON/Mermaid text areas benefit from wider screens, while the conversion controls and output remain usable when stacked on mobile.

## Limits and non-goals

- The current page generates Mermaid source; it does not provide an embedded rendered-diagram preview.
- Large/deep JSON is intentionally truncated/rejected according to the implemented limits.
- External Mermaid rendering can expose pasted content to that external service, so confidential JSON-derived output should not be pasted there.
- The planned Pro contract does not authorize a product ID, price, Stripe Price ID, live checkout, or higher parser limits by itself.
- The staged Pro engine/adapter/integration/workspace are not public Pro UI functionality yet, and this contract does not choose a Mermaid bundle delivery method.

## Acceptance criteria

- [ ] Valid JSON within the implemented limits produces Mermaid flowchart source and generation statistics.
- [ ] Direction, leaf, and array options change the generated source according to the selected behavior.
- [ ] Oversize, over-depth, or heavily expanded arrays surface limit/warning behavior rather than silently claiming complete representation.
- [ ] Copy and `.mmd` / `.txt` downloads use the currently generated source and JP/EN switching preserves the workflow.
- [ ] The visible Free converter and staged Pro batch path use the same browser-local converter API rather than duplicated JSON→Mermaid implementations.
- [ ] The staged Pro workspace can compose batch conversion, saved style preset application, local Mermaid rendering, and SVG/PNG export without adding network transport.
- [ ] Future Pro implementation does not move any current Free contract feature behind a paid gate.
- [ ] Future batch/render/export/style features do not silently upload user JSON or generated Mermaid to a third-party rendering backend.
- [ ] The staged Pro modules remain disconnected from public Pro UI until product-scoped entitlement, Mermaid bundle delivery, and UI wiring are explicitly implemented.

## Implementation evidence

- `tools/json2mermaid/index.html`
- `tools/json2mermaid/app.js` — current Free runtime and shared browser-local converter API.
- `tools/json2mermaid/pro-engine.mjs` — staged, non-live Pro infrastructure only.
- `tools/json2mermaid/pro-shared-converter-integration.mjs` — staged batch integration using the Free converter API.
- `tools/json2mermaid/pro-workspace.mjs` — staged, non-live composition of batch/preset/render/export paths.
- `tools/json2mermaid/mermaid-renderer-adapter.mjs` — staged, non-live local Mermaid API adapter.
- `tools/json2mermaid/usage.html`
- `tools/json2mermaid/usage-en.html`
- `scripts/check-json2mermaid-pro-engine.mjs`
- `scripts/check-json2mermaid-shared-converter.mjs`
- `scripts/check-json2mermaid-pro-workspace.mjs`
- `docs/billing/pro-product-contracts-wave1.md`
