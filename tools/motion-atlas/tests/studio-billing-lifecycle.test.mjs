// Test-only future launch simulation. Price 1234 JPY is synthetic and NOT a sale proposal.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHmac,webcrypto} from "node:crypto";
import {DatabaseSync} from "node:sqlite";
import {onRequest as stripeWebhook} from "../../../functions/api/billing/stripe-webhook.js";
import {onRequestGet as readEntitlement} from "../../../functions/api/billing/entitlement.js";
import {onRequestPost as studioExport} from "../../../functions/api/motion-atlas/studio-export.js";
import {onRequestPost as createCheckout} from "../../../functions/api/billing/create-checkout-session.js";

if(!globalThis.crypto)globalThis.crypto=webcrypto;
const PRODUCT="motion_atlas.studio_v1";
const FEATURE="motionAtlas.studioExport";
const PRICE_TIER="test_only_studio_price_not_approved";
const config=JSON.parse(readFileSync(new URL("../../../config/billing/products.json",import.meta.url),"utf8"));
const liveCatalog=structuredClone(config);
liveCatalog.status="active";
const studio=liveCatalog.products.find(item=>item.productId===PRODUCT);
assert.ok(studio);
studio.checkout.enabled=true;
studio.stripe.mode="connected";
studio.price={amount:1234,currency:"JPY",type:"one_time"};
studio.priceTierId=PRICE_TIER;
liveCatalog.priceTiers.push({priceTierId:PRICE_TIER,amount:1234,currency:"JPY",type:"one_time",label:"TEST ONLY — NOT APPROVED"});
const schema=readFileSync(new URL("../../../schema/billing_entitlements.sql",import.meta.url),"utf8");
const db=new DatabaseSync(":memory:");
db.exec(schema);
const secret="whsec_TEST_ONLY_UNUSABLE_IN_PRODUCTION";
const D1={prepare(sql){const statement=db.prepare(sql);return {bind(...vals){return {
 async first(){return statement.get(...vals)||null;},
 async run(){const result=statement.run(...vals);return {meta:{changes:result.changes}};}
};}};}};
const env={BILLING_DB:D1,STRIPE_WEBHOOK_SECRET:secret,ASSETS:{async fetch(request){
 assert.equal(new URL(request.url).pathname,"/config/billing/products.json");
 return new Response(JSON.stringify(liveCatalog),{status:200,headers:{"content-type":"application/json"}});
}}};
const session="cs_test_studioPIPE001",intent="pi_studioPIPE001";
const composition={text:"Studio Test",tracks:[
 {effect:"fade-up",delay:0,duration:750,easing:"ease-out"},
 {effect:"overshoot",delay:200,duration:500,easing:"ease-in-out"}
]};
const endpoint="https://nicheworks.app";
async function exportAttempt(currentSession=session,extraEnv=env){
 const response=await studioExport({request:new Request(endpoint+"/api/motion-atlas/studio-export",{
 method:"POST",headers:{"content-type":"application/json","origin":endpoint},
 body:JSON.stringify({sessionId:currentSession,composition})}),env:extraEnv});
 return {status:response.status,value:await response.json()};
}
async function readAccess(id=session){
 const query=new URL(endpoint+"/api/billing/entitlement");
 query.searchParams.set("productId",PRODUCT);query.searchParams.set("sessionId",id);
 const response=await readEntitlement({request:new Request(query),env});
 return {status:response.status,value:await response.json()};
}
async function postStripe(type,payment,{badSignature=false}={}){
 const body=JSON.stringify({id:"evt_STUDIO_TEST",type,data:{object:payment}});
 const timestamp=Math.floor(Date.now()/1000);
 const sig=createHmac("sha256",secret).update(timestamp+"."+body).digest("hex");
 const request=new Request(endpoint+"/api/billing/stripe-webhook",{
 method:"POST",headers:{"content-type":"application/json","stripe-signature":"t="+timestamp+",v1="+(badSignature?"0".repeat(64):sig)},
 body
 });
 const response=await stripeWebhook({request,env});
 return {status:response.status,value:await response.json()};
}
const checkoutPayment=(changes={})=>({
 id:session,payment_intent:intent,customer:"cus_STUDIO_TEST",currency:"jpy",
 amount_total:1234,payment_status:"paid",
 metadata:{productId:PRODUCT,priceTierId:PRICE_TIER},
 ...changes
});
// Test-only Stripe API responses prove the configured price check and metadata wiring.
// No real key, HTTP request, payment, or price approval is involved.
const checkoutEnv={...env,
 STRIPE_SECRET_KEY:"sk_test_LOCAL_MOCK_NOT_REAL",
 STRIPE_PRICE_MOTION_ATLAS_STUDIO_V1:"price_STUDIO_TEST_ONLY",
 BILLING_TEST_CHECKOUT_ENABLED:"true"
};
const realFetch=globalThis.fetch;
let checkoutParams;
try{
 globalThis.fetch=async (input,options)=>{
  const url=String(input);
  if(url==="https://api.stripe.com/v1/prices/price_STUDIO_TEST_ONLY"){
   assert.equal(options?.method,"GET");
   return new Response(JSON.stringify({
    id:"price_STUDIO_TEST_ONLY",active:true,type:"one_time",recurring:null,
    livemode:false,currency:"jpy",unit_amount:1234
   }),{status:200});
  }
  if(url==="https://api.stripe.com/v1/checkout/sessions"){
   assert.equal(options?.method,"POST");
   checkoutParams=new URLSearchParams(options.body);
   return new Response(JSON.stringify({
    id:"cs_test_mockSTRIPEAPI",
    url:"https://checkout.stripe.com/c/pay/test_checkout_fake"
   }),{status:200});
  }
  throw Error("Unexpected external network call: "+url);
 };
 const response=await createCheckout({
  request:new Request(endpoint+"/api/billing/create-checkout-session",{
   method:"POST",headers:{"content-type":"application/json"},
   body:JSON.stringify({productId:PRODUCT,returnPath:"/tools/motion-atlas/studio/"})
  }),env:checkoutEnv
 });
 assert.equal(response.status,200);
 const data=await response.json();
 assert.equal(data.ok,true);
 assert.equal(data.productId,PRODUCT);
 assert.equal(data.url,"https://checkout.stripe.com/c/pay/test_checkout_fake");
 assert.equal(data.mode,"test");
 assert.equal(checkoutParams.get("line_items[0][price]"),"price_STUDIO_TEST_ONLY");
 assert.equal(checkoutParams.get("metadata[productId]"),PRODUCT);
 assert.equal(checkoutParams.get("metadata[priceTierId]"),PRICE_TIER);
 assert.match(checkoutParams.get("success_url"),/billing\/success\.html/);
 assert.match(checkoutParams.get("success_url"),/session_id=\{CHECKOUT_SESSION_ID\}/);
 assert.match(checkoutParams.get("success_url"),/return_path=%2Ftools%2Fmotion-atlas%2Fstudio%2F/);
}finally{globalThis.fetch=realFetch;}

const before=await exportAttempt();
assert.equal(before.status,403,"No paid D1 row means no export");
assert.equal((await readAccess()).value.active,false);
const unsigned=await postStripe("checkout.session.completed",checkoutPayment(),{badSignature:true});
assert.equal(unsigned.status,400);
assert.equal((await readAccess()).value.active,false);
const unpaid=await postStripe("checkout.session.completed",checkoutPayment({payment_status:"unpaid"}));
assert.equal(unpaid.status,200);
assert.equal(unpaid.value.entitlementIssued,false);
assert.equal((await readAccess()).value.active,false);
const wrongPrice=await postStripe("checkout.session.completed",checkoutPayment({amount_total:9999}));
assert.equal(wrongPrice.status,200);
assert.equal(wrongPrice.value.entitlementIssued,false);
assert.equal((await readAccess()).value.active,false);
const issued=await postStripe("checkout.session.completed",checkoutPayment());
assert.equal(issued.status,200,JSON.stringify(issued));
assert.equal(issued.value.entitlementIssued,true);
const ent=await readAccess();
assert.equal(ent.value.active,true);
assert.deepEqual(ent.value.features,[FEATURE]);
const result=await exportAttempt();
assert.equal(result.status,200,JSON.stringify(result));
assert.equal(result.value.files.length,3);
assert.ok(result.value.files.some(file=>file.name==="MotionStudio.css"));
assert.ok(result.value.files.some(file=>file.name==="MotionStudioSequence.jsx"));
assert.ok(!JSON.stringify(result.value).includes(session));
const duplicate=await postStripe("checkout.session.completed",checkoutPayment());
assert.equal(duplicate.value.idempotent,true);
assert.equal(Number(db.prepare("SELECT COUNT(*) AS n FROM billing_entitlements").get().n),1);
const refunded=await postStripe("charge.refunded",{payment_intent:intent});
assert.equal(refunded.status,200);
assert.equal(refunded.value.entitlementUpdated,true);
assert.equal((await readAccess()).value.active,false);
assert.equal((await exportAttempt()).status,403,"A refunded purchase cannot keep exporting");
const replay=await postStripe("checkout.session.completed",checkoutPayment());
assert.equal(replay.value.idempotent,true);
assert.equal((await exportAttempt()).status,403,"Replayed Stripe event must not regrant export");
const cross=await readAccess("cs_test_otherPRODUCT");
assert.equal(cross.value.active,false);
db.close();
console.log("Motion Atlas Studio mock Stripe Checkout API -> signed webhook -> SQLite D1 -> paid export -> refund/replay: PASS (synthetic price; no real payment).");
