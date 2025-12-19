# TASKS.md — Construction Tools & Slang Atlas (Web MVP)

This file defines the **Codex execution plan** for the project.
Goal: **finish the Web version** (publish-ready) while keeping the codebase **app-migration-ready**.

## Global rules (MUST)
- **1 task = 1 PR**. Do NOT mix multiple tasks into one PR.
- Touch only these paths unless a task explicitly says otherwise:
  - `tools/construction-tools-atlas/**`
  - `docs/**` (only if the task requires docs)
  - root files: `TASKS.md` must NOT be modified by Codex.
- Do NOT rename the tool directory.
- Do NOT introduce server-side requirements. Must work as a static site.
- Keep all “core logic” DOM-free so it can be reused by mobile apps later:
  - put reusable logic in `tools/construction-tools-atlas/src/core/**`
  - UI-only code in `tools/construction-tools-atlas/src/ui/**` (or similar)
- Must pass CI. Add CI in Task 1.

---

# Task 0 (Human) — Data merge & pack setup (NO Codex)
This is handled by the repository owner manually.

**Owner will:**
- Add merged dictionary data as **packs**:
  - `tools/construction-tools-atlas/data/index.json`
  - `tools/construction-tools-atlas/data/packs/pack-001.json` (and more packs later)
- Ensure the data format matches the project spec.

Codex tasks start after Task 0 is done.

---

# Task 1 (Codex) — Foundation: schema + validation + CI
## Objective
Create a robust “rail” so broken data never ships, and establish an app-migration-ready core boundary.

## Deliverables
1) **Core module (DOM-free)**
- `tools/construction-tools-atlas/src/core/schema.ts`
  - Define the data types (Zod recommended). Include:
    - entry id (unique)
    - ja term
    - en term (can be empty if not available, but must be allowed by schema rules)
    - categories/tags (controlled lists if spec defines them)
    - aliases (optional)
    - description/notes (optional)
- `tools/construction-tools-atlas/src/core/load.ts`
  - Load `data/index.json` and all packs from `data/packs/**`
  - Return a single normalized array of entries
  - Normalize strings: trim, unify whitespace
- `tools/construction-tools-atlas/src/core/normalize.ts` (optional)
  - Helper(s) for normalization

2) **Validation script**
- `tools/construction-tools-atlas/scripts/validate-data.mjs` (or `.ts` if build allows)
  - Validates:
    - duplicate ids
    - required fields missing
    - empty strings for required fields
    - invalid tags/categories (if defined)
    - extremely long fields (basic upper bounds)
  - Exit code non-zero on failure
  - Print clear error messages (which pack/file, which id)

3) **GitHub Actions CI**
- `.github/workflows/validate-atlas-data.yml`
  - Runs on PR and push
  - Installs deps if needed, runs the validation script
  - Fails PR on validation errors

4) **Docs**
- `docs/data-packs.md`
  - How to add a new pack
  - How ids are decided
  - What validation checks exist
  - Common failure examples

## Completion criteria (MUST)
- CI runs automatically and fails on intentionally broken sample data.
- With correct data, CI passes.
- `src/core/**` contains **no DOM usage** (`document`, `window`, etc.).

---

# Task 2 (Codex) — Web MVP: browse + detail + search + filter + URL state
## Objective
Ship a working web dictionary experience: users can browse, search, filter, open details, and share URLs.

## Deliverables
1) **UI skeleton**
- Use the project’s existing HTML/CSS skeleton under:
  - `tools/construction-tools-atlas/index.html`
  - `tools/construction-tools-atlas/style.css`
- Implement:
  - Header (title + language toggle placeholder OK)
  - Search box
  - Filter controls (at least 1 axis: category OR tags)
  - Result list
  - Entry detail panel/modal
  - Basic “No results” state

2) **Search**
- Implement search over:
  - ja term
  - en term
  - aliases (if present)
  - optional description/notes
- Matching rules:
  - case-insensitive for English
  - whitespace-normalized for JA/EN
  - partial match is enough for MVP

3) **Filter**
- At least one filter axis:
  - categories OR tags
- Filter and search must combine.

4) **URL state**
- Support:
  - `?q=<query>`
  - `?cat=<category>` or `?tag=<tag>` (depending on your filter axis)
  - `?id=<entryId>` to open a specific entry
- Reloading the page must reproduce the same state.

## Completion criteria (MUST)
- Works fully static (no server).
- On mobile width, UI remains usable.
- Searching + filtering updates results correctly.
- Opening an entry updates URL (or at least is reflected in URL), and direct-link opens the entry.

---

# Task 3 (Codex) — Release quality: bilingual UI + public pages + performance minimum
## Objective
Make the Web version publish-ready: bilingual UI, missing-language handling, public pages, and basic performance.

## Deliverables
1) **Language toggle (JA/EN)**
- Add a toggle in UI.
- UI labels should switch JA/EN.
- Entry display rules:
  - If EN term/desc missing, show a consistent placeholder in EN mode.
  - If JA missing (should not happen), treat as validation error or show fallback.

2) **Public pages**
Add simple static pages (or sections) linked from the UI:
- About
- Method / Data policy (what this dictionary is, what it is not)
- Disclaimer
- Credits / License

Paths can be:
- `tools/construction-tools-atlas/pages/*.html` (recommended)
or
- single-page sections if already SPA-like.

3) **Performance minimum**
- Prevent UI freeze with large data:
  - Build a lightweight in-memory index once at startup, OR
  - Optimize filtering/search loops (avoid repeated heavy work)
- Keep JS minimal (no heavy libraries unless already included).

## Completion criteria (MUST)
- JA/EN toggle works for UI labels and entry display.
- Missing EN fields show a clean, consistent fallback (no broken UI).
- Public pages exist and are reachable from the UI.
- Search does not “lock up” on typical mobile devices.

---

# Task 4 (Codex) — App-ready packaging: core reuse guarantee + migration notes + optional bundle export
## Objective
Finish Web, and ensure the project is ready for future mobile app migration without rewriting core logic.

## Deliverables
1) **Core reuse guarantee**
- Ensure `src/core/**` is DOM-free and reusable.
- Add a small test harness (choose one):
  - `tools/construction-tools-atlas/scripts/core-smoke-test.mjs`
  - OR lightweight unit tests if tooling exists
- The test must:
  - load data (or a small fixture)
  - build the search index
  - run a few sample queries
  - exit non-zero if anything fails

2) **Migration notes**
- `docs/app-migration-notes.md`
  - Data inputs: `data/index.json` + `data/packs/*.json`
  - What `src/core/**` provides (load, normalize, index, search)
  - How UI state maps to URL state (q/cat/tag/id)
  - Suggested mobile architecture (keep it short, practical)

3) **Optional: bundle export script (recommended)**
- `tools/construction-tools-atlas/scripts/build-bundle.mjs`
  - Output a single `dist/dictionary.bundle.json` (or `output/`), containing:
    - normalized entries
    - (optional) precomputed index hints
  - This is for mobile/offline use later.

## Completion criteria (MUST)
- Core smoke-test runs locally and in CI (add to workflow if feasible).
- `docs/app-migration-notes.md` exists and matches actual code structure.
- (If bundle script added) it runs and produces a deterministic output file.

---

## Notes for Codex
- Prefer plain TypeScript/JavaScript without frameworks unless already present.
- Keep functions small, and add comments only where necessary.
- Do NOT change branding or use inappropriate wording in public pages.
