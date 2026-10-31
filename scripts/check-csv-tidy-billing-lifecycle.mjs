// Integration QA: signed Stripe-shaped events -> actual NicheWorks functions
// -> a real in-memory SQLite D1-equivalent schema -> client entitlement lookup.
// No Stripe network requests, no credentials, no production database.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHmac, webcrypto } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { onRequest as stripeWebhook } from '../functions/api/billing/stripe-webhook.js';
import { onRequestGet as lookupEntitlement } from '../functions/api/billing/entitlement.js';
import { onRequestPost as checkoutAttempt } from '../functions/api/billing/create-checkout-session.js';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const productId = 'csv_tidy.pro_v1';
const priceTierId = 'nw.one_time.jpy_1980';
const expectedFeatures = [
  'csvTidy.savedPresets', 'csvTidy.batchApply', 'csvTidy.batchReport'
];
const config = JSON.parse(readFileSync(new URL('../config/billing/products.json', import.meta.url), 'utf8'));
const schema = readFileSync(new URL('../schema/billing_entitlements.sql', import.meta.url), 'utf8');
const database = new DatabaseSync(':memory:');
database.exec(schema);
const secret = 'whsec_LOCAL_TEST_ONLY_NEVER_DEPLOY';
const d1 = {
  prepare(sql) {
    const statement = database.prepare(sql);
    return {
      bind(...values) {
        return {
          async first() {
            return statement.get(...values) ?? null;
          },
          async run() {
            const result = statement.run(...values);
            return { meta: { changes: result.changes } };
          }
        };
      }
    };
  }
};
const env = {
  BILLING_DB: d1,
  STRIPE_WEBHOOK_SECRET: secret,
  BILLING_LIVE_CHECKOUT_ENABLED: 'true',
  BILLING_TEST_CHECKOUT_ENABLED: 'true',
  STRIPE_SECRET_KEY: 'sk_test_FAKE_NEVER_DEPLOY',
  STRIPE_PRICE_CSV_TIDY_PRO: 'price_FAKE_NEVER_DEPLOY',
  ASSETS: {
    async fetch(request) {
      assert.equal(new URL(request.url).pathname, '/config/billing/products.json');
      return new Response(JSON.stringify(config), {
        status: 200, headers: { 'content-type': 'application/json' }
      });
    }
  }
};
let tests = 0;
const pass = message => {
  tests++;
  console.log('PASS ' + message);
};
const rowCount = () => Number(database.prepare('SELECT COUNT(*) AS n FROM billing_entitlements').get().n);
const readRow = id => database.prepare(
  'SELECT * FROM billing_entitlements WHERE stripe_checkout_session_id = ?'
).get(id);

function session(id, intent, overrides = {}) {
  return {
    id,
    payment_intent: intent,
    customer: 'cus_TEST',
    currency: 'jpy',
    amount_total: 1980,
    payment_status: 'paid',
    metadata: { productId, priceTierId },
    ...overrides
  };
}
async function postStripe(type, object, { signature = 'real', timestamp = Math.floor(Date.now()/1000), bodyOverride, customEnv = env } = {}) {
  const body = bodyOverride ?? JSON.stringify({
    id: 'evt_LOCAL_TEST', type, data: { object }
  });
  const digest = createHmac('sha256', secret)
    .update(String(timestamp) + '.' + body)
    .digest('hex');
  const header = signature === 'real' ? `t=${timestamp},v1=${digest}`
    : `t=${timestamp},v1=${'0'.repeat(64)}`;
  const response = await stripeWebhook({
    request: new Request('https://nicheworks.app/api/billing/stripe-webhook', {
      method: 'POST',
      headers: {
        'Stripe-Signature': header,
        'Content-Type': 'application/json'
      },
      body
    }),
    env: customEnv
  });
  return { status: response.status, value: await response.json() };
}
async function entitlement(sessionId, requestedProduct = productId, customEnv = env) {
  const url = new URL('https://nicheworks.app/api/billing/entitlement');
  url.searchParams.set('productId', requestedProduct);
  url.searchParams.set('sessionId', sessionId);
  const response = await lookupEntitlement({ request: new Request(url), env: customEnv });
  return { status: response.status, value: await response.json() };
}
async function checkout() {
  const response = await checkoutAttempt({
    request: new Request('https://nicheworks.app/api/billing/create-checkout-session', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId, returnPath: '/tools/csv-tidy/' })
    }),
    env
  });
  return { status: response.status, value: await response.json() };
}
const mainSession='cs_test_VALIDSESSION001';
const mainIntent='pi_TEST_VALID001';
let lookup = await entitlement(mainSession);
assert.equal(lookup.status, 200);
assert.equal(lookup.value.active, false);
assert.equal(rowCount(), 0);
pass('before payment the real entitlement endpoint returns inactive');

const checkoutResult = await checkout();
assert.equal(checkoutResult.status, 403);
assert.equal(checkoutResult.value.error, 'product_checkout_disabled');
pass('CSV Tidy product remains impossible to purchase even when global checkout flags are true');

let result = await postStripe('checkout.session.completed', session(mainSession,mainIntent), { signature:'wrong' });
assert.equal(result.status, 400);
assert.equal(result.value.error, 'webhook_signature_invalid');
assert.equal(rowCount(), 0);
pass('invalid Stripe HMAC rejects payment without writing a row');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent),{
  timestamp: Math.floor(Date.now()/1000)-1800
});
assert.equal(result.status, 400);
assert.equal(rowCount(), 0);
pass('stale signed webhook rejects and writes nothing');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent),{
  bodyOverride:'this is not json'
});
assert.equal(result.status, 400);
assert.equal(result.value.error,'webhook_payload_invalid');
assert.equal(rowCount(),0);
pass('signed malformed JSON rejects');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent,{
  payment_status:'unpaid'
}));
assert.equal(result.status,200);
assert.equal(result.value.entitlementIssued,false);
assert.equal(rowCount(),0);
pass('unpaid checkout never grants entitlement');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent,{
  amount_total:1981
}));
assert.equal(result.status,200);
assert.equal(result.value.entitlementIssued,false);
assert.equal(rowCount(),0);
pass('mismatched JPY total blocks entitlement');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent,{
  currency:'usd'
}));
assert.equal(result.value.entitlementIssued,false);
assert.equal(rowCount(),0);
pass('mismatched currency blocks entitlement');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent,{
  metadata:{productId:'nonexistent.product',priceTierId}
}));
assert.equal(result.status,400);
assert.equal(rowCount(),0);
pass('unknown product metadata never grants access');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent));
assert.equal(result.status,200,JSON.stringify(result));
assert.equal(result.value.entitlementIssued,true);
assert.equal(rowCount(),1);
const saved=readRow(mainSession);
assert.equal(saved.status,'active');
assert.equal(saved.stripe_payment_intent_id,mainIntent);
assert.deepEqual(JSON.parse(saved.features_json),expectedFeatures);
pass('signed paid checkout grants exactly one active SQLite entitlement with 3 product features');

lookup = await entitlement(mainSession);
assert.equal(lookup.status,200);
assert.equal(lookup.value.active,true);
assert.equal(lookup.value.source,'server');
assert.deepEqual(lookup.value.features,expectedFeatures);
pass('real entitlement endpoint finds verified active purchase by session ID');

lookup = await entitlement(mainSession,'reconcile.pro_v1');
assert.equal(lookup.status,200);
assert.equal(lookup.value.active,false);
lookup = await entitlement('cs_test_UNKNOWN');
assert.equal(lookup.status,200);
assert.equal(lookup.value.active,false);
pass('wrong product and unknown session cannot unlock access');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent));
assert.equal(result.status,200);
assert.equal(result.value.idempotent,true);
assert.equal(rowCount(),1);
pass('duplicate Stripe webhook is idempotent, no double-grant');

result = await postStripe('charge.refunded',{ payment_intent:mainIntent });
assert.equal(result.status,200);
assert.equal(result.value.entitlementUpdated,true);
assert.equal(readRow(mainSession).status,'refunded');
lookup = await entitlement(mainSession);
assert.equal(lookup.value.active,false);
pass('signed refund revokes the previously active SQL entitlement');

result = await postStripe('checkout.session.completed',session(mainSession,mainIntent));
assert.equal(result.status,200);
assert.equal(result.value.idempotent,true);
assert.equal(readRow(mainSession).status,'refunded');
pass('replayed original checkout event does not revive refunded purchase');

const disputeSession='cs_test_VALIDSESSION002';
const disputeIntent='pi_TEST_VALID002';
result = await postStripe('checkout.session.async_payment_succeeded',
  session(disputeSession,disputeIntent));
assert.equal(result.status,200);
assert.equal(readRow(disputeSession).status,'active');
result = await postStripe('charge.dispute.created',{ payment_intent: disputeIntent });
assert.equal(result.status,200);
assert.equal(result.value.entitlementUpdated,true);
assert.equal(readRow(disputeSession).status,'disputed');
lookup = await entitlement(disputeSession);
assert.equal(lookup.value.active,false);
pass('async success plus signed dispute revokes active entitlement');

const absent=await entitlement(mainSession,productId,{...env,BILLING_DB:null});
assert.equal(absent.status,503);
assert.equal(absent.value.error,'entitlement_storage_not_configured');
pass('missing Cloudflare D1 binding fails closed rather than granting access');

const cols=database.prepare('PRAGMA table_info(billing_entitlements)').all().map(x=>x.name);
assert.ok(cols.includes('features_json')&&cols.includes('stripe_checkout_session_id'));
assert.ok(!cols.includes('csv_contents')&&!cols.includes('raw_email'));
pass('actual SQL schema stores billing metadata, not source CSV or raw email');

database.close();
console.log('CSV Tidy billing signed webhook/D1 lifecycle: '+tests+' PASS / 0 FAIL');
