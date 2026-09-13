# Size Converter — canonical tool specification

- **Slug:** `size-converter`
- **Display name (JA):** サイズ変換ツール
- **Display name (EN):** Size Converter
- **Implementation:** `tools/size-converter/`
- **Registry state:** active (registered implementation present)
- **Category:** size, unit, converter, life
- **Common specification:** `common-spec/spec-ja.md`
- **Affiliate specification:** `common-spec/amazon-affiliate.md`
- **Data-basis audit:** `tools/size-converter/data-basis.md`
- **UK evaluation:** `tools/size-converter/uk-evaluation.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for `/tools/size-converter/`. `app.js` is the core conversion/fit runtime. `query-intent.js` adds local input normalization, current-chart context, US 4 shortcuts, and the four-row comparison tray. `fit-handoff.js` adds valid-fit-to-converter handoff and loads `shoe-units.js`. `tests/behavior.test.mjs` executes production `app.js` logic through a controlled test export hook. No removed `app-complete.js` runtime is canonical evidence.

## 2. Purpose

Provide fast approximate JP/US/EU clothing and shoe size orientation from one directly entered size, plus conservative measurement-based estimates, page-local candidate comparison, retail-input normalization, and a no-retyping handoff from valid measurement estimates into direct conversion.

The bundled rows are a **representative crosswalk for orientation**, not an official universal sizing standard. The tool also exposes static representative answers for common search intents while preserving category/chart context and directing purchase decisions back to official brand/product charts.

## 3. Inputs

- Category: shoes or clothing.
- Chart type: men or women.
- Base system: JP, US, or EU.
- Direct size text, optionally prefixed as `JP ...`, `US ...`, or `EU ...`.
- Supported retail syntax such as `8 1/2`, `8-1/2`, `8½`, and full-width ASCII input.
- Shoe measurements: foot length required, foot width optional, with page-local cm/inch unit selection.
- Clothing measurements: garment type, cm/inch, waist required, chest/bust and hip optional.
- Optional candidate-pin and valid-fit handoff actions.
- JP/EN display language.

UK is not a current input/base system. Its generic addition is verified-deferred because official manufacturer charts disagree on the same nominal US→UK mappings.

## 4. Processing behavior

- Direct conversion remains the primary workflow and resolves only bundled representative JP/US/EU rows.
- A plain size resolves under the selected base system; `JP` / `US` / `EU` prefixes select the source system locally.
- Retail half-size syntax is normalized to the existing decimal form; full-width ASCII is normalized to half-width. Syntax normalization never invents a row or interpolates unsupported sizes.
- Women's US/EU clothing numeric values may resolve only inside an already bundled displayed range row.
- Unsupported direct sizes show no-match rather than nearest-row guessing.
- Static representative examples in the page are crawlable HTML and must correspond to production `DATA`, not separately invented SEO values.
- The current direct result may be pinned into a page-memory comparison tray capped at four unique category/chart/JP/US/EU rows. A fifth unique row removes the oldest.
- The comparison tray supports individual remove, clear-all, and TSV clipboard copy without persistence or network transmission.
- Shoe fit uses the existing JP-length reference envelope. Out-of-range foot length is explicit rather than clamped to an endpoint.
- Shoe fit shows nearest/nearby rows, distance/boundary context, and optional rough width-to-length ratio; the ratio is not a formal width standard.
- Shoe measurement inputs may be entered in cm or inch. Inch values are multiplied by 2.54 only immediately before the existing cm fit calculation, and the visible fields are restored to their original inch values immediately after the synchronous calculation.
- Clothing fit requires waist, supports cm/inch, checks supplied measurements against the full chart envelope, and refuses endpoint guesses outside that envelope.
- A valid shoe/clothing fit result can hand only its estimated JP size plus category/chart context into the direct converter. Raw measurements are not transferred.
- A later chart change cannot reinterpret an already-rendered handoff because the handoff captures its chart context when created.
- No brand-wide numerical correction is active; `brand.json` is outside the active calculation path.
- All conversion, normalization, comparison, unit conversion, fit, and handoff logic runs locally in the browser.

### Data provenance behavior

- `data-basis.md` records the current official-source audit and classifies the generic tables as representative orientation data.
- Official adidas, ASICS, Nike, and New Balance evidence demonstrates that cross-brand labels and measurement mappings can differ.
- No single manufacturer's chart is silently treated as the universal generic table.
- `uk-evaluation.md` records the verified UK no-addition decision. For checked men's rows, adidas/New Balance and ASICS disagree by 0.5 UK size for the same US size, so no fixed US→UK offset is permitted.
- Future regional or brand/model-specific additions require separate verified data rather than extrapolation from the current table.

## 5. Outputs

- Direct source-to-target answer such as `US 8.5 → JP 26.5 / EU 42`.
- JP/US/EU result cards and full selected reference table.
- Static representative answer cards for common search intents, explicitly separated by category/chart.
- Current category/chart context plus US 4 men's/women's shortcuts.
- Up to four page-local comparison cards and TSV copy.
- Shoe estimate, nearby rows, calculation/boundary context, or explicit out-of-range result.
- Clothing estimate with measurement basis or explicit out-of-range result.
- Local inch-to-cm note when shoe measurements are entered in inches.
- Valid-fit handoff action into the direct converter.
- Local copy actions and approximate-result/provenance cautions.
- Explicit FAQ explanation that generic UK conversion is intentionally not exposed because current official charts disagree.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty/incomplete direct input:** no unsupported row is fabricated.
- **Unsupported direct input:** explicit no-match state.
- **Unsupported UK input/system:** UK is not exposed as a selectable generic system; no inferred fixed-offset result is fabricated.
- **Invalid measurement input:** local validation prevents a fit result.
- **Measurement outside supported reference envelope:** explicit out-of-range state; endpoint sizes are not presented as matches.
- **Invalid inch input:** the unit layer does not fabricate a converted value; the existing validation handles the input.
- **Invalid/out-of-range fit result:** no fit-handoff action is exposed.
- **Copy failure:** visible/local copy-failure behavior remains available in the core runtime.
- **Safe reset:** measurement reset clears page-local inputs/results only; selected shoe unit may remain page state for the session.
- **Network/API failure:** not applicable to core sizing logic; ads, analytics, donations, and affiliate links are separate page resources.

## 7. Privacy/data handling

Direct size text, normalized syntax, candidate comparison rows, shoe/clothing measurements, selected shoe unit, fit results, and fit-handoff state are processed locally and are not sent to a fitting backend. Measurement/profile history is not persisted. Only JP/EN preference may be stored as `nw_lang`.

Data-basis and UK-evaluation files are static maintainer documentation and do not add user-data collection.

Amazon activation is isolated from user sizing state. Raw size text, measurements, candidate rows, fit details, provenance state, and UK evaluation state must not be encoded into affiliate URLs or affiliate analytics. A valid fit handoff moves only the estimated JP size plus category/chart state inside the page.

## 8. Responsive contract

- **Layout class:** `mobile-oriented`.
- Direct input/result remains first and usable without horizontal page scrolling.
- Static representative answer cards collapse to one column on narrow screens.
- Query/context and comparison cards wrap on narrow screens.
- The full table may use its own horizontal overflow container.
- Measurement fields collapse appropriately for mobile; the shoe unit selector stays within the measurement grid.
- Common-spec responsive rules remain authoritative.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN switches in place; existing bilingual behavior must not be removed.
- Static representative-answer headings/notes and dynamic query/context, comparison, handoff, and shoe-unit labels follow the current document language.
- Only language preference is persisted.

## 10. SEO contract

Keep a tool-specific title/description, one self-referencing canonical for `https://nicheworks.app/tools/size-converter/`, valid `WebApplication` JSON-LD, and evidence-based FAQ/schema content.

Search-oriented representative examples such as `US 4` and `US 8.5` may be present in static HTML only when they exactly correspond to bundled production rows and retain men/women/category context. SEO copy must not convert the representative table into a claim of a universal international sizing standard. UK FAQ/schema must state the current verified deferral rather than imply support.

## 11. Advertising contract

### Affiliate contract

- Preserve GA4/AdSense identifiers and common-spec placement rules.
- Shared `/assets/amazon-affiliate.js` plus local `affiliate-config.js` form the Amazon insertion contract.
- Production is active with `shoes=https://amzn.to/4hnXGRb` and `clothing=https://amzn.to/4dxBv8Q`.
- Disabled or invalid config: no Amazon CTA, Associates disclosure, or affiliate click event.
- Valid enabled config may mount only the contextual CTA after a valid direct-conversion result and renders the shared Associates disclosure.
- `affiliate_click` remains limited to coarse `tool`, `affiliate`, `target`, and `placement` metadata.
- Raw size text, normalized input, chart choice, comparison state, shoe unit, measurements, fit results, data-basis state, and UK-evaluation state are forbidden affiliate analytics fields.
- The affiliate CTA makes no price, availability, rating, review, or fit-suitability claim.

## 12. Donation/support contract

Preserve the existing donation/support block under common-spec rules. Amazon activation is an independent path and does not automatically remove OFUSE/Ko-fi support links.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** required-and-present.
- **Usage documentation:** recommended-and-missing; not a hard compliance failure.
- **FAQ:** recommended-and-present.
- Inline measurement guidance remains part of the usability contract.
- The page must explain why generic mappings are estimates and why UK is intentionally not exposed as a universal conversion.
- Dynamic helper copy must clearly distinguish chart/category context, local syntax normalization, and approximate fit behavior.

## 14. Functional acceptance tests

- [ ] Plain or JP/US/EU-prefixed sizes resolve only supported bundled rows/ranges.
- [ ] `8 1/2`, `8-1/2`, and `8½` normalize to the same existing half-size lookup as `8.5`.
- [ ] Full-width ASCII sizing input normalizes locally.
- [ ] US 4 men's/women's shoe shortcuts retain distinct chart context.
- [ ] Static representative US 4 / US 8.5 / clothing examples match production `DATA` rows.
- [ ] Candidate comparison deduplicates, caps at four, remains page-only, and copies locally.
- [ ] Shoe out-of-range input does not return an endpoint as a fit result.
- [ ] Clothing out-of-envelope input does not return smallest/largest size as a match.
- [ ] Shoe cm and inch input both use the same underlying cm fit engine; inch fields are restored after calculation.
- [ ] Valid fit handoff moves only estimated JP size plus category/chart context; error/out-of-range results expose no handoff.
- [ ] Optional foot-width context remains explicitly non-formal.
- [ ] Generic runtime `DATA` contains no UK field while UK is verified-deferred.
- [ ] `data-basis.md` remains present with official-source provenance and non-universal classification.
- [ ] `uk-evaluation.md` remains present with the multi-source disagreement and no-addition decision.
- [ ] No brand-wide numerical offset changes a result.
- [ ] Active Amazon config uses the two verified Special Links; valid results expose contextual CTA/disclosure, while invalid config remains hidden.

Automated contract evidence includes the discovered production-code test `tools/size-converter/tests/behavior.test.mjs`, existing runtime waves, `scripts/check-amazon-ready-tools.mjs`, prior Size/Tiny growth-wave checks, and `scripts/check-size-converter-growth-wave4.mjs`. The behavior test executes production `app.js` calculation/data logic in Node; it is not represented as a full real-browser end-to-end UI test.

## 15. Explicit tool-specific exceptions

- No language exception beyond bilingual single-page mode.
- No additional layout exception.
- Generic UK conversion is **verified-deferred**, not merely unimplemented: current official adidas/New Balance versus ASICS mappings disagree for the same US sizes.
- CN, kids, formal width sizing, and verified brand/model-specific charts are not implicitly supported by current JP/US/EU data.
- Inch support applies to shoe **measurement input**, not a new shoe-size standard.
- Representative static answers do not override a seller/brand/product official size chart.

### Implementation evidence

- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/query-intent.js`
- `tools/size-converter/fit-handoff.js`
- `tools/size-converter/shoe-units.js`
- `tools/size-converter/data-basis.md`
- `tools/size-converter/uk-evaluation.md`
- `tools/size-converter/tests/behavior.test.mjs`
- `tools/size-converter/style.css`
- `tools/size-converter/affiliate-config.js`
- `assets/amazon-affiliate.js`
- `common-spec/amazon-affiliate.md`
