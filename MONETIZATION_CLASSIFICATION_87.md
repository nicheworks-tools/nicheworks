# NicheWorks 87-tool Monetization Classification

Status: **canonical registered-tool monetization ledger**  
Updated: 2026-09-13  
Machine-readable source: `MONETIZATION_CLASSIFICATION_87.json`

## 1. Purpose

This file classifies every tool currently registered in `tools/tools-index.json` exactly once for its primary monetization path.

It converts the earlier 86-tool monetization analysis plus the separate ManualFinder monetization workstream into one complete 87-tool ledger.

This classification is based on monetization/product fit and the canonical per-tool specifications. **Historical Pro code is not classification authority.** A tool may contain old Pro code while belonging to Affiliate or Ads/Donation, and a Pro-bundle candidate may have no current paid runtime at all.

## 2. Totals

| Class | Count | Meaning |
| --- | ---: | --- |
| `PRO_BUNDLE` | 42 | Approved member of the future shared `nicheworks.pro` one-time bundle; exact Free/Pro operation boundary still must be frozen before live migration. |
| `STANDALONE_PRO` | 0 | No current registered tool is assigned a separate paid product in this 87-tool ledger. Separate billing products may exist outside this denominator. |
| `AFFILIATE` | 14 | Core result remains free; verified contextual commercial next actions may follow the result. |
| `ADS_DONATION` | 26 | Primarily free acquisition/reference utility using baseline ads/donation/SEO/internal continuation. |
| `FREE` | 0 | No tool currently needs a separate plain-Free primary classification; this class remains available for future deliberate use. |
| `HOLD` | 5 | Product incomplete or insufficiently defined for active monetization rollout. |
| **Total** | **87** | Must match `tools/tools-index.json`. |

## 3. `PRO_BUNDLE` — 42

All tools below are approved members of the future shared NicheWorks Pro product `nicheworks.pro` at the commercial-classification level. This does **not** mean their current legacy/staged gate is live-ready, and it does not authorize moving existing Free features behind Pro.

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

### Important boundary state

The bundle membership is now fixed, but the exact Free/Pro operation boundary is **not yet frozen for all 42**. The next billing phase must inspect current runtime + canonical spec for every member and write the additive Pro delta before live migration.

## 4. `AFFILIATE` — 14

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
- `trashnavi`
- `wifi-meter`

ManualFinder was intentionally excluded from the earlier 86-tool monetization master because its monetization implementation was already proceeding separately. It is now explicitly included here as `AFFILIATE` and remains the suite's reference affiliate workstream.

The existence of old shared-Pro code in an Affiliate-classified tool does not change this classification. Such code is legacy cleanup/migration work, not evidence that the tool belongs in the bundle.

## 5. `ADS_DONATION` — 26

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

These tools stay primarily free. A historic/staged Pro surface does not override this classification unless a future explicit re-review changes the ledger.

## 6. `HOLD` — 5

- `earth-alerts`
- `earth-map-suite`
- `earth-timeseries`
- `old-kanji-ocr-scanner`
- `pattern-atlas`

Do not add active paid/affiliate pressure merely to complete monetization coverage. Finish the underlying product contract first.

## 7. `STANDALONE_PRO` and `FREE`

No currently registered tool is assigned to either class in this ledger.

This does **not** mean standalone products do not exist. `okj.toolkit_pro` and `reconcile.pro_v1` are billing-product concepts/configuration outside this registered-tool classification denominator and remain isolated from `nicheworks.pro` unless explicitly changed later.

## 8. Rules this ledger fixes

1. Every registered tool is classified exactly once.
2. `PRO_BUNDLE` membership is based on product fit, not legacy Pro implementation.
3. Bundle product authority is future server-verified `nicheworks.pro`, not legacy browser/local `nicheworks_pro`.
4. Affiliate and Ads/Donation tools do not become Pro merely because old Pro code exists.
5. Existing Free value is preserved until a separately reviewed Free/Pro boundary says otherwise.
6. No price, Stripe Product/Price, partner URL, affiliate ID, or entitlement state is created by this classification.

## 9. Next phase

The next phase is restricted to the 42 `PRO_BUNDLE` members:

1. inspect current runtime and canonical specification;
2. list the exact Free operations that must remain Free;
3. list the exact additive Pro operations;
4. distinguish existing live legacy paid behavior from staged/non-live concepts;
5. mark any tool whose Pro delta still needs product design;
6. establish the first live migration wave, starting with Command Safety Checker as the reference;
7. only after the boundary ledger is complete, decide the `nicheworks.pro` price and Stripe commercial configuration.
