# Old Kanji Completion Audit

Status: completion locked; maintenance / measurement mode.

Wave 9 baseline main: `6df0320312bd97b327b42917dd175ad304b4c7db`

Scope: the eight-tool Old Kanji cluster defined by `tools/OLD_KANJI_CLUSTER.md`.

## Executive state

All eight tools have a `SPEC.md` whose specification status is `complete`. That means the intended product contract exists. It does **not** mean the implementation has passed final cluster acceptance.

Completion Waves 10–19 closed dictionary/documentation drift, the four functional QA tranches, cross-tool browser UX/mobile/accessibility, search-cluster reconciliation, measurement/affiliate contracts, the evidence-gated SEO inventory, and final release acceptance. Completion Wave 20 locks the audited Wave 19 release baseline `447c1beb0e5490b5dfc8b45a2a9a4afb0d7122d3`, records bounded limitations and reopen triggers, and moves the eight-tool cluster from active completion work to maintenance / measurement mode.

## Tool-by-tool completion state

| Tool | Spec status | Acceptance evidence | Primary remaining owner wave |
| --- | --- | --- | --- |
| Old Kanji Reference | complete | Waves 10–19 complete current-contract data, behavior, browser, search, measurement, SEO-inventory and release acceptance; legacy runtime reachability reviewed | maintenance / measurement |
| Kanji Modernizer | complete | Functional QA, browser UX, search-role synchronization and Wave 19 release acceptance complete | maintenance / measurement |
| Old Kanji OCR Scanner | complete | OCR QA, browser UX, search reconciliation, dormant monetization/measurement boundary and Wave 19 release acceptance complete | maintenance / measurement |
| Old Document Kanji Highlighter | complete | Functional QA, browser UX, search-role synchronization and Wave 19 release acceptance complete | maintenance / measurement |
| Unicode Kanji Checker | complete | Encoding/edge-case QA, browser UX and Wave 19 release acceptance complete | maintenance / measurement |
| Variant Kanji Compare | complete | Comparison/Unicode QA, browser UX and Wave 19 release acceptance complete | maintenance / measurement |
| Place Old Kanji Checker | complete | Functional/safety QA, browser UX, search-role synchronization and Wave 19 release acceptance complete | maintenance / measurement |
| Name Old Kanji Checker | complete | Functional/safety QA, browser UX, search-role synchronization and Wave 19 release acceptance complete | maintenance / measurement |

## Confirmed cross-cluster findings

### C-01 — Dictionary audit documentation drift
Status: **closed in Completion Wave 10**.
Severity at discovery: high documentation/data-governance defect.

Wave 10 updated the audit generator to consume the repository-held authoritative PR8 repair ledger only when a repair record's `afterTarget` still matches the current forward mapping. The regenerated canonical snapshot is now:

- 356 canonical old→new records;
- 364 raw entries;
- 165 `old_to_modern`;
- 3 `variant`;
- 22 `compatibility`;
- 115 `identity`;
- 51 `unresolved`;
- 8 raw duplicate keys, all same-valued;
- 0 conflicting raw duplicate keys;
- 61 metadata overlay events;
- 35 reverse issues;
- 0 blocking issue records;
- 168 repository-side SEO candidates.

`DICTIONARY_AUDIT.md` describes the same snapshot and policy as `dictionary-audit.json`.

The four classifications corrected by consuming already-verified PR8 evidence are:
- `淚→涙` → `old_to_modern`;
- `霸→覇` → `old_to_modern`;
- `躰→体` → `variant`;
- `邨→村` → `variant` class from semantic-variant evidence.

The SEO candidate count remains 168 because authoritative relation evidence does not bypass standalone-data requirements.

### C-02 — Individual-kanji policy documentation drift
Status: **closed in Completion Wave 10**.
Severity at discovery: high contract-drift defect.

The cluster contract and Old Kanji Reference SPEC describe the actual current allowlist:
- `kanji/ga-kaku/` — 画 / 畫 with `計画 → 計畫` intent;
- `kanji/sho-shou/` — 将 / 將;
- `kanji/kyu-old/` — 旧 / 舊.

Future publication remains dual-gated by authoritative dictionary/source safety plus actual settled GSC demand. `identity`, `unresolved`, bare-pair, and demand-free records cannot be mass-generated into indexable pages. Completion Wave 18 re-audited the filesystem, sitemap, current dictionary records, Culture Agency links, and the preserved authenticated-GSC evidence for the three allowlisted pages. The 168 repository-side candidates remain audit candidates, not publication inventory, and Wave 18 authorizes zero new pages because fresh settled GSC demand could not be retrieved.

### C-03 — Wave 4–8 search-intent changes are only partially reflected in specs
Status: **closed in Completion Wave 16**.
Severity at discovery: medium contract-drift defect.

Wave 16 reconciled the eight live landing pages against `tools/OLD_KANJI_CLUSTER.md` and added `scripts/check-old-kanji-search-cluster.mjs` as durable CI coverage.

Closed work:
- all eight pages retain distinct task-specific title/H1/description/canonical/WebApplication roles;
- the seven non-Reference SPECs now contain explicit search-cluster roles, primary/supporting query families, task boundaries, and primary handoffs matching the canonical cluster contract;
- Old Kanji OCR Scanner no longer describes itself in SERP, social metadata, schema, or UI copy as an initial preparation screen now that Japanese browser OCR is live;
- non-Reference titles are regression-guarded against taking over the generic `旧字体検索 / 旧字体一覧` intent;
- existing bounded internal-handoff checks remain green and no individual-kanji inventory was expanded.

CI evidence: the new eight-tool search-cluster reconciliation checker, the existing Old Kanji Reference SEO checker, internal-handoff checker, strict SEO audit, tool spec audit, browser UX audit, and remaining runtime-contract checks all passed in the Wave 16 PR.

### C-04 — Acceptance criteria need direct evidence
Status: **closed in Completion Wave 19**.
Severity at discovery: high completion-process defect.

Wave 11 establishes the rule in practice: an acceptance checkbox is checked only when a durable automated contract or direct implementation evidence exists.

Current closure state after Wave 19:
- Kanji Modernizer: all declared functional acceptance criteria are checked with `tools/kanji-modernizer/tests/behavior.test.mjs` and runtime-source assertions.
- Old Kanji Reference: search/filter, SERP/H1/canonical/schema/FAQ contracts, task handoffs, detector/handoff behavior, local-state restoration, individual-page inventory, dormant monetization/measurement, browser exports, Free/Pro public copy, caution boundaries, and responsive detail layout are all directly evidenced.
- Old Kanji OCR Scanner and Old Document Kanji Highlighter: Wave 12 closes core functional criteria; Wave 15 closes browser UX; Wave 17 closes OCR dormant Amazon/measurement criteria against the canonical `HOLD` state.
- Unicode Kanji Checker and Variant Kanji Compare: Wave 13 closes their declared functional acceptance criteria with behavior tests and implementation-source assertions, including supplementary Unicode ranges that were previously misclassified.
- Place Old Kanji Checker and Name Old Kanji Checker: Wave 14 closes their declared functional acceptance criteria with behavior tests and source assertions covering mapping, degraded optional data, privacy, non-authority wording, and exact Modernizer handoffs.
- All eight tools: Wave 15 adds real-Chrome browser evidence at 375×812 and 1440×1000 for language switching, keyboard traversal, long/empty interaction states, document overflow, visible control labelling/naming, warning readability, copy feedback where copy controls exist, and runtime-error capture.
- All eight tools: Wave 16 aligns title/H1/description/canonical/schema/spec search roles with the canonical cluster contract and adds a durable anti-cannibalization/search-role regression checker.
- All eight tools: Wave 17 locks coarse `old_kanji_handoff`, `support_click`, and enabled-only `old_kanji_pro_click` measurement without inspecting user payload sources; Amazon remains a separate shared `affiliate_outbound` authority and is dormant for the current Old Kanji classifications.
- Old Kanji Reference SEO inventory: Wave 18 locks the published individual-page set to exactly three reviewed pages and proves that repository-side `seoCandidate` records cannot silently become sitemap/filesystem inventory.

Wave 19 closes the final five Reference criteria with real-Chrome export interaction, the existing Pro-boundary checker, explicit source/non-authority cautions, and the new responsive shape/stroke layout contract. `scripts/check-old-kanji-release-audit.mjs` now fails CI if any of the eight SPECs regains an unchecked acceptance criterion.

Exit condition: satisfied — all eight SPECs have zero unchecked current-contract acceptance criteria.

### C-05 — No cluster-wide regression contract currently proves the full eight-tool journey
Status: **closed in Completion Wave 19**.
Severity: medium regression-risk defect.

Wave 11 adds durable coverage for the highest-risk first boundary:
- Reference detector text → Modernizer `?q=` preserves leading/trailing whitespace and line breaks;
- Modernizer waits for dictionary readiness before auto-converting handoff text;
- a failed dictionary load remains retryable instead of consuming the pending auto-convert;
- Reset removes the handoff query state;
- parsed Reference and Modernizer dictionaries must remain equal.

Closure coverage accumulated through Wave 19:
- the bounded Reference / Modernizer / OCR / Highlighter / Unicode / Variant / Place / Name handoff graph is enforced by `scripts/check-old-kanji-internal-handoffs.mjs`;
- global SEO internal-link integrity verifies those static destinations resolve;
- query-bearing Reference → Modernizer, Highlighter → Modernizer, Unicode inbound, Name → Modernizer, and Place → Modernizer paths retain exact-text behavior tests;
- Wave 15 real-Chrome coverage verifies the rendered tools remain interactable across mobile/desktop and JP/EN modes;
- Wave 17 analytics/privacy checks ensure cluster analytics does not inspect user field values, rendered text, storage, query strings, or search params, and dormant Amazon runtime emits no Old Kanji outbound event.

Wave 19 closes the remaining release boundary by combining the bounded internal-handoff checker, global SEO internal-link integrity, real-Chrome interaction coverage, exact-payload behavior tests for query-bearing handoffs, and the Wave 17 analytics/privacy contract. Static task-boundary links are verified to resolve; payload-bearing handoffs retain their exact-text tests; no user payload is added to analytics/affiliate events.

Exit condition: satisfied for the current cluster contract.

### C-06 — Old Kanji Reference contains multiple generations of implementation files that require dead-code review
Status: **closed in Completion Wave 19**.
Severity: medium maintainability risk.

At discovery, the Reference directory contained multiple similarly named application generations: `app-meaning.js`, `app-meaning-v3.js`, and `app-meaning-v4.js`. Wave 19 treated them as reachable until runtime/build evidence proved otherwise.

Wave 19 verified that the public Reference HTML loads only `app-meaning-v4.js`, while the current behavior tests and release evidence also target v4. Historical `app-meaning.js` and `app-meaning-v3.js` had no current runtime entry point and were removed. The final release checker prevents those removed runtime generations from silently returning.

Exit condition: satisfied — v4 is the sole active Reference application runtime generation.

### C-07 — Remaining dictionary anomalies need bounded maintenance treatment
Status: **classification closed in Completion Wave 10; runtime implications checked in Wave 11; authoritative data review remains bounded debt**.
Severity at discovery: medium data-quality debt.

`dictionary-audit.json` attaches `fix`, `intentional`, or `deferred` maintenance dispositions and reasons to every remaining anomaly entry.

Current disposition summary:

- raw duplicate keys: **8 fix / 0 intentional / 0 deferred**;
- metadata overlay events: **0 fix / 0 intentional / 61 deferred**;
- reverse issues: **0 fix / 0 intentional / 35 deferred**;
- unresolved records: **0 fix / 0 intentional / 51 deferred**.

Wave 11 verifies that Modern → Old behavior follows the current parsed reverse table deterministically: Conservative mode preserves genuinely ambiguous characters, while First-candidate mode selects the first current candidate and reports that decision. It also locks parsed Reference/Modernizer dictionary equality. This does **not** convert the 35 reverse-audit findings into authoritative linguistic relations, so no reverse table cleanup is performed from runtime inference.

Interpretation:
- the eight raw duplicates are same-value and parse-preserving but remain explicit source-cleanup debt;
- metadata overlaps require field-level semantic review before consolidation;
- reverse-only candidates remain until authoritative relation verification supports a data change;
- unresolved mappings remain SEO-blocked and cannot be promoted without authoritative evidence.

No current anomaly is silently treated as authoritative or publishable.

## Completion-wave ownership

### Wave 10 — Dictionary and documentation finalization
Status: **completed**.

Completed work:
- synced `DICTIONARY_AUDIT.md` to the regenerated machine artifact;
- integrated `dictionary-repair-evidence.json` into classification without weakening SEO gates;
- classified remaining anomaly categories with machine-readable dispositions;
- synchronized the current three-page individual allowlist and dual publication gate in the cluster contract and Reference SPEC;
- preserved unresolved mappings rather than guessing.

### Wave 11 — Reference + Modernizer completion QA
Status: **completed**.

Durable evidence:
- `tools/old-kanji-reference/tests/behavior.test.mjs`;
- `tools/kanji-modernizer/tests/behavior.test.mjs`;
- both tests are discovered by the repository-wide `scripts/run-tool-behavior-tests.mjs` runner;
- existing Old Kanji SEO, handoff, cluster, and dictionary-drift contracts remain required.

Confirmed defects fixed:
1. Modernizer no longer trims leading/trailing whitespace or line breaks before conversion.
2. Reference detector handoff no longer trims the text placed into `?q=`.
3. Modernizer no longer clicks a disabled Convert button before asynchronous dictionary initialization; pending handoff conversion waits for readiness and survives a load failure until Retry.
4. Modernizer Reset clears the Reference handoff state from both related-link state and the `q` URL parameter.
5. Reference detector membership checks now use a prebuilt old-character lookup instead of rescanning the entire entry list for every input character; a 10,000-character regression case is covered.
6. Reference export `dataStatus` now follows the actual verified flag instead of treating any entry with reading/meaning metadata as verified.
7. Reference primary dictionary failure now exposes an explicit retry control while optional enrichment-file failures remain non-blocking.

Verified behavior includes:
- Reference old/new/reading/meaning/Unicode search and verified/pair-only filters;
- detector counts, large input, exact handoff text, storage parsing/round-trip/fallback semantics, quiz-stat state, export row semantics, CSV escaping, and clipboard helper behavior;
- Old → Modern replacements/counts, supplementary-plane preservation, Modern → Old ambiguity policies, URL/fenced-code exclusions, whitespace-only empty handling, exact copy text, JP/EN conversion equivalence, load failure/recovery, and parsed dictionary equality.

Browser visual/focus/mobile behavior and end-to-end clicks that require rendered layout remain intentionally assigned to Wave 15/19 rather than being falsely closed by source-only tests.

### Wave 12 — OCR + Highlighter completion QA
Status: **completed for core functional QA**.

Durable evidence:
- `tools/old-kanji-ocr-scanner/tests/behavior.test.mjs`;
- `tools/old-document-kanji-highlighter/tests/behavior.test.mjs`;
- both tests are auto-discovered by `scripts/run-tool-behavior-tests.mjs`.

Confirmed defects fixed:
1. OCR no longer trims Tesseract output before placing it in the editable result area; leading/trailing whitespace and line breaks are preserved.
2. OCR related-tool `?q=` handoffs no longer trim the editable OCR/manual text.
3. OCR detected-character cards now render available occurrence/reading/meaning/usage/category metadata, compatibility/rendering notes, copy actions, and a Reference handoff instead of only a pair title.
4. OCR primary dictionary loading now checks HTTP success explicitly and exposes deterministic degraded state to the existing warning UI.
5. Highlighter primary dictionary failure no longer rejects initialization; it enters a degraded state and shows a data-load warning instead of a false zero-match interpretation.
6. Highlighter mechanical preview and Modernizer handoff are covered by pure behavior contracts, including exact whitespace/newline preservation in the handoff.

Verified behavior includes:
- Tesseract `recognize(file, 'jpn', ...)` wiring and progress logger contract;
- image Object URL revoke-before-replace and before-unload cleanup wiring;
- OCR registered-form detection/counts and mechanical modern mapping;
- degraded reference-data mode;
- Highlighter detection counts, mechanical modernization, compatibility/supplementary-plane fallback notes, same-site-only analysis fetches, and local copy wiring.

Deferred intentionally:
- OCR SERP/schema copy still describes an “initial” OCR state even though OCR is live; this remains Wave 16 search/contract reconciliation rather than being mixed into functional QA.
- OCR Amazon affiliate configuration is currently fail-closed/disabled, so the three affiliate-specific acceptance criteria stay open for Wave 17/19 instead of being falsely checked.
- browser visual/focus/mobile behavior remains Wave 15/19.

### Wave 13 — Unicode + Variant completion QA
Status: **completed for core functional QA**.

Durable evidence:
- `tools/unicode-kanji-checker/tests/behavior.test.mjs`;
- `tools/variant-kanji-compare/tests/behavior.test.mjs`;
- both tests remain auto-discovered by `scripts/run-tool-behavior-tests.mjs`.

Confirmed defects fixed:
1. Unicode Checker and Variant Compare now recognize both the BMP CJK Compatibility Ideographs block (`U+F900–U+FAFF`) and CJK Compatibility Ideographs Supplement (`U+2F800–U+2FA1F`).
2. Variant Compare no longer classifies a supplementary variation selector (`U+E0100–U+E01EF`) only as a generic supplementary-plane character; the variation-selector warning takes precedence.
3. Variant Compare no longer reports its generic rendering-note count as the compatibility-ideograph count. Compatibility, supplementary, variation, mapping, and rendering dimensions are computed independently.
4. Unicode Checker now consumes same-site `?q=` handoffs and restores exact text without trimming leading/trailing whitespace or line breaks.

Verified behavior includes:
- Unicode code point, decimal, HTML hex/decimal entity, and UTF-16 output primitives;
- surrogate-pair output for supplementary characters;
- BMP and supplementary compatibility ranges;
- BMP and supplementary variation-selector ranges;
- old→modern and reverse candidate lookup behavior;
- custom separator stripping/deduplication and the full preset inventory;
- three-font comparison wiring;
- comparison summary separation;
- CSV escaping/output contracts;
- local-only analysis copy and current non-authoritative official-use cautions.

Deferred intentionally:
- rendered mobile/desktop layout, actual focus order, live copy feedback, and visual multi-font inspection remain Wave 15/19;
- remaining Variant ↔ Reference/Name browser journey evidence remains part of later cross-tool acceptance.

### Wave 14 — Name + Place completion QA
Status: **completed for core functional/safety QA**.

Durable evidence:
- `tools/name-old-kanji-checker/tests/behavior.test.mjs`;
- `tools/place-old-kanji-checker/tests/behavior.test.mjs`;
- both are auto-discovered by `scripts/run-tool-behavior-tests.mjs`.

Confirmed defects fixed:
1. Name Checker previously trimmed leading/trailing whitespace and line breaks before constructing the whole-text Modernizer handoff. Analysis may still ignore meaningless edge whitespace, but the handoff now preserves the exact entered text.
2. Name Checker compatibility fallback now recognizes CJK Compatibility Ideographs Supplement (`U+2F800–U+2FA1F`) in addition to the BMP compatibility block.
3. Place Checker reverse lookup previously assumed every old→modern mapping was scalar; array-valued mappings could not be resolved correctly from modern form back to registered old/variant candidates.
4. Place Checker read legacy `reading`/`meaning`/`usage` fields instead of the current bilingual `readingJa/En`, `meaningJa/En`, and `usageJa/En` metadata schema.
5. Place Checker read obsolete generic `shape.summary` and `stroke.old` fields instead of the current shape-note and `oldStrokes/modernStrokes/difference` schemas.
6. Place Checker compatibility notes always preferred Japanese fields even in EN mode; localization now follows the active language with fallback.
7. Place Checker now records optional metadata/shape/stroke/compatibility failures as a degraded state while retaining base mapping, and a primary dictionary failure enters a safe error state instead of leaving an unhandled initialization path.
8. Place Checker compatibility fallback now covers both compatibility-ideograph blocks and gives variation selectors a specific warning before the generic supplementary-plane fallback.

Verified behavior includes:
- old→modern and modern→old/variant candidate lookup;
- deduplication and array-valued reverse mappings;
- optional reference-data failure without loss of the base dictionary;
- bilingual metadata, shape, stroke and rendering-note field selection;
- supplementary-plane, compatibility-supplement and variation-selector handling;
- exact Name → Modernizer and Place → Modernizer whole-text handoffs;
- same-site-only Old Kanji reference data requests;
- explicit family-register/name and official-address non-authority cautions;
- public pages remain free of unfinished fixed-price/disabled-billing sales panels.

Deferred intentionally:
- rendered mobile/desktop behavior, keyboard/focus order, copy-feedback interaction, overflow and live JP/EN visual verification remain Wave 15/19;
- remaining Name ↔ Variant/Unicode and Place ↔ Name browser journeys remain later cross-tool acceptance work.

### Wave 15 — Cross-tool UX/mobile/accessibility
Status: **completed for browser UX/mobile/accessibility QA**.

Durable evidence:
- `scripts/check-old-kanji-browser-ux.mjs`;
- wired into `.github/workflows/tool-runtime-contract-audit.yml`;
- real headless Chrome exercises all eight tools at **375×812** and **1440×1000**.

Confirmed defects fixed:
1. Kanji Modernizer copy/error notices now expose an explicit polite live status region so clipboard feedback is announced as well as shown.
2. Name Old Kanji Checker now reports clipboard success/failure in a dedicated polite live status region instead of silently writing to the clipboard.
3. The browser audit recognizes the Highlighter's existing `#langJa` / `#langEn` controls as well as the cluster's `data-lang` controls; this was an audit compatibility issue, not a product defect.

Verified browser behavior includes:
- one visible H1 per tool;
- no document-level horizontal overflow in initial, long-input, empty-input, or final exercised states;
- visible input/select/textarea controls are labelled and visible buttons have accessible names;
- no positive `tabindex` ordering;
- JP/EN switching updates the document language in both directions;
- keyboard Tab traversal reaches multiple visible controls without focusing hidden targets;
- warning/error/caution text remains above the audit readability floor;
- copy actions expose visible status feedback where a visible copy control is exercised;
- no captured runtime errors during the exercised flows.

CI evidence: the Wave 15 browser audit passed **8 tools × 2 viewports**, and all subsequent Old Kanji layout, cluster, SEO, internal-handoff, measurement, Amazon, Pro-boundary, and dictionary-drift checks in the same runtime-contract job also passed.

### Wave 16 — Search-cluster final reconciliation
Status: **completed**.

Durable evidence:
- `scripts/check-old-kanji-search-cluster.mjs`;
- existing `scripts/check-old-kanji-reference-seo.mjs`;
- existing `scripts/check-old-kanji-internal-handoffs.mjs`;
- seven non-Reference `SPEC.md` files now carry explicit search-cluster role sections aligned with `tools/OLD_KANJI_CLUSTER.md`.

Confirmed search-copy defect fixed:
- Old Kanji OCR Scanner still advertised an “initial version” / preparation-screen state in meta description, Open Graph, Twitter metadata, WebApplication schema, and OCR note even though live Japanese Tesseract OCR is already implemented. Wave 16 replaces that stale copy with the actual browser-OCR behavior while preserving OCR-specific intent.

No broad title rewrite was performed on pages already aligned with their intended role, and the individual-kanji allowlist remains unchanged.

### Wave 17 — Measurement completion
Status: **completed**.

Durable evidence:
- `tools/OLD_KANJI_MEASUREMENT.md`;
- `scripts/check-old-kanji-measurement.mjs`;
- `tools/OLD_KANJI_AMAZON.md`;
- `scripts/check-old-kanji-amazon.mjs`;
- `assets/old-kanji-analytics.js`;
- shared `assets/amazon-affiliate.js`.

Confirmed contract drift fixed:
1. The Old Kanji measurement contract/checker still named historical `affiliate_click`, while the shared canonical Amazon helper has moved to `affiliate_outbound`.
2. Old Kanji Reference and OCR SPECs still described live fixed Amazon searches/tracking IDs even though canonical monetization classifies Reference as `ADS_DONATION` and OCR as `HOLD`, with both production configs disabled.

Verified measurement/privacy behavior:
- cluster handoff events expose only source tool, target tool, and coarse placement;
- support events expose only tool, provider, and support placement;
- Pro events are suppressed for disabled, aria-disabled, or billing-unavailable controls;
- cluster analytics does not inspect user-entered field values, rendered text, local/session storage, or query strings;
- cluster analytics does not implement either legacy `affiliate_click` or duplicate shared `affiliate_outbound`;
- shared Amazon `affiliate_outbound` remains the sole future affiliate-event authority;
- current Reference/OCR Amazon configs are fail-closed, with no tracking ID, no destination/search targets, and therefore no current Old Kanji Amazon outbound event.

No runtime Amazon activation, affiliate classification change, user-payload measurement, or new monetization surface was introduced.

### Wave 18 — SEO inventory final gate
Status: **completed**.

Durable evidence:
- `tools/OLD_KANJI_SEO_INVENTORY_GATE.md`;
- `scripts/check-old-kanji-seo-inventory-gate.mjs`;
- the preserved Wave 1–3 ExecPlans containing authenticated Search Console demand evidence;
- current `tools/old-kanji-reference/dictionary-audit.json`;
- current three individual-page HTML files and `sitemap.xml`.

Verified state:
- filesystem individual-page inventory = exactly **3**;
- sitemap individual-page inventory = exactly the same **3** canonical URLs, once each;
- 畫→画, 將→将, 舊→旧 remain `old_to_modern`, `seoCandidate: true`, and issue-free in the current audit;
- all three pages retain self-canonical/indexable metadata, Article structured data, and the Culture Agency primary-source link;
- current dictionary audit still contains **168** repository-side SEO candidates, which remain candidates rather than publication inventory;
- the original authenticated-GSC demand evidence remains preserved for each published page.

Fresh-demand limitation:
- a new Search Console read was attempted through the connected GSC Wizard integration during Wave 18;
- the integration returned `payment_required` because its trial/subscription is inactive;
- therefore no fresh-demand claim is made and **0 new individual pages** are authorized in Wave 18.

The new CI gate fails if filesystem or sitemap inventory expands beyond the three-page allowlist without an explicit reviewed contract change.

### Wave 19 — Final release audit
Status: **completed**.

Durable evidence:
- `tools/OLD_KANJI_RELEASE_AUDIT.md`;
- `scripts/check-old-kanji-release-audit.mjs`;
- extended real-Chrome export coverage in `scripts/check-old-kanji-browser-ux.mjs`;
- strengthened Reference layout checks in `scripts/check-old-kanji-reference-layout.mjs`;
- all pre-existing Old Kanji behavior, SEO, handoff, measurement, monetization, inventory and dictionary checks.

Confirmed defect fixed:
- Reference shape/stroke sections had structured markup but no dedicated responsive presentation. Wave 19 adds explicit desktop/mobile layout and overflow-safe styling.

Cleanup:
- removed unreachable `tools/old-kanji-reference/app-meaning.js`;
- removed unreachable `tools/old-kanji-reference/app-meaning-v3.js`;
- retained `app-meaning-v4.js` as the sole active Reference runtime generation.

Release acceptance:
- all eight SPECs now have zero unchecked criteria;
- Reference CSV/JSON/Markdown/print controls are exercised in real Chrome without Pro entitlement;
- JP/EN Free export copy and no-unfinished-sales boundaries are checked;
- source/non-authority cautions remain visible;
- local runtime asset existence and tool-local external-network boundaries are checked;
- current dictionary has zero blocking issue records and zero conflicting raw duplicate keys;
- bounded dictionary maintenance debt remains documented rather than hidden.

### Wave 20 — Completion lock
Status: **completed**.

Durable evidence:
- `tools/OLD_KANJI_COMPLETION_LOCK.md`;
- `scripts/check-old-kanji-completion-lock.mjs`;
- the existing Wave 19 release audit and all prior Old Kanji CI gates remain required.

Locked state:
- audited release baseline: `447c1beb0e5490b5dfc8b45a2a9a4afb0d7122d3`;
- current product contract: complete across all eight tools;
- unchecked acceptance criteria: 0;
- product mode: maintenance / measurement;
- individual-kanji inventory remains the reviewed three-page allowlist;
- repository-side SEO candidates remain candidates only;
- known dictionary/data limitations remain explicitly bounded maintenance debt.

Reopen conditions are defined in `tools/OLD_KANJI_COMPLETION_LOCK.md`. Feature or SEO expansion is no longer the automatic continuation of this wave sequence.

## Completion exit criteria

The Old Kanji cluster is complete only when all of the following are true:

1. All eight `SPEC.md` files describe intentional current behavior.
2. Every acceptance criterion has direct evidence and can be marked complete, or is explicitly removed/reworded because it is no longer part of the product contract.
3. The dictionary machine audit and human documentation agree on current counts and policy.
4. No blocking mapping inconsistency remains hidden or unexplained.
5. Identity and unresolved records cannot accidentally become individual SEO pages.
6. The three existing individual pages remain source-backed and demand-backed; future pages require the same gates.
7. Primary flows, empty/error states, copy/export actions, persistence, and cross-tool handoffs have been verified.
8. Mobile/desktop and JP/EN behavior has been verified for all eight tools.
9. No tool claims official/legal glyph validity outside its evidence boundary.
10. Analytics and affiliate behavior do not leak user-entered names, addresses, document/OCR text, search strings, or conversion payloads.
11. Canonical URLs, schema, sitemap, and search-intent roles are internally consistent.
12. Standard repository CI is green at the completion-lock baseline.
13. Remaining limitations and intentionally unresolved data are documented rather than silently treated as complete data.
14. Further SEO/content expansion is driven by settled measurement, not by an open-ended wave sequence.

## Current decision

Completion Wave 20 closes the planned completion program. The eight-tool Old Kanji cluster is locked to maintenance / measurement mode for the current product contract. Further feature, monetization, data-authority, or SEO expansion requires an explicit reopen trigger from `tools/OLD_KANJI_COMPLETION_LOCK.md`.
