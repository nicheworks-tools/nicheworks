# Tool Specification — Size Converter

- Slug: `size-converter`
- Public URL: `https://nicheworks.app/tools/size-converter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules when enabled: `common-spec/amazon-affiliate.md`

## Purpose

Provide a fast approximate JP/US/EU clothing and shoe size converter with local retail-input normalization, a four-row comparison tray, conservative measurement-based estimates, valid-fit handoff into direct conversion, and cm/inch shoe-measurement input.

## Primary workflow

1. Select shoes/clothing and men's/women's reference chart.
2. Enter a plain or JP/US/EU-prefixed size.
3. Normalize supported retail syntax such as `8 1/2`, `8-1/2`, `8½`, and full-width ASCII locally.
4. Resolve only bundled JP/US/EU rows/ranges and show the direct conversion.
5. Optionally pin up to four conversion rows for page-local comparison.
6. Optionally run conservative shoe/clothing measurement estimates.
7. For a valid estimate, optionally hand only the estimated JP size plus category/chart context into the direct converter.

## Current functional contract

### Direct conversion

- Use the bundled representative JP/US/EU tables only.
- Accept plain input under the selected base system or explicit `JP` / `US` / `EU` prefixes.
- Normalize supported half-size notation and full-width ASCII before core lookup; normalization never invents/interpolates a row.
- Women's US/EU clothing numeric input may resolve only within already displayed bundled ranges.
- Preserve category/chart context around ambiguous values such as `US 4`; explicit men's/women's shoe US 4 shortcuts remain available.
- Unsupported sizes show no-match rather than guessed nearest direct conversion.
- Direct result and full table can be copied locally.

### Candidate comparison tray

- Pin up to four unique direct-conversion rows.
- Preserve category/chart context for each row.
- Adding a fifth unique row drops the oldest.
- Support individual removal, clear-all, and local TSV clipboard copy.
- Comparison state is page memory only and never enters URL/analytics/affiliate state.

### Shoe measurement estimate

- Foot length required; width optional.
- Measurement unit can be `cm` or `inch`.
- The calculation source remains the existing cm-based fit engine. Inch length/width is multiplied by `2.54` immediately before the core synchronous fit handler, then visible fields are restored to their original inch values.
- Use only the selected chart's supported JP-length envelope; outside values return explicit out-of-range rather than endpoint matches.
- In range, show nearest row, nearby rows, distance/boundary context, and optional rough width-to-length ratio.
- Width ratio is not a JIS/formal width classification.
- A valid result may expose a handoff action using only estimated JP size plus category/chart context.

### Clothing measurement estimate

- Waist required; chest/bust and hip optional.
- Support cm/inch with local inch-to-cm conversion.
- Check every supplied relevant measurement against the selected chart's overall metric envelope before choosing a row.
- Out-of-envelope input returns explicit out-of-range rather than smallest/largest size.
- Valid result shows measurement basis/boundary context and may expose the same local JP-size handoff.

### Fit-to-converter handoff

- Only valid in-range results expose the action.
- Capture chart/category context with the rendered result.
- Set direct converter to the estimated `JP ...` size and existing context; raw foot/body measurements are not copied.
- Handoff itself makes no network request and does not add analytics.
- It may make the ordinary direct-result Amazon insertion point eligible only if a separate future affiliate activation enables valid targets.

### Shared behavior

- JP/EN bilingual single page; only language choice may persist.
- All sizing logic, syntax normalization, comparison, unit conversion, fit, and handoff are browser-local.
- No brand-wide numerical correction is active; `brand.json` is not in the active calculation path.
- Results remain approximate; official seller/brand charts take precedence.

## Inputs

- Category, chart, JP/US/EU base, direct size text.
- Supported retail input syntax/full-width ASCII.
- Optional comparison action.
- Shoe: unit, foot length, optional width.
- Clothing: type, unit, waist, optional chest/bust/hip.
- Optional valid-fit handoff.
- JP/EN UI language.

## Outputs

- Direct JP/US/EU conversion cards and concise sentence.
- Active chart/category context and US 4 shortcuts.
- Up to four comparison cards and TSV copy.
- Full reference table.
- Shoe/clothing fit estimate or explicit out-of-range state.
- Local inch-to-cm shoe conversion note when applicable.
- Valid-fit handoff action.
- Local copy actions and approximation cautions.

## Amazon affiliate readiness

The page uses `/assets/amazon-affiliate.js` plus local `affiliate-config.js`.

Production defaults remain:

- `enabled: false`
- `shoes: ""`
- `clothing: ""`

Disabled/invalid configuration emits no CTA, disclosure, or affiliate click event. Activation later requires only verified Amazon targets and `enabled: true`.

Measurement inputs/results are never encoded into affiliate URLs or affiliate analytics. Direct raw size text, normalized syntax state, query-intent state, comparison rows, selected shoe unit, and raw fit measurements are likewise excluded. `affiliate_click` remains coarse shared-helper metadata only.

## State and persistence

- Direct selection/input, query-intent state, comparison rows, unit choice, measurements, fit/handoff context are page state only.
- Comparison rows cap at four.
- Measurement/profile history is not persisted.
- Only `nw_lang` may be stored for JP/EN preference.

## Privacy and network behavior

- Core calculations and all wave-3 helpers run locally.
- Direct text, comparison rows, unit choice, and measurements are not sent to fitting or affiliate backends.
- Fit handoff moves only estimated JP size plus category/chart inside the page.
- Ads/analytics may load separately under common-spec rules.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

Direct conversion remains first; query/context and comparison follow; full table and measurement helpers are secondary. Dynamic additions must remain mobile-safe.

## Limits and non-goals

- No fit guarantee.
- Current direct conversion is JP/US/EU only.
- Inch support is a shoe **measurement-input unit**, not a new sizing standard.
- No unsupported quarter-size interpolation.
- UK/CN/kids/formal width/verified brand-model tables require separate verified data work.
- Comparison does not rank brands/products or purchase suitability.
- Fit handoff only avoids retyping an approximate estimate.

## Acceptance criteria

- [ ] Supported plain/prefixed input resolves only bundled rows/ranges.
- [ ] `8 1/2`, `8-1/2`, `8½`, and full-width ASCII normalize locally without new sizing data.
- [ ] US 4 men's/women's shoe context stays distinct.
- [ ] Comparison tray deduplicates, caps at four, remains page-only, and copies locally.
- [ ] Shoe cm/inch inputs use the same cm fit engine and inch fields restore after calculation.
- [ ] Shoe/clothing out-of-range input does not produce endpoint matches.
- [ ] Valid fit handoff transfers only estimated JP size plus category/chart; invalid/out-of-range exposes no handoff.
- [ ] Raw measurements/unit/direct input never enter affiliate analytics or URLs.
- [ ] No brand-wide numerical offset changes results.
- [ ] Default Amazon config remains invisible/inert.

## Implementation evidence

- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/query-intent.js`
- `tools/size-converter/fit-handoff.js`
- `tools/size-converter/shoe-units.js`
- `tools/size-converter/style.css`
- `tools/size-converter/affiliate-config.js`
- `assets/amazon-affiliate.js`
