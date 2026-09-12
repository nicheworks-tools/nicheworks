# ExecPlan — JSON2Mermaid Pro workspace staging completion

## Goal

Connect the already-staged JSON2Mermaid Pro components into one non-live workspace API so the complete local flow exists before any product pricing, entitlement, Mermaid bundle delivery, or public Pro UI is introduced.

## Base

- Base main SHA: `8d04a1c7c1f242260bfcc84db41011de47671d0c`
- Branch: `feat/json2mermaid-pro-workspace-staging-20260912`

## Scope

- Add a `createProWorkspace()` orchestration module.
- Reuse the browser-local shared converter API through `runBatchWithSharedConverter()`.
- Reuse the existing local preset store.
- Reuse the staged Mermaid renderer adapter.
- Reuse SVG Blob and SVG→PNG export utilities.
- Support rendering a successful batch result with a saved preset.
- Add an end-to-end deterministic Node contract test covering converter → batch → preset → Mermaid render → SVG → PNG.
- Verify the workspace contains no second JSON parser/tree-walk/Mermaid generator and no network transport.
- Verify the public JSON2Mermaid page does not load the staged workspace or a Mermaid bundle.
- Update the JSON2Mermaid SPEC staged implementation status.

## Non-goals

- Do not expose a public Pro workspace UI.
- Do not choose or add a Mermaid CDN/npm/vendor bundle/version lock.
- Do not add product ID, price, billing model, Stripe Price mapping, entitlement lookup, checkout, or purchase CTA.
- Do not increase current Free parser limits.
- Do not change the current Free converter layout or exports.
- Do not add affiliate/Amazon behavior.

## Workspace contract

`createProWorkspace({ converterApi, mermaidApi, storage, idPrefix })` must return an object that can:

- run a batch through the shared converter API;
- save/list/get/remove local presentation presets through the existing safe preset store;
- render Mermaid code locally through the existing Mermaid adapter;
- render a successful batch record with a selected saved preset;
- create an SVG Blob from rendered SVG;
- create a PNG Blob through the existing browser Image/Canvas path.

The workspace must reject missing/failed batch records and unknown preset IDs explicitly.

## Acceptance

- [x] Batch conversion invokes the shared converter API rather than a duplicate implementation.
- [x] Raw JSON is absent from batch result records.
- [x] A saved style preset is applied to Mermaid initialization.
- [x] `startOnLoad: false` and `securityLevel: "strict"` remain forced by the adapter.
- [x] A successful batch result renders to SVG.
- [x] SVG and PNG Blob exports complete in deterministic tests.
- [x] Workspace source contains no JSON parser/tree-walk/flowchart generator and no network transport.
- [x] Public HTML does not load the staged workspace or a Mermaid runtime.
- [x] No billing/commercial/affiliate configuration is introduced.

## Result

The staged local Pro path is now composable through one workspace API: shared Free converter → batch → saved style preset → Mermaid adapter → SVG/PNG. It remains intentionally disconnected from the public page and from all commercial configuration.
