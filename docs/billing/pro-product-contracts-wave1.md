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

## 5. UI Atlas

### 5.1 Free boundary — fixed

The current Free contract remains:

- catalog search/filter/detail across the public 100-example catalog;
- short AI prompt copy;
- local favorites and recent views;
- compare up to two patterns;
- Preview-marked generator/handoff output currently available while Pro is inactive, including the existing Preview copy, Markdown export, and JSON export behavior.

The existence of export buttons must not be reclassified as paid-only merely to create product value.

### 5.2 Paid boundary — runtime-backed delta

Current runtime evidence supports three paid operations:

1. **five-way compare** — expand the compare limit from two to five patterns;
2. **full handoff output** — unlock the full handoff layer without Preview-only restrictions/markers;
3. **Pro sample details** — unlock full Pro-only sample-bank detail/use instead of locked previews.

The historical `$2.99` CTA and historical shared Payment Link are legacy commerce copy only. They do not establish a future UI Atlas product price.

### 5.3 Staged product-scoped wrapper

`tools/ui-atlas/product-scoped-controller.mjs` is a non-live wrapper around the shared `assets/nw-product-scoped-controller.mjs` core.

The staging contract requires:

- an explicit future product ID with no fallback/default;
- a complete and unique feature-ID mapping for all three paid operations;
- server-backed `refreshProState({ productId })` verification through the shared core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

The shared core rejects local/browser-only authority, legacy `nicheworks_pro`, wrong-product responses, unverified states, incomplete/duplicate mappings, and entitlement refresh failures.

The current public runtime remains on `UIAtlasProBridge` / `NWPro` legacy state until commercial configuration and an explicit migration are authorized.

### 5.4 Live migration requirements

UI Atlas migration is complete only after all of the following are true:

1. an authoritative UI Atlas product and commercial configuration are registered in the billing registry;
2. the three paid-operation feature IDs are registered for that product;
3. checkout uses the common billing endpoint for the UI Atlas product;
4. webhook fulfillment records the matching paid entitlement in D1;
5. both EN and JA public pages use server-verified product state for the three paid operations;
6. Free compare remains two patterns when inactive or verification fails;
7. Preview-marked generator copy/Markdown/JSON behavior remains available according to the current Free contract;
8. the historical shared Payment Link, `$2.99` copy, and `nicheworks_pro` state stop being authoritative for UI Atlas.

Return paths: `/tools/ui-atlas/` and `/tools/ui-atlas/ja/` as appropriate to the originating language page.

### 5.5 Commercial fields intentionally unresolved

Do not invent these values:

- product ID;
- display product name;
- price / currency;
- one-time vs recurring billing model;
- price tier ID;
- Stripe Price environment mapping;
- production feature-ID namespace;
- test/live checkout enablement policy.

## 6. LogFormatter

### 6.1 Free boundary — fixed

The current Free contract remains:

- log paste and built-in samples;
- current Nginx combined / one-line JSON parsing and preservation of unparsed lines;
- include/exclude keyword filters;
- numeric and preset status filtering;
- basic status-oriented summaries/lists;
- formatted visible rows;
- visible-result copy;
- 4xx/5xx copy;
- TXT download;
- JP/EN UI and dark display mode.

These current Free inspection functions must not be moved behind Pro during migration.

### 6.2 Paid boundary — runtime-backed delta

Current runtime evidence supports five paid operations:

1. **regex filter** — include/exclude regular-expression filtering;
2. **CSV export** — structured CSV output, including the 4xx/5xx-only CSV variant;
3. **JSON export** — structured JSON export;
4. **Markdown report** — generated report copy and Markdown save;
5. **advanced analysis** — detailed User-Agent/bot, IP/URL and sensitive-string analysis currently presented in the Pro layer.

The historical `$2.99` UI copy and historical shared Payment Link are legacy commerce copy only. They do not establish a future LogFormatter product price.

### 6.3 Staged product-scoped wrapper

`tools/log-formatter/product-scoped-controller.mjs` is a non-live wrapper around the shared `assets/nw-product-scoped-controller.mjs` core.

The staging contract requires:

- an explicit future product ID with no fallback/default;
- a complete and unique feature-ID mapping for the five paid operations;
- server-backed `refreshProState({ productId })` verification through the shared core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

The shared core rejects local/browser-only authority, legacy `nicheworks_pro`, wrong-product responses, unverified states, incomplete/duplicate mappings, and entitlement refresh failures.

The current public runtime remains on `pro-bridge.js` / `NWPro` legacy state until commercial configuration and an explicit migration are authorized.

### 6.4 Privacy boundary

Product-scoped billing/entitlement requests must not contain pasted log text, parsed rows, IPs, URLs, User-Agent strings, sensitive-string findings, generated report text, filenames, or export payloads. Only fixed product/feature entitlement metadata may cross the billing boundary.

### 6.5 Live migration requirements

LogFormatter migration is complete only after all of the following are true:

1. an authoritative LogFormatter product and commercial configuration are registered in the billing registry;
2. the five paid-operation feature IDs are registered for that product;
3. checkout uses the common billing endpoint for the LogFormatter product;
4. webhook fulfillment records the matching paid entitlement in D1;
5. public runtime uses server-verified product state for the five paid operations;
6. Free keyword/status filters, basic summaries, copy, and TXT download remain independent of billing availability;
7. a failed/inactive entitlement check leaves the complete current Free formatter usable;
8. the historical shared Payment Link, `$2.99` copy, and legacy shared state stop being authoritative for LogFormatter.

Return path: `/tools/log-formatter/`.

### 6.6 Commercial fields intentionally unresolved

Do not invent these values:

- product ID;
- display product name;
- price / currency;
- one-time vs recurring billing model;
- price tier ID;
- Stripe Price environment mapping;
- production feature-ID namespace;
- test/live checkout enablement policy.

## 7. Implementation order

1. Command Safety, Logistics, UI Atlas, and LogFormatter have fail-closed product-scoped staging paths; obtain authoritative commercial configuration before connecting any of them to public runtime.
2. Migrate Command Safety as the first legacy-shared reference product and prove checkout → webhook → D1 → entitlement → reload behavior.
3. Keep JSON2Mermaid's additive Pro implementation staged until its commercial settings and Mermaid bundle delivery are explicitly authorized.
4. After the first live product-scoped migration is proven, migrate Logistics, UI Atlas, and LogFormatter using the same verified core and tool-specific operation mappings.
5. Continue staging additional legacy shared candidates only where the current Free/Paid boundary is supported by runtime evidence.

## 8. Definition of done for this contract wave

This documentation wave is complete when:

- Command Safety has an exact Free/Paid boundary and a fail-closed staged product-scoped controller contract;
- JSON2Mermaid's existing Free features are protected from retroactive paywalling and its additive Pro pipeline is staged;
- Logistics has an exact Free/Paid boundary and a fail-closed staged product-scoped controller contract;
- UI Atlas has an exact runtime-backed Free/Paid boundary and a thin staged wrapper over the shared controller core;
- LogFormatter has an exact runtime-backed Free/Paid boundary and a thin staged wrapper over the shared controller core;
- unresolved commercial settings are explicitly marked unresolved;
- legacy price/payment-link copy is not treated as future product truth;
- no tool is falsely described as product-scoped before runtime migration is implemented.
