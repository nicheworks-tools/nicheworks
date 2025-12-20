# Construction Tools Atlas — Data Rules (Minimum)

This document defines the **minimum rules** for `data/index.json` and `data/packs/*.json`.

Goal:
- Keep packs consistent.
- Make category navigation meaningful.
- Avoid “everything fits everything” data.

---

## 1) Files

- `tools/construction-tools-atlas/data/index.json`
  - defines categories, tasks, and packs list

- `tools/construction-tools-atlas/data/packs/pack-XXX.json`
  - **top-level MUST be an array**
  - each element is one entry

---

## 2) Entry schema (pack)

Each entry MUST contain:

- `id` (string, unique in all packs)
- `term.ja` (string, non-empty)
- `term.en` (string, non-empty)
- `category` (string, non-empty, must exist in `index.json` categories)
- `hint` (string, optional but recommended)

Example:

```json
{
  "id": "cta-0001",
  "term": { "ja": "ハンマー", "en": "Hammer" },
  "hint": "General striking tool for driving or breaking.",
  "category": "hand-tools"
}
