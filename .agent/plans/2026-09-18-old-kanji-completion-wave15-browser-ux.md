# Completion Wave 15 — Old Kanji cross-tool browser UX audit

Date: 2026-09-18
Scope: the eight tools in `tools/OLD_KANJI_CLUSTER.md`.

## Goal

Close the browser-only verification deferred by Completion Waves 11–14 without changing dictionary mappings, SEO inventory, billing, measurement, or product scope.

## Required evidence

Run the eight public tool pages in real headless Chrome at 375×812 and 1440×1000 and verify:

- exactly one visible H1;
- no document-level horizontal overflow after initial, long-input, empty-input, and final interaction states;
- visible form controls are labelled and visible buttons are named;
- no positive tabindex ordering;
- JP/EN controls switch the document language in both directions;
- Tab traversal reaches multiple visible controls and does not focus hidden targets;
- warning/error/caution text remains readable;
- long input and zero/empty states do not break layout;
- copy actions expose visible live/status feedback where a visible copy control exists;
- scripted interactions do not produce captured runtime errors.

## Implementation rule

Use the ChromeDriver available on GitHub `ubuntu-latest` directly through the WebDriver HTTP protocol. Add no Playwright/Puppeteer dependency and no product runtime dependency solely for QA.

## Exit condition

The Wave 15 PR may merge only after the browser audit and existing repository CI are green. Any browser defect found by the audit must be repaired in the affected tool and kept under regression coverage. Wave 16 remains the owner of search-intent/metadata reconciliation.
