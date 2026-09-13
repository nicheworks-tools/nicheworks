# Pattern Dictionary implementation contract — v0.3 slice

The product is a visual discovery dictionary, not an asset-download site. Ambiguous natural-language search and visual browsing are equal-priority discovery paths. Primary pattern colors are deterministic and never randomized. Final publication requires source-verified pattern data and verified high-quality PNG Reference Images.

## Repository URL contract

- Japanese root: `/tools/pattern-dictionary/`
- English root: `/tools/pattern-dictionary/en/`
- Japanese pattern detail: `/tools/pattern-dictionary/patterns/{id}/`
- English pattern detail: `/tools/pattern-dictionary/en/patterns/{id}/`
- Pattern IDs are language-independent canonical identifiers.
- Language switching on a detail page must preserve the same pattern ID.

## Prototype publication gate

The current 20 records are `prototype-curated`. Their static detail pages therefore remain `noindex,follow` even though canonical URLs already exist. A pattern may become indexable only after identity/name/taxonomy/color/relationship facts are researched and the primary Reference Image has been verified.

## Image contract

- Primary colors are fixed per pattern; random recoloring is prohibited.
- `color_role` is one of `non-essential`, `traditional`, `identity-relevant`, or `variable`.
- Final primary image target: 1536×1536 PNG.
- DEV placeholders must remain visibly marked and must never be represented as verified dictionary images.
- Search terms do not dynamically recolor the primary image.

## Discovery contract

- Search and visual browsing are equally important entry paths.
- Visual Autocomplete must display an image-backed candidate list.
- Search interpretation chips expose recognized cues and allow cue removal.
- Low-confidence searches must not pretend a candidate is certain.
- Visual filter controls use micro-pattern cues rather than jargon-only labels.
- Similar and commonly-confused relationships come from canonical data.
- Compare is optimized around two patterns on mobile.

## Commerce contract

Amazon is a downstream action after a pattern is identified. Search results and the top grid do not contain affiliate calls to action. Live affiliate URLs are not part of this slice.
