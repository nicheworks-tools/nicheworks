// Test-only future launch simulation. Price 1234 JPY is synthetic and NOT a sale proposal.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHmac,webcrypto} from "node:crypto";
import {DatabaseSync} from "node:sqlite";
import {onRequest as stripeWebhook} from "../../../functions/api/billing/stripe-webhook.js";
import {onRequestGet as readEntitlement} from "../../../functions/api/billing/entitlement.js";
import {onRequestPost as studioExport} from "../../../functions/api/motion-atlas/studio-export.js";

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
console.log("Motion Atlas Studio signed Stripe-shaped webhook -> D1 -> paid export -> refund/replay: PASS (synthetic price, no real checkout).");
