# Old Kanji Completion Wave 12 — OCR + Highlighter completion QA

## Baseline
- Branch from the then-current `main`.
- Scope is limited to Old Kanji OCR Scanner and Old Document Kanji Highlighter plus completion/spec evidence.
- Completion Wave 11 already closed the Reference + Modernizer core behavior tranche.

## Objectives
1. Add durable behavior QA for OCR detection, OCR text preservation, one-image lifecycle contracts, Tesseract Japanese OCR wiring, and degraded reference-data behavior.
2. Add durable behavior QA for Highlighter detection, mechanical modernization, exact converter handoff, compatibility edge cases, privacy boundary, and dictionary-load failure behavior.
3. Fix only defects exposed by those contracts.
4. Mark acceptance criteria complete only where direct source/behavior evidence exists.
5. Update `tools/OLD_KANJI_COMPLETION_AUDIT.md` with Wave 12 evidence and leave browser visual/mobile/accessibility work to Wave 15.

## Confirmed defects at start
- OCR called `.trim()` on recognized text, losing leading/trailing whitespace and line breaks.
- OCR related-tool handoffs trimmed editable OCR/manual text before building `?q=`.
- OCR detected-character cards rendered only the pair title despite the SPEC requiring metadata/rendering detail when available.
- Highlighter primary dictionary load failure rejected initialization before controls were bound and could misleadingly present zero matches rather than a data-load failure.

## Guardrails
- No dictionary mapping changes.
- No new individual-kanji pages.
- No SEO inventory expansion.
- No browser/mobile/accessibility closure claims in this wave.
- No CI weakening.
- No user text in analytics or affiliate URLs.

## Durable tests
- `tools/old-kanji-ocr-scanner/tests/behavior.test.mjs`
- `tools/old-document-kanji-highlighter/tests/behavior.test.mjs`
- Both must be auto-discovered by `scripts/run-tool-behavior-tests.mjs`.

## Exit
- Both new behavior tests pass in repository CI.
- Existing required CI remains green.
- Final diff contains only Wave 12 implementation/test/spec/completion-audit files.
- Latest main and PR mergeability are rechecked immediately before squash merge.
