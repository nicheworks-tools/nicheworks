# PR #485 major tools batch 1 status

## Schedule position

- PR #482: completed
- PR #483: completed
- PR #484: completed and merged
- PR #485: current

## Target tools

- old-kanji-reference
- construction-tools-atlas
- json-repair
- json2mermaid
- pdf2csv-local
- pdf-page-tools-mini
- csv-tidy
- exif-cleaner-mini
- image-redact
- api-key-token-redactor
- command-safety-checker
- filetype-sniffer

## Changes in this branch so far

### old-kanji-reference

Fixed the AdSense script URL in the page head.

Before:

```html
https://pagead2.googlesyndication.com/pagead/js?client=ca-pub-9879006623791275
```

After:

```html
https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275
```

This restores the standard AdSense loader path used by the rest of the NicheWorks suite.

### pdf2csv-local

Fixed two broken HTML attributes that affected the page range input and preview placeholder.

- Replaced `stable content="..."` on the page range input with a valid `placeholder`.
- Added `data-i18n-key="index.range.placeholder"` and `data-i18n-attr="placeholder"` so language switching can update the placeholder.
- Replaced the broken preview placeholder class/id/i18n key with the values expected by the existing CSS and JavaScript:
  - `class="preview-placeholder"`
  - `id="previewPlaceholder"`
  - `data-i18n-key="index.preview.placeholder"`

### json2mermaid

Fixed the broken input example attribute.

- Replaced `stable content='{...}'` on the JSON input textarea with a valid `placeholder='{...}'`.

## Notes

Construction Tools Atlas appears to have the same AdSense script URL issue, but the direct connector update for that full HTML file was blocked during this pass. Keep it in the PR #485 queue and retry via a smaller or alternate patch path.

The `url-title-proxy` Cloudflare deployment failure is excluded from this site repair flow for now and will be handled separately.
