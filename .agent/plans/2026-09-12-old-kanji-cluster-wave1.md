# ExecPlan — Old-kanji acquisition cluster Wave 1

## 1. Goal

Turn the existing old-kanji tools into a deliberate acquisition/continuation cluster centered on `old-kanji-reference`, using only compact, context-relevant related-tool links near the bottom of each tool.

This is an SEO / AdSense / donation / internal-continuation slice. It does not add a paywall, affiliate block, site-wide navigation, or new Pro product.

Evidence baseline from the monetization master:

- `old-kanji-reference`: 462 GA4 landing sessions; 344 GSC impressions / 5 clicks in the 90-day window.
- `kanji-modernizer`: 25 GA4 landing sessions.
- related kanji utilities already have early GSC/GA4 evidence.

## 2. Scope

Runtime pages in scope:

- `tools/old-kanji-reference/index.html`
- `tools/kanji-modernizer/index.html`
- `tools/name-old-kanji-checker/index.html`
- `tools/place-old-kanji-checker/index.html`
- `tools/unicode-kanji-checker/index.html`
- `tools/variant-kanji-compare/index.html`
- `tools/old-document-kanji-highlighter/index.html`

Support files in scope only if required:

- one small shared related-link analytics helper under `assets/`
- one path-scoped consistency check under `scripts/`
- one path-scoped workflow under `.github/workflows/`

Explicitly out of scope:

- `tools/old-kanji-ocr-scanner/**` because it remains a hold item until the OCR product contract is complete;
- `tools/manual-finder/**`;
- `common-spec/**`;
- any Pro pricing/product migration;
- affiliate links;
- header/global navigation;
- changes to tool algorithms, dictionaries, OCR, conversion, or result logic.

## 3. Rules / Prohibitions

- Keep the primary tool function, ads, donations, disclaimers, language controls, canonical metadata and structured data intact.
- Do not create a common header menu, mega-nav, or generic all-tools block.
- Related links must be compact and near the bottom of the main content.
- Hub (`old-kanji-reference`) may expose the six completed sibling tools because it is the cluster reference page.
- Leaf tools must link back to the hub and only a small number of directly relevant siblings.
- Do not include `old-kanji-ocr-scanner` in the monetization/continuation block yet.
- Remove unrelated utility links from the cluster block when they dilute the old-kanji task path.
- Preserve context-specific dynamic links inside a tool (for example “check full text in converter”) when they are part of the tool workflow; those are distinct from the footer-near cluster block.
- Analytics must never include searched characters, names, addresses, text input, result content, or query strings.

## 4. Link Contract

Hub links from `old-kanji-reference`:

1. `kanji-modernizer` — convert full text.
2. `name-old-kanji-checker` — check old/variant forms in personal names.
3. `place-old-kanji-checker` — check place/address forms.
4. `unicode-kanji-checker` — inspect Unicode / HTML entities.
5. `variant-kanji-compare` — compare glyphs/forms side by side.
6. `old-document-kanji-highlighter` — highlight old forms in old-document-style text.

Leaf links:

- `kanji-modernizer`: hub + old-document highlighter + Unicode checker.
- `name-old-kanji-checker`: hub + variant compare + Unicode checker.
- `place-old-kanji-checker`: hub + old-document highlighter + name checker.
- `unicode-kanji-checker`: hub + variant compare + kanji modernizer.
- `variant-kanji-compare`: hub + Unicode checker + name checker.
- `old-document-kanji-highlighter`: hub + kanji modernizer + place checker.

The exact visible JP/EN labels may follow each page's existing language system, but the destination set must follow this contract.

## 5. Measurement

Primary measurement remains GSC + standard GA4 acquisition/landing behavior.

For explicit cluster-link measurement, add only a fixed-data event if a small implementation can be shared safely:

- event: `nw_related_tool_click`
- parameters:
  - `source_tool`
  - `target_tool`
  - `cluster=old_kanji`

Source/target must come from hard-coded `data-` attributes, never from user input or arbitrary href query parameters.

If the shared event helper is added, it must fail harmlessly when `gtag` is unavailable and must not prevent navigation.

## 6. Change List

- Replace the hub's unrelated three-link footer block with a six-destination old-kanji continuation block.
- Remove the duplicate top-of-page general sibling block from Kanji Modernizer; retain the workflow-specific tool behavior and move the general cluster set to the bottom.
- Normalize the six leaf footer-near related blocks to the link contract above.
- Keep existing dynamic workflow links intact.
- Add fixed source/target data attributes to measured cluster links if the shared helper is used.
- Add a small consistency checker that verifies:
  - all seven pages exist;
  - the hub has all six sibling destinations;
  - each leaf has its required hub + sibling destinations;
  - `old-kanji-ocr-scanner` is absent from these cluster blocks;
  - known unrelated legacy links (`rename-wizard`, `filetype-sniffer`, `log-formatter`) are absent from the cluster blocks;
  - the tracking helper contains no value extraction from text inputs.

## 7. Test Plan

- Run the cluster consistency check.
- Run existing SEO / internal-link checks triggered by changed pages.
- Confirm each changed HTML file remains parseable enough for existing SEO checks.
- Confirm JP/EN labels remain present on bilingual pages.
- Confirm no tool input/result code changes.
- Confirm no `manual-finder` or OCR scanner file changes.
- Confirm ads/donation blocks remain where already present.
- Confirm related links are not placed in `<header>`.
- Confirm all new internal destinations resolve to registered tool paths.

## 8. Rollback Plan

Revert the single squash merge for this slice. No data migration, billing state, affiliate state, or user-generated content is involved.
