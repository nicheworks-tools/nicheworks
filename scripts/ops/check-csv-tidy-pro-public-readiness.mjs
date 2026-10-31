// Read-only public preflight. Never submit a real checkout token or create a payment.
const origin = 'https://nicheworks.app';
const findings = [];
function record(component, state, detail) {
  findings.push({component,state,detail});
  console.log(state+' '+component+': '+detail);
}
async function get(path) {
  try {
    const res=await fetch(origin+path, {
      method:'GET', redirect:'follow',cache:'no-store',signal:AbortSignal.timeout(15000),
      headers:{Accept:'application/json, text/html;q=0.8'}
    });
    return {status:res.status,body:(await res.text()).slice(0,200000)};
  } catch(err) {
    return {status:0,body:'',error:err?.name==='TimeoutError'?'timeout':'network_error'};
  }
}
const catalog=await get('/config/billing/products.json');
let cfg;
try {cfg=JSON.parse(catalog.body);} catch {}
const product=cfg?.products?.find?.(p=>p.productId==='csv_tidy.pro_v1');
if(catalog.status===200 && product?.checkout?.enabled===false &&
   product?.stripe?.mode==='not_connected')
  record('catalog','PASS','PRO_REGISTERED_AND_PURCHASES_DISABLED');
else
  record('catalog','BLOCKED','http_'+catalog.status+'_CONFIG_MISSING_OR_CHECKOUT_UNSAFE');

const recovery=await get('/billing/restore.html');
if(recovery.status===200 && recovery.body.includes('id="recoveryForm"') &&
  recovery.body.includes('activateFromSession') &&
  !recovery.body.includes('googletagmanager.com'))
  record('recovery','PASS','RESTORE_PAGE_DEPLOYED_NO_ANALYTICS');
else record('recovery','BLOCKED','http_'+recovery.status+'_RESTORE_PAGE_NOT_VERIFIED');

const success=await get('/billing/success.html');
if(success.status===200 && success.body.includes('id="recoveryBox"') &&
  success.body.includes('history.replaceState') &&
  !success.body.includes('googletagmanager.com'))
  record('checkout_privacy','PASS','PURCHASE_SESSION_REMOVED_FROM_URL_NO_ANALYTICS');
else record('checkout_privacy','BLOCKED','http_'+success.status+'_SUCCESS_PAGE_NOT_VERIFIED');

const pro=await get('/tools/csv-tidy/pro/ui.mjs');
if(pro.status===200 && pro.body.includes('csv_tidy.pro_v1') &&
  pro.body.includes('checkEntitlement'))
  record('pro_ui','PASS','ENTITLEMENT_GATED_CODE_DEPLOYED');
else record('pro_ui','BLOCKED','http_'+pro.status+'_PRO_UI_NOT_VERIFIED');

// Deliberately nonexistent but correctly formatted test session: read-only SQL SELECT.
const lookup=await get('/api/billing/entitlement?productId=csv_tidy.pro_v1&sessionId=cs_test_PUBLICREADONLYPROBE20261101');
let data;
try {data=JSON.parse(lookup.body);} catch {}
if(lookup.status===200 && data?.ok===true &&
  data?.active===false && data?.productId==='csv_tidy.pro_v1')
  record('d1_lookup','PASS','D1_QUERY_EXECUTED_UNKNOWN_SESSION_REJECTED');
else if(lookup.status===503 && data?.error==='entitlement_storage_not_configured')
  record('d1_lookup','BLOCKED','BILLING_DB_BINDING_MISSING');
else if(lookup.status===503 && data?.error==='products_config_unavailable')
  record('d1_lookup','BLOCKED','PRODUCTS_CONFIG_NOT_LOADED');
else if(lookup.status===500)
  record('d1_lookup','BLOCKED','D1_OR_FUNCTION_DATABASE_QUERY_FAILED');
else record('d1_lookup','BLOCKED','http_'+lookup.status+'_'+String(data?.error||lookup.error||'API_UNVERIFIED'));

const blocked=findings.filter(x=>x.state!=='PASS');
console.log('PUBLIC_READINESS_REPORT '+JSON.stringify({
  checks:findings.length,passed:findings.length-blocked.length,blocked:blocked.length,
  publicChecksPass:blocked.length===0,
  stripeTestCheckoutVerified:false,
  actualCloudflareD1WriteVerified:false,
  liveCheckoutEnabled:false
}));
if(blocked.length)process.exitCode=1;
