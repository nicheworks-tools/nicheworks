# Tool Specification — Size Converter

- Slug: `size-converter`
- Public URL: `https://nicheworks.app/tools/size-converter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules when enabled: `common-spec/amazon-affiliate.md`

## Purpose

Provide a fast, approximate JP/US/EU clothing and shoe size conversion for one directly entered size, plus conservative measurement-based estimates that refuse to fabricate endpoint matches outside the supported chart.

## Primary workflow

1. Select category: shoes or clothing.
2. Select men's or women's reference chart.
3. Select a base system or type a prefixed value such as `US 4`, `EU 42`, or `JP 26.5`.
4. Resolve an exact row from the bundled reference table, or for supported women's clothing numeric ranges resolve a numeric input that falls inside the displayed range row.
5. Immediately display the corresponding JP/US/EU row and a concise source-to-target summary.
6. Optionally use the measurement section for a conservative nearby-size estimate.

## Current functional contract

### Direct conversion

- Convert one directly entered size across JP/US/EU using the bundled representative table.
- Accept a plain size under the selected base system or a `JP` / `US` / `EU` prefixed size.
- Normalize common dash variants and a trailing `cm` for exact matching; do not guess unsupported direct sizes.
- For women's clothing only, `US` and `EU` numeric values that fall inside an existing displayed reference range may resolve to that range. Example: `US 4` may resolve to the `US 2–4` row; no new size data is invented.
- The query-intent helper displays the active category/chart context because the same US number can map differently across men's/women's charts and shoes/clothing.
- Provide explicit US 4 men's-shoe and women's-shoe shortcuts because current Search Console demand includes `us4 日本サイズ`-style queries.
- Keep the same conversion row selected when switching the source system.
- Show a no-match state for values outside the bundled table and supported range rows.
- Display and locally copy the full selected table or the current direct conversion result.

### Shoe measurement estimate

- Require foot length in cm; foot width is optional.
- Use the selected men's/women's shoe reference rows only within their supported JP-length envelope.
- If foot length is below the minimum or above the maximum supported JP row, return an explicit out-of-range state rather than presenting the nearest endpoint as a fit result.
- Within range, choose the nearest JP row and show nearby rows as alternatives.
- Treat a distance of about 0.2 cm or more from the nearest 0.5 cm reference row as boundary context and advise checking adjacent sizes.
- If foot width is supplied, calculate a simple width/length ratio only as context. It is not a JIS width/last or formal shoe-width classification.
- Show the calculation basis and allow the result text to be copied locally.

### Clothing measurement estimate

- Require waist; chest/bust and hip remain optional.
- Support cm/inch input and convert inches locally to cm.
- Use chest/bust with extra weight for tops, waist as required context, and hip as optional tie-breaking context.
- Before choosing a size, compare every supplied relevant measurement with the overall supported chart envelope for that metric.
- If any supplied relevant measurement falls outside the chart envelope, return an explicit out-of-range state rather than presenting the smallest/largest size as a fit result.
- For an in-range result, show each supplied measurement against the selected row's range.
- Warn when a supplied measurement lies within 1 cm of a selected-row boundary.
- Allow the result text to be copied locally.

### Shared behavior

- Switch JA/EN UI on the same page and persist only the UI-language choice.
- Perform conversion and measurement calculations locally in the browser.
- Do not apply brand-wide numerical size offsets. `brand.json` is not part of the active calculation path.
- Results are approximate and official seller/brand charts take precedence.

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
- Active category/chart context and common US 4 shortcuts.
- Full JP/US/EU reference table.
- Approximate shoe fit result, nearby rows, or explicit out-of-range state.
- Approximate clothing size result with measurement basis, or explicit out-of-range state.
- Visible guidance that all results are general estimates.

## Amazon affiliate readiness

The page loads the shared `/assets/amazon-affiliate.js` helper plus local `affiliate-config.js`.

Default configuration remains deliberately disabled:

- `enabled: false`
- `shoes: ""`
- `clothing: ""`

While disabled or without valid Amazon HTTPS targets, no Amazon CTA, disclosure, or affiliate click event is emitted. When Amazon Associates is ready, activation requires only verified target URLs plus `enabled: true`.

The active affiliate insertion point remains immediately after a valid direct-conversion result. Measurement inputs/results are never encoded into affiliate URLs or affiliate analytics. Query-intent shortcut state is also not added to affiliate URLs or analytics.

## State and persistence

- Current category, chart, base system, selected row, direct size text, and measurement inputs are page state only.
- Query-intent range-resolution state and shortcut context are page state only.
- Measurement/profile history is not persisted.
- JA/EN preference may be stored as `nw_lang` in localStorage.

## Privacy and network behavior

- Size conversion and fit calculations run locally in the browser.
- Direct size text and measurements are not sent to a fitting backend or affiliate destination.
- Query-intent helpers run locally and do not create new network requests.
- Ads and analytics may load separately under the NicheWorks common specification.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The page uses a direct-input conversion card first, followed by an expandable table and measurement helpers with collapsible measurement guidance.

## Limits and non-goals

- Results are approximate and can vary materially by brand, product, material, stretch, last shape, foot width/instep, and fit preference.
- Results are approximate and must not be represented as guaranteed fit.
- The foot-width ratio is a rough contextual signal only and is not a formal width-size standard.
- Current direct conversion centers on JP/US/EU.
- Numeric-in-range resolution does not convert between standards mathematically; it only maps an input into an already bundled displayed range row.
- UK, CN, kids, wide sizing, and verified brand/model-specific official charts require separate verified data work.
- The tool is not a virtual fitting service.

## Acceptance criteria

- [ ] A plain or prefixed direct size resolves an exact bundled row, except supported women's clothing numeric values may resolve inside an already bundled US/EU range row.
- [ ] `US 4` can be checked explicitly for men's shoes and women's shoes without implying they are the same chart.
- [ ] The UI states the active category/chart context near the direct result.
- [ ] Unsupported direct sizes show a no-match state.
- [ ] Changing source system preserves the current conversion row.
- [ ] Shoe foot length outside the current selected chart range returns out-of-range, not the nearest endpoint row.
- [ ] In-range shoe estimates show the nearest row, nearby rows, calculation basis, and boundary context where applicable.
- [ ] Optional foot width produces only a clearly labeled rough ratio context.
- [ ] Clothing fit requires waist and supports cm/inch conversion.
- [ ] Clothing measurements outside the overall chart envelope return out-of-range, not the smallest/largest size.
- [ ] In-range clothing results show supplied measurements against selected-row ranges and flag near-boundary measurements.
- [ ] Shoe/clothing estimate text can be copied locally.
- [ ] No active brand-wide numerical correction changes a calculated result.
- [ ] Default affiliate configuration keeps Amazon CTA/disclosure hidden.
- [ ] Affiliate analytics never receive size text, query-intent state, or measurement state.

## Implementation evidence

- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/query-intent.js`
- `tools/size-converter/style.css`
- `tools/size-converter/affiliate-config.js`
- `assets/amazon-affiliate.js`
