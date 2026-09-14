# ExecPlan — Phone QuickCheck foldable-dimension schema

## Goal

Add backward-compatible support for foldable phones so Phone QuickCheck can represent both folded and unfolded physical dimensions without corrupting the existing 150 slab-phone records.

## Data contract

Normal phones continue to use:
- `dimensions.heightMm`
- `dimensions.widthMm`
- `dimensions.depthMm`

Foldable phones use:
- `formFactor: "foldable"`
- `dimensionsFolded.{heightMm,widthMm,depthMm}`
- `dimensionsUnfolded.{heightMm,widthMm,depthMm}`

A foldable record must provide both dimension sets. A normal record must continue to provide `dimensions`.

## Runtime

- list/compact sort uses folded dimensions for foldables;
- compact list size explicitly marks folded state;
- detail view renders separate Folded / Unfolded dimension rows;
- all charging, battery, affiliate, filtering, source, and language behavior stays unchanged.

## Verification

- permanent data validator accepts existing 150 slab records unchanged;
- validator rejects incomplete foldable dimension pairs;
- behavior suite uses a synthetic foldable fixture to verify JP/EN folded/unfolded rendering and compact-sort safety;
- existing data/source-semantics/affiliate/behavior tests remain green.

## Non-goals

- no foldable device records in this schema-only PR;
- no hinge-angle or half-folded dimensions;
- no screen-size redesign;
- no change to Amazon destinations.
