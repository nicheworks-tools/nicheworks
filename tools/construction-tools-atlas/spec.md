# Construction Tools & Slang Atlas — Unified Specification (v3 / 2025)

## 世界の建設・現場用語辞典 — 道具・工具・作業名・専門用語アトラス  
### Web版およびオフライン携帯アプリ版の共通仕様書

---

## 0. Purpose

Construction Tools & Slang Atlas is a bilingual (Japanese/English) dictionary/atlas for construction tools, actions, technical terms, and regional variants used on worksites.  
This document is the single source of truth for both:

- Phase 1: Web (browser) edition as a NicheWorks tool
- Phase 2: Offline-first mobile app edition (iOS/Android)

Goals of this specification:

- Keep **data structure** and **search logic** portable across Web and Mobile
- Provide an implementable blueprint (folders, engine API, UI model, roadmap)
- Avoid external runtime dependencies; operate primarily on local JSON data

---

## 1. Product Overview

Key characteristics:

- Bilingual UI + bilingual dictionary entries (JA/EN)
- Fast local search (text + category; expandable to task/silhouette later)
- Offline-friendly: local JSON as the primary data source
- Expandable taxonomy (categories, tasks, fuzzy tokens, region tags)

---

## 2. Target Users

- Newcomers to construction sites / trainees
- International workers needing bilingual terminology
- DIY users
- Educators / safety training staff
- International project participants

---

## 3. Feature Set

### 3.1 Core Features (Web & Mobile)

- Browse and search entries: tools, actions, terms, colloquial variants
- Language toggle: JA/EN (UI and entry display)
- Text search (supports JA/EN input)
- Category filtering
- Card-style results list
- Local-only processing (no required external API calls)

### 3.2 Web MVP Features

- Single-page UI (header + search + categories + results)
- Responsive layout down to 360px width

### 3.3 Planned Extensions

- Silhouette search (icon grid)
- Task-based filtering (purpose/action)
- Guided navigation (step-by-step refinement)
- Region-specific variants
- Similar-items suggestions

---

## 4. Data Model (JSON)

All dictionary data lives in `/data/*.json` and is shared by Web and Mobile.

### 4.1 Entry Schema

```jsonc
{
  "id": "circular_saw",
  "type": "tool",
  "term": { "ja": "丸ノコ", "en": "Circular Saw" },
  "aliases": { "ja": ["丸鋸", "電動丸ノコ"], "en": ["Skilsaw"] },
  "description": {
    "ja": "木材を高速回転の刃で切断する電動工具。",
    "en": "A power tool that cuts wood using a fast-rotating blade."
  },
  "categories": ["cutting", "wood", "power_tool"],
  "tasks": ["cut_wood"],
  "fuzzy": ["切る", "丸い刃", "回転"],
  "region": ["global"],
  "image": "icons/circular_saw.svg"
}
```

### 4.2 Constraints

- Stable `id`: lowercase + underscores
- Portable primitives/arrays only (keep nesting shallow)
- Multi-language contained to `term` and `description`
- `image` is a relative path under `assets/icons`

---

## 5. Core Engine (Portable)

The shared dictionary engine is implemented as `/core/engine.js`.

### 5.1 Rules

- No DOM dependencies
- No external libraries
- Input: arrays of entries from JSON
- Output: arrays of entries

### 5.2 Public API

- `searchByText(query, lang)`
- `filterByCategory(categoryId, lang)`
- `searchByTask(taskId, lang)`
- `searchByFuzzy(tokens, lang)`

### 5.3 Matching

- Partial match via `includes`
- Case-insensitive for English
- Search targets: `term[lang]`, `aliases[lang]`, and `fuzzy`

---

## 6. Web UI Model

Web implementation uses:

- `/index.html`
- `/style.css`
- `/app.js`

UI sections:

1. Header: title, short description, language toggle
2. Search block: text input + example hint
3. Category chips: selectable filters
4. Results list: cards showing JA/EN title, description (active language), tags, optional icon

Responsive requirements:

- Minimum width: 360px
- Single-column layout
- Category chips wrap

---

## 7. Mobile App Model (Offline-first)

Phase 2 targets an offline-first mobile app.

Preferred stack:

- React Native (reuses JS/TS engine most directly)

Requirements:

- Bundle JSON data within the app
- Load JSON at launch; all searches are local
- Network is optional (future dictionary updates)

---

## 8. Repository Layout

When hosted under NicheWorks `tools/`, keep the tool folder self-contained and portable:

```
tools/construction-tools-atlas/
  index.html
  style.css
  app.js
  core/engine.js
  data/tools.basic.json
  assets/icons/
  spec.md
  design-spec.md
```

---

## 9. Development Constraints

- No framework requirement (plain HTML/CSS/JS)
- No external JS/CSS libraries via CDN
- System fonts only
- Keep engine portable and UI thin

---

## 10. Roadmap

- Phase 0: Create skeleton structure and placeholder files
- Phase 1: Implement `core/engine.js`
- Phase 2: Populate `data/tools.basic.json` (>= 100 entries) + additional datasets
- Phase 3: Implement Web UI (search + categories + cards + i18n toggle)
- Phase 4: Integration testing (desktop + 360px mobile)
- Phase 5: Mobile app implementation (offline-first) using the same data/engine

---

## 11. Licensing & Content

- Choose an appropriate open-source license for code (e.g., MIT)
- Ensure dictionary content is authored or licensed appropriately for redistribution

---
