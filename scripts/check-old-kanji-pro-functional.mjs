import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('assets/okj-ocr-pro-engine.js','utf8');
const context=vm.createContext({window:{}});
vm.runInContext(source,context);
const engine=context.window.OldKanjiProOcr;
const gate={active:true,productId:'okj.toolkit_pro',featureId:'okj.ocr.batch'};
const samples=[{name:'a.png',type:'image/png',size:500},{name:'b.jpg',type:'image/jpeg',size:600}];
assert.equal(engine.allowed(gate),true);
assert.equal(engine.allowed({active:true,productId:'nicheworks.pro',featureId:'okj.ocr.batch'}),false);
assert.equal(engine.allowed({...gate,active:false}),false);
assert.equal((await engine.runBatch(samples,{active:false},()=>{})).error,'pro_required');
assert.equal(engine.validateFiles([]),'no_files');
assert.equal(engine.validateFiles(Array(11).fill(samples[0])),'too_many_files');
assert.equal(engine.validateFiles([{name:'x',type:'text/plain',size:10}]),'unsupported_file');
assert.equal(engine.validateFiles([{name:'x',type:'image/png',size:16*1024*1024}]),'invalid_file_size');
const langs=[],calls=[];
const results=await engine.runBatch(samples,gate,async(file,language)=>{
  langs.push(language);calls.push(file.name);
  if(file.name==='b.jpg')throw Error('error in image');
  return {data:{text:'  舊\n學  '}};
});
assert.equal(results.ok,true);
assert.deepEqual(calls,['a.png','b.jpg']);
assert.deepEqual(langs,['jpn','jpn']);
assert.equal(results.results[0].text,'  舊\n學  ');
assert.equal(results.results[1].status,'error');
const html=fs.readFileSync('tools/old-kanji-ocr-scanner/index.html','utf8');
assert.ok(html.includes('/assets/okj-ocr-pro-engine.js'));
assert.ok(html.includes('/assets/okj-ocr-pro-ui.js'));
assert.ok(html.includes('/assets/okj-history-collection.js'));
assert.doesNotMatch(html,/\$4\.99|data-okj-pro-state=/i);
const ui=fs.readFileSync('assets/okj-ocr-pro-ui.js','utf8');
assert.ok(ui.includes("refreshProState({ productId: PRODUCT"));
assert.ok(ui.includes("recheck('okj.ocr.batch')"));
assert.ok(ui.includes("recheck('okj.history')"));
assert.ok(ui.includes("window.Tesseract.recognize"));
assert.doesNotMatch(ui,/gtag\(|affiliate_outbound|api\/billing\/create-checkout-session/);

const historySrc=fs.readFileSync('assets/okj-history-collection.js','utf8');
const saved=new Map();
const storage={
  getItem(key){return saved.get(key)||null;},
  setItem(key,value){saved.set(key,value);},
  removeItem(key){saved.delete(key);}
};
const localContext=vm.createContext({window:{localStorage:storage}});
vm.runInContext(historySrc,localContext);
const store=localContext.window.OldKanjiHistoryCollection;
const historyGate={active:true,productId:'okj.toolkit_pro',featureId:'okj.history'};
const collectionGate={active:true,productId:'okj.toolkit_pro',featureId:'okj.collections'};
assert.equal(store.saveHistoryRecord({ocrText:'舊　學'}, {active:true,productId:'nicheworks.pro',featureId:'okj.history'}).error,'pro_required');
assert.equal(store.saveHistoryRecord({ocrText:'舊　學'},collectionGate).error,'pro_required');
assert.equal(store.saveHistoryRecord({ocrText:'舊　學'},historyGate).ok,true);
assert.equal(store.listHistoryRecords(historyGate).records[0].ocrText,'舊　學');
assert.equal(store.listHistoryRecords(collectionGate).error,'pro_required');
assert.equal(store.saveCollectionRecord({old:'舊',modern:['旧'],source:'ocr'},historyGate).error,'pro_required');
assert.equal(store.saveCollectionRecord({old:'舊',modern:['旧'],source:'ocr'},collectionGate).ok,true);
assert.equal(store.listCollectionRecords(collectionGate).records[0].old,'舊');
assert.ok(ui.includes("recheck('okj.collections')"));

console.log('Old Kanji Pro OCR batch, feature-specific history and collection: PASS');
