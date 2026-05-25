# UI Atlas Pattern Data Schema v0.1

This document defines the canonical data shape for UI Atlas pattern records.

UI Atlas currently uses a layered implementation:

- `app.js` for the original interactive catalog
- `extended-catalog-final.js` for extended cases
- `display-guard.js` for display limiting and category navigation
- `pro-link-bridge.js` for detail/compare to Pro handoff
- `quality-notes.js` for accessibility/mobile/review notes

The target v1 data model is to consolidate all 100 UI examples into a single source of truth.

```txt
/tools/ui-atlas/data/patterns.js
```

## Required fields

Each pattern record must include the following fields.

```js
{
  id: string,
  slug: string,
  status: 'active' | 'draft' | 'deprecated',
  tier: 'free' | 'pro-preview' | 'pro',

  name_en: string,
  name_ja: string,
  aliases_en: string[],
  aliases_ja: string[],

  category: string,
  subcategory: string,
  purpose: string[],

  summary_en: string,
  summary_ja: string,
  beginner_wording_en: string,
  beginner_wording_ja: string,

  best_for_en: string,
  best_for_ja: string,
  not_for_en: string,
  not_for_ja: string,

  similar_patterns: string[],
  compare_notes_en: string,
  compare_notes_ja: string,

  short_ai_prompt_en: string,
  short_ai_prompt_ja: string,
  handoff_prompt_en: string,
  handoff_prompt_ja: string,

  implementation_note_en: string,
  implementation_note_ja: string,
  accessibility_note_en: string,
  accessibility_note_ja: string,
  mobile_note_en: string,
  mobile_note_ja: string,

  mobile_fit: 'high' | 'medium' | 'low',
  difficulty: 'easy' | 'medium' | 'hard',
  content_density: 'low' | 'medium' | 'high',
  risk_level: 'low' | 'medium' | 'high',

  sample_type: string,
  sample_config: object,

  pro_memo_template_en: string,
  pro_memo_template_ja: string,

  related_tools: string[],
  tags: string[]
}
```

## Field rules

### `id`

Stable internal identifier.

- lowercase
- kebab-case
- never change after release

Example:

```txt
confirmation-dialog
```

### `slug`

URL/search-friendly slug. Usually same as `id`.

### `status`

- `active`: visible in catalog
- `draft`: kept in data, hidden from normal display
- `deprecated`: not recommended, retained for historical/reference use

### `tier`

- `free`: visible in the public catalog
- `pro-preview`: visible as a preview, Pro output encouraged
- `pro`: hidden or gated after common Pro infrastructure exists

Current v1 should keep all catalog records as `free` or `pro-preview` until common Pro gating is implemented.

### `category`

Use one of the canonical categories below.

```txt
core-ui
navigation
forms-input
feedback-status
disclosure-detail
data-display
dashboard-analytics
search-discovery
onboarding
mobile-ui
account-billing
admin-settings
ai-interaction
collaboration
error-recovery
security-compliance
```

### `purpose`

Array of high-level use purposes.

Recommended values:

```txt
confirmation
quick-action
content-discovery
mode-switch
onboarding
conversion
input-validation
status-feedback
comparison
handoff
review-before-apply
```

### `similar_patterns`

Array of `id` values, not display names.

Every active pattern should have at least 1 and preferably 2–4 similar patterns.

### `sample_type`

Renderer key used by the UI.

Examples:

```txt
modal
inline-message
toast
drawer
tabs
accordion
card-grid
data-table
kpi-row
ai-suggestion
approval-gate
```

Unknown `sample_type` must fall back to a safe static card renderer.

## Minimum quality bar

A pattern is not release-ready unless it has:

- English and Japanese name
- English and Japanese summary
- best-for and not-for guidance
- at least one similar pattern
- short AI prompt
- handoff prompt
- implementation note
- accessibility note
- mobile note
- mobile_fit
- difficulty
- sample_type

## v1 migration target

The v1 migration should produce:

```txt
100 active records
0 duplicate slugs
0 missing required fields
0 English-only records
0 Japanese-only records
```

## Common Pro compatibility

Each record must be usable by the common Pro handoff flow.

Required Pro-related fields:

```txt
handoff_prompt_en
handoff_prompt_ja
pro_memo_template_en
pro_memo_template_ja
risk_level
similar_patterns
```

The Pro generator should be able to receive a selected pattern by URL parameter.

```txt
/tools/ui-atlas/pro/?pattern=confirmation-dialog
```

Or compare multiple patterns.

```txt
/tools/ui-atlas/pro/?compare=confirmation-dialog,toast
```

## Do not do

- Do not store HTML in record text fields.
- Do not allow record text to be written with `innerHTML`.
- Do not mix English and Japanese in the same field.
- Do not add records without `not_for` guidance.
- Do not add Pro-only records until common Pro gating is implemented.
- Do not increase record count before the existing 100 records meet the minimum quality bar.
