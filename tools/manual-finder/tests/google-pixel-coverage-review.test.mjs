import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateCoveragePass} from '../scripts/coverage-pass-lib.mjs';
import {extractReleased,extractOfficialSupportIndex,reconcileSources,inspectDocument,reviewAll} from '../scripts/google-pixel-coverage-review.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/google/pixel-phone-jp-2016-2026.json',import.meta.url),'utf8'));
const validate=validateCoveragePass(pass);
assert.equal(validate.valid,true,validate.errors.join('; '));
assert.equal(pass.universe.models.length,38);
assert.equal(new Set(pass.universe.models).size,38);
const m=pass.universe.models;
const releaseRows=[...m.slice(0,28),
 'Google Pixel 4 | 4 XL','Google Pixel 3a | 3a XL','Google Pixel 3 | 3 XL','Google Pixel 2 | 2 XL','Google Pixel | XL'];
const html='<table><tr><th>バージョン</th><th>日付</th></tr>'+
 releaseRows.map(x=>'<tr><td>'+x+'</td><td>2026 年 8 月</td></tr>').join('')+'</table>';
assert.equal(extractReleased(html).rows.length,33);
assert.deepEqual(extractReleased(html).models,m);
const indexGroups=[
 [0],[1,2,3],[4],[5],[6,7,8],[9],[13],[10,11,12],[14],[15,16],[17],[18],
 [19,20],[21],[22,23],[24],[25],[26],[27],[28,29],[30,31],[32,33],[34,35],[36,37]
];
const groups=indexGroups.map((ids,i)=>({url:'https://support.google.com/pixelphone/answer/'+(1000+i)+'?hl=ja',models:ids.map(j=>m[j])}));
const safety=groups.map(g=>'<a href="'+g.url.split('?')[0].replace('https://support.google.com','')+'">'+g.models.join('、')+'（2026）</a>').join('');
const got=extractOfficialSupportIndex(safety);
assert.equal(got.length,24);
const reconciled=reconcileSources(html,safety,pass);
assert.equal(reconciled.modelMap.size,38);
const sample='<html><head><title>安全と規制に関する情報 - Google Pixel 11 Pro XL</title></head><body><h1>安全と規制 - Google Pixel 11 Pro XL</h1></body></html>';
assert.equal(inspectDocument(sample,'Google Pixel 11 Pro XL').accepted,true);
assert.equal(inspectDocument(sample,'Google Pixel 11 Pro').accepted,false,'Pro must not match Pro XL');
assert.equal(inspectDocument(sample,'Google Pixel 11').accepted,false,'base must not match Pro XL');
assert.equal(inspectDocument(sample,'Google Pixel').accepted,false,'base Pixel must not match Pixel 11');
const docMap=new Map(groups.map(x=>[x.url,x.models]));
const all=await reviewAll({pass,releaseHtml:html,safetyHtml:safety,probe:async url=>{
 const names=docMap.get(url);
 assert.ok(names);
 return{url,html:'<html><title>安全と規制 - '+names.join('、')+'</title><h1>安全と規制 '+names.join('、')+'</h1></html>'};
}});
assert.equal(all.models,38);
assert.equal(all.releaseRows,33);
assert.equal(all.documentGroups,24);
assert.equal(all.documentFetches,24);
assert.equal(all.records.length,38);
assert.deepEqual(all.counts,{direct:0,shared:0,support_only:38,held:0});
assert.equal(all.records.every(r=>r.supportUrl?.startsWith('https://support.google.com/')),true);
assert.equal(all.records.every(r=>!r.manualUrl),true);
const weak=await reviewAll({pass,releaseHtml:html,safetyHtml:safety,probe:async url=>({url,html:sample})});
assert.ok(weak.counts.held>30,'do not promote unrelated manufacturer articles based solely on HTTP 200');
await assert.rejects(async()=>reconcileSources(html.replace('Google Pixel 11 Pro Fold','Google Pixel 12 Pro Fold'),safety,pass),/differ/);
console.log('Pixel 38-model official population, 24 manufacturer exact support groups and false-positive guards passed.');
