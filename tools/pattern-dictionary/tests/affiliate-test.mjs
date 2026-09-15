import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'data','affiliate-config.json'),'utf8'));
const patterns=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const helper=fs.readFileSync(path.resolve(root,'../../assets/amazon-affiliate.js'),'utf8');
const ids=patterns.map(x=>x.id).sort();
const offers=cfg.offers||[];
const patternOfferIds=[...new Set(offers.map(x=>x.pattern_id))].sort();
const allowedIntents=new Set(['broad','apparel','material','accessory','home']);

if(cfg.schema!=='pattern-dictionary-affiliate-v3')throw new Error('affiliate schema must be v3');
if(cfg.provider!=='amazon.co.jp')throw new Error('provider must be amazon.co.jp');
if(cfg.enabled!==true)throw new Error('canonical 20 Amazon affiliate surface must be active');
if(cfg.tracking_id!=='nicheworks09-22')throw new Error('Pattern Dictionary must reuse the maintained NicheWorks tracking ID');
if(cfg.shared_helper!=='/assets/amazon-affiliate.js')throw new Error('Pattern Dictionary must reuse the shared Amazon helper');
if(cfg.policy?.query_source!=='maintained_canonical_mapping_only'||cfg.policy?.free_text_forwarding!==false)throw new Error('Amazon destinations must be canonical mappings and never user free text');
if(JSON.stringify(ids)!==JSON.stringify(patternOfferIds))throw new Error('affiliate offers must cover exactly canonical 20 patterns');
if(offers.length!==65)throw new Error(`expected 65 maintained intent links, got ${offers.length}`);
if(new Set(offers.map(x=>x.offer_id)).size!==offers.length)throw new Error('offer IDs must be unique');
if(new Set(offers.map(x=>x.amazon_url)).size!==offers.length)throw new Error('Amazon destinations must be unique');

for(const id of ids){
  const group=offers.filter(x=>x.pattern_id===id).sort((a,b)=>a.priority-b.priority);
  if(group.length<2||group.length>4)throw new Error(`${id}: expected 2-4 commerce links, got ${group.length}`);
  if(group.filter(x=>x.intent==='broad').length!==1)throw new Error(`${id}: exactly one broad link required`);
  if(group[0].intent!=='broad'||group[0].priority!==1)throw new Error(`${id}: broad link must be priority 1`);
  if(new Set(group.map(x=>x.priority)).size!==group.length)throw new Error(`${id}: priorities must be unique`);
}
for(const offer of offers){
  if(offer.status!=='active')throw new Error(`${offer.offer_id}: offer must be active`);
  if(!allowedIntents.has(offer.intent))throw new Error(`${offer.offer_id}: invalid commerce intent ${offer.intent}`);
  if(!Number.isInteger(offer.priority)||offer.priority<1||offer.priority>4)throw new Error(`${offer.offer_id}: invalid priority`);
  if(!offer.query||!offer.label_ja||!offer.label_en)throw new Error(`${offer.offer_id}: query and bilingual labels required`);
  const u=new URL(offer.amazon_url);
  if(u.protocol!=='https:'||u.hostname!=='www.amazon.co.jp'||u.pathname!=='/s')throw new Error(`${offer.offer_id}: invalid Amazon.co.jp search URL`);
  if(u.searchParams.get('tag')!=='nicheworks09-22')throw new Error(`${offer.offer_id}: wrong tracking tag`);
  if(u.searchParams.get('k')!==offer.query)throw new Error(`${offer.offer_id}: URL query must exactly match maintained query`);
}
if(!app.includes('/assets/amazon-affiliate.js'))throw new Error('runtime must load shared Amazon helper');
if(!app.includes("tool:'pattern-dictionary'"))throw new Error('runtime must configure shared helper for Pattern Dictionary');
if(!app.includes("placement:'pattern-detail'"))throw new Error('runtime must use coarse fixed placement analytics');
if(!app.includes('pd-amazon-links'))throw new Error('runtime must render the multi-intent Amazon link group');
if(!app.includes('offer.offer_id'))throw new Error('runtime must mount links by maintained offer ID');
if(app.includes('amazonSearchUrl('))throw new Error('runtime must not construct private affiliate URLs');
if(!helper.includes('affiliate_click'))throw new Error('shared helper must retain coarse affiliate click analytics');
if(!helper.includes('sponsored noopener'))throw new Error('shared helper must retain sponsored link semantics');
console.log('OK: Pattern Dictionary exposes 65 maintained Amazon intent links across 20 patterns, with 2-4 fixed links per pattern and no free-text forwarding.');
