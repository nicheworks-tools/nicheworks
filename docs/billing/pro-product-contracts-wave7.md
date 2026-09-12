# NicheWorks Pro Boundary Contracts — Wave 7

Status: API Key Token Redactor follow-up hardening; bundle membership approved; live commercial configuration unresolved  
Date: 2026-09-13

## 1. Authority

`MONETIZATION_CLASSIFICATION_87.md` classifies `api-key-token-redactor` as `PRO_BUNDLE`. The future live paid product authority is the shared `nicheworks.pro` product. Legacy `nicheworks_pro` remains compatibility/migration state only.

This document supplements the original Wave 2 staging contract for API Key Token Redactor. It does not create a separate product or change the eight paid operation boundaries.

## 2. Free boundary — unchanged

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

## 3. Paid boundary — unchanged

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

## 4. Legacy entitlement hardening

Until live server-verified migration, the public bridge may activate legacy Pro only when both conditions are true:

- `status.active === true`; and
- `status.entitlement === "nicheworks_pro"`.

Missing entitlement must fail closed. It must not be substituted with the expected legacy entitlement. An unrelated active product must not unlock API Key Token Redactor.

## 5. DOM/action hardening

The current application reads `document.documentElement.dataset.proActive` for custom-rule creation and for deciding whether custom rules participate in scanning. Several Pro artifact/export handlers also rely on their controls being hidden while inactive.

The bridge therefore enforces these interim migration rules:

- before `#redactBtn` or any built-in `[data-sample]` invokes redaction, click capture re-applies the exact legacy entitlement state;
- before `#profileSelect`, `#addCustomRuleBtn`, dynamic `[data-remove-rule]`, Pro copy buttons, or Pro download buttons execute, click capture re-applies exact state and blocks the event if inactive;
- a DOM-only `data-pro-active="true"` edit cannot survive into the ordinary redaction/sample path to activate custom-rule scanning;
- manually unhiding the Pro section cannot make its ordinary buttons execute while the exact entitlement is inactive.

These are temporary legacy protections. They do not make browser state valid future payment proof.

## 6. Secret-safety boundary

All existing secret-preview protection remains mandatory:

- visible finding/verification code previews use the fixed safe redacted marker;
- clipboard writes for generated review/support/handoff artifacts are scrubbed;
- string parts used for downloadable Blob artifacts are scrubbed;
- paid findings and review artifacts must not intentionally reproduce detected raw credential fragments.

The entitlement bridge hardening must not bypass or replace these controls.

## 7. Product-scoped migration

The existing staged `product-scoped-controller.mjs` remains the forward adapter and retains the eight-operation map above. For production migration, the configured product ID must be `nicheworks.pro`, with operation activation based only on server-verified feature state from the common billing foundation.

The current legacy Payment Link and `nicheworks_pro` browser state are not future purchase authority.

## 8. Billing privacy boundary

Only fixed product/feature entitlement metadata may enter billing/entitlement requests. Do not send:

- pasted secret-bearing text;
- detected raw credentials or private-key values;
- preview fragments;
- redacted output;
- findings, labels, line context or coverage details;
- custom rule values;
- selected/generated review or handoff content;
- JSON/CSV/Markdown/TXT payloads or filenames.

## 9. Commercial fields unresolved

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
