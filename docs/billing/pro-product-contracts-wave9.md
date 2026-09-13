# NicheWorks Pro Boundary Contracts — Wave 9

Status: OG Image Maker boundary staging; bundle membership approved; live commercial configuration unresolved  
Date: 2026-09-13

## 1. Authority

`MONETIZATION_CLASSIFICATION_87.md` classifies `og-image-maker` as `PRO_BUNDLE`. The future live paid product authority is the shared `nicheworks.pro` product. Legacy `nicheworks_pro` remains compatibility/migration state only.

The historical shared-Pro implementation and old browser-local `nw_pro_key` mechanism are legacy commerce/migration evidence only. They do not establish the future NicheWorks Pro price or purchase authority.

## 2. Free boundary — fixed

The following current behavior remains Free:

- title, optional subtitle, optional URL, and local logo input;
- Minimal, Split, and Gradient templates;
- Light/Dark theme controls, colors, alignment, and safe-area guide;
- live 1200×630 canvas preview;
- browser-local design-setting persistence under `nw_og_settings` except the uploaded logo;
- normal single-image PNG download;
- JA/EN UI.

Billing availability must not block this Free single-image workflow.

## 3. Paid boundary — one additive capability

Current runtime supports exactly one paid capability boundary:

1. `batchGeneration` — parse the current CSV-like `title,subtitle,url` batch input and generate/download multiple 1200×630 PNG images using the current design settings.

Batch parsing and the resulting multi-download sequence are one product capability, not separate entitlements. This contract does not expand the parser into full RFC CSV support.

## 4. Legacy entitlement hardening

Until live server-verified migration, ordinary batch execution requires both:

- `status.active === true`; and
- exact `status.entitlement === "nicheworks_pro"`.

Missing entitlement must fail closed. The bridge also re-applies the shared gate before `#batchDownload` executes through the normal UI path, so a forged visibility state, a tool-local `nw_pro_key`, or a replaced `window.NW.hasPro` value is not sufficient for the ordinary batch button path.

This is interim legacy hardening only. Browser state is not future purchase proof.

## 5. Product-scoped staging

`tools/og-image-maker/product-scoped-controller.mjs` is a non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

The staged contract requires:

- an explicit configured product ID;
- a complete unique feature mapping for `batchGeneration`;
- server-backed `refreshProState({ productId })` verification;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- batch activation only when the verified server response contains the mapped feature.

Wrong-product, local/browser-only, unverified, missing mapping, or entitlement-refresh failure states fail closed.

For production migration of this approved bundle member, the configured product ID must be `nicheworks.pro` plus the approved OG Image Maker feature mapping.

## 6. Privacy boundary

OG titles, subtitles, URLs, batch rows, and logo images can contain unpublished or private project information. Billing/entitlement requests may contain fixed product/feature metadata only.

Do not send through billing/entitlement paths:

- title, subtitle, or URL values;
- uploaded logo bytes, dimensions, object URLs, or filenames;
- batch input rows;
- generated canvas/image data;
- generated PNG blobs/data URLs or filenames;
- saved design-setting values.

The existing canvas/logo/batch-generation workflow remains browser-local. Analytics must not include these user-provided or generated values.

## 7. Live migration requirements

Migration is complete only when:

1. real `nicheworks.pro` commercial configuration is registered in `config/billing/products.json`;
2. the `batchGeneration` feature ID is approved under that shared product;
3. checkout uses the common billing endpoint for `nicheworks.pro`;
4. signed Stripe webhook fulfillment records the matching entitlement in D1;
5. public runtime verifies shared-product server state before enabling batch generation;
6. the current Free single-image workflow remains independent of billing availability;
7. inactive/failed entitlement checks leave Free preview and single PNG export usable;
8. unrelated product entitlements cannot unlock batch generation;
9. billing/entitlement traffic contains no OG text, logo, batch rows, or image data;
10. legacy `nicheworks_pro`, `nw_pro_key`, and DOM visibility stop being authoritative;
11. reload re-verifies server entitlement instead of trusting browser-local state.

Return path: `/tools/og-image-maker/`.

## 8. Commercial fields unresolved

Resolved:

- monetization class: `PRO_BUNDLE`;
- future shared product ID: `nicheworks.pro`;
- exact paid capability: `batchGeneration`.

Still unresolved:

- NicheWorks Pro price/currency;
- Stripe Product and Price IDs;
- production OG Image Maker feature ID;
- restore/account policy;
- historical-purchaser treatment;
- live/test rollout and migration timing.
