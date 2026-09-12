# ExecPlan — Amazon-ready foundation

## Scope

This change is limited to:

- `.agent/plans/2026-09-13-amazon-ready-foundation.md`
- `common-spec/amazon-affiliate.md`
- `assets/amazon-affiliate.js`
- `tools/size-converter/app-complete.js`

Do not touch Manual Finder or unrelated tools.

## Goal

Prepare a disabled-by-default Amazon Associates integration contract that can be activated later without blocking ongoing tool-quality work. At the same time, remove the misleading Size Converter behavior that claims a brand adjustment was applied when the current public implementation does not have a verified numeric adjustment contract.

## Steps

1. Define the minimal NicheWorks Amazon Associates rules in a dedicated common specification.
2. Add a dependency-free shared browser helper that:
   - is disabled by default;
   - renders nothing until explicitly configured with an enabled target and valid Amazon HTTPS URL;
   - shows the required disclosure only when an affiliate target is active;
   - records only coarse outbound-click metadata through GA4 when `gtag` is available;
   - never receives or transmits user measurements or microphone-derived values.
3. Change Size Converter brand handling from numeric-adjustment language to reference-note language and ensure selected brands do not alter the calculated size.
4. Leave actual Amazon targets disabled; PR2 and PR3 will wire Size Converter and Tiny Audio Meter respectively.

## Verification

- `assets/amazon-affiliate.js` must parse as plain browser JavaScript and have no external dependency.
- With no configuration, it must render no CTA and no disclosure.
- `configure({ enabled: false })` must keep all targets inactive.
- Invalid/non-Amazon URLs must not activate a target.
- Size Converter must calculate the same result whether or not a brand is selected; the brand may provide only a contextual note.
- No user-entered measurement may be included in affiliate analytics metadata.

## Non-goals

- No live Amazon Associate tag or Special Link is added in this PR.
- No product price, availability, rating, image, or scraped Amazon content is displayed.
- No redesign of Size Converter or Tiny Audio Meter is included here.
