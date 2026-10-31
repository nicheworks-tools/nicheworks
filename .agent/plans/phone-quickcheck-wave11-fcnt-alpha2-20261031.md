# Phone QuickCheck Wave 11 — FCNT arrows Alpha2 M10
Date: 2026-10-31

## Scope
Add one verified Japan-market handset by a new manufacturer FCNT to the phone-quickcheck dataset, update supported manufacturer contract, 207-model count and descriptive copy, and append an evidence audit. Scope is tools/phone-quickcheck and its specific data/completion check scripts only; no runtime UI/refactor or shared specification changes.

## Primary documentation
- https://www.fcnt.com/spec/m10-sim-free/
- https://www.fcnt.com/news/35527/
- https://www.fcnt.com/product/arrows/alpha2/
- https://www.fcnt.com/accessory/charger/a02/

## Model semantics
SIM-free variant M10, Japan; explicitly listed in-box content is quick-start guide only (adapter and cable excluded); 90W = compatible adapter class (not measured device max); USB PD3.0 supported; PPS and wireless unknown.

## Checks
Validate 207 unique records, 10 manufacturers incl. FCNT, 36 foldables, source and data semantics, completion-reviewed unknown invariant, UX/behavior, affiliate, SEO, tool specs and runtime CI. Follow-up live 320/390/414/768/1280px public-page visual smoke is required before claiming production pass.
