# ExecPlan — Screenshot Collector PR1 capture feasibility (2026-10-31)

## Scope
- New: `apps/screenshot-collector/` (Manifest V3 extension research implementation only)
- New: `.agent/plans/screenshot-collector-pr1-20261031.md` (this plan)
- No edits to `tools/`, `common-spec/`, mother ship, other apps, deployment, billing, or CI.

## Objective
Establish whether local Chromium MV3 can (a) navigate to a user-entered HTTP(S) page, (b) obtain explicit same-origin host permission, (c) perform a full-document PNG screenshot through CDP, and (d) compare that route with scroll-and-stitch using captureVisibleTab. Do not claim general capture readiness until real browser screenshots exist.

## Implementation
1. Audit current main, repository instructions and existing screenshot-stitcher scope.
2. Add installable MV3 extension in `extension/` with a persistent extension management tab, one reusable target tab, site-specific optional host permission, no server and no external dependencies.
3. Implement CDP full-page capture and a separate scroll-and-stitch comparison path. Explicitly report unavailable permissions instead of silently substituting a viewport image.
4. Add bounded lazy-load preparation, navigation timeouts, defensive origin checks, cleanup, status/error reporting, and PNG download for PoC.
5. Include a static, deterministic fixture page and a browser manual QA protocol recording engine, browser version, resulting dimensions, visual errors and API denial messages.
6. Add free-first / future-pro capability boundary as documentation only. No paywall, account, billing or artificial screenshot limits.

## Verification and acceptance
- JSON manifest parsable, JavaScript syntactically valid.
- Chrome extension can be loaded as unpacked.
- Explicit user action requests only the selected origin.
- A full-page PNG has captured height exceeding viewport on tall fixture.
- Lazy loaded content appears after scroll preparation.
- A and B are recorded separately, including any permission failures.
- No unrelated files changed.
- Direct real-browser evaluation is required before PR1 can be marked PASS. Do not infer success from static inspection.

## Open risk
- `captureVisibleTab` requires `activeTab` or `<all_urls>`, and activeTab is scoped to the user-invoked tab. It may be incompatible with automatic reuse of a newly navigated capture tab without a broad grant.
- `debugger` cannot be optional and triggers a privileged warning. Enterprise policy or active DevTools may block attach.
- Dynamic SPAs, infinite scroll, cross-origin iframes, compositor behavior, and maximum image dimensions require separate evidence.
