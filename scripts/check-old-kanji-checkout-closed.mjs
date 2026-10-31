import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync('functions/api/billing/create-checkout-session.js','utf8');
const importLine="import { expectedMinorAmount, getProduct, loadProductsConfig, validateConfiguredProduct } from './product-config.js';\nimport { oldKanjiLiveReady } from './old-kanji-launch-guard.js';";
assert.ok(source.includes(importLine));
const mock=`
const expectedMinorAmount=()=>0;
const oldKanjiLiveReady=async()=>false;
const getProduct=(config,id)=>config.products.find(x=>x.productId===id)||null;
const loadProductsConfig=async(_request,env)=>env.fixture;
const validateConfiguredProduct=()=>{ throw new Error('Validation must not run before sales launch gate'); };`;
const executable=source.replace(importLine,mock);
const {onRequestPost}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(executable));
const config=JSON.parse(fs.readFileSync('config/billing/products.json','utf8'));
const req=(productId)=>new Request('https://nicheworks.app/api/billing/create-checkout-session',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({productId,returnPath:'/tools/old-kanji-ocr-scanner/'})
});
let response=await onRequestPost({request:req('okj.toolkit_pro'),env:{fixture:config}});
assert.equal(response.status,409);
assert.equal((await response.json()).error,'product_not_on_sale');
response=await onRequestPost({request:req('unknown.product'),env:{fixture:config}});
assert.equal(response.status,404);
assert.equal((await response.json()).error,'unknown_product_id');
const linked=structuredClone(config);
linked.products.find(x=>x.productId==='okj.toolkit_pro').stripe.mode='connected';
response=await onRequestPost({request:req('okj.toolkit_pro'),env:{fixture:linked}});
assert.equal(response.status,409);
assert.equal((await response.json()).error,'product_not_on_sale');
response=await onRequestPost({request:req('csv_tidy.pro_v1'),env:{fixture:config}});
assert.equal(response.status,403);
assert.equal((await response.json()).error,'product_checkout_disabled');
console.log('Old Kanji and CSV Tidy checkout remain closed for unlaunched products: PASS');