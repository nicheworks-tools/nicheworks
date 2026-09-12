# ExecPlan — API Key Token Redactor legacy gate hardening

## Goal

Close remaining legacy shared-Pro self-unlock routes in API Key Token Redactor while preserving the existing eight-operation product-scoped staging contract and the secret-preview safety layer.

## Authority

- `MONETIZATION_CLASSIFICATION_87.md`: `api-key-token-redactor` is `PRO_BUNDLE`.
- `MONETIZATION_EXECUTION.md`: future shared bundle authority is `nicheworks.pro`.
- `docs/billing/nicheworks-pro-bundle-contract.md`: browser-local state is not future purchase authority.
- Existing Wave 2 staging defines eight runtime-backed paid operations.

## Free boundary to preserve

- local secret detection/redaction;
- detector category controls;
- replacement style and keep-length controls;
- redacted output, safe findings/counts/coverage/safety summary;
- built-in samples and clear/reset;
- copy redacted output;
- TXT download;
- JA/EN UI.

## Existing paid boundary to preserve

1. `customRules`
2. `redactionProfiles`
3. `auditMarkdown`
4. `githubIssueTemplate`
5. `supportTemplates`
6. `jsonFindingsExport`
7. `csvFindingsExport`
8. `handoffMarkdownExport`

No new paid value is introduced.

## Defects to close

1. `pro-bridge.js` currently accepts `status.active` when `status.entitlement` is missing and then substitutes `nicheworks_pro`. Missing entitlement must fail closed.
2. `app.js` reads `document.documentElement.dataset.proActive` when adding custom rules and when deciding whether custom rules participate in redaction. A manual DOM edit can therefore survive into normal UI actions unless the bridge revalidates immediately before those actions.
3. Pro artifact buttons are protected mainly by hidden UI. If manually unhidden, their handlers currently do not independently check entitlement.

## Hardening design

- Legacy activation requires exactly `status.active === true && status.entitlement === "nicheworks_pro"`.
- Missing/error status returns no entitlement fallback.
- Before `#redactBtn` or a built-in `[data-sample]` runs redaction, capture-phase handling re-applies exact legacy state so DOM-only `data-pro-active` edits do not enable custom-rule scanning.
- Before Pro-only profile/custom-rule/artifact/export controls execute, capture-phase handling re-applies exact state and blocks the event when inactive.
- Dynamic `[data-remove-rule]` controls are included in the Pro action guard.
- Existing clipboard/Blob/visible-preview scrubbing remains unchanged and is regression-tested.

## Product-scoped state

The existing staged controller remains non-live and keeps exactly eight operations. For eventual production migration of this approved bundle member, the configured product must be `nicheworks.pro` with server-verified feature state.

## Privacy boundary

Billing/entitlement traffic may contain only fixed product/feature metadata. Secret-bearing input, detected credentials, preview fragments, redacted output, findings, custom rules, generated templates, export bodies and filenames stay outside billing.

## Non-goals

- no detector regex/redaction algorithm change;
- no new Pro feature;
- no price/currency/Stripe Product/Price;
- no billing registry or D1 migration;
- no live product-scoped wiring;
- no affiliate/ManualFinder/Amazon changes.

## Acceptance

- [ ] missing/unrelated legacy entitlement cannot activate Pro;
- [ ] DOM-only `data-pro-active=true` is corrected before ordinary redaction/sample actions;
- [ ] manually unhidden Pro controls cannot execute while inactive;
- [ ] all eight paid operation boundaries remain unchanged;
- [ ] Free detector/copy/TXT remains unchanged;
- [ ] secret-preview clipboard/Blob/visible-output hardening remains protected;
- [ ] canonical and local specs identify `PRO_BUNDLE` and future `nicheworks.pro` authority;
- [ ] dedicated and repository-wide CI pass on latest main.
