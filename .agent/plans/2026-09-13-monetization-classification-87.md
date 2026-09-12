# ExecPlan: Canonical 87-tool monetization classification

## Goal
Create one machine-auditable monetization classification for every tool currently registered in `tools/tools-index.json`, using the existing monetization evidence plus the canonical 87-tool specification layer merged in #588.

This phase does not implement billing or change any tool runtime. It freezes only the primary monetization class and NicheWorks Pro bundle membership.

## Scope

Files in scope:
- `MONETIZATION_CLASSIFICATION_87.json`
- `MONETIZATION_CLASSIFICATION_87.md`
- `scripts/check-monetization-classification.mjs`
- this ExecPlan

Explicitly out of scope:
- tool runtime or per-tool SPEC changes
- price/currency decisions
- Stripe Product/Price configuration
- `config/billing/products.json`
- D1 schema or purchaser migration
- affiliate partner URLs/IDs
- deployment or workflow changes
- common-spec changes

## Classification model

Every registered tool must appear exactly once as one of:

- `PRO_BUNDLE`
- `STANDALONE_PRO`
- `AFFILIATE`
- `ADS_DONATION`
- `FREE`
- `HOLD`

Current mapping basis:

- the 42 tools already classified as `Common Pro primary` in `MONETIZATION_MASTER.md` become approved `PRO_BUNDLE` members for the future `nicheworks.pro` product;
- the 13 tools already classified as Affiliate/performance remain `AFFILIATE`;
- `manual-finder`, intentionally excluded from the old 86-tool master because its monetization workstream was separate, is added as `AFFILIATE` because it is the explicit affiliate reference implementation/workstream;
- the 26 AdSense + donation + SEO tools become `ADS_DONATION`;
- the 5 incomplete tools remain `HOLD`;
- no currently registered tool is classified `STANDALONE_PRO` or plain `FREE` in this phase.

This mapping is based on monetization fit, not the existence of old Pro code. Historical Pro bridges do not override the classification.

## Validation

The checker must fail when:

- registry total and ledger total differ;
- a registered slug is missing;
- an unregistered slug appears;
- a slug is duplicated;
- an unknown class is used;
- declared counts do not match actual counts;
- a `PRO_BUNDLE` record does not use `productId=nicheworks.pro`;
- a non-bundle record claims `nicheworks.pro`;
- a bundle member is incorrectly marked as having a frozen Free/Pro boundary before the next phase.

## Follow-up

After this classification merges:

1. freeze the exact current Free behavior and additive Pro operations for all 42 `PRO_BUNDLE` members;
2. prioritize the first live migration group, with Command Safety Checker as the reference;
3. only then decide the bundle price and Stripe commercial configuration.
