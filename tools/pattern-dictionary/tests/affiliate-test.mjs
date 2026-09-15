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
const offerIds=offers.map(x=>x.pattern_id).sort();

if(cfg.schema!=='pattern-dictionary-affiliate-v2')throw new Error('affiliate schema must be v2');
if(cfg.provider!=='amazon.co.jp')throw new Error('provider must be amazon.co.jp');
if(cfg.enabled!==true)throw new Error('canonical 20 Amazon affiliate surface must be active');
if(cfg.tracking_id!=='nicheworks09-22')throw new Error('Pattern Dictionary must reuse the maintained NicheWorks tracking ID');
if(cfg.shared_helper!=='/assets/amazon-affiliate.js')throw new Error('Pattern Dictionary must reuse the shared Amazon helper');
if(cfg.policy?.query_source!=='maintained_canonical_mapping_only'||cfg.policy?.free_text_forwarding!==false)throw new Error('Amazon destinations must be canonical mappings and never user free text');
if(JSON.stringify(ids)!==JSON.stringify(offerIds))throw new Error('affiliate offers must cover exactly canonical 20 patterns');
if(new Set(offers.map(x=>x.amazon_url)).size!==20)throw new Error('all 20 patterns must have distinct maintained Amazon destinations');
for(const offer of offers){
  if(offer.status!=='active')throw new Error(`${offer.pattern_id}: offer must be active`);
  if(!offer.query||!offer.label_ja||!offer.label_en)throw new Error(`${offer.pattern_id}: query and bilingual labels required`);
  const u=new URL(offer.amazon_url);
  if(u.protocol!=='https:'||u.hostname!=='www.amazon.co.jp'||u.pathname!=='/s')throw new Error(`${offer.pattern_id}: invalid Amazon.co.jp search URL`);
  if(u.searchParams.get('tag')!=='nicheworks09-22')throw new Error(`${offer.pattern_id}: wrong tracking tag`);
  if(!u.searchParams.get('k'))throw new Error(`${offer.pattern_id}: missing fixed search query`);
}
if(!app.includes('/assets/amazon-affiliate.js'))throw new Error('runtime must load shared Amazon helper');
if(!app.includes("tool:'pattern-dictionary'"))throw new Error('runtime must configure shared helper for Pattern Dictionary');
if(!app.includes("placement:'pattern-detail'"))throw new Error('runtime must use coarse fixed placement analytics');
if(app.includes('amazonSearchUrl('))throw new Error('runtime must not construct private affiliate URLs');
if(!helper.includes('affiliate_click'))throw new Error('shared helper must retain coarse affiliate click analytics');
if(!helper.includes('sponsored noopener'))throw new Error('shared helper must retain sponsored link semantics');
console.log('OK: Pattern Dictionary reuses the live NicheWorks Amazon contract with 20/20 distinct canonical tagged-search destinations.');
