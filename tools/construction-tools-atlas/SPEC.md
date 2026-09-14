# Tool Specification — Construction Tools Atlas v2.3

- Slug: `construction-tools-atlas`
- Japanese name: `建設工具・現場用語辞典`
- English name: `Construction Tools Atlas`
- Public URL: `https://nicheworks.app/tools/construction-tools-atlas/`
- Common specification: `common-spec/spec-ja.md`
- Specification status: `redesign-target`
- Language mode: `bilingual single-page / ja | en | both`
- Active public runtime: `tools/construction-tools-atlas/app.runtime.js`
- Legacy/non-authoritative runtime: `tools/construction-tools-atlas/app.js`

## 1. Product purpose

Construction Tools Atlas is a browser-local bilingual reference for construction tools, materials, tasks, site terminology, aliases, slang and English/Japanese names.

Its primary value is not only exact-name lookup. A user who does not know the formal name must be able to find the likely item from its purpose, target material, work situation, visual cue or colloquial description.

Representative queries include:

- `コンクリに穴あける電動のやつ`
- `赤い線出すやつ`
- `シリコン押し出すやつ`
- `壁の中の柱探すやつ`
- `ネジ締める電動の`
- `hammer drill`
- `tool that shoots a red level line`

The atlas is a practical reference. It does not replace safety standards, law, official manuals, manufacturer documentation or professional judgement.

## 2. Canonical entry contract

Each maintained entry must have a stable language-independent canonical ID. Display names may change without changing the canonical ID.

Target v2.3 fields:

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

Canonical IDs drive search selection, favorites, deep links, sharing, image mapping, relations, comparison, affiliate mapping and analytics.

## 3. Search model

Search must support both exact lookup and ambiguous descriptive discovery.

### 3.1 Exact / known-name search

Priority sources include canonical Japanese and English names, aliases and site slang.

### 3.2 Ambiguous / descriptive search

A query may be interpreted into maintained semantic dimensions such as:

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

The semantic dictionary is separate from the entry body. Do not rely only on dumping more strings into a generic fuzzy field.

### 3.3 Normalization

At minimum search normalization must cover Unicode NFKC, full/half-width variants, case, redundant spaces, common dash variants, practical kana variants and maintained common spellings/abbreviations.

Do not silently auto-correct a query into a different tool when the correction is uncertain.

### 3.4 Ranking

Conceptual priority:

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

A missing token must not automatically eliminate an otherwise strong semantic candidate.

Search may internally classify confidence as `high`, `medium` or `low`. Low-confidence results must be presented as nearby candidates, not as a certain identification.

## 4. Search interpretation UI

Recognized semantic dimensions must be visible as removable interpretation chips.

Example:

```text
コンクリに穴あける電動のやつ
[ 穴あけ × ] [ コンクリート × ] [ 電動 × ]
```

Removing a chip re-ranks against the remaining interpretation.

## 5. Visual Autocomplete

Autocomplete should show approximately 3–5 ranked candidates where useful. A candidate may contain:

- canonical representative image
- Japanese name
- English name
- one-line description in the current primary language

The image is identification data, not decoration. The user should be able to use it to decide “this is it” or “this is not it”.

## 6. Canonical image contract

Each image-backed canonical entry should use a representative image of the actual item itself.

Examples:

- `hammer` -> a hammer
- `hammer-drill` -> a hammer drill
- `laser-level` -> a laser level / laser line tool
- `caulking-gun` -> a caulking gun

Do not substitute category-wide images, construction-site ambience or an unrelated tool for an individual entry.

If a correct image is unavailable, no image is better than a misleading image.

### 6.1 Raster-first policy

Individual entry representative images are raster-first. The preferred delivery format is WebP.

PNG/JPEG may be kept as original/source material or used where transparency/editing/fallback requires it. Do not standardize all production delivery on large PNG files.

Existing SVGs used as individual representative images are migration targets. Merely converting a schematic SVG to PNG does not satisfy this contract if the subject is still an oversimplified icon. Replace it with an accurate real-object raster image where possible.

SVG remains appropriate for UI icons, logos, arrows, taxonomy icons, diagrams, dimensions and schematic explanatory graphics.

### 6.2 Variants

A representative image may provide:

- `thumbnail` — autocomplete, result rows, favorites and related entries
- `display` — desktop detail, mobile detail and compare views
- optional source/original

Do not load detail-sized original assets for every result-row thumbnail.

### 6.3 Image state

Supported quality states:

- `none`
- `pilot`
- `reviewed`
- `verified`

Formal representative use should normally require at least `reviewed`.

Subject match must be checked independently of image resolution. A high-quality photo of the wrong or materially different tool is not acceptable.

## 7. Desktop layout

Desktop uses a persistent master-detail workspace.

- left approximately 40–45%: ranked result list
- right approximately 55–60%: persistent selected-entry detail
- search and interpretation remain available above the workspace
- result list and detail may scroll independently where necessary

Selecting a result updates the right detail pane instead of navigating to a separate page.

## 8. Mobile layout

Mobile uses the result list as the main surface and a bottom sheet for detail.

Selecting a result opens its detail sheet. The detail begins with the bilingual identity and canonical representative image.

At widths of 320px and above, page-level horizontal scrolling is not acceptable.

## 9. Detail information order

Primary detail content should read vertically rather than hiding core content behind multiple tabs.

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
optional commercial next actions
```

Legacy Meaning / Examples / Aliases / Meta tabs are not the target primary information architecture.

## 10. Language contract

The application supports three display modes:

- `ja`
- `en`
- `both`

Names are bilingual identity data and remain visible in both languages in every mode.

### Japanese mode

- Japanese name/content is primary.
- English name remains visible.
- English explanation is collapsed by default and may be expanded inline per section.

### English mode

- English name/content is primary.
- Japanese name remains visible.
- Japanese explanation is collapsed by default and may be expanded inline per section.

### Both mode

- Japanese and English content are both expanded from the start.
- Content is vertically stacked, not forced into a two-column bilingual layout.

UI labels and taxonomy chips do not have to be fully duplicated in Both mode; the bilingual requirement primarily applies to dictionary identity and content.

Search language is independent of display language. Japanese queries must work in English mode and English queries must work in Japanese mode.

Language changes must not discard selected entry, favorites, current search/filter state or deep-link target.

## 11. Relationships and comparison

Maintained relation types include:

- `similar`
- `often_confused_with`
- `used_with`
- optional parent/child relations

Comparison is primarily for maintained confused/related pairs, not arbitrary all-to-all comparison.

Representative images should be used in comparison when available.

## 12. Favorites

The existing favorites feature remains first-class.

Required behavior:

- add/remove from list and detail where available
- favorites-only view
- browser-local persistence
- explicit export/import
- language changes do not discard favorites

Persist canonical IDs rather than translated display strings.

## 13. Deep Link and Share

Individual static HTML pages are not required for sharing.

Canonical share form:

```text
https://nicheworks.app/tools/construction-tools-atlas/?entry=hammer-drill
```

Desktop behavior:

- load the application
- resolve canonical ID
- select that entry
- show it immediately in the persistent detail pane

Mobile behavior:

- load the application
- resolve canonical ID
- automatically open that entry in the bottom sheet after data is ready

An invalid ID must not crash the application; show a lightweight not-found state and keep the dictionary usable.

Use Web Share API when available, otherwise copy the canonical URL.

Do not automatically include the user’s free-form search query in the shared URL.

## 14. History / Back behavior

On mobile, opening a detail from the list should permit Back to close the detail sheet before leaving the tool where practical. Deep-link entry state must not create unusable history loops.

Desktop entry changes should not flood browser history.

## 15. Affiliate contract

Commercial actions occur only after a canonical entry has been identified.

Never feed the raw free-form user query directly into Amazon or another affiliate destination.

Use:

```text
canonical entry ID
-> maintained offer ID
-> fixed tool-owned commercial query/destination
```

`affiliate_intent` may be `high`, `medium` or `none`. Entries with no valid commercial action show no affiliate block.

Affiliate language optimization is a separate implementation decision and is not required to block the bilingual dictionary redesign.

## 16. Content quality

Generic fallback text is not sufficient for a quality-ready entry.

Priority entries should contain substantive definition, uses, target context, aliases, relevant relations, bilingual names/content and an appropriate representative image where available.

Content and image readiness are evaluated separately.

Suggested states:

```text
content_state: stub | expanded | reviewed | verified
image_state: none | pilot | reviewed | verified
detail_publish_state: inline_only | ready
```

## 17. Static detail pages / SEO

Per-entry static pages are not required for the core redesign. The main application plus canonical `?entry=` deep links is the primary contract.

Future indexable static detail pages may be created only for entries that meet content/image quality gates and have independent search value. Do not mass-generate thin pages for every record.

Existing `?entry=` links must remain compatible if static detail pages are introduced later.

## 18. Privacy and network behavior

Search, semantic interpretation, filtering, ranking, favorites and language state operate in the browser.

Do not send free-form search terms to an application search backend or external AI service as part of normal search.

External navigation is permitted only for user-initiated supported destinations such as support or affiliate links and suite-wide resources allowed by the common specification.

## 19. Accessibility

At minimum:

- keyboard-operable search/results/detail controls
- Enter/Space activation
- Escape for dismissible sheets where appropriate
- visible focus states
- semantic buttons instead of click-only divs
- `aria-expanded` for secondary-language disclosure controls
- representative image alt text in the active primary language
- proper focus handling for mobile detail sheets

## 20. Performance

The atlas must remain usable with a large corpus.

- do not render all records into the DOM at once
- use load-more or virtualization where appropriate
- debounce search as needed
- lazy-load images
- use thumbnail WebP for lists/autocomplete
- load larger display images only for selected detail/compare views
- avoid loading both language bodies for every hidden record in the result list

## 21. Runtime authority and migration

`app.runtime.js` is the active public-page runtime. `app.js` is legacy/non-authoritative.

Current `index.html` also loads compatibility/hotfix layers after the runtime, including detail/image fix scripts. Those may remain during staged migration, but the redesign target is to absorb durable behavior into the canonical runtime/data pipeline and remove obsolete hotfix layers only after regression coverage exists.

Do not reintroduce behavior from old `app.js` merely because it exists there.

## 22. Acceptance criteria

### Search

- exact JA/EN names and aliases resolve correctly
- descriptive queries produce semantically nearby candidates
- low-confidence results do not claim certainty
- interpretation chips can re-rank results
- search language is independent of UI language

### Images

- an image-backed entry shows the actual canonical subject
- production representative images are raster-first and WebP-delivered
- category/ambient images are not used as item identity
- autocomplete/list/detail use the same canonical subject
- detail uses a larger variant than list rows
- wrong image is rejected in favor of no image

### Desktop

- persistent two-pane master-detail layout
- selected entry updates right detail
- canonical deep link preselects the entry

### Mobile

- result opens bottom-sheet detail
- canonical deep link auto-opens the correct sheet
- closing the sheet leaves the dictionary usable
- no page-level horizontal scroll from 320px upward

### Language

- `ja`, `en`, `both` modes exist
- names remain bilingual in every mode
- secondary-language explanations expand inline
- Both mode starts with both language bodies visible in vertical order
- language switch preserves selected entry/favorites/search state

### Favorites / Share

- favorites remain local and export/import capable
- favorites persist by canonical ID
- share uses canonical ID URL
- Web Share/clipboard fallback works
- raw search text is not inserted into share URL by default

### Affiliate

- canonical ID maps to maintained fixed offer IDs
- raw search text is not passed to affiliate search
- non-commercial entries show no forced affiliate action

## 23. Implementation sequence

1. v2.3 contract and schema guardrails
2. semantic ambiguous search
3. desktop/mobile UI rebuild
4. JA / EN / Both presentation
5. deep link / share / history
6. image inventory and raster/WebP contract
7. representative image migration waves
8. visual autocomplete / relationships / compare
9. content quality waves
10. affiliate integration
11. cross-browser/accessibility/performance completion audit

The finished product flow is:

```text
find
-> recognize visually
-> identify in JA + EN
-> understand
-> compare
-> save/share
-> optional commercial action
```
