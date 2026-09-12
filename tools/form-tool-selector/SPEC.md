# Tool Specification — Form Tool Selector

- Slug: `form-tool-selector`
- Public URL: `https://nicheworks.app/tools/form-tool-selector/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Translate basic form requirements into candidate form-tool categories and a decision memo so users know what capabilities and risks to compare before choosing an actual service.

## Current functional contract

- Accept requirement toggles for file uploads, payments/billing, notifications/integrations, and multilingual forms.
- Accept priority toggles such as free-first and privacy-first.
- Generate candidate form-tool types/categories from the selected requirements rather than recommending a named provider.
- Generate a handoff/decision memo with checks users should perform on real services.
- Provide a quick-start sample and copy/save outputs as text and Markdown where implemented.
- Store selected display language in browser localStorage as implemented.
- Warn users to verify pricing, storage, terms, personal-data handling, upload limits, payment conditions, and integrations directly with providers.

## Inputs

- Capability and priority checkboxes.
- Quick-start action.
- JP/EN UI selection.

## Outputs

- Candidate form-tool types/categories.
- Decision/handoff memo and verification checklist.
- Clipboard copy plus TXT/Markdown downloads.

## State and persistence

Requirement selections/results are current-page state. Selected display language may persist in browser `localStorage`. The current contract does not include saved selection projects or cloud synchronization.

## Privacy and network behavior

Candidate selection logic runs in the browser. Advertising and analytics resources may load separately; users are warned to mask unreleased service names, internal URLs, customer names, personal data, and confidential requirements.

## Language mode

`bilingual single-page`

JP/EN controls switch the same selector and decision memo experience.

## Layout class

`mobile-oriented`

The checkbox groups, result list, and memo are a stacked decision-support flow suitable for narrow screens.

## Limits and non-goals

- The tool does not recommend, rank, price-check, or certify a specific vendor.
- Payment-form use still requires separate review of refunds, receipts, tax, legal disclosures, and payment rules.
- Privacy-sensitive forms require separate review of storage location, access, retention, deletion handling, and privacy policy.
- Candidate types are decision support, not a fit guarantee.

## Acceptance criteria

- [ ] Selecting different requirement combinations changes the generated candidate types/checks according to the implemented rules.
- [ ] Results do not present a named form vendor as automatically recommended or certified.
- [ ] Copy/TXT/Markdown outputs reflect the current candidate result and decision memo.
- [ ] JP/EN switching preserves the same requirements and provider-verification warnings.

## Implementation evidence

- `tools/form-tool-selector/index.html`
- `tools/form-tool-selector/app.js`
- `tools/form-tool-selector/style.css`
