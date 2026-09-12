# NicheWorks Pro Migration Ledger

Audit date: 2026-09-12  
Audit base: `9133d853b3fa1b059ed6dca5c12667546cdc61e6`  
Strategic source: `MONETIZATION_MASTER.md`  
Execution authority: `MONETIZATION_EXECUTION.md`

## 1. Purpose

This ledger separates two materially different kinds of work inside the 42 tools classified as Pro-primary:

1. **migration** of already-implemented legacy/shared Pro gates; and
2. **new product design** for tools that are commercially promising but have no current paid runtime contract.

A Pro label, preview card, historical Payment Link, or strategic classification does not by itself mean a tool is already a product-scoped paid product.

## 2. Billing truth at audit time

`config/billing/products.json` currently defines only `okj.toolkit_pro`. None of the 42 tools in this ledger has a verified product-scoped product entry.

The forward billing architecture is the product-scoped foundation introduced by PR #516. Legacy `NWPro.getLocalStatus()`, `nicheworks_pro`, `/api/pro/*`, old `pro_entitlements`, browser-cached shared state, and the historical shared Payment Link are migration inputs only.

The historical Payment Link `https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209` was reused by multiple tools. Its presence does not establish a product-specific price or product contract for any one tool.

## 3. Audit result

- Total Pro-primary candidates: **42**
- Current `LEGACY_SHARED_GATE`: **15**
- Current `NO_CURRENT_PRO_RUNTIME`: **27**
- Current `PRODUCT_SCOPED`: **0**
- Unresolved tool-specific `BYPASS_RISK` after this audit: **0**
- Tool-specific bypasses found and repaired in this audit: **3**
  - Logistics Compliance Kit JP: removed `nw_pro_logistics-compliance-kit-jp=1` authoritative fallback.
  - SQL DB Risk Checker: entitlement name alone can no longer activate Pro.
  - OG Image Maker: removed `nw_pro_key` as authoritative unlock by overriding the gate with explicit legacy shared `NWPro` active state.

The legacy shared foundation itself still caches shared Pro state in browser storage. This audit does not pretend that legacy mechanism is product-scoped purchase proof; it is scheduled for product-by-product migration.

## 4. Classification definitions

- `LEGACY_SHARED_GATE`: current paid behavior depends on old shared `NWPro` / `nicheworks_pro` state.
- `LEGACY_COMMERCE_COPY`: old shared purchase/unlock copy, price copy, or shared Payment Link remains and must not be treated as the future product contract.
- `BYPASS_RISK`: a weaker tool-specific route can independently unlock paid behavior. Any such finding is P0/P1 remediation work, not a future monetization feature.
- `NO_CURRENT_PRO_RUNTIME`: strategy says the tool is a Pro candidate, but its current runtime/spec has no paid gate to migrate.
- `PRODUCT_SCOPED`: current runtime uses the server-verified product-scoped billing foundation for its own registered product.
- `UNVERIFIED`: evidence is insufficient; do not infer.

## 5. 42-tool ledger

| # | Tool | Primary current class | Evidence / current state | Product registry | Next action |
|---:|---|---|---|---|---|
| 1 | `ai-interaction-atlas` | `LEGACY_SHARED_GATE` | `pro-bridge.js` reads `NWPro.getLocalStatus()`, checks `nicheworks_pro`, and points to the historical shared Payment Link. | none | Define product contract before migration. |
| 2 | `ai-project-pack` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC is a read-only repository guide; no paid runtime contract or Pro bridge is implementation evidence. | none | Decide whether a paid product exists beyond the public repository guide before coding billing. |
| 3 | `analytics-privacy-kit` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local draft generation/copy/TXT with no paid gate. | none | Define a real paid delta before any checkout surface. |
| 4 | `api-key-token-redactor` | `LEGACY_SHARED_GATE` | `pro-bridge.js` reads legacy shared `NWPro` and `nicheworks_pro`; #518 separately hardened secret-preview handling. | none | Preserve redaction safety fixes; later migrate the paid artifacts product-by-product. |
| 5 | `ats-paste-doctor` | `LEGACY_SHARED_GATE` | `pro-bridge.js` requires legacy shared active state and uses the historical shared Payment Link. | none | Define product ID/price/features, then migrate gate. |
| 6 | `codex-product-shipping-playbooks` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC is a public repository/workflow guide; no paid runtime contract. | none | Product design first, not billing migration. |
| 7 | `codex-usage-forecaster` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC makes logging, forecasting, profiles, import/export current functionality; no paid gate. | none | Define additive Pro value without removing current Free behavior. |
| 8 | `codex-work-os` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC is a read-only repository guide with no paid runtime. | none | Product design first. |
| 9 | `cold-email-requirement-checker` | `LEGACY_SHARED_GATE` | `pro-addon.js` reads `NWPro.getLocalStatus()` / `nicheworks_pro`; #518 removed older URL/tool-local self-unlock routes. | none | Migrate from legacy shared gate after product contract. |
| 10 | `command-safety-checker` | `LEGACY_SHARED_GATE` | `pro-bridge.js` uses historical shared Payment Link + `nicheworks_pro`; free checker is independent. | none | **Reference migration #1.** Commercial product settings remain unresolved; see Command Safety contract below. |
| 11 | `contract-cleaner` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes browser-local analysis, copy, and TXT output with no paid gate. | none | Define additive paid artifacts first. |
| 12 | `contract-risk-highlighter` | `LEGACY_SHARED_GATE` | `pro-bridge.js` reads legacy `NWPro` active state and shared Payment Link. | none | Define product contract and migrate without weakening legal disclaimers/free findings. |
| 13 | `csv-tidy` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC makes load/clean/preview/UTF-8 CSV output current functionality; no paid gate. | none | Product design first; do not take away current transform/export behavior merely to create a paywall. |
| 14 | `design-request-builder` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes structured brief generation and current copy/download outputs with no paid gate. | none | Define a distinct paid workflow/artifact bundle first. |
| 15 | `image-redact` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes mask editing and PNG export with no paid gate. | none | Product design first; core privacy/redaction must remain usable. |
| 16 | `incident-update-generator` | `LEGACY_SHARED_GATE` | `pro-bridge.js` reads `NWPro.getLocalStatus()` / `nicheworks_pro` and uses shared Payment Link. | none | Migrate existing Incident Communication Pack only after product contract. |
| 17 | `json-repair` | `LEGACY_SHARED_GATE` | Shared gate is embedded in `app.js`; public copy includes historical shared-Pro `$2.99` wording. | none | Treat `$2.99` as legacy copy, not verified product price; define product contract before migration. |
| 18 | `json2mermaid` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC makes JSON→Mermaid source, copy, `.mmd`, and `.txt` Free/current; no paid gate exists. | none | **New product design priority #1 after Command Safety proof.** Preserve existing Free exports. |
| 19 | `log-formatter` | `LEGACY_SHARED_GATE` | `pro-bridge.js` reads legacy `NWPro` state and uses shared Payment Link. | none | Migrate existing advanced analysis/export bundle after earlier reference migrations. |
| 20 | `logistics-compliance-kit-jp` | `LEGACY_SHARED_GATE` | Legacy shared gate remains. Audit removed the separate `nw_pro_logistics-compliance-kit-jp=1` fallback. | none | **Migration priority after JSON2Mermaid product definition.** Define exact product commercial config first. |
| 21 | `lp-skeleton-generator` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local LP draft plus Markdown/HTML outputs; no paid gate. | none | Define additive paid value first. |
| 22 | `membership-offer-builder` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local offer generation/copy with no paid gate. | none | Product design first. |
| 23 | `microtool-launch-checklist` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes checklist copy/Markdown/TXT with no paid gate. | none | Product design first. |
| 24 | `minutes-to-ops` | `LEGACY_SHARED_GATE` | `pro-bridge.js` reads legacy shared `NWPro` / `nicheworks_pro` and points to shared Payment Link. | none | Define product-specific contract, then migrate existing Pro operational outputs. |
| 25 | `money-template-checker` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes JPY checks plus copy/Markdown/CSV templates with no paid gate. | none | Product design first; keep financial-disclaimer boundary. |
| 26 | `newsletter-kit-generator` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local bilingual kit generation/copy with no paid gate. | none | Product design first. |
| 27 | `niche-job-starter-kit` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local job kit, TXT, and CSV header template with no paid gate. | none | Define additive paid recruiting artifacts without storing applicants. |
| 28 | `notion-form-design-kit` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local design/copy/Markdown/TXT; no Notion API and no paid gate. | none | Product design first. |
| 29 | `og-image-maker` | `LEGACY_SHARED_GATE` | Batch generation is a Pro surface. Audit removed direct `nw_pro_key` authority and now requires explicit legacy shared `NWPro` active state. | none | Later define product-scoped batch/export product; current bypass repair must remain. |
| 30 | `ops-weekly-report-generator` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local JP/EN report generation and TXT/Markdown downloads with no paid gate. | none | Product design first. |
| 31 | `outsource-spec-generator` | `LEGACY_SHARED_GATE` | `pro-bridge.js` reads legacy shared state; CTA text hardcodes historical `$2.99`. | none | Do not inherit `$2.99` as product truth; define product contract, then migrate. |
| 32 | `pdf-page-tools-mini` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes merge/reorder/delete/rotate/extract/save PDF locally with no paid gate. | none | Product design first; current PDF editing flow stays Free unless a distinct additive bundle is defined. |
| 33 | `pdf2csv-local` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local Auto/Manual extraction and CSV/XLSX export with no paid gate. | none | Product design first; do not remove current reviewed exports to manufacture Pro value. |
| 34 | `product-founder-os` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC is a public repository documentation surface, not a hosted paid workflow. | none | Define a separate paid deliverable/service/tool before adding billing. |
| 35 | `release-guardian` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC is a public repository/CLI guide; NicheWorks page does not run repository checks. | none | Define a paid product separate from the public repository guide before billing. |
| 36 | `rename-wizard` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes candidate generation, TSV copy, CSV download; no paid gate. | none | Product design first; actual rename execution remains out of current contract. |
| 37 | `screenshot-stitcher` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes stitch/preview, image export, and split ZIP with no paid gate. | none | Product design first; retain current core export workflow. |
| 38 | `sponsor-page-builder` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes local sponsor-page drafting/copy/download with no paid gate. | none | Product design first. |
| 39 | `sql-db-risk-checker` | `LEGACY_SHARED_GATE` | `pro-bridge.js` uses legacy shared state. Audit fixed a defect where default `entitlement=nicheworks_pro` alone could activate Pro. | none | Preserve fail-closed fix, then migrate after product contract. |
| 40 | `ui-atlas` | `LEGACY_SHARED_GATE` | `pro-bridge.js` reads explicit legacy shared `NWPro` active state; existing Pro compare/generator surfaces remain legacy. | none | Product contract + product-scoped migration later; do not reuse shared Payment Link as price authority. |
| 41 | `url-title-collector` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes Worker-backed title collection and CSV/TSV copy with no paid gate. | none | Product design first; privacy copy/runtime mismatch is separate from monetization. |
| 42 | `webp-avif-converter` | `NO_CURRENT_PRO_RUNTIME` | Current SPEC exposes one-file local PNG/JPEG conversion with no paid gate. | none | Product design first; batch/advanced conversion could be evaluated later. |

## 6. Bypass remediation performed during this audit

### 6.1 Logistics Compliance Kit JP

Before this audit, either of two conditions unlocked Pro:

- legacy shared `NWPro` active state; or
- `localStorage["nw_pro_logistics-compliance-kit-jp"] === "1"`.

The tool-local fallback is removed. Remaining legacy behavior requires an explicit shared active state and matching entitlement when an entitlement is supplied.

This is still legacy shared architecture and must later migrate to product-scoped billing; the repair only closes the weaker extra unlock route.

### 6.2 SQL DB Risk Checker

Before this audit, `normalizeStatus()` treated any status object with `entitlement === "nicheworks_pro"` as active even when `active` was false/missing. The old shared helper returns that entitlement name by default, so the tool could unlock from an inactive default status.

The gate now requires:

- a matching/no-conflict entitlement; **and**
- an explicit active signal (`active`, `pro`, `unlocked`, or `status === "active"`).

Entitlement name alone cannot unlock the tool.

### 6.3 OG Image Maker

Before this audit, `window.NW.hasPro()` returned true whenever arbitrary browser-local `nw_pro_key` existed.

The page now loads the existing shared Pro helper and an OG-specific bridge that overrides `NW.hasPro()` so batch generation requires explicit legacy shared active state. The `nw_pro_key` value by itself is no longer authoritative.

Again, this is an interim hardening step, not product-scoped migration.

## 7. Command Safety Checker — migration contract

Command Safety is the first reference migration because it already has a concrete Free/Pro boundary and operational Pro artifacts.

### Free contract that must remain Free

- multi-line Unix shell / PowerShell command input;
- implemented risky-pattern detection;
- risk/category/reason output;
- verification guidance;
- safer/dry-run alternative guidance;
- JP/EN UI;
- explicit statement that results do **not** certify a command as safe.

### Existing paid-artifact concepts that may be preserved

- review Markdown/report;
- priority checklist;
- safer-command review suggestions;
- Codex safety-check task;
- GitHub Issue draft;
- JSON/Markdown operational exports.

These describe current product value; they do not authorize a price or product identifier.

### Commercial fields still unresolved

Do not invent any of these:

- canonical product ID;
- exact price;
- `priceTierId`;
- Stripe Price environment variable mapping;
- live/test checkout enablement policy;
- final checkout return-path contract if it differs from the generic safe internal return mechanism.

The historical shared Payment Link does not resolve any of those fields.

### Migration implementation once commercial fields are verified

1. Add the verified product to `config/billing/products.json`.
2. Replace hard-coded shared Payment Link usage with `/api/billing/create-checkout-session` for that product.
3. Replace `nicheworks_pro` local/shared gating with the product-scoped server-verification adapter.
4. Require matching active D1 entitlement before Pro artifacts unlock.
5. Keep free command analysis fully independent of billing availability.
6. Keep checkout/session IDs and command content out of analytics.
7. Run an end-to-end test: paid Checkout → signed webhook → D1 entitlement → success verification → tool unlock → refresh/re-check.

## 8. Execution queue

### Already completed in this audit

1. Close Logistics tool-local fallback.
2. Close SQL DB Risk entitlement-only activation.
3. Close OG Image Maker `nw_pro_key` activation.
4. Classify all 42 candidates exactly once.

### Product/billing sequence

1. **Command Safety Checker** — first product-scoped migration after exact commercial configuration is verified.
2. **JSON2Mermaid** — first new Pro product design; current `.mmd`/`.txt` output remains Free.
3. **Logistics Compliance Kit JP** — product-scoped migration after its exact product contract is verified.
4. **JSON Repair / Outsource Spec Generator** — remove historical shared-price assumptions while defining their product contracts.
5. Remaining legacy shared-gate tools, prioritized by observed usage and paid-feature clarity.
6. `NO_CURRENT_PRO_RUNTIME` tools only after a concrete additive paid delta is specified; do not bulk-add checkout buttons.

## 9. Rules for future updates

- A tool moves to `PRODUCT_SCOPED` only when its own registry entry and server-verified entitlement path are implemented.
- A generic price tier existing in `products.json` is not evidence that a specific tool costs that amount.
- Historical `$2.99` copy is not a product contract.
- Existing Free functionality must not be removed merely to create paid value unless an explicit product decision approves that breaking change.
- Tool-local URL/localStorage flags must never be authoritative purchase proof.
- ManualFinder and affiliate offer architecture remain a separate workstream.
