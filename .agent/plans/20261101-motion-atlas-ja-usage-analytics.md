# ExecPlan — Motion Atlas free usage analytics completion (2026-11-01)

## Objective
Make the existing, free Motion Atlas's core use measurable in both EN and JA without external dependencies, new storage, trackers, paid subscriptions or invasive query capture. The user's existing GA4 property is already embedded on the pages; only hook the shared NicheWorks allowlisted analytics helper.

## Scope
- `tools/motion-atlas/app.js`
- `tools/motion-atlas/ja/index.html`
- `tools/motion-atlas/tests/behavior.test.mjs`
- `.agent/plans/20261101-motion-atlas-ja-usage-analytics.md`

Existing shared analytics scripts `assets/nw-tool-analytics.js` and `assets/nw-tool-analytics-pilot.js` are preserved without modification. Other tools, monetization, GA4 property IDs and deployment config are out of scope.

## Work
1. Confirm existing EN and JA script-loading differences and the shared analytics event allowlist.
2. Load the existing shared event helper and pilot on the JA page, as the EN page already does.
3. Instrument application handoff actions with `tool_execute` and `result_shown` and successful browser export initiation with `download_result`. Use the same existing helper with no event payload, no search strings or motion identifiers.
4. Preserve the existing pilot's `search_use`, `detail_open`, `compare_use`, `copy_result` events; avoid double-counting them in app.js.
5. Add static regression tests for both language pages, helper use and lack of user-entered query payload.
6. Check repository validation, browser smoke and Cloudflare preview before merge.

## Boundaries
This only ensures events can be recorded; it does not create GA4 data that does not exist. GSC Wizard was gated by subscription and Windsor.ai returned a placeholder because its Free tier includes one connection but GA4+GSC use two; those zeros are **not** valid metrics. Do not disconnect accounts or authorize payment.

## Manual checks
GA4 DebugView/Realtime on each public language page for search, compare, details, handoff and downloads. Compare counts for duplicated events and ensure no search terms or copied prompt text are transmitted as analytics properties. Test with analytics blockers to confirm Motion Atlas remains functional.
