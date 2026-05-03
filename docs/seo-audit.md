# NicheWorks SEO audit workflow

Run this before publishing SEO-related changes:

```bash
node scripts/audit-seo.mjs
```

The audit checks every `tools/*/index.html` page for:

- `<title>`
- meta description
- canonical
- OGP title / description / image
- favicon
- GA4 tag
- AdSense client tag
- WebApplication JSON-LD
- sitemap.xml inclusion
- tools-index.json inclusion

`FAIL` means the page is missing a required SEO foundation item and should not be treated as release-ready.
`WARN` means the page has a weaker or incomplete item that should be fixed in the next SEO pass.

## Immediate priority

1. Fix `FAIL` pages from the audit output.
2. Then fix `WARN` pages with traffic or Search Console impressions first.
3. Keep the homepage as the main static link hub; do not rely only on JavaScript-rendered tool lists.
4. Do not remove GA4, AdSense, canonical, donation links, or sitemap entries while editing SEO.
