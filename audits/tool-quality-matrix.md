# NicheWorks tool quality matrix

This is the human-readable rendering of `audits/tool-quality-matrix.json`. Missing recommended help or behavior tests are visible but do not independently force `FIX`. Final-state precedence is `BLOCKED` → `NEEDS_DECISION` → `FIX` → `PASS`.

- Registered tools: **87**
- Specifications: **87**
- Matrix records: **87**
- PASS: **15**
- FIX: **1**
- BLOCKED: **0**
- NEEDS_DECISION: **71**
- Behavior-level tests missing: **85**
- Real responsive defects found: **0**
- Hard common-spec violations: **8 tools**
- Recommendation-only documentation gaps: **28 tools**
- Tools with unresolved product decisions: **71**
- Previous false `FIX` findings removed: **76**

| Tool | Layout | Usage | FAQ | Behavior test | Hard gaps | Decisions | State |
|---|---|---|---|---|---:|---:|---|
| [ai-interaction-atlas](../docs/tools/ai-interaction-atlas.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 0 | **PASS** |
| [ai-project-pack](../docs/tools/ai-project-pack.md) | desktop-wide | optional-absent | optional-present | behavior-test-missing | 0 | 0 | **PASS** |
| [analytics-privacy-kit](../docs/tools/analytics-privacy-kit.md) | mobile-oriented | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [api-key-token-redactor](../docs/tools/api-key-token-redactor.md) | desktop-wide | recommended-and-present | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [ats-paste-doctor](../docs/tools/ats-paste-doctor.md) | desktop-wide | optional-present | optional-present | behavior-test-missing | 1 | 1 | **NEEDS_DECISION** |
| [codex-product-shipping-playbooks](../docs/tools/codex-product-shipping-playbooks.md) | desktop-wide | optional-absent | optional-present | behavior-test-missing | 0 | 0 | **PASS** |
| [codex-usage-forecaster](../docs/tools/codex-usage-forecaster.md) | desktop-wide | optional-present | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [codex-work-os](../docs/tools/codex-work-os.md) | desktop-wide | optional-absent | optional-present | behavior-test-missing | 0 | 0 | **PASS** |
| [cold-email-requirement-checker](../docs/tools/cold-email-requirement-checker.md) | mobile-oriented | recommended-and-present | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [color-replace](../docs/tools/color-replace.md) | desktop-wide | recommended-and-missing | optional-present | behavior-test-missing | 0 | 3 | **NEEDS_DECISION** |
| [command-safety-checker](../docs/tools/command-safety-checker.md) | desktop-wide | recommended-and-present | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [construction-tools-atlas](../docs/tools/construction-tools-atlas.md) | desktop-wide | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 3 | **NEEDS_DECISION** |
| [contract-cleaner](../docs/tools/contract-cleaner.md) | desktop-wide | recommended-and-missing | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [contract-risk-highlighter](../docs/tools/contract-risk-highlighter.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 0 | **PASS** |
| [cosmetic-ingredient-checker-lite](../docs/tools/cosmetic-ingredient-checker-lite.md) | mobile-oriented | recommended-and-missing | recommended-and-missing | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [cover-letter-lite](../docs/tools/cover-letter-lite.md) | mobile-oriented | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [csv-tidy](../docs/tools/csv-tidy.md) | desktop-wide | optional-present | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [design-request-builder](../docs/tools/design-request-builder.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [dry-meter](../docs/tools/dry-meter.md) | desktop-wide | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 3 | **NEEDS_DECISION** |
| [earth-alerts](../docs/tools/earth-alerts.md) | mobile-oriented | not-applicable | not-applicable | behavior-test-missing | 0 | 0 | **PASS** |
| [earth-map-suite](../docs/tools/earth-map-suite.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [earth-timeseries](../docs/tools/earth-timeseries.md) | mobile-oriented | not-applicable | not-applicable | behavior-test-missing | 0 | 0 | **PASS** |
| [exif-cleaner-mini](../docs/tools/exif-cleaner-mini.md) | mobile-oriented | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [filetype-sniffer](../docs/tools/filetype-sniffer.md) | mobile-oriented | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [form-tool-selector](../docs/tools/form-tool-selector.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [growth-log-template-generator](../docs/tools/growth-log-template-generator.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [habit-plan-generator](../docs/tools/habit-plan-generator.md) | mobile-oriented | optional-absent | optional-absent | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [image-compression-inspector](../docs/tools/image-compression-inspector.md) | desktop-wide | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [image-redact](../docs/tools/image-redact.md) | desktop-wide | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 3 | **NEEDS_DECISION** |
| [inci-fastscan](../docs/tools/inci-fastscan.md) | desktop-wide | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [incident-update-generator](../docs/tools/incident-update-generator.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [jp-postal-lite](../docs/tools/jp-postal-lite.md) | mobile-oriented | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [json-repair](../docs/tools/json-repair.md) | desktop-wide | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [json2mermaid](../docs/tools/json2mermaid.md) | desktop-wide | optional-present | optional-present | behavior-test-present | 0 | 1 | **NEEDS_DECISION** |
| [kanji-modernizer](../docs/tools/kanji-modernizer.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [laundry-code-decode](../docs/tools/laundry-code-decode.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [light-check](../docs/tools/light-check.md) | mobile-oriented | optional-present | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [linebreak-doctor](../docs/tools/linebreak-doctor.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 0 | **PASS** |
| [log-formatter](../docs/tools/log-formatter.md) | desktop-wide | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [logistics-compliance-kit-jp](../docs/tools/logistics-compliance-kit-jp.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [lp-skeleton-generator](../docs/tools/lp-skeleton-generator.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [manual-finder](../docs/tools/manual-finder.md) | desktop-wide | recommended-and-present | recommended-and-missing | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [membership-offer-builder](../docs/tools/membership-offer-builder.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [message-generator](../docs/tools/message-generator.md) | mobile-oriented | optional-absent | optional-absent | behavior-test-missing | 1 | 2 | **NEEDS_DECISION** |
| [metadatasnap](../docs/tools/metadatasnap.md) | mobile-oriented | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 0 | **PASS** |
| [microtool-launch-checklist](../docs/tools/microtool-launch-checklist.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [mini-game-utility](../docs/tools/mini-game-utility.md) | mobile-oriented | optional-absent | optional-absent | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [minutes-to-ops](../docs/tools/minutes-to-ops.md) | desktop-wide | optional-present | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [money-template-checker](../docs/tools/money-template-checker.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [motion-atlas](../docs/tools/motion-atlas.md) | desktop-wide | recommended-and-present | recommended-and-missing | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [moving-checklist-generator](../docs/tools/moving-checklist-generator.md) | mobile-oriented | optional-present | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [moving-lease-final-check](../docs/tools/moving-lease-final-check.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [name-old-kanji-checker](../docs/tools/name-old-kanji-checker.md) | mobile-oriented | recommended-and-missing | recommended-and-missing | behavior-test-missing | 0 | 0 | **PASS** |
| [newsletter-kit-generator](../docs/tools/newsletter-kit-generator.md) | mobile-oriented | optional-absent | optional-absent | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [niche-job-starter-kit](../docs/tools/niche-job-starter-kit.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [notion-form-design-kit](../docs/tools/notion-form-design-kit.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [og-image-maker](../docs/tools/og-image-maker.md) | desktop-wide | recommended-and-missing | recommended-and-missing | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [old-document-kanji-highlighter](../docs/tools/old-document-kanji-highlighter.md) | desktop-wide | recommended-and-missing | recommended-and-missing | behavior-test-missing | 1 | 2 | **NEEDS_DECISION** |
| [old-kanji-ocr-scanner](../docs/tools/old-kanji-ocr-scanner.md) | mobile-oriented | recommended-and-missing | recommended-and-missing | behavior-test-missing | 1 | 1 | **NEEDS_DECISION** |
| [old-kanji-reference](../docs/tools/old-kanji-reference.md) | desktop-wide | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 0 | **PASS** |
| [ops-weekly-report-generator](../docs/tools/ops-weekly-report-generator.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [outsource-spec-generator](../docs/tools/outsource-spec-generator.md) | desktop-wide | optional-absent | optional-present | behavior-test-missing | 0 | 0 | **PASS** |
| [pages-deploy-guide](../docs/tools/pages-deploy-guide.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [pattern-atlas](../docs/tools/pattern-atlas.md) | desktop-wide | optional-present | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [pdf-page-tools-mini](../docs/tools/pdf-page-tools-mini.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [pdf2csv-local](../docs/tools/pdf2csv-local.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 0 | **PASS** |
| [place-old-kanji-checker](../docs/tools/place-old-kanji-checker.md) | mobile-oriented | recommended-and-missing | recommended-and-missing | behavior-test-missing | 1 | 2 | **NEEDS_DECISION** |
| [product-founder-os](../docs/tools/product-founder-os.md) | desktop-wide | optional-absent | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [redirect-unwrapper](../docs/tools/redirect-unwrapper.md) | mobile-oriented | recommended-and-present | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [release-guardian](../docs/tools/release-guardian.md) | desktop-wide | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [rename-wizard](../docs/tools/rename-wizard.md) | desktop-wide | recommended-and-missing | optional-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [screenshot-stitcher](../docs/tools/screenshot-stitcher.md) | desktop-wide | recommended-and-present | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [size-converter](../docs/tools/size-converter.md) | mobile-oriented | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 0 | **PASS** |
| [sponsor-page-builder](../docs/tools/sponsor-page-builder.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [sql-db-risk-checker](../docs/tools/sql-db-risk-checker.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-present | 0 | 1 | **NEEDS_DECISION** |
| [sukima-baito-income](../docs/tools/sukima-baito-income.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [tiny-audio-meter](../docs/tools/tiny-audio-meter.md) | mobile-oriented | recommended-and-missing | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [trashnavi](../docs/tools/trashnavi.md) | desktop-wide | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [ui-atlas](../docs/tools/ui-atlas.md) | desktop-wide | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [unicode-kanji-checker](../docs/tools/unicode-kanji-checker.md) | desktop-wide | recommended-and-missing | recommended-and-missing | behavior-test-missing | 1 | 1 | **NEEDS_DECISION** |
| [unitmaster](../docs/tools/unitmaster.md) | desktop-wide | recommended-and-missing | recommended-and-present | behavior-test-missing | 0 | 2 | **NEEDS_DECISION** |
| [url-title-collector](../docs/tools/url-title-collector.md) | mobile-oriented | recommended-and-present | recommended-and-missing | behavior-test-missing | 1 | 0 | **FIX** |
| [variant-kanji-compare](../docs/tools/variant-kanji-compare.md) | desktop-wide | recommended-and-missing | recommended-and-missing | behavior-test-missing | 1 | 2 | **NEEDS_DECISION** |
| [vibe-lexicon](../docs/tools/vibe-lexicon.md) | desktop-wide | optional-present | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [weatherdiff](../docs/tools/weatherdiff.md) | mobile-oriented | recommended-and-present | recommended-and-present | behavior-test-missing | 0 | 3 | **NEEDS_DECISION** |
| [webp-avif-converter](../docs/tools/webp-avif-converter.md) | mobile-oriented | recommended-and-present | optional-present | behavior-test-missing | 0 | 1 | **NEEDS_DECISION** |
| [wifi-meter](../docs/tools/wifi-meter.md) | mobile-oriented | optional-present | optional-present | behavior-test-missing | 0 | 0 | **PASS** |

## Status semantics

- **PASS:** no hard compliance gap and no unresolved product decision; recommendations and missing behavior tests remain separately visible.
- **FIX:** at least one hard implementation/compliance gap and no higher-precedence unresolved decision.
- **BLOCKED:** registered implementation evidence is unavailable.
- **NEEDS_DECISION:** at least one exact contract decision remains unresolved, whether or not implementation fixes are also recorded.

## Recalculated Wave 1 recommendation

The corrected Wave 1 is the mandatory donation/support shared-root-cause set: `ats-paste-doctor`, `message-generator`, `old-document-kanji-highlighter`, `old-kanji-ocr-scanner`, `place-old-kanji-checker`, `unicode-kanji-checker`, `url-title-collector`, `variant-kanji-compare`. These **8 tools** have confirmed hard common-spec gaps. Apply a narrowly scoped support-block repair while preserving each tool’s language, layout, analytics, advertising identifiers, and runtime behavior. Optional usage/FAQ creation is expressly excluded from Wave 1 prioritization.
