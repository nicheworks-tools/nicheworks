# ExecPlan — Phone QuickCheck charging semantics and accessory compatibility

## Goal

Turn the staged 30-phone dataset into useful purchase guidance without enabling live Amazon destinations yet, and remove ambiguity between charger guidance and device-side charging limits.

## Scope

In scope:

- `tools/phone-quickcheck/app.js`
- `tools/phone-quickcheck/data/accessories.json`
- this ExecPlan

Out of scope:

- no live Amazon affiliate URLs
- no Amazon prices or availability
- no public `index.html` promotion
- no sitemap/tools-index promotion
- no new phone records

## Compatibility rules

Accessory guidance is deterministically derived from verified canonical charging facts instead of maintaining a phone × product matrix.

Base rules:

- USB-C phone -> USB-C to USB-C cable class.
- Apple USB-C phones -> USB-PD charger class selected by the maintained official wattage guidance; 60W iPhone 18 Pro-class guidance uses the dedicated USB PD 3.1 AVS class.
- Google phones with `pps=required` -> PPS charger class selected by maintained official wattage guidance.
- Samsung -> Samsung Super Fast Charging class selected by maintained official wattage guidance.
- Other phones whose maintained protocols explicitly contain USB PD -> generic USB-PD class selected by wattage guidance.
- Qi2 -> Qi2 charger class.
- Qi2 requiring a compatible case -> dedicated Qi2 + compatible-case class.
- Qi -> Qi charger class.
- USB-C phones -> default 10,000mAh USB-C power-bank class.
- Explicit `affiliateKeys` remain supported as additive exceptions, but are not required for routine derivation.

## Charging display rule

- Rename the current broad wattage display to charger guidance (`充電器目安 / Charger guidance`) so a maintained source requirement or practical adapter class is not presented as a measured device maximum.
- Show a separate max-wired row only where the maintained source semantics support a device-side maximum. In the current dataset this applies to Samsung and SHARP records whose maintained wattage values come from published up-to/feed limits.
- Keep unknown values unknown.

## Amazon gate

- Accessory definitions contain localized labels and notes only in this PR.
- `amazonUrl` stays null.
- Runtime shows compatibility guidance plus a disabled Amazon placeholder.
- Enabling live links is a later explicit PR after the Associates account/tag/destination setup is available and disclosure text is installed.

## Verification

- `accessories.json` parses and has unique keys.
- No non-null Amazon URL is introduced.
- `app.js` continues to support empty/error data states, JA/EN, desktop detail, mobile bottom sheet, filters and recharge estimates.
- Existing 30-phone data loads without requiring per-phone accessory keys.
- Apple, Google, Samsung, Sony and SHARP each resolve to an appropriate cable/charger/power-bank class from maintained facts.
- Wireless accessory guidance is emitted only when a maintained wireless standard is specific enough to resolve Qi/Qi2.
- Existing repository runtime and SEO CI remain green.
