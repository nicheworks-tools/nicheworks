# NicheWorks Monetization Classification

Status: **canonical registered-tool monetization ledger**  
Updated: 2026-09-16  
Machine-readable source: `MONETIZATION_CLASSIFICATION.json`

## Purpose

This file classifies every tool currently registered in `tools/tools-index.json` exactly once for its primary monetization path.

The registry denominator is **88**. Historical `_87` filenames are compatibility-only and are no longer classification authority.

## Totals

| Class | Count | Meaning |
| --- | ---: | --- |
| `PRO_BUNDLE` | 42 | Approved member of the future shared `nicheworks.pro` bundle. |
| `STANDALONE_PRO` | 1 | Separate paid product contract. |
| `AFFILIATE` | 16 | Free core with verified contextual commercial next actions. |
| `ADS_DONATION` | 26 | Free acquisition/reference utility using ads/donation/SEO/internal continuation. |
| `FREE` | 0 | Reserved for deliberate future use. |
| `HOLD` | 3 | Product incomplete or insufficiently defined for active monetization rollout. |
| **Total** | **88** | Must match `tools/tools-index.json`. |

## PRO_BUNDLE — 42

- `ai-interaction-atlas`
- `ai-project-pack`
- `analytics-privacy-kit`
- `api-key-token-redactor`
- `ats-paste-doctor`
- `codex-product-shipping-playbooks`
- `codex-usage-forecaster`
- `codex-work-os`
- `cold-email-requirement-checker`
- `command-safety-checker`
- `contract-cleaner`
- `contract-risk-highlighter`
- `csv-tidy`
- `design-request-builder`
- `image-redact`
- `incident-update-generator`
- `json-repair`
- `json2mermaid`
- `log-formatter`
- `logistics-compliance-kit-jp`
- `lp-skeleton-generator`
- `membership-offer-builder`
- `microtool-launch-checklist`
- `minutes-to-ops`
- `money-template-checker`
- `newsletter-kit-generator`
- `niche-job-starter-kit`
- `notion-form-design-kit`
- `og-image-maker`
- `ops-weekly-report-generator`
- `outsource-spec-generator`
- `pdf-page-tools-mini`
- `pdf2csv-local`
- `product-founder-os`
- `release-guardian`
- `rename-wizard`
- `screenshot-stitcher`
- `sponsor-page-builder`
- `sql-db-risk-checker`
- `ui-atlas`
- `url-title-collector`
- `webp-avif-converter`

## STANDALONE_PRO — 1

- `reconcile`

Reconcile remains separate from the shared `nicheworks.pro` bundle.

## AFFILIATE — 16

- `construction-tools-atlas`
- `cosmetic-ingredient-checker-lite`
- `cover-letter-lite`
- `dry-meter`
- `form-tool-selector`
- `inci-fastscan`
- `laundry-code-decode`
- `light-check`
- `manual-finder`
- `moving-checklist-generator`
- `moving-lease-final-check`
- `pages-deploy-guide`
- `pattern-dictionary`
- `phone-quickcheck`
- `trashnavi`
- `wifi-meter`

Affiliate-class tools are handled in a separate parallel workstream from the non-affiliate 72-tool quality/SEO/revenue program.

## ADS_DONATION — 26

- `color-replace`
- `exif-cleaner-mini`
- `filetype-sniffer`
- `growth-log-template-generator`
- `habit-plan-generator`
- `image-compression-inspector`
- `jp-postal-lite`
- `kanji-modernizer`
- `linebreak-doctor`
- `message-generator`
- `metadatasnap`
- `mini-game-utility`
- `motion-atlas`
- `name-old-kanji-checker`
- `old-document-kanji-highlighter`
- `old-kanji-reference`
- `place-old-kanji-checker`
- `redirect-unwrapper`
- `size-converter`
- `sukima-baito-income`
- `tiny-audio-meter`
- `unicode-kanji-checker`
- `unitmaster`
- `variant-kanji-compare`
- `vibe-lexicon`
- `weatherdiff`

## HOLD — 3

- `earth-map-suite`
- `old-kanji-ocr-scanner`
- `pattern-atlas`

## FREE — 0

No currently registered tool is assigned to `FREE`.

## Classification rules

1. Every registered tool is classified exactly once.
2. The classification denominator must equal the live registry denominator.
3. `PRO_BUNDLE` membership is based on product fit, not legacy Pro implementation.
4. `STANDALONE_PRO` tools remain isolated from the shared bundle unless explicitly changed.
5. Affiliate and Ads/Donation tools do not become Pro merely because old Pro code exists.
6. Existing Free value is preserved until a separately reviewed Free/Pro boundary says otherwise.
7. Price, Stripe Product/Price, partner URL, affiliate ID, or entitlement state is not created by this classification.

## Non-affiliate execution scope

The active non-affiliate workstream is defined by `audits/non-affiliate-scope.json`:

- registry: 88
- excluded Affiliate: 16
- in scope: 72
- in-scope classes: `PRO_BUNDLE`, `STANDALONE_PRO`, `ADS_DONATION`, `HOLD`

Any registry or monetization-class change must keep the classification and execution-scope files synchronized.
