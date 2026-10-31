import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateCoveragePass} from '../scripts/coverage-pass-lib.mjs';
import {lockedPopulation,familyCode,inspectManual,reviewAll} from '../scripts/asus-jp-vivobook-review.mjs';
const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/asus/jp-vivobook-official-2026-product-index.json',import.meta.url),'utf8'));
const v=validateCoveragePass(pass);assert.equal(v.valid,true,v.errors.join('; '));
assert.equal(pass.universe.models.length,35);
assert.equal(pass.universe.declaredCount,35);
assert.equal(new Set(pass.universe.officialProducts.map(x=>x.productId)).size,35);
const listed=pass.universe.officialProducts;
const source='<html><script>https://odinapi.asus.com/recent-data/apiv2/SeriesFilterResult?PageIndex=1&PageSize=20&SeriesName=Vivobook&WebsiteCode=jp</script></html>';
const fakeAPI=async url=>{
 const u=new URL(url),index=Number(u.searchParams.get('PageIndex')),size=Number(u.searchParams.get('PageSize'));
 const products=listed.slice((index-1)*size,index*size).map(x=>({Name:'<h2>'+x.model+'</h2>',ProductID:x.productId,ProductURL:x.productUrl}));
 return{url,status:200,text:JSON.stringify({Status:'200',Result:{TotalCount:35,ProductList:products}})};
};
const audit=await lockedPopulation({pass,indexHtml:source,apiFetch:fakeAPI});
assert.equal(audit.items.length,35);
assert.equal(audit.signature,pass.universe.sourceObservation.orderedModelIdUrlSha256);
for(const x of audit.items)assert.ok(familyCode(x.model).length>=4);
const manual=async url=>{
 const u=new URL(url),code=u.searchParams.get('model2Name'),p=listed.find(x=>url.startsWith(x.productUrl));
 assert.ok(p);
 const html='<html><title>'+p.model+'</title><h2>Manual</h2><article>バージョン J123 User’s Manual for Japanese Edition ダウンロード</article></html>';
 return{url,status:200,text:html};
};
const reviewed=await reviewAll({pass,indexHtml:source,apiFetch:fakeAPI,pageFetch:manual});
assert.deepEqual(reviewed.counts,{direct:35,shared:0,support_only:0,held:0});
assert.equal(reviewed.records.length,35);
assert.equal(new Set(reviewed.records.map(x=>x.manualUrl)).size,35);
assert.ok(reviewed.records.every(x=>x.manualEvidence.japanese));
const malformed=await reviewAll({pass,indexHtml:source,apiFetch:fakeAPI,pageFetch:async url=>({url,status:200,text:'<title>ASUS generic product</title>'})});
assert.deepEqual(malformed.counts,{direct:0,shared:0,support_only:0,held:35});
await assert.rejects(()=>lockedPopulation({pass,indexHtml:source,apiFetch:async url=>{
 const result=await fakeAPI(url);const j=JSON.parse(result.text);j.Result.TotalCount=34;return{...result,text:JSON.stringify(j)}
}}),/population|pagination/i);
const one=listed[0],caseDoc=await manual(one.productUrl+'helpdesk_manual?model2Name='+familyCode(one.model));
assert.equal(inspectManual(caseDoc,one).accepted,true);
const substituted={...caseDoc,text:caseDoc.text.replace(familyCode(one.model),'S9999')};
assert.equal(inspectManual(substituted,one).accepted,false);
console.log('ASUS 35-model double-pagination lock, exact model-manual gate and silent-drop tests passed.');
