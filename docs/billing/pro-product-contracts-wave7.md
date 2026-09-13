# NicheWorks Pro Boundary Contracts — Wave 7

Status: boundary hardening/staging for approved bundle members; live commercial configuration unresolved  
Date: 2026-09-13

## 1. API Key Token Redactor — authority

`MONETIZATION_CLASSIFICATION_87.md` classifies `api-key-token-redactor` as `PRO_BUNDLE`. The future live paid product authority is the shared `nicheworks.pro` product. Legacy `nicheworks_pro` remains compatibility/migration state only.

This section supplements the original Wave 2 staging contract for API Key Token Redactor. It does not create a separate product or change the eight paid operation boundaries.

## 2. API Key Token Redactor — Free boundary unchanged

The following remains Free:

- supported local secret detection and redaction;
- detector category toggles;
- replacement style and optional length-preserving masking;
- redacted output, secret-safe findings/counts/coverage/safety summaries;
- built-in samples and clear/reset;
- copy redacted output;
- TXT download;
- JA/EN UI and current safety/privacy warnings.

Billing availability must not block this core redaction workflow.

## 3. API Key Token Redactor — paid boundary unchanged

The existing eight runtime-backed paid operations remain exactly:

1. `customRules`
2. `redactionProfiles`
3. `auditMarkdown`
4. `githubIssueTemplate`
5. `supportTemplates`
6. `jsonFindingsExport`
7. `csvFindingsExport`
8. `handoffMarkdownExport`

No ninth operation is introduced by this hardening wave.

## 4. API Key Token Redactor — legacy entitlement hardening

Until live server-verified migration, the public bridge may activate legacy Pro only when both conditions are true:

- `status.active === true`; and
- `status.entitlement === "nicheworks_pro"`.

Missing entitlement must fail closed. It must not be substituted with the expected legacy entitlement. An unrelated active product must not unlock API Key Token Redactor.

## 5. API Key Token Redactor — DOM/action hardening

The current application reads `document.documentElement.dataset.proActive` for custom-rule creation and for deciding whether custom rules participate in scanning. Several Pro artifact/export handlers also rely on their controls being hidden while inactive.

The bridge therefore enforces these interim migration rules:

- before `#redactBtn` or any built-in `[data-sample]` invokes redaction, click capture re-applies the exact legacy entitlement state;
- before `#profileSelect`, `#addCustomRuleBtn`, dynamic `[data-remove-rule]`, Pro copy buttons, or Pro download buttons execute, click capture re-applies exact state and blocks the event if inactive;
- a DOM-only `data-pro-active="true"` edit cannot survive into the ordinary redaction/sample path to activate custom-rule scanning;
- manually unhiding the Pro section cannot make its ordinary buttons execute while the exact entitlement is inactive.

These are temporary legacy protections. They do not make browser state valid future payment proof.

## 6. API Key Token Redactor — secret-safety boundary

All existing secret-preview protection remains mandatory:

- visible finding/verification code previews use the fixed safe redacted marker;
- clipboard writes for generated review/support/handoff artifacts are scrubbed;
- string parts used for downloadable Blob artifacts are scrubbed;
- paid findings and review artifacts must not intentionally reproduce detected raw credential fragments.

The entitlement bridge hardening must not bypass or replace these controls.

## 7. API Key Token Redactor — product-scoped migration

The existing staged `product-scoped-controller.mjs` remains the forward adapter and retains the eight-operation map above. For production migration, the configured product ID must be `nicheworks.pro`, with operation activation based only on server-verified feature state from the common billing foundation.

The current legacy Payment Link and `nicheworks_pro` browser state are not future purchase authority.

## 8. API Key Token Redactor — billing privacy boundary

Only fixed product/feature entitlement metadata may enter billing/entitlement requests. Do not send:

- pasted secret-bearing text;
- detected raw credentials or private-key values;
- preview fragments;
- redacted output;
- findings, labels, line context or coverage details;
- custom rule values;
- selected/generated review or handoff content;
- JSON/CSV/Markdown/TXT payloads or filenames.

## 9. API Key Token Redactor — commercial fields unresolved

Resolved:
- monetization class: `PRO_BUNDLE`;
- future shared product authority: `nicheworks.pro`;
- exact eight paid operations above.

Unresolved:
- bundle price/currency;
- Stripe Product/Price and environment mapping;
- production feature IDs;
- restore/account policy;
- historical purchaser migration;
- live/test rollout timing.

---

## 10. JSON Repair — authority and shared rules

`MONETIZATION_CLASSIFICATION_87.md` classifies `json-repair` as `PRO_BUNDLE`. JSON Repair is therefore an approved member of the future shared NicheWorks Pro bundle. Its future live paid authority is `nicheworks.pro`; no JSON-Repair-specific paid product is created merely to migrate the current gate.

Legacy `nicheworks_pro` remains compatibility/migration state only. Browser-local flags, missing-entitlement fallbacks, query parameters, success-page arrival, DOM visibility, cached active state, the historical shared Payment Link, and historical `$2.99` copy are not future purchase authority. The `$2.99` value and shared Payment Link are retained only as legacy commerce evidence, not as the commercial truth for `nicheworks.pro`.

Price, currency, Stripe Product/Price, price tier, production feature IDs, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved. Live commercial configuration is unresolved.

## 11. JSON Repair — Free boundary fixed

The following current behavior remains Free:

- paste JSON/JSONC-like text and load local JSON/text files;
- Auto/JSON/JSONC interpretation;
- validation plus syntax/error/explanation information;
- Safe repair;
- Standard repair, including automatic extraction of one likely JSON candidate from mixed log text;
- Pretty and Minify;
- repaired/formatted/validate tabs;
- repair log and simple diff;
- copy current result;
- normal `.json` download;
- current Free samples;
- JA/EN UI and current privacy/repair-risk warnings.

No existing Free validation, Safe/Standard repair, Pretty/Minify, copy, normal `.json` download, repair log, simple diff, or Free sample is moved behind Pro. Billing availability must not block this Free workflow.

## 12. JSON Repair — paid boundary fixed

Current runtime supports exactly six additive paid operation boundaries:

1. `aggressiveRepair` — stronger repair for single quotes, unquoted keys, and Python-like `True` / `False` / `None` literals.
2. `candidateActions` — Use / Repair actions for detected JSON candidates. Standard Free repair may still automatically extract one likely candidate.
3. `schemaCheck` — the current simple `required` / `type` schema-rule check; this is not a promise of full JSON Schema support.
4. `history` — the current browser-local repair-history save/render/clear workflow.
5. `reportExport` — repair-report copy plus Markdown and JSON advanced report export; these are delivery variants of the same report/export value surface.
6. `proSamples` — loading the current Pro-marked stronger-repair samples.

No seventh paid operation is introduced by this wave.

## 13. JSON Repair — legacy entitlement hardening

Until live server-verified migration, current legacy Pro activation requires both:

- `status.active === true`; and
- exact `status.entitlement === "nicheworks_pro"`.

A missing or unrelated entitlement fails closed. In particular, the old missing-entitlement fallback must not recreate implicit shared access.

## 14. JSON Repair — product-scoped staging

`tools/json-repair/product-scoped-controller.mjs` is a non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

The staged contract requires:

- an explicit configured product ID with no implicit legacy fallback;
- complete unique feature mapping for `aggressiveRepair`, `candidateActions`, `schemaCheck`, `history`, `reportExport`, and `proSamples`;
- server-backed `refreshProState({ productId })` verification;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation activation only when the verified server response contains that operation's mapped feature.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, or entitlement-refresh failure states fail closed. Production migration of this approved bundle member must configure product ID `nicheworks.pro` and approved feature mappings through the common billing/entitlement foundation.

## 15. JSON Repair — privacy boundary

JSON content can contain credentials, personal data, internal identifiers, URLs, configuration, business logic, or other confidential material. Billing/entitlement requests may contain fixed product/feature entitlement metadata only.

Do not send through billing/entitlement paths:

- pasted or loaded JSON/JSONC/text;
- parsed/repaired/formatted/minified JSON;
- candidate text;
- schema rules or schema findings;
- repair logs or diff content;
- browser history data derived from repairs;
- report/Markdown/JSON export content or filenames;
- any values, keys, identifiers, credentials, URLs, or personal/confidential details derived from user input.

## 16. JSON Repair — live migration requirements

Migration is complete only when:

1. real `nicheworks.pro` commercial configuration is registered in `config/billing/products.json`;
2. all six JSON Repair feature IDs are approved under that shared product;
3. checkout uses the common billing endpoint for `nicheworks.pro`;
4. signed Stripe webhook fulfillment records the matching entitlement in D1;
5. public runtime verifies shared-product server state before enabling paid operations;
6. all current Free repair/format/copy/download behavior remains independent of billing availability;
7. failed/inactive entitlement checks leave the complete Free workflow usable;
8. unrelated product entitlements cannot unlock JSON Repair Pro;
9. billing/entitlement traffic contains no JSON or generated user content;
10. the historical Payment Link, `$2.99` copy, and legacy `nicheworks_pro` state stop being authoritative;
11. reload re-verifies server entitlement rather than trusting browser-local active state;
12. aggressive repair remains clearly distinguished as a stronger heuristic that may change meaning.

Return path: `/tools/json-repair/`.

## 17. JSON Repair — resolved and unresolved fields

Resolved:

- monetization class: `PRO_BUNDLE`;
- future shared product ID: `nicheworks.pro`;
- exactly six runtime-backed paid value boundaries: `aggressiveRepair`, `candidateActions`, `schemaCheck`, `history`, `reportExport`, `proSamples`.

Still unresolved:

- NicheWorks Pro price/currency;
- Stripe Product and Price IDs;
- production JSON Repair feature IDs;
- restore/account policy;
- historical-purchaser treatment;
- live/test rollout and migration timing.
