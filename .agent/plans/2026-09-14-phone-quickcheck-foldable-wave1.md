# ExecPlan — Phone QuickCheck foldable data wave 1

## Goal

Use the foldable dimension schema now on main to add the first manufacturer-verified foldable phones without weakening Phone QuickCheck's source or charging semantics.

## Scope

Add eight Japan-relevant foldables:

- Google Pixel 11 Pro Fold
- Google Pixel 10 Pro Fold
- Samsung Galaxy Z Fold8
- Samsung Galaxy Z Flip8
- Samsung Galaxy Z Fold7
- Samsung Galaxy Z Flip7
- Samsung Galaxy Z Fold6
- Samsung Galaxy Z Flip6

Each record must use `formFactor: "foldable"` plus complete folded/unfolded dimensions and manufacturer-controlled sources.

## Charging policy

- Google Fold records use the official 30W+ PPS charger condition as charger guidance; battery and Qi2 wattage come directly from Google specs.
- Samsung Fold/Flip records store exact device-side maximum W only where Samsung's current support table gives an exact 25W class.
- Galaxy Z Fold8 is categorized by Samsung under 45W-or-higher maximum charging, which is not an exact single maximum value; do not coerce that range into `wiredMaxW`.
- Samsung accessory resolution may use a source-backed exact `wiredMaxW` when it is at least 25W, while preserving the rule that 15W Samsung phones must not be promoted to a 25W charger class.
- Wireless standard may be recorded without an exact wattage when Samsung only supports a range/upper class rather than an exact maintained value.

## Verification

- canonical dataset grows from 150 to 158 records;
- all eight foldables pass complete folded/unfolded dimension validation;
- official-source semantic audit passes;
- existing 150 slab records remain unchanged;
- behavior test verifies a real Samsung foldable renders both physical states and resolves the exact-25W Samsung charger class without affecting 15W devices;
- affiliate, runtime, Tool spec and SEO checks remain green.
