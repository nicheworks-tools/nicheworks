# ExecPlan — Phone QuickCheck specification foundation

## Goal

Create the product-level source-of-truth specification for a new static NicheWorks tool, `Phone QuickCheck`, before implementation begins.

## Scope

In scope:

- `.agent/plans/2026-09-13-phone-quickcheck-spec-foundation.md`
- `tools/phone-quickcheck/SPEC.md`

Out of scope:

- No runtime HTML/CSS/JS implementation.
- No phone dataset yet.
- No Amazon affiliate links yet.
- No sitemap/index/tool registry updates yet.
- No edits to `common-spec/spec-ja.md` or unrelated tools.
- No deployment/CI changes.

## Product decisions to lock

- Canonical slug: `phone-quickcheck`.
- Japanese + English UI from first implementation wave.
- Desktop: searchable/list view with a right-side detail pane.
- Mobile: compact list/cards with a bottom-sheet detail view.
- Product purpose is a quick-check utility, not a full smartphone encyclopedia.
- Core information: dimensions, weight, charging connector, charging requirements, battery/power-bank estimate, official specification/manual links, and purchase-oriented accessory compatibility.
- Monetization is accessory-oriented Amazon affiliate routing, not product-price mirroring.
- Affiliate routing is category/compatibility based (for example USB-C cable, PD/PPS charger, Qi2 charger, power bank), not one manually curated product URL per phone.
- Data provenance and uncertainty must be explicit; never fabricate manufacturer-nonpublic battery values.

## High-level steps

1. Inspect repository rules and existing tool specification conventions.
2. Define Phone QuickCheck purpose, UI contract, language behavior, data contract, source rules, charging estimate semantics, affiliate semantics, privacy/network behavior, limits, and acceptance criteria.
3. Add only the specification file under `tools/phone-quickcheck/`.
4. Review the branch diff to verify no implementation or unrelated changes entered this PR.
5. Open a pull request against `main`.

## Verification

- Confirm `tools/phone-quickcheck/SPEC.md` exists on the branch.
- Confirm common-spec is referenced but not modified.
- Confirm the spec explicitly separates canonical facts from derived display values.
- Confirm manufacturer-nonpublic battery capacity cannot silently masquerade as an official value.
- Confirm charging-count values are estimates with explicit efficiency methodology and disclaimer requirements.
- Confirm Amazon routing does not require live product prices or a phone-by-phone affiliate URL matrix.
- Confirm desktop/mobile behavior and JA/EN behavior are both specified.
- Confirm the branch diff contains only the two files declared above.

## Follow-on implementation sequence

1. Runtime shell and responsive JA/EN UI.
2. Initial verified phone dataset and source metadata.
3. Search/filter/alias behavior.
4. Charging quick-check and power-bank estimates.
5. Affiliate compatibility layer and disclosure.
6. Dataset expansion.
7. SEO/analytics/ads/sitemap/internal-link integration and full QA.
