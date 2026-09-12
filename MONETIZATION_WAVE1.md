# NicheWorks Monetization Wave 1

This document turns the 86-tool decision master into implementation contracts for the first seven monetization systems. It is intentionally separate from `common-spec/spec-ja.md`; it does not change suite-wide policy.

Evidence baseline: GSC + GA4, 2026-06-12 through 2026-09-09. `manual-finder` is out of scope because its monetization implementation is already underway.

## 0. Cross-Wave rule: Common Pro is not commercially complete yet

Before expanding paid Pro surfaces, close the purchase-to-entitlement gap.

Current repository evidence:

- `billing/success.html` explicitly says checkout completion does not activate Pro by URL alone.
- It also says entitlement verification / grant will be added later.
- Existing tool-side `pro-bridge.js` files can read a shared entitlement state, but that does not prove a buyer can currently obtain that state through the checkout flow.
- GA4 pageviews on `/billing/success` or a `/pro` page are not purchase evidence and must not be counted as paid conversions.

### P0 entitlement acceptance contract

A Common Pro rollout is commercially enabled only when all of the following are true:

1. A real successful checkout can be verified server-side or by another non-forgeable verification path.
2. Successful verification grants the canonical `nicheworks_pro` entitlement.
3. The entitlement can be read by the existing tool-side gate without requiring a user to manipulate the URL or browser storage manually.
4. Refreshing the tool preserves the entitlement according to the intended entitlement lifetime.
5. A failed/cancelled/unverified checkout does not grant access.
6. The success page does not claim activation before verification completes.
7. No checkout session ID, command text, JSON content, logistics memo, lease details, ingredient text, municipality selection, or other user input is sent to GA4 as an event parameter.

Until this contract is satisfied, Wave 1 Pro tools may have previews/specifications, but **must not be represented as a finished paid product funnel**.

## 1. Measurement contract for Wave 1

This document defines event names so implementation can be consistent. It does **not** authorize a new tracker or dependency. If emitted, events must use the already-approved analytics stack and comply with the common specification.

Never include raw user input in analytics parameters.

| Event | When | Allowed parameters |
| --- | --- | --- |
| `nw_result_ready` | Primary free result becomes usable | `tool_slug`, `result_kind` using a fixed non-user-derived enum |
| `nw_monetization_view` | A monetization block actually becomes visible | `tool_slug`, `model`, `surface_id`, `placement` |
| `nw_monetization_click` | User intentionally clicks a monetization CTA | `tool_slug`, `model`, `surface_id`, `offer_type`, configured `partner_key` if applicable |
| `nw_pro_gate_view` | User reaches a gated Pro feature explanation | `tool_slug`, `feature_id` |
| `nw_pro_checkout_click` | User opens the configured checkout | `tool_slug`, `feature_id` |
| `nw_pro_entitlement_state` | Gate checks entitlement | `tool_slug`, `state=active|inactive|unavailable` only |
| `nw_related_tool_click` | User follows a deliberate related-tool link | `source_tool`, `target_tool`, `cluster` |

Do not send: free-text queries, JSON, command text, ingredient names, addresses, municipality names, move dates, memo contents, filenames, URLs supplied by users, or checkout/session identifiers.

## 2. Wave 1A — TrashNavi

### Why first

- GSC: 336 impressions, 3 clicks, average position 7.93.
- GA4: 11 landing sessions.
- Intent is not merely informational: a user looking for garbage sorting / bulky-waste guidance is often immediately deciding whether to dispose, sell, arrange collection, or coordinate a move.

### Free contract — must remain free

- Municipality / official garbage guidance discovery.
- Official-source links and existing search/filter flow.
- Any existing warnings that official local rules take precedence.
- No registration or purchase requirement before official guidance is shown.

### Primary monetization

**Performance / affiliate**, not Pro.

Allowed offer classes, only after a verified partner/program is configured:

- reusable-item buyback / resale;
- bulky-item collection / disposal service;
- moving service when the context is explicitly moving-related.

Do not label a commercial partner as an official municipal service. Do not mix affiliate links into the official-source result list.

### UI placement

Primary location: **after the official result / official-source block and before donation/footer material**.

Block concept: a compact “次にできること / Next options” section, visually separated from official links.

Rules:

- official answer first, commerce second;
- no modal, floating affiliate CTA, forced redirect, or pre-result affiliate banner;
- if no verified partner is configured for a class, do not show a fake/disabled merchant card;
- disclosure that commercial links may generate compensation must be adjacent or immediately available.

### Measurement

- `nw_result_ready`: official result rendered.
- `nw_monetization_view`: `surface_id=trashnavi_next_options`, `model=affiliate`, `placement=post_result`.
- `nw_monetization_click`: `offer_type=buyback|collection|moving`.

### KPI / guardrail

Primary KPI: monetization click-through among sessions where an official result was successfully shown.

Guardrails:

- GSC clicks and average position must not deteriorate because commerce displaces official content.
- Official result completion must remain possible without interacting with affiliate content.
- No commercial link is counted as an official-source click.

### Dependency

Live rollout requires verified partner URLs/IDs. None may be invented in code.

## 3. Wave 1B — JSON to Mermaid

### Why Wave 1

- GSC: 13 impressions, 4 clicks, **30.8% CTR**, average position **3.00**.
- Volume is small but query-to-tool fit is unusually strong.
- The current free contract already has clear technical limits and local processing, which creates a legitimate professional paid boundary.

### Free contract — must remain free

Per the current tool specification:

- paste JSON and use built-in presets;
- `TD` / `LR` direction;
- leaf-value and array modes;
- current size/depth/array safety limits;
- Mermaid source generation plus statistics/warnings;
- copy Mermaid source;
- `.mmd` and `.txt` download;
- external Mermaid Live Editor link as an explicit user action;
- JP/EN UI.

Do **not** take away current `.mmd` / `.txt` export to manufacture Pro value.

### Pro delta

Candidate paid features, implemented only after P0 entitlement completion:

1. **Batch conversion** of multiple JSON inputs in one local session.
2. **Saved local presets/projects** for conversion settings and naming; no cloud upload required.
3. **Advanced diagram packaging**: optional local rendered preview/export only if it can be implemented without violating dependency policy; otherwise keep this deferred rather than pretending it exists.
4. **Large-structure mode** with explicitly documented higher limits and truncation diagnostics, if browser performance testing proves it safe.
5. **Professional export bundle** containing source + settings manifest + generation statistics.

Theme selection by itself is too weak to justify Pro and should be treated as a convenience inside a larger paid bundle, not the sole paywall.

### UI placement

- Keep current converter first.
- Place a small Pro expansion panel **after successful generated output/statistics**, not above the JSON input.
- Show the exact paid capabilities; do not use generic “unlock everything” copy.
- With inactive entitlement, preview capability names but do not disable existing free export buttons.

### Measurement

- `nw_result_ready`: Mermaid source generated.
- `nw_pro_gate_view`: feature IDs such as `batch`, `saved_presets`, `export_bundle`, `large_structure`.
- `nw_pro_checkout_click` only from an explicit Pro CTA.
- `nw_pro_entitlement_state` from the common gate.

### KPI / guardrail

Funnel after P0 exists: successful free generations → Pro gate views → checkout clicks → **verified entitlement grants**.

Never use `/billing/success` pageviews as the final conversion denominator.

## 4. Wave 1C — Logistics Compliance Kit JP

### Why Wave 1

- GA4: 3 landing sessions; GSC average position 7.50 on a very small sample.
- Traffic is not large, but the workflow has high business intent and the repository already contains a substantial Pro surface.

### Free contract — must remain free

Per current SPEC:

- implemented logistics-condition inputs;
- review/priority level and supporting signals;
- next actions;
- medium/long-term plan draft;
- current-state memo in output without using it to alter scoring;
- on-screen result and free Markdown preview;
- Japanese-only language contract;
- explicit non-legal/non-regulatory disclaimer.

### Pro delta

Preserve and harden the already-defined paid operational artifacts rather than invent a second tier:

- Markdown save;
- internal-share memo;
- contractor/vendor confirmation memo;
- improvement plan;
- GitHub Issue draft;
- Codex task;
- handoff Markdown;
- JSON export.

Potential later extension: saved local case presets or reusable company-side review templates, but only after the existing Pro bundle has real paid usage.

### UI placement

- Free assessment and planning output first.
- Pro operational handoff block follows the free result.
- Do not put checkout before the user can see the free review level and next actions.
- Keep legal/regulatory disclaimers visible independently of Pro state.

### Measurement

- `nw_result_ready`: assessment generated.
- `nw_pro_gate_view`: fixed feature IDs for each operational artifact group.
- `nw_pro_checkout_click`.
- `nw_pro_entitlement_state`.

No logistics memo or selected operational condition may be sent as analytics parameters.

### KPI / guardrail

Primary paid funnel KPI after P0: free assessment completions → Pro artifact interest → checkout click → verified entitlement.

Guardrail: no copy may imply official legal compliance or government approval.

## 5. Wave 1D — Cosmetic Ingredient Checker Lite + INCI FastScan

### Why Wave 1

- Cosmetic Ingredient Checker Lite: GSC 17 impressions, average position 8.88; GA4 2 sessions.
- INCI FastScan: GA4 5 sessions.
- Both sit at the same decision moment: a user is interpreting an ingredient list and may next compare products.

### Free contract — must remain free

- Ingredient-list scanning/checking and current explanatory notes.
- Existing dictionary/reference behavior.
- Existing safety/medical limitations and non-diagnostic framing.
- No product purchase requirement to see ingredient interpretation.

### Primary monetization

**Contextual product discovery / affiliate**, shared design across the two tools.

Allowed behavior:

- show a small product-discovery section after the interpretation result;
- organize links by neutral shopping intent/category, not by medical suitability;
- use only verified merchant/affiliate destinations.

Prohibited behavior:

- “safe for you”, “recommended for your condition”, “doctor-approved”, allergy guarantees, pregnancy claims, treatment claims, or claims inferred from a user’s ingredient input;
- ranking products as safer because they produce higher commissions;
- sending ingredient input to an affiliate network or analytics event.

### UI placement

**After interpretation/result**, before donation/footer.

The commerce block must be visually distinct from ingredient facts. The result should not visually point to a merchant as the “answer”.

If a partner catalog cannot be maintained accurately, use category-level destination links rather than hard-coded product claims.

### Measurement

- `nw_result_ready`.
- `nw_monetization_view`: `surface_id=ingredient_product_discovery`.
- `nw_monetization_click`: neutral `offer_type` such as `category_browse` or a configured merchant category; never ingredient/user-input values.

### KPI / guardrail

Primary KPI: post-result commerce CTR.

Guardrails: result completion and bounce behavior must not worsen materially; no health/safety inference in commerce copy.

### Dependency

Verified affiliate merchant/program configuration. Until available, do not expose dead “shop now” placeholders.

## 6. Wave 1E — Moving Checklist Generator + Moving / Lease Final Check

### Why Wave 1

- Moving / Lease Final Check has small traffic but GSC average position 7.00 on its observed sample.
- The task happens near a real transaction window: moving company selection, unwanted-item disposal, or resale.
- Moving / Lease Final Check already has a Pro preview, but Common Pro entitlement is incomplete. Its **primary incremental monetization for this wave is contextual performance offers**, while the existing Pro preview remains secondary and must not be falsely represented as fully purchasable/unlocked.

### Free contract — must remain free

For Moving Checklist Generator:

- generate the existing moving checklist from the existing inputs;
- preserve current free checklist/use flow and outputs.

For Moving / Lease Final Check, preserve the current SPEC contract:

- required exit/move date and home type;
- generated final checklist and progress;
- browser-local checklist state;
- clear/reset/delete-state controls;
- free TXT copy/download and browser print/PDF;
- inspection memo template;
- legal/lease limitations.

### Primary monetization

Post-result performance offers, using only verified partners:

- moving quotes/services;
- unwanted-item buyback;
- collection/disposal where lawful and appropriate.

A user must not be told that a commercial service is required to complete a lease or meet a legal obligation.

### UI placement

Moving Checklist Generator: after generated checklist summary/output.

Moving / Lease Final Check: after the free final checklist/output, separated from the existing Pro preview. Do not merge the commercial service block into lease/legal guidance.

Use a compact next-action block rather than a marketplace-style wall of offers.

### Measurement

- `nw_result_ready`.
- `nw_monetization_view`: `surface_id=moving_next_options`.
- `nw_monetization_click`: `offer_type=moving|buyback|collection`.
- Existing Pro metrics remain separate; affiliate clicks must never be counted as Pro interest.

No move date, housing type, memo, address, or checklist state may be emitted as an analytics parameter.

### KPI / guardrail

Primary KPI: post-result next-option CTR.

Guardrails: checklist completion remains free; lease/legal disclaimer remains independent; no partner is presented as landlord/property-manager/official guidance.

## 7. Wave 1F — Command Safety Checker

### Why Wave 1

- GA4 shows 4 sessions on the main tool plus 2 sessions on the Pro page in the evidence window.
- The repository already has a mature Pro bridge and concrete paid artifacts.
- This makes it the correct tool for proving the Common Pro entitlement pipeline before duplicating Pro architecture elsewhere.

### Free contract — must remain free

Per current SPEC:

- multi-line shell / PowerShell command input;
- implemented risky-pattern detection;
- risk/category/reason guidance;
- verification and safer-alternative guidance;
- JP/EN UI;
- explicit statement that the tool does not certify safety.

Safety checking itself must never become Pro-only.

### Existing Pro delta to preserve

- review Markdown;
- Codex safety-check task;
- GitHub Issue draft;
- JSON/Markdown operational exports and existing review artifacts.

Do not add more Pro features until the P0 entitlement path is proven end to end. First make existing paid intent honest and operational.

### UI placement

Keep free risk result first. Pro review/export panel follows the generated result. Checkout CTA must describe the exact operational outputs unlocked.

### Measurement

- `nw_result_ready`: risk analysis completed; fixed `result_kind` may be a broad enum if desired, but never command content.
- `nw_pro_gate_view`.
- `nw_pro_checkout_click`.
- `nw_pro_entitlement_state`.

Never send command text, URLs inside commands, paths, environment names, secret-like strings, or finding snippets to analytics.

### KPI / guardrail

This is the **reference Pro funnel** for NicheWorks.

Success criterion is not checkout-page traffic. It is: checkout click → verified payment/entitlement → active gate → paid artifact usable after refresh.

## 8. Wave 1G — Old-kanji acquisition cluster

### Included in this wave

- `old-kanji-reference` — hub.
- `kanji-modernizer`.
- `name-old-kanji-checker`.
- `place-old-kanji-checker`.
- `unicode-kanji-checker`.
- `variant-kanji-compare`.
- `old-document-kanji-highlighter`.

`old-kanji-ocr-scanner` is **not** part of monetization rollout yet because its current product description is still an OCR entry/preparation flow rather than a completed OCR contract.

### Why Wave 1

- Old Kanji Reference: **462 GA4 sessions**, the largest observed tool landing volume, plus 344 GSC impressions / 5 clicks.
- Kanji Modernizer: 25 GA4 sessions.
- Several related kanji tools already have early search/usage evidence.

This is the clearest current evidence that NicheWorks already has a topic cluster users actually use.

### Monetization model

**AdSense + donation + SEO + deliberate related-tool continuation.**

Do not force Pro or unrelated Amazon/product affiliate blocks merely because the hub has traffic.

### Free contract

All existing lookup/compare/convert/reference behavior remains open. The cluster is an acquisition and depth engine.

### UI placement

Use only the footer-near related-tool block permitted by the common specification. Do not add a global/header navigation system.

Recommended hub continuation from Old Kanji Reference:

- convert text → Kanji Modernizer;
- person-name check → Name Old Kanji Checker;
- place/address check → Place Old Kanji Checker;
- code-point/HTML entity check → Unicode Kanji Checker;
- side-by-side glyph check → Variant Kanji Compare;
- old-document highlighting → Old Document Kanji Highlighter.

Each leaf tool should link back to the hub plus at most a few directly relevant siblings, keeping the block compact.

### Measurement

- GSC clicks/impressions/position remain the primary acquisition metrics.
- `nw_related_tool_click` may be used for the explicit footer-near related-tool block if custom event emission is allowed under the analytics policy.
- `cluster=old_kanji`.

No looked-up character/string is emitted as analytics data.

### KPI / guardrail

Primary KPIs:

1. organic clicks to the hub and cluster pages;
2. related-tool continuation rate;
3. sessions per user/session depth where available from normal analytics;
4. AdSense performance monitored without moving ads into disruptive positions.

Guardrail: cluster linking must not become a header mega-nav or a generic site-wide navigation menu.

## 9. Execution order from this specification

### Track A — can proceed without Common Pro entitlement

1. TrashNavi affiliate surface **after verified partner configuration exists**.
2. Cosmetic/INCI shared commerce surface **after verified merchant configuration exists**.
3. Moving shared next-options surface **after verified service configuration exists**.
4. Old-kanji related-tool/SEO pass; no partner dependency.

### Track B — entitlement foundation first

1. Use Command Safety Checker as the reference end-to-end entitlement test.
2. Close P0 purchase → verification → `nicheworks_pro` grant → persisted unlock.
3. Re-test Command Safety Checker paid artifacts.
4. Apply the proven gate to Logistics Compliance Kit JP.
5. Implement JSON2Mermaid Pro expansion without removing current free exports.

## 10. Definition of done for Wave 1

Wave 1 is not complete merely because CTAs exist.

It is complete when:

- each affiliate system uses real verified destinations and clear commercial disclosure;
- official/reference results remain visually and functionally primary;
- no user input is leaked through analytics parameters or affiliate URLs;
- old-kanji cluster continuation is implemented without prohibited common navigation;
- Common Pro has a real verified entitlement grant flow;
- Command Safety Checker proves the paid flow end to end;
- Logistics and JSON2Mermaid use the same proven entitlement contract;
- desktop and 320–414px mobile layouts remain usable;
- existing JA/EN behavior or explicit Japanese-only behavior is preserved per each tool specification.
