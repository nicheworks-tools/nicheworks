# Tool Specification — MetadataSnap

- Slug: `metadatasnap`
- Public URL: `https://nicheworks.app/tools/metadatasnap/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Fetch a user-supplied HTTP(S) page through an HTTP proxy, parse its HTML, and show a compact set of page metadata: title, meta description, Open Graph image, and canonical URL.

## Current functional contract

- Accept an HTTP or HTTPS URL and reject empty, malformed, or non-HTTP(S) input before starting proxy requests.
- Fetch the target page HTML through the NicheWorks Worker proxy at `curly-meadow-fda4.nicheworks-tools.workers.dev`.
- If the Worker request does not return usable HTML, retry through `api.allorigins.win/raw` as a fallback proxy.
- Parse returned HTML with `DOMParser` first and use regex extraction as a fallback path.
- Extract the first available document `<title>`, `meta[name="description"]`, `meta[property="og:image"]`, and `link[rel="canonical"]` values.
- Show localized `Not Found` text for missing title, description, or canonical values and hide the OGP image element when no image URL is found.
- Surface a localized fetch failure instead of leaving a stale or fabricated result when both proxy paths fail.
- Support JP/EN display switching and reset the current input/result state.

## Inputs

- A user-entered absolute HTTP(S) URL.
- JP/EN display selection.

## Outputs

- Page title.
- Meta description.
- OGP image preview when an `og:image` URL is present.
- Canonical URL.
- Localized validation and fetch-failure feedback.

## State and persistence

The selected language and extracted metadata are held in in-memory page state. The current implementation does not persist analyzed URLs or extraction history in localStorage, IndexedDB, or a NicheWorks account.

## Privacy and network behavior

Analysis is not local-only. The entered target URL is transmitted to the NicheWorks Worker proxy so that the target HTML can be fetched. If that request fails, the URL is transmitted to the third-party AllOrigins proxy as a fallback. The returned HTML is then parsed in the browser. When an extracted `og:image` is previewed, the browser may request that remote image URL directly. Advertising and analytics resources may also load independently.

The public page now discloses this Worker-first / AllOrigins-fallback behavior and the possible direct OGP-image request. That disclosure must remain aligned with the runtime for as long as these network paths exist.

## Language mode

`bilingual single-page`

JP/EN controls switch labels, validation text, fetch-failure text, and missing-value text on the same page.

## Layout class

`mobile-oriented`

The tool is a compact URL input followed by one result card and is intended to work in a narrow stacked layout as well as desktop widths.

## Limits and non-goals

- Availability depends on the proxy path and the target site being fetchable; authentication, bot protection, network failures, and proxy restrictions can prevent analysis.
- Extraction is limited to title, description, `og:image`, and canonical metadata; it is not a full SEO crawler or rendered-DOM/browser automation tool.
- JavaScript-generated metadata that is absent from the fetched source HTML may not be detected.
- Relative metadata URLs are not resolved by the current parser before display.
- The fallback uses a third-party proxy, so entered URLs may leave NicheWorks infrastructure when the primary Worker path fails.
- OGP previewing may create a browser request to the image host disclosed by the fetched page.

## Acceptance criteria

- [ ] Empty, malformed, and non-HTTP(S) values are rejected before any proxy request is attempted.
- [ ] Analysis sends the encoded target URL to the NicheWorks Worker first and falls back to AllOrigins only after the primary fetch path fails to return a successful response.
- [ ] Successful HTML is parsed for title, description, OGP image, and canonical metadata and missing values are represented without inventing metadata.
- [ ] When both proxy paths fail, the result stays hidden/cleared and a localized fetch error is shown.
- [ ] Reset clears the entered URL, current metadata state, visible result, and error state.
- [ ] Documentation and UI must not claim local-only URL analysis while the implemented proxy requests remain in place.

## Implementation evidence

- `tools/metadatasnap/index.html`
- `tools/metadatasnap/app.js`
- `tools/metadatasnap/style.css`
