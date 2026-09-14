# Cosmetics Legacy Safety Runtime Isolation

PR38 established that the maintained cosmetics dictionaries contain legacy `safety` metadata with 16 canonical safety conflicts and zero explicit per-record evidence metadata. PR39 therefore prevents that legacy field from silently controlling user-facing result states while the semantic source-of-truth work continues.

This applies to both Cosmetic Ingredient Checker Lite and INCI FastScan.

## Runtime rule

Legacy `safety` metadata remains in the repository for compatibility and auditability, but it does not drive a user-facing safe/unsafe judgment.

- Lite no longer promotes a dictionary match to `確認候補` merely because the matched record says `caution` or `risk`.
- Lite keeps its explicit neutral acid/function review cue; this is a functional review hint, not a safety grade.
- Lite now runs the nine maintained dictionary files through the same shared canonical merge layer used by FastScan before building its exact-match index.
- FastScan no longer copies the dictionary `safety` field into exact-match result objects, so the result renderer cannot turn unaudited `safe/caution/risk` values into a matched/review classification.
- Exact ingredient recognition, Japanese/alias resolution, categories, OCR repair, near-match suggestions, and source-backed coverage floors are unchanged.

This is deliberately conservative. PR39 does not choose a winning `safe`, `caution`, or `risk` value for any of the 16 conflicting canonical identities. Those conflicts remain visible to the PR38 semantic audit until a source-backed semantic model replaces or retires the legacy field.

## User-facing meaning

`辞書一致 / Dictionary match` means an ingredient name resolved to one maintained canonical identity. It is not a safety guarantee.

`確認候補 / Additional review` must come from an explicit review rule, OCR/unknown workflow, or a future source-backed semantic rule. The mere presence of a legacy `caution` or `risk` string is insufficient.

`未分類 / Unmatched` does not mean unsafe.

## Privacy and monetization

This change is local runtime classification only. There is no new network request, and no user ingredient or OCR data is sent to Amazon or affiliate analytics.

Amazon destinations remain the same fixed neutral tagged-search categories. Affiliate events remain limited to the existing coarse `tool`, `provider`, `placement`, and `link_key` metadata.

## Regression

Run:

```bash
node tools/_shared/check-cosmetics-legacy-safety-isolation.mjs
```

The regression fails if Lite again uses legacy safety metadata to decide review state, if FastScan again exposes the field in exact-match result objects, if Lite stops using the shared canonical merge layer, or if the non-safety disclaimers are removed.
