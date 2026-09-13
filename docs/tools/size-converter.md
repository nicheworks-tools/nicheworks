# Size Converter — canonical tool specification

- **Slug:** `size-converter`
- **Display name (JA):** サイズ変換ツール
- **Display name (EN):** Size Converter
- **Implementation:** `tools/size-converter/`
- **Registry state:** active (registered implementation present)
- **Category:** size, unit, converter, life
- **Common specification:** `common-spec/spec-ja.md`
- **Affiliate specification:** `common-spec/amazon-affiliate.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `size-converter` implementation at `/tools/size-converter/`. The active runtime is `tools/size-converter/app.js`; the former `app-complete.js` runtime has been removed and is not canonical evidence.

## 2. Purpose

Provide fast approximate JP/US/EU clothing and shoe size conversion from one directly entered size, plus conservative measurement-based estimates that explicitly refuse unsupported endpoint guesses.

## 3. Inputs

- Category: shoes or clothing.
- Chart type: men or women.
- Base system: JP, US, or EU.
- Direct size text, optionally prefixed as `JP ...`, `US ...`, or `EU ...`.
- Shoe measurements: foot length required, foot width optional.
- Clothing measurements: garment type, cm/inch, waist required, chest/bust and hip optional.
- JP/EN display language.

## 4. Processing behavior

- Direct conversion is the primary workflow; the full table and measurement estimates are secondary.
- A plain direct size resolves under the selected base system.
- Prefixes such as `US 4`, `EU 42`, and `JP 26.5` switch the source system locally and resolve only an exact bundled reference row.
- Unsupported direct sizes display a no-match state rather than a guessed nearest direct conversion.
- Changing the source system preserves the selected conversion row.
- The current direct conversion and full table can be copied locally.
- Shoe measurement estimation uses the selected men's/women's JP-length reference envelope. Foot length outside that envelope produces explicit out-of-range output rather than the minimum/maximum endpoint as a fit result.
- In-range shoe estimation shows the nearest row, nearby rows, distance from the selected JP row, and boundary context.
- Optional foot width is interpreted only as a rough foot-width-to-length ratio. It is not JIS width, last width, or a formal shoe-width classification.
- Clothing estimation requires waist, accepts optional chest/bust and hip, and converts inch inputs to cm locally.
- Every supplied relevant clothing measurement is checked against the selected chart's overall metric envelope before a size is chosen. Out-of-envelope input produces explicit out-of-range output.
- In-range clothing output shows the supplied measurements against the selected row's ranges and warns near boundaries.
- No brand-wide numerical size correction is active. `brand.json` is not part of the active calculation path.
- All conversion and fit logic runs locally in the browser.

## 5. Outputs

- Direct source-to-target answer such as `US 8.5 → JP 26.5 / EU 42`.
- JP/US/EU result cards.
- Full selected reference table and TSV copy.
- Shoe estimate, nearby rows, calculation context, or explicit out-of-range result.
- Clothing estimate with measurement basis or explicit out-of-range result.
- Local copy actions for direct and measurement results.
- Guidance that all results are approximate and official seller/brand charts take precedence.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty/incomplete direct input:** no unsupported row is fabricated; the direct result remains unresolved until an exact current-table value is available.
- **Unsupported direct input:** explicit no-match state.
- **Invalid measurement input:** visible local validation prevents a fit result.
- **Measurement outside supported reference envelope:** explicit out-of-range state; endpoint sizes are not presented as matches.
- **Copy failure:** visible copy-failure feedback is used.
- **Safe reset:** shoe/clothing reset clears only page-local measurement input/result state.
- **Network/API failure:** not applicable to core conversion/fit processing; ads, analytics, donations, and future affiliate links are separate page resources.

## 7. Privacy/data handling

Conversion text and measurements are processed locally and are not sent to a fitting backend. Measurement/profile history is not persisted. Only the JP/EN preference may be stored as `nw_lang`. Ads/analytics may load separately under the common specification.

Amazon readiness is isolated from user sizing state: direct size text, chart selection, measurements, and results must never be encoded in affiliate URLs or affiliate analytics.

## 8. Responsive contract

- **Layout class:** `mobile-oriented`.
- The direct input/result card is first and must remain usable without horizontal scrolling on mobile.
- The table may use its own horizontal overflow container.
- Measurement fields collapse to a single-column mobile layout.
- The implementation follows common-spec responsive rules without forcing a universal fixed width.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN is switched in place and the existing bilingual mode must not be removed.
- Only language preference is persisted.

## 10. SEO contract

The main public page must keep a tool-specific title/description, exactly one self-referencing canonical for `https://nicheworks.app/tools/size-converter/`, valid `WebApplication` JSON-LD, and evidence-based FAQ/schema content. Search-oriented examples such as `US 4` are valid only where the bundled reference table actually supports them.

## 11. Advertising contract

### Affiliate contract

- Preserve existing GA4 and AdSense identifiers/code and common-spec placement rules.
- The shared `/assets/amazon-affiliate.js` helper and local `affiliate-config.js` form the Amazon insertion contract.
- Production default remains `enabled: false` with empty `shoes` and `clothing` targets until verified Amazon URLs exist.
- Disabled or invalid configuration must show no Amazon CTA, no Associates disclosure, and emit no affiliate click event.
- Valid enabled configuration may mount a contextual Amazon CTA immediately after a valid quick-conversion result.
- `affiliate_click` is limited to coarse `tool`, `affiliate`, `target`, and `placement` metadata.
- Size text, gender/chart, measurement values, fit results, and table results are forbidden affiliate analytics fields.

## 12. Donation/support contract

Preserve the existing donation/support block under common-spec rules. Amazon activation does not replace or automatically remove OFUSE/Ko-fi support links; monetization density should remain reviewable as a separate UI decision.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** required-and-present.
- **Usage documentation:** recommended-and-missing; not a hard compliance failure.
- **FAQ:** recommended-and-present.
- Inline measurement guidance is present for feet and clothing and is part of the active usability contract.

## 14. Functional acceptance tests

- [ ] A plain or JP/US/EU-prefixed direct size resolves only an exact bundled row.
- [ ] Unsupported direct sizes show no-match rather than nearest-row guessing.
- [ ] Changing the source system preserves the current conversion row.
- [ ] Women's US 4 resolves to the current representative JP/EU row.
- [ ] Full table and direct converter use the same bundled data.
- [ ] Shoe input outside the current chart envelope returns out-of-range rather than an endpoint fit result.
- [ ] Clothing supplied measurements outside the chart envelope return out-of-range rather than smallest/largest size.
- [ ] Optional foot width is explicitly non-formal ratio context.
- [ ] Direct/fit copy actions do not require network transmission.
- [ ] No brand-wide numerical offset changes a result.
- [ ] Default Amazon config mounts no CTA/disclosure.
- [ ] Enabled+valid Amazon config mounts only contextual Amazon navigation and coarse click analytics.
- [ ] Enabled+missing/invalid target remains hidden.

Automated contract evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` and `scripts/check-amazon-ready-tools.mjs`. The Amazon activation path has executable helper behavior coverage; a full browser end-to-end sizing test suite is not claimed.

## 15. Explicit tool-specific exceptions

- No language exception beyond the bilingual single-page mode.
- No additional layout exception.
- UK, CN, kids, formal width sizing, and brand/model-specific charts are not implicitly supported by the current JP/US/EU data.

### Implementation evidence

- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/style.css`
- `tools/size-converter/affiliate-config.js`
- `assets/amazon-affiliate.js`
- `common-spec/amazon-affiliate.md`
