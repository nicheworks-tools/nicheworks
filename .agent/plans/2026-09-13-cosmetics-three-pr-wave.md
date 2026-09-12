# ExecPlan — Cosmetics tools three-PR completion wave

## Goal

Raise the two cosmetics tools to a reliable, monetization-ready baseline in exactly three focused PRs, without waiting for Amazon Associates setup and without turning this wave into a long dictionary-research project.

Target tools:

- `tools/cosmetic-ingredient-checker-lite/`
- `tools/inci-fastscan/`

The end state of this wave must allow Amazon affiliate links to be added later with a small configuration/content-only change rather than another structural rewrite.

## Base

- Base main SHA: `94f7a072322cf4740785bf4149af8bfb18524f7f`
- PR1 branch: `feat/cosmetics-core-correctness-20260913`
- PR2 branch: `feat/cosmetic-lite-completion-20260913`
- PR3 branch: `feat/inci-fastscan-completion-20260913`

## Scope and PR sequence

### PR1 — core correctness

Scope:

- Add a small browser-local shared cosmetic ingredient parser under `tools/_shared/`.
- Preserve ingredient names containing `/` and `・` instead of treating them as unconditional separators.
- Route both cosmetics tools through the same separator/normalization contract.
- Stop the Lite tool from broad substring matches that can misclassify names such as fatty alcohols as ethanol-type alcohol.
- Add explicit Japanese aliases for the Lite tool's current lightweight flag set so its advertised Japanese input is not silently English-only.
- Update OCR post-processing so it does not destroy slash-containing INCI names.
- Add a deterministic parser regression check.

Non-goals:

- No dictionary-wide audit.
- No visual redesign.
- No Amazon links.
- No new external dependency.

### PR2 — Cosmetic Ingredient Checker Lite completion

Scope:

- Keep the tool Japanese-only as its SPEC requires.
- Make the first interaction faster and more mobile-oriented: input first, concise result summary, detailed rows second.
- Use the existing local ingredient data as an informational enrichment layer only where exact/alias matching is valid; do not convert uncertain data into safety conclusions.
- Show recognized / review / unclassified counts and practical functional categories.
- Remove the tool-header logo image to align with common spec.
- Place donation content before the footer.
- Add a clear route to INCI FastScan for photo/OCR use.
- Add an inactive, hidden Amazon-ready result-adjacent slot with stable DOM hooks; no destination URL, tracking ID, or affiliate claim is enabled yet.
- Update the tool SPEC and QA evidence.

Non-goals:

- No EN UI.
- No OCR in Lite.
- No full ingredient database rewrite.
- No product recommendations based on a medical/safety conclusion.

### PR3 — INCI FastScan completion

Scope:

- Move the primary input action above long explanatory content so the scanner is immediately usable.
- Improve OCR UX with visible progress/status and editable OCR text before analysis.
- Change misleading Japanese action wording from "translation" to ingredient-name matching/normalization wording.
- Add conservative near-match suggestions for unknown OCR/text tokens; suggestions must never auto-replace input.
- Keep known/review/unknown result semantics non-diagnostic.
- Add the reverse Lite link for simple paste-only use.
- Add an inactive, hidden Amazon-ready result-adjacent slot with stable DOM hooks; no destination URL, tracking ID, or affiliate claim is enabled yet.
- Update FastScan SPEC/QA evidence.

Non-goals:

- No crop/rotate image editor.
- No remote OCR/API.
- No full dictionary review or 100–200 product benchmark in this three-PR wave.
- No Amazon links until Associates setup is available.

## Privacy and safety contract

- Ingredient text and images remain browser-local except for the already-documented external Tesseract library load.
- Do not send raw ingredient input, OCR text, filenames, or images to GA4 or any affiliate service.
- Result labels remain reference/review signals, not diagnosis, allergy prediction, concentration analysis, regulatory approval, or safety certification.

## Amazon-ready contract

At the end of PR3, both tools must have a stable, hidden result-adjacent affiliate container that can later be populated only when a valid Amazon Associates setup exists.

Activation later must require only:

1. supplying approved Amazon destination URLs / tracking configuration;
2. adding the required disclosure copy;
3. unhiding/rendering the prepared block;
4. optionally enabling click analytics that sends only tool/placement/link-key metadata, never user input.

## Verification

- Run static syntax checks for changed JavaScript.
- Run the parser regression script.
- Verify sample English and Japanese ingredient lists.
- Verify slash-containing names remain intact.
- Verify empty input and reset behavior.
- Verify 320–414 px layout does not overflow for Lite and FastScan.
- Verify no raw input is added to analytics calls.
- Verify Amazon-ready blocks remain hidden and contain no live affiliate URL.

## Completion criteria

- [ ] PR1 merged: shared parsing/correctness defects closed.
- [ ] PR2 merged: Lite is a fast, useful Japanese paste checker and monetization slot is structurally ready but inactive.
- [ ] PR3 merged: FastScan OCR/result workflow is materially better and monetization slot is structurally ready but inactive.
- [ ] No unrelated tools, deployment settings, common specs, or archive files changed.
