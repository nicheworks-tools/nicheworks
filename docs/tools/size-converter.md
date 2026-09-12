# Size Converter — canonical tool specification

- **Slug:** `size-converter`
- **Display name (JA):** サイズ変換ツール
- **Display name (EN):** Size Converter
- **Implementation:** `tools/size-converter/`
- **Registry state:** active (registered implementation present)
- **Category:** size, unit, converter, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `size-converter` implementation at `/tools/size-converter/`. It does not authorize a production rewrite.

## 2. Purpose

Provide approximate JP/US/EU clothing and shoe size references plus simple body/foot-measurement fit estimates.

## 3. Inputs

- Category: clothing or shoes.
- Chart type: men or women.
- Base system: JP, US, or EU.
- Shoe measurements and optional brand.
- Clothing measurements, garment type, unit, and optional brand.
- JP/EN display language.

## 4. Processing behavior

- Switch between clothing and shoe categories.
- Select men's or women's reference charts and JP, US, or EU as the base system.
- Display conversion-table relationships from the current bundled reference data.
- Provide a shoe fit-by-centimeter mode using foot length, optional foot width, and optional brand selection.
- Provide a clothing fit mode using waist as required input plus optional chest/bust and hip measurements, with cm/inch selection and optional brand selection.
- Produce approximate matching/reference size results rather than a purchase guarantee.
- Switch JP/EN UI on the same page.
- Perform calculations locally in the browser.

## 5. Outputs

- JP/US/EU reference conversion table.
- Approximate shoe-size fit result.
- Approximate clothing-size fit result.
- Warnings/notes about fit variability and unsupported systems.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty input:** Required or blank inputs use the implementation’s documented validation path and must not be presented as a successful completed result.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Size conversion and fit calculations run locally in the browser. Measurements are not sent to a fitting backend. Ads and analytics may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The tool is a set of category/chart selectors plus compact measurement forms and result cards.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/size-converter/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] JP/US/EU table output follows the selected category, gender/chart, and base system.
- [ ] Shoe fit requires a usable foot length and treats width/brand as optional reference inputs.
- [ ] Clothing fit requires waist and handles cm/inch inputs without presenting the result as guaranteed fit.
- [ ] Measurements are calculated locally and are not persisted as a user sizing profile.
- [ ] Fit warnings and official-chart guidance remain visible in both languages.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/size-converter/index.html`
- `tools/size-converter/app-complete.js`
- `tools/size-converter/app.js`
- `tools/size-converter/style.css`
