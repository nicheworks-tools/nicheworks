# Contributing to Construction Tools Atlas Data

This guide covers **data contributions only** for the Construction Tools Atlas tool.

## Add a new entry

1. Open the pack file you want to extend:
   - `tools/construction-tools-atlas/data/packs/pack-001.json`
2. Append a new entry object to the top-level array.
3. Required fields:
   - `id` (string, unique across all packs)
   - `term` object with **at least** `ja` or `en` (either is fine)
4. Optional fields (must be correct type if present):
   - `description` object (e.g., `{ "ja": "...", "en": "..." }`)
   - `categories` (string or array of strings)
   - `tasks` (string or array of strings)

### ID naming rules

- Format: `cta-0001`, `cta-0002`, ...
- IDs must be **unique** across all packs.
- Never reuse retired IDs (keep them permanently reserved).

### Example entry

```json
{
  "id": "cta-0121",
  "term": { "ja": "墨つぼ", "en": "Chalk line" },
  "description": { "ja": "直線の墨を付ける道具。", "en": "Tool for snapping chalk lines." },
  "categories": ["measurement"],
  "tasks": ["framing", "interior"]
}
```

## Add new categories or tasks

1. Edit `tools/construction-tools-atlas/data/index.json`.
2. Update the definitions:
   - `categories` or `tasks` can be an **array** or an **object map**.
3. Each definition must have a stable string ID.

Example (array form):

```json
{
  "id": "finishing",
  "label": { "ja": "仕上げ", "en": "Finishing" }
}
```

## Pack file naming convention

- Pack files live under: `tools/construction-tools-atlas/data/packs/`
- Naming pattern: `pack-XXX.json` (e.g., `pack-001.json`)

## Run validation locally

```bash
node tools/construction-tools-atlas/scripts/validate-data.mjs
```

## Common failures and fixes

- **Duplicate ID**
  - Error: `Entry id is duplicated across packs.`
  - Fix: assign a new, unused `cta-XXXX` ID.

- **Missing term text**
  - Error: `Entry term/title must include ja or en text.`
  - Fix: add `term.ja` or `term.en` with a non-empty string.

- **Unknown category/task**
  - Error: `category id not found in index: ...`
  - Fix: use an existing ID from `data/index.json`, or add it there first.

- **Invalid description type**
  - Error: `Entry description must be an object when present.`
  - Fix: change `description` to an object or remove it.

- **Pack path not found**
  - Error: `Pack file not found for path: ...`
  - Fix: ensure `index.json` references `packs/pack-XXX.json` (or `data/packs/pack-XXX.json`).
