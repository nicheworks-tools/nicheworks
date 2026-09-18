# Phone QuickCheck v1 Completion Audit

Status: **V1 COMPLETE**
Baseline date: **2026-09-18**
V1 closure baseline: **181 maintained phones**

## Completion rule

Phone QuickCheck v1 is complete when the product behavior is stable and every actionable evidence gap is either:

1. resolved from acceptable primary evidence, or
2. explicitly reviewed and retained as unknown because the maintained evidence does not support a stronger canonical claim.

Completion does **not** require forcing every nullable field to a value. Unknown values remain valid where manufacturer/carrier evidence is absent, ambiguous across Japan sales variants, or the product contract deliberately forbids inference.

## Baseline

Correction note: Galaxy A35 5G was removed from the JP-maintained set on 2026-09-18. The previous record used global launch/specification sources while incorrectly declaring `market: ["JP"]`.

- phones at v1 closure: **181**
- manufacturers: **9**
- foldables: **32**
- raw package unknowns: **4 adapter / 11 cable = 15 fields**
- raw water unresolved: **3 records**
- reviewed-unresolved package/water fields: **18 / 18**
- **unreviewed package/water gaps: 0**
- battery capacity unknown: **33** — all maintained Apple records; intentional under current policy
- charger guidance missing at v1 closure: **62**
- handset-side wired maximum missing at v1 closure: **86**
- PPS unknown at v1 closure: **152**
- wireless standard missing at v1 closure: **74**

The final four charging counts are **not automatically defects**. They are evidence-sensitive fields and must not be filled by inference merely to reduce an unknown count.

## Package review closure

All remaining package unknown fields are now explicitly recorded in `data/reviewed-unknowns.json` with a reason and reviewed primary-source URLs.

The remaining raw unknowns are:

- Galaxy A36 5G: cable
- Xperia 1 VI: adapter + cable
- Xperia 10 VI: adapter + cable
- Xperia 5 V: adapter + cable
- Xperia 10 V: adapter + cable
- Xperia 1 V: cable
- Xperia 10 IV: cable
- AQUOS sense5G: cable
- AQUOS R6: cable
- AQUOS R5G: cable
- AQUOS zero5G basic: cable

These are not silently converted to `included` or `not_included`. Exact JP in-box evidence was not sufficient for the canonical record, or package state is not safe to generalize across Japan sales variants.

## Water review closure

The remaining raw water unknowns are:

- Pixel 4a (5G)
- Pixel 4a
- OPPO A54 5G

Primary safety/specification material was reviewed. It does not support converting these records to the combined UI claim `not_resistant` (“非防水・非防塵”), so the canonical value remains unknown and each record is registered as `reviewed_unresolved`.

Galaxy Z Flip 5G and Galaxy M23 5G were separately resolved to explicit `not_resistant` states from Japan-market primary evidence.

## Intentional / evidence-sensitive unknowns

### Apple battery capacity

All 33 current Apple records intentionally keep `charging.battery.capacityMah` unknown. The data contract rejects guessed Apple mAh values unless the policy is explicitly revised.

### Charger guidance / handset maximum / PPS / wireless

A null or unknown value is not itself a completion defect. These fields may be populated only when maintained evidence supports the exact semantic claim:

- `wiredRecommendedW`: charger guidance / adapter class
- `wiredMaxW`: handset-side maximum, never inferred from charger guidance
- `pps`: explicit supported/required/not-supported state only with evidence
- `wirelessStandard` / `wirelessMaxW`: source-backed wireless capability only

## Charging evidence review closure

The maintained charging dataset has been re-audited around **positive claims**, not raw null counts.

Machine-checked invariants:

- wired charger guidance / handset max / protocol / explicit PPS state with missing `sources.chargingUrl`: **0**
- wireless standard/max claims with missing `sources.wirelessUrl`: **0**
- PPS state without an explicit PPS protocol label: **0**
- PPS protocol label without a matching explicit PPS state: **0**

Pixel 8a was corrected during this audit: `pps: supported` was reverted to `unknown`. The maintained Pixel 8a primary material explicitly establishes USB Power Delivery, but does not support promoting PPS to a device capability claim.

The remaining raw null/unknown counts are therefore retained as evidence-sensitive unknowns unless future primary evidence justifies a stronger claim.

## Final automated QA

The CI now exercises the final functional and responsive contracts:

- alias/model search and JP/EN switching;
- manufacturer, connector, and release-year filters;
- newest, lightest, and compact sorting;
- empty-result and data-load failure states;
- mobile bottom-sheet open/close, backdrop dismissal, and Escape dismissal;
- foldable folded/unfolded rendering;
- source-backed unknown/non-resistant rendering;
- Amazon affiliate contract in the dedicated affiliate check;
- static responsive structure for desktop >900px, tablet/mobile <=900px, narrow <=600px, and phone <=480px. The <=480px contract covers 320 / 390 / 414px phone widths.

A true pixel-level visual browser inspection is **not represented by these Node/static-contract tests**. The repository is code/data complete after these gates; a human or browser-rendering smoke test remains the only non-automated visual check.

## Final rendered browser smoke

The final pixel-level browser smoke was completed on **2026-09-18** in headless Google Chrome with Japanese Noto CJK fonts installed.

Temporary audit PR: **#1279** — closed without merge after inspection.

Successful final run: **GitHub Actions run 35339894575**.

Rendered and checked viewports:

- **320 px** — mobile bottom sheet; 181 rows loaded; no horizontal overflow; Japanese detail labels preserved horizontally; long values wrap in the value column only.
- **390 px** — mobile bottom sheet; JP and EN rendering exercised; no horizontal overflow.
- **414 px** — mobile bottom sheet; no horizontal overflow.
- **768 px** — mobile/tablet bottom sheet; no horizontal overflow.
- **1280 px** — desktop list + detail pane; no horizontal overflow.

The rendered smoke also verified:

- official source links are present in the detail view;
- the Amazon CTA is visible;
- mobile body scrolling locks while the sheet is open;
- close-button dismissal works;
- all target viewports load the full **181-model** dataset;
- no page-level JavaScript errors were observed by the smoke runner.

During the visual audit, a real 320 px regression was found: the Japanese 「ワイヤレス」 label could collapse into per-character wrapping when a long right-side value consumed the row width. PR **#1283** fixed the detail grid to preserve the label column and allow only the value column to shrink. The final rendered run passed after that correction.

## V1 completion state

Phone QuickCheck v1 is complete under the maintained contract:

- v1 closure baseline: **181** JP-maintained phone records;
- **32** foldables with explicit folded/unfolded handling;
- package/water unknowns are either source-resolved or explicitly registered as `reviewed_unresolved`;
- **unreviewed package/water gaps: 0**;
- positive charging/wireless claims require source URLs;
- PPS state/protocol semantics are regression-checked;
- automated behavior/responsive/affiliate/data/source audits pass;
- final rendered Chrome smoke passed at 320 / 390 / 414 / 768 / 1280 px.

Future work is maintenance: new models, source changes, corrections, and evidence upgrades. It is not part of the v1 closure backlog.

## Post-v1 maintenance Wave 3 — 2026-09-19

Added four Japan-market 2026 models from primary manufacturer sources:

- Samsung Galaxy A57 5G
- AQUOS R11
- AQUOS wish6
- moto g37j

Maintained dataset: **187 → 191**.

AQUOS R11 and AQUOS wish6 package adapter/cable fields remain `unknown` and are registered in `data/reviewed-unknowns.json`; exact SIM-free in-box states were not promoted without direct evidence.

moto g37j uses `physicalVariants[]` to preserve the official color-dependent 194g / 196g weight split instead of collapsing it to a synthetic single weight.

## Post-v1 maintenance Wave 4 — 2026-09-19

Added four Japan-market 2026 models:

- Samsung Galaxy Z Fold8 Ultra
- Samsung Galaxy Z Fold8
- Samsung Galaxy Z Flip8
- motorola edge 60

Maintained dataset: **191 → 195**.
Foldables: **32 → 35**.

Samsung's Japan launch material provides exact folded/unfolded dimensions, weight, battery, IPX8/IP4X, Qi support, and C-to-C cable inclusion. Fold8 Ultra / Fold8 use source-backed 45W wired charging; Flip8 uses Samsung Japan's maintained 25W charging table. Fold8 Ultra / Fold8 are recorded as Qi2-capable without inventing an exact wireless maximum.

motorola edge 60 is recorded from the Japan official store with 6.7-inch display, 5200mAh battery, 68W TurboPower, IP68, 179g, and explicit charger/cable exclusion.




## Maintenance — 2026 freshness Wave 1

Applied on **2026-09-18** after v1 closure.

Dataset after Wave 1: **185 phones**.

Added four Japan-market 2026 models from manufacturer primary sources:

- Sony Xperia 1 VIII
- Sony Xperia 10 VIII
- Xiaomi 17T
- Xiaomi 17T Pro

Package provenance is now optionally stored as `sources.packageUrl` and checked as a trusted primary-source URL when present.

The Xperia 10 VIII record intentionally does not invent a wired wattage or charging protocol claim. Sony's maintained product specification establishes USB Type-C and the battery facts used here; a stronger charging claim can be added later only when exact primary evidence is maintained.

OPPO Reno15 A and Reno16 5G were reviewed during this freshness pass but are **not added in this wave** because the current non-foldable schema stores one thickness and one weight while OPPO's official Japan specifications publish color-dependent thickness/weight variants. A schema change is required before those records can be represented without collapsing official variant facts.

## Maintenance — 2026 freshness Wave 2

Applied on **2026-09-18**.

Current maintained dataset: **187 phones**.

Added a non-foldable `physicalVariants[]` schema for manufacturer-published colour/material variants whose thickness and mass differ. The schema preserves each exact thickness↔weight pair and forbids replacing them with one inferred top-level `depthMm` or `weightG`.

Runtime behavior:

- compact list size continues to use common height × width;
- weight displays the published variant range;
- detail output shows the overall depth range plus each labelled variant's exact depth and weight;
- "lightest" sorting uses the minimum published variant mass;
- Japanese/English variant labels switch with the rest of the UI.

Added two Japan-market 2026 records from OPPO primary sources:

- OPPO Reno15 A — Twilight Navy / Afterglow Pink: 8.1 mm / 195 g; Aurora Blue: 8.3 mm / 202 g.
- OPPO Reno16 5G — Twilight Purple: 8.2 mm / 182 g; Pop White: 8.4 mm / 193 g.

Both records keep source-backed 80W SUPERVOOC / 55W PPS charging, source-backed battery capacities, exact water/dust ratings, and explicit package exclusions from OPPO's exhaustive in-box lists.

## Regression guard

`scripts/check-phone-quickcheck-completion.mjs` now compares the live package/water unknown field set to `data/reviewed-unknowns.json`.

The CI fails when:

- a new package/water unknown appears without review;
- a reviewed unknown is resolved but its ledger entry is left stale;
- a ledger entry references a missing phone/unsupported field;
- evidence/review metadata is malformed;
- the intentional Apple battery rule drifts.

This makes **unreviewed actionable package/water gaps = 0** a machine-checked invariant.
