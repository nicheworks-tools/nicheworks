# ExecPlan — Phone QuickCheck verified data wave 1

## Goal

Populate the staged Phone QuickCheck runtime with a first verified manufacturer-source dataset, proving the end-to-end data/provenance contract before broader launch coverage.

## Scope

In scope:

- `.agent/plans/2026-09-13-phone-quickcheck-data-wave1.md`
- `tools/phone-quickcheck/data/phones.json`
- `tools/phone-quickcheck/SPEC.md` only if implementation evidence/status needs updating

Out of scope:

- No promotion from `index.staged.html` to public `index.html`.
- No tools-index, sitemap or mother-site listing changes.
- No Amazon affiliate destinations.
- No live price/availability data.
- No third-party battery-capacity values.
- No foldable devices whose open/folded dimensions cannot be represented safely by the current schema.

## Wave 1 coverage

Ten current/high-value models across three manufacturers:

- Apple: iPhone 18 Pro, iPhone 18 Pro Max, iPhone 17, iPhone 17e
- Google: Pixel 11, Pixel 11 Pro, Pixel 11 Pro XL
- Samsung: Galaxy S26, Galaxy S26+, Galaxy S26 Ultra

## Evidence policy

- Device dimensions, weight, display size, connector, battery capacity, charging guidance and wireless charging values are entered only when supported by manufacturer-owned sources.
- Release year is supported by manufacturer newsroom/blog launch evidence.
- `manualUrl` may point to an official manufacturer user-guide/support destination rather than a raw PDF.
- Apple battery capacity remains `unknown` because the maintained Apple consumer specifications do not publish mAh values.
- Google and Samsung capacities in this wave are manufacturer-published and use `valueClass: official`.
- Additional evidence URLs may be stored under `sources` beyond the minimum runtime keys so later audits can trace release/charging/wireless claims.
- Unknown package contents or charging-protocol details remain unknown rather than inferred.

## Validation expectations

- Exactly 10 records.
- Unique stable IDs.
- Every record has manufacturer, model, release year, dimensions, weight, display size, USB-C connector, specification URL and `verifiedAt`.
- All source URLs use HTTPS and manufacturer-owned domains.
- Apple records have `capacityMah: null` and `valueClass: unknown`.
- Google/Samsung records have positive official `capacityMah` values.
- No record contains Amazon URLs or affiliate keys in this wave.
- Runtime-derived power-bank estimates are not persisted in JSON.
- Foldable iPhone Duo / Pixel Pro Fold models are deferred until a multi-state dimensions schema is explicitly designed.

## Promotion gate

This wave remains staged. Public promotion requires the planned broader launch dataset and public URL registration in a later PR.
