# Old Kanji Reference UX hotfix note

This temporary note records the next follow-up needed after OKJ-REFERENCE-HOTFIX-01.

The page now renders the reference list again, but rendering every entry in the document flow makes the page extremely long on mobile and desktop screenshots.

Next fix should constrain the all-entries list area, ideally by:

- limiting the visual height of the list region,
- keeping filters/search/status/export visible above it,
- preserving existing JS IDs and data rendering,
- not changing billing, Stripe, Pro unlock, or dictionary data.
