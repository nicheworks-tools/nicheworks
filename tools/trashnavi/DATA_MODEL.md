# TrashNavi Data Model

TrashNavi is an **official municipal waste-information gateway**. It indexes and organizes links to official municipal sources; it does not become the authority for municipality-specific sorting rules, fees, collection dates or application eligibility.

This document defines the forward data contract. Existing JSON datasets remain valid during migration.

## 1. Identity

The preferred municipality identity key is `lgcode`.

Required identity fields for future municipality records:

| Field | Meaning |
| --- | --- |
| `lgcode` | Local government code. Preferred stable join key. |
| `pref` | Prefecture name in Japanese. |
| `city` | Municipality / designated-city ward name used by TrashNavi. |
| `official_home_url` | Official municipality top page when known. |

`pref + city` may be used as a temporary fallback only when `lgcode` is unavailable. New enrichment work should preserve `lgcode` whenever the municipality can be identified reliably.

Some legacy supplementary files omit `lgcode`. For coverage auditing only, those rows may inherit an `lgcode` when the same `pref + city` maps to exactly one code in the nationwide master. Ambiguous matches must remain unresolved and be reported rather than guessed.

## 2. Official waste-link record

Forward-compatible records should support these fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `lgcode` | preferred | Municipality join key. |
| `pref` | yes | Prefecture. |
| `city` | yes | Municipality. |
| `name` | yes | Human-readable official page title / label. |
| `link_type` | yes for new schema | Canonical type listed below. |
| `type` | migration only | Existing Japanese runtime label. |
| `url` | yes | Official source URL. |
| `fiscal_year` | no | Year/fiscal-year scope when the source is explicitly year-specific. |
| `last_checked` | no | Date on which the URL/source was actually checked. Never invent this value. |
| `status` | no | Verification state from an actual check. |
| `final_url` | no | Final URL when a redirect was actually observed. |
| `language` | no | Source language, normally `ja`. |

### Verification metadata

`last_checked`, `status` and `final_url` are evidence fields. They must only be populated after an actual check.

Recommended `status` values for later phases:

- `active`
- `redirected`
- `broken`
- `unknown`

Phase 1 does not backfill these fields with guessed values.

## 3. Canonical link types

New enrichment work should use the following canonical taxonomy.

| Canonical value | Current/runtime equivalent or intent |
| --- | --- |
| `municipal_home` | `自治体公式ページ` / legacy `公式サイト` |
| `waste_sorting` | `ごみ分別ページ` |
| `collection_calendar` | `収集カレンダー` |
| `bulky_waste` | `粗大ごみ` |
| `bulky_application` | online/official bulky-waste application entry point |
| `waste_search` | `検索ページ` / official waste-item search |
| `dropoff_facility` | official bring-in/drop-off facility guidance |
| `waste_app` | official municipality waste app / official LINE entry point |
| `special_disposal` | official special-disposal guidance such as batteries or regulated items |

Existing files may continue to use the Japanese `type` field while migration is in progress. Runtime compatibility must not be broken merely to normalize stored labels.

## 4. Compatibility mapping

The Phase-1 coverage audit maps existing values as follows:

```text
自治体公式ページ -> municipal_home
公式サイト       -> municipal_home
ごみ分別ページ   -> waste_sorting
収集カレンダー   -> collection_calendar
粗大ごみ         -> bulky_waste
検索ページ       -> waste_search
```

Unknown non-empty types are reported rather than silently recategorized.

## 5. Coverage dimensions

Coverage is measured per municipality by **distinct official waste-information types**, not merely by raw URL count.

Core dimensions:

- municipality official home
- waste sorting / waste search
- collection calendar
- bulky-waste guidance
- bulky-waste application
- drop-off facility
- official waste app / LINE
- special-disposal guidance

A municipality with five URLs that are all the same type is not treated as having five dimensions of coverage.

## 6. Landing-page readiness

Phase 1 defines the gate; later phases generate the pages.

### First-pass candidate

A municipality is a first-pass landing-page candidate when it has at least **two distinct waste-specific official link types**, excluding `municipal_home`.

### Preferred candidate

A stronger candidate has at least **three distinct waste-specific official link types**, especially among:

- `waste_sorting` / `waste_search`
- `collection_calendar`
- `bulky_waste` / `bulky_application`

### Not ready

A municipality that only has its generic official top page, or only one weak direct link, should not receive a thin SEO landing page merely to increase URL count.

## 7. Planned municipality page contract

A later municipality page may expose only verified official links available for that municipality, for example:

```text
世田谷区のごみ情報

- ごみの分別・検索      -> official source
- 収集カレンダー        -> official source
- 粗大ごみ案内          -> official source
- 粗大ごみ申込          -> official source
- 持込施設              -> official source

Last checked: <only when evidence exists>
```

TrashNavi must not convert this into unsupported statements such as a municipality-specific disposal fee or classification unless that information is deliberately introduced under a separate verified-data contract in the future.

## 8. Phase ordering

1. Audit current coverage.
2. Enrich official direct links and verification metadata.
3. Publish only readiness-qualified municipality pages.
4. Add automated freshness/link checks.
5. Add a small number of nationwide explanatory guides and clearly separated monetization surfaces.

The data layer comes before page-count expansion and before affiliate expansion.
