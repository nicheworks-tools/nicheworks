# Old Kanji Completion Audit — Wave 9 Baseline

Status: completion baseline, not a declaration of finished quality.

Baseline main: `6df0320312bd97b327b42917dd175ad304b4c7db`

Scope: the eight-tool Old Kanji cluster defined by `tools/OLD_KANJI_CLUSTER.md`.

## Executive state

All eight tools have a `SPEC.md` whose specification status is `complete`. That means the intended product contract exists. It does **not** mean the implementation has passed final acceptance. At this baseline, the acceptance checkboxes in the eight tool specifications are still unchecked and there is no single cluster-wide completion evidence matrix.

The purpose of Completion Waves 10–20 is therefore not feature expansion. It is to reconcile data/documentation drift, verify every current functional contract, fix discovered defects, validate cross-tool behavior, and end with a bounded maintenance baseline.

## Tool-by-tool completion state

| Tool | Spec status | Acceptance evidence at Wave 9 | Primary remaining owner wave |
| --- | --- | --- | --- |
| Old Kanji Reference | complete | unverified as a whole; acceptance checklist still open | Wave 10 data/doc sync, Wave 11 functional QA, Wave 15 UX, Wave 16 SEO contract |
| Kanji Modernizer | complete | unverified as a whole; acceptance checklist still open | Wave 11 functional QA, Wave 15 UX, Wave 16 search intent |
| Old Kanji OCR Scanner | complete | unverified as a whole; acceptance checklist still open | Wave 12 OCR/error QA, Wave 15 UX |
| Old Document Kanji Highlighter | complete | unverified as a whole; acceptance checklist still open | Wave 12 detection/copy QA, Wave 15 UX |
| Unicode Kanji Checker | complete | unverified as a whole; acceptance checklist still open | Wave 13 encoding/edge-case QA, Wave 15 UX |
| Variant Kanji Compare | complete | unverified as a whole; acceptance checklist still open | Wave 13 comparison/rendering QA, Wave 15 UX |
| Place Old Kanji Checker | complete | unverified as a whole; acceptance checklist still open | Wave 14 official-use/privacy QA, Wave 15 UX |
| Name Old Kanji Checker | complete | unverified as a whole; acceptance checklist still open | Wave 14 official-use/privacy QA, Wave 15 UX |

## Confirmed cross-cluster findings

### C-01 — Dictionary audit documentation is stale
Severity: high documentation/data-governance defect.
Owner: Completion Wave 10.

`tools/old-kanji-reference/dictionary-audit.json` reflects the repaired post-PR8 state:
- 356 canonical old→new records;
- 364 raw entries;
- 163 `old_to_modern`;
- 1 `variant`;
- 22 `compatibility`;
- 115 `identity`;
- 55 `unresolved`;
- 8 raw duplicate keys;
- 0 conflicting raw duplicate keys;
- 35 reverse issues;
- 0 blocking issue records;
- 168 repository-side SEO candidates.

`tools/old-kanji-reference/DICTIONARY_AUDIT.md` still describes the older pre-repair snapshot with 358 canonical records, 367 raw entries, one conflicting duplicate, 53 reverse issues, 17 blocking issue records, and 158 candidates. The human-readable audit therefore disagrees with the canonical machine-readable artifact.

Exit condition: regenerate/rewrite the human audit from the current canonical state and explicitly classify the remaining 8 raw duplicates, 35 reverse issues, 55 unresolved records, and 61 metadata overlaps as fix / intentional / deferred with a reason.

### C-02 — Individual-kanji policy documentation is stale after SEO Waves 1–3
Severity: high contract-drift defect.
Owner: Completion Wave 10 or Wave 16.

The cluster contract and Old Kanji Reference SPEC still say individual-kanji indexable URLs are not part of the current contract / may be introduced later. Main now intentionally contains three evidence-gated individual pages:
- `kanji/ga-kaku/` for 画 / 畫 with `計画 → 計畫` intent;
- `kanji/sho-shou/` for 将 / 將;
- `kanji/kyu-old/` for 旧 / 舊.

Exit condition: update the contract to describe the current evidence-gated allowlist model, explicitly prohibit mass generation, and retain the dual gate of dictionary safety plus actual GSC demand.

### C-03 — Wave 4–8 search-intent changes are only partially reflected in specs
Severity: medium contract-drift defect.
Owner: Completion Wave 16.

Post-spec work changed or strengthened live intent and handoffs for:
- the `旧字体の調べ方` how-to page;
- Kanji Modernizer's `旧字体変換 / 旧漢字変換` SERP intent;
- Old Kanji Reference FAQ handling for identity/unresolved search queries;
- Name Old Kanji Checker's name/family-register intent, including explicit official-registration caution and a Legal Affairs Bureau follow-up link.

The canonical cluster contract broadly supports these roles, but the per-tool implementation evidence and acceptance wording have not been systematically re-synced after Waves 4–8.

Exit condition: Wave 16 compares live title/H1/description/schema/handoffs against each tool's declared search role and updates specs only where current behavior is intentional.

### C-04 — Acceptance criteria are declared but not closed with evidence
Severity: high completion-process defect.
Owner: Waves 11–19.

Every tool specification has an Acceptance criteria section, but all checkboxes remain open. There is no canonical evidence ledger connecting each acceptance item to a test, runtime contract, manual verification, or source file.

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

The Reference directory contains multiple similarly named implementation generations such as `app-meaning.js`, `app-meaning-v3.js`, and `app-meaning-v4.js`, alongside other historical helper files. Wave 9 does not assume they are dead because reachability has not yet been verified.

Exit condition: determine actual runtime references. Remove only files proven unreachable and obsolete; retain any compatibility/build input that is still intentionally consumed.

### C-07 — Remaining dictionary anomalies are not blocking, but are not completion-classified
Severity: medium data-quality debt.
Owner: Completion Wave 10.

The current machine audit reports zero blocking issue records, but still reports:
- 8 duplicate raw keys with identical values;
- 35 reverse-table issues;
- 55 unresolved canonical records;
- 61 metadata key overlaps.

These are not automatically errors. Completion requires classifying them so that a future maintainer can distinguish known/intentional structure from unfinished data repair.

Exit condition: each category has a documented policy, counts are current, and any records that remain unresolved are explicitly allowed to remain non-publishable/non-authoritative.

## Completion-wave ownership

### Wave 10 — Dictionary and documentation finalization
- sync `DICTIONARY_AUDIT.md` to the machine artifact;
- classify all remaining anomaly categories;
- sync individual-page policy and evidence-gated publication rules;
- do not expand the dictionary from model inference.

### Wave 11 — Reference + Modernizer completion QA
Verify search/filter/detector/export/local state plus both conversion directions, ambiguity policy, exclusions, copy actions, empty/error/large inputs, and load failures.

### Wave 12 — OCR + Highlighter completion QA
Verify one-image OCR, progress/failure states, editable correction, detection/highlighting, copy actions, degraded reference-data behavior, and task handoffs.

### Wave 13 — Unicode + Variant completion QA
Verify code point/UTF-16/entities, supplementary-plane characters, compatibility ideographs, variation selectors, preset/custom comparison, multi-font behavior, and non-authoritative wording.

### Wave 14 — Name + Place completion QA
Verify candidate lookup in both directions where applicable, optional metadata failure, official-use cautions, legal/registry non-claims, privacy, and related-tool handoffs.

### Wave 15 — Cross-tool UX/mobile/accessibility
Verify all eight tools on narrow and desktop layouts, JP/EN switching, keyboard/focus behavior, overflow/long-text cases, zero/error states, buttons, copy feedback, and readable warnings.

### Wave 16 — Search-cluster final reconciliation
Reconcile title/H1/description/canonical/schema/internal links against the cluster role table; eliminate cannibalizing generic copy; sync how-to, individual-page allowlist, and Name/Place intent changes.

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

## Wave 9 decision

No product code is changed in this wave. The cluster is **not yet completion-locked**. The next permitted work is Completion Wave 10: dictionary/data/documentation finalization against this baseline.
