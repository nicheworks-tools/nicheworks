# Amazon activation — Size Converter + Tiny Audio Meter

## Goal
Activate the already-reviewed shared Amazon affiliate insertion path for Size Converter and Tiny Audio Meter using the four user-provided HTTPS `amzn.to` Special Links, without changing sizing/audio product logic or adding product price/review claims.

## Scope
- `tools/size-converter/affiliate-config.js`
- `tools/tiny-audio-meter/affiliate-config.js`
- Amazon activation/runtime regression checkers that still encode the pre-activation OFF state
- Size Converter / Tiny Audio canonical and tool specs only where they state production is still disabled

## Link mapping
- Size Converter shoes: `https://amzn.to/4hnXGRb`
- Size Converter clothing: `https://amzn.to/4dxBv8Q`
- Tiny Audio sound level meter: `https://amzn.to/4xHeUyd`
- Tiny Audio USB microphone: `https://amzn.to/4iZFUF8`

## Constraints
- Keep the shared `/assets/amazon-affiliate.js` behavior unchanged unless CI proves a real defect.
- Keep Associates disclosure and `rel="sponsored noopener"` behavior in the shared helper.
- Keep `affiliate_click` coarse: `tool`, `affiliate`, `target`, `placement` only.
- Do not send raw size input, measurements, microphone-derived data, device labels, spectrum/pitch/baseline data, or other user state.
- Do not add Amazon product images, prices, ratings, reviews, availability, or scraped product metadata.
- No changes to core sizing/audio algorithms.

## Verification
- Production configs are enabled and contain exactly the mapped HTTPS `amzn.to` targets.
- Existing helper behavior tests still verify disabled/invalid/valid states generically.
- Activation-aware checkers verify the four live targets and no raw-user-state affiliate analytics.
- Tool runtime contract audit, Tool spec audit, SEO audit, and repository data validation pass.
- Merge only after mergeability is true and all triggered CI is successful.
