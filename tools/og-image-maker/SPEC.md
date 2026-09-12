# Tool Specification — OG Image Maker

- Slug: `og-image-maker`
- Public URL: `https://nicheworks.app/tools/og-image-maker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Create and download a 1200×630 Open Graph image in the browser from text, color, template, and optional logo inputs.

## Current functional contract

- Render to a fixed 1200×630 canvas.
- Accept title, optional subtitle, optional URL, and optional local logo image.
- Provide Minimal, Split, and Gradient templates.
- Provide Light/Dark text-accent themes, background/gradient colors, left/center alignment, and an optional safe-area guide.
- Re-render the preview as settings change and exclude the safe-area guide from the exported image.
- Save the current image as PNG.
- Persist non-logo design settings in localStorage under `nw_og_settings` and restore them on later visits.
- Persist the shared JP/EN language preference separately.
- Gate CSV batch generation/multi-download through the legacy shared `NWPro.getLocalStatus()` / `nicheworks_pro` state while this tool awaits product-scoped billing migration.

## Inputs

- Title, subtitle, and URL text.
- Template, theme, colors, alignment, and safe-area selection.
- Optional local image file used as a logo.
- Pro CSV-like batch rows in `title,subtitle,url` order when unlocked.

## Outputs

- Live 1200×630 canvas preview.
- PNG download of the current design.
- Pro batch-generated PNG downloads when the current shared Pro state is explicitly active.

## State and persistence

Text and design settings except the uploaded logo are stored in localStorage as `nw_og_settings`. The logo remains in current-page memory and is not restored after reload. `nw_lang` may persist separately. The tool no longer accepts the tool-local `nw_pro_key` flag as an authoritative Pro unlock.

## Privacy and network behavior

Canvas rendering and uploaded-logo processing occur locally in the browser; the logo image is not uploaded by the tool. Ads may load separately. The current Pro bridge reads the legacy shared NicheWorks Pro state; product-scoped billing migration remains separate future work.

## Language mode

`bilingual single-page`

## Layout class

`hybrid`

Controls are vertically usable on narrow screens while the fixed-ratio 1200×630 preview benefits from wider desktop space.

## Limits and non-goals

- Export format is PNG only in the normal single-image flow.
- The canvas renderer uses browser fonts and does not guarantee pixel-identical typography across platforms.
- CSV batch parsing is a simple comma split and is not a full RFC-compliant CSV parser for quoted commas/newlines.
- Safe-area rendering is only a guide and is intentionally excluded from exported PNGs.
- Uploaded logos are not persisted.
- The legacy shared Pro bridge is migration input, not the target product-scoped commercial architecture.

## Acceptance criteria

- [ ] The preview and exported image remain 1200×630 and reflect current title/template/theme/color/alignment settings.
- [ ] Toggling the safe-area guide affects preview only and never appears in the saved PNG.
- [ ] Normal design settings persist under `nw_og_settings` while an uploaded logo does not survive reload.
- [ ] Batch input and multi-download UI remain hidden unless the current shared Pro status reports an explicit active state.
- [ ] Setting only `nw_pro_key` does not unlock batch generation.
- [ ] Image/logo processing does not upload user-selected image data to a tool backend.

## Implementation evidence

- `tools/og-image-maker/index.html`
- `tools/og-image-maker/app.js`
- `tools/og-image-maker/pro-bridge.js`
- `tools/og-image-maker/style.css`
