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
- battery capacity unknown: **34** — all maintained Apple records; intentional under current policy
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

All 34 current Apple records intentionally keep `charging.battery.capacityMah` unknown. The data contract rejects guessed Apple mAh values unless the policy is explicitly revised.

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

## Post-v1 maintenance Wave 30 — 2026-11-02

Backfilled four separately evidenced Japan retail SKUs **232 → 236**, unchanged **11 manufacturers / 36 foldables**: Sony Xperia 5 SIM-free **J9260 (2020)**; SHARP AQUOS sense4 lite (Rakuten 2020); SHARP AQUOS sense4 plus **SH-M16 (2020)**; and Samsung Galaxy A25 5G carrier **SM-A253J (2025)**. All USB-C handset dimensions, battery and IP grades come from original manufacturer Japan specifications. The Xperia's 2020 SIM-free J9260 date is deliberately not confused with the 2019 carrier Xperia 5. Bundle differences: Sony J9260 in-box item list includes only an audio adapter and no charging cable/brick; Rakuten sense4 lite lists only guide/warranty, no charging accessories; SHARP SH-M16 explicitly **includes USB-PD AC adapter but no cable**; au Galaxy A25 explicitly excludes cable and charger. Manufacturer-listed USB PD 3.0 supported for both SHARP products; no invented PPS/maximum watts. Sony Xperia 5 and Rakuten sense4 lite are explicit **wireless not supported**; Samsung/plus unknown where not source-proven. 22 dynamically generated Amazon accessory classes and Associates tagging untouched.

Evidence: https://www.sony.jp/xperia/xperia/xperia5/spec_sony.html, https://www.sony.jp/store/press/200818.html, https://jp.sharp/products/aquos-sense4-lite-r/spec.html, https://network.mobile.rakuten.co.jp/product/smartphone/aquos-sense4-lite/, https://jp.sharp/products/shm16/spec.html, https://www.samsung.com/jp/smartphones/galaxy-a/galaxy-a25-5g-blue-64gb-sm-a253jzbakdi/, https://www.au.com/online-manual/galaxy_a25_5g/galaxy_a25_5g_01/m_00_00_01.html. Require all Phone QuickCheck checks plus actual 5-width Chrome smoke and public JSON full parity before stating production success.

## Post-v1 maintenance Wave 29 — 2026-11-02

Extended the independently executed public Cloudflare Pages Chrome workflow to the 5-model Wave28 backfill. The script already checks the **entire public phones.json and accessories.json are deep-equal to canonical GitHub data**, validates the **22 accessory categories**, 5 viewport layout, JA/EN search, sheets and Amazon tags. Now additionally assert all new model IDs, years, mAh, **RX's cable included** vs others' no-cable package, no AC brick, no invented PD/PPS/charging max and RX's source-backed Qi negative. At **320/390/414/768/1280px** Chrome searches/selects **all five new models**, verifies actual battery display, no false PPS/PD class, and two correctly tagged Amazon accessories per model with mobile sheet close. The 232-phone public rollout is not accepted until actual public smoke is green.

## Post-v1 maintenance Wave 28 — 2026-11-02

Catalogue expansion continued, with five more historically marketed **Japan** FCNT phones from original Fujitsu/FMWORLD manufacturer product and *specific standard-package* pages. Data **227 → 232 phones**, FCNT **12 → 17**, still 11 manufacturers / 36 foldables / old 181-phone V1 closure unchanged.

### Separate sales models with overlapping core hardware
arrows U (SoftBank 801FJ), arrows J (Y!mobile/Japanet 901FJ), arrows RX (Rakuten), and SIM-free arrows M05 use nearly identical listed body size (**149×72×8.8 mm**, **166 g**, **5.8in**, **2,880mAh**, USB-C, IPX5/IPX8/IP6X), but are separately branded Japan-sale models with different carrier, retail and **in-box charging cable**. We do not collapse RX's manufacturer-confirmed **included** Type-C sample cable into the other three *not included* cable packages. Each record has its own product and package URL.

### Official primary evidence
- **arrows Be F-04K (2018 NTT docomo)**: [FMWORLD specs](https://www.fmworld.net/product/phone/f-04k/spec.html) — **144×72×8.3mm, 146g, 5.0in, 2,580mAh**, IPX5/IPX8/IP6X; [standard box/optional cable/charger](https://www.fmworld.net/product/phone/f-04k/option.html). The manufacturer explicitly places USB Type-C cables and AC adapters under *optional* accessories, not the standard bundle. No device PD/PPS/charging wattage guessed.
- **arrows U (2019 SoftBank 801FJ)**: [FMWORLD specs](https://www.fmworld.net/product/phone/arrows_u/spec.html) and [manufacturer package](https://www.fmworld.net/product/phone/arrows_u/fuzokuhin.html) — **149×72×8.8mm / 166g**, 5.8in, 2,880mAh, USB Type-C, IPX5/IPX8/IP6X; only SIM pin/guide/notices, no cable or brick. [SoftBank charging support](https://www.softbank.jp/mobile/support/manual/smartphone/arrows-u/detail/32315/) shows use of a USB-PD compatible *optional adapter*, but this alone is **not** treated as a verified handset USB PD revision or wattage.
- **arrows J (2019 Y!mobile/Japanet 901FJ)**: [FMWORLD specs](https://www.fmworld.net/product/phone/arrows_j/spec.html) / [manufacturer standard package](https://www.fmworld.net/product/phone/arrows_j/fuzokuhin.html) — **149×72×8.8mm, 166g, 5.8in, 2,880mAh, USB-C**, IPX5/IPX8/IP6X, no cable/brick in the manufacturer's **phone box**. Some historical Japanet *sales bundles* added an external power adapter; do not generalize a retailer bundle into the standard manufacturer's in-box list.
- **arrows RX (2019 Rakuten)**: [FMWORLD specs](https://www.fmworld.net/product/phone/arrows_rx/spec.html) / [manufacturer package](https://www.fmworld.net/product/phone/arrows_rx/fuzokuhin.html) / [Rakuten Japan phone sale and Qi statement](https://network.mobile.rakuten.co.jp/product/smartphone/arrows-rx/) — **149×72×8.8mm, 166g, 5.8in, 2,880mAh, IPX5/IPX8/IP6X**. Crucially **USB-C cable included** as a sample; wall adapter **not included**. Exact domestic carrier expressly says wireless charging not supported; this is source-backed `wirelessStatus:not_supported`.
- **arrows M05 (2019 SIM-free)**: [FMWORLD specs](https://www.fmworld.net/product/phone/m05/spec.html) / [FMWORLD standard package](https://www.fmworld.net/product/phone/m05/fuzokuhin.html) — **149×72×8.8mm, 166g, 5.8in, 2,880mAh, USB-C**, IPX5/IPX8/IP6X, included SIM pin/guide/papers/warranty only, not USB cable or charger.

### Provenance policy and affiliate coverage
- Only manufacturer original domain `fmworld.net` (already trusted) plus Japan Rakuten Mobile sale page for RX. FCNT first-party allowlist narrowly expands to `rakuten.co.jp`; no uncontrolled retailer URLs or affiliate links are provenance.
- No unsupported PD, PPS, handset max W or wattage recommendations. Unknown wireless remains unclaimed except Rakuten RX's explicit unsupported. No new package/water unresolved fields.
- Existing 22-category dynamic Amazon affiliate system creates USB-C cable and 10,000mAh power-bank *search* opportunities for all five (total +10 possible CTA placements, not purchases or commissions), although RX already bundles a USB-C cable; describe such accessories as optional extras, not prerequisites. Affiliation tag/disclosure unchanged.

CI must pass sources, semantic, data/completion, responsive, affiliate, SEO and runtime. Verify real public **232** canonical JSON parity and mobile/desktop chrome rather than reporting GitHub-only merge as production deployment.

## Post-v1 maintenance Wave 26 — 2026-11-02

Resumed expanding actual first-party-verified Japan phone coverage in parallel with (not after) qualified-traffic/affiliate measurement. Added four **distinct, historically sold NTT docomo FCNT products**, canonical count **223 → 227**, FCNT **8 → 12**, retained **11 manufacturers / 36 foldables** and original V1 181 baseline. No unsupported protocol/wattage/box claims; all four add a wired USB-C cable and USB-C power-bank dynamic Amazon class; arrows 5G's first-party USB PD2.0 plus charger exclusion additionally resolves the existing generic wattage-unverified USB-PD charger class. These classes use the verified 22-class tagged, disclosed Amazon runtime, not null static URLs.

### arrows Be4 Plus F-41B (docomo 2021-05-28)
- [FCNT manufacturer specifications](https://www.fcnt.com/spec/f-41b/): 148×71×9.4mm, 160g, 5.6in OLED, **3,600mAh**, USB Type-C, IPX5/IPX8 and IP6X; in-box guide and notices only, no cable/charger. Manufacturer fast charging field is a dash; **do not** infer USB PD revision or unsupported charging mode, wattage or PPS from it.

### arrows 5G F-51A (docomo 2020-07-30)
- [FCNT model specification](https://www.fcnt.com/spec/f-51a/): 164×76×7.7mm (9.5mm raised thickest part), 171g, 6.7in OLED, **4,070mAh**, USB Type-C and manufacturer-described **Power Delivery Revision 2.0**, IPX5/IPX8 and IP6X. In-box list includes earbuds USB-C–3.5mm adapter and SIM eject tool, **not** USB data/charge cable or wall brick. **Accessory headphone adapter must not be mistaken for AC charger.** No invented exact wattage or PPS.

### arrows Be4 F-41A (docomo 2020-06-25)
- [NTT docomo SKU specification](https://www.docomo.ne.jp/support/product/f41a/spec.html), [FCNT product launch](https://www.fcnt.com/news/detail/20200619.html), [FCNT/FMWORLD standard package](https://www.fmworld.net/product/phone/f-41a/option.html): 147×70×8.9mm / 144g, 5.6in, **2,780mAh**, USB-C, IPX5/IPX8/IP6X. Explicit carrier Qi negative evidence retained as `wirelessStatus:not_supported` with carrier wirelessUrl. Carrier shows PD support '-' so **do not** assert USB PD or PPS. Cable and charger not included; accessory options separate from package.

### arrows Be3 F-02L (docomo 2019-06-07)
- [NTT docomo SKU specification](https://www.docomo.ne.jp/support/product/f02l/spec.html), [FCNT/FMWORLD box](https://www.fmworld.net/product/phone/f-02l/option.html): 147×70×8.9mm / 145g, 5.6in, **2,780mAh**, USB-C, IPX5/IPX8/IP6X. Explicit Qi negative is retained with its primary source; no guessed USB PD or charger wattage. Normal box contains phone, guide, notices only; no wall adapter or USB charging cable.

### Trust and gate
- Narrow FCNT primary-origin allowlist expanded from manufacturer `fcnt.com` only to additionally the original Japanese manufacturer site `fmworld.net` and exact domestic carrier `docomo.ne.jp`, both same class of authoritative source hosts used by other manufacturers. No retailer/affiliate product URLs are accepted as provenance.
- Source-backed charging/cable/adapter and wireless flags remain in source semantically permitted values; no new unreviewed water/package unknowns. All count/spec/SEO/behavior/affiliate/total CI must pass. Public production Chrome proof should verify **227** full public JSON parity, 5 widths, and at least the new models' device facts/charging categories.

## Post-v1 maintenance Wave 25 — 2026-11-01

Added independently runnable public Chrome verification of **actual rendered** Amazon Associates purchase links, not just static `affiliateKeys` or unpopulated `amazonUrl` fields. Public accessory JSON must exactly match the canonical GitHub file (**22 classes**) alongside existing **223-phone** exact parity. The two new charger classes must be live.

At 320/390/414/768/1280px the live page must show **three Amazon links** in arrows We3 M09 detail, including the source-aware generic USB-PD class with unknown wattage, and correct EN/JA links and NicheWorks Associates disclosure. Each actual visible anchor must lead to HTTPS Amazon Japan with maintained `tag=nicheworks09-22`, fixed classification search string (not the user-entered phone query), and sponsored/noopener plus a new-tab target. Source-backed arrows Alpha2 M10 must show its specific **90W+** charger search class. No user click is simulated and no automatic Amazon navigation occurs.

Success verifies opportunity placement, not clicks, purchases, commission, approval of an affiliate account or other monetary outcomes.

## Post-v1 maintenance Wave 24 — 2026-11-01

Audited the actual Phone QuickCheck monetization path rather than inferring link availability from empty `affiliateKeys` or null `amazonUrl` records. Amazon Associate destinations are generated dynamically from `accessoryKeysFor` and `affiliate-config.js` (maintained tag `nicheworks09-22`), and rendered through the shared affiliate helper with explicit disclosure in desktop detail/mobile sheet. The baseline 223-phone dataset resolves to **719 possible CTA placements** (not clicks, impressions, affiliate earnings or product-level recommendations). Four latest FCNT devices previously had **two** CTA categories each: USB-C cable and 10,000mAh USB-C power bank.

Identified **25 phones** with an official USB-PD protocol, explicitly excluded AC adapter and *unknown* manufacturer charger watt guidance; these had no charger CTA. Added `charger-pd-check-wattage` to only those phones, with explicit warnings to verify W/PPS/voltage-current before purchasing rather than inventing 20/30/45W performance. Reclassified the two FCNT Alpha models with an official **90W charger guidance** away from the too-generic 45W category into `charger-pd-90w`; this remains a charger search band, **not** a device max input claim.

The maintained accessory catalog **20 → 22 classes**; the deterministic 223-phone dataset yields **719 → 744 possible CTA placements** (one additional link each for the 25 previously underserved phones; the two 90W cases replace an existing CTA rather than adding volume). All generated links are Amazon Japan tagged searches using approved fixed queries, in Japanese and English, with disclosures; no scraped product data, arbitrary retailer URLs, fabricated charging capability or user search-string passing.

Required evidence: Phone QuickCheck affiliate/data/behavior/SEO/runtime CI green and a follow-up real public Chrome check that validates actual tagged links/labels/disclosure and 22 accessory classes after Cloudflare deployment. No increase in real sales or earnings is asserted.

## Post-v1 maintenance Wave 23 — 2026-11-01

Independent real-public Chrome deployment proof for the four-FCNT-model Wave 22 backfill. In addition to the existing **entire public JSON deep-equality** check against canonical GitHub data, assert each newly deployed FCNT SKU's **ID, release year, battery capacity, USB PD revision**, absence of a bundled cable/AC brick, and **unknown max wired W/PPS**. This catches silent source semantic regressions and partial Cloudflare deployments.

Also run a true 320/390/414/768/1280px Chrome user journey searching for **arrows We3 M09**, selecting the result and asserting an exact-model detail and USB PD 3.0 rendering, with correct mobile sheet close. Preserve all earlier Phone (4b), CMF material variants, JA/EN, responsive and badge-close non-overlap assertions.

Public 223-phone deployment is accepted only after this PR's production smoke runs green against live HTTPS, followed by merge. No data or business UI changed in this wave.

## Post-v1 maintenance Wave 22 — 2026-11-01

Official FCNT catalogue backfill of four currently unrepresented, historically sold domestic models. Canonical set **219 → 223 phones**, 11 makers, 36 foldables. Scope is exact Japanese SIM-free or docomo SKU per manufacturer. No inferential wattage or PPS; unchanged intentional Apple battery unknown baseline.

### arrows We3 M09 (2026 Japan SIM-free)
- FCNT SIM-free [specification](https://www.fcnt.com/spec/m09-sim-free/) and [launch notice](https://www.fcnt.com/news/33202/) explicitly establish June 25, 2026, 156×73×9.0mm, 189g, 6.1in, 5,000mAh, USB-C and **Power Delivery 3.0**, IPX6/IPX8/IPX9 / IP6X. Manufacturer's standard in-box list contains **quick-start guide only**, so no cable or AC adapter. Exact M09 (SIM-free) SKU; don't conflate with Docomo F-52G or Rakuten's M09-RM variant.

### arrows N F-51C (2023 docomo)
- [FCNT SKU specifications](https://www.fcnt.com/spec/f-51c/) establish Feb 10, 2023, 155×72×8.6mm (device thickest protrusion approximately 10.8mm, not mistaken for uniform body depth), 171g, 6.24in, 4,600mAh, USB-C / **Power Delivery revision 2.0**, IPX5/IPX8 / IP6X. Only quick-start guide in official in-box list; cable and charger sold separately.

### arrows We F-51B (2021 docomo)
- [FCNT SKU specifications](https://www.fcnt.com/spec/f-51b/) establish Dec 3, 2021, 147×71×9.4mm (max raised part 10.2mm), 172g, 5.7in, 4,000mAh, USB-C / **Power Delivery revision 3.0**, IPX5/IPX8 / IP6X. Standard package contains guide/paper notice only; no USB cable or power brick.

### arrows NX9 F-52A (2020 docomo)
- [FCNT SKU specifications](https://www.fcnt.com/spec/f-52a/) establish Dec 18, 2020, 152×72×8.5mm (max raised part 9.3mm), 162g, 6.3in, 3,600mAh, USB-C / **Power Delivery revision 2.0**, IPX5/IPX8 / IP6X. Standard package: guides and SIM eject tool, **not** USB cable or charger. The SIM tool is not represented as a charging accessory.

### Evidence/quality conditions
- Each included-package status, physical value and charging protocol originates from the exact FCNT specification URL retained in the record, with product/support destination and 2026-11-01 review date.
- No manufacturer-proven wattage is available on these pages; leave **wiredRecommendedW/wiredMaxW null**, **PPS unknown**, and **wireless support unknown**, never classify lack of Qi evidence as definite non-support.
- All validators and CI must pass before merge. The already deployed live Chrome smoke must confirm public **223 phones**, full canonical JSON equality, 5 viewports and JP/EN/sheet behavior after merge.

## Post-v1 maintenance Wave 21 — 2026-11-01

Strengthened public Cloudflare Pages real-Chrome tests after the four-model Nothing Japan catalog addition. The runtime script already deep-compares the **entire** public `phones.json` with canonical GitHub data; now it also explicitly asserts Phone (4a)'s 50W and Japanese cable inclusion, Phone (4a) Pro's primary wireless-negative and charger omission, Phone (2a)'s 45W and negative wireless, and CMF Phone 1's 33W PPS with two exact thickness↔weight pairs.

In Chrome at **320/390/414/768/1280px**, the actual live page must search for `CMF Phone 1` and display both 8mm/197g standard and 9mm/202g vegan-leather values with distinct English labels. Existing JP/EN, older Phone (4b) sheet, horizontal overflow and ×-button badge collision tests remain intact. A successful Github source CI is not sufficient: this PR explicitly triggers the *public* browser workflow against the already merged 219-phone live page.

## Post-v1 maintenance Wave 20 — 2026-11-01

Backfilled four previously absent Nothing models from Japanese first-party manufacturer/carrier evidence. **215 → 219 phones**, **11 manufacturers**, **36 foldables**. `updatedAt` advances to 2026-11-01; original V1 181 baseline retained. No new unreviewed package/water unknown fields.

### Nothing Phone (4a) — 2026 JP au retail unit
[au's official Japan sale SKU](https://onlineshop.au.com/disp/CSfLastGoodsPage_001.jsp?GOODS_NO=14595&dispNo=001007) records **163.9 × 77.5 × 8.5 mm**, **205 g**, 6.78-inch screen, **5,080 mAh**, IP64 and an included USB-C cable; no adapter appears in its complete in-box listing. The [Nothing Japan manufacturer's product](https://jp.nothing.tech/products/phone-4a) explicitly supports **50 W fast charging**; no inferred PPS status, charger recommendation or wireless negative claim. Manufacturer [general box evidence](https://support.nothing.tech/hc/en-us/articles/43193532938513-What-s-included-in-the-box-for-Phone-4a) supports cable inclusion. Note: Nothing generic laboratory support uses 163.8 × 77.45 × 8.55mm; the maintained JP record deliberately uses au's exact sold-unit specifications.

### Nothing Phone (4a) Pro — 2026 JP Rakuten A069P
[Rakuten Mobile A069P Japan SKU](https://network.mobile.rakuten.co.jp/product/smartphone/phone-4a-pro/spec/) and [press announcement](https://corp.mobile.rakuten.co.jp/news/press/2026/0415_01/) establish **163.6 × 76.6 × 7.9 mm**, **210 g**, 6.83-inch display, **5,080 mAh**, IPX5/IP6X, **wireless charging unsupported**, USB-C cable included and wall adapter not included. [Nothing Japan product page](https://jp.nothing.tech/products/phone-4a-pro/) states **50 W fast charging**; leave PPS unverified. Nothing global lab measures 163.66 × 76.62 × 7.95mm, but JP carrier specifications intentionally govern this canonical A069P record.

### Nothing Phone (2a) — 2024 Japan direct product
[Nothing JP product](https://jp.nothing.tech/products/phone-2a) and [Nothing lab dimensions](https://support.nothing.tech/hc/en-us/articles/22960522674321-What-are-the-dimensions-weight-of-Phone-2a) establish **161.74 × 76.32 × 8.55 mm**, **190 g**, 6.7-inch AMOLED, **5,000 mAh**, **45 W charging**, IP54, USB-C cable in box and no wall adapter; [official wireless support answer](https://support.nothing.tech/hc/en-us/articles/22960579342737-Does-Phone-2a-support-wireless-charging) explicitly says **wireless charging not supported**. No PPS or charger requirement inferred.

### CMF by Nothing Phone 1 — Japan IIJmio unit
[IIJmio Japan sale specification](https://www.iijmio.jp/campaign/device/nothing202410.html) and [dated original Japan release](https://www.iijmio.jp/info/iij/1726809877.html) establish **164 × 77 mm**, **8.0 mm/197 g standard black-green** and **9.0 mm/202 g vegan-leather orange**. Preserved as paired `physicalVariants[]` rather than a misleading averaged thickness or weight. 6.67-inch display, [Nothing Japan](https://jp.nothing.tech/products/cmf-phone-1) **5,000 mAh** and **33 W fast charging**. Japanese carrier explicitly labels **33 W PPS** and **IPX2/IP5X**; `PPS` is a carrier-supported charging protocol, with a separate unknown adapter recommendation. The retailer's complete normal phone package contains USB-C cable and no adapter. The historical IIJmio *limited promotional bundle* with extra earbuds is not generalized into the phone's standard box. Wireless charging absence is not guessed from lack of a positive claim.

### Source safety and validation
- The Nothing trusted first-party-domain list is narrowly extended to official Japan carrier domains `au.com` and `iijmio.jp`; remaining third-party hosts are rejected.
- Package and water evidence tied to exact Japanese direct/carrier variant, and source-backed wired charging and PPS only. CI must validate dataset/source/semantic/completion/behavior; after merge require actual Chrome/public JSON exact parity at 219 with all 5 viewport checks.

## Post-v1 maintenance Wave 19 — 2026-10-31

Expanded the real production Chrome smoke to enforce the new **Wave 18 four-model** deployment facts in addition to the existing exact full-file JSON parity assertion. The public JSON must include FCNT arrows We2 M07 with its 4,500mAh battery; Nothing CMF Phone 2 Pro with 33W/negative wireless; Nothing Phone (3a) Lite with JP USB-C cable and negative wireless; and Nothing Phone (3) with JP A024 cable inclusion plus 15W wireless. This specifically guards against cross-regional package-state regressions, stale deploys and unsupported wireless claims. Five viewport browser checks, JP/EN, and badge-close non-overlap remain intact.

Do not declare the public **215-phone** release verified until GitHub Actions actually fetches and confirms the public page and JSON.

## Post-v1 maintenance Wave 18 — 2026-10-31

Backfilled four **existing-maker** Japan-market phones using first-party manufacturer and Japanese carrier sources. Maintained **211 → 215 phones**, **11 manufacturers**, **36 foldables** (no new unreviewed package or water unknown fields). Existing V1 closure baseline of 181 unchanged.

### FCNT arrows We2 M07 (SIM-free, released 2024-08-16)
[FCNT model-specific SIM-free specifications](https://www.fcnt.com/spec/m07-sim-free/) and [official release notice](https://www.fcnt.com/news/1008/): 155 × 73 × 8.9mm / 179g; 6.1-inch display; 4,500mAh; USB Type-C / USB PD Rev 3.0; IPX5/IPX8 and IP6X. The published in-box list contains only a quick-start guide, supporting cable/adapter not included for M07. Charge wattages, PPS and wireless remain unknown.

### Nothing CMF Phone 2 Pro A001 (Japan carrier, released 2025-07-24)
[Rakuten carrier SKU specifications](https://network.mobile.rakuten.co.jp/product/smartphone/cmf-phone-2-pro/spec/) and [2025 Japan launch](https://corp.mobile.rakuten.co.jp/news/press/2025/0722_01/): a 5,000mAh phone with 6.77-inch display, IPX4 / IP5X, wireless charging **not supported**, cable included and AC adapter not included. Manufacturer [JP product page](https://jp.nothing.tech/products/cmf-phone-2-pro) states 33W fast charging; Nothing's [manufacturer support](https://support.nothing.tech/hc/ja/categories/32612177779473-CMF-by-Nothing-Phone-2-Pro) gives exact device laboratory dimensions **164.08 × 78.06 × 7.80mm** and weight **185g**. The manufacturer's preference for a PPS-capable charger is not incorrectly promoted to mandatory device PPS support.

### Nothing Phone (3a) Lite A001T (Japan carrier, released 2026-01-15)
[Rakuten A001T specifications](https://network.mobile.rakuten.co.jp/product/smartphone/phone-3a-lite/spec/) and [official Japanese carrier announcement](https://corp.mobile.rakuten.co.jp/news/press/2026/0107_01/): 6.77-inch display, 5,000mAh, IPX4 / IP5X, source-backed wireless **not supported**, cable included and charger not included. Manufacturer [Japan product page](https://jp.nothing.tech/products/phone-3a-lite) confirms 33W fast charging; [manufacturer support](https://support.nothing.tech/hc/ja/categories/37560459056913-Nothing-Phone-3a-Lite) provides unrounded laboratory dimensions **164.10 × 78.08 × 8.35mm** and **199.2g** (the carrier rounds to 164 × 78 × 8.3mm / 199g).

### Nothing Phone (3) A024 (Japan carrier, released 2025-08-28)
[Rakuten A024 Japan SKU specification](https://network.mobile.rakuten.co.jp/product/smartphone/phone-3/spec/) and [domestic launch](https://corp.mobile.rakuten.co.jp/news/press/2025/0820_01/) verify 160.6 × 75.59 × 8.99mm, 218g, 6.67-inch display, 5,150mAh, USB-C, IPX8 / IP6X, and **USB-C cable included / AC charger excluded**. [Nothing JP manufacturer product](https://jp.nothing.tech/products/phone-3) expressly supports 15W wireless charging; recorded as "Wireless charging" **without guessing Qi version**. Device wired wattage and PPS remain uncommitted without a source-backed in-schema reference. **Important provenance conflict**: [Nothing generic support](https://support.nothing.tech/hc/ja/categories/34659490954897-Nothing-Phone-3) lists a general box without a cable, but the JP carrier A024 SKU spec expressly includes the Nothing C-to-C cable. Preserve the SKU-specific carrier box fact; do not collapse cross-region packaging.

### Gates
- Zero new unreviewed actionable package/water unknown fields. Non-Apple battery capacities all official/manufacturer sourced; Apple 34 remain intentionally unknown.
- CI and post-merge production Chrome HTTP/JSON exact equality for 215 phones and 320/390/414/768/1280px browser behavior are required before declaring public completion.

## Post-v1 maintenance Wave 17 — 2026-10-31

Strengthened the independent live Cloudflare Pages smoke to verify **whole-file canonical JSON parity**, not merely total phone count, against the GitHub checkout used by CI. Public phones.json must structurally match checked-in data (all device IDs, source facts, attributes, provenance and revision metadata); this detects stale partial deploys or unexpected source changes. Added targeted checks for the three Wave 16 Japan-market models: Alpha M08 bundled adapter, We2 Plus M06 inclusion, Nothing Phone (3a) explicit wireless non-support. Existing Alpha2/Phone (4b) checks and all 5 production browser viewports remain intact.

PR-triggered production verification is required to establish public **211 phones**, and a main-push production smoke should continue guarding all future Phone QuickCheck updates.

## Post-v1 maintenance Wave 16 — 2026-10-31

Verified Japan-market backfill of three missing phones from the existing two under-covered manufacturers: FCNT and Nothing. Dataset **208 → 211**; manufacturers **11**, foldables **36** unchanged. All in-box, charging-protocol and water facts are tied to official sources; wireless support on Nothing Phone (3a) is explicitly verified negative.

### FCNT arrows Alpha M08 (SIM-free, 2025-08-28)
- [Manufacturer SIM-free specifications](https://www.fcnt.com/spec/m08-sim-free/) and [release confirmation](https://www.fcnt.com/news/27917/) state 156 × 72 × 8.8 mm; approx. 188 g; 6.4-inch screen; 5,000 mAh; USB-C and USB Power Delivery Revision 3.0; IPX6/IPX8/IPX9 and IP6X.
- FCNT's official SIM-free in-box list explicitly includes both **AC adapter a02 (90W)** and **USB cable**, so both are `included`. 90W is a **charger recommendation/adapter capability**, not assumed as device input maximum; `wiredMaxW` remains null. No PPS or wireless charging capability is inferred.

### FCNT arrows We2 Plus M06 (Rakuten Mobile, 2024-10-15)
- [Official M06 specifications](https://www.fcnt.com/spec/m06/) and [launch announcement](https://www.fcnt.com/news/1005/) show 162 × 75 × 8.5 mm; approx. 182 g; 6.6-inch display; 5,000 mAh; USB-C + USB Power Delivery Rev 3.0; IPX5/IPX8 + IP6X.
- FCNT's exhaustive official M06 **in-box list names only the quick-start guide**, so adapter and cable are marked `not_included` for this **specific M06 SKU**. Carrier-specific F-51E is not silently conflated with M06. Charging watts/PPS/wireless remain unknown.

### Nothing Phone (3a) A059 (Rakuten Mobile Japan, 2025-04-15)
- [Rakuten Japan product specification](https://network.mobile.rakuten.co.jp/product/smartphone/phone-3a/spec/) and [2025 launch notice](https://corp.mobile.rakuten.co.jp/news/press/2025/0408_01/) establish 163.52 × 77.5 × 8.35 mm; 201g; 6.77-inch screen; 5,000 mAh; USB Type-C; IPX4 + IP6X; official **wireless charging: not supported**.
- [Nothing's own explicit in-box list](https://support.nothing.tech/hc/ja/articles/32978953822609-Phone-3a-%E3%81%AE%E3%83%9C%E3%83%83%E3%82%AF%E3%82%B9%E3%81%AB%E3%81%AF%E4%BD%95%E3%81%8C%E5%85%A5%E3%81%A3%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%81%8B) confirms a USB-C cable and no AC charger. No USB-PD/PPS protocol or device-side wattage is inferred from retailer claims or other regions.

### Verification
- Completion/data/source semantics retain **zero unreviewed package/water fields**; the three records add no false positives or arbitrary wattage.
- The live-production Chrome workflow merged in [PR #1445](https://github.com/nicheworks-tools/nicheworks/pull/1445) will run on the main push; pending CI and deployment assertions must pass before claiming public 211.

## Post-v1 maintenance Wave 15 — 2026-10-31

Added a measured production browser regression to the already merged mobile badge-close fix: the live stylesheet must contain the 46px clearance rule; at each mobile/tablet viewport (320/390/414/768) the actual Chrome badge and 32px close-control bounding rectangles must **not intersect**. Both the close control's 32px minimum hit area and the existing JP/EN, search, mobile-sheet and 208-phone production assertions remain enforced.

The earlier 320/390px production screenshots revealed overlap despite all data tests passing. This new test will specifically fail on recurrence, including if Cloudflare serves a stale stylesheet. No business logic, model data, scope or common spec altered.

## Post-v1 maintenance Wave 14 — 2026-10-31

Live deployed Chrome screenshots at 320/390/414px from [PR #1445](https://github.com/nicheworks-tools/nicheworks/pull/1445) revealed the mobile Quick Check badge colliding with the absolutely positioned × close button. Automatic no-overflow and JP/EN checks passed but did not detect the overlap.

At the existing max-width:900px breakpoint, .bottom-sheet .detail-title now reserves 46px to clear the 32px close button positioned 14px from the right, while preserving the close touch target. The responsive contract checks the rule. Model data remains 208 phones / 11 makers / 36 foldables; historical v1 baseline remains unchanged.

Fresh public Chrome screenshots and a bounding-box non-overlap assertion are required before closing this visual defect.

## Post-v1 maintenance Wave 13 — 2026-10-31

Implemented explicit negative wireless charging state in the Phone QuickCheck runtime and data/source QA: `charging.wirelessStatus: not_supported` requires a manufacturer/carrier primary `sources.wirelessUrl` and forbids coexisting positive `wirelessStandard` or `wirelessMaxW`. The JP/EN detail view now renders **非対応 / Not supported** rather than a dash for a source-backed negative claim. Existing unknowns and affirmative wireless records retain their prior output, and behavioral coverage confirms both languages.

Applied to Japan-model **Nothing Phone (4b)** using the [Rakuten Mobile official Japan specification](https://network.mobile.rakuten.co.jp/product/smartphone/phone-4b/spec/) explicitly stating ワイヤレス充電 非対応. Model count and manufacturer count remain **208 / 11**, foldables **36**.

## Post-v1 maintenance Wave 12 — 2026-10-31

Added a second new Japan-market manufacturer, **Nothing**, with **Phone (4b)** (Japan sale 2026-10-27). Dataset **207 → 208 phones**, **10 → 11 manufacturers**, foldables unchanged at 36.

The maintained Japan Rakuten A009P [specification](https://network.mobile.rakuten.co.jp/product/smartphone/phone-4b/spec/) provides exact 164.4 × 78.22 × 8.65 mm / 210g, 6.77-inch display, 5,200mAh, USB Type-C, IPX4/IP6X, a Type-C cable in box, and no power adapter; the [Japan release notice](https://corp.mobile.rakuten.co.jp/news/press/2026/1020_01/) establishes market and launch. Official Nothing [Japan catalog](https://jp.nothing.tech/products/phone-4b) confirms the 5,200mAh capacity and official [support](https://support.nothing.tech/hc/ja/categories/43042083804945-25131) confirms the Type-C cable/in-box state.

Caution: the Nothing global laboratory dimensions are rounded to 164.4 × 78.2 × 8.6mm, but the maintained Japan carrier SKU A009P specification is more precise; use JP record values without averaging. The Japan carrier **explicitly says wireless charging unsupported**, but this tool currently has no `wirelessStatus=not_supported` schema: null is preserved rather than falsely presenting a wireless standard or wattage. Wired fast charging is confirmed in general, but there is no sufficiently exact source for a device-side maximum or adapter recommendation; therefore wattage remains unknown. Nothing recommends a PPS charger but that is not promoted to explicit device PPS support without exact evidence. This is a schema/display follow-up, not an excuse to fabricate a positive charging claim.

## Post-v1 maintenance Wave 11 — 2026-10-31

Expanded the verified Japan-market manufacturer set by **FCNT**, and added **arrows Alpha2 M10** (SIM-free). Dataset **206 → 207 models / 9 → 10 manufacturers**, 36 foldables retained. Official FCNT [specification](https://www.fcnt.com/spec/m10-sim-free/) and [Japan SIM-free launch notice](https://www.fcnt.com/news/35527/) establish 155 × 72 × 8.6 mm, approximately 187 g, 6.4-inch display, 5,370 mAh, USB-C / USB Power Delivery 3.0, IPX6/IPX8/IPX9 + IP6X, and the 2026-08-27 release. The exhaustive [included items](https://www.fcnt.com/spec/m10-sim-free/) section lists only the quick-start guide, supporting not-included cable and adapter for the SIM-free variant. The [90W compatible adapter notice](https://www.fcnt.com/accessory/charger/a02/) and [product page](https://www.fcnt.com/product/arrows/alpha2/) support a **90W recommended adapter class**, not an inferred handset maximum input; therefore `wiredMaxW = null`. PPS and wireless remain unknown without primary device-specific support documentation.

## Post-v1 maintenance Wave 10 — 2026-10-31

Added **moto g06** from Motorola Japan first-party product specifications and dated Japan launch notice.

Maintained dataset: **205 → 206**; manufacturers: **9**; foldables: **36**.

Manufacturer official [specifications](https://store.motorola.co.jp/item/MOTO_G06.html) preserve exactly: 171.35 × 77.50 × 8.31 mm, approximately 194 g, 6.9-inch screen, 5,200mAh battery, USB Type-C, 10W charging, and IP64. Both the power adapter and USB cable are explicitly not included. [Manufacturer Japan-market release notice](https://store.motorola.co.jp/topics_detail.html?info_id=1148) dated 2026-03-10 states Japan retail launch scheduled for 2026-03-19.

`wiredMaxW` reflects the stated 10W device charging capability; `wiredRecommendedW` remains null. No USB-PD/PPS/wireless capability is invented; PPS is unknown and wireless fields are null. Charging, water, package, release and battery sources are stored explicitly.

## Post-v1 maintenance Wave 9 — 2026-10-31

Added **motorola edge 70 fusion**, released for Japan on **2026-10-23**.

Maintained dataset: **204 → 205**. Manufacturers: **9**. Foldables: **36**.

Canonical facts were verified against Motorola Japan's [official specification table](https://store.motorola.co.jp/item/EDGE70FUSION.html): 162.76 × 75.60 × 7.99 mm, approximately 193 g, 6.78-inch display, 7,000 mAh, 68W TurboPower, IP68/IP69, USB-C, and explicitly non-included AC adapter/USB cable. The product page's promotional summary has a conflicting 7.2 mm/177 g line; the detailed Japanese specification table and Motorola Japan's 2026-10-23 launch release both support 7.99 mm/193 g, so the canonical record uses the specification-table values.

Wireless charging and PPS remain unknown (not asserted as unsupported) because this evidence does not establish their exact device capability. The adapter guidance remains null rather than treating a supported handset charge rate as a charger recommendation.

`data/phones.json` updatedAt was advanced from the stale 2026-09-18 value to 2026-10-31 to reflect this maintained update.

## Post-v1 maintenance Wave 6 — 2026-09-19

Added three Japan-market 2026 records:

- OPPO Find X9 Ultra
- POCO X8 Pro Max
- POCO X8 Pro

Maintained dataset: **199 → 202**.

OPPO Find X9 Ultra uses `physicalVariants[]` for the official 9.1mm/236g Tundra Amber and 8.7mm/235g Canyon Orange variants. It preserves 7050mAh, 100W SUPERVOOC, 50W AIRVOOC, IPX8/IPX9/IP6X, and the explicit included 80W adapter + USB-C cable from OPPO Japan.

POCO X8 Pro Max and X8 Pro are recorded from Xiaomi Japan specifications and support FAQs with exact dimensions/weight, 8500mAh / 6500mAh batteries, 100W HyperCharge, explicit PPS + PD support, IP68, and included charger/cable.

## Post-v1 maintenance Wave 7 — 2026-09-19

Added Xiaomi 17 from Xiaomi Japan maintained support material.

Maintained dataset: **202 → 203**.

The record preserves 151.1 × 71.8 × 8.06mm / 191g, 6.3-inch display, 6330mAh, 100W wired charging, PPS/PD support, 50W Wireless HyperCharge, and IP68. Xiaomi Japan explicitly documents the bundled charging cable. The AC-adapter package state remains `unknown` and is registered as `reviewed_unresolved` because the maintained FAQ describes region-dependent package variants rather than a sufficiently exact JP retail in-box claim.

## Post-v1 maintenance Wave 8 — 2026-09-19

Added Apple's formally announced Japan-market iPhone Duo ahead of its 2026-10-23 retail release.

Maintained dataset: **203 → 204**.
Foldables: **35 → 36**.

The record preserves Apple's official folded 117.8 × 84.1 × 11.3mm and unfolded 117.8 × 164.6 × 5.2mm dimensions, 254g mass, 7.6-inch inner display, IP68, 60W-or-higher wired adapter guidance, and 25W MagSafe/Qi2 wireless charging. Apple does not publish maintained mAh, so battery capacity remains unknown under the existing Apple policy. The power adapter is explicitly separate; the exact in-box cable state remains `unknown` and is registered as `reviewed_unresolved`.




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

## Post-v1 maintenance Wave 5 — 2026-09-19

Added two Xiaomi Japan-market 2026 records:

- POCO F9 Ultra
- REDMI Note 17 Pro Max 5G

Maintained dataset: **195 → 197**.

POCO F9 Ultra preserves Xiaomi Japan's 8050mAh battery, 100W wired HyperCharge/PPS support, source-backed wireless HyperCharge capability without inventing an exact wireless input wattage, IP68, and explicit charger/cable inclusion.

REDMI Note 17 Pro Max 5G preserves the official color-dependent 8.65mm / 8.57mm thickness split using `physicalVariants[]`; all Japan variants are 229.5g. It records 10000mAh, 100W HyperCharge/PPS support, IP66/IP68, and the included 100W charger/cable.

## Post-v1 maintenance Wave 6 — 2026-09-19

Added two Xiaomi Japan-market 2026 records:

- Xiaomi 17 Ultra
- POCO M8 5G

Maintained dataset: **197 → 199**.

Xiaomi 17 Ultra uses `physicalVariants[]` to preserve the 218.4g Black/White and 219g Starlit Green split at the shared 8.29mm thickness. It records 6000mAh, 90W HyperCharge/PPS, source-backed wireless charging capability without inventing an exact wireless input wattage, IP68, and explicit cable/adapter inclusion.

POCO M8 5G records the Japan FAQ's 164 × 75.42 × 7.35mm, 178g, 5520mAh, 45W, PPS/PD/QC support, and IP66. Charger/cable package fields remain `unknown` and are registered as reviewed-unresolved because Xiaomi Japan does not establish one invariant retail in-box state for the maintained JP record.






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
