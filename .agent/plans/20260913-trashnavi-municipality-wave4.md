# TrashNavi municipality expansion — Wave 4

## Goal

Promote the final 2-type municipality candidate to preferred readiness without weakening the existing municipality-page publication gate.

## Target

- 東京都 中央区 (`lgcode: 131024`)
- Existing verified waste-specific types before this wave:
  - `waste_sorting`
  - `bulky_waste`
- Verified third type added in this wave:
  - `collection_calendar`

Official source:

- https://www.city.chuo.lg.jp/a0039/kurashi/gomi/calendar/syuusyuuyoubi.html

Checked: 2026-09-13.

## Safety contract

- Use only a Chuo City official source.
- Do not infer item-level sorting rules, fees, or collection dates into NicheWorks data.
- Preserve the 3-distinct-waste-type publication threshold.
- This enrichment wave does not publish a municipality page by itself; publication remains a separate manifest/generator change.
- Load the new dataset in the TrashNavi runtime so repository coverage and live search remain aligned.

## Expected coverage movement

- Any waste-specific direct link municipalities: unchanged at 77.
- 2+ distinct waste types: unchanged at 11.
- 3+ distinct waste types: 10 -> 11.
- Collection-calendar coverage: 10 -> 11 municipalities.

## Validation

- `node tools/trashnavi/scripts/audit-coverage.mjs --strict`
- `node scripts/check-trashnavi-direct-links.mjs --inventory`
- existing TrashNavi coverage CI
