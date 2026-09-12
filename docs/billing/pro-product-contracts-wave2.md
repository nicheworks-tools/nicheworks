# NicheWorks Pro Product Contracts — Wave 2

Status: implementation contract, commercial configuration unresolved  
Date: 2026-09-12  
Authority: `PRO_MIGRATION_LEDGER.md`, current tool SPEC/runtime, the product-scoped billing foundation introduced by PR #516, and the shared staged controller core introduced by PR #575.

## 1. Wave 2 shared rules

Wave 2 continues the migration discipline established in Wave 1. These contracts define **what may be sold**, not a live product listing.

- Existing Free contractual behavior stays Free.
- Paid activation must use product-scoped, server-verified entitlement state.
- Browser-local flags, entitlement names, query parameters, success-page arrival, or cached `active=true` values are not purchase proof.
- Product ID, display name, price, currency, billing model, price tier, Stripe Price environment mapping, production feature namespace, and live/test policy remain unresolved until explicitly authorized.
- Tool input and generated user content must not be added to billing/entitlement payloads.
- Current historical shared Payment Links and legacy price copy are migration evidence only, not future commercial truth.

Wave 1 remains the contract source for Command Safety Checker, JSON2Mermaid Lite, Logistics Compliance Kit JP, UI Atlas, and LogFormatter.

## 2. SQL DB Risk Checker

### 2.1 Free boundary — fixed

The current Free checker remains available without paid entitlement:

- paste and locally analyze one or more SQL statements;
- choose environment and database type;
- use read-only mode;
- receive current risk level, warning list, reasons, verification guidance, SQL preview, statement/write/warning summaries, and DB/environment context;
- copy the risk summary;
- copy the pre-run checklist;
- use JA/EN UI and safety disclaimers.

No paid migration may move the SQL risk checker itself behind Pro.

### 2.2 Paid boundary — runtime-backed delta

Current runtime evidence supports seven paid operations:

1. **Safe Execution Pack** — copy the generated safe-execution review pack.
2. **Review Summary** — copy the review summary.
3. **DB-specific Checklist** — copy the database-specific checklist.
4. **Migration Review** — copy the migration review.
5. **Team Handoff** — copy the team handoff artifact.
6. **Markdown export** — save the generated review as Markdown.
7. **JSON export** — save the generated review as JSON.

These operations correspond to the existing legacy shared-Pro surface. No new paid feature is invented for staging.

### 2.3 Staged product-scoped wrapper

`tools/sql-db-risk-checker/product-scoped-controller.mjs` is a non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

The staged contract requires:

- an explicit future product ID with no default/fallback;
- a complete and unique feature-ID mapping for all seven paid operations;
- server-backed `refreshProState({ productId })` through the shared controller core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, and entitlement-refresh failure states fail closed.

### 2.4 Legacy bypass hardening — must be preserved

The current legacy bridge was previously repaired so the entitlement name `nicheworks_pro` alone cannot activate paid behavior.

Legacy active state currently requires both:

- matching/no-conflict entitlement naming; and
- an explicit active signal (`active`, `pro`, `unlocked`, or `status === "active"`).

Product-scoped migration must not weaken or temporarily remove this fail-closed behavior. The staged wrapper itself contains no `NWPro`, `nicheworks_pro`, localStorage authority, or Payment Link logic.

### 2.5 Privacy boundary

SQL text can contain table names, column names, business logic, identifiers, and other confidential information. Product-scoped billing and entitlement requests may contain only fixed product/feature entitlement metadata.

Do not send any of the following through the billing/entitlement path:

- pasted SQL text;
- normalized/parsed SQL statements;
- table or column names;
- warning/finding content;
- environment-specific review text;
- generated Safe Execution Pack / Review Summary / checklist / Migration Review / Team Handoff content;
- Markdown or JSON export payloads or filenames.

### 2.6 Live migration requirements

SQL DB Risk migration is complete only when all of the following are true:

1. an authoritative SQL DB Risk product and commercial configuration are registered in `config/billing/products.json`;
2. all seven paid-operation feature IDs are registered for that product;
3. checkout uses the common billing endpoint for that product;
4. signed Stripe webhook fulfillment records the matching paid entitlement in D1;
5. public runtime uses server-verified product state for the seven paid operations;
6. Free SQL analysis, warnings, summary copy, and checklist copy remain independent of billing availability;
7. failed/inactive entitlement checks leave the full Free checker usable;
8. entitlement naming alone cannot unlock paid behavior;
9. the historical shared Payment Link and legacy shared state stop being authoritative for this tool;
10. reload re-verifies the product entitlement rather than trusting browser-local active state.

Return path: `/tools/sql-db-risk-checker/`.

### 2.7 Commercial fields intentionally unresolved

Do not invent:

- product ID;
- display product name;
- price or currency;
- one-time vs recurring billing model;
- price tier ID;
- Stripe Price environment mapping;
- production feature-ID namespace;
- test/live checkout policy.

## 3. API Key Token Redactor

### 3.1 Free boundary — fixed

The current Free redaction workflow remains available without paid entitlement:

- paste secret-bearing text and run the supported local detectors;
- enable/disable current detector categories;
- choose replacement style and optional length-preserving masking;
- receive redacted output, category/severity counts, findings, coverage and safety summaries;
- use built-in samples and clear/reset behavior;
- copy the redacted output;
- download the redacted output as TXT;
- use JA/EN UI.

The basic detector and redactor must not become dependent on billing availability.

### 3.2 Paid boundary — runtime-backed delta

Current runtime/UI evidence supports eight paid operations:

1. **Custom rules** — add/remove custom secret-prefix rules used during Pro-active scanning.
2. **Redaction profiles** — select the Pro-only profile used by generated review/handoff artifacts.
3. **Audit Markdown** — copy the generated audit Markdown.
4. **GitHub Issue template** — copy the generated GitHub Issue template.
5. **Support templates** — copy the generated Support or Discord sharing template.
6. **JSON findings export** — download findings as JSON.
7. **CSV findings export** — download findings as CSV.
8. **Markdown handoff export** — download the generated Markdown handoff pack.

These operations correspond to the existing legacy shared-Pro surface. No new paid feature is invented for staging.

### 3.3 Staged product-scoped wrapper

`tools/api-key-token-redactor/product-scoped-controller.mjs` is a non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

The staged contract requires:

- an explicit future product ID with no default/fallback;
- a complete and unique feature-ID mapping for all eight paid operations;
- server-backed `refreshProState({ productId })` through the shared controller core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, and entitlement-refresh failure states fail closed. The staged wrapper contains no `NWPro`, `nicheworks_pro`, local/session storage authority, Payment Link logic, pasted input, redacted output, finding preview, Blob, or clipboard dependency.

### 3.4 Secret-safety hardening — must be preserved

This tool processes credentials and other secret-bearing text. Product-scoped migration must preserve the current runtime hardening that prevents detected credential fragments from being re-exposed through Pro artifacts.

The current safety contract includes:

- visible finding/verification code previews are replaced with a fixed safe redacted marker;
- clipboard text for generated review artifacts is scrubbed against unsafe preview strings before write;
- string parts used to construct downloadable Blob artifacts are scrubbed before Blob creation;
- generated findings/review artifacts use the tool's safe-finding path and must not intentionally reproduce detected raw secret values.

A paid-entitlement migration must not weaken these controls or bypass them through a new export path.

### 3.5 Billing privacy boundary

Product-scoped billing and entitlement requests may contain only fixed product/feature entitlement metadata.

Do not send any of the following through the billing/entitlement path:

- pasted secret-bearing input;
- detected raw credential/token/private-key values;
- visible or internal preview fragments derived from detected secrets;
- redacted output text;
- findings, labels, line content, coverage/safety details, or custom-rule input;
- selected profile content if it includes user-generated data;
- generated Audit Markdown, GitHub Issue, Support/Discord template, or handoff content;
- JSON/CSV/Markdown export payloads or filenames.

### 3.6 Live migration requirements

API Key Token Redactor migration is complete only when all of the following are true:

1. an authoritative product and commercial configuration are registered in `config/billing/products.json`;
2. all eight paid-operation feature IDs are registered for that product;
3. checkout uses the common billing endpoint for that product;
4. signed Stripe webhook fulfillment records the matching paid entitlement in D1;
5. public runtime uses server-verified product state for the eight paid operations;
6. Free detection/redaction, safe summaries, redacted-text copy, and TXT download remain independent of billing availability;
7. failed/inactive entitlement checks leave the complete Free redactor usable;
8. clipboard, Blob, visible-preview, and safe-finding hardening remain effective for all paid artifacts;
9. billing/entitlement traffic contains no secret-bearing or generated user content;
10. the historical shared Payment Link and legacy shared state stop being authoritative for this tool;
11. reload re-verifies the product entitlement rather than trusting browser-local active state.

Return path: `/tools/api-key-token-redactor/`.

### 3.7 Commercial fields intentionally unresolved

Do not invent:

- product ID;
- display product name;
- price or currency;
- one-time vs recurring billing model;
- price tier ID;
- Stripe Price environment mapping;
- production feature-ID namespace;
- test/live checkout policy.

## 4. Wave 2 implementation order

1. Stage only legacy Pro tools whose current Free/Paid boundary is supported by runtime evidence.
2. Keep Command Safety as the first intended **live** product-scoped migration once authoritative commercial configuration is available.
3. Use the shared controller core for staging and keep each tool wrapper limited to its operation list and tool label.
4. Add privacy-specific regression checks for tools that process sensitive inputs; API Key Token Redactor is the reference secret-bearing-input case.
5. Do not treat staging completion as product launch or payment configuration.

## 5. Definition of done for current Wave 2 staging

SQL DB Risk Checker:

- exact seven-operation runtime-backed paid boundary;
- Free checker and two Free copy actions protected;
- thin shared-core wrapper;
- deterministic fail-closed tests;
- previous entitlement-name-only bypass hardening protected;
- nested-WHERE runtime safety guard protected;
- path-scoped CI;
- no commercial values invented;
- public runtime remains legacy until authorized live migration.

API Key Token Redactor:

- exact eight-operation runtime-backed paid boundary;
- Free detection/redaction, redacted-text copy, and TXT download protected;
- thin shared-core wrapper with no secret-bearing data dependency;
- deterministic fail-closed tests;
- visible-preview, clipboard, Blob, and safe-artifact hardening protected;
- billing privacy boundary excludes secret-bearing/user-generated content;
- path-scoped CI;
- no commercial values invented;
- public runtime remains legacy until authorized live migration.
