# PLANS.md — ExecPlan Rules for NicheWorks Suite

Large or cross-cutting tasks MUST start with an ExecPlan.
Do not implement until the ExecPlan is written and reviewed.

> NOTE: ExecPlans MUST follow the latest common spec defined in `common-spec/spec-ja.md`
> (including v2 additions such as SEO, JSON-LD, language exceptions, etc.). :contentReference[oaicite:2]{index=2}

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
   - Explicitly reference which part of `spec-ja.md` you are implementing
     (e.g. “Apply SEO v2 (section 9-3) to tools/manual-finder”).

2. **Scope**
   - Explicit list of folders/files to edit.
   - Example:
     - targets: `tools/manual-finder/**`
     - excluded: everything else

3. **Rules / Prohibitions**
   - Restate key prohibitions from AGENTS.md, especially:
     - no common navigation
     - no out-of-scope edits
     - do not modify `common-spec/spec-ja.md` unless explicitly asked
     - follow language rules (JA/EN default, JP-only exceptions)

4. **Change List**
   - Bullet list of concrete edits per file.
   - Include:
     - meta tags / canonical / JSON-LD changes (if any)
     - donation block / ad slots
     - language switch changes or confirmation that language rules are unchanged.

5. **Step-by-step Procedure**
   - Ordered, reproducible steps.

6. **Test Plan**
   - How to verify locally (open pages, check UI, etc.).
   - For multi-language tools, test both JA and EN views.
   - Confirm that:
     - layout is not broken on PC and mobile,
     - ads and donation blocks are in allowed positions only.

7. **Rollback Plan**
   - How to revert if something breaks.

---

## After ExecPlan approval

- Implement **exactly** as planned.
- If any step becomes unclear, stop and propose an updated ExecPlan.
- If, during implementation, you discover that `spec-ja.md` and existing code conflict,
  document the conflict in the ExecPlan and propose a minimal, spec-compliant change.
  Do **not** “fix” the spec itself unless the task explicitly instructs you to.

---

End of PLANS.md
