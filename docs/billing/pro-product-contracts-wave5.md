# NicheWorks Pro Boundary Contracts — Wave 5

Status: implementation/boundary staging; ATS Paste Doctor bundle membership approved; live commercial configuration unresolved  
Date: 2026-09-13

## 1. Authority and shared rules

`ats-paste-doctor` is `PRO_BUNDLE` in `MONETIZATION_CLASSIFICATION_87.md`. Its future live paid product authority is the shared `nicheworks.pro` product. Legacy `nicheworks_pro` is compatibility/migration state only.

Existing useful Free behavior remains Free. No ATS-Paste-Doctor-specific paid product, price, Stripe Price, production feature ID, or live billing configuration is created by this contract.

## 2. Free boundary — fixed

The current Free contract remains:

- paste application/resume/cover-letter text and process it locally;
- three output modes: ATS-friendly plain text, keep line breaks, and Clean;
- counts, warnings, optional character-limit status and the current compact readability preview;
- copy the generated output;
- download generated output as TXT;
- process up to 30,000 characters;
- bilingual JA/EN UI;
- current privacy, personal-information, and non-guarantee notices.

Free copy/TXT must not be moved behind Pro.

## 3. Paid boundary — runtime-backed delta

Current runtime supports exactly five paid value boundaries:

1. **Extended Input Limit (`extendedInputLimit`)** — raise processing capacity from 30,000 to 200,000 characters.
2. **Output Pack (`outputPack`)** — copy the Full ATS output pack / Markdown pack and the pre-submit checklist material.
3. **Pro Exports (`proExports`)** — export the JSON pack and open the printable Pro pack for PDF saving.
4. **Templates (`templates`)** — save/load the current output in browser-local template slots.
5. **History (`history`)** — save/load/delete/clear browser-local output history.

The current runtime also advertises ad hiding as part of the historical shared Pro surface. This Wave does not create a tool-operation entitlement for ad hiding because it is suite/presentation behavior rather than an ATS Paste Doctor processing operation. It may be handled at the bundle/site layer later without changing the five tool operations above.

## 4. Current legacy authority — hardening

Until live migration, the legacy bridge may activate current paid behavior only when:

- `local.active === true`; and
- `local.entitlement === "nicheworks_pro"`.

A missing entitlement must not be replaced with the expected legacy entitlement. An unrelated active standalone product must not unlock ATS Paste Doctor.

The current application reads `data-pro-active` for its 30,000/200,000-character decision and Pro action checks. The bridge therefore also re-runs the exact entitlement check in the **capture phase** before normal UI clicks reach either the Generate button or any `[data-pro-action]` control. A manual DOM edit that changes `data-pro-active="true"` is reset from the exact legacy entitlement before the ordinary processing/Pro click path continues.

This is an interim hardening measure only. It does not turn browser-local legacy state into future purchase authority; live migration still requires server-verified `nicheworks.pro` state.

## 5. Product-scoped staging

`tools/ats-paste-doctor/product-scoped-controller.mjs` delegates to `assets/nw-product-scoped-controller.mjs` and exposes exactly:

- `extendedInputLimit`
- `outputPack`
- `proExports`
- `templates`
- `history`

It requires an explicit product ID plus a complete unique feature map. Wrong-product, local-only, unverified, incomplete/duplicate mapping, and refresh-failure states fail closed.

For production migration of this approved bundle member, configured product ID must be `nicheworks.pro`. Parameterized staging does not authorize a separate tool product.

## 6. Privacy boundary

Billing/entitlement requests must not contain:

- pasted resume/application/cover-letter text;
- generated cleaned output;
- metrics/warnings derived from user text;
- ATS pack/checklist bodies;
- template/history contents or snippets;
- JSON/Markdown/PDF/TXT bodies or filenames;
- any extracted personal, employer, contact or work-history data.

Only fixed product/feature entitlement metadata may cross the billing boundary.

## 7. Live migration requirements

ATS Paste Doctor may switch from its legacy gate only when:

1. real `nicheworks.pro` commercial configuration exists in the common billing registry;
2. the five operation feature IDs are approved for the shared product;
3. common server-created checkout and signed webhook fulfillment are live;
4. D1 contains server-authoritative bundle entitlement state;
5. the public runtime enables each paid operation only after server verification;
6. Free 30,000-character formatting/copy/TXT remains available during billing failure;
7. URL/localStorage/DOM/custom-event changes are not accepted as future payment proof;
8. unrelated standalone products cannot unlock this tool;
9. user application content never enters billing/analytics payloads;
10. reload/revisit re-verifies server state;
11. refund/revocation removes paid access;
12. the bundle migration wave authorizes this tool.

## 8. Commercial fields unresolved

Resolved:
- class: `PRO_BUNDLE`;
- shared product authority: `nicheworks.pro`;
- exact five runtime-backed tool-operation boundaries above.

Unresolved:
- bundle price/currency;
- Stripe Product/Price and environment mapping;
- production feature-ID namespace;
- cross-browser restore policy;
- legacy purchaser migration/grandfather rules;
- live/test rollout timing.
