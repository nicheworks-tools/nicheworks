import assert from 'node:assert/strict';
import {extractDellCatalog,runDellReview} from '../scripts/dell-jp-catalog-bulk-discovery.mjs';
const sourceUrl='https://www.dell.com/support/home/ja-jp';
const rows=Array.from({length:50},(_,i)=>{const n=5000+i;return '<a href="/support/product-details/ja-jp/product/latitude-'+n+'-laptop/resources/manuals">Latitude '+n+'</a>'}).join('\n');
const discovery=extractDellCatalog(rows,{sourceUrl});
assert.equal(discovery.capturedPopulation,50);
assert.equal(discovery.thresholdMet,true);
assert.equal(discovery.publicationReady,false);
assert.equal(discovery.records[0].model,'Latitude 5000');
assert.equal(extractDellCatalog(rows+rows,{sourceUrl}).capturedPopulation,50);
assert.equal(extractDellCatalog(rows.slice(0,rows.indexOf('</a>')+4),{sourceUrl}).thresholdMet,false);
assert.equal(extractDellCatalog('<a href="https://evil.example/support/product-details/ja-jp/product/latitude-5000/resources/manuals">Latitude 5000</a>',{sourceUrl}).capturedPopulation,0);
assert.throws(()=>extractDellCatalog(rows,{sourceUrl:'http://www.dell.com'}),/Dell-owned HTTPS/);
const report=await runDellReview({sourceUrl,html:rows,concurrency:10,fetcher:async u=>({
 ok:true,status:200,url:u,text:async()=>'<html><title>Latitude '+u.match(/latitude-(\d+)/)[1]+' | Dell</title><body>マニュアルおよび文書 オーナーズ マニュアル</body></html>'
})});
assert.deepEqual(report.states,{direct:0,shared:0,support_only:0,held:50});
assert.equal(report.reviewed,50);
assert.equal(report.review.filter(x=>x.titleMatch&&x.manualSection&&x.manualNamed).length,50);
assert.equal(report.publicationReady,false);
await assert.rejects(runDellReview({sourceUrl,html:rows.replace(/<a[^>]*>Latitude 5000<\/a>/,'')}),/>= 50/);
console.log('Dell official catalog candidate-only 50-model fixture gates passed');
