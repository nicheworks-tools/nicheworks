# ExecPlan — Task 03 / UI Atlas free version seed dataset

## Scope
- Target directory: `tools/ui-atlas/data`
- In-scope files:
  - `tools/ui-atlas/data/patterns.free.v1.json` (new)
  - `tools/ui-atlas/data/README.json` (update)
- Out of scope: any other `tools/ui-atlas/*` files, other tools, specs, deployment/CI.

## Goals
- Add the first production-usable free seed dataset.
- Include 40–60 high-value patterns.
- Keep English as source of truth and provide localized Japanese text.
- Include meaningful `similar_patterns` links for compare UX.
- Use novice-friendly wording in summaries and usage guidance.
- Keep stable slugs.

## Steps
1. Inspect existing data conventions in `tools/ui-atlas/data` and related docs.
2. Author a new JSON dataset with required minimum fields for each pattern:
   - `id`, `slug`, `name_en`, `name_ja`, `aliases_en`, `aliases_ja`, `category`,
     `summary_short_en`, `summary_short_ja`, `best_for_en`, `best_for_ja`,
     `not_for_en`, `not_for_ja`, `similar_patterns`, `short_prompt_en`, `short_prompt_ja`,
     `short_impl_note_en`, `short_impl_note_ja`.
3. Ensure inclusion of all priority patterns and overall count between 40 and 60.
4. Update `README.json` to reflect dataset readiness and pointer metadata.
5. Validate JSON format with CLI tooling.
6. Commit and prepare PR message.

## Manual verification for user
- Open `tools/ui-atlas/data/patterns.free.v1.json` and verify:
  - Count is 40–60 items.
  - Priority pattern slugs exist.
  - English and Japanese fields are both present and coherent.
  - `similar_patterns` contains relevant links for compare behavior.
- Confirm `tools/ui-atlas/data/README.json` status is no longer scaffold-only.
