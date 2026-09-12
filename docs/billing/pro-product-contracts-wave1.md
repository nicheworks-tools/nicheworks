# NicheWorks Pro Product Contracts — Wave 1

Status: implementation contract, commercial configuration unresolved  
Date: 2026-09-12  
Authority: `PRO_MIGRATION_LEDGER.md`, current tool SPEC/runtime, and the product-scoped billing foundation introduced by PR #516.

## 1. Rules shared by this wave

These contracts define **what may be sold**, not a live product listing.

- Existing Free contractual behavior stays Free.
- Paid activation must use a product-scoped, server-verified entitlement.
- Browser-local flags, query parameters, entitlement names, success-page arrival, or cached `active=true` values are not payment proof.
- Product ID, price, Stripe Price ID/environment mapping, and live enablement remain unresolved until explicitly configured from an authoritative commercial source.
- Checkout must return to the originating tool page after the common billing success/cancel flow.
- User input processed locally by the tool must not be added to billing or analytics payloads.

## 2. Command Safety Checker

### 2.1 Free boundary — fixed

The following remains Free:

- paste shell or PowerShell commands;
- select Unix-style shell or PowerShell mode;
- run the current local heuristic checks;
- receive risk level, category, reason, verification guidance, and safer/dry-run guidance;
- use JP/EN UI and safety disclaimers.

The safety checker itself must not become a paid gate. A user who has no paid entitlement must still be able to perform the current risk review.

### 2.2 Paid boundary — existing implemented value

The current paid-value surface is limited to the already implemented review/handoff artifacts:

1. review Markdown;
2. Codex safety-check task text;
3. GitHub Issue draft;
4. JSON export;
5. Markdown export.

No additional paid feature is required to perform the reference migration.

### 2.3 Staged product-scoped controller

`tools/command-safety-checker/product-scoped-controller.mjs` is a non-live migration component. It does not register or activate a real Command Safety product.

The staging contract requires:

- an explicit future product ID with no fallback/default;
- a complete and unique feature-ID mapping for all five paid operations;
- server-backed `refreshProState({ productId })` verification;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

The controller rejects local/browser-only authority, the legacy `nicheworks_pro` authority, wrong-product responses, unverified states, incomplete/duplicate mappings, and entitlement refresh failures. It handles fixed entitlement metadata only and must not receive command text, normalized command content, findings, generated review text, or export payloads.

The current public runtime remains on `pro-bridge.js` until commercial configuration and an explicit migration are authorized.

### 2.4 Live migration requirements

Command Safety migration is complete only when all of the following are true:

1. the tool has its own registered product entry in the common billing registry;
2. all five paid operation feature IDs are registered for that product;
3. checkout is created through the common billing endpoint for that product;
4. Stripe webhook fulfillment records the matching paid entitlement in D1;
5. the public page checks that product-specific server entitlement before enabling paid artifacts;
6. reloading the page re-verifies the entitlement rather than trusting a browser-local active flag;
7. the legacy shared Payment Link and `nicheworks_pro` authority are no longer authoritative for this tool;
8. failed/inactive entitlement checks leave the complete current Free checker available.

Return path: `/tools/command-safety-checker/`

### 2.5 Commercial fields intentionally unresolved

Do not invent these values:

- product ID;
- display product name used by Stripe;
- one-time vs recurring commercial model;
- price / currency;
- internal price tier ID;
- Stripe Price environment variable mapping;
- production feature-ID namespace;
- test/live checkout enablement policy.

Until those fields are explicitly authorized, Command Safety remains on the legacy shared gate and must not be presented as a live product-scoped product.

## 3. JSON2Mermaid Lite

### 3.1 Free boundary — fixed

The existing current contract remains Free:

- pasted JSON and built-in presets;
- TD/LR direction;
- inline/separate leaf values;
- expanded/summarized array handling;
- current approximately 300 KB input limit, depth limit 12, and up to 50 expanded array items;
- Mermaid source generation and statistics/warnings;
- copy source;
- `.mmd` download;
- `.txt` download;
- explicit external Mermaid Live Editor handoff.

None of these existing features may be moved behind Pro as part of Wave 1.

### 3.2 Additive Pro boundary — Wave 1 product target

Wave 1 Pro is an additive workflow/export package consisting of:

1. **Batch workspace** — process multiple JSON inputs in one local session and produce a separate Mermaid result for each item.
2. **Embedded diagram render** — render generated Mermaid inside NicheWorks instead of requiring the external Mermaid Live Editor for preview.
3. **SVG export** — download the locally rendered diagram as SVG.
4. **PNG export** — download the locally rendered diagram as PNG.
5. **Reusable style presets** — save/apply local diagram presentation presets supported by the implementation.

The first implementation does **not** promise larger parsing limits. Any higher input/depth/array limits require a separate performance benchmark and contract update; they must not be advertised merely because the user has Pro.

### 3.3 Privacy and execution contract

- JSON parsing, Mermaid source generation, batch processing, and saved style presets stay local to the browser unless a later contract explicitly says otherwise.
- Embedded rendering must not silently submit source JSON or generated Mermaid to a third-party rendering service.
- Product/billing analytics may identify the tool/product/feature/placement with fixed identifiers, but must not include JSON content, generated Mermaid source, filenames, node labels, or values from user input.

### 3.4 Product-scoped activation contract

When implemented, JSON2Mermaid Pro must use the same server-verified product-scoped path as the Command Safety migration:

1. registered product;
2. common checkout endpoint;
3. webhook-confirmed D1 entitlement;
4. matching server entitlement check on the public page;
5. inactive/failure state leaves the complete current Free converter available.

Return path: `/tools/json2mermaid/`

### 3.5 Commercial fields intentionally unresolved

The following are not defined by this contract:

- product ID;
- price / currency;
- one-time vs recurring model;
- price tier ID;
- Stripe Price environment variable mapping;
- live/test enablement policy.

## 4. Logistics Compliance Kit JP

### 4.1 Free boundary — fixed

The current assessment workflow remains Free:

- review/priority level and supporting signals;
- next-action guidance;
- medium/long-term improvement-plan draft;
- current-state memo display;
- on-screen Markdown preview.

The scoring/review workflow must not become dependent on paid entitlement availability.

### 4.2 Paid boundary — existing implemented value

The current runtime already contains eight paid operations:

1. internal-share memo copy;
2. contractor/vendor confirmation memo copy;
3. improvement-plan copy;
4. GitHub Issue draft copy;
5. Codex task copy;
6. handoff Markdown export;
7. JSON export;
8. Markdown save.

No new paid feature is required to prepare this tool for product-scoped migration.

### 4.3 Staged product-scoped controller

`tools/logistics-compliance-kit-jp/product-scoped-controller.mjs` is a non-live migration component. It does not register or activate a real Logistics product.

The staging contract requires:

- an explicit future product ID with no fallback/default;
- a complete and unique feature-ID mapping for all eight paid operations;
- server-backed `refreshProState({ productId })` verification;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

The controller rejects local/browser-only authority, the legacy `nicheworks_pro` authority, wrong-product responses, unverified states, incomplete/duplicate mappings, and entitlement refresh failures. It handles fixed entitlement metadata only and must not receive assessment answers, memo content, generated output, or export content.

The current public runtime remains on `pro-bridge.js` until commercial configuration and an explicit migration are authorized.

### 4.4 Live migration requirements

Logistics migration is complete only after all of the following are true:

1. an authoritative Logistics product ID and commercial configuration are registered in the billing registry;
2. all eight operation feature IDs are registered for that product;
3. checkout uses the common billing endpoint for the Logistics product;
4. webhook fulfillment records the matching paid entitlement in D1;
5. the public page loads the common server-backed product entitlement adapter;
6. the live bridge enables only verified returned feature IDs;
7. the legacy shared Payment Link and `nicheworks_pro` authority stop being authoritative for this tool;
8. the JSON export no longer writes the legacy `nicheworks_pro` marker as its entitlement identity;
9. failed/inactive entitlement checks leave the complete Free assessment workflow usable.

Return path: `/tools/logistics-compliance-kit-jp/`

### 4.5 Commercial fields intentionally unresolved

Do not invent these values:

- product ID;
- display product name;
- price / currency;
- one-time vs recurring billing model;
- price tier ID;
- Stripe Price environment mapping;
- live/test enablement policy;
- final production feature-ID namespace.

## 5. Implementation order

1. Command Safety now has a staged fail-closed product-scoped controller; obtain authoritative commercial configuration before connecting it to the public runtime.
2. Migrate Command Safety as the first legacy-shared reference product and prove checkout → webhook → D1 → entitlement → reload behavior.
3. Keep JSON2Mermaid's additive Pro implementation staged until its commercial settings and Mermaid bundle delivery are explicitly authorized.
4. Keep Logistics on the live legacy bridge while its server-verified product-scoped controller and regression checks remain ready for a later authorized migration.
5. After the first product-scoped migration is proven, use the same verified path to migrate Logistics and the remaining legacy shared candidates.

## 6. Definition of done for this contract wave

This documentation wave is complete when:

- Command Safety has an exact Free/Paid boundary and a fail-closed staged product-scoped controller contract;
- JSON2Mermaid's existing Free features are protected from retroactive paywalling;
- JSON2Mermaid has a concrete additive paid feature package and staged local pipeline;
- Logistics has an exact Free/Paid boundary and a fail-closed staged product-scoped controller contract;
- unresolved commercial settings are explicitly marked unresolved;
- no tool is falsely described as product-scoped before runtime migration is implemented.
