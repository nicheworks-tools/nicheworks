# Non-affiliate 72-tool strict audit summary

Status: initial strict audit complete  
Updated: 2026-09-16

## Scope and result

The 16-tool Affiliate workstream is explicitly excluded from this program. The remaining 72 registered tools were audited in six deterministic waves of 12 against `docs/non-affiliate-audit-standard.md`.

Final initial-audit state:

- `MAJOR_FIX`: 57
- `MINOR_FIX`: 12
- `HOLD_REVIEW`: 3
- `PASS`: 0
- Total: 72

A previous `PASS` in the legacy quality matrix is not a completion state for this program. Strict completion requires repair plus re-audit.

## Repair order

### 1. P0 — confirmed behavior and safety defects

Fix actual incorrect behavior and safety-critical regression gaps before broad SEO/UI cleanup. The first explicit runtime defect is `color-replace`, where a valid tolerance of `0` is currently replaced by the fallback value `20`. Safety-oriented tools such as `sql-db-risk-checker` also need direct behavioral regression coverage for their defining guards rather than static existence checks alone.

### 2. P0 — commercial and monetization source-of-truth alignment

Public purchase/activation state must match authoritative billing and entitlement state before Pro expansion. `reconcile` is a concrete blocker: the public page presents a ¥3,980 one-time purchase while the canonical billing configuration remains planning / not connected / billing unavailable.

The same repair track covers legacy shared-Pro surfaces whose product-scoped contract is still staged/non-live, plus canonical `ADS_DONATION` or `HOLD` tools whose runtime currently contains Pro or Amazon monetization that contradicts the classification. This thread resolves classification/runtime consistency only; optimization of the separately scoped Affiliate 16 remains outside this program.

### 3. P1 — behavior-level regression coverage

A large share of interactive tools remain `MAJOR_FIX` because defining transforms, invalid/failure paths, storage behavior, network/privacy boundaries, exports, or entitlement gates are source-reviewed but not directly regression-tested. Add focused deterministic tests per tool; do not treat static contract checkers as substitutes for behavior tests where runtime behavior can be exercised.

### 4. P1/P2 — tool-specific UX/spec/data fixes

After shared commercial and test foundations are stable, repair remaining tool-specific contract, runtime, data, responsive, accessibility, language, analytics, and specification drift. Confirmed behavior/data/privacy defects take precedence over traffic potential.

### 5. P2 — shared SEO and semantic cleanup

Apply common fixes where they genuinely solve repeated defects: Organization schema/logo omissions, duplicate H1s, overlong/short metadata, and thin intent copy. Do not mass-add generic long text to all tools. Use search evidence to decide whether each page needs CTR metadata work, ranking/content work, or positioning/indexability review.

### 6. HOLD disposition

The three canonical HOLD tools require an explicit product decision:

- `earth-map-suite`
- `old-kanji-ocr-scanner`
- `pattern-atlas`

Each must be marked `KEEP`, `PROMOTE`, `REBUILD`, or `ARCHIVE` before leaving `HOLD_REVIEW`.

## Immediate repair PR sequence

1. Direct functional defect repair: `color-replace` tolerance `0` handling plus behavior regression test.
2. Commercial containment: align `reconcile` public purchase UI with authoritative billing availability.
3. Commercial/monetization SSOT batch: resolve canonical-classification versus legacy Pro/Amazon runtime drifts without touching the separate Affiliate-16 optimization workstream.
4. Regression-test waves for remaining interactive tools, grouped narrowly enough to preserve meaningful review.
5. Shared SEO semantics batch, followed by tool-specific SEO/content fixes driven by live evidence.
6. HOLD disposition PR.
7. Re-audit changed tools until every non-HOLD tool is strict `PASS` and every HOLD tool has an explicit disposition.

Machine-readable aggregate: `audits/non-affiliate-summary.json`.
