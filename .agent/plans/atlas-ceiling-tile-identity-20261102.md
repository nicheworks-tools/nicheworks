# Construction Atlas: Ceiling Tile Canonical Identity

## Scope

Only `tools/construction-tools-atlas/` data, runtime loader version, dictionary CI assertions, and 360px production verification. No external dependencies, new canonical entries, images, or UI changes.

## Rationale

The original `q016_ceiling_tile` conflated grid-supported replaceable ceiling tiles with fixed ceiling boards. Narrow the identity to the suspended-grid tile class, keep `q016_acoustic_ceiling_tile` as a distinct performance subtype, and use subject-specific JA/EN aliases. Reference: Armstrong Ceiling Solutions terminology (https://www.armstrongceilings.com/commercial/en/technical-downloads/ceiling-terms.html).

## Verification

1. Run the repository's reviewed alias collision and loader test for all 870 canonicals. Expected reviewed wave3: 76, bilingual aliases: 865/870, pending identity holds: 5.
2. Confirm other dictionary, static, image, and responsive CI checks pass.
3. Search both JA and EN terms, including `吊り天井用化粧タイル`, `Suspended ceiling tile`, `吸音天井板`, and generic `天井板`; confirm no unrelated item gets the curated alias.
4. After production rollout verify the versioned loader, 870-entry catalog, mobile 360px detail, and no overflow.

## Exclusions

The other five unresolved candidates (corner trowel, sanding paper, as-built, leakage breaker, toolbox talk) require canonical redirects/identity review; do not invent synonyms merely to inflate alias coverage.
