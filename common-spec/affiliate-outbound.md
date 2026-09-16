# Affiliate outbound measurement contract

Status: normative supplement to `common-spec/spec-ja.md`
Effective: 2026-09-16

## Purpose

NicheWorks affiliate tools need one comparable GA4 event for measuring whether a visit proceeds to an approved external merchant destination. This contract defines that event without permitting arbitrary behavioral tracking.

## Relationship to the common specification

This document is the explicit, narrow exception to the Section 3 rule that prohibits adding JavaScript for tracking purposes. The exception applies only to clicks on approved affiliate outbound links and only through the existing GA4 `gtag` installation required by Section 5.

All other tracking-specific JavaScript remains prohibited unless another specification explicitly authorizes it.

## Canonical event

Event name:

```text
affiliate_outbound
```

Allowed parameters:

```text
tool_slug
affiliate_id
placement
merchant
destination_key
language
```

### Parameter contract

- `tool_slug`: canonical NicheWorks tool slug.
- `affiliate_id`: stable identifier for the rendered affiliate link or recommendation slot.
- `placement`: stable UI location such as `result`, `reference`, `footer`, or another specification-defined value.
- `merchant`: normalized merchant name such as `amazon`.
- `destination_key`: stable internal identifier for the approved destination. Do not send the full outbound URL.
- `language`: rendered UI language such as `ja` or `en`.

## Data minimization

An `affiliate_outbound` event MUST NOT contain:

- user-entered text or files;
- latitude, longitude, geolocation, postal code, or other precise location data;
- search terms entered by the user;
- free-form result text;
- full affiliate URLs, query strings, tags, or tracking parameters;
- email addresses, account identifiers, names, or other personal data;
- arbitrary DOM text copied from the clicked element.

Only the fixed parameters listed above are permitted.

## Firing rule

- Fire once when the user actually activates an approved affiliate outbound link.
- Do not fire on impression, hover, scroll, focus, recommendation rendering, or page load.
- Do not fabricate an event when a merchant destination is disabled or absent.
- Do not delay or block navigation merely to wait for analytics delivery.
- Reuse the existing global `gtag` function. Do not add another analytics SDK, tag manager, redirect service, or third-party tracking library.
- If `gtag` is unavailable, outbound navigation must continue normally.

Recommended implementation shape:

```js
if (typeof window.gtag === 'function') {
  window.gtag('event', 'affiliate_outbound', {
    tool_slug: 'example-tool',
    affiliate_id: 'example_slot_01',
    placement: 'reference',
    merchant: 'amazon',
    destination_key: 'amazon_example_01',
    language: 'ja'
  });
}
```

The example values above are placeholders for documentation only and MUST NOT be copied into production as an approved destination mapping.

## Destination integrity

- An affiliate link may be instrumented only after its destination is approved by that tool's canonical monetization or publication contract.
- Analytics work must not create, guess, replace, or broaden an affiliate destination.
- `destination_key` must resolve to the same approved destination contract used by the tool; analytics metadata is not an alternative source of truth.

## GA4 administration

Whether `affiliate_outbound` is marked as a GA4 key event is an analytics-admin decision and does not change the page implementation contract above.

## Verification

For every implementation:

1. Confirm normal outbound navigation with GA4 blocked or unavailable.
2. Confirm one event per deliberate link activation.
3. Confirm the payload contains only the six allowed fixed parameters.
4. Confirm no user input, location, full URL, or query string is sent.
5. Confirm the destination itself was already approved before instrumentation.
