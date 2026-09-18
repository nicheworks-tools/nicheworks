# Old Kanji Completion Audit

Status: active completion ledger, not a declaration of finished quality.

Wave 9 baseline main: `6df0320312bd97b327b42917dd175ad304b4c7db`

Scope: the eight-tool Old Kanji cluster defined by `tools/OLD_KANJI_CLUSTER.md`.

## Executive state

All eight tools have a `SPEC.md` whose specification status is `complete`. That means the intended product contract exists. It does **not** mean the implementation has passed final cluster acceptance.

Completion Wave 10 closed the dictionary/data/documentation drift identified in C-01 and C-02. Completion Wave 11 closed the first product-flow QA tranche for Old Kanji Reference and Kanji Modernizer. Completion Wave 12 closed the OCR/Highlighter core behavior tranche. Completion Wave 13 closed the Unicode/Variant encoding and comparison tranche. Completion Wave 14 closes the Name/Place functional and safety tranche: durable tests now cover forward/reverse candidate lookup, array-valued mappings, optional-data degradation, current bilingual metadata/shape/stroke/rendering-note schemas, exact whole-text Modernizer handoffs, supplementary compatibility ranges, primary-load safe failure for Place, privacy boundaries, and explicit non-authoritative official-use cautions. Browser-layout/accessibility and remaining cross-cluster acceptance remain owned by later waves.

## Tool-by-tool completion state

| Tool | Spec status | Acceptance evidence | Primary remaining owner wave |
| --- | --- | --- | --- |
| Old Kanji Reference | complete | Wave 10 data/contract sync complete; Wave 11 core search/detector/handoff/state behavior automated; browser export/UX and remaining policy/UI criteria still open | Wave 15 UX/browser interaction, Wave 16 search reconciliation, Wave 19 release audit |
| Kanji Modernizer | complete | Wave 11 declared functional criteria closed by automated behavior QA, including exact text preservation, ambiguity, exclusions, copy helper, load recovery, and `?q=` handoff readiness | Wave 15 UX/mobile/accessibility, Wave 16 search intent, Wave 19 release audit |
| Old Kanji OCR Scanner | complete | Wave 12 core OCR/detection/error behavior automated; five core acceptance criteria closed; currently disabled optional Amazon affiliate criteria remain open for Wave 17/19 | Wave 15 UX, Wave 17 measurement/affiliate contract, Wave 19 release audit |
| Old Document Kanji Highlighter | complete | Wave 12 declared functional acceptance criteria closed by automated behavior QA, including degraded dictionary mode and exact Modernizer handoff | Wave 15 UX/mobile/accessibility, Wave 16 search intent, Wave 19 release audit |
| Unicode Kanji Checker | complete | Wave 13 functional acceptance closed by durable encoding/edge-case QA, including exact inbound `?q=` restoration | Wave 15 UX/mobile/accessibility, Wave 19 release audit |
| Variant Kanji Compare | complete | Wave 13 functional acceptance closed by durable preset/custom comparison, Unicode-range, multi-font wiring, mapping and summary QA | Wave 15 UX/mobile/accessibility, Wave 19 release audit |
| Place Old Kanji Checker | complete | Wave 14 functional acceptance closed by durable mapping/data-degradation/privacy/non-authority/handoff QA | Wave 15 UX/mobile/accessibility, Wave 16 search intent, Wave 19 release audit |
| Name Old Kanji Checker | complete | Wave 14 functional acceptance closed by durable forward/reverse mapping, optional-data degradation, exact handoff, privacy and official-use QA | Wave 15 UX/mobile/accessibility, Wave 16 search intent, Wave 19 release audit |

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

Future publication remains dual-gated by authoritative dictionary/source safety plus actual settled GSC demand. `identity`, `unresolved`, bare-pair, and demand-free records cannot be mass-generated into indexable pages. The 168 repository-side candidates remain audit candidates, not publication inventory.

### C-03 — Wave 4–8 search-intent changes are only partially reflected in specs
Severity: medium contract-drift defect.
Owner: Completion Wave 16.

Post-spec work changed or strengthened live intent and handoffs for:
- the `旧字体の調べ方` how-to page;
- Kanji Modernizer's `旧字体変換 / 旧漢字変換` SERP intent;
- Old Kanji Reference FAQ handling for identity/unresolved search queries;
- Name Old Kanji Checker's name/family-register intent, including explicit official-registration caution and a Legal Affairs Bureau follow-up link.

Wave 10 synchronized the Reference-side allowlist/how-to contract. Wave 11 synchronized the intentional Modernizer `?q=` handoff and exact-text behavior, but the complete eight-tool title/H1/description/schema/handoff reconciliation remains owned by Wave 16.

Exit condition: Wave 16 compares live title/H1/description/schema/handoffs against each tool's declared search role and updates specs only where current behavior is intentional.

### C-04 — Acceptance criteria need direct evidence
Status: **partially closed from Completion Wave 11 onward**.
Severity at discovery: high completion-process defect.
Owner: Waves 11–19.

Wave 11 establishes the rule in practice: an acceptance checkbox is checked only when a durable automated contract or direct implementation evidence exists.

Current closure state after Wave 14:
- Kanji Modernizer: all declared functional acceptance criteria are checked with `tools/kanji-modernizer/tests/behavior.test.mjs` and runtime-source assertions.
- Old Kanji Reference: search/filter, SERP/H1/canonical/schema/FAQ contracts, task handoffs, detector/handoff behavior, local-state restoration semantics, and individual-page allowlist are checked. Browser-level export interaction, remaining copy/visual behavior, Pro/public-copy, caution/layout, and Amazon criteria remain open for the owning later waves.
- Old Kanji OCR Scanner and Old Document Kanji Highlighter: Wave 12 closes the declared core functional criteria supported by behavior tests; OCR affiliate criteria and browser UX remain later-wave work.
- Unicode Kanji Checker and Variant Kanji Compare: Wave 13 closes their declared functional acceptance criteria with behavior tests and implementation-source assertions, including supplementary Unicode ranges that were previously misclassified.
- Place Old Kanji Checker and Name Old Kanji Checker: Wave 14 closes their declared functional acceptance criteria with behavior tests and source assertions covering mapping, degraded optional data, privacy, non-authority wording, and exact Modernizer handoffs.

Exit condition: Wave 19 must leave no unchecked criterion without either direct evidence or an explicit specification decision that removes/rewords the criterion.

### C-05 — No cluster-wide regression contract currently proves the full eight-tool journey
Status: **partially covered in Completion Wave 11**.
Severity: medium regression-risk defect.
Owner: Waves 11–17 and Wave 19.

Wave 11 adds durable coverage for the highest-risk first boundary:
- Reference detector text → Modernizer `?q=` preserves leading/trailing whitespace and line breaks;
- Modernizer waits for dictionary readiness before auto-converting handoff text;
- a failed dictionary load remains retryable instead of consuming the pending auto-convert;
- Reset removes the handoff query state;
- parsed Reference and Modernizer dictionaries must remain equal.

Still required before completion:
- Reference → OCR/Unicode/Variant browser handoffs;
- Modernizer → Reference/Highlighter/Unicode browser handoffs;
- OCR ↔ Highlighter/Reference/Modernizer task boundary;
- Variant → Unicode comparison-set handoff now has a tested Unicode `?q=` receiver; Variant ↔ Reference/Name browser boundary remains;
- Place → Modernizer whole-text handoff now preserves exact input and per-character Reference links remain wired; Place ↔ Name browser boundary remains;
- Name → Modernizer whole-text handoff now preserves exact input and per-character Reference links remain wired; Name ↔ Variant/Unicode browser boundary remains;
- no user-entered names, addresses, OCR text, pasted documents, conversion text, or searched strings in analytics/affiliate payloads.

Exit condition: durable automated checks where practical plus explicit manual evidence for browser-only behavior that cannot be proven statically.

### C-06 — Old Kanji Reference contains multiple generations of implementation files that require dead-code review
Severity: medium maintainability risk; not yet proven to be a defect.
Owner: Completion Wave 19.

The Reference directory contains multiple similarly named implementation generations such as `app-meaning.js`, `app-meaning-v3.js`, and `app-meaning-v4.js`, alongside other historical helper files. Do not assume they are dead until runtime/build reachability is verified.

Exit condition: determine actual runtime references. Remove only files proven unreachable and obsolete; retain any compatibility/build input that is still intentionally consumed.

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
Verify all eight tools on narrow and desktop layouts, JP/EN switching, keyboard/focus behavior, overflow/long-text cases, zero/error states, buttons, copy feedback, and readable warnings.

### Wave 16 — Search-cluster final reconciliation
Reconcile title/H1/description/canonical/schema/internal links against the cluster role table; eliminate cannibalizing generic copy; finish post-Wave-4 intent/spec synchronization.

### Wave 17 — Measurement completion
Verify coarse landing/handoff/support/affiliate measurement without transmitting user payload data. Add only missing events required by the cluster measurement contract.

### Wave 18 — SEO inventory final gate
Keep individual pages allowlisted and evidence-led. Re-audit the existing three pages. Do not publish the 168 repository-side candidates as inventory without actual GSC demand and authoritative source support.

### Wave 19 — Final release audit
Close acceptance criteria with evidence, inspect dead code, broken links, sitemap/schema drift, stale documentation, privacy/network behavior, and CI. No unchecked blocker may remain.

### Wave 20 — Completion lock
Record final baseline SHA, known limitations, maintenance rules, and the trigger required to reopen feature/SEO expansion. Move the cluster from active completion work to maintenance/measurement mode.

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

Completion Wave 14 closes the Name Old Kanji Checker + Place Old Kanji Checker core functional/safety gate without declaring browser UX or the full eight-tool cluster finished. The next permitted work is Completion Wave 15: cross-tool UX/mobile/accessibility verification.
