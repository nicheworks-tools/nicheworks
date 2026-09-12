# NicheWorks Amazon Associates Common Rules

Status: active implementation contract, integration disabled until valid Associate links are configured.

This file supplements `common-spec/spec-ja.md` only for pages that use Amazon Associates links. It does not replace the canonical NicheWorks common specification.

## 1. Activation model

- Amazon affiliate UI must be **disabled by default**.
- A page may expose an Amazon CTA only when all of the following are true:
  - the integration is explicitly enabled for that tool;
  - the target has a non-empty HTTPS Amazon URL produced for the NicheWorks Associates account;
  - the CTA clearly says that the destination is Amazon.
- Empty, placeholder, test, or unverified URLs must never be shown to users.
- Amazon readiness must not block normal tool development. Tools must remain fully usable while affiliate integration is disabled.

## 2. Disclosure

When at least one Amazon affiliate CTA is active on a page, show a visible disclosure with the following Japanese wording or the program-required equivalent current wording:

> Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。

For English UI, a concise equivalent disclosure may be shown alongside the Japanese wording or as the English-language variant.

Do not show the disclosure as if the link were editorially independent when it is an affiliate link.

## 3. Link and content rules

- Use Amazon-provided Associates/Special Links or other Amazon-approved linking mechanisms for the configured account.
- The CTA label must identify Amazon, for example:
  - `Amazonでシューズを探す`
  - `Amazonで騒音計を探す`
- Do not use deceptive labels such as `商品を見る` when the destination is an affiliate Amazon page.
- Do not scrape or manually copy live Amazon price, availability, star rating, review count, or other dynamic Amazon catalog data.
- Product price/availability/rating/image data may be displayed only through a currently permitted Amazon-provided mechanism and only when the implementation complies with the then-current Associates rules.
- Do not use floating, popup, forced, or interstitial affiliate UI.
- Affiliate CTAs must remain secondary to the tool's primary task.

## 4. Privacy and analytics

Affiliate analytics must follow the NicheWorks privacy contract.

Allowed GA4 event:

`affiliate_click`

Allowed coarse parameters:

- `tool`
- `affiliate` (normally `amazon`)
- `target` (for example `shoes`, `clothing`, `sound_level_meter`, `usb_microphone`)
- `placement`

Do **not** send user-entered or derived values, including but not limited to:

- body measurements;
- foot length or width;
- selected/estimated size;
- microphone samples;
- loudness, pitch, spectrum, device labels, or microphone-derived values;
- free-text input or other user content.

If GA4 is unavailable, the affiliate link must still work and no replacement tracking service is added.

## 5. Tool integration contract

Pages using the shared helper should load `/assets/amazon-affiliate.js` and explicitly configure only their own targets.

The helper contract is intentionally small:

- `configure(config)` sets the disabled/enabled state and target URLs.
- `mount(options)` renders a CTA only when its configured target is active and valid.
- `renderDisclosure(container)` displays disclosure only when at least one configured target is active.
- `isActive(target)` may be used by tool UI to decide whether affiliate UI should be present.

Do not pass tool state, measurements, query text, microphone values, or result details into the helper.

## 6. Initial NicheWorks targets

The first planned integrations are:

- Size Converter
  - `shoes`
  - `clothing`
- Tiny Audio Meter
  - `sound_level_meter`
  - `usb_microphone`

Manual Finder is managed in its own workstream and is outside this contract's initial implementation PRs.

## 7. Release gate

Before turning any target on:

1. Confirm the NicheWorks Amazon Associates account is ready to use the intended link.
2. Insert the real approved Amazon URL for the target.
3. Confirm the CTA explicitly names Amazon.
4. Confirm disclosure becomes visible.
5. Confirm `affiliate_click` contains only the approved coarse metadata.
6. Confirm the tool remains functional when the helper or GA4 is unavailable.

Until all six checks pass, keep that target disabled.
