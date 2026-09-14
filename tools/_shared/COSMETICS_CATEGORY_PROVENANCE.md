# Cosmetics Verified Category Provenance

PR44 introduced a source-backed category overlay for canonical cosmetic ingredient identities. PR45 wave 2 extends the same contract. Neither PR rewrites the raw recognition dictionaries merely to make the frozen 187 missing-category baseline smaller.

## Contract

A verified category entry is keyed by `canonicalIdentityKey()` and contains:

- `category`: the reviewed functional category used by the runtime;
- `sources`: one or more HTTPS source URLs supporting that function;
- `authority`: the organization responsible for the cited source.

The overlay is independent from legacy `safety` metadata and from `note_short` provenance. A verified category does not imply that an ingredient is safe, effective, appropriate for a particular concentration, or suitable for a particular user.

During canonical merge, verified category evidence is added to the canonical functional metadata. Runtime output exposes:

- `category_verified: true`
- `category_sources`
- `category_authority`

Raw recognition records remain unchanged. This keeps recognition identity/aliases separate from evidence-backed functional semantics and keeps the frozen raw gap count auditable.

## Wave 1 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `water` | `solvent` | Cosmetics Info states that water is primarily used as a solvent in cosmetics and personal care products. |
| `glycerin` | `humectant` | Cosmetics Info identifies glycerin as a well-known humectant. |
| `propylene glycol` | `humectant` | Cosmetics Info states that propylene glycol attracts water and functions as a humectant. |
| `phenoxyethanol` | `preservative` | European Commission SCCS Opinion SCCS/1575/16 evaluates phenoxyethanol specifically for use as a preservative. |
| `carbomer` | `thickener` | Cosmetics Info states that carbomers function as thickening, dispersing, suspending, and emulsifying agents; wave 1 records the primary normalized category `thickener`. |

## Wave 2 reviewed set

| Canonical identity | Verified category | Source basis |
| --- | --- | --- |
| `citric acid` | `pH adjuster` | Cosmetics Info explicitly lists pH adjuster among the functions of citric acid and citrate-derived ingredients. |
| `tocopherol` | `antioxidant` | Cosmetics Info states that Tocopherol functions as an antioxidant and that Tocopherol-derived ingredients function primarily as antioxidants. |

Sodium Chloride was reviewed during wave 2 candidate selection but intentionally deferred. The authority source describes a `viscosity increasing agent – aqueous` function, while the current dictionary language also uses broader terms such as `viscosity adjuster` and `thickener`. That taxonomy normalization should be decided separately rather than silently selecting one label in this wave.

Source URLs are stored in `VERIFIED_CATEGORY_EVIDENCE` in `cosmetic-ingredient-parser.js` and are enforced by `check-cosmetics-category-provenance.mjs`.

## Non-regression rules

- The raw missing-category count remains 187; the verified overlay does not mutate recognition records to hide debt.
- Wave 1 remains exactly five reviewed canonical identities.
- Wave 2 is exactly two additional reviewed canonical identities.
- Every overlay entry must exist in the maintained nine-file dictionary set.
- Every entry must have a non-empty category, source organization, and approved HTTPS source URL.
- The checker pins the reviewed source URL for every verified canonical identity.
- Ambiguous exact tokens (`AHA`, `BHA`, `PHA`, `Iron Oxides`, `酸化鉄`) may not receive verified category evidence.
- If a canonical identity already has raw category metadata, the verified normalized category must match an existing raw category rather than silently contradict it.
- Legacy `safe` / `caution` / `risk` behavior is unchanged.
- OCR, recognition coverage, affiliate behavior, and privacy contracts are unchanged.

## Validation

Run:

```bash
node tools/_shared/check-cosmetics-category-provenance.mjs
node tools/_shared/check-cosmetics-category-gap-inventory.mjs
```

The Cosmetics accuracy benchmark workflow runs both checks together with parser, semantic, OCR, real-label, release-gate, and affiliate-isolation regressions. The provenance report also prints the raw category inventory for every reviewed canonical identity so duplicate metadata remains visible during later waves.

## Next waves

Subsequent waves may add canonical identities only after the functional category has been checked against an authoritative or primary source. Legacy duplicate metadata may be used to locate candidates, but it is never sufficient evidence by itself. Taxonomy ambiguities should be resolved explicitly before an ingredient is admitted to the verified overlay.
