# ExecPlan — Size Converter wave 4 canonical and regression contract

## Scope
- Size Converter canonical documentation, Size Converter behavior test, a dedicated wave-4 source-contract checker, and the existing Tool runtime contract audit workflow.
- This plan explicitly authorizes editing `.github/workflows/tool-runtime-contract-audit.yml` only to invoke the new checker and watch its path. No new workflow is allowed.
- Do not change Tiny Audio Meter, shared common specs, deployment, or Amazon configuration.

## Goal
Lock PR16–PR18 outcomes so future edits cannot silently remove the static search-intent answers, re-promote the representative table as a universal standard, add an unsupported generic UK mapping, or activate Amazon prematurely.

## Files to touch
- `docs/tools/size-converter.md`
- `tools/size-converter/tests/behavior.test.mjs`
- `scripts/check-size-converter-growth-wave4.mjs` (new)
- `.github/workflows/tool-runtime-contract-audit.yml`
- this ExecPlan

## Contract to enforce
1. Static representative answers remain present and match bundled runtime rows for men/women shoes and clothing examples.
2. `data-basis.md` remains present with current official-source audit URLs and explicit representative/non-universal classification.
3. `uk-evaluation.md` remains present and records the verified no-addition decision plus adidas/ASICS/New Balance disagreement examples.
4. Runtime `DATA` remains JP/US/EU only; no generic `uk` field is silently introduced while UK is verified-deferred.
5. Existing Size Converter production-code behavior tests remain executable and add assertions tying representative example rows to `DATA`.
6. Amazon config remains disabled with empty targets.
7. Canonical 15-section tool spec reflects the current implementation and actual automated test evidence.

## CI change
Add `scripts/check-size-converter-growth-wave4.mjs` to the existing runtime-audit path filters and as one step after the earlier growth-wave checks. Do not create a new workflow or weaken existing checks.

## Verification
- Tool runtime contract audit passes all existing waves, discovered behavior tests, Amazon-ready checks, previous growth-wave checks, the new Size Converter wave-4 check, and read-only verification.
- Tool spec audit, SEO audit, and existing repository data validation pass.
- Amazon remains `enabled: false` with empty targets.
