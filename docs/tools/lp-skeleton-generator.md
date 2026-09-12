# LP Skeleton Generator — canonical tool specification

- **Slug:** `lp-skeleton-generator`
- **Display name (JA):** LP構成ジェネレーター
- **Display name (EN):** LP Skeleton Generator
- **Implementation:** `tools/lp-skeleton-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** lp, landing-page, marketing, template
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `lp-skeleton-generator` implementation at `/tools/lp-skeleton-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Turn product/service information into a draft landing-page structure, headings, and copy skeleton for review before publication, without claiming advertising, legal, or claim-substantiation compliance.

## 3. Inputs

- Product/service positioning and copy inputs.
- Optional proof/price/guarantee information.
- JP/EN UI selection.

## 4. Processing behavior

- Accept product/service name, target audience, problem, benefits, differentiators, optional price/proof, process steps, FAQ, optional guarantee/refund terms, exclusions/notes, and CTA.
- Generate a structured LP draft in the browser from the entered fields.
- Provide Markdown and escaped-HTML output paths plus copy behavior implemented by the tool.
- Preserve user-entered benefit/proof/price/guarantee information as draft content rather than independently validating it.
- Provide JP/EN UI and explicit warnings around regulated industries, unsupported performance claims, comparison wording, refund terms, and pricing accuracy.

## 5. Outputs

- LP section/headline/copy skeleton.
- Copyable result plus Markdown and HTML downloads/outputs.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

LP generation runs in the browser and the entered campaign/product content is not intentionally uploaded by the generation workflow. Advertising and analytics resources may load separately. Users are warned to mask unreleased product names, internal URLs, and confidential campaign details when appropriate.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`, `buy.stripe.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The tool is a long structured form followed by text-oriented output and naturally works as a stacked narrow-screen workflow.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same LP drafting form and result experience.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/lp-skeleton-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Entered product/audience/problem/benefit/CTA information is represented in the generated LP skeleton.
- [ ] Markdown and HTML output paths are generated from the current draft, with input values escaped in the implemented HTML path.
- [ ] Optional proof/price/guarantee content is treated as user-supplied draft material rather than verified fact.
- [ ] JP/EN switching preserves the drafting workflow and advertising/legal disclaimer.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/lp-skeleton-generator/index.html`
- `tools/lp-skeleton-generator/app.js`
- `tools/lp-skeleton-generator/style.css`
