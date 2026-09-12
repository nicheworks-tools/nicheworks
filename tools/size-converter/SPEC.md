# Tool Specification — Size Converter

- Slug: `size-converter`
- Public URL: `https://nicheworks.app/tools/size-converter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules when enabled: `common-spec/amazon-affiliate.md`

## Purpose

Provide a fast, approximate JP/US/EU clothing and shoe size conversion for a single selected size, with full reference tables and optional measurement-based estimates as secondary tools.

## Primary workflow

1. Select category: shoes or clothing.
2. Select men's or women's reference chart.
3. Select the base system: JP, US, or EU.
4. Select one size.
5. Immediately display the corresponding JP/US/EU row as a general estimate.

The direct one-size conversion is the primary UI. The full table and measurement-fit utilities are secondary workflows.

## Current functional contract

- Convert one selected size across JP/US/EU using the bundled representative table.
- Support shoes and clothing with men's and women's reference charts.
- Include a wider representative shoe range than the previous version, including women's US 4 and common adjacent sizes.
- Display the full currently selected conversion table on demand.
- Copy the current table as TSV.
- Provide a shoe fit-by-centimeter helper using foot length and optional foot width.
- Provide a clothing fit helper using waist as required input plus optional chest/bust and hip measurements, with cm/inch input.
- Switch JA/EN UI on the same page and persist only the UI-language choice.
- Perform conversion and measurement calculations locally in the browser.
- Do not apply brand-wide numerical size offsets. Brand/model-specific fit remains outside the active calculation contract.

## Inputs

- Category: shoes or clothing.
- Chart type: men or women.
- Base system: JP, US, or EU.
- Selected reference size.
- Shoe measurements: foot length and optional width.
- Clothing measurements: garment type, unit, waist, optional chest/bust, optional hip.
- JA/EN UI language.

## Outputs

- One-row JP/US/EU conversion result.
- Full JP/US/EU reference table for the selected category/chart.
- Approximate shoe fit result and nearby rows.
- Approximate clothing size result.
- Visible guidance that all results are general estimates and official seller/brand charts take precedence.

## Amazon affiliate readiness

The page loads the shared `/assets/amazon-affiliate.js` helper plus local `affiliate-config.js`.

Default configuration is deliberately disabled:

- `enabled: false`
- `shoes: ""`
- `clothing: ""`

While disabled or without valid Amazon HTTPS targets:

- no Amazon CTA is shown;
- no Amazon disclosure is shown;
- no affiliate click event is emitted.

When the NicheWorks Amazon Associates setup is ready, activation must require only verified target URLs plus `enabled: true`. The active CTA is contextual to the current category and identifies Amazon explicitly.

Allowed affiliate analytics are limited to the common coarse metadata. Size, gender/chart selection, measurements, and conversion results must never be passed into affiliate analytics.

## State and persistence

- Current category, chart, base size, selected size, and measurement inputs are page state only.
- Measurement/profile history is not persisted.
- JA/EN preference may be stored as `nw_lang` in localStorage.

## Privacy and network behavior

- Size conversion and fit calculations run locally in the browser.
- Measurements are not sent to a fitting backend or affiliate destination.
- Ads and analytics may load separately under the NicheWorks common specification.
- Affiliate links, when enabled later, are ordinary outbound links; user measurements/results are not encoded into them by this tool.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The page uses a compact quick-conversion card first, followed by an expandable full table and measurement helpers.

## Limits and non-goals

- Results are approximate and can vary materially by brand, product, material, stretch, last shape, foot width/instep, and fit preference.
- Current direct conversion centers on JP/US/EU.
- UK, CN, kids, wide sizing, and verified brand/model-specific official charts are future expansion areas.
- The tool is not a virtual fitting service and does not guarantee that a purchased item will fit.
- The bundled reference table must not be represented as a universal brand standard.

## Acceptance criteria

- [ ] The primary UI converts one selected size across JP/US/EU.
- [ ] Shoes/clothing and men/women selections rebuild the available size choices and result consistently.
- [ ] Women's US size 4 returns a representative JP/EU row.
- [ ] The full table uses the same data as the quick converter.
- [ ] Shoe fit requires a usable foot length and treats width as optional context.
- [ ] Clothing fit requires waist and handles cm/inch inputs without presenting a guaranteed fit.
- [ ] No active brand-wide numerical correction changes a calculated result.
- [ ] Measurements are calculated locally and are not persisted as a sizing profile.
- [ ] With default affiliate configuration, no Amazon CTA/disclosure is visible.
- [ ] Enabling a valid Amazon target does not transmit size or measurement state through affiliate analytics.

## Implementation evidence

- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/style.css`
- `tools/size-converter/affiliate-config.js`
- `assets/amazon-affiliate.js`
