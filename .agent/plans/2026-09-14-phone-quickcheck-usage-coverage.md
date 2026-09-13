# ExecPlan — Phone QuickCheck usage documentation and accessory coverage

## Goal

Close the remaining documented Phone QuickCheck usage-documentation gap and add a permanent accessory-coverage audit for the 150-model dataset without forcing unsafe charger recommendations.

## Scope

- add Japanese and English usage/FAQ pages at `usage.html` and `usage-en.html`;
- link those pages from the main Phone QuickCheck page;
- register both usage pages in the root sitemap;
- explain charger guidance vs device-side maximum charging, USB-C vs Lightning, USB PD/PPS/proprietary charging, wireless charging, the 67% power-bank estimate, Apple mAh policy, Amazon handoffs, official-source links, and privacy behavior;
- add a permanent accessory-coverage checker that classifies all 150 phones and fails only when a safely derivable class is missing;
- report charger guidance omissions by reason instead of inventing compatibility;
- update canonical specs from `recommended-and-missing` usage documentation to present.

## Coverage invariants

Every maintained phone must resolve a cable class appropriate to its connector when that connector is supported by the product contract. USB-C phones must resolve the USB-C-to-USB-C class and Lightning phones must resolve the USB-C-to-Lightning class.

Every maintained phone with a maintained Qi/Qi2 wireless standard must resolve the corresponding wireless-charger class.

A wired charger class is required only when the maintained facts safely map to an existing generic/manufacturer-specific class. Phones with unknown wattage, unsupported/unknown generic protocol, or deliberately proprietary-only fast charging may remain without a wired-charger recommendation; the audit must classify and report those cases rather than fail them.

The shared 10,000mAh power-bank class is expected for maintained USB-C and Lightning phones because the corresponding maintained cable class provides the physical connection. Recharge-count display remains independently gated by accepted phone battery capacity.

## Verification

- usage pages are indexable, self-canonical, bilingual counterparts, and linked back to the main tool;
- main page links to the correct usage page for the active language;
- root sitemap contains both usage URLs exactly once;
- accessory coverage checker passes across all 150 maintained phones;
- behavior, data, affiliate, runtime, Tool spec, and SEO audits remain green;
- no live Amazon price/inventory claims are introduced.

## Release gate

Squash merge only after current-main mergeability is confirmed and all triggered PR checks succeed.
