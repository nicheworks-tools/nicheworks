# ExecPlan — Size Converter static search-intent answers

## Scope
- `tools/size-converter/` only, plus this ExecPlan.
- Do not change shared specs, CI, Tiny Audio Meter, deployment, or Amazon configuration.

## Goal
Make common JP/US/EU conversion answers visible in static HTML so a search visitor can get a representative answer before interacting with JavaScript, while preserving chart context and the tool's approximate/non-brand-specific limits.

## Files to touch
- `tools/size-converter/index.html`
- `tools/size-converter/style.css`
- `tools/size-converter/SPEC.md` only if the new static-answer contract needs explicit documentation.

## Implementation
1. Add a compact static "common conversions" section near the direct converter using values already present in the bundled runtime table.
2. Keep men's shoes, women's shoes, men's clothing, and women's clothing explicitly separated; never imply one universal US→JP mapping.
3. Add only examples that can be verified against the current bundled table.
4. Keep the interactive converter as the source for other sizes and preserve the existing Amazon insertion point/config unchanged.
5. Keep bilingual single-page behavior and mobile layout.

## Verification
- Existing Size Converter production-code behavior tests remain green.
- Tool runtime/spec/SEO audits remain green.
- Static examples exactly match the current bundled table.
- Amazon config remains `enabled: false` with empty targets.
- No new external dependency or network request is introduced.
