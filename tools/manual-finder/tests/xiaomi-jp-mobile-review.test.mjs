import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateCoveragePass} from '../scripts/coverage-pass-lib.mjs';
import {officialIndex,officialCms,officialPopulation,reviewAll} from '../scripts/xiaomi-jp-mobile-review.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/xiaomi/jp-mobile-user-guide-2026.json',import.meta.url),'utf8'));
const v=validateCoveragePass(pass);assert.equal(v.valid,true,v.errors.join('; '));
assert.equal(pass.universe.models.length,60);
assert.equal(new Set(pass.universe.models.map(x=>x.toLowerCase())).size,60);
assert.equal(new Set(pass.universe.officialGuideEntries.map(x=>x.officialGuideHref)).size,60);
const total=306,all=[];
for(let i=0;i<total;i++)all.push({text:'Other Product '+i,href:'/jp/support/user-guide-pdf/other-'+i,link:'https://gl123.alsgp0.mi-fds.com/gl123/other-'+i+'.pdf'});
const excluded=new Set([...pass.universe.sourceObservation.excludedGenericIndexes,...pass.universe.sourceObservation.excludedAccessoryIndexes,pass.universe.sourceObservation.duplicateEntryIndex]);
let c=0;
for(let i=0;i<74;i++){
 if(excluded.has(i))continue;
 const x=pass.universe.officialGuideEntries[c++];
 all[i]={text:x.model,href:x.officialGuideHref,link:'https://gl123.alsgp0.mi-fds.com/gl123/test-'+i+'.pdf'};
}
assert.equal(c,60);
all[41].text='Redmi Pad 2 4G';
all[44]={...all[41],text:'REDMI Pad 2 4G'};
all[74].text='REDMI Buds 5 Pro';
const html=all.map(x=>'<a href="'+x.href+'">'+x.text+'</a>').join('');
const cms={errno:0,data:{pageInfo:{path:'support/user-guide'},layouts:[{children:[{name:'tab-with-table',extstr:JSON.stringify({data:[
 {content:all.slice(0,74)},...Array.from({length:5},(_,i)=>({content:all.slice(74+i*47,i===4?306:74+(i+1)*47)}))
]})}]}]}};
assert.equal(all.length,306);
assert.equal(officialIndex(html).length,306);
assert.equal(officialCms(cms).length,306);
const rec=officialPopulation(pass,html,cms);
assert.equal(rec.rows.length,60);
assert.equal(rec.sourceDigest,pass.universe.sourceObservation.officialIndexSha256);
assert.deepEqual(rec.rows.map(x=>x.label),pass.universe.models);
const pdfFetcher=async url=>({url,status:206,contentType:'application/pdf',pdfVersion:'%PDF-1.7',fileBytes:45000,verifiedBytes:8192});
const result=await reviewAll({pass,html,cmsJson:cms,pdfFetcher});
assert.deepEqual(result.counts,{direct:60,shared:0,support_only:0,held:0});
assert.equal(result.records.length,60);
assert.ok(result.records.every(x=>x.pdfEvidence?.pdfVersion?.startsWith('%PDF-')));
const cmsLeica=structuredClone(cms);
const group=JSON.parse(cmsLeica.data.layouts[0].children[0].extstr);
group.data[0].content[6].link='https://www.mi.com/jp/support/user-guide-pdf/leica-leitzphone-powered-by-xiaomi/';
cmsLeica.data.layouts[0].children[0].extstr=JSON.stringify(group);
const withheld=await reviewAll({pass,html,cmsJson:cmsLeica,pdfFetcher,leicaFetcher:async()=>{throw Error('Leica official page not yet verified')}});
assert.deepEqual(withheld.counts,{direct:59,shared:0,support_only:0,held:1});
assert.equal(withheld.heldModels[0],'Leica Leitzphone powered by Xiaomi');
assert.ok(withheld.records.every(x=>x.state==='held'||x.evidenceUrls.some(y=>y.startsWith('https://gl123.alsgp0.mi-fds.com/'))));
await assert.rejects(async()=>officialPopulation(pass,html.replace('Xiaomi 17T Pro','Xiaomi 17T Pro New'),cms),/mismatch|drift/);
const malformed={...cms,data:{...cms.data,pageInfo:{path:'support/wrong'}}};
assert.throws(()=>officialCms(malformed),/path/);
const manufacturerLeica=await reviewAll({pass,html,cmsJson:cmsLeica,pdfFetcher,leicaFetcher:async()=>({
 url:'https://leica-camera.com/ja-JP/mobile/leitzphone-powered-by-xiaomi/downloads',
 html:'<title>Leica Leitzphone powered by Xiaomi</title><p>Quickstart-Guide</p><a href="/sites/default/files/pm-127087-Leica-Leitzphone-powered-by-Xiaomi-Quickstart-guide.pdf">Download</a>'
})});
assert.deepEqual(manufacturerLeica.counts,{direct:60,shared:0,support_only:0,held:0});
assert.equal(manufacturerLeica.records.find(x=>x.model==='Leica Leitzphone powered by Xiaomi').reviewMethod,'secondary_manufacturer_Leica_exact_model_multilingual_quickstart_PDF');
const failPdf=await reviewAll({pass,html,cmsJson:cmsLeica,pdfFetcher:async()=>{throw Error('PDF magic missing')},leicaFetcher:async()=>{throw Error('Leica still unverified')}});
assert.deepEqual(failPdf.counts,{direct:0,shared:0,support_only:0,held:60});
console.log('Xiaomi official 306-guide index / 74 mobile entries / 60 exact phone/tablet models and PDF fail-closed checks passed.');
