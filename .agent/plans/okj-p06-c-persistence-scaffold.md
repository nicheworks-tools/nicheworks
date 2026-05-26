# ExecPlan: OKJ-P06-C gated local persistence scaffold

## Scope
- Implement disabled-safe local persistence scaffolding for Old Kanji OCR history/collection.
- Keep Pro entitlement inactive; deny persistence unless explicit active gate is passed by caller.
- No OCR UI unlocking or Stripe/server integration.

## Files to touch
- `.agent/plans/okj-p06-c-persistence-scaffold.md`
- `assets/okj-history-collection.js`
- `docs/old-kanji-toolkit/ocr-history-collection-data-model.md`
- `docs/old-kanji-toolkit/ocr-history-collection-locked-ui.md`
- `docs/old-kanji-toolkit/ocr-history-collection-persistence-scaffold.md` (new)

## Steps
1. Inspect existing helper module and docs for P06-A/P06-B contracts.
2. Add persistence scaffold helpers with strict gate checks and safe localStorage boundaries.
3. Add P06-C persistence contract document with keys, constraints, and handoff.
4. Update existing P06-A/P06-B docs with references to P06-C scaffold.
5. Run targeted static checks (search for forbidden unlock patterns / active true introduction).
6. Commit and prepare PR message.

## Manual verification for user
1. Open OCR tool and confirm locked UI remains unchanged (no new enabled save/list/clear controls).
2. In browser console, call `OldKanjiHistoryCollection.saveHistoryRecord({}, { active: false })` and confirm `{ ok:false, error:'pro_required' }`.
3. Confirm no auto-created localStorage entries on page load.
4. (Optional) With explicit test gate `{active:true}`, call save/list/clear APIs and verify only `okj.scanHistory.v1` and `okj.oldKanjiCollection.v1` keys are touched.
