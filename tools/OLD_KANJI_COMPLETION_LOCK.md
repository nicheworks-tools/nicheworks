# Old Kanji Completion Lock

Status: locked for maintenance / measurement mode.

Lock date: 2026-09-18

## Release code baseline

`447c1beb0e5490b5dfc8b45a2a9a4afb0d7122d3`

This SHA is the audited Wave 19 merge baseline containing the completed runtime, specifications, browser QA, search/SEO contracts, measurement/privacy contracts, and final release audit. Wave 20 adds lock metadata and CI enforcement only; it does not change the locked product runtime.

## Locked scope

- Old Kanji Reference
- Kanji Modernizer
- Old Kanji OCR Scanner
- Old Document Kanji Highlighter
- Unicode Kanji Checker
- Variant Kanji Compare
- Place Old Kanji Checker
- Name Old Kanji Checker

All eight current SPECs are complete with zero unchecked acceptance criteria.

## Locked SEO inventory

Indexable individual-kanji pages remain exactly three:

- `kanji/ga-kaku/` — 畫 → 画
- `kanji/sho-shou/` — 將 → 将
- `kanji/kyu-old/` — 舊 → 旧

The repository currently has 168 dictionary-side SEO candidates. Candidate status is not publication approval. A fourth page requires both the current dictionary/source gate and settled Search Console demand.

Fresh GSC retrieval was unavailable in Wave 18 because the connected GSC Wizard returned `payment_required`; no demand was inferred from unavailable data.

## Locked dictionary snapshot

- audit version: `2026-09-18-okj-dictionary-audit-2`
- canonical old→new records: 356
- raw old→new entries: 364
- `old_to_modern`: 165
- `variant`: 3
- `compatibility`: 22
- `identity`: 115
- `unresolved`: 51
- raw duplicate keys: 8, all same-valued
- conflicting raw duplicate keys: 0
- metadata overlay events: 61
- reverse issues: 35
- blocking issue records: 0
- repository-side SEO candidates: 168

## Known non-blocking maintenance debt

- 8 same-valued raw duplicate keys remain source-cleanup debt.
- 61 metadata overlay events remain deferred for field-level semantic review.
- 35 reverse issues remain deferred until authoritative relation evidence supports a change.
- 51 unresolved records remain deferred and SEO-blocked.
- Fresh Search Console demand cannot be re-evaluated through the current GSC Wizard connection until access is restored.

These limitations are not release blockers and must not be silently reclassified as authoritative data.

## Monetization lock

- Old Kanji Reference: canonical class `ADS_DONATION`.
- Old Kanji OCR Scanner: canonical class `HOLD`.
- Old Kanji Amazon configs remain fail-closed with `enabled: false`, no tracking ID, and no outbound targets.
- Existing shipped Free workflows, including Reference CSV/JSON/Markdown/print, remain Free unless a separate explicit product decision changes the contract.
- No fixed Pro price, disabled purchase CTA, or billing-unavailable sales panel may appear before verified billing activation.

## Maintenance mode

The cluster is no longer in an open-ended completion-wave sequence. Normal maintenance may proceed without reopening product expansion when it preserves the locked contract, for example:

- authoritative data corrections under the existing evidence rules;
- dependency/security fixes;
- browser compatibility and accessibility fixes;
- broken-link, schema, sitemap, and documentation repairs;
- CI/test maintenance;
- measurement observation using the existing payload-free event contract.

## Reopen triggers

A new feature/SEO/monetization expansion cycle requires an explicit reopen when at least one of these occurs:

1. a requested feature changes a current tool contract;
2. new authoritative evidence materially changes dictionary/source classification or safety;
3. settled GSC demand plus authoritative source support justifies a new individual page;
4. verified billing or affiliate activation changes the public monetization boundary;
5. a browser/platform/CI regression requires a contract-level redesign rather than maintenance;
6. a privacy or measurement requirement changes the current payload boundary.

Absent one of these triggers, the default action is maintenance and measurement, not feature or SEO expansion.

## CI lock

`scripts/check-old-kanji-completion-lock.mjs` validates this baseline against the live repository and is required by Tool runtime contract audit. It guards the release baseline SHA, eight-tool scope, zero unchecked SPEC criteria, dictionary counts, three-page SEO inventory, canonical monetization classes, dormant affiliate configs, release-audit presence, and maintenance-mode status.
