# NicheWorks Suite — AGENTS.md

This repository is the **single source of truth** for the NicheWorks suite.  
Follow the rules strictly. If unsure, STOP and ask for clarification.

---

## 1. Repository Layout (fixed, MUST NOT change)

The repo `nicheworks-tools/nicheworks` is a monorepo with the following roles:

- Root (`/`)
  - Mother ship pages (e.g. `index.html`, `/en/`).
  - Cloudflare Pages uses this as the static root.

- `tools/`
  - **All static tools live here.**
  - Each tool is a small static app (HTML/CSS/JS).
  - Example folders: `manual-finder/`, `trashnavi/`, `log-formatter/`, `rename-wizard/`, `contract-cleaner/`.
  - These are the **default cross-tool batch targets**.

- `apps/`
  - **Non-static / special tools**.
  - Example: `apps/wp-structure-analyzer/` (CLI / local tool, not a web app).
  - **Do NOT apply the static common spec blindly** here.
  - Changes require a separate ExecPlan per app.

- `assets/`
  - Shared images: logos, favicons, OGP images, etc.
  - Example files:
    - `assets/nicheworks-logo.png`
    - `assets/favicon.ico`
    - `assets/nicheworks-favicon-white.ico`
    - `assets/ogp.png`
  - **Tools must reference these via absolute paths (`/assets/...`) and MUST NOT keep their own copies.**

- `common-spec/`
  - NicheWorks common specifications.
  - `spec-ja.md` is the canonical spec (Japanese).
  - `spec-en.md` may exist as a translation.
  - **Never modify spec files unless explicitly asked.**

- `nicheworks/`
  - Legacy / extra pages for the mother site.
  - Do not touch unless explicitly instructed.

- `_archive/`
  - Old files / backups / ZIPs.
  - **Never touch.**

---

## 2. Absolute Prohibitions (must-follow)

1. **NO cross-tool navigation.**
   - Do not add any “common nav” across tools.
   - The user explicitly rejects it.
   - A single “Home (nicheworks.pages.dev)” link is allowed *per tool* if requested.

2. **Do NOT rename or move folders/files** unless the ExecPlan explicitly says so.

3. **Do NOT edit folders outside the declared target scope.**
   - For batch tasks, scope defaults to `tools/*` only, unless otherwise specified.

4. **Do NOT fabricate features or data.**
   - If data is missing, report it instead of inventing values.

5. **Do NOT introduce new external dependencies** (frameworks, packages) without explicit approval in the ExecPlan.

---

## 3. Common Spec Application Rules (tools/ only)

When applying the NicheWorks common spec to tools under `tools/`:

- Keep existing tool behavior and logic.
- Update only layout/UX/monetization blocks required by the spec:
  - Header / title area
  - Ad slot placeholders
  - Footer (disclaimer + donation links)
  - Cloudflare Web Analytics snippet
  - EN/JA language toggle if required
- **Do NOT introduce new UI patterns that are not in the spec.**
- **Do NOT duplicate logo/favicon assets inside each tool.**
  - Use absolute asset paths: `/assets/...`.
- **Do NOT add NicheWorks logo to tool headers or titles unless explicitly requested.**
  - Mother ship may show the logo; tools are text-only by default.

---

## 4. Language Support (EN/JA)

- Tools should support **JA and EN**.
- Preferred scheme: simple language switch within the same HTML.
  - Buttons: “JP / EN” or “日本語 / English”.
  - Implementation should follow `spec-ja.md` examples (data-i18n attributes, etc.).
- If a tool is already bilingual with its own scheme, preserve that scheme unless told otherwise.

---

## 5. Deployment Note (informational)

- `root + tools/* + assets/*` → Cloudflare Pages (static hosting).
- `apps/*` → Vercel or other app host (if/when needed).
- `apps/wp-structure-analyzer/`:
  - **Not a web app.**
  - Keep it as a CLI/local tool.
  - Provide a download/usage page on the mother site if requested.
- Codex MUST NOT modify deployment settings or CI unless an ExecPlan explicitly instructs so.

---

## 6. ExecPlan Expectations

For any non-trivial work (cross-tool changes, refactors, etc.):

- First, create an ExecPlan under `.agent/plans/...` describing:
  - Scope (`tools/manual-finder` only, or `tools/*`, etc.)
  - Files to touch
  - High-level steps (inspect → refactor → test)
  - Manual verification steps for the user
- Then execute according to that plan.
- Respect the scope strictly; **never** “helpfully” edit unrelated areas.

---

End of AGENTS.md
