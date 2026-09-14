# Old Kanji Reference modern-summary cache hotfix

## Goal
Make the already-implemented mobile fix for the `新字体別まとめ` block actually reach production browsers.

## Scope
- bump cache keys for `verified-badge.css` and `verified-badge.js`
- observe the whole `.group-wrapper` subtree so dynamically-created `#modernSummary` is always normalized
- extend the existing layout regression checker to require the new asset versions and robust observer target

No dictionary, Amazon, SEO-copy, or Pro changes.
