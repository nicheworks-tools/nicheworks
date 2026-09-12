# MetadataSnap — canonical tool specification

- **Slug:** `metadatasnap`
- **Display name (JA):** メタデータ確認ツール
- **Display name (EN):** MetadataSnap
- **Implementation:** `tools/metadatasnap/`
- **Registry state:** active (registered implementation present)
- **Category:** metadata, file, privacy, inspect
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `metadatasnap` implementation at `/tools/metadatasnap/`. It does not authorize a production rewrite.

## 2. Purpose

Fetch a user-supplied HTTP(S) page through an HTTP proxy, parse its HTML, and show a compact set of page metadata: title, meta description, Open Graph image, and canonical URL.

## 3. Inputs

- A user-entered absolute HTTP(S) URL.
- JP/EN display selection.

## 4. Processing behavior

- Accept an HTTP or HTTPS URL and reject empty, malformed, or non-HTTP(S) input before starting proxy requests.
- Fetch the target page HTML through the NicheWorks Worker proxy at `curly-meadow-fda4.nicheworks-tools.workers.dev`.
- If the Worker request does not return usable HTML, retry through `api.allorigins.win/raw` as a fallback proxy.
- Parse returned HTML with `DOMParser` first and use regex extraction as a fallback path.
- Extract the first available document `<title>`, `meta[name="description"]`, `meta[property="og:image"]`, and `link[rel="canonical"]` values.
- Show localized `Not Found` text for missing title, description, or canonical values and hide the OGP image element when no image URL is found.
- Surface a localized fetch failure instead of leaving a stale or fabricated result when both proxy paths fail.
- Support JP/EN display switching and reset the current input/result state.

## 5. Outputs

- Page title.
- Meta description.
- OGP image preview when an `og:image` URL is present.
- Canonical URL.
- Localized validation and fetch-failure feedback.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty input:** Required or blank inputs use the implementation’s documented validation path and must not be presented as a successful completed result.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Analysis is not local-only. The entered target URL is transmitted to the NicheWorks Worker proxy so that the target HTML can be fetched. If that request fails, the URL is transmitted to the third-party AllOrigins proxy as a fallback. The returned HTML is then parsed in the browser. When an extracted `og:image` is previewed, the browser may request that remote image URL directly. Advertising and analytics resources may also load independently.

The public page now discloses this Worker-first / AllOrigins-fallback behavior and the possible direct OGP-image request. That disclosure must remain aligned with the runtime for as long as these network paths exist.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `api.allorigins.win`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The tool is a compact URL input followed by one result card and is intended to work in a narrow stacked layout as well as desktop widths.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch labels, validation text, fetch-failure text, and missing-value text on the same page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/metadatasnap/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Empty, malformed, and non-HTTP(S) values are rejected before any proxy request is attempted.
- [ ] Analysis sends the encoded target URL to the NicheWorks Worker first and falls back to AllOrigins only after the primary fetch path fails to return a successful response.
- [ ] Successful HTML is parsed for title, description, OGP image, and canonical metadata and missing values are represented without inventing metadata.
- [ ] When both proxy paths fail, the result stays hidden/cleared and a localized fetch error is shown.
- [ ] Reset clears the entered URL, current metadata state, visible result, and error state.
- [ ] Documentation and UI must not claim local-only URL analysis while the implemented proxy requests remain in place.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/metadatasnap/index.html`
- `tools/metadatasnap/app.js`
- `tools/metadatasnap/style.css`
