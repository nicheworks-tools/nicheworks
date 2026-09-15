# ManualFinder analytics contract

## Purpose

Measure whether ManualFinder visitors actually use the directory and leave through an official manual/support result, while keeping user-entered search text out of analytics.

## GA4 events

### `manualfinder_search`

Emitted after a settled text filter, category change, or quick-search action.

Parameters:
- `tool`: fixed `manual-finder`
- `language`: `ja` or `en`
- `method`: `text`, `category`, `quick_brand`, or `quick_category`
- `outcome`: `results`, `no_results`, or `unknown`
- `result_bucket`: `0`, `1-5`, `6-20`, `21-50`, `51-100`, `101+`, or `unknown`
- `query_length_bucket`: text search only; `1-3`, `4-7`, `8-15`, or `16+`
- `category`: category-filter searches only
- `preset`: quick-search only; values come from maintained UI buttons

The raw contents of `#searchInput` MUST NOT be sent to GA4.

### `manualfinder_result_click`

Emitted when a user opens an official result link from `.card-links`.

Parameters:
- `tool`
- `language`
- `maker`
- `category`
- `model_level`: `yes` or `no`
- `link_kind`: `primary` or `support`

The model string and destination URL are intentionally not sent, keeping cardinality bounded and avoiding unnecessary URL-level telemetry.

### `manualfinder_pagination`

Emitted when the user moves to the previous/next result page or changes the page size.

Parameters:
- `tool`
- `language`
- `action`: `previous`, `next`, or `page_size`
- `page_size`: only for `page_size`

## Amazon affiliate clicks

Do not duplicate Amazon click telemetry here. `/assets/amazon-affiliate.js` already emits `affiliate_click` with `tool`, `affiliate`, `target`, and `placement` for mounted affiliate links.

## Privacy boundary

Allowed analytics data is limited to maintained catalog/UI metadata and coarse interaction buckets. Do not send:
- raw search text
- manually entered model strings
- arbitrary user input
- destination URLs from result cards

This keeps the implementation aligned with the NicheWorks rule that user input is not sent externally for tracking purposes.
