# Old Kanji Amazon Compatibility Contract

Status: dormant compatibility contract governed by `MONETIZATION_CLASSIFICATION.json`.

## Canonical monetization boundary

The current monetization SSOT classifies:

- `old-kanji-reference` as `ADS_DONATION`.
- `old-kanji-ocr-scanner` as `HOLD`.

Neither tool is in the canonical `AFFILIATE` class. Therefore Amazon affiliate runtime must remain fail-closed on both tools.

The historical Amazon helper/config/UI files may remain temporarily as compatibility code while the tool surfaces are cleaned up, but they must not provide a live outbound Amazon destination or an enabled affiliate configuration.

## Required dormant state

For both Old Kanji Reference and Old Kanji OCR Scanner:

- `affiliate-config.js` must set `enabled: false`.
- `trackingId` must be empty.
- `targets` and `searches` must be empty objects.
- No `amazon.co.jp`, `amzn.to`, or Associates `tag=` destination may remain in the production config.
- The shared Amazon helper must render no CTA and no disclosure when the config is disabled.
- Searched kanji, OCR text, image names, document text, names, addresses, or other user-derived values must never enter affiliate analytics or outbound URLs.

## Historical UI compatibility

The current HTML and tool-owned affiliate modules can remain loaded only as dormant compatibility wiring. They must fail closed because the production config is disabled. This preserves layout/runtime stability while commercial cleanup is separated from tool behavior changes.

The existing placement identifiers remain non-authoritative compatibility metadata:

- Old Kanji Reference: `reference_resources`.
- Old Kanji OCR Scanner: `ocr_resources`.

These identifiers do not authorize affiliate activation.

## Non-expansion rule

No Amazon activation is authorized for any Old Kanji cluster tool unless that tool is first moved into the canonical `AFFILIATE` class through an explicit monetization decision.

This includes:

- Kanji Modernizer
- Old Document Kanji Highlighter
- Unicode Kanji Checker
- Variant Kanji Compare
- Place Old Kanji Checker
- Name Old Kanji Checker
- Old Kanji Reference
- Old Kanji OCR Scanner

Cluster membership, historical implementation, or the presence of dormant helper code is not sufficient authority to activate Amazon links.

## Analytics boundary

The shared Amazon helper may support the canonical `affiliate_outbound` event for tools that are legitimately in the `AFFILIATE` class. Old Kanji Reference and Old Kanji OCR Scanner must emit no Amazon outbound event while their configs are disabled.

The Old Kanji cluster analytics module must not implement a second tool-owned affiliate click payload.
