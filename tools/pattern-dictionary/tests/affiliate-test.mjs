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
const requireActive=process.argv.includes('--require-active');
const trackingIdPattern=/^[A-Za-z0-9][A-Za-z0-9_-]*-\d{2}$/;

if(cfg.provider!=='amazon-jp')throw new Error('affiliate provider must be amazon-jp');
if(cfg.marketplace!=='https://www.amazon.co.jp/')throw new Error('affiliate marketplace must be Amazon.co.jp');
if(cfg.link_strategy!=='search-results')throw new Error('affiliate links must use search-results strategy, not fixed SKUs');
if(typeof cfg.enabled!=='boolean')throw new Error('affiliate enabled must be boolean');
if(JSON.stringify(ids)!==JSON.stringify(qids))throw new Error('affiliate search query coverage must match canonical 20 patterns exactly');
if(!cfg.disclosure?.ja?.includes('Amazonのアソシエイトとして'))throw new Error('missing Japanese Amazon Associates disclosure');
if(!cfg.disclosure?.en?.includes('Amazon Associate'))throw new Error('missing English disclosure');

for(const [id,q] of Object.entries(cfg.queries)){
  if(!q.ja||!q.en)throw new Error(`${id}: missing bilingual search query`);
  if(/\b[A-Z0-9]{10}\b/.test(q.ja+q.en))throw new Error(`${id}: fixed ASIN-like product identifier is not allowed`);
}

if(cfg.enabled){
  if(!trackingIdPattern.test(cfg.tracking_id||''))throw new Error('enabled affiliate config requires a valid-looking Amazon Associates tracking ID');
  const generated=[];
  for(const id of ids){
    for(const lang of ['ja','en']){
      const query=cfg.queries[id][lang];
      const url=new URL('https://www.amazon.co.jp/s');
      url.searchParams.set('k',query);
      url.searchParams.set('tag',cfg.tracking_id);
      if(url.hostname!=='www.amazon.co.jp')throw new Error(`${id}/${lang}: wrong Amazon host`);
      if(url.searchParams.get('tag')!==cfg.tracking_id)throw new Error(`${id}/${lang}: missing tracking tag`);
      generated.push(url.toString());
    }
  }
  if(generated.length!==40)throw new Error(`expected 40 bilingual generated URLs, got ${generated.length}`);
}else{
  if(cfg.tracking_id!=='')throw new Error('disabled affiliate config must not retain a tracking ID');
}

if(requireActive&&!cfg.enabled)throw new Error('final commerce gate requires affiliate enabled=true with the real tracking ID');
if(!app.includes("data/affiliate-config.json"))throw new Error('runtime must load affiliate config');
if(!app.includes('affiliateActive'))throw new Error('runtime must gate Amazon links on explicit activation');
if(!app.includes('amazon.co.jp/s?k='))throw new Error('runtime must build Amazon search-result links');
if(!app.includes('cfg.disclosure'))throw new Error('runtime must show disclosure when affiliate links are active');
if(!app.includes('sponsored nofollow noopener'))throw new Error('runtime Amazon link must include sponsored nofollow noopener');
if(app.includes('Amazonアソシエイトはまだ有効化していません')||app.includes('Amazon Associates links are not active yet'))throw new Error('public runtime must not expose unfinished affiliate-status copy while disabled');

const state=cfg.enabled?'ACTIVE':'READY-DISABLED';
console.log(`OK: Amazon affiliate flow is ${state}; canonical coverage is 20/20 patterns and 40 bilingual search-link targets.`);
