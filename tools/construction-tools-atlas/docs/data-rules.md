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
````

---

## 3) Category is “Primary” (IMPORTANT)

`category` is the **primary** bucket for navigation and browsing.

* DO NOT put multiple categories into one entry.
* DO NOT make “everything allowed in all categories”.
* If an entry can belong to multiple categories, choose the **most useful primary** for browsing.

### Primary selection rule (simple)

Pick the category that a beginner would search first:

* Tool itself → `hand-tools` / `power-tools` / `machines`
* Measuring / layout → `measurement`
* PPE / safety workflow → `safety`
* Screws/bolts/nails → `fasteners`
* Materials (wood/board/insulation/etc.) → `materials`
* Scaffolds/formwork → `scaffolding`
* Concrete-related materials/tools/process → `concrete`
* Site words / jargon → `slang`

---

## 4) Allowed categories list (TSV)

If you keep TSV drafts, `allowed_categories` is OPTIONAL.

Recommended policy:

* keep it for drafting / QA only
* it MUST NOT override the final `category`
* do NOT set “all categories allowed” unless you have a real reason

---

## 5) Validation

Always run:

```bash
node tools/construction-tools-atlas/scripts/validate-data.mjs
```

This must pass before PR.

---

## 6) IDs

* format: `cta-0001` ...
* never reuse IDs
* if you delete an entry, keep the ID retired

---

## 7) Growth policy (Phase 1)

Phase 1 rule:

* Keep schema minimal.
* No synonyms/tags yet.
* If you need multi-category search later, add `tags` in Phase 2 (NOT now).

