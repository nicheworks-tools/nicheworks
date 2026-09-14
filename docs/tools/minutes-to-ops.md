# Minutes to Ops — canonical tool specification

- **Slug:** `minutes-to-ops`
- **Display name (JA):** 議事録から実行項目へ
- **Display name (EN):** Minutes to Ops
- **Implementation:** `tools/minutes-to-ops/`
- **Registry state:** active (registered implementation present)
- **Category:** minutes, ops, tasks, meeting
- **Common specification:** `common-spec/spec-ja.md`
- **Monetization class:** `PRO_BUNDLE`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `minutes-to-ops` implementation at `/tools/minutes-to-ops/`. It does not authorize a production rewrite or live billing launch.

## 2. Purpose

Turn pasted meeting minutes into operational artifacts using deterministic rule-based extraction rather than AI summarization.

## 3. Inputs

- Meeting minutes text.
- Optional meeting title, date, and participants.
- JA/EN UI selection.
- Current legacy shared NicheWorks Pro entitlement state for paid actions.

## 4. Processing behavior

- Accept meeting notes plus optional meeting title, date, and participants.
- Extract ToDo candidates from rule/keyword patterns and derive owner/due fields when present.
- Extract decision/agreement lines and produce an SOP draft.
- Infer whether output headings should be Japanese or English from the pasted notes; switching the UI does not translate the notes.
- Free mode provides generation, previews, Markdown/SOP copy, CSV download, and Markdown download.
- The current legacy Pro surface provides local history save/compare, a bundled JSON output pack, GitHub Issue artifact, Codex request artifact, and SOP handoff Markdown artifact.
- GitHub/Codex/SOP copy and download variants are delivery actions of those same artifact capabilities, not separate entitlements.
- Cap ToDo extraction rather than attempting unlimited meeting-note interpretation.
- The public legacy bridge requires explicit active state and exact `nicheworks_pro`; it re-applies that exact state before ordinary Pro button actions.
- The product-scoped controller is migration staging only and is not connected to the public runtime yet.

## 5. Outputs

- ToDo table with Task, Owner, Due, Priority, and Status fields.
- Decision list.
- SOP draft.
- CSV and Markdown previews/downloads.
- Pro local history/comparison, output pack, GitHub Issue, Codex request, and SOP handoff artifacts.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core extraction path; suite analytics, advertising, and entitlement resources are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as successful export.
- **Paid-action failure/absence:** Inactive or non-matching legacy entitlement state leaves the complete Free generation/copy/download workflow usable while paid actions remain locked.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/minutes-to-ops/app.js`, `tools/minutes-to-ops/pro-bridge.js`, `tools/minutes-to-ops/index.html`.

## 7. Privacy/data handling

Extraction runs in the browser. Meeting text is not sent to an AI summarization service. Ads/analytics and the external legacy Pro purchase flow may communicate independently.

Persistence evidence: `localStorage`, including `nw_mto_history_v2` for Pro history. Network-capable application code for the extraction workflow: **not found**; non-suite hosts observed include the historical Stripe Payment Link and support links.

Billing/entitlement requests may contain fixed product/feature metadata only. They must not include meeting notes, title/date/participants, extracted ToDos, owners/due values, decisions, SOPs, history snapshots/comparisons, GitHub Issue content, Codex request content, SOP handoff content, output-pack content, or filenames derived from user content.

Current analytics events may use fixed tool/language/feature identifiers only and must not include meeting or generated content.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The primary workflow uses dense notes input, tabular ToDos, multiple artifact panels, and Pro handoff outputs, although responsive use remains supported.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The UI labels switch JA/EN; source minutes are not translated, and output heading language is inferred from the source text.
- Existing languages must not be removed.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/minutes-to-ops/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `optional-present`. Evidence: `tools/minutes-to-ops/usage-en.html`, `tools/minutes-to-ops/usage.html`.
- **FAQ:** `optional-present`.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

### Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `minutes-to-ops` as an approved `PRO_BUNDLE` member. Its future paid product authority is the shared `nicheworks.pro` product; legacy `nicheworks_pro` remains compatibility/migration state only.

Current Free behavior is fixed: notes input, deterministic generation, ToDo/decision/SOP outputs, CSV/Markdown previews, Markdown/SOP copy, CSV download, and Markdown download remain usable without paid entitlement.

The exact additive paid capability boundaries are:

1. `history` — browser-local save plus comparison over the same history facility.
2. `outputPack` — bundled JSON Pro output pack.
3. `githubIssue` — GitHub Issue artifact; copy/download are delivery actions.
4. `codexRequest` — Codex request artifact; copy/download are delivery actions.
5. `sopHandoff` — SOP handoff Markdown artifact; copy/download are delivery actions.

The public runtime remains on the hardened legacy shared-Pro bridge until shared-bundle commercial configuration and live migration are authorized. `tools/minutes-to-ops/product-scoped-controller.mjs` is staging only and delegates future server verification to `assets/nw-product-scoped-controller.mjs`.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved Minutes to Ops feature mapping. No Minutes-to-Ops-specific paid product is created by this contract.

The historical shared Payment Link is legacy commerce evidence only, not future price authority. NicheWorks Pro price/currency, Stripe Product/Price, production feature IDs, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved. Detailed staging requirements are in `docs/billing/pro-product-contracts-wave8.md`.

## 14. Functional acceptance tests

- [ ] Free generation works without an AI API and produces ToDo, decision, SOP, CSV, and Markdown artifacts from pasted text.
- [ ] UI language switching does not silently translate pasted meeting text.
- [ ] Free Markdown/SOP copy and CSV/Markdown download remain available when Pro is inactive.
- [ ] Paid boundaries are exactly `history`, `outputPack`, `githubIssue`, `codexRequest`, and `sopHandoff`.
- [ ] Current legacy Pro requires explicit active state plus exact `nicheworks_pro`, and ordinary Pro button actions re-check that state before execution.
- [ ] Product-scoped staging fails closed unless server-verified state matches the configured product and mapped features.
- [ ] Future live product authority is shared `nicheworks.pro`, not a tool-specific product.
- [ ] Billing/entitlement and analytics traffic contains no meeting or generated user content.
- [ ] Pro history uses `nw_mto_history_v2` and remains browser-local.

Automated source/regression evidence includes `scripts/check-tool-runtime-contracts-wave4.mjs` and `scripts/check-minutes-to-ops-product-scoped-staging.mjs`. Dedicated staging checks are not represented as a full browser E2E test.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.
- The historical shared Payment Link is migration evidence and must not be used as future NicheWorks Pro price authority.

### Implementation evidence

- `tools/minutes-to-ops/index.html`
- `tools/minutes-to-ops/app.js`
- `tools/minutes-to-ops/pro-bridge.js`
- `tools/minutes-to-ops/product-scoped-controller.mjs`
- `scripts/check-minutes-to-ops-product-scoped-staging.mjs`
- `tools/minutes-to-ops/howto-en.html`
- `tools/minutes-to-ops/howto.html`
- `tools/minutes-to-ops/style.css`
- `tools/minutes-to-ops/usage-en.html`
- `tools/minutes-to-ops/usage.html`
- `docs/billing/pro-product-contracts-wave8.md`
