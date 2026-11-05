import assert from 'node:assert/strict';
import {manifest,checkPdf} from '../scripts/oppo-jp-nine-pdf-probe.mjs';
assert.equal(manifest.groups.length,9);
assert.equal(manifest.records.filter(x=>x.state==='direct').length,7);
assert.equal(manifest.records.filter(x=>x.state==='held').length,2);
assert.equal(new Set(manifest.groups.map(x=>x.model)).size,9);
assert.equal(new Set(manifest.groups.map(x=>x.manualUrl)).size,9);
const bytes=Buffer.concat([Buffer.from('%PDF-1.7'),Buffer.alloc(70000)]);
for(const group of manifest.groups){
 const text=group.needle+' 初期設定 ガイド カメラ';
 assert.equal(checkPdf(group,bytes,text,group.manualUrl).model,group.model);
 assert.throws(()=>checkPdf(group,bytes,'OPPO OTHER device 初期設定',group.manualUrl),/exact OPPO model/);
 assert.throws(()=>checkPdf(group,Buffer.from('<html></html>'),text,group.manualUrl),/PDF magic/);
 assert.throws(()=>checkPdf(group,bytes,text,'https://bad.example.com/unrelated.pdf'),/non-OPPO manufacturer host/);
 assert.throws(()=>checkPdf(group,bytes,text,group.manualUrl.replace('.pdf','-unrelated.pdf')),/PDF path changed/);
}
console.log('OPPO manufacturer 9 original PDF URLs, fail-closed model and source identity fixtures PASS');
