# Incident Update Generator PR365 follow-up

## Scope
- Target only `tools/incident-update-generator/` plus this plan file.
- Do not change shared specs, assets, deployment settings, or unrelated tools/apps.

## Files to touch
- `tools/incident-update-generator/index.html`
- `tools/incident-update-generator/app.js`
- `.agent/plans/incident-update-generator-pr365-followup.md`

## Steps
1. Inspect current FAQ and Pro Pack template strings.
2. Update the FAQ copy so D1 `pro_entitlements` is clearly the authority and browser `localStorage` is only helper state.
3. Add Japanese bilingual labels to the Pro Pack `Public review checklist` and `Postmortem outline` sections without changing free functionality or Pro connection code.
4. Re-run requested legacy-residue searches.
5. Re-run `node --check` for `app.js` and `pro-bridge.js`.

## Manual verification
- Open the Incident Update Generator and confirm the FAQ wording is shown as intended.
- After Pro activation, copy/save the Incident Communication Pack and confirm the two requested sections include Japanese labels.
