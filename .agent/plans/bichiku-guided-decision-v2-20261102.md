# ExecPlan — BichikuCheck guided decision UI v2

Date: 2026-11-02 (JST)
Branch: `feat/bichiku-guided-assessment-v2-20261102`

## Purpose

Replace the earlier long list of 44 broad categories and separate expandable 81-item directory with the user-approved sequence **conditions → goal-based gaps → product/substitute details → shortlist of purchases**. Maintain a 320–414px mobile-first interaction model, independent desktop layout and JA/EN/zh-CN/vi translations.

## In scope

- `tools/bichiku-check/decision.js`: pure conditional assessment, seven grouped goals, food-water prerequisites, confirmed portable-toilet assembly, separate mattress/floor and body warmth needs.
- `tools/bichiku-check/experience.js`, `experience-i18n.js`, `guided.css`: a four-stage mobile UI and a more spacious PC layout.
- Modify `core.js` only to preserve/observe explicit condition confirmations. Keep its original `calculate` API backward compatible when `enforceConditions` is not set.
- Replace four locale pages' script entry points; retain existing underlying category/option catalogs, localStorage key `bichiku-check-v1`, affiliate helper and donations.
- Extend Node decision tests and rewrite Playwright smoke for this experience; run widths 320/360/375/390/414/768/1280 and four locales.

## Critical rules

- Quantities of water, food and toilet usage are not interchangeable. When a food requires potable water, user must confirm water safety and explicitly enter planned preparation-water litres from product instructions. No automatically assumed water-to-food conversion. During tap-water outage, no water-prepared food can be credited if that allocation exceeds actual stored drinking water. The preparation allocation comes from the same available drinking/cooking pool; do not add it twice to baseline requirement (3L/person/day is a general planning target that already includes cooking).
- Explicitly confirmed compatible toilet bags + solidifier + installable seat and sealed disposal can count as an assembly, in the number of actual available uses, without counting the same bags twice as a kit. Unverified components never count automatically.
- Mats used against floor cold and blankets/sleeping bags used for body warmth are separate. Foil and cardboard are displayed as supplementary/emergency alternatives, never silently equivalent to a certified sleeping system.
- Water-soaking police examples are educational and not automatically validated across brands. All food labels, storage conditions, water safety and allergies must still be checked.
- All purchases optional; no fabricated prices, product stocks, claim of nutritional sufficiency, or product eligibility. Amazon targets remain fixed, safe, and user-data-free. Disclosures appear before shopping links.
- Keep preview `noindex,nofollow`, staged/unregistered and AdSense disabled. Avoid changes to other tools, public sitemap, tool index, monetization ledgers, shared scripts.

## Release checks

1. `node --test tools/bichiku-check/tests/*.test.cjs` — all old and new tests pass.
2. Chromium viewport tests for 7 widths + 4 languages, no horizontal overflow and no nested result scroller.
3. Simulate food with no heat/water outage: alpha rice is not counted before safety + litre confirmation, still not credited if stored water insufficient, then credited when stored water exceeds confirmed allocation.
4. Simulate toilet-kit components: conditional parts only count after explicit confirmation, and expiry dates prevent credit.
5. Separate warmth needs, mobile navigation, stored quantities persistence, selection-based shopping and affiliate disclosure.
6. Document the limitations and ensure physical-device UX/native-language safety copy review before final public promotion.

## Deployment

Ship as a *staged* enhancement after CI; keep separate public-launch audit/monetization change deferred. Do not present deployment on main as search-indexable release.
