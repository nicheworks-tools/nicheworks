# Size Converter — data basis and source audit

Audit date: 2026-09-13

## Status

The bundled JP / US / EU tables are a **representative crosswalk for orientation**, not an official international standard and not a promise of product fit.

This audit compared the existing NicheWorks rows with current official brand size guides. The official guides do **not** support treating one universal cross-brand mapping as authoritative. The same nominal US size can map to different CM/JP or EU labels depending on brand, product family, gender chart, and the brand's own definition of CM versus measured foot length.

Accordingly:

- the current tables remain an approximate representative lookup;
- no single brand chart is promoted to a universal standard;
- brand/model-specific official charts always take precedence before purchase;
- `brand.json` remains disabled from active calculations;
- any future new system (for example UK) requires a separate multi-source verification step rather than a fixed arithmetic offset.

## Official sources reviewed

### Footwear

1. adidas — Men's and women's footwear sizing
   - https://www.adidas.com/us/help/size_charts/shoes
   - The official chart includes US Men, US Women, EU, UK, JP and heel-to-toe measurements.
   - Examples: men's US 4 = JP 220 / EU 36; men's US 8.5 = JP 265 / EU 42.

2. ASICS — Men's/Unisex shoe size guide (official product size guide)
   - https://www.asics.com/nz/en-nz/japan-s-unisex-1203a615-109
   - Examples: men's/unisex US 4 = CM 22.5 / EU 36; US 8.5 = CM 26.5 / EU 42.
   - This already differs from adidas at men's US 4 on the CM/JP-style value while sharing EU 36.

3. Nike — Men's footwear size chart
   - https://www.nike.com/jp/en/size-fit/mens-footwear
   - Nike explicitly states that the CM size displayed on shoe boxes/labels is different from measured foot length (cm).
   - This is evidence that a generic field labelled simply "JP/CM" cannot be treated as a universal physical foot-length equivalence.

4. Nike — Women's footwear size chart
   - https://www.nike.com/jp/en/size-fit/womens-footwear
   - Same warning: labelled CM and measured foot length are distinct concepts in Nike's chart.

### Clothing

5. adidas — Women's shirts and tops
   - https://www.adidas.com/us/help/size_charts/women-shirts_tops
   - Official standard conversion shown by adidas includes S = US 4–6 / EU 34–36.
   - The NicheWorks representative women's clothing row currently uses S = US 2–4 / EU 34–36, demonstrating that brand charts cannot be used interchangeably.

6. adidas — Men's shirts and tops
   - https://www.adidas.com/us/help/size_charts
   - adidas presents men's international conversion primarily as alpha labels (XS/S/M/L/etc.) and publishes body-measurement ranges.
   - Example body range for men's M: chest 93–100 cm, waist 81–88 cm, hip 92–99 cm.
   - NicheWorks uses different synthetic measurement ranges, so those ranges must remain labelled as rough estimation logic, not adidas or universal sizing.

7. Nike — Men's tops
   - https://www.nike.com/jp/size-fit/mens-tops-alpha
   - Nike publishes its own body-measurement ranges and fit advice, again confirming brand-specific sizing.

8. Nike — Women's numeric sizing
   - https://www.nike.com/jp/size-fit/womens-numeric
   - Numeric women's sizes are tied to Nike-specific body measurements and fit advice.

## Audit conclusions by dataset

### Direct shoe crosswalk

**Disposition: retain, but only as representative orientation.**

Reason: several current rows resemble common official brand mappings, but official charts disagree on some CM/JP-style values and use different EU conventions (including fractional EU sizes). A single generic table therefore cannot be described as an official standard.

### Direct clothing crosswalk

**Disposition: retain as a coarse representative label crosswalk, not a standard conversion.**

Reason: official brands differ in numeric ranges and even in whether international men's sizes are expressed as alpha or numeric EU labels. The current table is useful as orientation but must not be presented as a guaranteed cross-brand conversion.

### Shoe measurement estimate

**Disposition: retain as local heuristic.**

The estimate chooses nearby rows from the bundled representative shoe table. It is not a Brannock/JIS/brand-last fitting model. Foot width remains only a width-to-length ratio context.

### Clothing measurement estimate

**Disposition: retain as local heuristic, explicitly non-standard.**

Current body ranges are not copied from one official brand and do not match any one brand exactly. They provide coarse orientation only. Official product/brand body-measurement charts take precedence.

## Maintenance rules

1. Never describe the bundled table as an ISO/JIS/US/EU universal conversion standard unless a specific standard is actually licensed, implemented, and cited.
2. Never infer a brand-wide adjustment such as "+0.5" from a few products.
3. Never convert a new region by a fixed offset unless the underlying verified data supports every retained row.
4. Any brand/model-specific table must be sourced to that brand/model and kept separate from the generic representative crosswalk.
5. When an official source distinguishes labelled CM from measured foot length, preserve that distinction.
6. Re-audit sources before materially expanding the table or using it for stronger purchase-fit claims.

## Amazon boundary

This audit does not change affiliate activation. Amazon remains disabled. If affiliate links are later enabled, no size input, measurement, fit result, chart state, or source-audit state may be encoded into affiliate URLs or affiliate analytics.
