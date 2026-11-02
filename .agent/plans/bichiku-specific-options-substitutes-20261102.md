# ExecPlan — BichikuCheck concrete foods, everyday alternatives and emergency substitutes

Date: 2026-11-02 (Asia/Tokyo)
Branch: feat/bichiku-specific-options-substitutes-20261102
Base: main
Scope: tools/bichiku-check/**, plus this plan. Keep all other tools, shared assets, specs and public registration untouched.

## Goal
Replace broad-only inventory choices with concrete item discovery and cautious substitute accounting. Maintain mobile-first 320–414px and desktop two-column responsive layout, all four existing languages and no new external dependency in the product.

## Implementation
1. Distinguish food staples from supporting protein, vegetables, fruit and snacks. Do not imply one can is a complete meal.
2. Add a dedicated floor insulation planning category rather than conflating emergency foil sheets with mattresses or blankets.
3. Maintain 81 named specific options covering foods, water, sleep mats, warming, toilets/hygiene, lighting, power and rain gear, each with capability tags, notes, fixed category shopping query, and translations.
4. Show a compact mobile-specific searchable explorer below the main shortage results. Minimize vertical overload with folded choices and grouped filters; avoid nested scrollbars. On wider screens use available width.
5. Inventory entries per option have explicit units and optional expiry. Add only **usable, fully equivalent** quantities to parent category and never double-count conditionals/supplements. Distinguish unclassified manual quantities from specific entries.
6. In no-heat mode exclude heat-dependent/unverified foods from readiness, while linking exact public police and MAFF water-soaking trial evidence to help users research alternatives without blanket guarantees.
7. Reuse existing NicheWorks Amazon helper; no dynamic household data in search URLs, no scrape of live Amazon prices, and no hiding affiliate disclosure. Keep page staged and noindex.
8. Extend unit tests and Playwright Chromium viewport/language smoke.

## Acceptance
- 44 parent planning categories, 81 concrete alternatives.
- All 81 have four language names and warning coverage, with no duplicate IDs.
- Core 2 adults x 7 days retains 42L water / 42 staple portions / 70 toilet uses.
- Count only verified fully-equivalent user-registered capacity, reject expired stock, exclude inappropriate heat-only food in no-heat mode, and don't count foil/cardboard as equivalent bedding by default.
- 320/360/375/390/414, 768, 1280px no page horizontal overflow and no result sub-scroll; safe 44px touch targets.
- Source links open verified official authority pages. No unverified food-soaking times represented as safe instructions.
- Four locales retain functionality; no backend, new shipped package, or API needed.

## Release gate
This is a **staged preview** in current NicheWorks (noindex, unregistered, AdSense disabled). Do not change public tool index until separate release gate includes monetization/spec registry coordination, native-language review, Amazon Associates eligibility and real-device UX.

## Rollback
Revert this PR without touching unrelated tools; previous broad 43-category version would remain. Stock option additions are backward-compatible with old localStorage.
