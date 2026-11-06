import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verifyPage} from '../scripts/dyson-jp-six-manual-index-live.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../coverage-passes/dyson/jp-first-six-guide-indexes-20261106.json',import.meta.url),'utf8'));
assert.equal(manifest.products.length,6);
assert.equal(new Set(manifest.products.map(x=>x.model)).size,6);
assert.equal(new Set(manifest.products.map(x=>x.url)).size,5);
for(const item of manifest.products){
 const marker=item.model.includes('SV46')?' V12 Detect Slim (SV20)':item.model.includes('SV20')?' V12 Detect Slim (SV46)':'';
 const html='<h1>'+item.needle+'</h1><section>取扱説明書 PDFダウンロード'+marker+'</section>';
 assert.equal(verifyPage(item,html,item.url).model,item.model);
 assert.throws(()=>verifyPage(item,html.replace('取扱説明書','ユーザーサポート'),item.url),/manual PDF section missing/);
 assert.throws(()=>verifyPage(item,'<h1>Other model</h1>取扱説明書 PDF',item.url),/product\/variant name absent/);
 assert.throws(()=>verifyPage(item,html,'https://untrusted.example/manual.pdf'),/manufacturer page redirects/);
}
console.log('Dyson six exact model support HTML index and Japanese manual PDF section fixtures PASS');
