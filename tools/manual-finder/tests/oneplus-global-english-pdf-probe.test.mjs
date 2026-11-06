import assert from 'node:assert/strict';
import {manifest,verifyPdf} from '../scripts/oneplus-global-english-pdf-probe.mjs';
assert.equal(manifest.groups.length,12);
assert.equal(new Set(manifest.groups.map(x=>x.model)).size,12);
assert.equal(new Set(manifest.groups.map(x=>x.url)).size,12);
assert.equal(manifest.groups.filter(x=>x.kind==='full').length,8);
assert.equal(manifest.groups.filter(x=>x.kind==='quick').length,4);
const bytes=Buffer.concat([Buffer.from('%PDF-1.7'),Buffer.alloc(75000)]);
for(const x of manifest.groups){
 assert.equal(verifyPdf(x,bytes,x.needle+' OnePlus Quick Guide User Manual battery',x.url).model,x.model);
 assert.throws(()=>verifyPdf(x,bytes,'Unrelated Device Quick Guide',x.url),/printed identity/);
 assert.throws(()=>verifyPdf(x,Buffer.from('<html>Error</html>'),x.needle+' User Manual',x.url),/invalid PDF/);
 assert.throws(()=>verifyPdf(x,bytes,x.needle+' User Manual',x.url.replace('.pdf','-mismatch.pdf')),/filename\/path redirect mismatch/);
 assert.throws(()=>verifyPdf(x,bytes,x.needle+' User Manual','https://unknown.example.com/docs.pdf'),/manufacturer origin changed/);
}
console.log('OnePlus 12 manufacturer PDFs, exact internal-model identity and strict redirect/magic fixtures PASS');
