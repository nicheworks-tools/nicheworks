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
- stable metadata in `tools/tools-meta.json`

`FAIL` means the page is missing a required SEO foundation item and should not be treated as release-ready.
`WARN` means the page has a weaker or incomplete item that should be fixed in the next SEO pass.

## Stable tool metadata

`tools/tools-index.json` may be regenerated automatically and can lose human-written titles/descriptions.
Do not rely on it as the only editable SEO metadata source.

Use this file for stable homepage/search/category metadata:

```txt
tools/tools-meta.json
```

Each listed tool should have:

```json
{
  "title_ja": "日本語タイトル",
  "title_en": "English title",
  "desc_ja": "日本語説明文",
  "desc_en": "English description",
  "tags": ["keyword", "category"]
}
```

The homepage merges `tools-index.json` with `tools-meta.json` at runtime. If the generated index has empty descriptions, the stable metadata file still supplies useful titles, descriptions, tags, category grouping, and search text.

## Immediate priority

1. Fix `FAIL` pages from the audit output.
2. Then fix `WARN` pages with traffic or Search Console impressions first.
3. Keep the homepage as the main static link hub; do not rely only on JavaScript-rendered tool lists.
4. Keep `tools/tools-meta.json` filled when new tools are added.
5. Do not remove GA4, AdSense, canonical, donation links, or sitemap entries while editing SEO.
