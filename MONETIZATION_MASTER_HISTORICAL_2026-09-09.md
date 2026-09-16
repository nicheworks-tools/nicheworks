# NicheWorks Monetization Master

Status: decision baseline for the current 87-tool catalog, with `manual-finder` intentionally excluded because its monetization implementation is already underway.

Evidence window: **2026-06-12 through 2026-09-09** (90 days). GSC was settled through 2026-09-09 when this decision set was prepared.

## Purpose

This file answers a different question from the per-tool functional specifications: **what should be the primary monetization mechanism for each tool, and why?**

The suite-wide baseline remains the existing common-spec policy: AdSense, GA4, and donation/support surfaces remain in place where required. The categories below identify the additional or primary optimization path, not permission to remove the baseline.

Traffic volume alone is not the ranking rule. Decisions use four separate signals:

1. **Search demand / search fit** — impressions, clicks, CTR and average position in GSC.
2. **Actual use** — landing-page sessions in GA4.
3. **Commercial intent** — whether the user's next real-world action naturally involves a purchase/service decision.
4. **Paid-feature fit** — whether a free core can remain useful while batch scale, export, saved state, richer reports, presets/history, or professional workflow packaging creates a real Pro delta.

## Current evidence that changes prioritization

- `old-kanji-reference`: **462 GA4 sessions**, plus **344 GSC impressions / 5 clicks**. It is the largest observed acquisition/use surface, but intent is reference-oriented, so it should act as a free cluster hub rather than receive an arbitrary product paywall.
- `trashnavi`: **336 impressions / 3 clicks / average position 7.93**, plus 11 GA4 sessions. Search demand is already near first-page territory and disposal intent has a clear commercial next action.
- `json2mermaid`: only 13 impressions, but **4 clicks / 30.8% CTR / average position 3.00**. The scale is small, yet query-page fit is exceptionally strong and the tool has an obvious professional export/batch path.
- `size-converter`: **139 impressions / 4 clicks** shows general converter demand, but conversion intent itself is weakly commercial.
- `codex-work-os`, `ui-atlas`, `product-founder-os`, and `release-guardian` show useful early search/usage signals and are better candidates for professional workflow monetization than generic commerce blocks.

## Common Pro blocker — do not ignore

`billing/success.html` currently says that checkout completion does **not** activate Pro by URL and that entitlement verification / grant is still pending. GA4 also shows visits to `/billing/success`, `/billing/cancel`, and `/tools/command-safety-checker/pro`, but the 90-day report has `keyEvents=0` and `totalRevenue=0`.

Therefore:

- existing Pro preview/report code may continue to exist;
- **new Pro rollouts must not be treated as commercially complete until purchase → verified entitlement → tool unlock works end to end**;
- Wave 1 Pro specifications may be implemented behind the same gate only after the entitlement foundation is closed;
- affiliate/SEO Wave 1 work does not depend on that blocker.

## Totals

| Primary decision | Tools |
| --- | ---: |
| Common Pro primary | 42 |
| Affiliate / performance primary | 13 |
| AdSense + donation + SEO primary | 26 |
| Hold until product completion | 5 |
| **Total, excluding ManualFinder** | **86** |

`42 + 13 + 26 + 5 = 86`. Every non-ManualFinder tool is listed exactly once below.

## A. Common Pro primary — 42

| Tool | Priority | 90-day signal | Analysis / paid boundary |
| --- | --- | --- | --- |
| `ai-interaction-atlas` | W3/W4 | No strong signal yet | Professional comparison/reference workflow can support saved comparisons, richer exports and larger working sets; current demand is too weak for first-wave work. |
| `ai-project-pack` | W3/W4 | GA4 3 sessions | Natural paid boundary is multi-project packs, saved templates and export; current signal is small. |
| `analytics-privacy-kit` | W3/W4 | GSC 22 imp | Audit/report workflow has a credible multi-site and export delta; search demand is still immature. |
| `api-key-token-redactor` | W3/W4 | Weak signal | Local redaction stays free; batch logs, custom rule sets and large-file workflow are plausible paid deltas. |
| `ats-paste-doctor` | W3/W4 | GA4 3 sessions | Job-search intent has commercial value, but comparison/history/export is a cleaner product-level Pro path than generic affiliate stuffing. |
| `codex-product-shipping-playbooks` | W3/W4 | GA4 3 sessions | Workflow packs and reusable project outputs create paid value; present traffic is small. |
| `codex-usage-forecaster` | W3/W4 | Weak signal | Scenario comparison/history is a plausible Pro delta, but observed demand is not yet strong. |
| `codex-work-os` | W2 | GA4 7; GSC 41 imp / pos 10.76 | Existing search exposure plus workflow nature makes saved projects, gates, exports and multi-workflow support a credible Pro product. |
| `cold-email-requirement-checker` | W3/W4 | Weak signal | Compliance review can support batch review and report export; defer until demand is proven. |
| `command-safety-checker` | **W1** | GA4 4 + 2 Pro-page sessions | Free safety checking must remain open; existing Pro report/export surface already exists, but entitlement grant is not production-complete. |
| `contract-cleaner` | W2 | GA4 1 | Longer documents, batch handling and export can be paid without breaking the free cleanup utility. |
| `contract-risk-highlighter` | W2 | GSC pos 4.33 on 3 imp | High-intent business/legal-adjacent workflow supports richer rule packs and report export; current impression count is small. |
| `csv-tidy` | W3/W4 | No strong signal yet | Batch scale, reusable cleanup recipes and larger files form a clear paid boundary. |
| `design-request-builder` | W3/W4 | GSC 56 imp / pos 47.34 | Saved briefs/templates/export can be paid, but weak search position means acquisition work should precede monetization work. |
| `image-redact` | W3/W4 | GA4 2 | Core single-image local redaction stays free; batch/presets/multi-image workflow can be paid. |
| `incident-update-generator` | W3/W4 | GA4 2 | Reusable incident templates/history/export fit Pro, but usage is not yet proven. |
| `json-repair` | W3/W4 | GA4 2 | Basic repair remains free; batch, diff, large payload handling and history can be Pro. |
| `json2mermaid` | **W1** | GSC 13 imp / 4 clicks / CTR 30.8% / pos 3.00 | Very strong search fit. Theme/export/batch/large-JSON workflow provides a concrete paid delta. |
| `log-formatter` | W2 | GA4 5 | Actual usage signal plus developer workflow. Large logs, presets, saved parsing rules and export can justify Pro. |
| `logistics-compliance-kit-jp` | **W1** | GA4 3 / GSC pos 7.50 | Business-intent utility with an existing Pro surface. Detailed reports, saved cases and document packs fit paid use, subject to entitlement completion. |
| `lp-skeleton-generator` | W3/W4 | GA4 2 | Reusable templates, variants and export fit Pro; not a first-wave acquisition winner. |
| `membership-offer-builder` | W3/W4 | GA4 1 | Offer variants, saved configurations and export are a paid workflow, but current demand is low. |
| `microtool-launch-checklist` | W3/W4 | Weak signal | Project persistence and detailed launch audit can be Pro after the product contract is firm. |
| `minutes-to-ops` | W3/W4 | Minimal search signal | Meeting-to-action workflow supports export/integrations later; keep initial utility free and observe demand. |
| `money-template-checker` | W3/W4 | Minimal signal | Advanced templates/reporting may justify Pro; low evidence means defer. |
| `newsletter-kit-generator` | W3/W4 | GSC 40 imp / pos 61.38 | Saved newsletter systems, variants and export can be Pro, but poor current ranking calls for SEO first. |
| `niche-job-starter-kit` | W3/W4 | GA4 2 | This is offer/workflow planning rather than a job-board search page; paid project packaging is more natural than generic recruitment affiliate links. |
| `notion-form-design-kit` | W3/W4 | GSC 14 imp / pos 63.36 | Schema/export/reusable form plans can be Pro; current search position is weak. |
| `og-image-maker` | W3/W4 | GA4 2 | Free single-image output stays useful; high-resolution/batch/brand presets create a clean paid delta. |
| `ops-weekly-report-generator` | W3/W4 | GA4 3 / GSC pos 5.67 on 3 imp | Recurring report workflow naturally supports saved templates/history/export. |
| `outsource-spec-generator` | W3/W4 | GA4 3 | Saved client/project specs, richer templates and export are plausible paid features; demand is weak. |
| `pdf-page-tools-mini` | W3/W4 | GA4 usage-page 3 | Basic page operations stay free; larger files, batch documents and advanced export can be paid. |
| `pdf2csv-local` | W3/W4 | GA4 1 | Local privacy-preserving basic conversion remains free; multi-file/large-table/advanced extraction can be paid. |
| `product-founder-os` | W2 | GA4 7 / GSC 13 imp / pos 7.54 | Observed usage and good search position plus persistent project workflow make this a credible Pro target. |
| `release-guardian` | W2 | GA4 3 / GSC 29 imp / pos 12.17 | Developer release audit can monetize saved projects, history, team-ready reports and export. |
| `rename-wizard` | W3/W4 | GA4 3 | Core rename planning stays free; larger batches, reusable presets and reversible manifests can be paid. |
| `screenshot-stitcher` | W2 | GA4 8 / GSC 48 imp | Existing usage signal. Free small stitch remains; large batches/high resolution/PDF and presets fit Pro. |
| `sponsor-page-builder` | W3/W4 | GA4 2 | Saved sponsor tiers/templates/export fit Pro; current demand is low. |
| `sql-db-risk-checker` | W3/W4 | GA4 1 | Basic local safety check stays free; larger batches, advanced rules and audit report can be paid. |
| `ui-atlas` | W2 | GA4 3 / GSC 42 imp / pos 6.74 | Good search position; richer pattern library, saved comparisons and exports can become a professional Pro surface. |
| `url-title-collector` | W3/W4 | GA4 2 | Bulk URL limits, CSV/export and saved jobs create a paid boundary. |
| `webp-avif-converter` | W3/W4 | Minimal signal | Free single-image conversion stays useful; batch/high-resolution/presets can be paid. |

## B. Affiliate / performance primary — 13

Affiliate means a **contextual next-action block after the core result**, using only verified partner programs and identifiers. It does not mean inserting unrelated product grids.

| Tool | Priority | 90-day signal | Analysis / commerce fit |
| --- | --- | --- | --- |
| `construction-tools-atlas` | W2 | GA4 5 | Reference intent is close to a real purchase decision; contextual tool/PPE/consumable commerce is more natural than a paywall. |
| `cosmetic-ingredient-checker-lite` | **W1** | GA4 2 / GSC 17 imp / pos 8.88 | Ingredient checking often precedes product comparison. Keep interpretation neutral; use product-discovery commerce rather than safety claims. |
| `cover-letter-lite` | W2 | GA4 2 | Application workflow can lead to career services/job products, but only verified relevant partner offers should be used. |
| `dry-meter` | W2 | GA4 1 / GSC pos 9.86 | Dryness assessment naturally leads to humidifier/dehumidifier/hygrometer purchases. |
| `form-tool-selector` | W2 | GA4 6 | The output is a software selection decision, making verified SaaS referral links a direct next step. |
| `inci-fastscan` | **W1** | GA4 5 | Ingredient scan is close to cosmetics comparison/purchase; share the same neutral commerce model as Cosmetic Ingredient Checker. |
| `laundry-code-decode` | W2 | GA4 7 | Care-label interpretation can lead to care products/accessories without gating the free decode. |
| `light-check` | W2 | GA4 6 | Lighting assessment directly leads to lamps/bulbs/light meters; commerce is contextual. |
| `moving-checklist-generator` | **W1** | GA4 2 | Moving preparation precedes movers, disposal and buyback services; performance offers can be relevant after the checklist result. |
| `moving-lease-final-check` | **W1** | GA4 2 / GSC pos 7.00 | Move-out intent is commercially strong; movers/disposal/buyback services are a natural post-result next action. |
| `pages-deploy-guide` | W2 | Minimal signal | A deployment guide can refer to verified hosting/domain products when a relevant program exists; do not fabricate programs. |
| `trashnavi` | **W1** | GA4 11 / GSC 336 imp / 3 clicks / pos 7.93 | Strong search exposure and first-page average position. Disposal intent has a direct next action in buyback, collection or moving services. |
| `wifi-meter` | W2 | GA4 2 | Connectivity diagnosis can lead to router/mesh/repeater purchases; commerce should follow the diagnostic result. |

## C. AdSense + donation + SEO primary — 26

These tools stay useful and broadly accessible. The optimization objective is search acquisition, repeat/related-tool use, and baseline monetization rather than inventing a weak paywall.

| Tool | Priority | 90-day signal | Analysis |
| --- | --- | --- | --- |
| `color-replace` | Observe/SEO | GA4 3 / GSC 21 imp | Single-purpose image operation has weak paid differentiation; preserve free utility and baseline ads/donation. |
| `exif-cleaner-mini` | Observe/SEO | Weak signal | Privacy cleanup should remain frictionless; paywall value is weak. |
| `filetype-sniffer` | Observe/SEO | GA4 7 | Single-file identification has useful free value but little commercial next action. |
| `growth-log-template-generator` | Observe/SEO | GSC pos 5.43 on 7 imp | Search position is encouraging but commercial intent is weak; build organic demand first. |
| `habit-plan-generator` | Observe/SEO | GA4 1 | Generic planning competes with broad AI assistants; no convincing paid/commerce edge yet. |
| `image-compression-inspector` | Observe/SEO | GSC 1 imp / pos 3 | Current search evidence is too small to justify monetization-specific development. |
| `jp-postal-lite` | Observe/SEO | GSC 38 imp / pos 26.82 | Address/postal intent is informational and does not naturally imply a purchase. |
| `kanji-modernizer` | **W1 cluster** | GA4 25 | Meaningful usage belongs to the old-kanji acquisition cluster; monetize through ads/donation and internal continuation, not forced Pro. |
| `linebreak-doctor` | Observe/SEO | GA4 1 | Simple text cleanup is commodity utility; keep frictionless. |
| `message-generator` | Observe/SEO | GA4 2 | Generic text generation has weak defensibility and purchase intent. |
| `metadatasnap` | Observe/SEO | Weak signal | Metadata inspection is a small privacy utility; free access and donation are a better fit. |
| `mini-game-utility` | Observe/SEO | GA4 2 | Intent and commercial path are not demonstrated. |
| `motion-atlas` | Observe/SEO | GA4 8 | Reference/analysis usage is better suited to content growth and ads until a professional paid workflow is proven. |
| `name-old-kanji-checker` | **W1 cluster** | GA4 1 | Part of the old-kanji search cluster; internal continuation is more valuable than a paywall. |
| `old-document-kanji-highlighter` | **W1 cluster** | GA4 2 / GSC pos 6.33 | Reference/research intent belongs to the old-kanji cluster; keep free and route to related kanji utilities. |
| `old-kanji-reference` | **W1 cluster** | GA4 462 / GSC 344 imp / 5 clicks | Largest observed usage by far. It is an acquisition/retention engine, but search intent is reference-oriented rather than transactional. |
| `place-old-kanji-checker` | **W1 cluster** | GA4 1 / GSC 1 click / 6 imp | Old-kanji/place-name reference intent; keep free and strengthen cluster routing. |
| `redirect-unwrapper` | Observe/SEO | GA4 18; usage 44 imp / pos 5.11 | Actual utility use and strong usage-page ranking, but the task is single-shot and not naturally transactional. |
| `size-converter` | Observe/SEO | GA4 3 / GSC 139 imp / 4 clicks | Broad converter search demand exists, but user intent is simple conversion; SEO + baseline monetization fits. |
| `sukima-baito-income` | Observe/SEO | GA4 1 | Finance/tax-adjacent intent requires caution; evidence does not yet justify aggressive offers. |
| `tiny-audio-meter` | Observe/SEO | GA4 19 | Real usage signal exists, but commerce intent is not established enough for primary affiliate treatment. |
| `unicode-kanji-checker` | **W1 cluster** | GA4 1 | Technical old-kanji reference function should reinforce the cluster rather than gate access. |
| `unitmaster` | Observe/SEO | GA4 1 | Generic unit conversion is best treated as SEO/ads utility. |
| `variant-kanji-compare` | **W1 cluster** | GA4 3 / GSC 1 click / 11 imp | Reference intent supports old-kanji cluster depth; paid differentiation is weak. |
| `vibe-lexicon` | Observe/SEO | Weak signal | Reference/writing intent is weakly transactional. |
| `weatherdiff` | Observe/SEO | How-to GSC 9 imp / 3 clicks / pos 4.33 | Search fit exists on how-to content, but comparison intent itself is informational. |

## D. Hold until product completion — 5

| Tool | Priority | Reason to hold |
| --- | --- | --- |
| `earth-alerts` | Hold | Repository describes it as coming soon; do not monetize an unfinished product. |
| `earth-timeseries` | Hold | Repository describes it as coming soon; do not monetize an unfinished product. |
| `earth-map-suite` | Hold | Current product positioning is an experimental entry point; define the finished utility first. |
| `old-kanji-ocr-scanner` | Hold | Current description is an OCR entry/preparation flow, not a finished OCR product. |
| `pattern-atlas` | Hold | Current title/positioning is still a mock; finish product contract first. |

## Wave sequencing

### Wave 1

Seven systems, detailed in `MONETIZATION_WAVE1.md`:

1. TrashNavi — performance/affiliate.
2. JSON to Mermaid — Common Pro after entitlement foundation.
3. Logistics Compliance Kit JP — Common Pro after entitlement foundation.
4. Cosmetic Ingredient Checker Lite + INCI FastScan — shared commerce model.
5. Moving Checklist Generator + Moving Lease Final Check — shared moving/disposal service model.
6. Command Safety Checker — audit/finish existing Pro purchase-to-entitlement path before scaling.
7. Old-kanji cluster — SEO/ads/donation/internal continuation, centered on Old Kanji Reference.

### Wave 2

- Pro: Codex Work OS, Product Founder OS, Release Guardian, UI Atlas, Screenshot Stitcher, Log Formatter, Contract Cleaner / Risk Highlighter.
- Affiliate: Construction Tools Atlas, Dry Meter, Light Check, Laundry Code Decode, Wi-Fi Meter, plus verified SaaS/career offers only where relevant.

### Wave 3 / 4

Batch/export Pro utilities and lower-signal generator/template tools move only after Wave 1 measurement establishes that users reach the relevant monetization surfaces.

## Guardrails

- Never remove the useful free core merely to manufacture a Pro tier.
- Never represent affiliate products/services as official, required, safest, or medically/legal/financially guaranteed.
- Do not insert affiliate calls before the tool has delivered its primary result unless a later per-tool implementation spec explicitly justifies it.
- Do not invent partner availability, payout, pricing, merchant IDs, or product inventories.
- Do not monetize mock/coming-soon pages as finished products.
- Old-kanji cluster work must prioritize search/reference usefulness and related-tool continuation rather than forced commerce.
- Revisit this master with the same four-signal method after enough new GSC/GA4 data accumulates; do not reshuffle solely because a single page had a few sessions.
