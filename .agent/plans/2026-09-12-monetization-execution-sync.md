# ExecPlan — Monetization execution sync

## 1. Goal

Record the current monetization execution authority after the billing-foundation hardening and Old Kanji cluster Wave 1 work, so later implementation does not revert to the obsolete shared `nicheworks_pro` model or assume one affiliate link per tool.

## 2. Current facts to preserve

- `MONETIZATION_MASTER.md` classifies the 86 non-ManualFinder tools by primary monetization model.
- ManualFinder monetization work is proceeding separately and remains out of this branch's runtime scope.
- PR #516 replaced the intended commercial billing direction with a product-scoped foundation: registry-backed products, Stripe Checkout, verified webhook fulfillment, D1 entitlement records, and server-backed entitlement checks.
- Legacy tool implementations such as Command Safety Checker still use a hard-coded Payment Link plus the old shared `nicheworks_pro` client state and therefore require product-by-product migration.
- `config/billing/products.json` currently defines only `okj.toolkit_pro`; it does not define a Command Safety product or verified Command Safety price mapping.
- PR #519 completed Old Kanji cluster Wave 1 continuation links.
- ManualFinder's affiliate implementation is not yet available on `main` as a finished reference implementation.

## 3. Affiliate architecture decision

Affiliate/performance monetization must support **zero to many offers per tool and per result**. A tool is not limited to one affiliate URL.

The reusable layer may standardize:

- partner identity;
- offer identity;
- configured destination / affiliate destination;
- enabled state;
- disclosure metadata;
- placement metadata;
- fixed analytics identifiers.

The reusable layer must **not** decide which offer is contextually relevant. Selection and count remain tool-specific. ManualFinder is the first real-world reference for this because one manufacturer/model result may legitimately expose multiple commercial next actions (for example body, battery, charger, or accessories) and a catalog can grow to hundreds or thousands of offer mappings.

No shared affiliate runtime is to be implemented until the ManualFinder implementation is merged or otherwise inspectable as a stable reference. Do not invent partner URLs, affiliate IDs, product mappings, or availability.

## 4. Pro architecture decision

The product-scoped billing foundation is the forward path. The old shared `nicheworks_pro` entitlement is not the target architecture for new migrations.

Command Safety Checker is still the first migration candidate, but migration may not claim a live purchasable product until all of the following are verified:

1. canonical product ID;
2. commercial price / price tier;
3. Stripe price environment variable mapping;
4. return path and feature set;
5. live/test enablement policy.

Existing free safety analysis remains free. Existing paid-artifact concepts may be reused after the product contract is verified.

## 5. Execution order

### Completed

1. Monetization master / Wave 1 contracts — PR #513.
2. Product-scoped billing foundation hardening — PR #516.
3. Old Kanji acquisition/continuation cluster Wave 1 — PR #519.

### Next affiliate track

1. Finish / merge ManualFinder affiliate implementation in its separate workstream.
2. Audit the real ManualFinder model for multi-offer data, disclosure, placement, and click tracking.
3. Extract only genuinely reusable primitives.
4. Apply them to TrashNavi first.
5. Then Moving Checklist Generator + Moving / Lease Final Check.
6. Then Cosmetic Ingredient Checker Lite + INCI FastScan.
7. Then Construction Tools Atlas.
8. Expand to the remaining affiliate/performance group only after evidence from the first rollouts.

### Parallel Pro track

1. Verify Command Safety Checker product/price/Stripe configuration; do not guess missing values.
2. Migrate Command Safety from hard-coded Payment Link + shared `nicheworks_pro` to product-scoped billing.
3. Validate paid entitlement end to end.
4. Define and launch JSON2Mermaid Pro only after its exact product contract is approved.
5. Define and launch Logistics Compliance Kit JP Pro after the same proof.
6. Expand to further Pro candidates only from measured results.

### Ads / SEO / donation track

- Keep acquisition utilities free where that is their assigned role.
- Measure the Old Kanji cluster after PR #519 through existing GSC/GA4 data before adding more commercial pressure.
- Do not force affiliate or Pro onto tools assigned primarily to acquisition/retention.

### Hold track

Do not monetize incomplete/experimental tools as if they were finished products. Complete the product contract first.

## 6. Analytics and privacy

Affiliate click events may identify only configured, non-user-derived values such as:

- `tool_id`;
- `offer_id`;
- `partner_key`;
- `placement_id` / placement;
- model/category enums fixed in configuration.

Never emit user-entered search strings, model numbers typed by the user, names, addresses, ingredient text, lease details, command text, URLs supplied by the user, filenames, or checkout/session identifiers to analytics.

## 7. Acceptance

- [x] Current billing architecture is represented as product-scoped.
- [x] Legacy Command Safety implementation is treated as migration input, not the target shared-Pro architecture.
- [x] Affiliate architecture explicitly supports zero-to-many offers.
- [x] ManualFinder is a reference dependency, not modified by this work.
- [x] No partner link, affiliate ID, price, product ID, or Stripe environment variable is invented.
- [x] Old Kanji Wave 1 is recorded as completed.
- [ ] Add a root execution document that makes these decisions explicit and supersedes conflicting execution assumptions in the older Wave 1 document.

## 8. Scope

Documentation only. Do not modify ManualFinder, billing runtime, affiliate runtime, common spec, or tool behavior in this PR.
