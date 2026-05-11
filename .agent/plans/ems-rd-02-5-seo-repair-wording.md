# EMS-RD-02.5 SEO Repair Wording Plan

## Scope
- `tools/earth-map-suite/usage-en.html`
- `tools/earth-map-suite/usage.html`
- `tools/earth-map-suite/index.html` only if needed after inspection
- `scripts/repair-seo-foundation.mjs` if it rewrites the unsafe phrase
- SEO audit fixtures/config only if they enforce unsafe wording

## Files to touch
- Inspect the target files first, then edit only files required to remove unsafe Earth Map Suite wording and make the SEO repair script idempotent.

## High-level steps
1. Inspect current Earth Map Suite wording and the SEO repair script replacement logic.
2. Replace unsafe wording with an approved, accurate phrase while preserving SEO, analytics, ads, donations, and JSON-LD blocks.
3. Update repair script/config if it injects `synthetic/stable contents`.
4. Run the required search, repair script, and diff checks.

## Manual verification
- Confirm the public UI copy says preview data is synthetic/placeholder-only, not real precipitation values.
- Confirm usage pages explain the API is metadata-only, raster values are not sampled yet, and synthetic values are not returned as real data.
