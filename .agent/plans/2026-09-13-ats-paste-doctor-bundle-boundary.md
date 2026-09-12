# ExecPlan: ATS Paste Doctor NicheWorks Pro bundle boundary

## Goal
Freeze the exact runtime-backed Free/Pro boundary for `ats-paste-doctor`, harden the legacy shared-Pro entitlement and ordinary UI interaction checks, and stage a fail-closed controller for future shared `nicheworks.pro` migration without activating live billing or inventing commercial configuration.

## Authority
- `MONETIZATION_CLASSIFICATION_87.md`: `ats-paste-doctor` is `PRO_BUNDLE`.
- `MONETIZATION_EXECUTION.md`: future bundle authority is `nicheworks.pro`.
- current `app.js`, `pro-bridge.js`, local SPEC and canonical spec define the current feature evidence.

## Free boundary
- three local formatting modes;
- counts, warnings, optional character-limit status and 2-line readability preview;
- copy output and TXT download;
- up to 30,000 input characters;
- bilingual JA/EN UI and current privacy/ATS disclaimers.

## Runtime-backed paid boundaries
1. `extendedInputLimit` — raise processing limit from 30,000 to 200,000 characters.
2. `outputPack` — full ATS pack / Markdown pack / pre-submit checklist copy actions.
3. `proExports` — JSON export and printable PDF output.
4. `templates` — browser-local template slots save/load.
5. `history` — browser-local output history save/load/delete/clear.

No additional paid feature is invented. Current copy/TXT remains Free. Historical ad hiding stays a suite/presentation concern rather than a sixth ATS tool-operation entitlement.

## Legacy hardening
Replace the previous entitlement fallback (`local.entitlement || nicheworks_pro`) with exact activation:
- `local.active === true`
- `local.entitlement === "nicheworks_pro"`

Because current `app.js` reads `document.documentElement.dataset.proActive` for both the 30,000/200,000 processing limit and Pro actions, the bridge must also re-run that exact entitlement check in click capture before the normal UI handles:
- `#processBtn`; and
- every `[data-pro-action]` control.

This closes ordinary DevTools DOM-attribute self-unlock without pretending the legacy browser-local mechanism is future payment authority.

## Product-scoped staging
Add a thin wrapper over `assets/nw-product-scoped-controller.mjs` with the five operations above. Future live configuration for this approved bundle member must use `nicheworks.pro`.

Billing/entitlement traffic may contain fixed product/feature metadata only. Pasted application text, cleaned output, metrics, checklist contents, template/history contents, export bodies and filenames remain outside billing.

## Out of scope
- no price/currency or Stripe Product/Price;
- no billing registry entry;
- no D1 migration;
- no live product-scoped wiring;
- no formatter behavior change;
- no new paid feature;
- no affiliate/ManualFinder/Amazon changes.

## Validation
- [x] exact five-operation controller contract;
- [x] partial verified feature activation;
- [x] local/wrong-product/unverified/error states fail closed;
- [x] Free 30,000 and Pro 200,000 limits protected;
- [x] Free copy/TXT contract protected;
- [x] paid pack/export/template/history evidence protected;
- [x] exact legacy entitlement check protected;
- [x] normal Generate/Pro clicks revalidate legacy state before app handlers, so DOM-only `data-pro-active` edits do not survive the ordinary UI path;
- [x] tool/canonical specs and Wave 5 contract aligned to `PRO_BUNDLE` + `nicheworks.pro`.
