# Tool Specification — ATS Paste Doctor

- Slug: `ats-paste-doctor`
- Public URL: `https://nicheworks.app/tools/ats-paste-doctor/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Canonical per-tool specification: `docs/tools/ats-paste-doctor.md`
- Monetization class: `PRO_BUNDLE`

## Purpose

Clean and inspect resume, cover-letter, and application text before it is pasted into an ATS or job form, while surfacing formatting and character issues that may affect readability.

## Current functional contract

- Accept pasted application text and report character/count information and warnings.
- Provide three output modes: ATS-friendly plain text, keep-line-breaks, and clean.
- Accept an optional character-limit target and show limit-related status.
- Generate cleaned output plus a compact ATS-style readability preview.
- Free mode supports copy and TXT download and processes up to 30,000 characters.
- Current legacy Pro raises the processing limit to 200,000 characters and gates output-pack/checklist copy, JSON/PDF export, templates, and local history.
- Provide bilingual UI and explicit privacy/ATS-guarantee notices.

## Inputs

- Resume, cover-letter, application, or other pasted text.
- Output-mode selection.
- Optional character-limit value.
- UI language selection.
- Current legacy shared NicheWorks Pro entitlement state.

## Outputs

Free:
- cleaned text;
- counts, warnings, optional limit status and readability preview;
- clipboard copy and TXT download.

Current paid operation boundaries:
1. `extendedInputLimit` — 200,000-character processing limit instead of 30,000;
2. `outputPack` — full ATS pack / Markdown pack / pre-submit checklist copy;
3. `proExports` — JSON export and printable PDF pack;
4. `templates` — local template-slot save/load;
5. `history` — local history save/load/delete/clear.

## State and persistence

The current edit/output workflow is in page memory. Template slots and history use browser-local storage. User-triggered exports are saved by the browser. Legacy shared-Pro state is compatibility/migration state only and is not future payment authority.

## Privacy and network behavior

Text formatting runs in the browser and pasted application content is not intentionally uploaded by the tool workflow. The page may load suite-wide ads, analytics, and shared entitlement resources independently.

Future billing/entitlement requests may contain fixed product/feature metadata only. Pasted text, generated output, metrics/warnings, checklists, template/history content, snippets, export bodies, filenames, and extracted personal/employer/contact/work-history data must not enter billing.

## Product-scoped migration staging

`MONETIZATION_CLASSIFICATION_87.md` classifies `ats-paste-doctor` as `PRO_BUNDLE`. Future live product authority is shared `nicheworks.pro`; legacy `nicheworks_pro` is compatibility/migration state only.

`tools/ats-paste-doctor/product-scoped-controller.mjs` stages exactly five paid operations: `extendedInputLimit`, `outputPack`, `proExports`, `templates`, and `history`. It delegates fail-closed server verification to `assets/nw-product-scoped-controller.mjs` and requires explicit product/feature configuration.

For live migration, configured product ID must be `nicheworks.pro`. No ATS-Paste-Doctor-specific paid product is authorized.

The current legacy bridge must require both `local.active === true` and exact `local.entitlement === "nicheworks_pro"`; a missing entitlement must not fall back to the expected legacy entitlement. Because current application gating reads `data-pro-active`, the bridge revalidates exact legacy state in click capture before `#processBtn` or any `[data-pro-action]` handler runs, so a DOM-only `data-pro-active="true"` edit does not survive the normal UI action path.

## Language mode

`bilingual single-page`

JP/EN buttons switch the same tool UI and notices.

## Layout class

`hybrid`

The desktop form uses paired panels while the same workflow remains usable on narrow screens through responsive stacking.

## Limits and non-goals

- The tool does not guarantee acceptance by any ATS or employer form.
- It does not submit job applications or assess candidate quality.
- Free 30,000 / paid 200,000 character limits are product implementation limits, not ATS platform limits.
- Free copy/TXT remains Free.
- Current advertising-hiding copy is not represented as a tool-operation entitlement in this five-operation staging contract; suite-level ad behavior may be handled separately.
- Legacy capture-phase hardening is not future billing authority; production access still requires server-verified `nicheworks.pro`.
- Boundary staging does not decide price/currency, Stripe Product/Price, production feature IDs, restore policy, purchaser migration, or live rollout timing.

## Acceptance criteria

- [ ] Pasted text can be processed in each supported mode and produces output, counts, warnings, and preview.
- [ ] Free copy/TXT works up to 30,000 characters independently of billing state.
- [ ] Current paid state raises processing to 200,000 characters and gates output pack, Pro exports, templates, and history.
- [ ] Missing/unrelated legacy entitlement cannot unlock paid behavior even when active-like state exists.
- [ ] A manual DOM edit to `data-pro-active` is rechecked before normal Generate/Pro click handlers execute.
- [ ] Product-scoped staging exposes exactly the five documented paid operations and fails closed without matching server-verified product/features.
- [ ] Future live product authority is shared `nicheworks.pro`.
- [ ] Billing/entitlement traffic contains no pasted/generated application content.
- [ ] JP/EN switching retains the same formatting functionality and safety notices.

## Implementation evidence

- `tools/ats-paste-doctor/index.html`
- `tools/ats-paste-doctor/app.js`
- `tools/ats-paste-doctor/pro-bridge.js`
- `tools/ats-paste-doctor/product-scoped-controller.mjs`
- `tools/ats-paste-doctor/style.css`
- `tools/ats-paste-doctor/usage.html`
- `scripts/check-ats-paste-doctor-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave5.md`
