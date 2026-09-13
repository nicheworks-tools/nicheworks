# ExecPlan — Phone QuickCheck runtime shell

## Goal

Implement the first real browser runtime for `Phone QuickCheck` from the merged product specification, without yet claiming full phone-data coverage or enabling live affiliate destinations.

## Scope

In scope:

- `.agent/plans/2026-09-13-phone-quickcheck-runtime-shell.md`
- `tools/phone-quickcheck/index.staged.html`
- `tools/phone-quickcheck/style.css`
- `tools/phone-quickcheck/app.js`
- `tools/phone-quickcheck/data/phones.json`
- `tools/phone-quickcheck/data/accessories.json`

Out of scope:

- No production `tools/phone-quickcheck/index.html` yet; the runtime remains staged until verified launch data is present.
- No production Amazon affiliate URLs yet.
- No complete 30-model verified dataset yet.
- No live Amazon price/availability.
- No tools-index, sitemap or mother-site listing yet; repository staging rules intentionally exclude `index.staged.html` from the public URL registry.
- No common-spec edits.
- No deployment or CI configuration changes.

## Implementation contract

- Build from the approved UI direction: desktop two-pane workspace and mobile bottom-sheet detail.
- Keep the tool bilingual on the same page with persistent JA/EN selection.
- Use static local JSON data only.
- Runtime must be safe with an empty dataset and present an explicit preparation/empty state rather than fabricated sample phone facts.
- Include search/filter/sort controls structurally now so the next data PR can populate them without redesign.
- Include detail rendering for device, charging, power-bank estimates, purchase guidance, and official links; hide or disable sections when required facts are unavailable.
- Keep Amazon actions visibly disabled/placeholders until affiliate destinations are configured.
- Keep the staged page `noindex,follow` until verified production data exists and SEO launch work is completed.
- Follow required NicheWorks AdSense, GA4, footer, donation, bilingual, canonical, JSON-LD, and responsive conventions in the staged source so promotion does not require a UI rewrite.
- Promote `index.staged.html` to `index.html` only together with verified launch data and the required tools-index/sitemap registration.

## Verification

- Desktop: >= 901px renders searchable list pane + right detail pane.
- Mobile: <= 900px hides desktop detail pane and opens selected detail in a bottom sheet.
- <= 480px controls remain usable in a compact responsive form without clipped actions.
- JA/EN toggle switches static and generated UI text and persists via localStorage.
- JSON fetch failure and empty dataset both result in a readable empty/error state.
- No sample phone facts are hard-coded into the staged runtime.
- No affiliate link navigates to Amazon yet.
- No `index.html`, tools-index or sitemap registration is added before verified launch data.
- No common-spec or unrelated tool files change.
