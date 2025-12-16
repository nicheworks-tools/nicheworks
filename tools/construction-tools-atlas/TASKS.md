# TASKS.md
Construction Tools & Slang Atlas — Development Tasks (Web MVP)

This file defines **phase-based tasks** for developing the Web MVP.
All automated or assisted coding must follow this order and scope.

Rules in `CODING_RULES.md` always apply.

---

## Phase 0 — Skeleton (COMPLETED)

Status: ✅ Completed

- Create directory structure under `tools/construction-tools-atlas/`
- Add empty placeholder files:
  - `index.html`
  - `style.css`
  - `app.js`
  - `core/engine.js`
  - `data/tools.basic.json`
- Add documentation:
  - `spec.md`
  - `design-spec.md`
  - `CODING_RULES.md`

No further changes are required in this phase.

---

## Phase 1 — Core Dictionary Engine

Goal:
Implement the **portable dictionary search engine** shared by Web and future Mobile apps.

Target file:
- `core/engine.js`

Tasks:
1. Implement pure functions defined in `spec.md`:
   - `searchByText(query, lang)`
   - `filterByCategory(categoryId, lang)`
   - `searchByTask(taskId, lang)`
   - `searchByFuzzy(tokens, lang)`
2. Ensure:
   - No DOM usage
   - No external libraries
   - Input/Output are plain JS objects/arrays
3. Add minimal inline comments explaining logic.

Non-goals:
- No UI logic
- No data fetching
- No schema changes

Deliverable:
- A complete, self-contained `core/engine.js`

---

## Phase 2 — Dictionary Data (Initial Set)

Goal:
Populate the initial dictionary dataset for MVP usage.

Target files:
- `data/tools.basic.json`

Tasks:
1. Populate at least **100 dictionary entries** following `spec.md`.
2. Ensure:
   - Stable `id` values
   - Valid bilingual fields (`ja` / `en`)
   - Categories and tasks are consistent across entries
3. Keep file valid JSON (no comments).

Rules:
- Content generation may be assisted by ChatGPT.
- Automated tools may only **write provided JSON verbatim**.
- Do not invent new schema fields.

Deliverable:
- A valid `tools.basic.json` with ≥100 entries.

---

## Phase 3 — Web UI Implementation

Goal:
Implement the Web MVP UI using the existing structure.

Target files:
- `index.html`
- `style.css`
- `app.js`

Tasks:
1. Implement layout and styling according to `design-spec.md`:
   - Notion-style page header
   - Search block
   - Category chips
   - Results list (cards)
2. Implement `app.js`:
   - Load JSON data via `fetch`
   - Call functions from `core/engine.js`
   - Render results to DOM
3. Add language toggle (JA / EN).
4. Ensure responsive layout down to 360px width.

Non-goals:
- No animations beyond minimal hover/focus states
- No advanced search (silhouette, guided flow) in MVP

Deliverable:
- Fully functional Web MVP with local search.

---

## Phase 4 — Integration & Validation

Goal:
Stabilize MVP for public release.

Tasks:
1. Verify:
   - No console errors
   - Search works with large datasets
   - Category filters behave correctly
2. Test responsive layout at:
   - 360px (mobile)
   - 768px (tablet)
   - Desktop widths
3. Perform minimal refactoring for clarity (no redesign).

Deliverable:
- Stable Web MVP ready for public deployment.

---

## Phase 5 — Mobile Preparation (OUT OF SCOPE FOR THIS REPO)

Note:
Mobile app implementation is **not performed in this repository**.

This phase only requires:
- Keeping `core/engine.js` DOM-free
- Keeping JSON data portable
- Avoiding Web-specific coupling in core logic

Actual mobile development will occur in a separate repository.

---

## Execution Rules

- Phases must be completed **in order**.
- Do not skip phases.
- Do not mix tasks from different phases.
- If a task is unclear, stop and report instead of guessing.

---
