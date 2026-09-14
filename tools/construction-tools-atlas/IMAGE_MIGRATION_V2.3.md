# Construction Tools Atlas — Image migration baseline v2.3

Measured from PR #771 CI on 2026-09-14. This file is the migration baseline for representative images; it is not a claim that the current SVG artwork satisfies the final image contract.

## Measured current state

- Active runtime image manifests: **12** (`image-pilots.json`, `image-pilots-002.json` … `image-pilots-012.json`).
- Additional inactive legacy manifest: **1** (`image-pilot.json`).
- Active runtime image records: **180**.
- Active runtime representative-image references: **180 SVG / 0 raster**.
- Image assets under this tool: **196 SVG / 0 raster**.
- Missing runtime-referenced image files: **0**.
- Unsupported/non-local runtime references: **0**.
- Duplicate runtime source references: **0**.
- Unreferenced image assets: **16**.
- Corpus inspected by the same audit: **5,497 entries**.

## Canonical identity baseline

The legacy image manifests are name/key based rather than canonical-ID based. Automated conservative matching produced:

- **127** image records mapped uniquely to a current canonical entry.
- **12** image records ambiguous between multiple candidate IDs.
- **41** image records unresolved.
- The 127 mapped records cover **118 unique canonical entry IDs**.
- **9 canonical IDs** currently receive more than one legacy image-record mapping.

Ambiguous or unresolved legacy records MUST NOT be promoted automatically into the v2.3 primary-image registry.

### Known ambiguous examples

- 台車 / Platform cart — `hand_truck` vs `q013_dolly`
- たがね / Chisel — `chisel` vs `q012_cold_chisel`
- 水切り金物 / Flashing — `flashing` vs `q011_flashing`
- ルーフィング / Roofing underlayment — `q011_roof_underlayment` vs `roofing_felt`
- 唐草 / Drip edge — `drip_edge` vs `q014_drip_edge`
- セパレーター / Form tie — multiple `form_tie` / `separator` records
- 目地鏝 / Pointing trowel — `pointing_trowel` vs `q013_groover_trowel`
- チャンネル材 / Strut channel — `channel` vs `q012_unistrut_channel`
- 塗料皿 / Paint tray — `paint_tray` vs `q013_paint_tray`
- くし目ごて / Notched trowel — `notched_trowel` vs `q011_notched_trowel`

### Known unresolved examples

- 作業台 / Workbench
- 工具箱 / Toolbox
- シーリング目地 / Sealant joint
- 天井吊り金物 / Ceiling hanger
- ゴムハンマー / Rubber mallet
- かんな / Hand plane
- 木工ヤスリ / Wood rasp
- ラジオペンチ / Needle nose pliers
- 絶縁ドライバー / Insulated screwdriver
- ケーブルカッター / Cable cutter
- 結束工具 / Tie fastener tool
- 換気棟 / Roof vent

## Migration rule

The migration is **not** `legacy.svg -> legacy.png/webp`.

For each promoted canonical entry:

1. Resolve the correct stable canonical `entry_id`.
2. Confirm that the image depicts that canonical subject itself, not merely its category or a visually adjacent tool/material.
3. Acquire or create an appropriate raster candidate under a documented source/review process.
4. Review subject identity. A formally promoted image requires `subject_match: matched`.
5. Produce a distribution `display.webp` and `thumb.webp` from the reviewed source.
6. Add the canonical record to `data/image-registry-v2.3.json`.
7. Only `reviewed` or `verified` registry images may become formal primary representative images.
8. If a correct image is unavailable, keep the entry without a formal image rather than promote a misleading one.

SVG remains allowed for UI icons, logos, diagrams and explanatory schematics. It is not the v2.3 primary representative-image format.

## Registry states

`image_state`:

- `none` — no candidate.
- `pilot` — candidate only; not a formal representative image.
- `reviewed` — subject identity reviewed and suitable for formal use.
- `verified` — reviewed plus source/licensing/provenance checks required by the project process.

`subject_match`:

- `unreviewed`
- `matched`
- `rejected`

`migration_state`:

- `legacy_svg`
- `identity_resolved`
- `raster_candidate`
- `reviewed`
- `verified`
- `promoted`

## Wave policy

### Wave 1

Prioritize high-value, high-confusion and high-commercial-intent tools: drilling/fastening tools, hammers, wrenches, cutting/grinding/sanding tools, laser/measurement tools, caulking/sealant tools, common PPE and closely confused pairs.

### Wave 1 implementation (PR7)

PR7 starts the canonical raster path with a deliberately small reviewed set rather than maximizing count.

Promoted canonical entries:

- `rotary_hammer`
- `impact_driver`
- `cordless_drill`
- `laser_level`
- `caulking_gun`
- `angle_grinder`

Source acquisition is declared in `data/image-wave1-sources-v2.3.json`. The ledger records the canonical ID, fixed binary URL, source page, author, license, attribution, subject-review state and SHA-1. Runtime hotlinking is disabled.

`scripts/build-image-wave1-v2.3.mjs` downloads only those reviewed sources, verifies pinned SHA-1 values, retains the original raster as `images/<entry_id>/source.jpg`, and generates local `primary.webp` and `thumb.webp` derivatives. `images/ATTRIBUTION.md` is generated from the same source ledger.

The runtime resolution contract is:

1. promoted canonical record in `data/image-registry-v2.3.json`
2. legacy SVG pilot only when no promoted canonical record exists
3. no image

A promoted canonical entry owns its representative-image decision. If its local raster fails to load, the runtime omits the image instead of silently falling back to a potentially different legacy label-matched SVG.

Formal registry promotion requires all of the following:

- current canonical `entry_id`
- `subject_match: matched`
- `image_state: reviewed` or `verified`
- `migration_state: promoted`
- separate local WebP display and thumbnail files
- retained local source raster
- JA/EN alt text
- source page, binary URL, author, license, attribution and modification record

### Wave 2

Resolve the remaining active image records, including ambiguous/unresolved identity cases, then promote only records that satisfy the same subject-match and raster rules.

The legacy manifests may remain as compatibility input during migration, but the final runtime authority must become the canonical-ID image registry rather than label matching.

## Unreferenced legacy assets

The first audit found 16 unreferenced SVG files, all under `images/pilot/`: `cable-lug`, `cable-marker`, `ceiling-light`, `conduit`, `control-panel`, `distribution-board`, `emergency-light`, `flexible-conduit`, `indicator-lamp`, `junction-box`, `led-downlight`, `outlet-box`, `pull-box`, `switch-box`, `terminal-block`, and `wire-duct`.

Do not promote them merely because the files exist. They must pass canonical identity review like every other image.
