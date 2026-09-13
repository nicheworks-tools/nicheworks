# NicheWorks Pro Boundary Contracts — Wave 8

Status: Minutes to Ops boundary staging; bundle membership approved; live commercial configuration unresolved  
Date: 2026-09-13

## 1. Authority

`MONETIZATION_CLASSIFICATION_87.md` classifies `minutes-to-ops` as `PRO_BUNDLE`. The future live paid product authority is the shared `nicheworks.pro` product. Legacy `nicheworks_pro` remains compatibility/migration state only.

This contract freezes the runtime-backed Free/Pro boundary for Minutes to Ops. It does not create a Minutes-to-Ops-specific paid product, authorize a price, or connect live checkout.

## 2. Free boundary — fixed

The following current behavior remains Free:

- paste meeting notes plus optional meeting title, date, and participants;
- deterministic rule-based ToDo extraction;
- owner/due extraction where the current rules detect them;
- decision/agreement extraction;
- SOP draft generation;
- JA/EN UI switching without translating source notes;
- CSV and Markdown previews;
- Markdown and SOP copy;
- CSV download;
- Markdown download.

Billing availability must not block these Free operations.

## 3. Paid boundary — five additive capabilities

Current runtime supports exactly five paid capability boundaries:

1. `history` — browser-local history save plus comparison of saved history. Save and compare are operations on the same local-history capability and are not separate entitlements.
2. `outputPack` — the bundled JSON Pro output pack generated from the current snapshot.
3. `githubIssue` — generated GitHub Issue artifact, with copy/download as delivery actions.
4. `codexRequest` — generated Codex request artifact, with copy/download as delivery actions.
5. `sopHandoff` — generated SOP handoff Markdown artifact, with copy/download as delivery actions.

Copy and download variants do not create additional paid entitlements.

## 4. Legacy entitlement hardening

Until live server-verified migration, Pro activation requires both:

- `status.active === true`; and
- exact `status.entitlement === "nicheworks_pro"`.

The bridge must re-apply exact legacy entitlement state before ordinary Pro button actions. A manually forged `data-pro-active="true"` DOM value or manually unhidden Pro control must not be sufficient to execute history, output-pack, GitHub, Codex, or SOP-handoff actions through the normal UI event path.

This is interim legacy hardening only. Browser state is not future purchase proof.

## 5. Product-scoped staging

`tools/minutes-to-ops/product-scoped-controller.mjs` is a non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

The staged contract requires:

- an explicit configured product ID;
- a complete unique feature map for all five paid capabilities;
- server-backed `refreshProState({ productId })` verification;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- capability activation only when the verified server response contains the mapped feature.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, or entitlement-refresh failure states fail closed.

For production migration of this approved bundle member, the configured product ID must be `nicheworks.pro` plus the approved Minutes to Ops feature mapping.

## 6. Privacy boundary

Meeting notes and derived operational artifacts can contain confidential business information. Billing/entitlement requests may contain fixed product/feature metadata only.

Do not send through billing/entitlement paths:

- pasted meeting notes;
- meeting title, date, or participant names;
- extracted ToDos, owners, due dates, priorities, or statuses;
- decisions or SOP content;
- history snapshots or comparison content;
- GitHub Issue content;
- Codex request content;
- SOP handoff content;
- output-pack payloads;
- export filenames derived from user content.

Current analytics events may use fixed tool/language/feature identifiers only; they must not include meeting or generated content.

## 7. Live migration requirements

Migration is complete only when:

1. real `nicheworks.pro` commercial configuration is registered in `config/billing/products.json`;
2. all five Minutes to Ops feature IDs are approved under that shared product;
3. checkout uses the common billing endpoint for `nicheworks.pro`;
4. signed Stripe webhook fulfillment records the matching entitlement in D1;
5. public runtime verifies shared-product server state before enabling paid capabilities;
6. all current Free generation/copy/download behavior remains independent of billing availability;
7. inactive/failed entitlement checks leave the complete Free workflow usable;
8. unrelated product entitlements cannot unlock Minutes to Ops Pro;
9. billing/entitlement traffic contains no meeting notes or generated artifacts;
10. the historical shared Payment Link and legacy `nicheworks_pro` browser state stop being authoritative;
11. reload re-verifies server entitlement rather than trusting a DOM/local active flag.

Return path: `/tools/minutes-to-ops/`.

## 8. Commercial fields unresolved

Resolved:

- monetization class: `PRO_BUNDLE`;
- future shared product ID: `nicheworks.pro`;
- exact five paid capability boundaries above.

Still unresolved:

- NicheWorks Pro price/currency;
- Stripe Product and Price IDs;
- production Minutes to Ops feature IDs;
- restore/account policy;
- historical-purchaser treatment;
- live/test rollout and migration timing.
