# Tool Specification — Form Tool Selector

- Slug: `form-tool-selector`
- Public URL: `https://nicheworks.app/tools/form-tool-selector/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Translate basic form requirements into the types of form builders/tools a user should compare, plus a decision memo describing the capabilities and risks to verify before choosing an actual service.

### Search intent contract

The public search intent is requirement-based form-builder selection: users start with needs such as file upload, payments, notifications/integrations, multilingual support, free-first, or privacy-first and use the tool to narrow the category of form solution they should compare.

The tool MUST NOT present itself as a ranking of named vendors, a live price comparison, or a guarantee that one provider is suitable. Public metadata should describe "form builder/tool selection by requirements" rather than relying on the product-internal phrase "Form Tool Selector" alone.

## Monetization boundary

The canonical monetization class is `ADS_DONATION`. The current intent is SaaS/form-tool selection rather than physical-product shopping, so Amazon affiliate offers are not part of this product contract.

A future form-service partner program would require a separate verified integration and must not turn the tool into a named-vendor ranking, live price comparison, or guaranteed recommendation.

## Current functional contract

- Accept requirement toggles for file uploads, payments/billing, notifications/integrations, and multilingual forms.
- Keep a crawlable pre-selection comparison guide covering use case, volume/limits, post-submission workflow, publishing/embedding needs, and personal-data handling before the interactive selector.
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
- [ ] The public page has one H1 element while retaining JP/EN switching inside that heading.
- [ ] Title, description, lead copy, and structured description communicate requirement-based form-builder/tool selection.
- [ ] Initial HTML exposes the main comparison criteria before users run the selector, rather than hiding all selection context in generated results.
- [ ] No Amazon affiliate offer is rendered under the current `ADS_DONATION` classification.

## Implementation evidence

- `tools/form-tool-selector/index.html`
- `tools/form-tool-selector/app.js`
- `tools/form-tool-selector/style.css`
