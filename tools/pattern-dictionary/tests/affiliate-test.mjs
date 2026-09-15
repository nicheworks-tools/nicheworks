import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'data','affiliate-config.json'),'utf8'));
const patterns=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const ids=patterns.map(x=>x.id).sort();
const qids=Object.keys(cfg.queries||{}).sort();

if(cfg.provider!=='amazon-jp')throw new Error('affiliate provider must be amazon-jp');
if(cfg.link_strategy!=='search-results')throw new Error('affiliate links must use search-results strategy, not fixed SKUs');
if(cfg.enabled!==false)throw new Error('affiliate must remain disabled until a real tracking ID is configured');
if(cfg.tracking_id!=='')throw new Error('do not commit a fabricated or unknown Amazon tracking ID');
if(JSON.stringify(ids)!==JSON.stringify(qids))throw new Error('affiliate search query coverage must match canonical 20 patterns exactly');
if(!cfg.disclosure?.ja?.includes('Amazonのアソシエイトとして'))throw new Error('missing Japanese Amazon Associates disclosure');
if(!cfg.disclosure?.en?.includes('Amazon Associate'))throw new Error('missing English disclosure');
for(const [id,q] of Object.entries(cfg.queries)){
  if(!q.ja||!q.en)throw new Error(`${id}: missing bilingual search query`);
  if(/\b[A-Z0-9]{10}\b/.test(q.ja+q.en))throw new Error(`${id}: fixed ASIN-like product identifier is not allowed`);
}
if(!app.includes("data/affiliate-config.json"))throw new Error('runtime must load affiliate config');
if(!app.includes('affiliateActive'))throw new Error('runtime must gate Amazon links on explicit activation');
if(!app.includes('amazon.co.jp/s?k='))throw new Error('runtime must build Amazon search-result links');
if(!app.includes('cfg.disclosure'))throw new Error('runtime must show disclosure when affiliate links are active');
if(app.includes('Amazonアソシエイトはまだ有効化していません')||app.includes('Amazon Associates links are not active yet'))throw new Error('public runtime must not expose unfinished affiliate-status copy while disabled');
console.log('OK: Amazon affiliate flow covers 20/20 patterns, stays hidden while disabled, and is ready for activation with a real tracking ID.');
