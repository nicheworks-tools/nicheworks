# ExecPlan — Phone QuickCheck source and charging semantics audit

## Goal

Harden the 150-model Phone QuickCheck dataset so future additions cannot silently introduce non-manufacturer sources or internally contradictory charging facts.

## Scope

- add a permanent source/semantic validator for all maintained phone records;
- require maintained source URLs and accepted battery source URLs to stay on manufacturer-controlled domains;
- require PPS-required records to carry a PPS protocol label;
- require wireless wattage and wireless-standard fields to remain semantically paired;
- preserve the Apple mAh policy already enforced by the main data validator;
- run the new validator in the existing Phone QuickCheck CI workflow;
- document the validator as implementation/test evidence.

## Non-goals

- no new phone records;
- no UI redesign;
- no Amazon destination changes;
- no live network availability check of manufacturer pages;
- no replacement of official values with third-party data.

## Acceptance

- the validator passes all 150 maintained records or any discovered exceptions are corrected with manufacturer-backed data;
- Phone QuickCheck data, affiliate, behavior, runtime, spec and SEO checks remain green;
- final PR contains no temporary workflow or generated scratch files.
