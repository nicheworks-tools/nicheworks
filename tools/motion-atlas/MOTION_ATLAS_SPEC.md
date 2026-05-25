# Motion Atlas v0.1 Canonical Specification

This file is the source-of-truth specification for Motion Atlas. Do not replace it with a generic scaffold, thin foundation page, Pro-first page, or static list.

## Product definition

Motion Atlas is a motion decision tool for UI / web / app production. It explains and demonstrates motion / animation / transition / micro interaction patterns by showing:

- what the motion is
- what it looks like
- how it moves
- when to use it
- when not to use it
- how it differs from similar motions
- how to ask AI to implement it precisely
- basic implementation hints
- reduced-motion and accessibility cautions

It is not merely an animation-name list, CSS sample gallery, or prompt collection.

Core value: help users who do not know the name of a motion, cannot describe it to AI, or cannot distinguish similar motions, by letting them see, compare, and copy usable prompts.

## Placement and language

- Operator: Niche Works / NicheWorks
- English root: `/tools/motion-atlas/`
- Japanese version: `/tools/motion-atlas/ja/`
- English is the primary version.
- Japanese is a parallel support entrance.
- One page = one language.
- No automatic redirect.
- EN / JA mutual links are required.

## Core message

English:

> More than motion names. A motion atlas you can actually see, compare, and use with AI.

Japanese:

> 名前だけで終わらない。見て、比べて、AIに正確に頼めるモーション辞典。

## First required task

Promote the approved Motion Atlas mock to production root and ja pages.

Targets:

- `tools/motion-atlas/index.html`
- `tools/motion-atlas/ja/index.html`

Rules:

- Treat the approved mock as source of truth.
- Do not treat the mock as a loose reference.
- Do not create a generic scaffold.
- Do not create a thin foundation page.
- Build root and ja at the same quality level.
- Keep desktop-first density.
- Use left filters / center list / right detail as the base layout.
- Create usage / about / pro pages as real supporting pages, not one-paragraph placeholders.

## Required initial directory structure

```txt
tools/
  motion-atlas/
    index.html
    styles.css
    app.js
    data/
      motions.json
      categories.json
      demo-presets.json
    usage/
      index.html
    about/
      index.html
    pro/
      index.html
    ja/
      index.html
      usage/
        index.html
      about/
        index.html
      pro/
        index.html
```

Future expansion may add `motions/[slug]/`, `categories/[slug]/`, `compare/`, `search/`, and `topics/[problem]/`, but the first public version can remain a static one-page runtime with a JS detail panel.

## Required pages

English:

- `/tools/motion-atlas/` — main tool: search, filters, cards, live demos, detail panel, compare, favorites, recent history, prompt copy.
- `/tools/motion-atlas/usage/` — how to search, filter, read cards, replay demos, compare, copy prompts, and use reduced motion.
- `/tools/motion-atlas/about/` — purpose, series position, what it is / is not, accessibility and disclaimer.
- `/tools/motion-atlas/pro/` — future Pro plan only; no paid lock in the initial version.

Japanese mirrors the same structure under `/tools/motion-atlas/ja/`.

## Layout

Motion Atlas is a desktop-first dense tool. It must not be reduced to a mobile-style one-column LP.

PC layout:

- header: Motion Atlas, tagline, EN/JA link
- `ad-top` above the main UI
- left filters
- center list with motion cards and live demos
- right detail panel with large demo and prompt/code sections
- compare tray
- favorites / recent history
- FAQ
- `ad-bottom`
- donation block
- footer

Recommended desktop width:

- max width: 1200–1440px
- left filters: 220–280px
- center list: flexible
- right detail: 320–420px
- 600px fixed layout is prohibited

Mobile behavior:

- filters become drawer / collapsible panel
- list uses compact cards
- detail becomes full-screen sheet
- compare uses a horizontally scrollable table
- autoplay is reduced
- demos should prefer one-at-a-time replay
- reduced motion must be respected

## Header rules

- Do not permanently display logo images in the tool header.
- Do not duplicate logo assets inside the tool.
- Use `/assets/...` for shared assets.
- Do not add large cross-tool nav.
- A small NicheWorks home link is acceptable.

## Required controls

Left filter must include:

- Search
- Category
- Motion type
- Trigger
- Intensity
- Speed feel
- Mobile fit
- Accessibility / reduced-motion fit
- Purpose / use case
- Reset filters

Each motion card must include:

- live mini demo
- motion name
- English/Japanese label
- category chip
- motion type chip
- summary
- trigger
- intensity
- mobile fit
- accessibility caution chip
- View detail
- Add compare
- Favorite
- Copy prompt
- Replay

Right detail panel must include:

1. Large live demo
2. Replay / Pause / Speed / Reduced motion
3. Name
4. Aliases
5. Category / motion type / trigger
6. Summary
7. What it looks like
8. How it moves
9. Beginner wording
10. Practical intent
11. Use case
12. Not for
13. Bad request
14. Better request
15. Why better
16. Short AI prompt
17. Basic code snippet
18. Similar / compare motions
19. Reduced motion fallback
20. Implementation notes

## Data model

Main data file:

- `tools/motion-atlas/data/motions.json`

Each motion entry must include:

- `id`
- `slug`
- `name_en`
- `name_ja`
- `aliases_en`
- `aliases_ja`
- `category`
- `motion_type`
- `trigger`
- `summary_en`
- `summary_ja`
- `beginner_wording_en`
- `beginner_wording_ja`
- `practical_intent_en`
- `practical_intent_ja`
- `use_case_en`
- `use_case_ja`
- `not_for_en`
- `not_for_ja`
- `bad_request_en`
- `bad_request_ja`
- `better_request_en`
- `better_request_ja`
- `why_better_en`
- `why_better_ja`
- `short_ai_prompt_en`
- `short_ai_prompt_ja`
- `compare_ids`
- `demo_type`
- `demo_config`
- `intensity`
- `speed_feel`
- `mobile_fit`
- `a11y_load`
- `code_hint_css`
- `reduced_motion_fallback_en`
- `reduced_motion_fallback_ja`

## Initial categories

- `entrance`
- `exit`
- `emphasis`
- `hover`
- `focus`
- `scroll-reveal`
- `loading`
- `state-change`
- `text-animation`
- `list-stagger`
- `modal-sheet-drawer`
- `cta-micro-interaction`
- `navigation-transition`
- `feedback`
- `layout-transition`

## Motion types

- `opacity`
- `translate`
- `scale`
- `rotate`
- `blur`
- `clip-mask`
- `height-collapse`
- `color`
- `shadow`
- `stroke-draw`
- `text`
- `sequence`
- `loop`
- `physics-like`
- `morph`
- `loading-indicator`

Multiple motion types are allowed.

## Triggers

- `on-load`
- `on-scroll`
- `on-hover`
- `on-focus`
- `on-click`
- `on-submit`
- `on-success`
- `on-error`
- `on-route-change`
- `on-open`
- `on-close`
- `loop`
- `manual-replay`

## Search behavior

Search must cover:

- names
- aliases
- category
- motion type
- trigger
- summary
- beginner wording
- practical intent
- use case
- not-for cases
- bad request
- better request
- short AI prompt

Search ranking order:

1. exact id / slug
2. exact name
3. alias match
4. beginner wording match
5. trigger match
6. use case match
7. category match
8. related motion match

Zero results must not render a blank page. Show close matches, popular motions, beginner examples, category shortcuts, and examples such as fade, slide, hover, loading, and scroll reveal.

## Demo behavior

All demos must actually move. Static thumbnails and fake demo images are prohibited.

Allowed:

- CSS animation
- CSS transition
- CSS keyframes
- lightweight JS class toggle
- SVG stroke animation
- transform / opacity / clip-path

Forbidden:

- fake thumbnails
- static images only
- heavy repeated canvas
- external animation libraries
- autoplaying many heavy loops
- intense loops without user action

Initial demo types:

- `fade`
- `slide`
- `scale`
- `fade-slide`
- `bounce`
- `shake`
- `pulse`
- `hover-lift`
- `focus-ring`
- `skeleton`
- `spinner`
- `progress`
- `stagger`
- `modal`
- `drawer`
- `bottom-sheet`
- `checkmark-draw`
- `typewriter`
- `count-up`
- `accordion-collapse`
- `button-press`

## Reduced motion

Must detect OS setting:

```css
@media (prefers-reduced-motion: reduce) {}
```

and JS:

```js
window.matchMedia('(prefers-reduced-motion: reduce)')
```

The app must include a Reduce motion toggle, save it to localStorage, default to ON when the OS setting is reduce, and allow explicit user change.

When reduced motion is ON:

- stop autoplay
- stop loop animation
- replace shake / bounce / pulse with safer fallback
- short opacity fade may be acceptable
- show fallback explanation in detail

English message:

> Reduced motion is on. Demos use safer fallback behavior.

Japanese message:

> 動きを減らす設定が有効です。デモは負荷や刺激を抑えた表示になります。

## Compare

Free version:

- max 2 motions
- no sharing URL
- no saved sets
- no Pro gate

Required comparison fields:

- name
- category
- motion type
- trigger
- intensity
- speed feel
- visual feel
- best use
- not for
- mobile fit
- a11y load
- reduced motion fallback
- implementation complexity
- AI prompt clarity
- code difference

## Favorites / Recent

Use localStorage only.

- `localStorage.motionAtlasFavorites`
- `localStorage.motionAtlasRecent`

Free version target:

- Favorites: 5–10 items
- Recent: 10–20 items

No server send.

## Initial seed catalog

Minimum public target: 30 motions.
Target after expansion: 40–50 motions.
Future expansion: around 70 motions.

Initial 30 candidates:

1. Fade in
2. Fade out
3. Slide in
4. Slide out
5. Fade up
6. Scale in
7. Scale press
8. Hover lift
9. Button press
10. Pulse
11. Shake
12. Wiggle
13. Skeleton shimmer
14. Spinner
15. Progress fill
16. Dots loading
17. Stagger reveal
18. List cascade
19. Modal fade-scale
20. Bottom sheet slide
21. Drawer slide
22. Backdrop fade
23. Accordion expand
24. Toast slide
25. Success check draw
26. Error shake
27. Focus ring expand
28. Underline slide
29. Typewriter
30. Count up

## Pro policy

Do not implement payment, lock, login, server saving, or Pro detection before the free version is complete.

Future Pro candidates:

- 3+ motion comparison
- saved compare sets
- deeper parameters
- framework snippets
- React / Vue / Tailwind / Framer Motion variants
- prompt bundles
- print view
- export

## SEO

English title:

`Motion Atlas — UI motion dictionary with live demos and AI prompts`

Japanese title:

`Motion Atlas — 動くサンプルで分かるUIモーション辞典`

English description:

`Explore UI motion patterns with live demos, compare similar animations, and copy AI-ready prompts for better web and app interactions.`

Japanese description:

`UIモーションを動くサンプルで確認し、似た動きの違いやAIへの依頼文まで整理できる辞典ツールです。`

Canonical / hreflang must separate root and ja pages.

## Required analytics / ads / donation

- GA4 tag is required in head.
- AdSense script is required in head.
- Cloudflare Analytics is enabled at Cloudflare side; do not add extra HTML code unless the project-wide rule changes.
- `ad-top` is required.
- `ad-bottom` is recommended.
- Floating ads are prohibited.
- OFUSE and Ko-fi should appear together, separated from ads.

## Accessibility

Required:

- keyboard operation
- visible focus
- aria labels for buttons when needed
- semantic compare table
- no color-only distinction
- reduced motion support
- explanatory text for live demos
- avoid intense loops
- pause / replay
- `prefers-reduced-motion`

## Performance

- static-first
- no framework
- minimal JS
- client-side only
- data-driven
- CSS-centered demos
- no canvas dependency
- stop or lighten offscreen demos
- no setInterval abuse
- no always-running requestAnimationFrame loops

## Forbidden

- generic scaffold
- ignoring approved mock
- thin foundation page
- name list only
- text-only dictionary
- static thumbnail only
- fake thumbnail
- non-moving demo
- summary-only detail
- missing not-for section
- missing bad / better request
- broken prompt copy
- root-only quality
- ja-only quality
- mobile detail that merely falls below the list
- 600px fixed layout
- permanent header logo image
- logo duplication inside tool
- excessive cross-tool nav
- external send of user input
- paid version first
- Pro gate before free version completion

## Phase gates

Phase 1: mock promotion

- root / ja follows approved mock
- left filters / center list / right detail
- usage / about / pro exist and are not thin
- styles / app / data base exists
- ad-top exists
- EN/JA links exist
- demo-ready DOM exists

Phase 2: free runtime

- search
- filters
- detail panel
- compare up to 2
- local favorites
- local recent history
- prompt copy
- replay / trigger
- reduced motion
- seed 30+

Phase 3: seed expansion

- 40–50 motions
- no padding-only entries
- major categories covered
- every item has bad / better / demo / compare
- English stands alone
- Japanese is not machine-translation quality

Phase 4: public-ready

- no broken links
- no 404
- OGP / canonical / hreflang
- GA4
- ad slots
- donation
- usage / about / pro complete
- mobile does not break
- demos are not noisy
- usable for English-speaking users

## Final acceptance criteria

Motion Atlas passes only when:

- it is immediately recognizable as a motion dictionary
- every card shows actual motion
- detail explains how to request the motion from AI
- two similar motions can be compared
- reduced motion is respected
- beginner wording search works
- root and ja have no quality gap
- it fits the UI Atlas / Vibe Lexicon series while having its own moving value
- the free version is useful without Pro
