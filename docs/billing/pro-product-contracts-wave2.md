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

## 3. Wave 2 implementation order

1. Stage only legacy Pro tools whose current Free/Paid boundary is supported by runtime evidence.
2. Keep Command Safety as the first intended **live** product-scoped migration once authoritative commercial configuration is available.
3. Use the shared controller core for staging and keep each tool wrapper limited to its operation list and tool label.
4. Add privacy-specific regression checks for tools that process sensitive inputs.
5. Do not treat staging completion as product launch or payment configuration.

## 4. Definition of done for SQL DB Risk staging

- exact seven-operation runtime-backed paid boundary;
- Free checker and two Free copy actions protected;
- thin shared-core wrapper;
- deterministic fail-closed tests;
- previous entitlement-name-only bypass hardening protected;
- path-scoped CI;
- no commercial values invented;
- public runtime remains legacy until authorized live migration.
