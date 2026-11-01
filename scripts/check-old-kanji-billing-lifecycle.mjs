// Staged integration test: real webhook functions + signed Stripe-shaped events + SQLite.
// Absolutely no Stripe API requests, real keys, live charges or deployed D1 access.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHmac,webcrypto} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {onRequest as webhook} from '../functions/api/billing/stripe-webhook.js';
import {onRequestGet as entitlement} from '../functions/api/billing/entitlement.js';
import {oldKanjiLiveReady} from '../functions/api/billing/old-kanji-launch-guard.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const sourceConfig=JSON.parse(readFileSync('config/billing/products.json','utf8'));
const p=sourceConfig.products.find(x=>x.productId==='okj.toolkit_pro');
assert.equal(sourceConfig.status,'planning');
assert.equal(p.price.amount,null);
assert.equal(p.stripe.mode,'not_connected');
const config=structuredClone(sourceConfig);
config.status='active';
const product=config.products.find(x=>x.productId==='okj.toolkit_pro');
product.price={amount:1980,currency:'JPY',type:'one_time'};
product.priceTierId='nw.one_time.jpy_1980';
product.stripe.mode='connected';
const db=new DatabaseSync(':memory:');
db.exec(readFileSync('schema/billing_entitlements.sql','utf8'));
const d1={prepare(sql){const stmt=db.prepare(sql);return {bind(...values){return {
  async first(){return stmt.get(...values)||null;},
  async run(){const x=stmt.run(...values);return {meta:{changes:x.changes}};}
};},async first(){return stmt.get()||null;}};}};
const secret='whsec_LOCAL_TEST_NOT_A_REAL_SECRET';
const env={BILLING_DB:d1,STRIPE_WEBHOOK_SECRET:secret,
  ASSETS:{async fetch(){return new Response(JSON.stringify(config),{status:200});}}};
const pid='okj.toolkit_pro',tid='nw.one_time.jpy_1980';
function session(id,intent,overrides={}){
  return {id,payment_intent:intent,customer:'cus_fixture',currency:'jpy',
    amount_total:1980,payment_status:'paid',metadata:{productId:pid,priceTierId:tid},...overrides};
}
async function event(type,object,{invalidSignature=false,oldTimestamp=false}={}){
  const body=JSON.stringify({id:'evt_LOCAL_ONLY',type,data:{object}});
  const timestamp=Math.floor(Date.now()/1000)-(oldTimestamp?900:0);
  const digest=createHmac('sha256',secret).update(timestamp+'.'+body).digest('hex');
  const req=new Request('https://example.test/api/billing/stripe-webhook',{
    method:'POST',headers:{'Content-Type':'application/json',
      'Stripe-Signature':'t='+timestamp+',v1='+(invalidSignature?'0'.repeat(64):digest)},
    body
  });
  const response=await webhook({request:req,env});
  return {status:response.status,body:await response.json()};
}
async function get(id){
  const url='https://example.test/api/billing/entitlement?productId='+pid+'&sessionId='+id;
  const response=await entitlement({request:new Request(url),env});
  return {status:response.status,body:await response.json()};
}
function row(id){return db.prepare('SELECT * FROM billing_entitlements WHERE stripe_checkout_session_id = ?').get(id);}
function revoked(id){return db.prepare('SELECT * FROM billing_payment_revocations WHERE stripe_payment_intent_id = ?').get(id);}
const first='cs_test_BEFOREFUND001',intent='pi_BEFOREREFUND001';
let result=await event('charge.refunded',{payment_intent:intent},{invalidSignature:true});
assert.equal(result.status,400);assert.equal(revoked(intent),undefined);
result=await event('charge.refunded',{payment_intent:intent},{oldTimestamp:true});
assert.equal(result.status,400);assert.equal(revoked(intent),undefined);
result=await event('charge.refunded',{payment_intent:intent});
assert.equal(result.status,200);assert.equal(result.body.revocationRecorded,true);
assert.equal(result.body.entitlementUpdated,false);
assert.equal(revoked(intent).status,'refunded');
result=await event('checkout.session.completed',session(first,intent));
assert.equal(result.status,200);assert.equal(result.body.entitlementIssued,false);
assert.equal(result.body.revocationRecorded,true);assert.equal(row(first),undefined);
assert.equal((await get(first)).body.active,false);
result=await event('charge.refunded',{payment_intent:intent});
assert.equal(result.status,200);assert.equal(revoked(intent).status,'refunded');
result=await event('charge.dispute.created',{payment_intent:intent});
assert.equal(result.status,200);assert.equal(revoked(intent).status,'disputed');
result=await event('charge.refunded',{payment_intent:intent});
assert.equal(result.status,200);assert.equal(revoked(intent).status,'disputed');

const sessionId='cs_test_PAID001',paymentIntent='pi_PAID001';
result=await event('checkout.session.completed',session(sessionId,paymentIntent,{payment_status:'unpaid'}));
assert.equal(result.body.entitlementIssued,false);assert.equal(row(sessionId),undefined);
result=await event('checkout.session.completed',session(sessionId,paymentIntent,{currency:'usd'}));
assert.equal(result.body.entitlementIssued,false);assert.equal(row(sessionId),undefined);
result=await event('checkout.session.completed',session(sessionId,paymentIntent,{amount_total:1}));
assert.equal(result.body.entitlementIssued,false);assert.equal(row(sessionId),undefined);
result=await event('checkout.session.completed',session(sessionId,null));
assert.equal(result.status,500);assert.equal(row(sessionId),undefined);
result=await event('checkout.session.completed',session(sessionId,paymentIntent));
assert.equal(result.status,200);assert.equal(result.body.entitlementIssued,true);
assert.equal(row(sessionId).status,'active');
let active=await get(sessionId);
assert.equal(active.body.active,true);
assert.deepEqual(active.body.features,product.features);
result=await event('checkout.session.completed',session(sessionId,paymentIntent));
assert.equal(result.status,200);assert.equal(result.body.idempotent,true);
assert.equal(db.prepare('SELECT COUNT(*) AS n FROM billing_entitlements').get().n,1);
result=await event('charge.refunded',{payment_intent:paymentIntent});
assert.equal(result.status,200);assert.equal(row(sessionId).status,'refunded');
assert.equal((await get(sessionId)).body.active,false);
result=await event('checkout.session.completed',session(sessionId,paymentIntent));
assert.equal(result.status,200);assert.equal(result.body.entitlementIssued,false);
assert.equal(row(sessionId).status,'refunded');
assert.equal((await get(sessionId)).body.active,false);

const disputeSession='cs_test_DISPUTE001',disputeIntent='pi_DISPUTE001';
result=await event('checkout.session.async_payment_succeeded',session(disputeSession,disputeIntent));
assert.equal(result.body.entitlementIssued,true);
result=await event('charge.dispute.created',{payment_intent:disputeIntent});
assert.equal(result.body.entitlementUpdated,true);
assert.equal(row(disputeSession).status,'disputed');
assert.equal((await get(disputeSession)).body.active,false);
const unrelated='cs_test_UNRELATED001',otherIntent='pi_UNRELATED001';
result=await event('checkout.session.completed',session(unrelated,otherIntent));
assert.equal(result.body.entitlementIssued,true);
assert.equal((await get(unrelated)).body.active,true);
assert.equal((await get(unrelated.replace('001','002'))).body.active,false);

const readinessEnv={
  OKJ_TOOLKIT_PRO_LAUNCH_APPROVED:'true',BILLING_LIVE_CHECKOUT_ENABLED:'true',
  STRIPE_SECRET_KEY:'sk_live_FAKE_ONLY',STRIPE_WEBHOOK_SECRET:'whsec_FAKE_ONLY',
  STRIPE_PRICE_OKJ_TOOLKIT_PRO:'price_FAKEONLY',BILLING_DB:d1
};
assert.equal(await oldKanjiLiveReady(config,product,readinessEnv),true);
const oldDb=new DatabaseSync(':memory:');
oldDb.exec('CREATE TABLE billing_entitlements(entitlement_id TEXT)');
const incomplete={prepare(sql){return {async first(){return oldDb.prepare(sql).get()||null;}};}};
assert.equal(await oldKanjiLiveReady(config,product,{...readinessEnv,BILLING_DB:incomplete}),false);
const columns=db.prepare('PRAGMA table_info(billing_payment_revocations)').all().map(x=>x.name);
assert.deepEqual(columns,['stripe_payment_intent_id','status','first_seen_at','updated_at']);
oldDb.close();db.close();
console.log('Old Kanji signed webhook lifecycle: out-of-order refund/dispute, replay, restore, HMAC, D1 migration PASS');
