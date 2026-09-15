import fs from 'node:fs';

const payload = JSON.parse(fs.readFileSync('tools/phone-quickcheck/data/phones.json','utf8'));
const foldables = payload.phones.filter((p)=>p.formFactor==='foldable');
console.log(`FOLDABLE_COUNT=${foldables.length}`);
const gaps = foldables.map((p)=>({
  id:p.id,
  manufacturer:p.manufacturer,
  model:p.model,
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
  ].filter(Boolean),
  wiredRecommendedW:p.charging?.wiredRecommendedW??null,
  wiredMaxW:p.charging?.wiredMaxW??null,
  protocols:p.charging?.protocols||[],
  pps:p.charging?.pps??null,
  included:p.included||null,
  waterRating:p.waterRating??null,
  sources:p.sources||null
})).filter((x)=>x.gaps.length);
console.log('GAPS='+JSON.stringify(gaps));
