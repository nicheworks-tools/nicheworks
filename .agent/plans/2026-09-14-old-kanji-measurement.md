# ExecPlan — Old Kanji cluster measurement

## Scope

Add privacy-safe GA4 click measurement for the eight-tool Old Kanji search cluster without changing existing GA4 setup, tool payload processing, Amazon attribution, or billing state.

## Events

- `old_kanji_handoff`: source tool, destination tool, placement only.
- `support_click`: tool, provider (`ofuse` or `ko-fi`), placement only.
- `old_kanji_pro_click`: tool and placement only, and only for an actually enabled Pro CTA. Disabled/billing-unavailable controls must not emit this event.
- Existing Amazon helper remains the sole producer of `affiliate_click`; this work must not duplicate Amazon events.

## Privacy boundary

Never include searched kanji, names, addresses, OCR text, pasted documents, conversion content, image names, link text, raw href/query strings, localStorage content, or other user-derived values in analytics.

## Implementation

Create one shared `/assets/old-kanji-analytics.js` click-delegation module. Seven Old Kanji pages already load `/assets/nw-pro-entitlement.js`; that shared asset will load the analytics module only when the current pathname is one of those Old Kanji tools. Kanji Modernizer does not load the entitlement asset, so its page will load the same analytics module explicitly.

Update the canonical cluster contract with exact event names/parameters. Add a read-only regression checker and run it from the existing tool runtime audit workflow.

## Validation

- all eight tool slugs are allowlisted;
- handoff events only resolve destinations within the eight-tool cluster;
- support events only resolve OFUSE / Ko-fi;
- disabled Pro controls cannot emit Pro click events;
- the analytics module contains no input/value/text extraction and does not inspect query strings for event payloads;
- Amazon `affiliate_click` behavior remains owned by `/assets/amazon-affiliate.js`.