# Old Kanji Completion Lock

Status: maintenance / measurement mode

Lock date: 2026-09-19

Audited release baseline: `447c1beb0e5490b5dfc8b45a2a9a4afb0d7122d3`

The audited release baseline is the merge commit of Completion Wave 19. Completion Wave 20 adds only the lock/governance layer on top of that already-audited product state.

## Locked scope

This lock covers the eight-tool Old Kanji cluster:
- Old Kanji Reference
- Kanji Modernizer
- Old Kanji OCR Scanner
- Old Document Kanji Highlighter
- Unicode Kanji Checker
- Variant Kanji Compare
- Place Old Kanji Checker
- Name Old Kanji Checker

The cluster is no longer in an open-ended completion-wave phase. Current work mode is maintenance, measurement, evidence-backed data correction, and bounded defect repair.

## Completion state

At the audited release baseline:
- 8 / 8 tool SPECs are `complete`.
- unchecked acceptance criteria: 0.
- blocking dictionary issue records: 0.
- conflicting raw duplicate keys: 0.
- individual-kanji public inventory: 3 reviewed pages.
- repository-side SEO candidates: 168 candidates, not publication inventory.
- real-Chrome browser QA covers all 8 tools at 375×812 and 1440×1000.
- search-role, internal-handoff, privacy/measurement, active contextual Amazon, Pro-boundary, SEO-inventory, dictionary-drift, and final-release checks are retained in CI.

## Known limitations / bounded maintenance debt

- 8 same-valued raw duplicate keys remain source-cleanup debt.
- 61 metadata overlay events remain deferred for field-level semantic review.
- 35 reverse issues remain deferred pending authoritative relation evidence.
- 51 unresolved records remain deferred and SEO-blocked.
- glyph appearance still depends on OS/browser/font rendering.
- official/legal/registry spelling is not determined by these tools.
- OCR depends on browser-side Tesseract assets and is not fully offline.
- Amazon is active across all eight tools under the approved 2026-09-19 monetization reopen; user-derived values remain excluded from affiliate destinations and events.
- fresh Search Console demand was unavailable in Wave 18; no new individual page was authorized from inferred demand.

## Maintenance rules

Allowed without reopening the completion program:
1. Repair a confirmed regression or security/privacy defect.
2. Update dependencies or browser compatibility while preserving the current product contract.
3. Correct dictionary/metadata records only with authoritative evidence and regenerate the existing audit artifacts.
4. Improve accessibility or layout when behavior and search-role contracts remain unchanged.
5. Update copy/docs when needed to keep them synchronized with already-intentional behavior.
6. Maintain CI/checkers, provided no gate is weakened to make a failing state appear complete.

Any maintenance change touching the cluster must keep the existing Old Kanji CI gates green.

## Reopen triggers

A new completion/expansion phase is required before:
- adding a ninth Old Kanji tool or materially changing an existing tool's product role;
- changing the canonical search-cluster role table;
- publishing any new individual-kanji SEO page;
- bulk-promoting unresolved/reverse-only/identity records;
- materially changing the approved all-eight Amazon offer/placement model, adding another affiliate provider, or allowing user-derived values into affiliate destinations/events;
- changing billing/Pro availability or entitlement semantics;
- adding analytics that inspects or transmits user-entered names, addresses, OCR/document text, conversion text, search strings, query strings, or storage values;
- replacing the current dictionary authority or changing classification policy;
- removing or weakening a completion/release gate;
- a measured regression showing that the locked contract no longer matches production behavior.

## SEO expansion gate

No new individual-kanji page may be published solely because a record is a repository-side `seoCandidate`.

Expansion requires both:
1. authoritative source/data safety for the specific record; and
2. fresh settled search-demand evidence reviewed for that candidate.

The existing three-page allowlist remains the publication inventory until an explicit reviewed contract change passes the SEO inventory gate.

## Completion lock rule

The Old Kanji cluster is complete for the current product contract as of the audited release baseline above. A bounded monetization reopen on 2026-09-19 activated contextual Amazon handoffs across all eight tools and then returned the cluster to maintenance/measurement mode. Future work defaults to maintenance/measurement mode. Expansion is opt-in and evidence-gated, not the automatic continuation of Wave 20.
