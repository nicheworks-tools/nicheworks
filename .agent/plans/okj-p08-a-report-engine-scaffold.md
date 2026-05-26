# ExecPlan: OKJ-P08-A Report Engine Scaffold

## Scope
- Target only:
  - `assets/okj-report-engine.js` (new)
  - `docs/old-kanji-toolkit/report-engine-scaffold.md` (new)
- No UI wiring, billing, entitlement unlock, or persistence changes.

## Files to touch
- `.agent/plans/okj-p08-a-report-engine-scaffold.md`
- `assets/okj-report-engine.js`
- `docs/old-kanji-toolkit/report-engine-scaffold.md`

## Steps
1. Inspect existing export scaffold patterns for consistency.
2. Implement report engine helper module with strict gate checks and safe normalization.
3. Write scaffold documentation covering required contracts and disabled behavior.
4. Run targeted verification checks (deny behavior, no UI wiring, no Stripe/fetch/localStorage entitlement usage).

## Manual verification
- Confirm inactive gate response is `{ ok: false, error: "pro_required" }`.
- Confirm no UI event wiring was added.
- Confirm no network/billing calls or entitlement persistence reads were added.
