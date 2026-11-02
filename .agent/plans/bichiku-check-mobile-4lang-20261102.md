# ExecPlan: BichikuCheck mobile-first, four-language launch candidate

Date: 2026-11-02 (Asia/Tokyo)
Repository: nicheworks-tools/nicheworks
Work branch: feat/bichiku-check-mobile-4lang-20261102
Mainline integration: through a normal PR only (no automatic main modification in this plan).

## Scope
- New static tool in `tools/bichiku-check/**`.
- Plan document itself, `.agent/plans/bichiku-check-mobile-4lang-20261102.md`.
- No edits to other tools, repo-wide specifications, CI workflows, assets, or production deploy settings.
- Reuse, not duplicate, the existing `/assets/amazon-affiliate.js` and shared NicheWorks assets.
- The four locale entry points must remain indexable and consistent.

## Decision
Mobile 320–414px is the primary experience; PC >=769px uses a distinct two-column composition. Same calculation data for all four locales. No full-screen app overlay, internal scrolling, mobile horizontal overflow, or advertising obstructing the primary action. Numeric adjustments and expiry inputs are secondary details.

## Implementation
1. Commit curated 43-category catalog with stable category IDs, static purchase terms, JA/EN/zh-CN/vi titles.
2. Add no-API calculation engine with household home stockpile and separate go-bag modes, official core assumptions and editable quantities.
3. Implement language-specific SEO entries and reusable UI code. Store only in localStorage, export CSV/print/copy, provide reset.
4. Integrate existing Amazon shared helper, required above-links disclosure, fixed search URLs and coarse event metadata. Provide existing dual donations, analytics tags and non-intrusive ad-top reservation.
5. Test reference cases and locales. Run viewport and accessibility checks before public merge.
6. Merge only after safety-critical copy and browser viewport QA are reviewed; after deployment check Search Console and affiliate outbound data.

## Acceptance criteria
- Each route renders its locale with a functional button/stock input and no untranslated interaction.
- 2 adults x 7 days: 42 L water, 42 meal occasions, 70 portable-toilet uses (planning assumptions). Expired stock ignored.
- Separate home vs go inventories; infants/pets conditional; manually editable target including zero.
- 320 / 360 / 375 / 390 / 414px: one column, tap targets around 44px, no horizontal viewport overflow, never a nested results scrollbar.
- Desktop 1280px: 2-column setup/results, width available to list.
- No user-derived Amazon search parameters; rel=sponsored, affiliate disclosure above links.
- No false claims of live product prices, inventory, dietary safety, or budget optimization.
- Plain JS and CSS, no third-party framework/dependency.

## Verification status
- Static JS syntax: checked via isolated V8 compilation.
- Computation: sampled 2-person 7-day/one-person go-bag cases and inventory persistence tested with a minimal DOM stub for JA/EN/zh/vi.
- Node unit test added in tool directory.
- Browser screenshot / real-device touch audit: **not yet verified**; release gate.
- Actual Amazon account state, real attribution, and AdSense unit activation: **not yet verified**.

## Rollback
If a preview or release regression occurs, do not merge (or revert the single PR if already merged). Only delete/revert `tools/bichiku-check/**` and this ExecPlan; preserve shared assets and all other tools.
