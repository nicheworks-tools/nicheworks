# ExecPlan — TrashNavi coverage enrichment Wave 2

## 1. Goal

Increase the number of high-confidence municipality landing-page candidates before any municipality-page generator is introduced.

Wave 2 targets Tokyo wards that are already publish-ready because they have both official waste-sorting and bulky-waste links. The intended enrichment is to add a verified 2026 collection-calendar dimension where the ward publishes an official current-year calendar, moving those municipalities from two to three distinct waste-specific link types.

## 2. Starting baseline

Wave 1 merged as PR #522 with these audited results:

- municipalities: 1,916
- any waste-specific direct link: 77
- publish candidates (2+ distinct waste-specific types): 11
- preferred candidates (3+ distinct waste-specific types): 1
- collection-calendar coverage: 4 municipalities
- invalid records: 0
- unknown type labels: 0

Current preferred candidate: 世田谷区.

Existing Tokyo two-type candidates with sorting + bulky-waste coverage include:

- 千代田区
- 中央区
- 港区
- 新宿区
- 渋谷区
- 杉並区
- 練馬区

## 3. Scope

In scope:

- this ExecPlan;
- a Wave-2 TrashNavi direct-link JSON dataset under `tools/trashnavi/data/`;
- `tools/trashnavi/app.js` only to load that dataset;
- official-source verification for the seven target wards;
- existing TrashNavi coverage/data/runtime/SEO CI.

Out of scope:

- other tools;
- mother-site/root pages;
- common spec;
- municipality landing-page generation;
- affiliate blocks or Amazon product recommendations;
- copying municipality-specific disposal rules into TrashNavi;
- adding a calendar URL when the official source is unclear, stale, or not explicitly current for 2026.

## 4. Verification contract

For each target ward, add a calendar record only after confirming an official ward source that represents the 2026 / Reiwa 8 collection calendar, collection-day calendar, or equivalent official current-year schedule.

Every record must include:

- `pref`
- `city`
- `name`
- legacy `type = 収集カレンダー`
- `link_type = collection_calendar`
- official `url`
- `lgcode`
- `fiscal_year = 2026`
- `last_checked = 2026-09-12`
- `status = active`
- `language = ja`

Do not fabricate a record for a target ward if verification fails.

## 5. Runtime integration

Keep the existing client-side TrashNavi behavior unchanged. Add the Wave-2 dataset to `DIRECT_LINK_FILES`; do not refactor search/render logic in this wave.

## 6. Validation

After enrichment, require:

- `Check TrashNavi coverage` success;
- `Validate TrashNavi data` success;
- `Tool runtime contract audit` success;
- `SEO audit` success;
- no invalid records;
- no unknown type labels;
- no missing runtime-declared dataset;
- no newly introduced duplicate municipality/type/URL records.

Expected best-case delta if all seven current-year calendars verify:

- preferred candidates: 1 -> 8
- collection-calendar municipalities: 4 -> 11
- publish-candidate total remains 11 because the seven targets are already publish-ready.

## 7. Exit criteria

Wave 2 is complete when all verified current-year calendar additions are loaded by TrashNavi, the coverage audit reports the resulting preferred-candidate delta, and all relevant CI is green.

Municipality landing-page generation remains a later phase and should start only after this higher-confidence candidate set is established.

## 8. Rollback

Revert the Wave-2 merge. No user data, billing state, external database, or deployment setting is migrated by this wave.
