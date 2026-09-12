# ExecPlan — TrashNavi municipality expansion Wave 3

## Goal

Expand the municipality-page pilot from 7 to 10 indexable municipalities using official-source demand signals already observed in Search Console, without lowering the existing 3+ distinct waste-specific link-type publication gate.

## Target municipalities

- 三重県 御浜町 (`245615`) — currently waste sorting + 2026 collection calendar
- 岐阜県 海津市 (`212211`) — currently 2026 collection calendar + bulky waste
- 茨城県 結城市 (`082074`) — currently waste sorting + 2026 collection calendar

## Official-link enrichment

Add only directly verified official sources:

- 御浜町: bulky-waste guidance and official online bulky-waste application entry point
- 海津市: official `さんあ～る` waste app guidance
- 結城市: official environment-center bring-in guidance

Use canonical `link_type` values from `DATA_MODEL.md`, preserve runtime-compatible Japanese `type` labels, and record `last_checked=2026-09-12` only for sources checked in this wave.

## Runtime/UI

Extend TrashNavi link-type filtering/English labels for the forward-schema types introduced by this wave (`粗大ごみ申込み`, `持込施設`, `ごみ分別アプリ`). Keep filtering browser-local.

## Municipality pages

Add the three municipalities to `municipality-page-manifest.json` only after enrichment gives each at least 3 distinct waste-specific canonical types. Update the generator so the page-count contract is 10 rather than 7 and remove Tokyo-only related-page copy.

Public URLs:

- `/tools/trashnavi/mie/mihama/`
- `/tools/trashnavi/gifu/kaizu/`
- `/tools/trashnavi/ibaraki/yuki/`

## SEO / discovery

- regenerate municipality pages and `sitemap-trashnavi.xml`
- add the three URLs exactly once to root `sitemap.xml`
- keep the existing single-root-sitemap `robots.txt` contract unchanged
- extend the static-content SEO classification pattern to all TrashNavi municipality landing pages, not only Tokyo
- add static links from the TrashNavi root page to the new municipality pages

## Validation

Require:

- coverage audit and strict mode success
- preferred municipality candidates increase from 7 to at least 10
- generator `--check` success with exactly 10 pages
- root sitemap contains each generated municipality URL exactly once
- SEO / runtime / tool-spec CI success
- no municipality-specific rule inference, fee copying or application proxying

## Scope boundary

Do not add affiliate blocks, nationwide thin pages, unrelated tool changes, or generic content written only to create ad inventory.
