import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'data','affiliate-config.json'),'utf8'));
const patterns=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const helper=fs.readFileSync(path.resolve(root,'../../assets/amazon-affiliate.js'),'utf8');
const ids=patterns.map(x=>x.id).sort(),offers=cfg.offers||[],patternOfferIds=[...new Set(offers.map(x=>x.pattern_id))].sort();
const allowedIntents=new Set(['broad','apparel','material','accessory','home']);

if(patterns.length!==100)throw new Error(`runtime must contain 100 patterns, got ${patterns.length}`);
if(cfg.schema!=='pattern-dictionary-affiliate-v3'||cfg.provider!=='amazon.co.jp'||cfg.enabled!==true)throw new Error('affiliate contract/provider/enabled state invalid');
if(cfg.tracking_id!=='nicheworks09-22'||cfg.shared_helper!=='/assets/amazon-affiliate.js')throw new Error('Pattern Dictionary must reuse the maintained NicheWorks Amazon helper/tag');
if(cfg.policy?.query_source!=='maintained_canonical_mapping_only'||cfg.policy?.free_text_forwarding!==false)throw new Error('Amazon destinations must be maintained mappings and never user free text');
if(JSON.stringify(ids)!==JSON.stringify(patternOfferIds))throw new Error('affiliate offers must cover exactly the published 100 patterns');
if(new Set(offers.map(x=>x.offer_id)).size!==offers.length)throw new Error('offer IDs must be unique');
if(new Set(offers.map(x=>x.amazon_url)).size!==offers.length)throw new Error('Amazon destinations must be unique');
for(const id of ids){
  const group=offers.filter(x=>x.pattern_id===id).sort((a,b)=>a.priority-b.priority);
  if(group.length<2||group.length>4)throw new Error(`${id}: expected 2-4 commerce links, got ${group.length}`);
  if(group.filter(x=>x.intent==='broad').length!==1||group[0].intent!=='broad'||group[0].priority!==1)throw new Error(`${id}: exactly one priority-1 broad link required`);
  if(new Set(group.map(x=>x.priority)).size!==group.length)throw new Error(`${id}: priorities must be unique`);
}
for(const offer of offers){
  if(offer.status!=='active'||!allowedIntents.has(offer.intent))throw new Error(`${offer.offer_id}: invalid active/intent state`);
  if(!Number.isInteger(offer.priority)||offer.priority<1||offer.priority>4||!offer.query||!offer.label_ja||!offer.label_en)throw new Error(`${offer.offer_id}: incomplete offer contract`);
  const u=new URL(offer.amazon_url);
  if(u.protocol!=='https:'||u.hostname!=='www.amazon.co.jp'||u.pathname!=='/s')throw new Error(`${offer.offer_id}: invalid Amazon.co.jp search URL`);
  if(u.searchParams.get('tag')!=='nicheworks09-22'||u.searchParams.get('k')!==offer.query)throw new Error(`${offer.offer_id}: URL query/tag mismatch`);
}
const wave4=new Set(['baroque-scroll','chinoiserie','flame-stitch','tree-of-life','moire','yagasuri','sayagata','uroko','tatewaku','kagome','kanoko','hanabishi','same-komon','nami-chidori','tomoe','shibori','batik','bandhani','ajrakh','kalamkari']);
for(const id of wave4)if(offers.filter(x=>x.pattern_id===id).length!==3)throw new Error(`${id}: Wave 4 must publish exactly three maintained commerce intents`);
const wave5=new Set(['suzani','kente','bogolan','adire','kuba-cloth','sashiko','kantha','otomi-embroidery','african-wax-print','block-print','zebra-print','tiger-print','snake-print','cow-print','giraffe-print','dalmatian-spots','camouflage','tie-dye','marbling','terrazzo']);
for(const id of wave5)if(offers.filter(x=>x.pattern_id===id).length!==3)throw new Error(`${id}: Wave 5 must publish exactly three maintained commerce intents`);
if(offers.length!==305)throw new Error(`100-pattern publication should contain 305 maintained links after adding exactly 60 Wave 5 links; got ${offers.length}`);
if(!app.includes('/assets/amazon-affiliate.js')||!app.includes("tool:'pattern-dictionary'")||!app.includes("placement:'pattern-detail'")||!app.includes('pd-amazon-links')||!app.includes('offer.offer_id'))throw new Error('runtime Amazon wiring incomplete');
if(app.includes('amazonSearchUrl('))throw new Error('runtime must not construct private affiliate URLs');
if(!helper.includes('affiliate_outbound')||!helper.includes('sponsored noopener'))throw new Error('shared helper analytics/sponsored semantics changed');
console.log(`OK: Pattern Dictionary exposes ${offers.length} maintained Amazon intent links across 100 published patterns, including exactly 60 Wave 5 links, with no free-text forwarding.`);
