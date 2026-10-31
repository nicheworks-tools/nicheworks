import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync('assets/okj-ocr-crop-engine.js','utf8');
const context=vm.createContext({window:{}});
vm.runInContext(source,context);
const crop=context.window.OldKanjiCropEngine;
const gate={active:true,productId:'okj.toolkit_pro',featureId:'okj.ocr.crop'};
const wrong={active:true,productId:'okj.toolkit_pro',featureId:'okj.ocr.batch'};
assert.equal(crop.allowed(gate),true);
assert.equal(crop.allowed(wrong),false);
assert.equal(crop.allowed({...gate,active:false}),false);
assert.equal(crop.validateSource({type:'image/svg+xml',size:200}),'unsupported_file');
assert.equal(crop.validateSource({type:'text/plain',size:200}),'unsupported_file');
assert.equal(crop.validateSource({type:'image/png',size:0}),'file_size');
assert.equal(crop.validateSource({type:'image/jpeg',size:16*1024*1024}),'file_size');
assert.equal(crop.validateSource({type:'image/png',size:200}),null);
assert.equal(crop.normalizeRect({x:0,y:0,width:1,height:1}).width,1);
assert.equal(crop.normalizeRect({x:-1,y:0,width:0,height:1}),null);
assert.equal(crop.rectFromDrag({x:.8,y:.75},{x:.2,y:.25}).width,0.6000000000000001);
const rect=crop.rectFromDrag({x:.8,y:.75},{x:.2,y:.25});
const pixels=crop.pixels(rect,320,160);
assert.equal(pixels.x,64);assert.equal(pixels.y,40);
assert.equal(pixels.width,192);assert.equal(pixels.height,80);
assert.equal(crop.pixels({x:0,y:0,width:.001,height:1},320,160),null);
assert.equal(crop.makePreviewSize(6000,3000).width,900);
let calls=0,drawArgs=null;
const fakeImage={naturalWidth:320,naturalHeight:160};
function factory(){
  calls++;
  return {
    width:0,height:0,
    getContext(){return {drawImage(...args){drawArgs=args;}};},
    toBlob(callback,mime){assert.equal(mime,'image/png');callback({size:400,type:mime});}
  };
}
assert.equal((await crop.createCropBlob(fakeImage,rect,wrong,factory)).error,'pro_required');
assert.equal(calls,0);
const result=await crop.createCropBlob(fakeImage,rect,gate,factory);
assert.equal(result.ok,true);assert.equal(result.outputPixels.width,192);
assert.equal(result.outputPixels.height,80);
assert.equal(drawArgs[1],64);assert.equal(drawArgs[2],40);
assert.equal(drawArgs[3],192);assert.equal(drawArgs[4],80);
const large=await crop.createCropBlob({naturalWidth:20000,naturalHeight:10000},
  {x:0,y:0,width:1,height:1},gate,factory);
assert.ok(large.outputPixels.width<=4096&&large.outputPixels.height<=4096);
assert.ok(large.outputPixels.width*large.outputPixels.height<=12000000);
const html=fs.readFileSync('tools/old-kanji-ocr-scanner/index.html','utf8');
for(const file of ['okj-ocr-crop-engine.js','okj-ocr-crop-ui.js'])
  assert.ok(html.includes('/assets/'+file),'OCR page must load crop '+file);
const ui=fs.readFileSync('assets/okj-ocr-crop-ui.js','utf8');
for(const text of ['refreshProState({productId:PRODUCT,featureId:FEATURE})',
  "createCropBlob(img,region,gate", "recognize(cropped.blob,'jpn'",
  "editor.dispatchEvent(new Event('input'","pointerdown","pointermove","pointerup"])
  assert.ok(ui.includes(text),'crop UI does not implement '+text);
assert.doesNotMatch(ui,/gtag\(|affiliate_outbound|create-checkout-session|\.sendBeacon\(/);
console.log('Old Kanji crop engine: authorized pixel selection, pointer geometry, safe canvas and editor handoff PASS');