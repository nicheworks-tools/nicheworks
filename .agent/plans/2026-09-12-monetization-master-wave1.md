# ExecPlan — Monetization master and Wave 1 implementation specification

## 1. Goal

Create a repository-level monetization decision master for every current NicheWorks tool except `manual-finder`, then turn the highest-priority seven monetization systems into implementation-ready Wave 1 specifications.

This plan applies the existing common-spec rules rather than changing them, especially:

- `common-spec/spec-ja.md` section 1 / 1.1: AdSense and allowed ad positions.
- section 5: existing GA4 installation requirements.
- section 6: OFUSE / Ko-fi donation baseline.
- section 9 v2 rules where applicable.

The analysis baseline is the 90-day window 2026-06-12 through 2026-09-09 using Google Search Console and GA4 for `nicheworks.app`. `manual-finder` is explicitly excluded because its monetization implementation is already in progress elsewhere.

A critical dependency discovered before implementation is that `billing/success.html` still states that entitlement verification / grant is pending. Therefore this Wave 1 work MUST NOT pretend that Common Pro purchase-to-unlock is complete.

## 2. Scope

Targets for this change:

- `.agent/plans/2026-09-12-monetization-master-wave1.md`
- `MONETIZATION_MASTER.md`
- `MONETIZATION_WAVE1.md`

Wave 1 systems described by the specification:

1. `tools/trashnavi/**`
2. `tools/json2mermaid/**`
3. `tools/logistics-compliance-kit-jp/**`
4. `tools/cosmetic-ingredient-checker-lite/**` + `tools/inci-fastscan/**`
5. `tools/moving-checklist-generator/**` + `tools/moving-lease-final-check/**`
6. `tools/command-safety-checker/**`
7. Old-kanji cluster centered on `tools/old-kanji-reference/**`, with related kanji tools listed in the Wave 1 document.

Explicitly excluded from this change:

- `tools/manual-finder/**`
- `common-spec/spec-ja.md`
- `common-spec/spec-en.md`
- `_archive/**`
- `apps/**`
- deployment / CI settings
- live affiliate URLs or partner IDs that have not been supplied or verified
- any claim that Common Pro entitlement activation is complete

This change is a decision/specification slice. It does not modify live tool UI or business logic.

## 3. Rules / Prohibitions

- Do not add common header navigation or a site-wide tool navigation system.
- Do not modify the common specification.
- Do not modify unrelated tools.
- Do not fabricate affiliate programs, merchant IDs, commission rates, prices, conversion rates, or revenue forecasts.
- Do not create fake Pro unlock behavior.
- Existing free core functionality remains usable; monetization must be additive.
- AdSense and donation remain the suite-wide baseline unless a future explicit change overrides them.
- Affiliate placement must follow the user's actual next action, not generic product stuffing.
- Pro is justified only when a concrete paid delta exists: batch scale, exports, saved presets/history, richer reporting, or workflow packaging.
- Do not monetize incomplete/mock products as if they were production-ready.
- Custom measurement specifications may name GA4 events, but implementation must use the existing analytics stack and must not add a new tracking dependency.

## 4. Change List

### `MONETIZATION_MASTER.md`

- Record methodology and the 90-day GSC/GA4 baseline.
- Record the Common Pro entitlement blocker.
- Classify all 86 non-ManualFinder tools exactly once into:
  - Common Pro primary
  - affiliate / performance primary
  - AdSense + donation + SEO primary
  - hold until product completion
- Assign rollout priority / wave and rationale.
- Preserve ManualFinder as an explicit excluded item rather than silently dropping it.

### `MONETIZATION_WAVE1.md`

For each of the seven Wave 1 systems, define:

- why it is Wave 1 using observed data / intent;
- free contract that must remain available;
- monetization mechanism;
- Pro paid delta where applicable;
- UI placement contract;
- measurement events and parameters;
- KPIs / guardrails;
- blockers / dependencies;
- acceptance criteria.

Also define sequencing so that affiliate work can proceed independently while Common Pro is blocked on real entitlement grant.

No meta/canonical/JSON-LD, donation, ad, language-switch, or live UI code changes are made in this documentation-only slice.

## 5. Step-by-step Procedure

1. Freeze the 90-day GSC/GA4 evidence window and record the strongest signals.
2. Reconcile the current repository state with previous analysis. Use the current `main`, which has advanced to 61/87 tool-spec coverage.
3. Classify all 86 non-ManualFinder tools once and count-check the four buckets.
4. Document why traffic volume alone is not the ranking criterion; separate search demand, actual use, commercial intent, and paid-feature fit.
5. Inspect existing Common Pro surfaces and billing success flow. Record the entitlement-grant gap as a blocker.
6. Write the Wave 1 specifications with free/paid boundary, placement, measurement, dependencies, and acceptance criteria.
7. Verify that no partner URL, merchant ID, revenue number, or unavailable entitlement behavior was invented.
8. Open a PR containing only the plan and monetization documentation.

## 6. Test Plan

Documentation validation:

- Confirm `MONETIZATION_MASTER.md` contains exactly 86 unique tool slugs, excluding only `manual-finder` from the 87-tool catalog.
- Confirm category totals are 42 Common Pro + 13 affiliate/performance + 26 AdSense/donation/SEO + 5 hold = 86.
- Confirm every Wave 1 system appears in `MONETIZATION_WAVE1.md`.
- Confirm no live partner URL or affiliate ID is present unless already verified in repository evidence.
- Confirm Common Pro is marked blocked for new paid rollout until purchase-to-entitlement grant is operational.
- Confirm the documentation does not instruct removal or relocation of required AdSense, donation, GA4, language, SEO, or disclaimer surfaces.
- Confirm `manual-finder` is explicitly out of scope.

Future implementation verification, when individual slices are executed:

- Desktop and 320–414px mobile layout checks.
- JA/EN parity where the tool is bilingual; preserve explicit JP-only exceptions.
- Free path works with Pro inactive.
- Affiliate block appears only after the user has received the primary tool result / guidance unless a tool-specific reason justifies otherwise.
- Existing ad and donation placements remain spec-compliant.

## 7. Rollback Plan

This slice changes documentation only. Rollback is a single revert of the branch commits or deletion of the two root monetization documents plus this ExecPlan. No user-facing runtime state, billing state, affiliate state, or tool data is changed.
