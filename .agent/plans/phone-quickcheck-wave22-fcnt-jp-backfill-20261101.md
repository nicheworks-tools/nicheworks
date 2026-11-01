# Phone QuickCheck Wave 22 — FCNT Japan historical catalog backfill (2026-11-01)

## Scope
Extend canonical phone dataset from 219 to 223: FCNT arrows We3 M09 SIM-free (2026), arrows N F-51C (2023), arrows We F-51B (2021), arrows NX9 F-52A (2020). These are four distinct marketed models, not multiple carrier SKUs of the same model. 11 manufacturers and 36 foldables unchanged.

## First-party Japan evidence
- arrows We3 M09: https://www.fcnt.com/spec/m09-sim-free/ / https://www.fcnt.com/news/33202/
- arrows N F-51C: https://www.fcnt.com/spec/f-51c/
- arrows We F-51B: https://www.fcnt.com/spec/f-51b/
- arrows NX9 F-52A: https://www.fcnt.com/spec/f-52a/

## Accurate data policy
Use manufacturer exact model specification for physical dimensions, mass, display diagonal, battery, USB-C, published Power Delivery revision, water/dust and complete in-box enumeration. Official pages list no cable or AC brick for these SKUs, so mark excluded. Do not claim charger W, device W, PPS, Qi or unsupported wireless by omission. Protruding camera max thickness is not confused with plain device thickness. We3 M09 SIM-free and carrier-specific variants are not counted as separate equivalent models.

## Scope files
- tools/phone-quickcheck/data/phones.json, SPEC.md, index.html, COMPLETION_AUDIT.md
- scripts/check-phone-quickcheck-completion.mjs, scripts/check-phone-quickcheck-data.mjs
- .agent/plans/phone-quickcheck-wave22-fcnt-jp-backfill-20261101.md (this plan)

No shared common spec, other tools, billing, affiliate runtime, analytics, UI logic or deployment routing changes. No dependency additions.

## Verification
Required: source semantics, data/completion, responsive, affiliate, behavior, SEO, runtime CI green, then merge; GitHub main recheck 223 / 11 / 36. Next actual public Chrome HTTP and full JSON parity must pass 320/390/414/768/1280, JP/EN, mobile detail and close-button collision tests before reporting production release as verified.
