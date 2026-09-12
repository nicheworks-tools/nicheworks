# ExecPlan: canonical tool specifications and audit baseline

1. **Goal**
   - Inventory every tool registered in `tools/tools-index.json` and establish a machine-auditable, per-tool contract before any repair wave.
   - Apply the current `common-spec/spec-ja.md`, including the v2 additions in section 9, as the suite-wide requirement baseline without changing that specification.

2. **Scope**
   - Targets: `.agent/plans/tool-specification-audit-phase-1.md`, `docs/tools/**`, `audits/tool-quality-matrix.json`, `audits/tool-quality-matrix.md`, `scripts/check-tool-spec-coverage.mjs`, and `scripts/check-tool-quality-contract.mjs`.
   - Read-only evidence: `common-spec/spec-ja.md`, `tools/tools-index.json`, and registered tool files under `tools/*`.
   - Excluded: production tool implementation changes, `_archive/**`, `apps/**`, `assets/**`, common specification edits, deployment/CI, and all unrelated files.

3. **Rules / Prohibitions**
   - Do not add common navigation, redesign tools, standardize layout widths, alter language support, or repair discovered production defects.
   - Do not modify `common-spec/spec-ja.md`, registered tool code, tracking IDs, advertising code, donation blocks, or repository architecture.
   - Infer contracts only from repository evidence and label unresolved intent `NEEDS_DECISION`.
   - Preserve explicit Japanese-only exceptions and classify layouts from actual workflows rather than applying a universal width.

4. **Change List**
   - Add `docs/tools/README.md` defining the canonical schema and one `docs/tools/<slug>.md` for every registered tool.
   - Add synchronized JSON and Markdown quality matrices with one record per registered tool, observed compliance, evidence, issues, and final state.
   - Add lightweight Node checkers for registry/spec/matrix bijection, required sections, enums, record uniqueness, and count agreement.
   - Do not change SEO metadata, JSON-LD, donation/ad placements, language switches, or production behavior; record their observed state only.

5. **Step-by-step Procedure**
   1. Read the common specification and registry; verify registry integrity and count.
   2. Inspect each registered directory and its HTML, scripts, styles, help pages, READMEs/specs, and tests using deterministic repository-native analysis.
   3. Generate an evidence-backed inventory and individual specifications, retaining explicit uncertainty markers.
   4. Generate matching JSON and human-readable Markdown matrices.
   5. Implement and run independent coverage and quality-contract checkers.
   6. Run applicable existing repository checks and summarize counts/issues plus a ranked Wave 1 recommendation.

6. **Test Plan**
   - Run both new Node checkers and the existing tool specification/common contract checks that apply without production changes.
   - Parse JSON and verify all counts, unique slugs, allowed enums, required spec headings, and bidirectional registry coverage.
   - Spot-check generated contracts against representative mobile, wide, bilingual, Japanese-only, local-processing, network-dependent, and reference tools.
   - No UI screenshot is required because this phase intentionally makes no runnable web application changes.

7. **Rollback Plan**
   - Revert the phase commit, which removes only the new documentation, audit artifacts, checker scripts, and this plan; production tool behavior remains untouched.
