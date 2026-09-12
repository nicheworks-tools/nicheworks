# ExecPlan — TrashNavi municipality pages pilot

## 1. Goal

Turn the first high-confidence TrashNavi municipalities into indexable, useful static landing pages without creating thin pages or turning TrashNavi into a municipality-specific waste-rule authority.

The pilot uses the seven municipalities that currently satisfy the preferred readiness threshold (3+ distinct waste-specific official link types):

- 千代田区
- 港区
- 新宿区
- 世田谷区
- 渋谷区
- 杉並区
- 練馬区

## 2. Public URL contract

Pilot URLs:

- `/tools/trashnavi/tokyo/chiyoda/`
- `/tools/trashnavi/tokyo/minato/`
- `/tools/trashnavi/tokyo/shinjuku/`
- `/tools/trashnavi/tokyo/setagaya/`
- `/tools/trashnavi/tokyo/shibuya/`
- `/tools/trashnavi/tokyo/suginami/`
- `/tools/trashnavi/tokyo/nerima/`

Only manifest-listed, readiness-qualified municipalities are generated.

## 3. Scope

TrashNavi files in scope:

- `tools/trashnavi/municipality-page-manifest.json` (new)
- `tools/trashnavi/scripts/generate-municipality-pages.mjs` (new)
- generated `tools/trashnavi/tokyo/*/index.html` for the seven pilot wards
- `tools/trashnavi/style.css` for small municipality-page-only layout additions
- `tools/trashnavi/SPEC.md` to record the generation/publishing contract
- existing TrashNavi coverage workflow may be extended to run generator check mode

SEO discovery files explicitly in scope:

- `sitemap-trashnavi.xml` (new)
- `sitemap-index.xml` only to include the TrashNavi sitemap
- `robots.txt` only to advertise the TrashNavi sitemap alongside the existing sitemap

Explicitly out of scope:

- other tools and their pages/data
- common spec
- global mother-site navigation
- affiliate blocks / Amazon products
- municipality-specific sorting decisions, fees, collection dates, or copied rule tables
- pages for municipalities below the preferred readiness threshold
- bulk generation for all 1,916 municipalities

## 4. Data and generation contract

The generator reads repository TrashNavi data, normalizes current/legacy link types, joins by `lgcode`, and generates only entries listed in `municipality-page-manifest.json` that still have at least three distinct waste-specific official link types.

The manifest controls stable public slugs and publication eligibility. It must not contain official-source URLs; URLs remain sourced from TrashNavi data files.

The generator must support:

- normal mode: write/update generated pages and `sitemap-trashnavi.xml` locally when run in a checkout;
- `--check` mode: compare expected generated output with checked-in files and fail on drift without modifying the repository.

No external network requests are made by the generator.

## 5. Page content contract

Each municipality page must contain:

- unique title, description, canonical, Open Graph and Twitter metadata;
- index/follow robots metadata;
- TrashNavi identity and municipality-specific H1;
- a clear statement that official municipality sources are authoritative;
- official-link cards grouped by available type;
- 2026 calendar link where present;
- bulky-waste guidance link where present;
- sorting/search link where present;
- per-link verification date only when repository evidence provides `last_checked`;
- a link back to the TrashNavi search page;
- a small related-municipality block for other pilot pages;
- standard analytics / ad loading consistent with the existing TrashNavi page;
- visible disclaimer that TrashNavi does not determine final disposal rules or accept applications.

The page must not reproduce municipality-specific fee tables, item-by-item sorting rules, pickup dates, or application eligibility.

## 6. SEO / sitemap contract

- Each page has exactly one self-canonical URL.
- `sitemap-trashnavi.xml` contains TrashNavi root plus generated municipality URLs.
- `sitemap-index.xml` includes `sitemap-trashnavi.xml` in addition to the existing sitemap entry.
- `robots.txt` advertises the TrashNavi sitemap without removing the existing sitemap line.
- Generated pages must pass existing SEO audits.

## 7. Styling / language

Reuse `tools/trashnavi/style.css` and existing NicheWorks/TrashNavi visual language. Add only compact page-specific classes required for breadcrumb, official-link grid, verification meta and related municipality links.

Keep Japanese as the primary visible content because the source municipalities are Japanese authorities, while preserving concise English explanatory/support text and the existing TrashNavi bilingual positioning. Do not create a separate `/en/` municipality tree in this pilot.

## 8. Validation

Require:

- generator `--check` success;
- current TrashNavi coverage strict audit success;
- generated page count exactly 7;
- every generated page corresponds to a manifest entry and a 3+ type preferred candidate;
- every official outbound URL originates from repository TrashNavi data;
- no unsupported waste-rule claims;
- no missing runtime dataset;
- SEO audit success;
- internal-link/runtime checks success;
- no unrelated file changes outside declared scope.

## 9. Rollback

Revert the pilot merge. Generated pages and the dedicated TrashNavi sitemap can be removed without data migration, billing state changes, or external-system changes.
