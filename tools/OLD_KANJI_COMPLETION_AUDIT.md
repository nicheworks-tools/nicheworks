# Old Kanji Completion Audit

Status: active completion ledger, not a declaration of finished quality.

Wave 9 baseline main: `6df0320312bd97b327b42917dd175ad304b4c7db`

Scope: the eight-tool Old Kanji cluster defined by `tools/OLD_KANJI_CLUSTER.md`.

## Executive state

All eight tools have a `SPEC.md` whose specification status is `complete`. That means the intended product contract exists. It does **not** mean the implementation has passed final acceptance. The acceptance checkboxes remain open until direct evidence is produced in the later completion waves.

Completion Wave 10 closes the data/documentation drift identified in C-01 and C-02 and makes remaining dictionary debt machine-classified. Product-flow acceptance remains open for Waves 11–19.

## Tool-by-tool completion state

| Tool | Spec status | Acceptance evidence | Primary remaining owner wave |
| --- | --- | --- | --- |
| Old Kanji Reference | complete | data/contract sync closed in Wave 10; functional acceptance still open | Wave 11 functional QA, Wave 15 UX, Wave 16 search reconciliation |
| Kanji Modernizer | complete | unverified as a whole; acceptance checklist still open | Wave 11 functional QA, Wave 15 UX, Wave 16 search intent |
| Old Kanji OCR Scanner | complete | unverified as a whole; acceptance checklist still open | Wave 12 OCR/error QA, Wave 15 UX |
| Old Document Kanji Highlighter | complete | unverified as a whole; acceptance checklist still open | Wave 12 detection/copy QA, Wave 15 UX |
| Unicode Kanji Checker | complete | unverified as a whole; acceptance checklist still open | Wave 13 encoding/edge-case QA, Wave 15 UX |
| Variant Kanji Compare | complete | unverified as a whole; acceptance checklist still open | Wave 13 comparison/rendering QA, Wave 15 UX |
| Place Old Kanji Checker | complete | unverified as a whole; acceptance checklist still open | Wave 14 official-use/privacy QA, Wave 15 UX |
| Name Old Kanji Checker | complete | unverified as a whole; acceptance checklist still open | Wave 14 official-use/privacy QA, Wave 15 UX |

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

`DICTIONARY_AUDIT.md` now describes the same snapshot and policy as `dictionary-audit.json`.

The four classifications corrected by consuming already-verified PR8 evidence are:
- `淚→涙` → `old_to_modern`;
- `霸→覇` → `old_to_modern`;
- `躰→体` → `variant`;
- `邨→村` → `variant` class from semantic-variant evidence.

The SEO candidate count remains 168 because authoritative relation evidence does not bypass standalone-data requirements.

### C-02 — Individual-kanji policy documentation drift
Status: **closed in Completion Wave 10**.
Severity at discovery: high contract-drift defect.

The cluster contract and Old Kanji Reference SPEC now describe the actual current allowlist:
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

Wave 10 synchronizes the Reference-side allowlist/how-to contract, but the complete eight-tool title/H1/description/schema/handoff reconciliation remains owned by Wave 16.

Exit condition: Wave 16 compares live title/H1/description/schema/handoffs against each tool's declared search role and updates specs only where current behavior is intentional.

### C-04 — Acceptance criteria are declared but not closed with evidence
Severity: high completion-process defect.
Owner: Waves 11–19.

Every tool specification has an Acceptance criteria section, but the checkboxes remain open. There is no canonical evidence ledger connecting each acceptance item to a test, runtime contract, manual verification, or source file.

Exit condition: no checkbox is marked complete until its criterion is directly verified. Wave 19 must produce a final evidence matrix or equivalent durable proof for all eight tools.

### C-05 — No cluster-wide regression contract currently proves the full eight-tool journey
Severity: medium regression-risk defect.
Owner: Waves 11–17 and Wave 19.

The cluster contract defines explicit role separation and task handoffs, but the current completion evidence does not yet prove the full journey across all eight tools. Individual repository CI may pass while a handoff, privacy boundary, or task-role distinction drifts.

Required coverage before completion:
- Reference → Modernizer/OCR/Unicode/Variant handoffs;
- Modernizer → Reference/Highlighter/Unicode handoffs;
- OCR ↔ Highlighter/Reference/Modernizer task boundary;
- Variant ↔ Unicode/Reference/Name boundary;
- Place ↔ Reference/Modernizer/Name boundary;
- Name ↔ Reference/Variant/Unicode boundary;
- no user-entered names, addresses, OCR text, pasted documents, conversion text, or searched strings in analytics/affiliate payloads.

Exit condition: durable automated checks where practical plus explicit manual evidence for browser-only behavior that cannot be proven statically.

### C-06 — Old Kanji Reference contains multiple generations of implementation files that require dead-code review
Severity: medium maintainability risk; not yet proven to be a defect.
Owner: Completion Wave 19.

The Reference directory contains multiple similarly named implementation generations such as `app-meaning.js`, `app-meaning-v3.js`, and `app-meaning-v4.js`, alongside other historical helper files. Do not assume they are dead until runtime/build reachability is verified.

Exit condition: determine actual runtime references. Remove only files proven unreachable and obsolete; retain any compatibility/build input that is still intentionally consumed.

### C-07 — Remaining dictionary anomalies need bounded maintenance treatment
Status: **classification closed in Completion Wave 10; physical cleanup/review remains bounded debt**.
Severity at discovery: medium data-quality debt.

`dictionary-audit.json` now attaches `fix`, `intentional`, or `deferred` maintenance dispositions and reasons to every remaining anomaly entry.

Current disposition summary:

- raw duplicate keys: **8 fix / 0 intentional / 0 deferred**;
- metadata overlay events: **0 fix / 0 intentional / 61 deferred**;
- reverse issues: **0 fix / 0 intentional / 35 deferred**;
- unresolved records: **0 fix / 0 intentional / 51 deferred**.

Interpretation:
- the eight raw duplicates are same-value and parse-preserving but remain explicit source-cleanup debt;
- metadata overlaps require field-level semantic review before consolidation;
- reverse-only candidates are retained until Wave 11 verifies Modern→Old runtime behavior or authoritative evidence supports a relation change;
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
Verify search/filter/detector/export/local state plus both conversion directions, ambiguity policy, exclusions, copy actions, empty/error/large inputs, load failures, and the deferred reverse-candidate behavior that Wave 10 deliberately did not mutate.

### Wave 12 — OCR + Highlighter completion QA
Verify one-image OCR, progress/failure states, editable correction, detection/highlighting, copy actions, degraded reference-data behavior, and task handoffs.

### Wave 13 — Unicode + Variant completion QA
Verify code point/UTF-16/entities, supplementary-plane characters, compatibility ideographs, variation selectors, preset/custom comparison, multi-font behavior, and non-authoritative wording.

### Wave 14 — Name + Place completion QA
Verify candidate lookup in both directions where applicable, optional metadata failure, official-use cautions, legal/registry non-claims, privacy, and related-tool handoffs.

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

Completion Wave 10 closes the dictionary/data/documentation-finalization gate. The cluster is **not yet completion-locked**. The next permitted work is Completion Wave 11: Old Kanji Reference + Kanji Modernizer completion QA.
