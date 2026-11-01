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
