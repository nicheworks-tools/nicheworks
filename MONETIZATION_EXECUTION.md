# NicheWorks Monetization Execution Authority

Updated: 2026-09-13

This document is the **current execution authority** for monetization work in NicheWorks. `MONETIZATION_MASTER.md` remains the tool-by-tool model classification. The canonical per-tool specifications under `docs/tools/` and each tool's own `SPEC.md` define current product behavior. Where older monetization or billing documents conflict with this file, this file wins unless a newer explicit authority document says otherwise.

## 1. Current state

Completed repository work includes:

- PR #513 — monetization master and initial Wave 1 contracts;
- PR #516 — hardened/generalized product-scoped billing foundation;
- subsequent product-scoped staging work for multiple legacy Pro candidates;
- the 87-tool canonical specification and quality-audit layer.

The important distinction is now:

- **commercial product model**: selected professional tools may share one `NicheWorks Pro` purchase;
- **technical billing engine**: the reusable product-scoped `/api/billing/*` foundation remains authoritative;
- **legacy shared Pro implementation**: old `nicheworks_pro`, `NWPro`, shared Payment Link and browser-local active state are migration inputs only.

No new paid product may invent a price, Stripe Price ID, entitlement, affiliate destination, or partner configuration.

## 2. Billing product model — current target

NicheWorks will use three paid-product types.

### 2.1 NicheWorks Pro — primary shared bundle

`NicheWorks Pro` is the primary paid product for selected professional/business/developer tools.

Canonical future product ID:

- `nicheworks.pro`

The bundle is expected to be a **one-time purchase** unless a later explicit decision changes the billing model.

One verified `nicheworks.pro` entitlement may unlock multiple tools that are explicitly listed as members of the bundle. Bundle membership is deliberate and must never be inferred merely because a tool historically contains Pro code.

The exact one-time price, currency, Stripe Product, Stripe Price and environment-variable mapping are **not yet fixed**. Do not infer them from the historical `$2.99` shared Payment Link or from unrelated price tiers already present in the registry.

### 2.2 Standalone Pro — exceptional separate products

A product may remain standalone when it is materially separate from the general professional-tool bundle.

Current planning examples include:

- `okj.toolkit_pro` — Old Kanji Toolkit Pro;
- `reconcile.pro_v1` — Reconcile Pro.

Those entries remain separate and currently `not_connected`. They do not implicitly grant `nicheworks.pro`, and `nicheworks.pro` does not implicitly grant them unless a later explicit bundle policy says so.

### 2.3 Usage / credit billing — deferred

Usage or credit billing is deferred until a tool has meaningful per-use server/API/AI/OCR cost that makes one-time access economically inappropriate.

Do not add usage billing pre-emptively to browser-local tools.

## 3. Billing architecture — product-scoped engine, explicit shared bundle

The forward technical architecture remains the reusable product-scoped billing foundation introduced by PR #516.

The foundation provides:

- registry-backed product configuration;
- server-created Stripe Checkout Sessions;
- verified Stripe webhook fulfillment;
- unpaid/delayed-payment fail-closed handling;
- D1 entitlement storage;
- server-side product/session entitlement verification;
- product/feature-scoped browser state that does not trust local `active=true` authority;
- refund/revocation lifecycle support.

**Product-scoped does not mean one product per tool.**

`nicheworks.pro` is one explicit product. Multiple selected tools can ask whether that same product entitlement is active, while their individual paid operations remain defined in each tool's own contract.

This is not a revival of the legacy global `nicheworks_pro` browser entitlement. The two identifiers have different roles:

- `nicheworks.pro` — future server-verified billing product;
- `nicheworks_pro` — legacy entitlement label retained only for compatibility/migration until retired.

## 4. Legacy shared-Pro boundary

The repository still contains older infrastructure such as:

- a historical hard-coded Stripe Payment Link;
- `assets/nw-pro.js`;
- `/api/pro/status`;
- `/api/stripe/webhook`;
- `pro_purchases` / `pro_entitlements`;
- `NWPro.getLocalStatus()`;
- browser-local `nicheworks:pro` state;
- old `/pro/unlock/` behavior;
- tools gated by legacy `nicheworks_pro`.

Do not use those mechanisms for new paid work.

Do not delete them first either. Existing tools and possible historical purchasers must be accounted for before retirement.

The migration sequence is:

1. establish the `nicheworks.pro` bundle contract and membership ledger;
2. establish the real price/Stripe configuration;
3. register the product in `config/billing/products.json`;
4. connect the new server-verified entitlement flow;
5. migrate existing bundle tools in controlled waves;
6. migrate/retain historical purchasers without losing access;
7. only then retire the legacy billing path.

## 5. Pro-bundle membership rules

The existing `MONETIZATION_MASTER.md` list of Pro-primary candidates is a candidate set, not automatic bundle membership.

Every registered tool must ultimately be classified exactly once for its primary monetization path:

- `PRO_BUNDLE` — included in NicheWorks Pro;
- `STANDALONE_PRO` — separate paid product;
- `AFFILIATE` — free result first, contextual commercial next action;
- `ADS_DONATION` — free acquisition/reference utility supported mainly by baseline monetization;
- `FREE` — intentionally free where additional monetization pressure is not justified;
- `HOLD` — incomplete or undecided product.

The canonical 87-tool specifications are the functional evidence base for that classification.

A legacy Pro bridge, old price label, Payment Link, `NWPro` call or historical roadmap item is **not** sufficient evidence that a tool belongs in `PRO_BUNDLE`.

For every `PRO_BUNDLE` member, Free/Pro boundaries must be written explicitly before live migration. Existing useful Free behavior must not be removed merely to manufacture paid value.

## 6. Reference bundle migration

Command Safety Checker remains the preferred first live reference migration because its current Free/paid boundary is comparatively mature.

The Free safety analysis must remain available without purchase.

Candidate paid operations already staged/currently evidenced include professional review/export artifacts such as:

- review Markdown/report;
- Codex safety-check task;
- GitHub Issue draft;
- JSON export;
- Markdown export.

The migration target is **not** a Command-Safety-specific product. Once Command Safety is approved as a bundle member, its staged product-scoped controller should be configured to verify `nicheworks.pro` and the operation/feature mapping defined for that tool.

A live reference migration is complete only after all of the following work:

1. real `nicheworks.pro` price/currency/billing model are confirmed;
2. Stripe Product/Price configuration is confirmed;
3. the registry contains the real bundle product;
4. checkout is server-created;
5. signed webhook fulfillment writes the active D1 entitlement;
6. refresh/reload re-verifies against the server;
7. cancel/unpaid/invalid checkout never unlocks paid behavior;
8. localStorage or URL modification cannot self-unlock;
9. refund/revocation disables paid behavior;
10. command text and checkout/session identifiers are excluded from analytics payloads.

After that, a second bundle tool must prove that the **same purchase** unlocks its own approved paid operations without a second checkout. That second-tool proof is the acceptance test for the shared NicheWorks Pro model.

## 7. Affiliate/performance architecture

Affiliate monetization remains separate from the Pro track.

There is no one-tool-one-link rule. A tool may have zero, one, several, or many verified offers depending on the actual result and task.

Shared affiliate primitives may standardize cross-tool concerns such as:

- `partner_key`;
- `offer_id`;
- destination or destination-generation metadata;
- enabled/disabled state;
- disclosure state;
- placement metadata;
- fixed analytics metadata;
- optional validity/maintenance metadata.

Tool-specific logic must still decide which offer is relevant, how many offers to show, and in what order.

Across affiliate/performance tools:

1. deliver the core free result first;
2. show authoritative/official guidance before commercial content where applicable;
3. show commercial next actions only after the result;
4. keep commercial content visually distinct;
5. identify affiliate/commercial nature clearly;
6. never present a merchant as an official answer;
7. show no offer when no verified configuration exists.

Do not send raw user content to NicheWorks analytics. This includes search strings, manufacturer/model input, names, addresses, municipality input, ingredient text, lease/move details, command text, user URLs, filenames, checkout IDs or session IDs.

## 8. Ads / donation / SEO track

Tools assigned primarily to acquisition/reference/retention should not be forced into Pro or affiliate solely because billing infrastructure exists.

The Old Kanji reference cluster remains primarily a free acquisition/continuation surface unless a separate product contract is deliberately approved.

Similarly, simple converters, reference tools, privacy utilities and other low-differentiation tools should remain frictionless when there is no credible paid delta.

## 9. Hold/incomplete track

Incomplete products remain outside active monetization rollout until their underlying product contract is complete. Billing UI must not be used to make an unfinished tool look commercially ready.

## 10. Parallel-work rule

NicheWorks frequently has many feature/data/quality branches in flight. Billing work must therefore minimize cross-workstream collisions.

Rules:

- always branch from the latest `main`;
- keep billing authority/foundation changes in small dedicated PRs;
- do not modify unrelated tool runtime while establishing billing infrastructure;
- do not stop unrelated ManualFinder, TrashNavi, data, SEO or quality work merely because billing migration is underway;
- temporarily freeze only new ad-hoc Pro products, new prices, new Payment Links and new independent entitlement mechanisms until the common bundle contract is settled;
- when a parallel branch touches a future Pro tool, preserve its current Free behavior and avoid inventing commercial configuration.

## 11. Execution queue

The billing/Pro queue is now:

1. **Complete:** canonical 87-tool specification/quality layer.
2. **Complete in current authority work:** reconcile billing strategy around explicit shared `nicheworks.pro` plus separate standalone products.
3. Classify all 87 registered tools into `PRO_BUNDLE`, `STANDALONE_PRO`, `AFFILIATE`, `ADS_DONATION`, `FREE`, or `HOLD`.
4. Freeze the exact Free/Pro boundary for every `PRO_BUNDLE` tool.
5. Decide the `nicheworks.pro` one-time price and Stripe commercial configuration.
6. Register `nicheworks.pro` in the common billing registry.
7. Unify D1 entitlement authority around the new billing store and design safe legacy-purchaser migration.
8. Connect Command Safety Checker end to end as the first bundle member.
9. Prove a second bundle tool unlocks from the same purchase.
10. Migrate remaining approved bundle tools in measured waves.
11. After migration, retire `/api/pro/status`, the old shared webhook path, browser-local purchase authority and the old unlock flow.
12. Resume broader per-tool quality/Pro-value improvement using the canonical specs and quality matrix.

Affiliate work can continue independently when its required partner/source configuration is verified.

## 12. Measurement standard

A monetization implementation is not successful merely because a CTA exists or a billing success page receives traffic.

For Pro, measure at minimum:

- successful free use;
- Pro-feature interest;
- checkout click;
- verified payment/entitlement grant;
- active paid-feature use;
- actual revenue;
- refund/revocation behavior.

For affiliate/performance, measure eligible sessions, commercial-block views, clicks by fixed offer/placement IDs and provider-side conversions/revenue where available, while watching effect on result completion and search traffic.

## 13. Non-negotiable rules

- Do not fabricate affiliate partners, links, IDs, product availability, prices, Stripe Price IDs, or entitlement state.
- Do not use browser-local `active=true` as proof of purchase.
- Do not revive legacy `nicheworks_pro` as the future server purchase authority.
- Do not create one paid product per tool merely because the billing engine is product-scoped.
- Do not automatically include every historical Pro candidate in the bundle.
- Do not force one affiliate link per tool or a fixed offer count.
- Do not let commission determine factual/safety output.
- Do not send raw user inputs to analytics or billing records.
- Do not remove established Free value just to manufacture a paywall.
- Do not delete legacy purchaser records before a verified migration path exists.
- Do not expand paid pressure to incomplete tools before the underlying product is complete.

## 14. Source-of-truth order for future monetization work

Use this order:

1. current runtime plus canonical per-tool specification for actual behavior;
2. explicit 87-tool monetization classification/membership ledger once completed;
3. this `MONETIZATION_EXECUTION.md` for commercial strategy and execution order;
4. `docs/billing/nicheworks-common-billing-architecture.md` for technical billing architecture;
5. `docs/billing/nicheworks-pro-bundle-contract.md` for the shared bundle contract;
6. `MONETIZATION_MASTER.md` and `MONETIZATION_WAVE1.md` as evidence/prioritization inputs where still applicable;
7. current billing/affiliate code contracts.

If an older document conflicts with this authority, reconcile the documentation before implementing the conflicting assumption.
