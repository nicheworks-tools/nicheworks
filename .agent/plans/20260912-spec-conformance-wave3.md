# SPEC conformance audit — wave 3

## Purpose

Continue the 87-tool implementation-quality cycle by auditing registry tools 31–45 against their complete per-tool specifications and current active runtime.

## Base and scope

- Original audit base main SHA: `630ba3a978be0d87ab8ef4d6b9672adbebdb6882`.
- Latest replayed main SHA before final PR validation: `f5b24b731d33400ea3f6a292df58e875cf058219`.
- Branch: `audit/spec-conformance-wave3-20260912`.
- Pull request: `#558`.
- Scope: registry tools 31–45.

## Wave 3 tools

1. `incident-update-generator`
2. `jp-postal-lite`
3. `json-repair`
4. `json2mermaid`
5. `kanji-modernizer`
6. `laundry-code-decode`
7. `light-check`
8. `linebreak-doctor`
9. `log-formatter`
10. `logistics-compliance-kit-jp`
11. `lp-skeleton-generator`
12. `manual-finder`
13. `membership-offer-builder`
14. `message-generator`
15. `metadatasnap`

## Audit method

For each tool:
1. Read the current `SPEC.md` acceptance criteria and implementation evidence.
2. Inspect the current public page and the runtime it actually loads.
3. Verify privacy/network, persistence, language, limits, export/copy, and safety/non-goal boundaries that materially affect user expectations.
4. Classify findings P0/P1/P2.
5. Fix every in-scope P0/P1; keep unrelated redesign/new feature work out of scope.
6. Extend `scripts/check-tool-runtime-contracts.mjs` from 30 to 45 audited tools using stable runtime markers.
7. Re-integrate against the latest main before PR and re-audit any in-scope runtime that changed concurrently.
8. Run repository CI and merge only when current-main integration is green.

## Priority

- P0: privacy/security/data loss, false trust/safety claim, destructive behavior, broken core action.
- P1: material acceptance-criterion failure, broken state/export/language/network contract, or misleading behavior likely to alter a user decision.
- P2: cleanup, dead code, copy precision, or edge-case hardening that does not block the core contract.

## Special current-main checks

- `json2mermaid`: re-audited after main moved to the shared `window.NWJSON2MermaidConverter` API. The visible Free converter still enforces the documented 300 KB / depth 12 / array 50 limits. The staged Pro batch integration calls the same converter API, while `pro-engine.mjs` and `mermaid-renderer-adapter.mjs` remain disconnected from the public page.
- `manual-finder`: re-audited against the current verified model-data waves and dynamic batch loader through the replayed main. Current search/pagination/shared-target behavior matches the evolved specification, and later concurrent data-only waves are preserved by PR merge integration.
- `metadatasnap`: current public copy correctly discloses Worker-first proxying, AllOrigins fallback, and possible direct OGP-image requests.

## Findings and fixes

### P0

None found in this wave.

### P1 — Membership Offer Builder legacy self-unlock

The active runtime contained an undocumented legacy Pro path that could be activated with `?pro=1`, a tool-local localStorage key, or `nw_pro_key`. The current tool specification defines the product as a browser-local Free draft + copy utility and does not define a Pro contract.

Fix:
- removed query/localStorage self-unlock and injected Stripe/Pro UI;
- restored the runtime to the documented Free generation + copy contract;
- included every documented input in the generated draft, including `timeInput`, which the previous output omitted;
- made the Japanese and English draft sections cover the same full input set and pre-launch cautions.

### P1 — Message Generator culture output mismatch

Selecting English-speaking or EU culture changed only the opening/closing while the body, relationship phrase, lead-in, and ending logic remained Japanese. This produced mixed-language output and violated the documented culture/content contract.

Fix:
- separated UI language from selected content culture;
- Japan culture now generates Japanese body content while English-speaking/EU generate English body content with their own opening/closing sets;
- regenerate preserves the same last context and only varies the documented randomized wording;
- removed the old placeholder click handler and added clipboard fallback behavior.

### P1 — MetadataSnap proxy failure was silent

When both proxy requests failed, the async action rejected without a user-facing result/error state. This left the tool with no useful failure explanation.

Fix:
- clear stale metadata/result state before and after failed requests;
- show localized fetch-failure guidance when Worker and AllOrigins both fail;
- strengthen URL validation with `URL` parsing after the HTTP(S) prefix check.

### P2 — JSON Repair implementation evidence drift

`SPEC.md` still listed a removed `tools/json-repair/pro-bridge.js`. The active Pro integration is embedded in `app.js` and reads shared `NWPro` loaded by `index.html`.

Fix: removed the stale evidence path and documented the current active integration.

### P2 — MetadataSnap specification drift

The specification still claimed the public FAQ/privacy copy falsely said URLs were not sent to a server. The public page had already been corrected.

Fix: synchronized the spec with the current Worker / AllOrigins / remote OGP-image disclosure and added the visible proxy-failure behavior to the contract.

## No P0/P1 findings in the other twelve tools

The following were checked against their active runtime and current acceptance criteria with no P0/P1 mismatch found:

- `incident-update-generator`
- `jp-postal-lite`
- `json-repair` (runtime; documentation drift fixed separately above)
- `json2mermaid`
- `kanji-modernizer`
- `laundry-code-decode`
- `light-check`
- `linebreak-doctor`
- `log-formatter`
- `logistics-compliance-kit-jp`
- `lp-skeleton-generator`
- `manual-finder`

`membership-offer-builder`, `message-generator`, and `metadatasnap` are the three P1 fixes listed above.

## Runtime regression coverage

`scripts/check-tool-runtime-contracts.mjs` now covers registry tools 1–45. Wave 3 adds structural assertions for:

- shared Pro gates and absence of tool-local bypasses where applicable;
- JP Postal local-data/result limits;
- JSON Repair active embedded Pro integration;
- JSON2Mermaid shared Free converter API, bounded limits, staged batch reuse, and public-page separation from staged Pro renderer modules;
- Kanji ambiguity/exclusion logic;
- Laundry local template matching and image limit;
- Light Check user-started camera and hard stop;
- LineBreak Doctor zero-width policy;
- LogFormatter unparsed-line preservation/shared Pro;
- Logistics memo/output boundary;
- LP HTML escaping;
- ManualFinder dynamic wave loading/pagination/shared targets;
- Membership legacy-Pro bypass prohibition and full input coverage;
- Message Generator culture/content separation;
- MetadataSnap proxy order/disclosure/failure handling.

## Validation

On PR `#558`, head `0c177feb6f384a3270cd67200598abe3db8dcdfb` passed the integrated PR checks after correcting one checker-only MetadataSnap text marker:

- Tool runtime contract audit: run `34690194620` — success.
- Tool spec audit: run `34690194630` — success.
- SEO audit: run `34690194668` — success.
- Validate Construction Tools Atlas Data: run `34690194619` — success.

The earlier runtime failure was not a product defect: the checker searched for `input URL is sent...` while the actual public disclosure says `entered URL is sent...`. The checker was aligned to the real visible copy; the product UI was not weakened or changed for that failure.

## Progress

- [x] Branch created from current main.
- [x] Audit tools 31–35.
- [x] Audit tools 36–40.
- [x] Audit tools 41–45.
- [x] Fix P0/P1 findings and synchronize affected specs.
- [x] Extend runtime-contract audit to 45 tools.
- [x] Rebase/replay the seven wave-3 files onto current main and re-audit concurrent JSON2Mermaid / ManualFinder changes.
- [x] Open PR and obtain green integrated PR validation.
- [ ] Squash merge after the final documentation-only head is green; then confirm main checks.

## Acceptance

Wave 3 closes only after all 15 tools have been inspected against their current specifications and active runtime, all discovered P0/P1 failures are fixed or explicitly justified, runtime-contract coverage reaches 45 tools, and the relevant repository checks are green on the final integrated head and after merge.
