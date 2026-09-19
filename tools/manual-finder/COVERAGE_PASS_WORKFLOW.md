# ManualFinder Coverage-Pass Workflow

Status: normative for all future model-level ManualFinder expansion
Effective: 2026-09-19

This workflow replaces slow model-by-model expansion as the default. The goal is to process large official manufacturer scopes safely without treating scraper output as truth and without allowing undetected models to disappear.

## Non-negotiable rules

1. **The official population comes first.** A pass starts by locking an explicit manufacturer-defined scope such as an official support/manual index, product-family index, or other enumerable official catalog boundary.
2. **Discovery is not verification.** Scripts may collect candidate models and candidate manual/support URLs, but a discovered URL is not public evidence until the model relationship and destination type are verified.
3. **Not found never means nonexistent.** A model that exists in the locked official population but has no accepted destination remains present as an unresolved/held record.
4. **No inferred product identities or URLs.** Similar names, family numbering, URL patterns, search-engine snippets, retailer pages, mirrors, and neighboring models do not prove a manual relationship.
5. **Official sources only for publication.** Public model-level records require manufacturer-controlled evidence. Third-party sources may help locate official pages but cannot establish the published relationship.
6. **Every population member must reconcile.** A pass cannot be declared complete unless every model in the locked population has exactly one final review state.
7. **Automation must fail closed.** Ambiguous, structurally unexpected, redirected, region-mismatched, or weak-evidence cases are held rather than promoted.
8. **Large batches are preferred once the extractor is validated.** PR size is not artificially limited by row count when the same verified source structure supports hundreds of rows.

## Required pass states

Each model in a locked population must eventually be classified as exactly one of:

- `direct` — exact model-specific official manual/help destination established.
- `shared` — manufacturer explicitly places this model in a shared official manual/help destination.
- `support_only` — exact official model support page is established, but no deeper manual target was accepted.
- `held` — the official model exists in scope, but the destination relationship is not sufficiently established for publication.

`not_found`, `missing`, and silent omission are **not final states**.

## Stage 1 — lock the official population

Before bulk extraction, record:

- maker;
- exact scope name;
- region/language;
- official universe/index URL(s);
- source observation date;
- manufacturer-declared model count when the source exposes one;
- exact model identifiers captured from that source;
- any known pagination, lazy loading, archived-product split, series grouping, or region split.

A pass with only a declared count but an incomplete exact model list remains `acquiring_universe`. It is not completion-ready.

If no official enumerable population exists, the pass must define a narrower evidence-backed boundary and must not claim manufacturer-wide completeness.

## Stage 2 — candidate discovery

Run multiple discovery channels where available:

1. official manual index;
2. official product/support index;
3. official site search;
4. official sitemap or manufacturer-exposed structured data;
5. official product pages and their manual/download links;
6. official archive/discontinued-product indexes;
7. alternate official regional site only when model identity equivalence is explicit.

The pipeline may automate these channels. Search engines may be used only to locate official pages; their snippets are not publication evidence.

For each candidate, retain provenance:

- discovery channel;
- source URL;
- candidate destination URL;
- model token observed;
- redirect target if any;
- retrieval date.

## Stage 3 — positive verification

A candidate can become `direct`, `shared`, or `support_only` only after all applicable checks pass:

- destination is HTTPS and manufacturer-controlled;
- official page visibly identifies the exact model, or the manufacturer-defined shared group visibly includes it;
- page is actually a manual/help/support destination, not a generic category or search page;
- redirects do not land on another model or generic fallback;
- region/language mismatch does not change product identity;
- shared pages are marked `shared`, never disguised as direct;
- manual and support URLs remain separate when both exist;
- evidence URL is retained.

HTTP 200 alone is never sufficient.

## Stage 4 — negative escalation

Any population model without an accepted positive result enters secondary discovery. It must not disappear.

For unresolved models, attempt applicable alternate official channels, including:

- alternate official manual index;
- model-specific official support search;
- official product page;
- official downloads/help guide;
- archived/discontinued index;
- official sitemap/structured data;
- regional official site where identity equivalence is explicit.

If still unresolved, classify it `held` with:

- reason class;
- attempted discovery channels;
- evidence/source URLs checked;
- review date;
- concise reviewer note.

A `held` row means “official model exists but publication evidence is insufficient,” not “no manual exists.”

## Stage 5 — extractor validation before scaling

A new manufacturer/source extractor must not be trusted immediately at full scale.

Before bulk publication:

- compare extractor output against a manually reviewed validation sample;
- include direct, shared, archived, redirecting, and unresolved examples where available;
- fix parser/normalization errors before scaling;
- verify that duplicate and variant normalization does not merge distinct official models;
- verify that non-model accessories, kits, color variants, and bundle SKUs are handled according to the locked scope rather than guessed.

After validation, the same source structure may be processed in large batches.

## Stage 6 — reconciliation gate

A completed pass must satisfy:

```
official population
= direct
+ shared
+ support_only
+ held
```

Additional hard gates:

- exact model identifiers are unique in the population;
- every population model has exactly one review state;
- every published destination has official evidence;
- every held row has a reason and attempted-discovery record;
- manufacturer-declared count, when available and applicable, reconciles with the captured population;
- no discovered candidate outside the locked population is silently promoted;
- no population member is silently omitted.

If any gate fails, `coverage-pass-complete` is forbidden.

## Stage 7 — publication

Only reviewed `direct`, `shared`, and accepted `support_only` records may enter the public ManualFinder dataset.

`held` records remain machine-readable audit data but are not promoted as if a model-specific manual had been verified.

Large publication PRs are acceptable when:

- the official population is locked;
- extractor behavior has been validated;
- reconciliation is complete;
- tests cover the source/parser boundary;
- machine-readable audit output is included.

## Stage 8 — refresh

Every completed pass records a refresh path. A future refresh compares the current official population against the previous locked population and emits:

- added models;
- removed/archive-moved models;
- destination changes;
- state changes;
- unresolved regressions.

A refresh must not erase historical held evidence or silently reinterpret old shared/direct states.

## Repository artifacts

Future passes use these repository-level artifacts:

- `COVERAGE_PASS_WORKFLOW.md` — this normative workflow.
- `coverage-passes/<maker>/<scope>.json` — machine-readable universe/reconciliation manifest.
- `scripts/coverage-pass-lib.mjs` — extraction/validation helpers.
- `scripts/discover-support-index.mjs` — candidate discovery CLI; output is candidate data, not publication truth.
- `tests/coverage-pass-pipeline.test.mjs` — fail-closed pipeline invariants.

Provider-specific extractors/config may be added when a generic extractor cannot represent the official source safely.

## Completion terminology

- `acquiring_universe` — official scope identified, exact population not fully captured.
- `reviewing` — exact population locked; records are being verified/escalated.
- `coverage-pass-complete` — reconciliation gates pass for the documented scope.
- `expanded` — useful published model-level coverage exists, but the relevant manufacturer scope is not yet complete.

No future ManualFinder work may use “script found N models” as a completion claim by itself.
