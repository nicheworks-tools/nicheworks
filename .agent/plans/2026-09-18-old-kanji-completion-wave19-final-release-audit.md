# Old Kanji Completion Wave 19 — Final release audit

Date: 2026-09-18

## Goal

Close every remaining current-contract acceptance criterion, remove proven unreachable Reference runtime generations, fix release-blocking defects found by the audit, and make release readiness machine-verifiable.

## Starting findings

- Seven tool SPECs have zero unchecked acceptance criteria.
- Old Kanji Reference has five remaining criteria.
- Current Reference HTML loads only app-meaning-v4.js.
- Historical app-meaning.js and app-meaning-v3.js have no current runtime entry point.
- Reference shape/stroke sections are structurally rendered but lack dedicated responsive CSS.

## Work

- Extend the real-Chrome audit to click Reference CSV, JSON, Markdown, and print controls.
- Add explicit responsive shape/stroke styling and regression checks.
- Remove the two unreachable Reference runtime generations.
- Close the five Reference acceptance criteria with direct evidence.
- Add a final release checker requiring zero unchecked criteria, valid local runtime assets, current Reference runtime reachability, privacy/network boundaries, and zero blocking dictionary issues.
- Preserve all existing browser, behavior, SEO, handoff, measurement, monetization, and dictionary gates.

## Guardrails

- No dictionary mapping changes.
- No new SEO pages.
- No billing/Amazon activation.
- No telemetry expansion.
- No feature expansion beyond fixing the confirmed shape/stroke presentation gap.
- Historical plans remain history; only proven unreachable runtime files are removed.

## Exit

Wave 19 is complete only if all required CI is green and the completion ledger can move to Wave 20 with no unchecked current-contract acceptance criterion.
