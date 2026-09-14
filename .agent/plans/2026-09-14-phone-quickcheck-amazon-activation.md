# ExecPlan — Phone QuickCheck Amazon activation

## Goal

Activate Amazon Associates purchase handoffs for the existing Phone QuickCheck accessory classes without changing device compatibility logic, device facts, or the core Quick Check flow.

## Scope

In scope:

- reuse `/assets/amazon-affiliate.js` and the NicheWorks Amazon Associates tracking ID already maintained by the repository;
- generate Amazon Japan search URLs only from fixed Phone QuickCheck accessory-class metadata;
- cover every current accessory key in `data/accessories.json`;
- render Amazon-labelled CTAs in both desktop detail and mobile bottom-sheet detail;
- render the Associates disclosure only when affiliate targets are active;
- emit only the common coarse `affiliate_click` event fields;
- add a dedicated affiliate contract check and CI workflow;
- update Phone QuickCheck specifications from launch-disabled wording to the active affiliate contract.

Out of scope:

- no Amazon price, availability, rating, review count, inventory, shipping estimate, or product image ingestion;
- no Amazon scraping;
- no user free-text search term in an Amazon destination;
- no change to phone compatibility calculations or charging facts;
- no per-device hard-coded retail product matrix;
- no new smartphone records in this PR.

## Affiliate model

The page uses the same tagged Amazon Japan search URL format already validated in the NicheWorks ManualFinder affiliate implementation. Phone QuickCheck substitutes only fixed tool-owned accessory search terms such as USB-PD/PPS charger classes, USB-C cable, Qi/Qi2 charger, and 10,000mAh USB-C power bank.

Tracking ID is fixed in configuration and cannot be provided by the user.

Analytics target values stay coarse:

- `cable`
- `wired_charger`
- `wireless_charger`
- `power_bank`

Placement values stay coarse:

- `desktop_detail`
- `mobile_sheet`

## Verification

- every `data/accessories.json` key resolves to exactly one maintained affiliate offer;
- generated URLs are HTTPS `www.amazon.co.jp` search URLs with tracking ID `nicheworks09-22`;
- every CTA label explicitly names Amazon;
- runtime does not read `#searchInput` and does not own a direct `gtag()` payload;
- common helper loads before affiliate config, app runtime loads next, affiliate decoration runs after the app;
- disclosure is rendered through the shared helper;
- desktop and mobile both receive CTAs after detail rendering;
- existing Phone QuickCheck runtime/spec/SEO CI remains green.

## Release gate

Merge only after the dedicated Phone QuickCheck affiliate check and all existing PR checks pass on a head synchronized with current `main`.
