import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const configPath=process.env.PATTERN_DICTIONARY_AFFILIATE_CONFIG||path.join(root,'data','affiliate-config.json');
const trackingId=(process.argv[2]||'').trim();
const trackingIdPattern=/^[A-Za-z0-9][A-Za-z0-9_-]*-\d{2}$/;

if(!trackingId){
  console.error('Usage: node tools/pattern-dictionary/scripts/activate-amazon-affiliate.mjs <REAL_TRACKING_ID>');
  process.exit(2);
}
if(!trackingIdPattern.test(trackingId)){
  console.error('Refusing activation: tracking ID does not match the expected Amazon Associates form ending in -NN.');
  process.exit(2);
}

const cfg=JSON.parse(fs.readFileSync(configPath,'utf8'));
if(cfg.provider!=='amazon-jp'||cfg.marketplace!=='https://www.amazon.co.jp/'){
  throw new Error('Refusing activation: unexpected provider or marketplace.');
}
const ids=Object.keys(cfg.queries||{});
if(ids.length!==20)throw new Error(`Refusing activation: expected 20 pattern query records, got ${ids.length}.`);
for(const id of ids){
  const q=cfg.queries[id];
  if(!q?.ja||!q?.en)throw new Error(`Refusing activation: ${id} is missing JA/EN Amazon queries.`);
}

cfg.enabled=true;
cfg.tracking_id=trackingId;
cfg.updated=new Date().toISOString().slice(0,10);
cfg.activation_rule='Active only with the real NicheWorks Amazon Associates tracking ID. Every canonical pattern uses a pattern-specific Amazon.co.jp search-results link and must pass the active affiliate contract before release.';
fs.writeFileSync(configPath,JSON.stringify(cfg,null,2)+'\n');

console.log(`Activated Pattern Dictionary Amazon Associates config for 20/20 patterns with tracking ID ${trackingId}.`);
console.log('Next required command: node tools/pattern-dictionary/tests/affiliate-test.mjs --require-active');
