# ExecPlan: OKJ-P05-B runtime wiring (disabled entitlement)

## Scope
- Only the following tool directories under `tools/`:
  - `old-kanji-ocr-scanner`
  - `old-kanji-reference`
  - `name-old-kanji-checker`
  - `place-old-kanji-checker`
  - `old-document-kanji-highlighter`
  - `unicode-kanji-checker`
  - `variant-kanji-compare`
- Billing documentation update:
  - `docs/billing/okj-pro-panel-runtime-wiring.md`

## Files to touch
- Target tool `index.html` files (add shared adapter script include)
- Target tool `app.js` files (safe runtime state sync; non-authoritative attributes only)
- `docs/billing/okj-pro-panel-runtime-wiring.md` (new)

## Steps
1. Inspect each target tool HTML/JS to locate existing Pro panel and script loading structure.
2. Add `<script src="/assets/nw-pro-entitlement.js"></script>` near existing app script area without disrupting unrelated scripts.
3. Add minimal runtime sync logic in each tool JS:
   - read `data-okj-feature-id`
   - safely call adapter if present
   - set runtime attrs `data-okj-runtime-pro-state` and `data-okj-runtime-pro-active`
   - keep locked behavior unchanged.
4. Add billing doc describing scope, behavior, lock rationale, and future swap path.
5. Run validation checks (search-based) to confirm adapter includes and locked-state invariants.

## Manual verification steps
- Open each target tool page and inspect a Pro panel element.
- Confirm panel still displays locked state and any disabled CTA remains disabled.
- Confirm runtime attrs are present and show `billing-unavailable` + `false`.
- Confirm no checkout flow, Stripe call, localStorage unlock, or URL-param unlock was added.
