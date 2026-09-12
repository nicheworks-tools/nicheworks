# ExecPlan — 解約どこナビ monorepo absorption + database foundation Phase 1

## Goal

Absorb the standalone `nicheworks-tools/unsubscribe-navi` project into the NicheWorks monorepo without disturbing the ongoing 87-tool quality cycle, while establishing the durable data model and publication rules required to grow it into a 100–200 service cancellation / withdrawal procedure database.

## Scope

In scope for this phase:

- `tools/unsubscribe-navi/` (new)
- this ExecPlan only

Explicitly out of scope:

- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- all existing 87 registered tools
- root / mother-site pages
- `common-spec/**`
- deployment settings
- root CI / workflows
- archiving or deleting the standalone repository
- publishing 100–200 verified services in this phase

The new tool directory remains intentionally **unregistered** until the current 87-tool quality cycle is complete, so the registered-tool denominator remains unchanged.

## Current source

Standalone source of truth being absorbed:

- repository: `nicheworks-tools/unsubscribe-navi`
- static UI: `public/index.html`, `public/app.js`, `public/style.css`
- data source: approximately 40 service records
- updater: 6-hour GitHub Actions job running `scripts/fetch-services.mjs`

The legacy updater only performs URL fetch/title checks and rewrites status/title. It does not discover new services, discover changed cancellation URLs, validate cancellation semantics, or distinguish a valid cancellation page from an unrelated HTTP 200 response. This mechanism must not be copied into the monorepo as the canonical update strategy.

## Product direction

The absorbed tool is not merely a link list. The target product is a structured cancellation / withdrawal procedure database with 100–200 services.

Primary user jobs:

1. Find the correct official cancellation / withdrawal path for a named service.
2. Distinguish cancellation, account deletion, automatic-renewal stop, MNP/transfer, and store-billed cancellation where relevant.
3. Identify the contract route that controls the procedure (web, App Store, Google Play, carrier, marketplace, etc.).
4. See when the procedure record was last independently verified.
5. Reach the official source without NicheWorks pretending to perform the cancellation itself.

## Data-quality rule

HTTP 200 is never sufficient evidence that a cancellation record is correct.

Future publishable records must be based on actual official-source verification and support evidence fields including:

- service identity
- category
- official site
- official cancellation / withdrawal source URL
- procedure type
- contract / billing route when applicable
- concise procedure summary
- notes / important caveats
- source title
- verification date
- verification state
- redirect/final URL when observed

Legacy imported records may remain visible during migration only if clearly identified as legacy / review-required data. They must not be upgraded to verified merely because a URL returns HTTP 200.

## Publication states

Canonical forward states:

- `legacy_review_required` — imported from the old repository and not yet independently reverified under the new contract
- `verified` — official source and procedure meaning independently confirmed
- `needs_review` — source exists but procedure meaning, route, or freshness needs re-check
- `retired` — service or relevant paid plan ended / migrated / replaced
- `placeholder` — candidate only; must never appear as a normal public result

## Scale target

Target stable coverage: **100–200 services**.

Expansion waves should prioritize categories with strong cancellation intent:

- video / streaming
- music / audio
- cloud / storage / productivity SaaS
- AI / software subscriptions
- mobile / carrier / SIM
- gaming memberships
- ebooks / magazines / learning
- shopping / memberships
- fitness / lifestyle subscriptions
- delivery / food / membership programs
- domestic subscription services with meaningful search demand

Do not inflate the count with dead placeholders or generic brand pages.

## Phase 1 implementation

1. Add `tools/unsubscribe-navi/` to the monorepo, without registry changes.
2. Preserve the current lightweight static architecture (HTML/CSS/JS, no framework).
3. Add a tool `SPEC.md` matching the NicheWorks specification contract headings.
4. Add `DATA_MODEL.md` defining the forward database contract and verification semantics.
5. Add `ROADMAP.md` recording the 100–200 service target and phased enrichment plan so this direction cannot be lost in chat history.
6. Add a schema-aware local audit script for duplicate IDs, invalid states, missing required fields, count/category summaries, and legacy/verified coverage. The audit must make no network requests.
7. Seed the absorbed tool with the legacy service set in a migration-safe representation. Legacy records remain `legacy_review_required` until reverified.
8. Update the UI to support database-scale search and category filtering while clearly separating legacy review state from verified state.
9. Apply current NicheWorks SEO, analytics, AdSense, donation, footer, and static-tool conventions within this new directory.

## Verification

- No existing registered tool changes.
- No `tools-index.json` or `tool-spec-manifest.json` changes.
- No common-spec changes.
- Static page loads its local dataset only.
- Search works across service name, aliases/keywords, category, and notes.
- Category filter works with the seeded dataset.
- Review-required records are visibly distinguished from verified records.
- No record is auto-promoted based solely on HTTP response status.
- Local audit script reports total records, duplicate IDs, state counts, category counts, missing required fields, and target progress toward 100/200.

## Later phases

### Phase 2 — legacy re-verification

Re-check all imported services against current official sources. Remove dead placeholders, mark retired services, correct changed URLs, and add billing-route distinctions where needed.

### Phase 3 — expansion to 100 services

Add new services in researched waves. Only verified records become normal public results.

### Phase 4 — expansion to 150–200 services

Expand long-tail coverage, strengthen individual service procedure detail, and introduce service-specific indexable pages only when the record has sufficient verified substance.

### Phase 5 — monetization

Add clearly separated, context-appropriate monetization surfaces such as replacement-service comparisons where they genuinely help the user after cancellation. Cancellation completion remains the primary user goal; monetization must not obstruct or confuse the official cancellation path.

## Registration gate

Do not add `unsubscribe-navi` to the registered NicheWorks tool count until:

- current 87-tool quality work has reached its intended closure point, and
- this absorbed tool has passed at least the legacy-data audit and tool-level acceptance criteria.

At registration time, update `tools/tools-index.json`, `tools/tool-spec-manifest.json`, sitemap/mother-site surfaces as required by then-current repository rules in a separate scoped change.
