# Construction Tools Atlas — Revenue Execution v2.3

Status: active execution contract  
Effective: 2026-09-19

## Goal

Move Construction Tools Atlas from a high-quality browser dictionary to a revenue-oriented reference product without weakening the existing content, image, privacy, canonical-identity or affiliate contracts.

The revenue model is deliberately multi-path:

1. organic search landing pages -> AdSense,
2. canonical identification -> maintained Amazon affiliate handoff,
3. comparison / confusion pages -> AdSense + Amazon where eligible,
4. Atlas app retention -> favorites, share and repeat use,
5. OFUSE / Ko-fi support,
6. later, separately reviewed structured-data licensing if demand exists.

Revenue work must not turn the Atlas into thin affiliate pages.

## Current audited baseline

The current public corpus is 870 canonicals.

Core content is complete across all 870 public entries:
- 870 / 870 fallback-independent bilingual core,
- 0 runtime fallback-dependent,
- 0 missing bilingual core entries.

Current commercial/image state:
- 432 active maintained Amazon mappings,
- 42 promoted formal images,
- 47 image-not-required entries,
- 781 required images still awaiting source.

The current intersection produces:
- **33 immediate SEO + commerce-ready canonicals**: 32 with an active Amazon mapping + promoted image, plus 1 with an active Amazon mapping whose image is explicitly not required,
- **399 affiliate-backed image backlog canonicals**: active Amazon mapping + awaiting-source image,
- **10 organic image-ready canonicals**: promoted image without Amazon mapping,
- **382 non-affiliate image backlog canonicals**,
- **46 non-affiliate not-required canonicals**, plus the 1 commerce-ready not-required canonical above.

These groups are computed by `scripts/report-revenue-readiness-v2.3.cjs`. They are not search-volume estimates and are not earnings forecasts.

## Finished product behavior

### Discovery route

A user can arrive from Google/Bing directly on a quality-ready canonical detail page, or open the Atlas and search by:

- Japanese name,
- English name,
- aliases / site slang,
- task,
- material,
- purpose,
- descriptive wording such as “コンクリに穴あける電動のやつ”.

The Atlas identifies the canonical item and preserves the browser-local semantic-search contract.

### Recognition route

Where a formal representative image has been promoted, the user sees the real canonical subject in autocomplete, results, detail, comparison and static detail surfaces.

A missing or ambiguous image is never replaced by a decorative or merely similar picture.

### Understanding route

The selected canonical explains:

- Japanese / English identity,
- definition,
- practical detail,
- key points,
- examples,
- aliases,
- category / task context,
- maintained related or confused-with entries where such relations actually exist.

### Conversion route

Only after canonical identification:

`canonical entry ID -> maintained offer -> Amazon.co.jp`

Raw user search text is never forwarded to Amazon.

The Amazon block is hidden when no maintained mapping exists. No live price, stock, rating, “best”, “official”, compatibility or cheapest-offer claims are introduced.

### Retention route

Users can favorite entries, export/import favorites, deep-link a canonical entry, copy a link and use Web Share where available.

## Execution phases

### R0 — Revenue readiness rail

Implement the machine-readable revenue policy and dynamic readiness report.

No guessed keyword volume, CPC or revenue score is allowed.

### R1 — Static detail publication framework

Create a static detail-page builder that reads the same canonical corpus used by the Atlas.

Only explicit launch-cohort IDs may be emitted.

Each emitted page must contain enough independent value to stand alone:
- bilingual identity,
- substantive definition/detail,
- uses/examples,
- representative promoted image,
- related navigation where maintained,
- canonical link back into the Atlas,
- Amazon CTA only when a maintained mapping exists,
- appropriate disclosure,
- unique title/description/canonical URL,
- structured data appropriate to the page content.

Do not generate 870 thin pages at once.

### R2 — First launch cohort

Publish the current `seo_commerce_ready` cohort first.

At the 2026-09-19 baseline this is 33 canonicals. The report is authoritative for the current count.

### R3 — Comparison / confusion pages

Build only from maintained relationships and manually reviewed pairs.

The target user question is not just “what is X?” but “X vs Y / which one is this / how are they different?”

Comparison pages must not invent compatibility or purchasing claims.

### R4 — Revenue-first image acquisition

After any already-in-progress affiliate image rows are finished, take the next source-acquisition work from `affiliate_image_backlog`.

This means image work is no longer alphabetical completion work. It is tied to an already-maintained commercial destination.

Every image still follows the existing lifecycle:
`awaiting_source -> candidate -> provenance_verified -> subject_verified -> verified -> promoted`.

### R5 — Measurement

The shared Amazon helper already emits the coarse GA4 event `affiliate_outbound`.

Do not emit free-form Atlas search text as analytics parameters.

Once static detail pages have search impressions, later prioritization should use measured data:
- impressions,
- clicks,
- CTR,
- landing page,
- affiliate_outbound rate,
- image-search traffic where relevant.

Search Console data was not available through the connected GSC Wizard during creation of this contract, so no fabricated traffic estimates are embedded here.

### R6 — Scale only what works

Expand from the initial cohort only when pages remain substantive and measurement supports the next wave.

The target is not “870 indexable pages” as a vanity metric. The target is maximum useful traffic and qualified commercial exits while keeping the Atlas trustworthy.

## Current implementation checkpoint

Completed:
1. revenue-readiness rail landed,
2. static detail generator implemented,
3. first commerce-ready cohort emitted,
4. sitemap updated from the generated cohort,
5. audit coverage added so generated pages cannot drift from canonical/image/affiliate evidence.

Current first cohort:
- 33 static detail pages,
- 32 with promoted formal images,
- 1 with explicit image `not_required`,
- 33 / 33 with active maintained Amazon mappings.

Next:
1. merge and publish this static-detail cohort,
2. verify production URLs/indexability after deployment,
3. begin maintained comparison/confusion pages for genuinely reviewed pairs,
4. resume image acquisition from the 399 affiliate-backed awaiting-source canonicals,
5. use measured search and affiliate click data to reorder later waves when available.
