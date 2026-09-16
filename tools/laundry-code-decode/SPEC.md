# Tool Specification — Laundry Code Decode

- Slug: `laundry-code-decode`
- Public URL: `https://nicheworks.app/tools/laundry-code-decode/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Let users identify the meaning of current Japanese textile care-label symbols without uploading the label to a server. The canonical data set is the Consumer Affairs Agency overview of JIS L 0001:2024 used for Japanese care labels from 2024-08-20 onward.

## Canonical reference and scope

Primary reference:

- Consumer Affairs Agency, `洗濯表示(令和6年8月20日以降)`
- `https://www.caa.go.jp/policies/policy/representation/household_goods/guide/wash_02.html`

Canonical publication contract:

- exactly 43 current symbols from the seven official tables;
- washing: 15 symbols;
- bleaching: 3 symbols;
- tumble drying: 3 symbols;
- natural drying: 8 symbols;
- ironing: 5 symbols;
- professional dry cleaning: 5 symbols;
- professional wet cleaning: 4 symbols.

Each record in `data.js` MUST expose the official three-digit symbol number in `jis` and MUST correspond to one current symbol in the canonical reference.

The canonical set MUST NOT contain duplicate convenience records, invented combinations, practical-advice variants that reuse an official symbol as if they were separate symbols, or legacy symbols from previous Japanese standards.

## Current functional contract

- Render the 43 current JIS L 0001:2024 care symbols as local SVG templates.
- Group symbols into Wash, Bleach, Dry, Iron, and Professional UI categories while preserving the seven-table canonical classification in the data contract.
- Search by Japanese/English meaning, internal ID, professional-care letter, temperature where applicable, and official JIS symbol number.
- Show a bilingual meaning and official symbol number when a symbol is selected.
- Provide an experimental photo candidate search by comparing an uploaded image with the local SVG templates.
- Photo candidate search is not OCR and is not an authoritative automatic classifier.
- Process the uploaded photo locally in the browser. No photo content is uploaded by this tool.
- Allow copying the selected result and standard/safety context.

## Inputs

- Care-symbol category and selected symbol.
- Optional search text or official symbol number.
- Optional local image for experimental candidate comparison.
- UI language.

## Outputs

- Selected symbol meaning in Japanese or English.
- JIS symbol number.
- Up to three visual candidates for the experimental photo comparison.

## Privacy and network behavior

Symbol browsing, search, SVG rendering, image preprocessing, and photo candidate comparison run in the browser. Uploaded image content is not sent by the tool. Advertising and analytics resources required by the site may load independently.

## Language mode

`bilingual single-page`

JP/EN controls switch the same canonical symbol set and tool behavior.

## Layout class

`mobile-friendly utility`

The symbol grid and result areas reflow for narrow screens.

## Limits and non-goals

- Canonical scope is JIS L 0001:2024 for Japanese labels from 2024-08-20 onward.
- Older Japanese care-label systems and overseas care-label systems are outside the canonical data set.
- The tool explains standardized symbols; it does not guarantee that a specific garment is safe under a treatment.
- The physical garment label, manufacturer instructions, material notes, and professional cleaner guidance take priority.
- The photo feature performs simple visual template comparison only. It is not OCR, computer vision certification, or a substitute for manually checking the symbol.
- Optional supplementary wording such as laundry-net use, inside-out washing, weak wringing, pressing cloth, or decoration-specific instructions is not represented as separate JIS symbols.

## Rendering contract

- Machine-wash temperatures are only 30, 40, 50, 60, 70, or 95 where defined by the current table.
- 40°C hand wash is symbol 110; 30°C hand wash is symbol 111. These use the current hand-wash graphics and must not invent printed 40/30 numerals inside the tub.
- Tumble drying uses one dot (low) or two dots (high); there is no three-dot tumble symbol in the canonical set.
- Natural drying distinguishes one/two vertical lines and one/two horizontal lines; the diagonal corner line means shade.
- Ironing uses the current 210°C / 160°C / 120°C limits plus symbol 511 for 120°C without steam.
- P and F professional dry cleaning provide normal and gentle processes only. W professional wet cleaning provides normal, gentle, and very gentle processes.

## Acceptance criteria

- [ ] `data.js` contains exactly 43 unique three-digit `jis` values matching the canonical publication contract.
- [ ] No 20°C machine-wash symbol or three-dot tumble symbol exists.
- [ ] P/F professional dry-clean records never use the very-gentle two-line modifier.
- [ ] Natural-dry one/two line geometry and shade marker are distinguishable.
- [ ] Search accepts official symbol numbers such as `141` and `511`.
- [ ] Selecting a symbol displays its meaning and official symbol number.
- [ ] Photo candidate search compares only against the canonical 43-symbol set.
- [ ] Unsupported or malformed images fail safely without sending the image to a server.
- [ ] JP/EN switching preserves symbol selection and behavior.

## Implementation evidence

- `tools/laundry-code-decode/index.html`
- `tools/laundry-code-decode/data.js`
- `tools/laundry-code-decode/app.js`
- `tools/laundry-code-decode/style.css`
- `tools/laundry-code-decode/tests/behavior.test.mjs`
