# EMS-RD-03.5 Earth placeholder pages

## Scope
- `tools/earth-timeseries/index.html`
- `tools/earth-alerts/index.html`
- `tools/earth-map-suite/index.html`
- `tools/earth-map-suite/usage.html` if related labels are present
- `tools/earth-map-suite/usage-en.html` if related labels are present
- `sitemap.xml` only if current convention requires listing new tool pages
- Existing tools index/metadata files only if present and conventionally required

## Files not in scope
- Precipitation endpoints, storm metadata logic, compare/card metadata, raster sampling, unrelated SEO fixes, `_archive/`, specs, CI/deployment settings.

## Steps
1. Inspect existing Earth Map Suite pages and nearby tool page patterns for common header/footer, ads, analytics, donation/support blocks, metadata, JSON-LD, and sitemap convention.
2. Add static Coming Soon pages for Earth Timeseries and Earth Alerts without functional forms or fake data claims.
3. Update Earth Map Suite related-link status labels from implemented/ready to coming soon in Japanese and English wherever present in scoped pages.
4. Add sitemap and tool metadata entries only if required by existing repository convention.
5. Validate pages exist and run requested SEO scripts, recording unrelated failures without expanding scope.

## Manual verification
- Open `/tools/earth-timeseries/` and `/tools/earth-alerts/` and confirm non-404 Coming Soon pages.
- Open `/tools/earth-map-suite/` and confirm related links say `準備中` / `Coming soon`.
