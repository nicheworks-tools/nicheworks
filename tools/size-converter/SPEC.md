# Tool Specification — Size Converter

- Slug: `size-converter`
- Public URL: `https://nicheworks.app/tools/size-converter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide approximate JP/US/EU clothing and shoe size references plus simple body/foot-measurement fit estimates.

## Current functional contract

- Switch between clothing and shoe categories.
- Select men's or women's reference charts and JP, US, or EU as the base system.
- Display conversion-table relationships from the current bundled reference data.
- Provide a shoe fit-by-centimeter mode using foot length, optional foot width, and optional brand selection.
- Provide a clothing fit mode using waist as required input plus optional chest/bust and hip measurements, with cm/inch selection and optional brand selection.
- Produce approximate matching/reference size results rather than a purchase guarantee.
- Switch JP/EN UI on the same page.
- Perform calculations locally in the browser.

## Inputs

- Category: clothing or shoes.
- Chart type: men or women.
- Base system: JP, US, or EU.
- Shoe measurements and optional brand.
- Clothing measurements, garment type, unit, and optional brand.
- JP/EN display language.

## Outputs

- JP/US/EU reference conversion table.
- Approximate shoe-size fit result.
- Approximate clothing-size fit result.
- Warnings/notes about fit variability and unsupported systems.

## State and persistence

Current selections and measurements are page state and are not stored as measurement/profile history by the tool.

## Privacy and network behavior

Size conversion and fit calculations run locally in the browser. Measurements are not sent to a fitting backend. Ads and analytics may load separately.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The tool is a set of category/chart selectors plus compact measurement forms and result cards.

## Limits and non-goals

- Results are approximate and can vary materially by brand, product, material, stretch, last shape, foot width/instep, and fit preference.
- Initial coverage centers on JP/US/EU. UK, CN, kids, wide sizing, and brand-specific systems are limited or unsupported.
- Optional brand data does not override the need to check the seller/brand's current official chart.
- It is not a virtual fitting service and does not guarantee that a purchased item will fit.

## Acceptance criteria

- [ ] JP/US/EU table output follows the selected category, gender/chart, and base system.
- [ ] Shoe fit requires a usable foot length and treats width/brand as optional reference inputs.
- [ ] Clothing fit requires waist and handles cm/inch inputs without presenting the result as guaranteed fit.
- [ ] Measurements are calculated locally and are not persisted as a user sizing profile.
- [ ] Fit warnings and official-chart guidance remain visible in both languages.

## Implementation evidence

- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/style.css`
