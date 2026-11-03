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

const cmsOneExtra=structuredClone(cms);
const observed=JSON.parse(cmsOneExtra.data.layouts[0].children[0].extstr);
const newNonMobile={text:'New manufacturer non-mobile accessory',href:'/jp/support/user-guide-pdf/new-nonmobile-accessory',link:'https://gl123.alsgp0.mi-fds.com/gl123/new-nonmobile-accessory.pdf'};
observed.data.at(-1).content.push(newNonMobile);
cmsOneExtra.data.layouts[0].children[0].extstr=JSON.stringify(observed);
const htmlOneExtra=html+'<a href="'+newNonMobile.href+'">'+newNonMobile.text+'</a>';
assert.equal(officialCms(cmsOneExtra).length,307);
const extraPopulation=officialPopulation(pass,htmlOneExtra,cmsOneExtra);
assert.equal(extraPopulation.htmlCount,307);
assert.equal(extraPopulation.cmsCount,307);
assert.equal(extraPopulation.nonMobileNewLinkCount,1);
assert.equal(extraPopulation.sourceDigest,pass.universe.sourceObservation.officialIndexSha256);
assert.deepEqual(extraPopulation.rows.map(x=>x.label),pass.universe.models);
const extraReviewed=await reviewAll({pass,html:htmlOneExtra,cmsJson:cmsOneExtra,pdfFetcher});
assert.equal(extraReviewed.officialTotalGuideRows,307);
assert.equal(extraReviewed.nonMobileNewLinkCount,1);
assert.deepEqual(extraReviewed.counts,{direct:60,shared:0,support_only:0,held:0});
assert.throws(()=>officialPopulation(pass,html,cmsOneExtra),/population/,'HTML/CMS source mismatch must fail');
assert.throws(()=>officialPopulation(pass,htmlOneExtra, cms),/population/,'CMS/HTML source mismatch must fail');
assert.throws(()=>officialPopulation(pass,htmlOneExtra.replace('Xiaomi 17T Pro','Xiaomi 17T Pro Rev'),cmsOneExtra),/mismatch|drift/,'first 74 scoped models cannot drift');
const cmsTwoExtra=structuredClone(cmsOneExtra);
const two=JSON.parse(cmsTwoExtra.data.layouts[0].children[0].extstr);
two.data.at(-1).content.push({...newNonMobile,text:'Second new external guide'});
cmsTwoExtra.data.layouts[0].children[0].extstr=JSON.stringify(two);
assert.throws(()=>officialCms(cmsTwoExtra),/population/,'second unreviewed external addition must fail closed');

console.log('Xiaomi official 306 baseline / 307 with exactly one non-mobile addition, 74 locked mobile entries / 60 exact model-guide identities and PDF fail-closed checks passed.');
