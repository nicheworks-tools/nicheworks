# NicheWorks SEO audit workflow

Run this before publishing SEO-related changes:

```bash
node scripts/audit-seo.mjs
```

Run strict mode when you want `WARN` items to fail too:

```bash
node scripts/audit-seo.mjs --strict
```

The GitHub Actions workflow runs strict mode for SEO-sensitive changes.

## Automatic foundation repair

For bulk fixes of missing SEO foundations, run:

```bash
node scripts/repair-seo-foundation.mjs
node scripts/audit-seo.mjs --strict
```

The repair script scans:

- `index.html`
- `about.html`
- `privacy.html`
- `contact.html`
- `en/**/*.html`
- `tools/**/*.html`

It can add missing foundation items such as:

- title fallback
- meta description fallback
- robots index/follow
- canonical
- favicon / apple-touch-icon
- basic OGP / Twitter tags
- GA4
- AdSense

It does not replace careful page-specific copy. Use it as a safety net, then manually polish important pages.

## Audit coverage

The audit checks static pages and tool pages for:

- `<title>`
- meta description
- canonical
- OGP title / description / image
- favicon
- GA4 tag
- AdSense client tag
- WebApplication JSON-LD for tool pages
- sitemap.xml inclusion
- tools-index.json inclusion for tool pages
- stable metadata in `tools/tools-meta.json`
- broken `/tools/<slug>/` internal links
- sitemap URLs that do not map to files

`FAIL` means the page is missing a required SEO foundation item and should not be treated as release-ready.
`WARN` means the page has a weaker or incomplete item. In strict mode, `WARN` also fails.

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
2. Fix `WARN` pages with traffic or Search Console impressions first.
3. Keep the homepage and English homepage as static link hubs; do not rely only on JavaScript-rendered tool lists.
4. Keep `tools/tools-meta.json` filled when new tools are added.
5. Do not remove GA4, AdSense, canonical, donation links, or sitemap entries while editing SEO.
