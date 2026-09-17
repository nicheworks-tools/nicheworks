# NicheWorks Amazon Associates Common Rules

Status: active implementation contract. Individual tools remain fail-closed until their validated configuration is enabled; several production tools use the shared validated tagged-search format.

This file supplements `common-spec/spec-ja.md` only for pages that use Amazon Associates links. It does not replace the canonical NicheWorks common specification. Affiliate click measurement is governed by `common-spec/affiliate-outbound.md`.

## 1. Activation model

- Amazon affiliate UI must be **disabled by default**.
- A page may expose an Amazon CTA only when all of the following are true:
  - the integration is explicitly enabled for that tool;
  - the destination is a valid HTTPS Amazon Associates link for the NicheWorks account, either Amazon-generated or produced by a validated custom-link template using the configured tracking ID;
  - the CTA clearly says that the destination is Amazon.
- Empty, placeholder, test, malformed, or unvalidated destinations must never be shown to users.
- A validated deterministic template may generate many contextual destinations from canonical tool-owned catalog metadata. Do not require one SiteStripe short link per record when the same approved format can be generated safely.
- Amazon readiness must not block normal tool development. Tools must remain fully usable while affiliate integration is disabled.

## 2. Disclosure

When at least one Amazon affiliate CTA is active on a page, show a visible disclosure with the following Japanese wording or the program-required equivalent current wording:

> Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。

For English UI, a concise equivalent disclosure may be shown alongside the Japanese wording or as the English-language variant.

Do not show the disclosure as if the link were editorially independent when it is an affiliate link.

## 3. Link and content rules

- Use Amazon-provided Associates/Special Links or other Amazon-approved linking mechanisms for the configured account.
- Amazon's own help recognizes correctly formatted affiliate links created or edited outside Associates Central and provides Link Checker for validating them. A custom-link template must therefore be validated before blanket activation, but does not need a separately generated `amzn.to` short link for every record.
- Keep the tracking ID fixed in configuration. Never derive or accept an affiliate tag from user input.
- For dynamic search handoffs, build the destination only from canonical site-owned metadata such as an accepted manufacturer and model record. Never use arbitrary free-text search input as the affiliate destination query.
- The CTA label must identify Amazon, for example:
  - `Amazonでシューズを探す`
  - `Amazonで騒音計を探す`
- Do not use deceptive labels such as `商品を見る` when the destination is an affiliate Amazon page.
- Do not scrape or manually copy live Amazon price, availability, star rating, review count, or other dynamic Amazon catalog data.
- Product price/availability/rating/image data may be displayed only through a currently permitted Amazon-provided mechanism and only when the implementation complies with the then-current Associates rules.
- Do not use floating, popup, forced, or interstitial affiliate UI.
- Affiliate CTAs must remain secondary to the tool's primary task.

## 4. Privacy and analytics

Affiliate analytics must follow `common-spec/affiliate-outbound.md`.

Canonical GA4 event:

`affiliate_outbound`

The shared Amazon helper may send only these parameters:

- `tool_slug`: fixed canonical tool slug;
- `affiliate_id`: stable affiliate link or recommendation-slot identifier;
- `placement`: stable UI placement identifier;
- `merchant`: fixed `amazon`;
- `destination_key`: stable internal target key, never the full URL;
- `language`: `ja` or `en`.

For the shared helper, the configured Amazon target key is the default `destination_key`. Unless a tool provides a more specific stable `affiliate_id`, the helper derives one from the target key and placement. These identifiers must remain tool-owned fixed metadata.

Do **not** send user-entered or derived values, including but not limited to:

- body measurements;
- foot length or width;
- selected/estimated size;
- microphone samples;
- loudness, pitch, spectrum, device labels, or microphone-derived values;
- free-text input or other user content;
- model names or generated Amazon search terms as analytics parameters;
- full destination URLs, query strings, affiliate tags, or arbitrary DOM text.

If GA4 is unavailable, the affiliate link must still work and no replacement tracking service is added.

## 5. Tool integration contract

Pages using the shared helper should load `/assets/amazon-affiliate.js` and explicitly configure only their own targets.

The helper contract is intentionally small:

- `configure(config)` sets the disabled/enabled state and target URLs.
- `mount(options)` renders a CTA to one configured fixed target only when that target is active and valid.
- `mountUrl(options)` may render a validated dynamic Amazon destination, but only behind an already active coarse target key; analytics still receive only stable internal metadata and placement.
- `renderDisclosure(container)` displays disclosure only when at least one configured target is active.
- `isActive(target)` may be used by tool UI to decide whether affiliate UI should be present.

Optional `mount` / `mountUrl` analytics metadata is limited to fixed `affiliateId`, `destinationKey`, `placement`, and `language` values that comply with `common-spec/affiliate-outbound.md`. Do not pass measurements, free-text query input, microphone values, model names, generated search terms, or other user content into those fields.

A fully built Amazon URL derived only from canonical site-owned metadata may be passed to `mountUrl`; neither that URL nor its model/search term may be copied into analytics metadata.

## 6. Initial NicheWorks targets

The first planned integrations are:

- Size Converter
  - `shoes`
  - `clothing`
- Tiny Audio Meter
  - `sound_level_meter`
  - `usb_microphone`

Manual Finder is managed in its own workstream and may use a validated model-search template rather than per-record short links.

## 6A. Shared validated NicheWorks tagged-search template

NicheWorks production tools may reuse the already validated Amazon Japan tagged-search format with tracking ID `nicheworks09-22` when all query terms are fixed tool-owned metadata. The representative proof URL and verification method are recorded in each active tool configuration. A tool does not need a separate SiteStripe short link for every fixed category when it reuses this validated format.

As of 2026-09-17, the retained affiliate-candidate rollout also activates fixed-query commerce blocks for:

- Dry Meter — room measurement / air circulation / indoor drying-rack discovery;
- Light Check — shooting/streaming lighting accessories;
- Laundry Code Decode — general laundry accessories, separated from JIS interpretation;
- Moving Checklist Generator — general moving/packing supplies;
- Moving / Lease Final Check — general move-out/handoff supplies.

For these tools, user inputs, tool results, scores, measurements, selected symbols, dates, checklist state, or uploaded content MUST NOT alter the Amazon query or affiliate analytics metadata.

## 7. Release gate

Before turning any fixed target or dynamic template on:

1. Confirm the NicheWorks Amazon Associates account is ready to use the intended link format.
2. For a fixed target, insert the real approved Amazon URL. For a deterministic custom template, validate one representative generated URL with Amazon's Link Checker (or an equivalently authoritative Amazon validation path) and record that proof.
3. Confirm the CTA explicitly names Amazon.
4. Confirm disclosure becomes visible.
5. Confirm `affiliate_outbound` contains only the six parameters allowed by `common-spec/affiliate-outbound.md` and contains no user data or outbound URL.
6. Confirm the tool remains functional when the helper or GA4 is unavailable.
7. For a dynamic template, confirm user free text cannot alter the affiliate query/tag and that only canonical tool-owned metadata is used.

Until the relevant checks pass, keep that fixed target or template disabled.
