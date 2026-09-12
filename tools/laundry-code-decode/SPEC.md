# Tool Specification — Laundry Code Decode

- Slug: `laundry-code-decode`
- Public URL: `https://nicheworks.app/tools/laundry-code-decode/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Explain common laundry-care symbols by category and provide an experimental browser-side photo candidate search, while requiring users to prioritize the actual garment label and professional guidance.

## Current functional contract

- Browse/search common care symbols across Wash, Bleach, Dry, Iron, and Dry Clean categories.
- Search the current category or all categories by keyword and open a selected symbol's Japanese/English meaning and detail.
- Copy the selected symbol result.
- Provide an experimental photo candidate search for PNG, JPEG, WebP, and GIF images up to the implemented 10 MB limit.
- Compare the selected image appearance with SVG symbol templates and return candidate matches/scores in the browser.
- Explicitly state that the photo feature is not OCR and not an accurate automatic symbol reader.
- Provide JP/EN UI and reference-only safety guidance.

## Inputs

- Category, search text, and all-category toggle.
- Symbol selection.
- Optional local image and photo-candidate category scope.
- JP/EN UI selection.

## Outputs

- Symbol meaning/detail and copyable result.
- Experimental image-comparison candidate list and reference scores.

## State and persistence

Search, selected symbol, image, and candidate state are current-page browser state. The current contract does not include persistent garment history.

## Privacy and network behavior

Symbol lookup and photo-candidate comparison run in the browser and the selected image is not intentionally uploaded by that workflow. Suite-wide advertising and analytics resources may load separately.

## Language mode

`bilingual single-page`

JP/EN controls switch the same symbol lookup and experimental photo workflow.

## Layout class

`mobile-oriented`

Care-symbol grids, search, image candidate controls, and result card are designed for tap-oriented narrow-screen use.

## Limits and non-goals

- The result is general reference information and does not override garment labels, maker instructions, fabric notes, or professional cleaner guidance.
- Photo candidate search is simple image/SVG comparison, not OCR, computer-vision certification, or guaranteed symbol recognition.
- Symbol meaning can vary by country, region, standard version, or era.

## Acceptance criteria

- [ ] Browsing/searching a known symbol returns the implemented bilingual meaning/detail and supports copying the selected result.
- [ ] A supported image within the size limit can run the experimental local candidate search without being described as OCR.
- [ ] Candidate scores remain explicitly reference-only and require manual user confirmation.
- [ ] JP/EN switching preserves categories, search, photo-candidate controls, and safety disclaimer.

## Implementation evidence

- `tools/laundry-code-decode/index.html`
- `tools/laundry-code-decode/app.js`
- `tools/laundry-code-decode/style.css`
- SVG/template resources used by the photo candidate implementation
