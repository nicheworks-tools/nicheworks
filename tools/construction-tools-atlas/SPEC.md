# Tool Specification — Construction Tools Atlas v2.3

- Slug: `construction-tools-atlas`
- Japanese name: `建設工具・現場用語辞典`
- English name: `Construction Tools Atlas`
- Public URL: `https://nicheworks.app/tools/construction-tools-atlas/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Redesign contract version: `2.3`
- Active public runtime: `tools/construction-tools-atlas/app.runtime.js`
- Legacy/non-authoritative runtime: `tools/construction-tools-atlas/app.js`

## Purpose

Provide a browser-local bilingual construction reference that can identify tools, materials, tasks and site terminology from exact names, aliases, slang, purpose, target material, work situation and visual cues. The v2.3 redesign specifically serves users who may recognize an item or know what it does without knowing its formal name.

The atlas remains a practical reference and does not replace safety standards, law, official manuals, manufacturer documentation or professional judgement.

## Current functional contract

Current public behavior remains available during staged migration:

- Search the local construction-term dataset by tool/term names, aliases, work names and English/Japanese wording.
- Filter results by implemented action/category/task dimensions and load additional results when needed.
- Open term detail content without leaving the tool.
- Switch the reference language and keep theme controls.
- Mark terms as favorites, filter to favorites and export/import favorite state.
- Provide menu, how-to, FAQ, related-tools and support surfaces.
- Use `app.runtime.js` as the active public runtime. `app.js` is legacy/non-authoritative.

The accepted v2.3 target extends this contract with semantic ambiguous search, interpretation chips, image-backed Visual Autocomplete, desktop master-detail UI, mobile bottom-sheet detail, `ja | en | both` presentation, canonical deep links/share, maintained relationships/compare, raster/WebP representative images and canonical-ID-based affiliate handoff.

## Inputs

- Free-form search query in Japanese or English.
- Action/category/task/material/trade and related filters as implemented.
- Semantic interpretation chip removal/adjustment.
- Language mode: Japanese, English or Both.
- Favorite add/remove, favorites-only view and favorite import data.
- Entry/detail selection.
- Canonical deep-link entry ID via `?entry=<canonical-id>`.
- Share, compare and related-entry actions.

## Outputs

- Ranked exact or semantic search result list and counts.
- Visual autocomplete candidates where available.
- Search interpretation chips and confidence-aware nearby candidates.
- Persistent desktop detail or mobile bottom-sheet detail.
- Bilingual names and language-appropriate dictionary content.
- Browser-local favorites with explicit export/import.
- Canonical share URL for a selected entry.
- Maintained related/confused/used-with navigation.
- Optional canonical-entry-based commercial next actions.

## State and persistence

Favorites remain browser-local and are persisted by canonical entry ID. They can be explicitly exported/imported through the tool UI.

The selected language mode may persist as `ja`, `en` or `both`. Language changes must not discard selected entry, favorites, search/filter state or deep-link target.

The canonical share/deep-link state is represented by `entry=<canonical-id>`. Free-form search text, complete favorite collections and secondary-language disclosure state are not placed into the URL by default.

## Privacy and network behavior

Search, semantic interpretation, ranking, filtering, favorites and language state operate in the browser. Free-form search terms are not intentionally sent to an application search backend or external AI service.

User-entered search text must not be passed directly into Amazon or another affiliate destination. Commercial navigation uses maintained canonical entry/offer mappings.

The page may load suite-wide analytics/advertising resources allowed by the common specification. User-initiated support and affiliate actions may navigate externally.

## Language mode

`bilingual single-page`

The application remains one canonical reference application rather than separate JA/EN copies. The v2.3 display modes are:

- `ja`: Japanese content primary; English identity remains visible; English explanations expand inline.
- `en`: English content primary; Japanese identity remains visible; Japanese explanations expand inline.
- `both`: both language bodies are visible from the start and vertically stacked.

Names are bilingual identity data and remain visible in Japanese and English in every mode. Search language is independent of display language.

## Layout class

`hybrid`

The v2.3 desktop target is a persistent master-detail workspace with roughly 40–45% result list and 55–60% detail. Mobile uses the result list as the main surface and a bottom sheet for selected-entry detail. At 320px and above, page-level horizontal scrolling is not acceptable.

## Limits and non-goals

- Not an authoritative safety standard, legal definition source or formal trade dictionary.
- Does not provide professional construction/safety decisions.
- Server-side search and external AI search are not required.
- User accounts and cloud favorite sync are not required.
- Image-upload tool recognition is not required.
- Real-time Amazon price/inventory and general EC price comparison are not required.
- Static detail pages for every record are not required and must not be mass-generated as thin SEO pages.
- Every entry does not need multiple secondary images in the initial redesign.
- Affiliate language optimization is separate from the bilingual dictionary contract.

## Acceptance criteria

- [ ] Exact Japanese/English names and maintained aliases resolve correctly while descriptive queries can produce semantically nearby candidates without requiring every token to be a literal substring.
- [ ] Desktop uses a persistent result/detail layout and mobile uses bottom-sheet detail without page-level horizontal scrolling from 320px upward.
- [ ] `ja`, `en` and `both` presentation preserves bilingual names, favorites, selected entry and search/filter state.
- [ ] Canonical `?entry=<id>` opens the requested entry directly: right detail on desktop and an automatically opened detail sheet on mobile.
- [ ] Favorites remain browser-local, canonical-ID-based and export/import capable.
- [ ] Image-backed entries use the actual canonical subject; production representative images are raster-first with WebP delivery, while misleading/category-wide images are rejected.
- [ ] Web Share API or clipboard fallback shares the canonical entry URL without automatically including raw search text.
- [ ] Affiliate actions map canonical entry IDs to maintained fixed offer IDs and do not forward free-form search text.

## Implementation evidence

- `tools/construction-tools-atlas/index.html`
- `tools/construction-tools-atlas/app.runtime.js`
- `tools/construction-tools-atlas/data/quality-loader.js`
- `tools/construction-tools-atlas/data/`
- `tools/construction-tools-atlas/style.css`
- `tools/construction-tools-atlas/data/entry-contract-v2.3.schema.json`
- `tools/construction-tools-atlas/data/entry-contract-v2.3.example.json`
- `tools/construction-tools-atlas/validate-contract-v2.3.mjs`

## v2.3 redesign contract

### 1. Canonical entry model

Each maintained entry has a stable language-independent canonical ID. Display names may change without changing the canonical ID.

Target fields:

```text
id
type
names
  ja
  en
  reading
aliases
  ja[]
  en[]
slang
  ja[]
  en[]
summary
  ja
  en
description
  ja
  en
uses
  ja[]
  en[]
situations_text
  ja[]
  en[]
actions[]
materials[]
trades[]
tasks[]
situations[]
visual_cues[]
power_types[]
categories[]
regions[]
relationships
  similar[]
  often_confused_with[]
  used_with[]
  parent[]
  child[]
images
  primary
    original
    display
    thumbnail
    alt_ja
    alt_en
    state
    subject_match
  secondary[]
commerce
  affiliate_intent
  offer_ids[]
quality
  content_state
  image_state
  detail_publish_state
```

Canonical IDs drive selection, favorites, deep links, sharing, images, relations, comparison, affiliate mapping and analytics.

### 2. Search: exact and ambiguous / descriptive search

Exact search prioritizes canonical names, aliases and site slang in both languages.

Descriptive search interprets maintained semantic dimensions, for example:

```text
コンクリ -> material: concrete
穴あけ -> action: drill
締める -> action: fasten
削る -> action: grind / sand
測る -> action: measure
水平 -> concept: level
赤い線 -> visual_cue: laser_line
シリコン -> material/task: sealant
電動 -> power_type: electric
```

The semantic dictionary is separate from generic entry body/fuzzy strings. Do not attempt to achieve semantic search only by adding more raw text to each entry.

Normalization includes Unicode NFKC, full/half-width variants, case, redundant spaces, common dash variants, practical kana variants and maintained common spellings/abbreviations. Uncertain typo correction must not silently turn one tool into another.

Conceptual ranking priority:

```text
exact canonical name
> exact alias / slang
> partial canonical name
> partial alias
> explicit semantic ID
> action/material/task/situation/visual-cue signals
> category/trade signals
> body text
```

A missing literal token must not automatically eliminate an otherwise strong semantic candidate.

Confidence may be maintained as `high`, `medium` or `low`. Low-confidence candidates must be labeled as nearby/possible results rather than certain identification.

### 3. Search interpretation UI

Recognized query dimensions appear as removable chips, e.g.:

```text
コンクリに穴あける電動のやつ
[ 穴あけ × ] [ コンクリート × ] [ 電動 × ]
```

Removing a chip re-ranks using the remaining interpretation.

### 4. Visual Autocomplete

Visual Autocomplete shows approximately 3–5 ranked candidates where useful, using:

- canonical representative image
- Japanese name
- English name
- one-line description in the current primary language

The image is identification data, not decoration. It should help the user decide “this is it” or “this is not it”.

### 5. Canonical image contract and Raster-first policy

An image-backed entry uses a representative image of the actual item itself:

- `hammer` -> a hammer
- `hammer-drill` -> a hammer drill
- `laser-level` -> a laser level / laser line tool
- `caulking-gun` -> a caulking gun

Do not use a broad category image, construction-site ambience or a different tool as the entry identity. No image is preferable to a misleading image.

Individual representative images are raster-first. The preferred delivery format is WebP. PNG/JPEG may remain as source/original assets or where transparency/editing/fallback requires them.

Existing SVG representative images are migration targets. Merely converting a schematic SVG to PNG does not complete migration if the subject is still an oversimplified icon. SVG remains appropriate for UI icons, logos, taxonomy icons, diagrams, dimensions and explanatory schematics.

Image variants:

- `thumbnail`: autocomplete/results/favorites/related entries
- `display`: desktop/mobile detail and comparison
- optional source/original

Do not load detail-sized originals for every list result.

Image states:

```text
none | pilot | reviewed | verified
```

Formal representative use should normally require `reviewed` or `verified`. Subject match is checked independently of resolution.

### 6. Detail information architecture

Primary detail reads vertically instead of hiding core information behind legacy tabs.

Preferred order:

```text
Japanese name
English name
reading
aliases / site names
representative image
what it is
main uses
target materials
work / trade context
common situations
similar entries
commonly confused entries
used-with entries
optional commercial actions
```

Legacy Meaning / Examples / Aliases / Meta tabs are not the target primary information architecture.

### 7. Japanese mode / English mode / Both mode

#### Japanese mode

Japanese content is primary, English name remains visible, and English explanation can be expanded inline per section.

#### English mode

English content is primary, Japanese name remains visible, and Japanese explanation can be expanded inline per section.

#### Both mode

Both language bodies are visible immediately and vertically stacked. Do not force bilingual body text into a narrow two-column layout.

Taxonomy/UI labels do not have to be duplicated in Both mode; bilingual completeness primarily applies to dictionary identity and content.

### 8. Relationships and comparison

Maintained relations:

```text
similar[]
often_confused_with[]
used_with[]
parent[]
child[]
```

Comparison focuses on maintained confused/related pairs rather than arbitrary all-to-all comparison. Representative images should be visible in comparison when available.

### 9. Favorites

Favorites remain first-class. Persist canonical IDs, not translated display strings. Add/remove, favorites-only, local persistence and explicit export/import remain supported.

### 10. Deep Link and Share

Canonical form:

```text
https://nicheworks.app/tools/construction-tools-atlas/?entry=hammer-drill
```

Desktop resolves and selects the entry in the persistent detail pane. Mobile resolves and automatically opens the corresponding bottom sheet after data is ready.

Invalid IDs must not crash the application. Use Web Share API where available and clipboard fallback otherwise. Raw free-form search text is not automatically inserted into the share URL.

### 11. History behavior

On mobile, Back should close an opened detail sheet before leaving the tool where practical. Deep-link state must not create history loops. Desktop selection must not flood browser history.

### 12. Affiliate contract

Commercial actions occur after canonical identification:

```text
canonical entry ID
-> maintained offer ID
-> fixed tool-owned commercial query/destination
```

Never pass raw free-form search text directly into Amazon or another affiliate destination.

`affiliate_intent`:

```text
high | medium | none
```

Entries without valid commercial actions show no forced affiliate block.

### 13. Content and publication quality

Generic fallback copy is not sufficient for a quality-ready entry. Priority entries need substantive definition, uses, target context, aliases, relevant relationships, bilingual identity/content and an appropriate representative image where available.

Suggested states:

```text
content_state: stub | expanded | reviewed | verified
image_state: none | pilot | reviewed | verified
detail_publish_state: inline_only | ready
```

Content and image readiness are separate quality axes.

### 14. Static detail pages / SEO

Per-entry static pages are optional future output, not a prerequisite for the core redesign. Only quality-ready entries with independent search value may become indexable static pages. Do not mass-generate thin pages.

Existing `?entry=` links remain compatible if static pages are added later.

### 15. Accessibility and performance

At minimum:

- keyboard-operable search/results/detail controls
- Enter/Space activation
- Escape for dismissible sheets where appropriate
- visible focus states
- semantic buttons
- `aria-expanded` for secondary-language disclosure
- representative image alt text in the active primary language
- proper mobile-sheet focus handling
- large-corpus result rendering without inserting all records into the DOM
- debounced search where needed
- lazy-loaded images
- thumbnail WebP for list/autocomplete and larger WebP only for selected detail/compare

### 16. Runtime authority and staged migration

`app.runtime.js` is the active public-page runtime. `app.js` remains legacy/non-authoritative.

The current page also loads compatibility/hotfix layers after the runtime, including detail/image fix scripts. They may remain temporarily during staged migration. Durable behavior should move into the canonical runtime/data path and obsolete hotfixes should be removed only after regression coverage exists.

Do not reintroduce behavior from old `app.js` simply because code remains there.

### 17. Implementation sequence

1. v2.3 contract and schema guardrails
2. semantic ambiguous search
3. desktop/mobile UI rebuild
4. JA / EN / Both presentation
5. deep link / share / history
6. image inventory and raster/WebP contract
7. representative image migration waves
8. Visual Autocomplete / relationships / compare
9. content quality waves
10. affiliate integration
11. cross-browser/accessibility/performance completion audit

Finished product flow:

```text
find
-> recognize visually
-> identify in JA + EN
-> understand
-> compare
-> save/share
-> optional commercial action
```
