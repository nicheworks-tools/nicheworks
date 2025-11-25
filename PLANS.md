# PLANS.md — ExecPlan Rules for NicheWorks Suite

Large or cross-cutting tasks MUST start with an ExecPlan.
Do not implement until the ExecPlan is written and reviewed.

---

## When ExecPlan is required

- Any change affecting **more than one tool**
- Any update to **common spec across tools**
- Any refactor / folder-wide edits
- Any work touching `apps/*`
- Any work touching `nicheworks/` (mother site)

---

## ExecPlan Format (fixed)

Use this markdown structure:

1. **Goal**
   - What will be achieved.

2. **Scope**
   - Explicit list of folders/files to edit.
   - Example:
     - targets: `tools/manual-finder/**`
     - excluded: everything else

3. **Rules / Prohibitions**
   - Restate key prohibitions from AGENTS.md, especially:
     - no common navigation
     - no out-of-scope edits

4. **Change List**
   - Bullet list of concrete edits per file.

5. **Step-by-step Procedure**
   - Ordered, reproducible steps.

6. **Test Plan**
   - How to verify locally (open pages, check UI, etc.)

7. **Rollback Plan**
   - How to revert if something breaks.

---

## After ExecPlan approval

- Implement **exactly** as planned.
- If any step becomes unclear, stop and propose an updated ExecPlan.

---

End of PLANS.md
