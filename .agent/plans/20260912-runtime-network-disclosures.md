# Runtime network disclosure corrections

## Purpose

Align public privacy/network copy with the implementation-grounded contracts established during the 87-tool specification audit. This repair is limited to false or malformed disclosure copy; fetch/runtime behavior is not changed.

## Base and scope

- Base main SHA: `74a30e0945d435648786e408c9d745c3c221e839`.
- Branch: `fix/runtime-network-disclosures-20260912`.
- Target tools: `metadatasnap`, `url-title-collector`.

## Required fixes

- [x] MetadataSnap: disclose before analysis that the entered URL is sent to a NicheWorks Worker; on failure the URL may be sent to AllOrigins; an OGP preview may request the remote image URL from the browser.
- [x] MetadataSnap: replace the false FAQ claim that all processing stays in the browser.
- [x] URL Title Collector JP/EN: replace local/browser-only claims with the actual NicheWorks Worker fetch contract.
- [x] URL Title Collector JP/EN: repair malformed description / OGP markup while touching those lines.
- [x] URL Title Collector JP/EN usage pages: make metadata and disclaimer wording match the Worker architecture.
- [x] Keep JavaScript/network behavior unchanged.
- [ ] Run SEO, tool-spec, and applicable repository checks before merge.

## Decision log

- Decision: correct disclosure rather than removing the Worker/proxy fetch architecture.
  Rationale: the current feature requires server-side page retrieval; the defect is the public claim that URLs never leave the browser.
  Date: 2026-09-12.

- Decision: disclose the AllOrigins fallback specifically for MetadataSnap.
  Rationale: it is a third-party fallback and therefore materially different from the first-party NicheWorks Worker.
  Date: 2026-09-12.

- Decision: repair malformed URL Title Collector metadata in the same PR.
  Rationale: the malformed trailing fragments sat on the exact description/OG/Twitter lines being corrected for truthfulness, and leaving them in place would preserve broken public metadata.
  Date: 2026-09-12.

## Discoveries

- MetadataSnap sends the entered URL first to `curly-meadow-fda4.nicheworks-tools.workers.dev`; if that fails it falls back to third-party `api.allorigins.win`. Rendering the extracted OG image may also make the user's browser request the remote image URL directly.
- URL Title Collector sends each entered URL to `floral-voice-bfc0.nicheworks-tools.workers.dev`, which retrieves target HTML. The browser then extracts the first `<title>` from that returned HTML.
- URL Title Collector JP metadata contained malformed trailing text after description/OG/Twitter tags. The EN root had a similarly malformed OG description plus Japanese browser-only metadata copy.
- No JavaScript, fetch target, proxy order, or runtime behavior was modified by this repair.

## Acceptance

Public copy must accurately tell users what URL data leaves the browser before they trigger the action. Metadata/structured descriptions must not claim browser-only/local processing where the runtime uses a Worker. No application logic should change.

Current implementation work is complete. Validation and merge remain.
