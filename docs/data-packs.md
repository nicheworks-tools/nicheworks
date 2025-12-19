# Construction Tools & Slang Atlas — Data Packs

This document explains how to extend the atlas data while keeping CI and the validation script happy.

## Adding a new pack file
1. Create a new JSON file under `tools/construction-tools-atlas/data/packs/` (e.g., `pack-002.json`).
2. The file must export an array of entries. Follow the field rules below.
3. Update `tools/construction-tools-atlas/data/index.json`:
   - Add a new entry to `packs` with a unique `id` and the `file` path relative to the `data/` directory (for example, `"packs/pack-002.json"`).
   - Set `count` to the number of entries in the pack. Keep it accurate so downstream tooling can sanity-check updates.
4. Run the validation script locally before committing:
   ```bash
   node tools/construction-tools-atlas/scripts/validate-data.mjs
   ```

## Entry requirements and IDs
- `id`: required, non-empty, unique across **all packs**. Choose stable, human-readable IDs (e.g., `tool-0101`). Avoid reusing IDs for different terms.
- `term.ja`: required, non-empty string.
- `term.en`: string (can be empty or missing if no translation is available).
- `category`: required, non-empty string.
- `tags`: optional array of strings (empty array is fine). Keep tag strings meaningful and short.
- `aliases`: optional object with `ja` and `en` string arrays. If omitted, they default to empty arrays during normalization.
- `description`: optional object with `ja`/`en` strings. If `description.ja` exists but `description.en` is missing, a warning is produced.

## What the validation checks
The `validate-data.mjs` script performs these checks:
- Duplicate IDs across all packs (fails CI).
- Required fields present and non-empty: `id`, `term.ja`, `category` (fails CI).
- Type checks for strings, tags arrays, aliases arrays (fails CI on type mismatch).
- Length guards (fail if exceeded):
  - IDs: 120 characters
  - Terms: 200 characters
  - Aliases: 200 characters
  - Descriptions: 2000 characters
- Warnings (do not fail CI):
  - Empty or missing `term.en`
  - `description.ja` present while `description.en` is missing

## Common failure examples
- Leaving `id` blank or duplicating an existing `id` across packs (fails).
- Providing `tags` as a string instead of an array (fails).
- Supplying `description.ja` without an English counterpart (warns but passes).
- Extra whitespace (tabs, multiple spaces) — strings are normalized, but empty values still fail.

Keep changes minimal and rerun the validator after every data edit to catch issues early.
