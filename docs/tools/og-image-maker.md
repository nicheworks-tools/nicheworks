# OG Image Maker — canonical tool specification

- **Slug:** `og-image-maker`
- **Display name (JA):** OG画像メーカー
- **Display name (EN):** OG Image Maker
- **Implementation:** `tools/og-image-maker/`
- **Registry state:** active (registered implementation present)
- **Category:** ogp, image, social, design
- **Common specification:** `common-spec/spec-ja.md`
- **Monetization class:** `PRO_BUNDLE`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `og-image-maker` implementation at `/tools/og-image-maker/`. It does not authorize a production rewrite or live billing launch.

## 2. Purpose

Create and download a 1200×630 Open Graph image in the browser from text, color, template, and optional logo inputs.

## 3. Inputs

- Title, subtitle, and URL text.
- Template, theme, colors, alignment, and safe-area selection.
- Optional local image file used as a logo.
- Pro CSV-like batch rows in `title,subtitle,url` order when unlocked.

## 4. Processing behavior

- Render to a fixed 1200×630 canvas.
- Accept title, optional subtitle, optional URL, and optional local logo image.
- Provide Minimal, Split, and Gradient templates.
- Provide Light/Dark text-accent themes, background/gradient colors, left/center alignment, and an optional safe-area guide.
- Re-render preview as settings change and exclude the safe-area guide from exported images.
- Save the current single image as PNG for Free.
- Persist non-logo design settings in `nw_og_settings` and restore them on later visits.
- Persist the shared JP/EN language preference separately.
- The current paid surface is one additive capability, `batchGeneration`, covering CSV-like batch parsing plus multi-image PNG generation/download.
- The later-loaded legacy bridge overrides the base app helper and requires exact shared entitlement before ordinary batch execution.
- Product-scoped controller code is migration staging only and is not live runtime authority yet.

## 5. Outputs

- Live 1200×630 canvas preview.
- Free PNG download of the current design.
- Pro batch-generated PNG downloads when `batchGeneration` is authorized.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** Implemented required-field constraints and guard clauses prevent affected actions from completing normally.
- **Unsupported or over-limit input:** Current controls and simple batch parser determine accepted input; out-of-contract values do not gain another implied parser.
- **Parse or local-file failure:** Existing exception/error paths surface failures and do not present failed operations as successful output.
- **External/network failure:** Not applicable to core canvas rendering; suite analytics, advertising, and entitlement resources are not result fallbacks.
- **Copy/download failure:** Current browser download behavior applies; no failed image operation is labeled successful.
- **Paid-action failure/absence:** Inactive or non-matching legacy entitlement leaves the complete Free single-image workflow usable while batch generation remains locked.
- **Safe fallback/reset:** Reset restores current defaults and derived state without fabricating output.
- **Runtime evidence inspected:** `tools/og-image-maker/app.js`, `tools/og-image-maker/pro-bridge.js`, `tools/og-image-maker/index.html`.

## 7. Privacy/data handling

Canvas rendering and uploaded-logo processing occur locally in the browser. The logo image is not intentionally uploaded by the tool. Ads/analytics may load separately.

Persistence evidence: `localStorage` via `nw_og_settings` and shared language state. The logo remains page-memory only.

Billing/entitlement requests may contain fixed product/feature metadata only. They must not contain title/subtitle/URL values, uploaded logo bytes or filenames, batch rows, saved design values, canvas/image data, generated PNG payloads, or user-derived output filenames. Analytics must not include those user-provided/generated values.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Controls are vertically usable on narrow screens while the fixed-ratio 1200×630 preview benefits from wider desktop space.
- Preserve the functional width class and common-spec responsive adaptation rules; do not force a universal narrow layout.
- Current audit: no concrete responsive defect was established by static inspection.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The same image workbench switches JP/EN UI labels.
- Existing languages must not be removed.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/og-image-maker/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `recommended-and-missing`.
- **FAQ:** `recommended-and-missing`.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any future usage link must remain subdued and separated from advertising per common-spec section 10-6.

### Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `og-image-maker` as an approved `PRO_BUNDLE` member. Future paid product authority is shared `nicheworks.pro`; legacy `nicheworks_pro` remains compatibility/migration state only.

Current Free behavior is fixed: all single-image design controls, local-logo processing, live preview, safe-area guide, settings persistence, and normal single PNG export remain available without paid entitlement.

The exact additive paid capability is:

1. `batchGeneration` — parse the existing CSV-like `title,subtitle,url` input and generate/download multiple PNG images using the current design settings.

Batch parsing and multi-download are one paid capability, not separate entitlements.

The public runtime remains on the hardened legacy bridge until shared-bundle commercial configuration and live migration are authorized. `tools/og-image-maker/product-scoped-controller.mjs` is staging only and delegates future server verification to `assets/nw-product-scoped-controller.mjs`.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved OG Image Maker feature mapping. No OG-specific paid product is created by this contract.

The base app's historical `nw_pro_key` helper, DOM visibility, and legacy shared state are migration evidence only and are not future purchase authority. NicheWorks Pro price/currency, Stripe Product/Price, production feature ID, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved. Detailed requirements are in `docs/billing/pro-product-contracts-wave9.md`.

## 14. Functional acceptance tests

- [ ] Free preview and exported single PNG remain 1200×630 and reflect current title/template/theme/color/alignment settings.
- [ ] Safe-area guide affects preview only and never appears in saved PNG.
- [ ] Normal design settings persist under `nw_og_settings` while uploaded logo does not survive reload.
- [ ] `batchGeneration` is the only paid capability boundary.
- [ ] Legacy batch access requires explicit active state plus exact `nicheworks_pro`; missing entitlement fails closed.
- [ ] The ordinary batch-download path re-applies the shared gate before the app handler executes.
- [ ] `nw_pro_key` or DOM visibility alone cannot authorize the ordinary batch button path.
- [ ] Product-scoped staging fails closed unless server-verified exact-product state contains the mapped batch feature.
- [ ] Future live product authority is shared `nicheworks.pro`.
- [ ] Billing/entitlement traffic contains no OG text, logo, batch-row, or generated image data.

Automated source/regression evidence includes `scripts/check-tool-runtime-contracts-wave4.mjs` and `scripts/check-og-image-maker-product-scoped-staging.mjs`. Dedicated staging checks are not represented as a full browser E2E test.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The fixed-ratio image preview benefits from wider desktop space; responsive adaptation must not alter the actual 1200×630 export dimensions.
- The legacy browser/local helper must not be treated as future billing authority.

### Implementation evidence

- `tools/og-image-maker/index.html`
- `tools/og-image-maker/app.js`
- `tools/og-image-maker/pro-bridge.js`
- `tools/og-image-maker/product-scoped-controller.mjs`
- `tools/og-image-maker/style.css`
- `scripts/check-og-image-maker-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave9.md`
