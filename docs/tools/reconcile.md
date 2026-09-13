# NicheWorks Reconcile — canonical tool specification

- **Slug:** `reconcile`
- **Display name (JA):** NicheWorks Reconcile
- **Display name (EN):** NicheWorks Reconcile
- **Implementation:** `tools/reconcile/`
- **Registry state:** active (registered implementation present)
- **Category:** reconcile, finance, csv, xlsx
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `reconcile` implementation at `/tools/reconcile/`. It supplements the detailed implementation contract in `tools/reconcile/SPEC.md` and does not authorize unrelated runtime changes.

## 2. Purpose

Reconcile two user-supplied CSV/XLSX transaction datasets locally in the browser, classify deterministic matches and exceptions, and reduce the set of records requiring human review. It is a reconciliation aid, not an accounting system or autonomous financial decision-maker.

## 3. Inputs

- File A and File B in CSV or XLSX format.
- CSV encoding: Auto, UTF-8, or Shift_JIS; delimiter: Auto, comma, tab, or semicolon; header row 1–20.
- XLSX worksheet selection.
- Required amount-column mapping plus optional date, reference/transaction ID, and description mappings.
- Free date tolerance and ambiguous-date-order controls.
- Verified Reconcile Pro may additionally use amount tolerance, sign mode, bounded 1:n / n:1 settings, and saved rule-profile controls.
- JP/EN UI selection.

## 4. Processing behavior

- Parse CSV/XLSX locally and normalize supported values conservatively; ambiguous or malformed values are not silently coerced into confident matches.
- Prioritize deterministic reference/exact relationships and only auto-confirm mutually unique relationships; ambiguous relationships remain review candidates.
- Classify results as `exact_match`, `tolerant_match`, `candidate`, `a_only`, `b_only`, `duplicate`, or `conflict`.
- Enforce bounded candidate/group-search limits and fail/degrade safely rather than allowing combinatorial matching to run unbounded.
- Free limits are 500 rows and 5 MB per file. Verified Reconcile Pro raises limits to CSV 100,000 rows / 50 MB and XLSX 50,000 rows / 25 MB per file and enables the documented additive Pro operations.
- Reconcile Pro authority is product-scoped: product `reconcile.pro_v1` with required feature `reconcile_pro_v1`. Shared `nicheworks_pro` alone must not unlock Reconcile.

## 5. Outputs

- Reconciliation summary, filter/search controls, paged review table, statuses, relations, amounts, dates, and reason text.
- Free CSV audit export.
- Verified-Pro XLSX report plus saved-rule JSON import/export and profile management.

Observed delivery capabilities: clipboard-copy-specific result action **not established**; download/export **present**.

## 6. Error behavior

- Missing/invalid files, unsupported data, missing required mappings, over-limit input, ambiguous dates, and bounded-search overflow are surfaced as non-success states rather than fabricated matches.
- Re-parsing follows the selected CSV parsing settings while the selected File object remains page-memory only.
- Missing or unverified Pro entitlement fails closed to Free behavior; a URL/local-only/shared-Pro state is not authoritative for `reconcile_pro_v1`.
- XLSX parsing/export uses the pinned local SheetJS CE 0.20.3 vendor; vendor/parser failures do not upload source transaction data as a fallback.
- Existing input remains available for correction where the runtime can safely retain it; transaction rows are not persisted as a recovery mechanism.

## 7. Privacy/data handling

CSV/XLSX parsing, normalization, matching, result generation, CSV/XLSX export, and transaction-row handling are browser-local. Transaction rows, descriptions, amounts, references, source files, and generated reconciliation results must not be sent to NicheWorks servers, Stripe, analytics, or advertising systems. Billing/entitlement traffic is limited to fixed product/feature/session metadata. Saved rule profiles may persist parser/mapping/matching configuration in localStorage, but not transaction rows or source files.

Network-capable product behavior is limited to same-origin billing/entitlement requests and the explicit checkout flow; suite-wide analytics/advertising and support links load separately from reconciliation processing.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source tool SPEC class: `pc-oriented`).
- Two-file mapping, reconciliation tables, and review workflows benefit from wide screens; narrow viewports must remain usable without forcing the whole product into a universal 600px shell.
- Current static audit established no concrete responsive hard defect.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The public tool supports same-page JP/EN UI switching. Existing languages must be preserved.
- The current separate usage page is Japanese-led; absence of a separate English usage file is not itself a hard compliance failure.

## 10. SEO contract

The public page must retain a tool-specific title/description, exactly one self-referencing canonical for `https://nicheworks.app/tools/reconcile/`, index/follow robots state, and valid WebApplication JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**.

## 11. Advertising contract

Preserve current GA4 and AdSense identifiers/code. Ads must remain outside file-selection, mapping, reconciliation, checkout, and result-action flows. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve the footer-near OFUSE + Ko-fi support block independently from the Reconcile Pro purchase CTA. Donation/support must not be presented as purchase or entitlement. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/reconcile/usage.html`.
- **FAQ:** `optional-absent`. FAQ remains conditional and its absence is not a hard failure.
- Exact-file coverage: Japanese usage file **present**; separate English usage file **absent**.

## 14. Functional acceptance tests

- [ ] CSV and XLSX inputs within Free limits parse locally and can be mapped without uploading transaction data.
- [ ] Deterministic 1:1 matching preserves ambiguity as candidate/conflict rather than assigning by input order.
- [ ] Free limits and verified-Pro CSV/XLSX limits remain enforced.
- [ ] Reconcile Pro activates only from server-verified `reconcile.pro_v1` / `reconcile_pro_v1`; shared `nicheworks_pro` alone remains insufficient.
- [ ] CSV audit export reflects the full reconciliation result set even when the review table is paged.
- [ ] Saved profiles persist settings only and never transaction rows/files.
- [ ] Bounded candidate/group searches stop safely on pathological inputs.
- [ ] The pinned local XLSX vendor remains usable without a runtime CDN dependency.

Automated behavior-test evidence: `tools/reconcile/tests/export.test.mjs`, `normalize.test.mjs`, `parser.test.mjs`, `reconcile-engine.test.mjs`, `reconcile-quality.test.mjs`, `reconcile-stress.test.mjs`, `rules-store.test.mjs`, `xlsx-adapter.test.mjs`, and `xlsx-real-vendor.test.mjs`. Behavior-level status: **behavior-test-present**.

## 15. Explicit tool-specific exceptions

- Reconcile is a standalone paid-product exception to the shared NicheWorks Pro bundle: a Reconcile Pro purchase may grant shared Pro, but shared Pro does not grant Reconcile Pro.
- No fully-offline claim is made for the whole page because analytics, advertising, billing/entitlement, checkout, and support links may use network requests; transaction processing itself remains local.
- No additional language or layout exception is established beyond the contracts above.

### Implementation evidence

- `tools/reconcile/index.html`
- `tools/reconcile/app.mjs`
- `tools/reconcile/styles.css`
- `tools/reconcile/SPEC.md`
- `tools/reconcile/usage.html`
- `tools/reconcile/parser.mjs`
- `tools/reconcile/normalize.mjs`
- `tools/reconcile/reconcile-engine.mjs`
- `tools/reconcile/export.mjs`
- `tools/reconcile/xlsx-adapter.mjs`
- `tools/reconcile/tests/`
