# ATS Paste Doctor — canonical tool specification

- **Slug:** `ats-paste-doctor`
- **Display name (JA):** ATS貼り付け整形チェック
- **Display name (EN):** ATS Paste Doctor
- **Implementation:** `tools/ats-paste-doctor/`
- **Registry state:** active (registered implementation present)
- **Category:** ats, resume, paste, job
- **Common specification:** `common-spec/spec-ja.md`
- **Monetization class:** `PRO_BUNDLE`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `ats-paste-doctor` implementation at `/tools/ats-paste-doctor/`. It does not authorize live billing launch or a product rewrite.

## 2. Purpose

Clean and inspect resume, cover-letter, and application text before it is pasted into an ATS or job form, while surfacing formatting and character issues that may affect readability.

## 3. Inputs

- Resume, cover-letter, application, or other pasted text.
- Output-mode selection.
- Optional character-limit value.
- UI language selection.
- Current legacy shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Accept pasted application text and report character/count information and warnings.
- Provide ATS-friendly plain text, keep-line-breaks, and clean output modes.
- Accept an optional character-limit target and show limit-related status.
- Generate cleaned output plus a compact ATS-style readability preview.
- Free mode supports copy/TXT and processes up to 30,000 characters.
- Current legacy Pro raises the processing limit to 200,000 characters and gates output-pack/checklist copy, JSON/PDF export, template slots, and local history.
- Provide bilingual UI and explicit privacy/ATS-guarantee notices.

## 5. Outputs

Free:
- cleaned text;
- counts/warnings/limit status/readability preview;
- clipboard copy;
- TXT download.

Runtime-backed paid value boundaries:
1. `extendedInputLimit` — 200,000-character processing limit instead of 30,000;
2. `outputPack` — Full ATS/Markdown pack plus pre-submit checklist copy;
3. `proExports` — JSON export and printable PDF pack;
4. `templates` — local template-slot save/load;
5. `history` — local history save/load/delete/clear.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- Empty input is rejected through the current visible validation path.
- Input above the active plan limit is rejected rather than truncated silently.
- Processing failures do not present a successful output.
- Clipboard failure uses the current fallback/error path.
- Billing/entitlement failure leaves the defined Free formatter available and paid operations locked.
- Reset restores the current editing workflow without fabricated success state.

## 7. Privacy/data handling

Text formatting runs in the browser and pasted application content is not intentionally uploaded by the tool workflow. The page may load suite-wide ads, analytics, and entitlement resources independently; users should redact personal details when appropriate.

Persistence evidence: `localStorage` for paid template/history features. Network-capable application code: core processing **local**; historical payment link exists separately.

Future billing/entitlement requests may contain fixed product/feature metadata only. Pasted text, cleaned output, metrics/warnings, checklist content, templates/history/snippets, output bodies, filenames, and extracted personal/employer/contact/work-history information must not enter billing.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Paired desktop panels stack responsively on narrow screens.
- Preserve the functional width class and common-spec adaptation rules.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN buttons switch the same tool UI and notices.
- Existing bilingual coverage must remain equivalent for core functionality and safety copy.

## 10. SEO contract

Retain tool-specific title/description, self-referencing canonical, and valid WebApplication structured data according to common-spec. Do not pad SEO prose beyond product evidence.

## 11. Advertising contract

Preserve existing GA4/AdSense identifiers/code. Advertising must not interrupt the input/action flow. Historical Pro copy mentions ad hiding, but this tool boundary contract does not model ad hiding as a tool operation; suite-level presentation policy may handle it later.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Current main-page donation/support evidence: **present**. Preserve the footer-near OFUSE + Ko-fi support block and shared support styling unless the suite contract intentionally changes.

## 13. Help/usage/FAQ contract

- Main-page concise explanation: required-and-present.
- Usage documentation: present in JA/EN.
- FAQ: present under current implementation.
- Usage links remain subdued and separated from advertising.

## 14. Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `ats-paste-doctor` as `PRO_BUNDLE`. Future live paid product authority is shared `nicheworks.pro`; legacy `nicheworks_pro` remains compatibility/migration state only.

The five exact current additive paid operation boundaries are listed in section 5. Free formatter behavior, 30,000-character processing, copy and TXT download remain independent of billing availability.

The current legacy bridge must require exact `local.active === true` plus `local.entitlement === "nicheworks_pro"`. A missing/unrelated entitlement cannot activate current paid behavior. Because the current app reads `data-pro-active` for plan checks, the bridge revalidates exact legacy state in the click capture phase before the Generate button or any `[data-pro-action]` control reaches normal application handlers. DOM-only `data-pro-active` edits therefore do not survive the ordinary UI action path.

`tools/ats-paste-doctor/product-scoped-controller.mjs` is non-live staging. It requires explicit product/feature configuration and delegates server verification to `assets/nw-product-scoped-controller.mjs`. For live migration, configured product ID must be `nicheworks.pro`; no ATS-Paste-Doctor-specific product is authorized.

Bundle price/currency, Stripe Product/Price, production feature IDs, restore/account policy, purchaser migration and rollout timing remain unresolved.

## 15. Functional acceptance tests

- [ ] Each supported formatting mode generates local output, counts, warnings and preview.
- [ ] Free copy/TXT works up to 30,000 characters regardless of billing availability.
- [ ] Current paid behavior supports 200,000 characters and the documented pack/export/template/history operations.
- [ ] Missing/unrelated legacy entitlement cannot unlock paid behavior.
- [ ] A manual `data-pro-active` DOM edit is revalidated before ordinary Generate/Pro clicks are handled.
- [ ] Product-scoped staging fails closed without matching server-verified product/features.
- [ ] Future live authority is shared `nicheworks.pro`.
- [ ] Billing/entitlement traffic contains no application content or derived artifacts.
- [ ] JP/EN switching preserves equivalent formatter functionality and safety notices.

Automated evidence includes `scripts/check-tool-runtime-contracts.mjs` and `scripts/check-ats-paste-doctor-product-scoped-staging.mjs`.

## 16. Explicit tool-specific exceptions

- No language exception beyond bilingual single-page mode.
- No additional layout exception.
- Historical ad-hiding copy is not a separate ATS tool-operation entitlement in this boundary contract.

### Implementation evidence

- `tools/ats-paste-doctor/index.html`
- `tools/ats-paste-doctor/app.js`
- `tools/ats-paste-doctor/pro-bridge.js`
- `tools/ats-paste-doctor/product-scoped-controller.mjs`
- `tools/ats-paste-doctor/style.css`
- `tools/ats-paste-doctor/usage.html`
- `tools/ats-paste-doctor/usage-en.html`
- `scripts/check-ats-paste-doctor-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave5.md`
