# OG Image Maker — canonical tool specification

- **Slug:** `og-image-maker`
- **Display name (JA):** OG画像メーカー
- **Display name (EN):** OG Image Maker
- **Implementation:** `tools/og-image-maker/`
- **Registry state:** active (registered implementation present)
- **Category:** ogp, image, social, design
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `og-image-maker` implementation at `/tools/og-image-maker/`. It does not authorize a production rewrite.

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
- Re-render the preview as settings change and exclude the safe-area guide from the exported image.
- Save the current image as PNG.
- Persist non-logo design settings in localStorage under `nw_og_settings` and restore them on later visits.
- Persist the shared JP/EN language preference separately.
- Gate CSV batch generation/multi-download through the legacy shared `NWPro.getLocalStatus()` / `nicheworks_pro` state while this tool awaits product-scoped billing migration.

## 5. Outputs

- Live 1200×630 canvas preview.
- PNG download of the current design.
- Pro batch-generated PNG downloads when the current shared Pro state is explicitly active.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Canvas rendering and uploaded-logo processing occur locally in the browser; the logo image is not uploaded by the tool. Ads may load separately. The current Pro bridge reads the legacy shared NicheWorks Pro state; product-scoped billing migration remains separate future work.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Controls are vertically usable on narrow screens while the fixed-ratio 1200×630 preview benefits from wider desktop space.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/og-image-maker/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] The preview and exported image remain 1200×630 and reflect current title/template/theme/color/alignment settings.
- [ ] Toggling the safe-area guide affects preview only and never appears in the saved PNG.
- [ ] Normal design settings persist under `nw_og_settings` while an uploaded logo does not survive reload.
- [ ] Batch input and multi-download UI remain hidden unless the current shared Pro status reports an explicit active state.
- [ ] Setting only `nw_pro_key` does not unlock batch generation.
- [ ] Image/logo processing does not upload user-selected image data to a tool backend.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/og-image-maker/index.html`
- `tools/og-image-maker/app.js`
- `tools/og-image-maker/style.css`
