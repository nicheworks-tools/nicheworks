# NicheWorks Monetization Execution Authority

Updated: 2026-09-12

This document is the **current execution authority** for monetization work in NicheWorks. `MONETIZATION_MASTER.md` remains the tool-by-tool model classification. `MONETIZATION_WAVE1.md` remains useful for tool-specific free boundaries, placements, KPIs, and guardrails, but where its execution assumptions conflict with this document, **this document wins**.

The main conflicts this document resolves are:

1. billing is now product-scoped rather than a future site-wide `nicheworks_pro` rollout;
2. affiliate/performance monetization is zero-to-many offers, not one link per tool;
3. the shared affiliate layer must be extracted from a real ManualFinder implementation rather than invented before that implementation is inspectable;
4. Old Kanji acquisition-cluster Wave 1 is already implemented.

## 1. Current state

Completed repository work:

- PR #513 — monetization master and initial Wave 1 contracts.
- PR #516 — hardened/generalized product-scoped billing foundation.
- PR #519 — Old Kanji acquisition/continuation cluster Wave 1.

ManualFinder is intentionally excluded from the 86-tool classification because its monetization implementation is being handled in a separate workstream.

The 86 non-ManualFinder tools remain classified as:

- 42 Pro-primary candidates;
- 13 affiliate/performance-primary candidates;
- 26 AdSense + donation + SEO/internal-circulation-primary tools;
- 5 hold/incomplete tools.

The classification is not an instruction to monetize all tools immediately. It defines the likely primary model; rollout still requires product-specific evidence and implementation readiness.

## 2. Billing architecture — current target

The target billing architecture is **product-scoped entitlement**, not one global all-access NicheWorks Pro entitlement.

The common foundation now provides the reusable plumbing for:

- registry-backed product configuration;
- Stripe Checkout session creation;
- verified Stripe webhook fulfillment;
- unpaid checkout fail-closed behavior;
- D1 entitlement storage;
- server-side product/session entitlement verification;
- a browser adapter that treats server verification as authoritative rather than trusting a local `active=true` flag.

A common billing foundation does **not** mean all paid tools share one entitlement. The product ID is the entitlement boundary.

### 2.1 Legacy shared-Pro code

Some tools still contain older code built around:

- a hard-coded Stripe Payment Link;
- shared entitlement name `nicheworks_pro`;
- old `NWPro.getLocalStatus()` behavior;
- old shared unlock/pro pages.

That code is migration input only. Do not use it as the architecture for new paid products.

### 2.2 Command Safety Checker status

Command Safety Checker remains the first migration candidate because it already has concrete paid-artifact concepts and a mature Pro UI. However, the repository currently does **not** contain a verified product-scoped Command Safety product entry.

`config/billing/products.json` currently defines `okj.toolkit_pro` and common price tiers, but it does not prove which product ID, price, Stripe Price ID environment variable, or live enablement policy belongs to Command Safety Checker.

Therefore:

- do not guess a Command Safety product ID and call it final;
- do not infer its price from an unrelated common price tier;
- do not infer a Stripe Price ID from the old Payment Link;
- do not migrate the checkout CTA to a fabricated configuration.

Migration starts only after the product contract is explicitly verified.

### 2.3 Command Safety migration acceptance

Before a live migration is complete, verify:

1. canonical product ID;
2. exact price and currency/type;
3. Stripe Price environment-variable mapping;
4. feature IDs included in the entitlement;
5. checkout return path;
6. test/live enablement policy;
7. server-side paid entitlement grant;
8. entitlement remains valid after refresh through server verification;
9. cancelled, unpaid, or invalid checkout never unlocks paid output;
10. no command text or checkout/session identifier is sent to analytics.

The safety analysis itself remains free.

## 3. Affiliate/performance architecture — zero to many offers

There is **no one-tool-one-link rule**.

A tool may have:

- zero offers;
- one offer;
- several offers for one result;
- hundreds or thousands of offer mappings across its catalog.

ManualFinder is the clearest example. A single model result can legitimately lead to multiple commercial next actions, such as the main product, battery, charger, compatible accessory, replacement item, or another merchant. A different model can produce a different set. The number of links must follow the user task and available verified offers, not a global fixed count.

### 3.1 What may be shared

A reusable affiliate layer may standardize only cross-tool concerns such as:

- `partner_key` — merchant / ASP identity;
- `offer_id` — stable configured offer identity;
- destination or destination-generation metadata;
- enabled/disabled state;
- disclosure text/state;
- `placement_id` and placement metadata;
- neutral offer type/category metadata;
- fixed analytics metadata;
- optional validity/maintenance metadata where needed.

The exact schema may evolve after ManualFinder is reviewed. Do not freeze a schema before the reference implementation exists.

### 3.2 What must remain tool-specific

The common layer must not decide:

- which offer matches the current result;
- how many offers to show;
- whether an offer is relevant enough to show;
- ordering based on the actual task/result;
- product/model/category matching logic;
- municipality-specific disposal context;
- moving-result context;
- ingredient-tool commerce context.

Those are tool-domain decisions.

Examples:

- ManualFinder: manufacturer/model/result relationship determines related product offers.
- TrashNavi: disposal result determines whether buyback, collection, moving, or no commercial option is appropriate.
- Moving tools: generated result may make moving, buyback, or collection relevant.
- Cosmetic/INCI tools: commerce must remain neutral product discovery and must never infer medical suitability from ingredient input.

### 3.3 Affiliate display order

Across affiliate/performance tools:

1. deliver the core free result first;
2. show authoritative/official guidance before commercial content when the tool has such guidance;
3. show commercial next actions only after the result;
4. keep commercial content visually distinct;
5. identify commercial/affiliate nature clearly;
6. never make a merchant look like the official answer;
7. show nothing when there is no verified offer/program configuration.

Do not create fake disabled merchant cards merely to fill a layout.

### 3.4 Affiliate analytics

Allowed fixed/configured identifiers may include:

- `tool_id` / `tool_slug`;
- `offer_id`;
- `partner_key`;
- `placement_id` / placement;
- configured `offer_type`;
- monetization model enum.

Never send raw user content, including:

- search strings;
- manufacturer/model text typed by the user;
- names;
- addresses;
- municipality input;
- ingredient text;
- lease/move details;
- command text;
- user-supplied URLs;
- filenames;
- checkout or session identifiers.

ASP/merchant-side attribution may use the provider's supported affiliate mechanism, but NicheWorks analytics must not leak user-entered content as event parameters.

## 4. ManualFinder is the affiliate reference dependency

ManualFinder's affiliate work is proceeding separately. At the time of this document, no finished affiliate implementation is present on `main`, and no affiliate/amazon-named implementation branch is visible as the stable reference.

Therefore the sequence is:

1. finish and merge, or otherwise expose, the actual ManualFinder affiliate implementation;
2. audit its real data model and rendering behavior;
3. identify which parts are genuinely reusable;
4. extract only those primitives into a common affiliate layer;
5. do not rewrite ManualFinder merely to satisfy an abstract shared framework;
6. then apply the shared layer to other affiliate/performance tools.

This avoids building a framework that accidentally assumes one tool = one destination or cannot handle a large model/product catalog.

## 5. Affiliate rollout order after ManualFinder reference review

### Wave A1 — TrashNavi

Primary model: performance / affiliate.

Core rule: official disposal guidance first, commercial next action second.

Potential verified offer classes:

- buyback/resale;
- collection/disposal service;
- moving service when genuinely relevant.

Do not label a partner as an official municipal service.

### Wave A2 — Moving pair

- Moving Checklist Generator
- Moving / Lease Final Check

Potential verified offer classes:

- moving services/quotes;
- unwanted-item buyback;
- collection/disposal.

Lease/legal guidance must remain separate from commercial content. No partner is required to satisfy a legal or contractual obligation.

### Wave A3 — Cosmetic pair

- Cosmetic Ingredient Checker Lite
- INCI FastScan

Primary commercial role: neutral product discovery after the free interpretation.

Never produce health/safety recommendations from user-entered ingredient text. No allergy, pregnancy, treatment, diagnosis, or "safe for you" inference.

### Wave A4 — Construction Tools Atlas

Use tool/category/task context to surface relevant verified tool/product destinations. Do not reduce the Atlas to an affiliate catalog; its reference/usefulness comes first.

### Later affiliate/performance group

Expand to the remaining classified tools only after the first waves produce measurable evidence. A monetization classification is not sufficient reason to inject a CTA everywhere.

## 6. Pro rollout order

The affiliate track and Pro track are separate. ManualFinder does not need to block all Pro preparation, but no product may go live with invented commercial parameters.

### P1 — Command Safety Checker migration

First verify product and price configuration, then migrate the legacy shared-Pro implementation to the product-scoped billing foundation.

Use the existing paid-artifact concepts as the starting product definition:

- review Markdown/report;
- priority checklist;
- safer-command review artifacts;
- Codex safety-check task;
- GitHub Issue draft;
- JSON/Markdown operational export.

Do not paywall the free safety check.

### P2 — JSON2Mermaid

Keep current free conversion and current free exports. Candidate Pro value must be genuinely incremental, such as batch workflows, saved local presets/projects, higher proven-safe limits, or a professional export bundle.

Do not manufacture Pro value by removing an existing free feature.

### P3 — Logistics Compliance Kit JP

Keep free assessment/result and current free preview. Paid value should focus on operational handoff/export artifacts already aligned with its workflow. Legal/regulatory disclaimers remain independent of entitlement state.

### P4 — measured expansion

Only after the first product-scoped paid products are measurable should Pro expand to additional candidates such as:

- Codex Work OS;
- Product Founder OS;
- Release Guardian;
- UI Atlas;
- Screenshot Stitcher;
- Log Formatter;
- contract-oriented tools.

If early products do not convert, revise product design before cloning the same paywall across the 42 candidates.

## 7. Ads / donation / SEO acquisition track

The 26 tools assigned primarily to acquisition/retention should not be forced into Pro or affiliate merely because a commercial framework exists.

### Old Kanji cluster

PR #519 completed the first acquisition-continuation implementation:

- Old Kanji Reference is the hub;
- hub links to six completed related Old Kanji tools;
- leaf tools link back to the hub plus two context-relevant neighbors;
- unrelated generic links were removed;
- workflow-specific dynamic follow-up links were preserved;
- Old Kanji OCR Scanner remains outside the cluster until its product is complete.

The next action here is measurement, not more monetization UI.

Watch existing GSC/GA4 for:

- Old Kanji Reference landing traffic;
- internal movement to Modernizer/Name/Place/Unicode/Variant/Old Document tools;
- search performance stability;
- whether the cluster creates additional useful sessions without harming the hub.

Do not convert the hub into a hard paywall.

## 8. Hold/incomplete track

Current hold group remains outside active monetization rollout until each product contract is complete:

- Earth Alerts;
- Earth Timeseries;
- Earth Map Suite;
- Old Kanji OCR Scanner;
- Pattern Atlas, unless/until its current product-state classification is deliberately re-reviewed after subsequent runtime work.

A tool should not receive paid/affiliate pressure merely to make the monetization table look complete.

## 9. Execution queue from this point

The operational queue is:

1. **Completed:** Old Kanji cluster Wave 1 (#519).
2. **Affiliate dependency:** finish/merge ManualFinder affiliate implementation in its separate workstream.
3. **Affiliate architecture:** audit ManualFinder and extract multi-offer reusable primitives.
4. **Affiliate implementation:** TrashNavi.
5. **Affiliate implementation:** Moving pair.
6. **Affiliate implementation:** Cosmetic/INCI pair.
7. **Affiliate implementation:** Construction Tools Atlas.
8. **Pro prerequisite in parallel:** verify Command Safety product ID, price, Stripe Price env mapping, features, return path, and enablement policy.
9. **Pro migration:** Command Safety Checker → product-scoped entitlement.
10. **Pro validation:** prove paid checkout → webhook → D1 entitlement → server verification → active feature after refresh.
11. **New Pro:** JSON2Mermaid.
12. **New Pro:** Logistics Compliance Kit JP.
13. **Decision point:** review GSC, GA4, affiliate reports, and Stripe revenue before broader rollout.

If step 2 is still in progress elsewhere, steps 8–10 may proceed only to the extent that exact commercial configuration is verified. Do not bypass missing product/price decisions with guessed values.

## 10. Measurement standard

A monetization implementation is not successful merely because a CTA exists or a billing page receives traffic.

For affiliate/performance, measure:

- eligible result sessions;
- monetization-block views;
- offer clicks by fixed offer/placement identifiers;
- provider-side conversions/revenue where available;
- effect on result completion, bounce, and search traffic.

For Pro, measure:

- successful free result/use;
- Pro feature interest;
- checkout click;
- verified payment/entitlement grant;
- active paid feature use;
- actual revenue.

A `/billing/success` pageview alone is not a paid conversion.

## 11. Non-negotiable rules

- Do not fabricate affiliate partners, links, IDs, product availability, prices, Stripe Price IDs, or entitlement state.
- Do not use browser-local `active=true` as proof of purchase.
- Do not turn the product-scoped billing foundation into a hidden all-access entitlement.
- Do not force one affiliate link per tool or one fixed offer count.
- Do not let commission determine factual/safety output.
- Do not send raw user inputs to analytics.
- Do not hide the core free result behind commercial content in tools whose contract says the result remains free.
- Do not modify ManualFinder from this execution track while its separate monetization workstream is active.
- Do not expand monetization to incomplete tools before the underlying product is complete.

## 12. Source-of-truth order for future work

When implementing monetization, use this order:

1. current tool runtime + tool `SPEC.md` for what the product actually does;
2. `MONETIZATION_MASTER.md` for the assigned primary monetization model;
3. this `MONETIZATION_EXECUTION.md` for current architecture and execution order;
4. `MONETIZATION_WAVE1.md` for still-valid tool-specific placement/free-boundary/KPI detail;
5. the current billing/affiliate implementation contracts in code.

If an older document conflicts with current runtime or this execution authority, do not silently implement the older assumption. Reconcile the documentation first.
