import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({window:{}});
for(const filename of ['assets/okj-multi-core.js','assets/okj-multi-batch.js']){
  vm.runInContext(fs.readFileSync(filename,'utf8'),context,{filename});
}
const core=context.window.OkjMultiCore,engine=context.window.OldKanjiMultiBatch;
const dict=JSON.parse(fs.readFileSync('tools/old-kanji-reference/dict.json','utf8'));
const modernDict=JSON.parse(fs.readFileSync('tools/kanji-modernizer/dict.json','utf8'));
const gate=k=>({active:true,productId:'okj.toolkit_pro',featureId:core.FEATURES[k]});
assert.deepEqual(Object.keys(core.FEATURES).sort(),['document','modernizer','unicode','variant'].sort());
assert.equal(core.lines('舊學\n國府').ok,true);
assert.equal(core.lines('x\n'.repeat(201)).error,'too_many_rows');
assert.equal(core.lines('x'.repeat(2001)).error,'row_too_long');
assert.equal(core.csv('text,other\r\n"舊,學",1\r\n國府,2','modernizer').rows[0],'舊,學');
assert.equal(core.csv('text\n"bad','unicode').error,'invalid_csv');
assert.equal(core.csv('a,b\nx,y','unicode').error,'header_required');
for(const kind of Object.keys(core.FEATURES)){
  assert.equal(core.allowed(gate(kind),kind),true);
  assert.equal(core.allowed({active:false,...gate(kind),featureId:'okj.ocr.crop'},kind),false);
  assert.equal(core.allowed({...gate(kind),active:false},kind),false);
  assert.equal(engine.run(kind,['舊學'],dict,gate('variant')).error,kind==='variant'?undefined:'pro_required');
}
const transformed=engine.run('modernizer',['舊學','國府'],modernDict,gate('modernizer'),{direction:'old-to-new',policy:'conservative'});
assert.equal(transformed.ok,true);
assert.equal(transformed.count,2);
assert.equal(transformed.rows[0].output,'旧学');
assert.equal(transformed.rows[1].output,'国府');
const excluded=engine.run('modernizer',['https://example.org/舊'],dict,gate('modernizer'),{exclude:true});
assert.equal(excluded.rows[0].output,'https://example.org/舊');
const reverse=engine.run('modernizer',['旧学'],modernDict,gate('modernizer'),{direction:'new-to-old',policy:'first'});
assert.equal(reverse.rows[0].output,'舊學');
const conservative=engine.run('modernizer',['辺'],modernDict,gate('modernizer'),{direction:'new-to-old',policy:'conservative'});
assert.equal(conservative.rows[0].output,'辺');
assert.ok(conservative.rows[0].details.ambiguities.length>0);
const unicode=engine.run('unicode',['𠮷﨑','舊'],dict,gate('unicode'));
assert.equal(unicode.rows[0].details.characters[0].unicode,'U+20BB7');
assert.equal(unicode.rows[0].details.characters[0].utf16,'D842 DFB7');
assert.equal(unicode.rows[0].details.characters[1].compatibility,true);
const variant=engine.run('variant',['舊 旧'],dict,gate('variant'));
assert.ok(variant.rows[0].output.includes('U+820A'));
assert.ok(variant.rows[0].details.characters[0].modern.includes('旧'));
const document=engine.run('document',['舊學校'],dict,gate('document'));
assert.equal(document.rows[0].output,'旧学校');
assert.equal(document.rows[0].details.total,2);
const forCsv=engine.run('document',['=HYPERLINK("evil")'],dict,gate('document'));
const exported=engine.exportData(forCsv,gate('document'),'csv');
assert.equal(exported.ok,true);
assert.ok(exported.content.includes('"\'=HYPERLINK'));
assert.equal(engine.exportData(forCsv,gate('unicode'),'csv').error,'pro_required');
assert.equal(engine.exportData(forCsv,gate('document'),'json').ok,true);
for(const slug of ['kanji-modernizer','unicode-kanji-checker','variant-kanji-compare','old-document-kanji-highlighter']){
 const html=fs.readFileSync('tools/'+slug+'/index.html','utf8');
 for(const asset of ['okj-multi-core.js','okj-multi-batch.js','okj-multi-batch-ui.js'])assert.ok(html.includes(asset),slug+' missing '+asset);
}
console.log('Four reference-backed Old Kanji Pro batches, CSV parser, Unicode, conservative reverse conversion, export gate PASS');
