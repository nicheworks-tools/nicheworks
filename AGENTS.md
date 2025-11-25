# NicheWorks Suite — AGENTS.md
This repository is the **single source of truth** for the NicheWorks suite.
Follow the rules strictly. If unsure, STOP and ask for clarification.

---

## 1. Repository Layout (fixed)

- `nicheworks/`
  - The **mother site / hub** (static).
  - **Do NOT edit** this folder unless explicitly instructed in a dedicated ExecPlan.

- `tools/`
  - **All static tools live here.**
  - Each tool is a small static app (HTML/CSS/JS).
  - These are the **ONLY cross-tool batch targets** by default.

- `apps/`
  - **Non-static / special tools**.
  - Example: Next.js apps to be deployed on Vercel.
  - **Do NOT apply static common spec blindly** here.
  - Changes require a separate ExecPlan per app.

- `common-spec/`
  - NicheWorks common specification.
  - `spec-ja.md` is the canonical spec.
  - `spec-en.md` may exist as a translation.
  - **Never modify spec files unless explicitly asked.**

- `_archive/`
  - Old files / backups.
  - **Never touch.**

---

## 2. Absolute Prohibitions (must-follow)

1. **NO cross-tool navigation.**
   - Do not add any “common nav” across tools.
   - The user explicitly rejects it.

2. **Do NOT rename or move folders/files** unless the ExecPlan explicitly says so.

3. **Do NOT edit folders outside the declared target scope.**
   - For batch tasks, scope defaults to `tools/*` only.

4. **Do NOT fabricate features or data.**
   - If data is missing, report it.

---

## 3. Common Spec Application Rules (tools/ only)

When applying common spec to tools:

- Keep existing tool behavior.
- Update only layout/UX/monetization blocks required by spec:
  - Header / Title area
  - Ad slot placeholder
  - Footer (disclaimer + donation links)
  - Cloudflare Web Analytics snippet
  - EN/JA language toggle if required
- **Do NOT introduce new UI patterns not in spec.**
- **Do NOT add new dependencies** unless needed and approved in ExecPlan.

---

## 4. Language Support (EN/JA)

- Tools should support **JA and EN**.
- Use a simple language switch:
  - Buttons: “日本語 / English”
- Texts should live in a small dictionary in `app.js` when feasible.
- If a tool is already bilingual, preserve its scheme.

---

## 5. Deployment Note (informational)

- `nicheworks/` and `tools/*` → Cloudflare Pages (static)
- `apps/*` → Vercel or other app host
- `apps/wp-structure-analyzer/` is **not a web app**.
  - Provide download/usage page in `nicheworks/` only.

---

End of AGENTS.md
