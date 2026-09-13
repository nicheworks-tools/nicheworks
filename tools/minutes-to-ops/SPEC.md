# Tool Specification — Minutes to Ops

- Slug: `minutes-to-ops`
- Public URL: `https://nicheworks.app/tools/minutes-to-ops/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Canonical per-tool specification: `docs/tools/minutes-to-ops.md`
- Monetization class: `PRO_BUNDLE`

## Purpose

Turn pasted meeting minutes into operational artifacts using deterministic rule-based extraction rather than AI summarization.

## Current functional contract

- Accept meeting notes plus optional meeting title, date, and participants.
- Extract ToDo candidates from rule/keyword patterns and derive owner/due fields when present.
- Extract decision/agreement lines and produce an SOP draft.
- Infer whether output headings should be Japanese or English from the pasted notes; switching the UI does not translate the notes.
- Free mode provides generation, previews, Markdown/SOP copy, CSV download, and Markdown download.
- The current legacy Pro surface provides local history save/compare, a bundled JSON output pack, GitHub Issue artifact, Codex request artifact, and SOP handoff Markdown artifact.
- Copy/download variants of GitHub/Codex/SOP artifacts are delivery actions of those same paid capabilities, not separate entitlements.
- Cap ToDo extraction rather than attempting unlimited meeting-note interpretation.

## Inputs

- Meeting minutes text.
- Optional meeting title, date, and participants.
- JA/EN UI selection.
- Current legacy shared NicheWorks Pro entitlement state for paid actions.

## Outputs

- ToDo table with Task, Owner, Due, Priority, and Status fields.
- Decision list.
- SOP draft.
- CSV and Markdown previews/downloads.
- Pro local history/comparison, bundled output pack, GitHub Issue, Codex request, and SOP handoff artifacts.

## State and persistence

Normal pasted notes and generated outputs are page state. Pro history is stored locally under `nw_mto_history_v2`. Legacy shared `nicheworks_pro` browser state remains migration-only authority; it is not future server-verified purchase proof. User-triggered downloads are saved locally.

## Privacy and network behavior

Extraction runs in the browser. Meeting text is not sent to an AI summarization service. Ads/analytics and the external legacy Pro purchase flow may communicate independently.

Billing/entitlement requests may contain fixed product/feature metadata only. Meeting notes, meeting metadata, ToDos, decisions, SOP content, history snapshots/comparisons, output-pack payloads, GitHub Issue content, Codex request content, SOP handoff content, or filenames derived from user content must not enter billing/entitlement traffic.

Current analytics events may contain fixed `tool_slug`, UI language, and fixed feature identifiers only; meeting or generated content must not be included.

## Product-scoped migration staging

`MONETIZATION_CLASSIFICATION_87.md` classifies `minutes-to-ops` as an approved `PRO_BUNDLE` member. Its future shared product authority is `nicheworks.pro`; legacy `nicheworks_pro` is compatibility/migration state only.

`tools/minutes-to-ops/product-scoped-controller.mjs` stages exactly five paid capabilities:

1. `history`
2. `outputPack`
3. `githubIssue`
4. `codexRequest`
5. `sopHandoff`

`history` covers both save and compare over the same local-history facility. GitHub/Codex/SOP copy and download variants are delivery actions under their respective capability.

The staged wrapper requires an explicit product ID and complete unique feature map, delegates server verification to `assets/nw-product-scoped-controller.mjs`, and fails closed for wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, or entitlement-refresh failure states.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved Minutes to Ops feature mapping. This staging contract does not create a separate Minutes to Ops paid product.

The current public bridge remains legacy. It requires both `active === true` and exact `nicheworks_pro`, and re-checks exact entitlement state before ordinary Pro button actions so a DOM-only `data-pro-active` edit or manually unhidden Pro button cannot authorize the normal UI path.

The historical shared Payment Link is legacy commerce evidence only. It does not authorize the future NicheWorks Pro price. Price/currency, Stripe Product/Price, production feature IDs, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved.

## Language mode

`bilingual single-page`

The UI labels switch JA/EN; source minutes are not translated, and output heading language is inferred from the source text.

## Layout class

`pc-oriented`

The primary workflow uses dense notes input, tabular ToDos, multiple artifact panels, and Pro handoff outputs, although responsive use remains supported.

## Limits and non-goals

- This is rule-based extraction, not semantic AI summarization.
- Important tasks and decisions can be missed or misclassified and must be checked against the source minutes.
- It does not translate meeting content.
- Pro history is browser-local, not an account-synced meeting archive.
- Generated SOP/GitHub/Codex artifacts are drafts, not proof that operational work has been completed.
- Product-scoped staging does not launch billing or change extraction rules.

## Acceptance criteria

- [ ] Free generation works without an AI API and produces ToDo, decision, SOP, CSV, and Markdown artifacts from pasted text.
- [ ] UI language switching does not silently translate the pasted meeting text.
- [ ] Free Markdown/SOP copy and CSV/Markdown download remain available when Pro is inactive.
- [ ] The exact paid capability boundaries are `history`, `outputPack`, `githubIssue`, `codexRequest`, and `sopHandoff`.
- [ ] Current legacy Pro requires explicit active state plus exact `nicheworks_pro`, and ordinary Pro button actions re-check that state before execution.
- [ ] Product-scoped staging fails closed unless server-verified state matches the configured product and returned mapped features.
- [ ] Canonical monetization classification is `PRO_BUNDLE`, and future live product authority is shared `nicheworks.pro` rather than a tool-specific product.
- [ ] Billing/entitlement and analytics traffic contains no meeting or generated user content.
- [ ] Pro history uses `nw_mto_history_v2` and remains browser-local.

## Implementation evidence

- `tools/minutes-to-ops/index.html`
- `tools/minutes-to-ops/app.js`
- `tools/minutes-to-ops/pro-bridge.js`
- `tools/minutes-to-ops/product-scoped-controller.mjs`
- `scripts/check-minutes-to-ops-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave8.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
