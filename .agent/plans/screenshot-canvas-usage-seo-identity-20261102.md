# Screenshot Canvas usage SEO identity repair (independent CI blocker)
Date: 2026-11-02

## Why
Phone QuickCheck Wave27 public browser smoke passed for 227 phones but its PR's SEO workflow independently failed because Screenshot Canvas usage.html and usage-en.html lack canonical and og:url on two *indexable* public pages. These issues are unrelated to Phone QuickCheck data. Restore global repository green without altering screenshot canvas application behavior.

## Scope
- tools/screenshot-canvas/usage.html
- tools/screenshot-canvas/usage-en.html
- .agent/plans/screenshot-canvas-usage-seo-identity-20261102.md

Retain all visible how-to text, document title, language and existing navigation. Wrap existing metadata in a head with one indexable exact self canonical and one matching og:url for each public filename. No JS, ads, analytics, user logic, cross-tool nav or common spec changes.

## Acceptance
PR SEO URL identity checker reports no errors and all checks green; merge before refreshing the Phone QuickCheck browser gate PR so it can pass the *entire* workflow suite. This is a separate small repair, not a diversion from resumed phone catalog expansion.

## Follow-on validation
First PR SEO step passed `indexable-url-identity`, but subsequent `head-metadata-cardinality` found 22 missing singleton fields across three Screenshot Canvas pages. Include `tools/screenshot-canvas/index.html` to add missing robots, og:image and Twitter card fields; the two usage pages add robots, og title/description/image and full Twitter card metadata. Still no user-facing or runtime changes. Require SEO audit full success.

## Follow-on Tool Quality and SEO Structured Data gates
The full CI suite uncovered that the shared quality matrix used unsupported `layout_class: hybrid` and a noncanonical `spec` path for screenshot-canvas, despite canonical `docs/tools/screenshot-canvas.md` existing. Correct only that record to the supported `desktop-wide` class and required canonical spec path. Each indexed Screenshot Canvas usage page receives exactly one minimal `WebPage` JSON-LD block with its own URL, language and containing utility. No end-user logic, site-wide navigation or other tool changes.
