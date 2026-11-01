import assert from 'node:assert/strict';
import fs from 'node:fs';
const code=fs.readFileSync('functions/api/billing/old-kanji-launch-guard.js','utf8');
const {oldKanjiLiveReady}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(code));
const config={status:'active'};
const product={productId:'okj.toolkit_pro',stripe:{mode:'connected',priceIdEnv:'STRIPE_PRICE_OKJ_TOOLKIT_PRO'}};
const env={
  OKJ_TOOLKIT_PRO_LAUNCH_APPROVED:'true',
  BILLING_LIVE_CHECKOUT_ENABLED:'true',
  STRIPE_SECRET_KEY:'sk_live_mock_nonsecret',
  STRIPE_WEBHOOK_SECRET:'whsec_mock_nonsecret',
  STRIPE_PRICE_OKJ_TOOLKIT_PRO:'price_dummy',
  BILLING_DB:{prepare(){return {async first(){return null;}};}}
};
assert.equal(await oldKanjiLiveReady(config,product,env),true);
assert.equal(await oldKanjiLiveReady({...config,status:'planning'},product,env),false);
assert.equal(await oldKanjiLiveReady(config,{...product,stripe:{...product.stripe,mode:'not_connected'}},env),false);
assert.equal(await oldKanjiLiveReady(config,product,{...env,OKJ_TOOLKIT_PRO_LAUNCH_APPROVED:'false'}),false);
assert.equal(await oldKanjiLiveReady(config,product,{...env,STRIPE_SECRET_KEY:'sk_test_mock'}),false);
assert.equal(await oldKanjiLiveReady(config,product,{...env,STRIPE_WEBHOOK_SECRET:''}),false);
assert.equal(await oldKanjiLiveReady(config,product,{...env,STRIPE_PRICE_OKJ_TOOLKIT_PRO:''}),false);
assert.equal(await oldKanjiLiveReady(config,product,{...env,BILLING_DB:null}),false);
assert.equal(await oldKanjiLiveReady(config,product,{...env,BILLING_DB:{prepare(){throw Error('missing migration')}}}),false);
const partialMigration={prepare(sql){if(sql.includes('billing_payment_revocations'))throw Error('missing revocation table');return {async first(){return null;}};}};
assert.equal(await oldKanjiLiveReady(config,product,{...env,BILLING_DB:partialMigration}),false);

// Verify the matching-Stripe-Price routine, including amount and currency, without a real purchase.
const checkout=fs.readFileSync('functions/api/billing/create-checkout-session.js','utf8');
const from=checkout.indexOf('async function verifyStripePrice(');
const end=checkout.indexOf('async function createStripeCheckoutSession(',from);
assert.ok(from>=0 && end>from);
const verifyCode=checkout.slice(from,end);
const expectedMinorAmount=p=>Math.round(p.price.amount*100);
const approved={price:{amount:19.8,currency:'USD'}};
const mockStripe={active:true,type:'one_time',recurring:null,livemode:true,currency:'usd',unit_amount:1980};
let stripePayload=mockStripe;
const fetchStripe=async()=>({ok:true,json:async()=>stripePayload});
const verify=new Function('expectedMinorAmount','fetch',verifyCode+';return verifyStripePrice;')(expectedMinorAmount,fetchStripe);
assert.equal(await verify('sk_live_mock','price_example',approved,'live'),true);
stripePayload={...mockStripe,unit_amount:499};
assert.equal(await verify('sk_live_mock','price_example',approved,'live'),false);
stripePayload={...mockStripe,currency:'jpy'};
assert.equal(await verify('sk_live_mock','price_example',approved,'live'),false);
stripePayload={...mockStripe,livemode:false};
assert.equal(await verify('sk_live_mock','price_example',approved,'live'),false);
stripePayload={...mockStripe,active:false};
assert.equal(await verify('sk_live_mock','price_example',approved,'live'),false);
console.log('Old Kanji sale readiness, D1, webhook, explicit approval and Stripe price checks: PASS');
