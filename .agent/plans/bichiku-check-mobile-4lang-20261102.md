# ExecPlan: BichikuCheck mobile-first, four-language launch candidate

Date: 2026-11-02 (Asia/Tokyo)
Repository: nicheworks-tools/nicheworks
Work branch: feat/bichiku-check-mobile-4lang-20261102
Mainline integration: through a normal PR only (no automatic main modification in this plan).

## Scope
- New static tool in `tools/bichiku-check/**`.
- Stage-only registration in `tools/staged-tools.json` with `noindex,nofollow` on all four routes. Public index/sitemap and other monetization/spec ledgers remain untouched until a coordinated public-release PR.
- One dedicated browser-QA workflow `.github/workflows/bichiku-check-mobile-smoke.yml` (Playwright only in ephemeral CI, no shipped dependency).
- Plan document itself, `.agent/plans/bichiku-check-mobile-4lang-20261102.md`.
- No edits to other tools, repo-wide specifications, shared assets, or production deploy settings. CI addition is limited to this tool's path-scoped browser-smoke workflow.
- Reuse, not duplicate, the existing `/assets/amazon-affiliate.js` and shared NicheWorks assets.
- The four locale entry points must remain consistent but noindex during staging; indexable only after a coordinated publication gate.

## Decision
Mobile 320–414px is the primary experience; PC >=769px uses a distinct two-column composition. Same calculation data for all four locales. No full-screen app overlay, internal scrolling, mobile horizontal overflow, or advertising obstructing the primary action. Numeric adjustments and expiry inputs are secondary details.

## Implementation
1. Commit curated 43-category catalog with stable category IDs, static purchase terms, JA/EN/zh-CN/vi titles.
2. Add no-API calculation engine with household home stockpile and separate go-bag modes, official core assumptions and editable quantities.
3. Implement language-specific SEO entries and reusable UI code. Store only in localStorage, export CSV/print/copy, provide reset.
4. Integrate existing Amazon shared helper, required above-links disclosure, fixed search URLs and coarse event metadata. Provide existing dual donations, analytics tags and non-intrusive ad-top reservation. Keep noindex while staged.
5. Run the new path-scoped Playwright viewport workflow in CI (320/360/375/390/414/768/1280 widths, four languages, overflow, stock and affiliate checks) before merge.
6. Merge staging only after tests and review; to publicly launch as a 90th tool, separately update all frozen 89-tool spec/classification/monetization audits and public discovery records, and then enable indexing. Check Search Console and affiliate outbound data after launch.

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
- GitHub Actions Chromium viewport audit: **PASS** at 320/360/375/390/414/768/1280px + JA/EN/ZH/VI (11 scenarios); Node core tests **7 PASS**. Physical-device touch audit and translation proofreading remain release gates.
- Actual Amazon account state, real attribution, and AdSense unit activation: **not yet verified**.

## Rollback
If a preview or release regression occurs, do not merge (or revert the single PR if already merged). Only delete/revert `tools/bichiku-check/**` and this ExecPlan; preserve shared assets and all other tools.
