import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({window:{}});
for(const file of ['assets/okj-multi-core.js','assets/okj-multi-batch.js',
  'assets/okj-name-place-batch.js','assets/okj-batch-hub.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const hub=context.window.OldKanjiBatchHub;
const core=context.window.OkjMultiCore;
const namePlace=context.window.OldKanjiNamePlaceBatch;
const multi=context.window.OldKanjiMultiBatch;
const engines={namePlace,multi};
const dictionary=JSON.parse(fs.readFileSync('tools/old-kanji-reference/dict.json','utf8'));
const shared={productId:'okj.toolkit_pro',featureId:'okj.batch',active:true};
const gate=kind=>({productId:'okj.toolkit_pro',featureId:hub.FEATURES[kind],active:true});
assert.deepEqual(Object.keys(hub.FEATURES).sort(),
  ['modernizer','unicode','variant','document','name','place','ocr'].sort());
assert.equal(hub.allowed(shared,gate('modernizer'),'modernizer'),true);
assert.equal(hub.allowed({...shared,active:false},gate('modernizer'),'modernizer'),false);
assert.equal(hub.allowed(shared,gate('unicode'),'modernizer'),false);
assert.equal(hub.allowed({...shared,featureId:'okj.history'},gate('name'),'name'),false);
assert.equal(hub.allowed({...shared,productId:'csv_tidy.pro_v1'},gate('place'),'place'),false);
assert.equal(hub.allowed(shared,gate('ocr'),'ocr'),true);
assert.equal(hub.parseLines('舊學\n國府','modernizer',core,namePlace).rows.length,2);
assert.equal(hub.parseCsv('\uFEFFtext\n舊學','modernizer',core,namePlace).rows[0],'舊學');
assert.equal(hub.parseCsv('\uFEFFname\n齋藤','name',core,namePlace).rows[0],'齋藤');
assert.equal(hub.parseCsv('place\n廣島','place',core,namePlace).rows[0],'廣島');
assert.equal(hub.parseCsv('x,y\nfoo,bar','unicode',core,namePlace).ok,false);
assert.equal(hub.parseLines('x','ocr',core,namePlace).error,'unsupported_mode');
assert.equal(hub.parseLines('x\n'.repeat(201),'document',core,namePlace).error,'too_many_rows');
for(const kind of Object.keys(hub.FEATURES)){
  const result=hub.run(['舊學'],kind,dictionary,shared,gate('unicode'),engines);
  assert.equal(result.error,kind==='unicode'?undefined:'pro_required');
}
const modern=hub.run(['舊學','國府'],'modernizer',dictionary,shared,gate('modernizer'),engines,{});
assert.equal(modern.ok,true);assert.equal(modern.count,2);
assert.equal(modern.rows[0].output,'旧学');
const unicode=hub.run(['𠮷 﨑'],'unicode',dictionary,shared,gate('unicode'),engines);
assert.equal(unicode.ok,true);assert.ok(unicode.rows[0].output.includes('U+20BB7'));
const variant=hub.run(['舊 旧'],'variant',dictionary,shared,gate('variant'),engines);
assert.ok(variant.rows[0].output.includes('U+820A'));
const document=hub.run(['舊學'],'document',dictionary,shared,gate('document'),engines);
assert.equal(document.rows[0].details.total,2);
const name=hub.run(['齋藤'],'name',dictionary,shared,gate('name'),engines);
assert.equal(name.count,1);assert.ok(name.rows[0].matches.length);
const place=hub.run(['廣島'],'place',dictionary,shared,gate('place'),engines);
assert.equal(place.count,1);assert.ok(place.rows[0].matches.some(x=>x.char==='廣'));
assert.equal(hub.run(['x'],'ocr',dictionary,shared,gate('ocr'),engines).error,'use_image_scanner');
assert.equal(hub.exportData(modern,shared,gate('modernizer'),'csv',engines).ok,true);
assert.equal(hub.exportData(name,shared,gate('name'),'json',engines).ok,true);
assert.equal(hub.exportData(place,shared,gate('name'),'csv',engines).error,'pro_required');
assert.equal(hub.exportData(place,{...shared,active:false},gate('place'),'json',engines).error,'pro_required');
const injection=hub.run(['=HYPERLINK("evil")'],'document',dictionary,shared,gate('document'),engines);
const safeCsv=hub.exportData(injection,shared,gate('document'),'csv',engines);
assert.ok(safeCsv.content.includes('"'+"'"+'=HYPERLINK'));
for(const slug of ['old-kanji-reference','kanji-modernizer','old-kanji-ocr-scanner',
  'old-document-kanji-highlighter','unicode-kanji-checker','variant-kanji-compare',
  'place-old-kanji-checker','name-old-kanji-checker']){
  const html=fs.readFileSync('tools/'+slug+'/index.html','utf8');
  for(const asset of ['okj-batch-hub.js','okj-batch-hub-ui.js','okj-batch-hub.css'])
    assert.ok(html.includes('/assets/'+asset),slug+' missing '+asset);
}
for(const file of ['assets/okj-batch-hub.js','assets/okj-batch-hub-ui.js']){
  assert.doesNotMatch(fs.readFileSync(file,'utf8'),/sendBeacon\(|gtag\(|fetch\(['"]https:\/\/|checkout.*enabled/);
}
const product=JSON.parse(fs.readFileSync('config/billing/products.json','utf8')).products.find(x=>x.productId==='okj.toolkit_pro');
assert.equal(product.price.amount,null);assert.equal(product.stripe.mode,'not_connected');
console.log('Shared Batch Hub: seven feature paths, six local analyzers, CSV/JSON guards and eight-tool injection PASS');
