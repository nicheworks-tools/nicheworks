import fs from 'node:fs';

const payload = JSON.parse(fs.readFileSync('tools/phone-quickcheck/data/phones.json','utf8'));
const foldables = payload.phones.filter((p)=>p.formFactor==='foldable');
console.log(`FOLDABLE_COUNT=${foldables.length}`);
for (const p of foldables) {
  const out = {
    id:p.id, manufacturer:p.manufacturer, model:p.model, releaseYear:p.releaseYear,
    market:p.market||null, dimensionsFolded:p.dimensionsFolded||null, dimensionsUnfolded:p.dimensionsUnfolded||null,
    weightG:p.weightG??null, displayInch:p.displayInch??null, waterRating:p.waterRating??null,
    batteryMah:p.charging?.battery?.capacityMah??null, batteryClass:p.charging?.battery?.valueClass??null,
    wiredRecommendedW:p.charging?.wiredRecommendedW??null, wiredMaxW:p.charging?.wiredMaxW??null,
    protocols:p.charging?.protocols||[], pps:p.charging?.pps??null,
    wirelessStandard:p.charging?.wirelessStandard??null, wirelessMaxW:p.charging?.wirelessMaxW??null,
    included:p.included||null, sources:p.sources||null
  };
  console.log('PHONE='+JSON.stringify(out));
}
const gaps = foldables.map(p=>({
  id:p.id,
  gaps:[
    !p.market?.includes('JP')?'JP_MARKET':null,
    !p.dimensionsFolded?'FOLDED_DIM':null,
    !p.dimensionsUnfolded?'UNFOLDED_DIM':null,
    p.weightG==null?'WEIGHT':null,
    p.charging?.battery?.capacityMah==null?'BATTERY':null,
    p.charging?.wiredRecommendedW==null && p.charging?.wiredMaxW==null?'WIRED_W':null,
    !p.sources?.specificationsUrl?'SPEC_SOURCE':null,
    !p.sources?.manualUrl?'MANUAL_SOURCE':null,
    !p.sources?.releaseUrl?'RELEASE_SOURCE':null,
    !p.sources?.chargingUrl?'CHARGING_SOURCE':null,
    p.included?.cable==='unknown'?'CABLE_UNKNOWN':null,
    p.included?.adapter==='unknown'?'ADAPTER_UNKNOWN':null,
    p.waterRating==null?'WATER_UNKNOWN':null
  ].filter(Boolean)
})).filter(x=>x.gaps.length);
console.log('GAPS='+JSON.stringify(gaps));
