# Tool Specification — Size Converter

- Slug: `size-converter`
- Public URL: `https://nicheworks.app/tools/size-converter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules when enabled: `common-spec/amazon-affiliate.md`

## Purpose

Provide a fast, approximate JP/US/EU clothing and shoe size conversion for one directly entered size, with full reference tables and optional measurement-based estimates as secondary tools.

## Primary workflow

1. Select category: shoes or clothing.
2. Select men's or women's reference chart.
3. Select a base system or type a prefixed value such as `US 4`, `EU 42`, or `JP 26.5`.
4. Resolve an exact row from the bundled reference table.
5. Immediately display the corresponding JP/US/EU row and a concise source-to-target summary.
6. Optionally copy the current conversion result.

The direct one-size answer is the primary UI. The full table and measurement-fit utilities are secondary workflows.

## Current functional contract

- Convert one directly entered size across JP/US/EU using the bundled representative table.
- Accept a plain size under the currently selected base system.
- Accept `JP`, `US`, or `EU` prefixes and switch the source system locally when a prefix is present.
- Normalize common dash variants and a trailing `cm` for exact matching; do not guess unsupported sizes.
- Keep the same conversion row selected when switching the source system.
- Show a no-match state for values outside the bundled table rather than silently choosing a nearby conversion row.
- Support shoes and clothing with men's and women's reference charts.
- Display the full currently selected conversion table on demand.
- Copy the current direct conversion result or full table locally.
- Provide a shoe fit-by-centimeter helper using foot length and optional foot width.
- Provide a clothing fit helper using waist as required input plus optional chest/bust and hip measurements, with cm/inch input.
- Switch JA/EN UI on the same page and persist only the UI-language choice.
- Perform conversion and measurement calculations locally in the browser.
- Do not apply brand-wide numerical size offsets. `brand.json` is not part of the active calculation path.

## Inputs

- Category: shoes or clothing.
- Chart type: men or women.
- Base system: JP, US, or EU.
- Direct size text, optionally prefixed with JP/US/EU.
- Shoe measurements: foot length and optional width.
- Clothing measurements: garment type, unit, waist, optional chest/bust, optional hip.
- JA/EN UI language.

## Outputs

- Concise direct conversion sentence such as `US 8.5 → JP 26.5 / EU 42`.
- One-row JP/US/EU conversion cards.
- Full JP/US/EU reference table for the selected category/chart.
- Approximate shoe fit result and nearby rows.
- Approximate clothing size result.
- Visible guidance that all results are general estimates and official seller/brand charts take precedence.

## Amazon affiliate readiness

The page loads the shared `/assets/amazon-affiliate.js` helper plus local `affiliate-config.js`.

Default configuration remains deliberately disabled:

- `enabled: false`
- `shoes: ""`
- `clothing: ""`

While disabled or without valid Amazon HTTPS targets:

- no Amazon CTA is shown;
- no Amazon disclosure is shown;
- no affiliate click event is emitted.

When the NicheWorks Amazon Associates setup is ready, activation must require only verified target URLs plus `enabled: true`. The active CTA remains immediately after a valid quick-conversion result and identifies Amazon explicitly.

Allowed affiliate analytics are limited to the common coarse metadata. Direct size text, size system, gender/chart selection, measurements, and conversion results must never be passed into affiliate analytics.

## State and persistence

- Current category, chart, base system, selected row, direct size text, and measurement inputs are page state only.
- Measurement/profile history is not persisted.
- JA/EN preference may be stored as `nw_lang` in localStorage.

## Privacy and network behavior

- Size conversion and fit calculations run locally in the browser.
- Direct size text and measurements are not sent to a fitting backend or affiliate destination.
- Ads and analytics may load separately under the NicheWorks common specification.
- Affiliate links, when enabled later, are ordinary outbound links; user size input, measurements, and results are not encoded into them by this tool.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The page uses a compact direct-input conversion card first, followed by an expandable full table and measurement helpers.

## Limits and non-goals

- Results are approximate and can vary materially by brand, product, material, stretch, last shape, foot width/instep, and fit preference.
- Results are approximate and must not be represented as guaranteed fit.
- Current direct conversion centers on JP/US/EU.
- UK, CN, kids, wide sizing, and verified brand/model-specific official charts require separate verified data work; they are not fabricated from the current table.
- The tool is not a virtual fitting service.
- The bundled reference table must not be represented as a universal brand standard.

## Acceptance criteria

- [ ] A plain size resolves under the selected JP/US/EU base system.
- [ ] `US 4`, `EU 42`, and `JP 26.5` style inputs can switch the source system and resolve an exact bundled row where present.
- [ ] Unsupported direct sizes show a no-match state instead of a nearest-row conversion.
- [ ] Changing the source system preserves the current conversion row.
- [ ] Shoes/clothing and men/women selections rebuild suggestions and direct output consistently.
- [ ] Women's US size 4 returns a representative JP/EU row.
- [ ] The full table uses the same data as the direct converter.
- [ ] Direct conversion can be copied without network transmission.
- [ ] Shoe fit requires a usable foot length and treats width as optional context.
- [ ] Clothing fit requires waist and handles cm/inch inputs without presenting a guaranteed fit.
- [ ] No active brand-wide numerical correction changes a calculated result.
- [ ] With default affiliate configuration, no Amazon CTA/disclosure is visible.
- [ ] Enabling a valid Amazon target does not transmit size text or measurement state through affiliate analytics.

## Implementation evidence

- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/style.css`
- `tools/size-converter/affiliate-config.js`
- `assets/amazon-affiliate.js`
