# CODING_RULES.md
Construction Tools & Slang Atlas — Coding Rules (Web MVP)

This file defines **strict rules** for any automated or assisted coding (e.g., Codex/agents) on this tool.
The goal is to prevent accidental changes outside the intended scope and keep the project portable to a future offline mobile app.

---

## 1) Source of truth

- **spec.md** is the single source of truth for requirements and architecture.
- **design-spec.md** is the source of truth for Web UI styling/layout.
- If instructions conflict, follow **spec.md**, then **design-spec.md**.

---

## 2) Allowed / forbidden files

### Allowed (may create/update)
Only the following files and folders may be edited during Web MVP development:

- `index.html`
- `style.css`
- `app.js`
- `core/engine.js`
- `data/*.json`
- `assets/icons/*` (only when explicitly requested; otherwise, do not modify)

### Forbidden (do not edit)
- `spec.md`
- `design-spec.md`
- `CODING_RULES.md` (this file)
- Any files outside `tools/construction-tools-atlas/`

### Forbidden actions
- Do not delete or rename directories/files.
- Do not move files between folders.
- Do not introduce new build systems (bundlers, frameworks).

---

## 3) Architectural rules (non-negotiable)

### Core engine must be portable
`core/engine.js` must be:

- **DOM-free** (no `document`, no `window` assumptions)
- **Dependency-free** (no external libraries)
- Pure functions where possible
- Input: arrays of entries loaded from JSON
- Output: arrays of entries (plain objects)

### UI layer must be thin
`app.js` is responsible for:

- Loading JSON data (fetch)
- Calling `core/engine.js`
- Rendering the UI in the DOM

Do **not** implement search logic inside `app.js` beyond simple wiring.

---

## 4) Runtime constraints (Web MVP)

- Plain HTML/CSS/JS only (no React/Vue/Next/etc.)
- No CDN libraries for JS/CSS frameworks
- System fonts only (no external font services)
- Offline-friendly behavior is preferred (after initial load), but no service worker is required in MVP.

---

## 5) Data rules

- JSON schema must follow `spec.md`.
- Automated tools must **not invent** fields that are not in the schema.
- If data changes are needed, do it by **adding new entries** or **fixing schema compliance**—do not restructure the schema without updating `spec.md` (but `spec.md` is forbidden to edit).

---

## 6) Output format rules (for automation)

When an automated tool proposes changes:

- Provide **complete file contents** for every file changed (not partial diffs).
- List changed files explicitly at the top (paths).
- Do not change files that were not requested.

---

## 7) Testing guidance (minimum)

Any change should preserve:

- No JS console errors on page load
- 360px width layout does not break
- Search and category filter remain responsive with 100+ entries

---

## 8) If something is unclear

- Stop and report what is unclear.
- Do not guess and modify unrelated files.
- Prefer the smallest possible change to achieve the request.

---
