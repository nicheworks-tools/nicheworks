# Tool Specification — OG Image Maker

- Slug: `og-image-maker`
- Public URL: `https://nicheworks.app/tools/og-image-maker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Canonical per-tool specification: `docs/tools/og-image-maker.md`
- Monetization class: `PRO_BUNDLE`

## Purpose

Create and download a 1200×630 Open Graph image in the browser from text, color, template, and optional logo inputs.

## Current functional contract

- Render to a fixed 1200×630 canvas.
- Accept title, optional subtitle, optional URL, and optional local logo image.
- Provide Minimal, Split, and Gradient templates.
- Provide Light/Dark text-accent themes, background/gradient colors, left/center alignment, and an optional safe-area guide.
- Re-render the preview as settings change and exclude the safe-area guide from the exported image.
- Save the current image as PNG for Free.
- Persist non-logo design settings in localStorage under `nw_og_settings` and restore them on later visits.
- Persist the shared JP/EN language preference separately.
- The exact additive Pro capability is `batchGeneration`: parse CSV-like `title,subtitle,url` rows and generate/download multiple PNGs using the current design settings.

## Inputs

- Title, subtitle, and URL text.
- Template, theme, colors, alignment, and safe-area selection.
- Optional local image file used as a logo.
- Pro CSV-like batch rows in `title,subtitle,url` order when unlocked.

## Outputs

- Live 1200×630 canvas preview.
- Free PNG download of the current design.
- Pro batch-generated PNG downloads when the paid capability is active.

## State and persistence

Text and design settings except the uploaded logo are stored in localStorage as `nw_og_settings`. The logo remains in current-page memory and is not restored after reload. `nw_lang` may persist separately.

The tool-local `nw_pro_key` helper in the base app is not authoritative for the public Pro surface because the later-loaded bridge overrides `window.NW.hasPro`. The hardened bridge requires explicit active state plus exact `nicheworks_pro` and re-applies that shared gate before ordinary batch execution.

## Privacy and network behavior

Canvas rendering, uploaded-logo processing, and batch image generation occur locally in the browser. Logo data, title/subtitle/URL values, batch rows, generated image data, or saved design settings must not enter billing/entitlement traffic.

Billing/entitlement requests may contain fixed product/feature metadata only. Analytics must not include user-provided OG text, logo/image data, batch rows, or generated PNG payloads.

## Product-scoped migration staging

`MONETIZATION_CLASSIFICATION_87.md` classifies `og-image-maker` as an approved `PRO_BUNDLE` member. Future live product authority is shared `nicheworks.pro`; legacy `nicheworks_pro` remains compatibility/migration state only.

`tools/og-image-maker/product-scoped-controller.mjs` stages exactly one paid capability: `batchGeneration`.

The staged wrapper requires an explicit product ID and complete feature map, delegates server verification to `assets/nw-product-scoped-controller.mjs`, and fails closed for wrong-product, local/browser-only, unverified, missing mapping, or entitlement-refresh failure states.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved OG Image Maker feature mapping. No tool-specific OG Image Maker paid product is created by this staging contract.

The legacy `nw_pro_key`, shared browser state, and DOM visibility are migration inputs only and must not become future purchase proof. Price/currency, Stripe Product/Price, production feature ID, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved.

## Language mode

`bilingual single-page`

## Layout class

`hybrid`

Controls are vertically usable on narrow screens while the fixed-ratio 1200×630 preview benefits from wider desktop space.

## Limits and non-goals

- Export format is PNG only in the normal single-image flow.
- The canvas renderer uses browser fonts and does not guarantee pixel-identical typography across platforms.
- Batch parsing is a simple comma split and is not a full RFC-compliant CSV parser for quoted commas/newlines.
- Safe-area rendering is only a guide and is intentionally excluded from exported PNGs.
- Uploaded logos are not persisted.
- Product-scoped staging does not launch billing or change rendering behavior.

## Acceptance criteria

- [ ] Free preview and exported single image remain 1200×630 and reflect current settings.
- [ ] Safe-area guide affects preview only and never appears in the saved PNG.
- [ ] Normal design settings persist under `nw_og_settings` while an uploaded logo does not survive reload.
- [ ] `batchGeneration` is the only paid capability boundary.
- [ ] Current legacy batch access requires explicit active state plus exact `nicheworks_pro`; missing entitlement fails closed.
- [ ] Ordinary `#batchDownload` execution re-applies the shared gate before the app handler runs.
- [ ] Setting only `nw_pro_key` or changing Pro DOM visibility does not authorize the ordinary batch action path.
- [ ] Product-scoped staging requires server-verified exact-product state and the mapped feature.
- [ ] Future live authority is shared `nicheworks.pro`.
- [ ] Billing/entitlement traffic contains no OG text, logo, batch, or generated image data.

## Implementation evidence

- `tools/og-image-maker/index.html`
- `tools/og-image-maker/app.js`
- `tools/og-image-maker/pro-bridge.js`
- `tools/og-image-maker/product-scoped-controller.mjs`
- `scripts/check-og-image-maker-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave9.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
