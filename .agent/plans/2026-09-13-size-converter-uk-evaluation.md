# ExecPlan — Size Converter UK support evaluation

## Scope
- `tools/size-converter/` only, plus this ExecPlan.
- Research current official footwear/apparel size guides for whether a generic UK column can be added defensibly.
- Do not change shared specs, CI, Tiny Audio Meter, deployment, or Amazon configuration.

## Goal
Decide whether UK can be added to the generic Size Converter without implying a universal mapping that official sources do not support. Add UK runtime data only if multiple official sources support a defensible generic row model.

## Files to touch
- `tools/size-converter/uk-evaluation.md` (new)
- `tools/size-converter/SPEC.md`
- `tools/size-converter/index.html` only to make the support boundary clear to users.
- Runtime tables only if the evidence supports a generic UK mapping.

## Evidence rule
- Compare at least two current official manufacturer size guides.
- Check the same US sizes across UK/EU/CM or JP fields, not just one isolated row.
- Brand disagreement is evidence against a generic universal UK mapping, not a reason to average the values.
- Do not infer UK by a constant US offset.

## Verification
- Existing Size Converter runtime and behavior tests remain green.
- If UK is deferred, JP/US/EU runtime data remains unchanged and UI explicitly says why UK is not generically supported.
- If UK is added, every retained row has documented multi-source support.
- Amazon remains `enabled: false` with empty targets.
