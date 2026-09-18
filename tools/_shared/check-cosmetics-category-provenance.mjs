import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');

const DATA_FILES = [
  'tools/inci-fastscan/data/ingredients.json',
  'tools/inci-fastscan/data/ingredients-extra-1.json',
  'tools/inci-fastscan/data/ingredients-extra-2.json',
  'tools/inci-fastscan/data/ingredients-extra-3.json',
  'tools/inci-fastscan/data/ingredients-extra-4.json',
  'tools/inci-fastscan/data/ingredients-extra-5.json',
  'tools/inci-fastscan/data/ingredients-extra-6.json',
  'tools/inci-fastscan/data/ingredients-extra-7.json',
  'tools/inci-fastscan/data/ingredients-extra-8.json'
];

const EXPECTED_WAVE1 = Object.freeze({ water:'solvent', glycerin:'humectant', 'propylene glycol':'humectant', phenoxyethanol:'preservative', carbomer:'thickener' });
const EXPECTED_WAVE2 = Object.freeze({ 'citric acid':'pH adjuster', tocopherol:'antioxidant' });
const EXPECTED_WAVE3 = Object.freeze({ 'sodium chloride':'viscosity adjuster', 'disodium edta':'chelating agent' });
const EXPECTED_WAVE4 = Object.freeze({ 'tocopheryl acetate':'antioxidant' });
const EXPECTED_WAVE5 = Object.freeze({ 'butylene glycol':'solvent', 'dipropylene glycol':'solvent', 'sodium hydroxide':'pH adjuster' });
const EXPECTED_WAVE6 = Object.freeze({ 'aminomethyl propanol':'pH adjuster', triethanolamine:'pH adjuster', 'potassium hydroxide':'pH adjuster' });
const EXPECTED_WAVE7 = Object.freeze({ bht:'antioxidant', betaine:'humectant', 'pentylene glycol':'solvent' });
const EXPECTED_WAVE8 = Object.freeze({ propanediol:'humectant', '1,2-hexanediol':'solvent', alcohol:'solvent' });
const EXPECTED_WAVE9 = Object.freeze({ 'ascorbyl palmitate':'antioxidant' });
const EXPECTED_WAVE10 = Object.freeze({ 'sodium gluconate':'chelating agent', 'xanthan gum':'viscosity adjuster' });
const EXPECTED_WAVE11 = Object.freeze({ ethylhexylglycerin:'skin conditioning', squalane:'emollient', 'sodium cocoyl glutamate':'cleanser', dimethicone:'skin conditioning' });
const EXPECTED_WAVE12 = Object.freeze({ 'cetearyl alcohol':'emollient', 'cetyl alcohol':'emollient', 'disodium lauryl sulfosuccinate':'cleanser', 'hydrogenated polyisobutene':'emollient' });
const EXPECTED_WAVE13 = Object.freeze({ 'cetearyl olivate':'emollient', 'stearyl alcohol':'emollient', 'sodium lauroyl glutamate':'cleanser', 'sodium coco-sulfate':'cleanser' });
const EXPECTED_WAVE14 = Object.freeze({ 'polysorbate 80':'emulsifier', 'sorbitan olivate':'emulsifier', 'steareth-2':'emulsifier', 'steareth-21':'emulsifier' });
const EXPECTED_WAVE15 = Object.freeze({ 'caprylyl glycol':'emollient', 'ceramide np':'skin conditioning', cholesterol:'emollient', 'hexylene glycol':'solvent' });
const EXPECTED_WAVE15_LEGACY_CATEGORIES = Object.freeze({ 'caprylyl glycol':['preservative booster'], 'ceramide np':['barrier lipid'], cholesterol:['barrier lipid'], 'hexylene glycol':['general'] });
const EXPECTED_WAVE16 = Object.freeze({ hydroxyacetophenone:'antioxidant', 'palmitic acid':'emollient', 'stearic acid':'cleanser', 'myristic acid':'cleanser' });
const EXPECTED_WAVE16_LEGACY_CATEGORIES = Object.freeze({ hydroxyacetophenone:['preservative booster'], 'palmitic acid':['general'], 'stearic acid':['general'], 'myristic acid':['general'] });
const EXPECTED_WAVE17 = Object.freeze({ niacinamide:'smoothing' });
const EXPECTED_WAVE18 = Object.freeze({ 'hydroxyethyl acrylate/sodium acryloyldimethyl taurate copolymer':'viscosity adjuster', 'ammonium polyacryloyldimethyl taurate':'viscosity adjuster', 'ethylhexyl methoxycrylene':'skin conditioning', 'glyceryl stearate se':'emulsifier' });
const EXPECTED_WAVE18_LEGACY_CATEGORIES = Object.freeze({ 'hydroxyethyl acrylate/sodium acryloyldimethyl taurate copolymer':['general'], 'ammonium polyacryloyldimethyl taurate':['polymer'], 'ethylhexyl methoxycrylene':['general'] });
const EXPECTED_WAVE19 = Object.freeze({ 'polyacrylate crosspolymer-6':'viscosity adjuster', 'polyhydroxystearic acid':'emulsifier', 'potassium cetyl phosphate':'emulsifier', 'sorbitan isostearate':'emulsifier' });
const EXPECTED_WAVE19_LEGACY_CATEGORIES = Object.freeze({ 'polyacrylate crosspolymer-6':['polymer'], 'polyhydroxystearic acid':['general'], 'potassium cetyl phosphate':['general'], 'sorbitan isostearate':['general'] });
const EXPECTED_WAVE20 = Object.freeze({ 'ceramide ap':'skin conditioning', 'ceramide eop':'skin conditioning', phytosphingosine:'skin conditioning' });
const EXPECTED_WAVE20_LEGACY_CATEGORIES = Object.freeze({ 'ceramide ap':['barrier lipid'], 'ceramide eop':['barrier lipid'] });
const EXPECTED_WAVE21 = Object.freeze({ silica:'viscosity adjuster', alumina:'viscosity adjuster', 'aluminum stearate':'viscosity adjuster', 'dimethicone crosspolymer':'viscosity adjuster', 'glycol distearate':'emulsifier', 'myristyl myristate':'emollient', lecithin:'emulsifier' });
const EXPECTED_WAVE21_LEGACY_CATEGORIES = Object.freeze({ silica:['powder'], alumina:['powder'], 'aluminum stearate':['powder'], 'dimethicone crosspolymer':['texture polymer'], 'glycol distearate':['general'], 'myristyl myristate':['general'] });
const EXPECTED_WAVE22 = Object.freeze({ 'calcium gluconate':'chelating agent', 'ceramide as':'skin conditioning', 'ceramide ng':'skin conditioning', 'glyceryl acrylate/acrylic acid copolymer':'humectant', hectorite:'viscosity adjuster', 'tapioca starch':'viscosity adjuster' });
const EXPECTED_WAVE22_LEGACY_CATEGORIES = Object.freeze({ 'calcium gluconate':['general'], 'ceramide as':['barrier lipid'], 'ceramide ng':['barrier lipid'], 'glyceryl acrylate/acrylic acid copolymer':['general'], hectorite:['general'], 'tapioca starch':['powder'] });
const EXPECTED_WAVE23 = Object.freeze({ 'helianthus annuus sunflower seed wax':'skin conditioning', 'melaleuca alternifolia tea tree leaf oil':'antioxidant', 'peg-120 methyl glucose dioleate':'emulsifier', 'peg-30 dipolyhydroxystearate':'emulsifier', 'pentaerythrityl tetraethylhexanoate':'emollient', 'polyacrylate crosspolymer-11':'viscosity adjuster', 'polyglyceryl-4 caprate':'emulsifier', sphingolipids:'skin conditioning' });
const EXPECTED_WAVE23_LEGACY_CATEGORIES = Object.freeze({ 'helianthus annuus sunflower seed wax':['texture agent'], 'melaleuca alternifolia tea tree leaf oil':['essential oil'], 'peg-120 methyl glucose dioleate':['general'], 'peg-30 dipolyhydroxystearate':['general'], 'pentaerythrityl tetraethylhexanoate':['general'], 'polyacrylate crosspolymer-11':['polymer'], sphingolipids:['barrier lipid'] });
const EXPECTED_WAVE24 = Object.freeze({ 'polyglyceryl-10 oleate':'skin conditioning', 'gluconic acid':'chelating agent', 'peg-40 hydrogenated castor oil':'emulsifier', 'sodium carbonate':'buffer', sulisobenzone:'uv filter', 'benzyl alcohol':'preservative', urea:'humectant', 'glyceryl caprate':'emollient', 'polysilicone-15':'uv filter', 'drometrizole trisiloxane':'uv filter' });
const EXPECTED_WAVE24_LEGACY_CATEGORIES = Object.freeze({ 'peg-40 hydrogenated castor oil':['solubilizer'], 'benzyl alcohol':['preservative','fragrance'], urea:['active','humectant'] });
const EXPECTED_WAVE24_MIXED_MISSING = new Set(['benzyl alcohol','urea']);
const EXPECTED_WAVE25 = Object.freeze({ limonene:'fragrance', linalool:'fragrance', citral:'fragrance', geraniol:'fragrance', citronellol:'fragrance', eugenol:'fragrance', coumarin:'fragrance', farnesol:'fragrance', 'hexyl cinnamal':'fragrance', 'alpha-isomethyl ionone':'fragrance' });
const EXPECTED_WAVE25_LEGACY_CATEGORIES = Object.freeze(Object.fromEntries(Object.keys(EXPECTED_WAVE25).map((canonical)=>[canonical,['fragrance allergen']])));
const EXPECTED_OFFICIAL_LABEL_CLOSURE = Object.freeze({ triethoxycaprylylsilane:'binder', 'p-anisic acid':'fragrance', 'polyquaternium-39':'film former', 'polyquaternium-53':'hair conditioning', 'ppg-5-ceteth-20':'emulsifier', 'snail secretion filtrate':'skin conditioning', 'synthetic beeswax':'viscosity adjuster', 'hexadecyloxy pg hydroxyethyl hexadecanamide':'moisturizer', 'peg-6 caprylic/capric glycerides':'emulsifier', 'sodium lauroyl lactylate':'emulsifier', 'zinc oxide':'uv filter', 'zea mays starch':'viscosity adjuster', 'peg-8':'humectant', 'microcrystalline wax':'viscosity adjuster' });
const EXPECTED_OFFICIAL_LABEL_CLOSURE_RAW = Object.freeze({ triethoxycaprylylsilane:['general'], 'p-anisic acid':['preservative support'], 'polyquaternium-39':['conditioning polymer'], 'polyquaternium-53':['conditioning polymer'], 'ppg-5-ceteth-20':['general'], 'snail secretion filtrate':['animal extract'], 'synthetic beeswax':['texture agent'], 'hexadecyloxy pg hydroxyethyl hexadecanamide':['barrier lipid'], 'peg-6 caprylic/capric glycerides':['surfactant','emulsifier'], 'sodium lauroyl lactylate':['surfactant','emulsifier'], 'zinc oxide':['uv filter','colorant'], 'zea mays starch':['powder'], 'peg-8':['humectant','solvent'], 'microcrystalline wax':['wax','texture agent'] });
const EXPECTED_STRONG_RUNTIME_CLOSURE = Object.freeze({ sulfur:'skin conditioning', 'aminobenzoic acid':'uv filter', 'ammonium hydroxide':'buffer' });
const EXPECTED_ALL = Object.freeze({ ...EXPECTED_WAVE1, ...EXPECTED_WAVE2, ...EXPECTED_WAVE3, ...EXPECTED_WAVE4, ...EXPECTED_WAVE5, ...EXPECTED_WAVE6, ...EXPECTED_WAVE7, ...EXPECTED_WAVE8, ...EXPECTED_WAVE9, ...EXPECTED_WAVE10, ...EXPECTED_WAVE11, ...EXPECTED_WAVE12, ...EXPECTED_WAVE13, ...EXPECTED_WAVE14, ...EXPECTED_WAVE15, ...EXPECTED_WAVE16, ...EXPECTED_WAVE17, ...EXPECTED_WAVE18, ...EXPECTED_WAVE19, ...EXPECTED_WAVE20, ...EXPECTED_WAVE21, ...EXPECTED_WAVE22, ...EXPECTED_WAVE23, ...EXPECTED_WAVE24, ...EXPECTED_WAVE25, ...EXPECTED_OFFICIAL_LABEL_CLOSURE, ...EXPECTED_STRONG_RUNTIME_CLOSURE });

const EXPECTED_SOURCES = Object.freeze({
  water:'https://www.cosmeticsinfo.org/ingredient/water/', glycerin:'https://www.cosmeticsinfo.org/ingredient/glycerin/', 'propylene glycol':'https://www.cosmeticsinfo.org/ingredient/propylene-glycol/',
  phenoxyethanol:'https://health.ec.europa.eu/publications/phenoxyethanol_en', carbomer:'https://www.cosmeticsinfo.org/ingredient/carbomer/', 'citric acid':'https://www.cosmeticsinfo.org/ingredient/citric-acid/', tocopherol:'https://www.cosmeticsinfo.org/ingredient/tocopherol/',
  'sodium chloride':'https://www.cosmeticsinfo.org/ingredient/sodium-chloride/', 'disodium edta':'https://www.cosmeticsinfo.org/ingredient/disodium-edta/', 'tocopheryl acetate':'https://www.cosmeticsinfo.org/ingredient/tocopherol/',
  'butylene glycol':'https://www.cosmeticsinfo.org/ingredient/dipropylene-glycol/', 'dipropylene glycol':'https://www.cosmeticsinfo.org/ingredient/dipropylene-glycol/', 'sodium hydroxide':'https://www.cosmeticsinfo.org/product/cuticle-oils-creams-and-lotions/',
  'aminomethyl propanol':'https://www.cosmeticsinfo.org/ingredient/aminomethyl-propanol/', triethanolamine:'https://www.cosmeticsinfo.org/ingredient/triethanolamine-and-tea-containing-ingredients/', 'potassium hydroxide':'https://www.cosmeticsinfo.org/product/cuticle-oils-creams-and-lotions/',
  bht:'https://cosmileeurope.eu/inci/detail/1672/bht/', betaine:'https://cosmileeurope.eu/inci/detail/1648/betaine/', 'pentylene glycol':'https://cosmileeurope.eu/inci/detail/11416/pentylene-glycol/',
  propanediol:'https://cosmileeurope.eu/inci/detail/13169/propanediol/', '1,2-hexanediol':'https://cosmileeurope.eu/inci/detail/5/1-2-hexanediol/', alcohol:'https://cosmileeurope.eu/inci/detail/590/alcohol/',
  'ascorbyl palmitate':'https://cosmileeurope.eu/inci/detail/1244/ascorbyl-palmitate/',
  'sodium gluconate':'https://cosmileeurope.eu/inci/detail/14787/sodium-gluconate/', 'xanthan gum':'https://cosmileeurope.eu/inci/detail/16999/xanthan-gum/',
  ethylhexylglycerin:'https://cosmileeurope.eu/inci/detail/5500/ethylhexylglycerin/', squalane:'https://cosmileeurope.eu/inci/detail/15418/squalane/',
  'sodium cocoyl glutamate':'https://cosmileeurope.eu/inci/detail/14710/sodium-cocoyl-glutamate/', dimethicone:'https://cosmileeurope.eu/inci/detail/4583/dimethicone/',
  'cetearyl alcohol':'https://cosmileeurope.eu/inci/detail/2895/cetearyl-alcohol/', 'cetyl alcohol':'https://cosmileeurope.eu/inci/detail/2973/cetyl-alcohol/',
  'disodium lauryl sulfosuccinate':'https://cosmileeurope.eu/inci/detail/4979/disodium-lauryl-sulfosuccinate/', 'hydrogenated polyisobutene':'https://cosmileeurope.eu/inci/detail/6702/hydrogenated-polyisobutene/',
  'cetearyl olivate':'https://cosmileeurope.eu/inci/detail/2907/cetearyl-olivate/', 'stearyl alcohol':'https://cosmileeurope.eu/inci/detail/15539/stearyl-alcohol/',
  'sodium lauroyl glutamate':'https://cosmileeurope.eu/inci/detail/14885/sodium-lauroyl-glutamate/', 'sodium coco-sulfate':'https://cosmileeurope.eu/inci/detail/14690/sodium-coco-sulfate/',
  'polysorbate 80':'https://cosmileeurope.eu/inci/detail/12497/polysorbate-80/', 'sorbitan olivate':'https://cosmileeurope.eu/inci/detail/15312/sorbitan-olivate/',
  'steareth-2':'https://cosmileeurope.eu/inci/detail/15492/steareth-2/', 'steareth-21':'https://cosmileeurope.eu/inci/detail/15496/steareth-21/',
  'caprylyl glycol':'https://cosmileeurope.eu/inci/detail/2612/caprylyl-glycol/', 'ceramide np':'https://cosmileeurope.eu/inci/detail/25522/ceramide-np/',
  cholesterol:'https://cosmileeurope.eu/inci/detail/3117/cholesterol/', 'hexylene glycol':'https://cosmileeurope.eu/inci/detail/6450/hexylene-glycol/',
  hydroxyacetophenone:'https://cosmileeurope.eu/inci/detail/17301/hydroxyacetophenone/', 'palmitic acid':'https://cosmileeurope.eu/inci/detail/10137/palmitic-acid/',
  'stearic acid':'https://cosmileeurope.eu/inci/detail/15514/stearic-acid/', 'myristic acid':'https://cosmileeurope.eu/inci/detail/9266/myristic-acid/',
  niacinamide:'https://cosmileeurope.eu/inci/detail/9443/niacinamide/',
  'hydroxyethyl acrylate/sodium acryloyldimethyl taurate copolymer':'https://cosmileeurope.eu/inci/detail/7079/hydroxyethyl-acrylate-sodium-acryloyldimethyl-taurate-copolymer/',
  'ammonium polyacryloyldimethyl taurate':'https://cosmileeurope.eu/inci/detail/933/ammonium-polyacryloyldimethyl-taurate/',
  'ethylhexyl methoxycrylene':'https://cosmileeurope.eu/inci/detail/5485/ethylhexyl-methoxycrylene/',
  'glyceryl stearate se':'https://cosmileeurope.eu/inci/detail/6059/glyceryl-stearate-se/',
  'polyacrylate crosspolymer-6':'https://cosmileeurope.eu/inci/detail/17882/polyacrylate-crosspolymer-6/',
  'polyhydroxystearic acid':'https://cosmileeurope.eu/inci/detail/12317/polyhydroxystearic-acid/',
  'potassium cetyl phosphate':'https://cosmileeurope.eu/inci/detail/12639/potassium-cetyl-phosphate/',
  'sorbitan isostearate':'https://cosmileeurope.eu/inci/detail/15309/sorbitan-isostearate/',
  'ceramide ap':'https://cosmileeurope.eu/inci/detail/2820/ceramide-ap/',
  'ceramide eop':'https://cosmileeurope.eu/inci/detail/25521/ceramide-eop/',
  phytosphingosine:'https://cosmileeurope.eu/inci/detail/11660/phytosphingosine/',
  silica:'https://cosmileeurope.eu/inci/detail/14425/silica/',
  alumina:'https://cosmileeurope.eu/inci/detail/738/alumina/',
  'aluminum stearate':'https://cosmileeurope.eu/inci/detail/792/aluminum-stearate/',
  'dimethicone crosspolymer':'https://cosmileeurope.eu/inci/detail/4584/dimethicone-crosspolymer/',
  'glycol distearate':'https://cosmileeurope.eu/inci/detail/6123/glycol-distearate/',
  'myristyl myristate':'https://cosmileeurope.eu/inci/detail/9328/myristyl-myristate/',
  lecithin:'https://cosmileeurope.eu/inci/detail/8209/lecithin/',
  'calcium gluconate':'https://cosmileeurope.eu/inci/detail/2389/calcium-gluconate/',
  'ceramide as':'https://cosmileeurope.eu/inci/detail/25520/ceramide-as/',
  'ceramide ng':'https://cosmileeurope.eu/inci/detail/21295/ceramide-ng/',
  'glyceryl acrylate/acrylic acid copolymer':'https://cosmileeurope.eu/inci/detail/5966/glyceryl-acrylate-acrylic-acid-copolymer/',
  hectorite:'https://cosmileeurope.eu/inci/detail/6288/hectorite/',
  'tapioca starch':'https://cosmileeurope.eu/inci/detail/15859/tapioca-starch/',
  'helianthus annuus sunflower seed wax':'https://cosmileeurope.eu/inci/detail/22005/helianthus-annuus-seed-wax/',
  'melaleuca alternifolia tea tree leaf oil':'https://cosmileeurope.eu/inci/detail/8748/melaleuca-alternifolia-leaf-oil/',
  'peg-120 methyl glucose dioleate':'https://cosmileeurope.eu/inci/detail/10422/peg-120-methyl-glucose-dioleate',
  'peg-30 dipolyhydroxystearate':'https://cosmileeurope.eu/inci/detail/10720/peg-30-dipolyhydroxystearate/',
  'pentaerythrityl tetraethylhexanoate':'https://cosmileeurope.eu/inci/detail/11370/pentaerythrityl-tetraethylhexanoate/',
  'polyacrylate crosspolymer-11':'https://cosmileeurope.eu/inci/detail/19988/polyacrylate-crosspolymer-11/',
  'polyglyceryl-4 caprate':'https://cosmileeurope.eu/inci/detail/12210/polyglyceryl-4-caprate/',
  sphingolipids:'https://cosmileeurope.eu/inci/detail/15386/sphingolipids',
  'polyglyceryl-10 oleate':'https://cosmileeurope.eu/inci/detail/12120/polyglyceryl-10-oleate/',
  'gluconic acid':'https://cosmileeurope.eu/inci/detail/5889/gluconic-acid/',
  'peg-40 hydrogenated castor oil':'https://cosmileeurope.eu/inci/detail/10814/peg-40-hydrogenated-castor-oil/',
  'sodium carbonate':'https://cosmileeurope.eu/inci/detail/14651/sodium-carbonate/',
  sulisobenzone:'https://cosmileeurope.eu/inci/detail/1578/benzophenone-4/',
  'benzyl alcohol':'https://cosmileeurope.eu/inci/detail/1592/benzyl-alcohol/',
  urea:'https://cosmileeurope.eu/inci/detail/16737/urea/',
  'glyceryl caprate':'https://cosmileeurope.eu/inci/detail/5976/glyceryl-caprate/',
  'polysilicone-15':'https://cosmileeurope.eu/inci/detail/12473/polysilicone-15/',
  'drometrizole trisiloxane':'https://cosmileeurope.eu/inci/detail/5138/drometrizole-trisiloxane/',
  limonene:'https://cosmileeurope.eu/inci/detail/8297/limonene/',
  linalool:'https://cosmileeurope.eu/inci/detail/8307/linalool/',
  citral:'https://cosmileeurope.eu/inci/detail/3373/citral/',
  geraniol:'https://cosmileeurope.eu/inci/detail/5834/geraniol/',
  citronellol:'https://cosmileeurope.eu/inci/detail/19208/citronellol',
  eugenol:'https://cosmileeurope.eu/inci/detail/5549/eugenol/',
  coumarin:'https://cosmileeurope.eu/inci/detail/19218/coumarin/',
  farnesol:'https://cosmileeurope.eu/inci/detail/5607/farnesol/',
  'hexyl cinnamal':'https://cosmileeurope.eu/inci/detail/19147/hexyl-cinnamal/',
  'alpha-isomethyl ionone':'https://cosmileeurope.eu/inci/detail/707/alpha-isomethyl-ionone/',
  triethoxycaprylylsilane:'https://cosmileeurope.eu/inci/detail/16387/triethoxycaprylylsilane/',
  'p-anisic acid':'https://cosmileeurope.eu/inci/detail/10050/p-anisic-acid',
  'polyquaternium-39':'https://cosmileeurope.eu/inci/detail/12405/polyquaternium-39/',
  'polyquaternium-53':'https://cosmileeurope.eu/inci/detail/12420/polyquaternium-53/',
  'ppg-5-ceteth-20':'https://cosmileeurope.eu/inci/detail/13095/ppg-5-ceteth-20/',
  'snail secretion filtrate':'https://kcia.or.kr/cid/search/ingd_view.php?no=6319',
  'synthetic beeswax':'https://cosmileeurope.eu/inci/detail/15761/synthetic-beeswax/',
  'hexadecyloxy pg hydroxyethyl hexadecanamide':'https://www.kao-kirei.com/ja/official/curel/special/26oilserum/',
  'peg-6 caprylic/capric glycerides':'https://cosmileeurope.eu/inci/detail/10945/peg-6-caprylic-capric-glycerides/',
  'sodium lauroyl lactylate':'https://cosmileeurope.eu/inci/detail/14891/sodium-lauroyl-lactylate/',
  'zinc oxide':'https://cosmileeurope.eu/inci/detail/17131/zinc-oxide/',
  'zea mays starch':'https://cosmileeurope.eu/inci/detail/17078/zea-mays-starch',
  'peg-8':'https://cosmileeurope.eu/inci/detail/11059/peg-8/',
  'microcrystalline wax':'https://cosmileeurope.eu/fr/inci/ingredient/22305/microcrystalline-wax/',
  sulfur:'https://cosmileeurope.eu/inci/detail/15709/sulfur/',
  'aminobenzoic acid':'https://eur-lex.europa.eu/eli/reg/2009/1223',
  'ammonium hydroxide':'https://cosmileeurope.eu/inci/detail/906/ammonium-hydroxide/'
});
const ALLOWED_SOURCE_HOSTS = new Set(['www.cosmeticsinfo.org','health.ec.europa.eu','cosmileeurope.eu','kcia.or.kr','www.kao-kirei.com','eur-lex.europa.eu']);

function normalizeText(value=''){ return String(value).normalize('NFKC').replace(/\s+/g,' ').trim(); }
function splitCategory(value=''){ return normalizeText(value).split(/\s*\/\s*/).map(normalizeText).filter(Boolean); }
function validHttpsSource(value){ try { const u=new URL(String(value||'').trim()); return u.protocol==='https:' && ALLOWED_SOURCE_HOSTS.has(u.hostname); } catch { return false; } }

const rows=DATA_FILES.flatMap((file)=>{ const payload=JSON.parse(fs.readFileSync(path.join(root,file),'utf8')); if(!Array.isArray(payload)) throw new Error(`${file}: dictionary payload must be an array`); return payload; });
const evidence=parser.verifiedCategoryEvidence||{};
assert.deepEqual(Object.fromEntries(Object.entries(evidence).map(([key,item])=>[key,item.category])),EXPECTED_ALL,'verified category evidence must remain the reviewed cumulative set including strong-runtime closure');
for(const ambiguous of parser.ambiguousExactKeys||[]) assert.equal(evidence[ambiguous],undefined,`ambiguous exact token must not receive category evidence: ${ambiguous}`);

const groups=new Map();
for(const row of rows){ const key=parser.canonicalIdentityKey(row.en); if(!key) continue; if(!groups.has(key)) groups.set(key,[]); groups.get(key).push(row); }
const rawMissingCategoryRows=rows.filter((row)=>!normalizeText(row.category)).length;
assert.equal(rawMissingCategoryRows,187,'verified overlay must not hide the frozen 187 raw category gaps by rewriting recognition records');

let newlyClassifiedCanonicalIdentities=0;
let wave6Resolved=0;
let wave7Resolved=0;
let wave8Resolved=0;
let wave9Resolved=0;
let wave10Resolved=0;
let wave11Resolved=0;
let wave12Resolved=0;
let wave13Resolved=0;
let wave14Resolved=0;
let wave15Reviewed=0;
let wave16Reviewed=0;
let wave17Resolved=0;
let wave18Reviewed=0;
let wave19Reviewed=0;
let wave20Reviewed=0;
let wave21Reviewed=0;
let wave22Reviewed=0;
let wave23Reviewed=0;
let wave24Reviewed=0;
let wave25Reviewed=0;
let officialLabelClosureReviewed=0;
let strongRuntimeClosureReviewed=0;
const rawCategoryInventory={};
for(const [canonical,expectedCategory] of Object.entries(EXPECTED_ALL)){
  const item=evidence[canonical];
  assert.ok(item,`missing verified category evidence: ${canonical}`);
  assert.equal(normalizeText(item.category),expectedCategory,`${canonical}: unexpected verified category`);
  assert.ok(normalizeText(item.authority),`${canonical}: authority label required`);
  assert.ok(Array.isArray(item.sources)&&item.sources.length>0,`${canonical}: at least one source required`);
  assert.ok(item.sources.every(validHttpsSource),`${canonical}: sources must be approved HTTPS authority URLs`);
  assert.ok(item.sources.includes(EXPECTED_SOURCES[canonical]),`${canonical}: reviewed source URL must remain attached`);
  assert.ok(groups.has(canonical),`${canonical}: evidence canonical must exist in maintained dictionary`);

  const canonicalRows=groups.get(canonical);
  const rawCategories=[...new Set(canonicalRows.flatMap((row)=>splitCategory(row.category)).map((category)=>category.toLowerCase()))];
  const hasRawMissing=canonicalRows.some((row)=>!normalizeText(row.category));
  rawCategoryInventory[canonical]=rawCategories;
  if(rawCategories.length===0) newlyClassifiedCanonicalIdentities+=1;
  if(rawCategories.length>0 && !Object.hasOwn(EXPECTED_WAVE15,canonical) && !Object.hasOwn(EXPECTED_WAVE16,canonical) && !Object.hasOwn(EXPECTED_WAVE18,canonical) && !Object.hasOwn(EXPECTED_WAVE19,canonical) && !Object.hasOwn(EXPECTED_WAVE20,canonical) && !Object.hasOwn(EXPECTED_WAVE21,canonical) && !Object.hasOwn(EXPECTED_WAVE22,canonical) && !Object.hasOwn(EXPECTED_WAVE23,canonical) && !Object.hasOwn(EXPECTED_WAVE24,canonical) && !Object.hasOwn(EXPECTED_WAVE25,canonical) && !Object.hasOwn(EXPECTED_OFFICIAL_LABEL_CLOSURE,canonical) && !Object.hasOwn(EXPECTED_STRONG_RUNTIME_CLOSURE,canonical)) assert.ok(rawCategories.includes(expectedCategory.toLowerCase()),`${canonical}: verified category conflicts with existing raw category metadata (${rawCategories.join(', ')})`);

  if(Object.hasOwn(EXPECTED_WAVE6,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 6 must resolve at least one raw missing-category row`);
    assert.deepEqual(rawCategories,[expectedCategory.toLowerCase()],`${canonical}: duplicate legacy category hint must exactly match reviewed category`);
    wave6Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE7,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 7 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 7 must be completely category-empty before overlay`);
    wave7Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE8,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 8 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 8 must be completely category-empty before overlay`);
    wave8Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE9,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 9 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 9 must be completely category-empty before overlay`);
    wave9Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE10,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 10 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 10 must be completely category-empty before overlay`);
    wave10Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE11,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 11 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 11 must be completely category-empty before overlay`);
    wave11Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE12,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 12 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 12 must be completely category-empty before overlay`);
    wave12Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE13,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 13 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 13 must be completely category-empty before overlay`);
    wave13Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE14,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 14 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 14 must be completely category-empty before overlay`);
    wave14Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE15,canonical)){
    assert.deepEqual(rawCategories,EXPECTED_WAVE15_LEGACY_CATEGORIES[canonical],`${canonical}: wave 15 must preserve the frozen unsupported legacy category hint for audit`);
    if(canonical !== 'hexylene glycol') assert.equal(hasRawMissing,true,`${canonical}: wave 15 duplicate group must retain its raw missing-category row`);
    else assert.equal(hasRawMissing,false,'hexylene glycol: wave 15 must document the existing unsupported general category rather than inventing a missing row');
    wave15Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE16,canonical)){
    assert.deepEqual(rawCategories,EXPECTED_WAVE16_LEGACY_CATEGORIES[canonical],`${canonical}: wave 16 must preserve the frozen unsupported legacy category hint for audit`);
    assert.equal(hasRawMissing,false,`${canonical}: wave 16 must document an existing unsupported legacy category rather than inventing a missing row`);
    wave16Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE17,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 17 must resolve the existing raw missing-category identity`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 17 must start from a completely category-empty raw canonical identity`);
    wave17Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE18,canonical)){
    if(canonical === 'glyceryl stearate se'){
      assert.equal(hasRawMissing,true,`${canonical}: wave 18 must resolve the existing raw missing-category identity`);
      assert.deepEqual(rawCategories,[],`${canonical}: wave 18 Glyceryl Stearate SE must start category-empty`);
    } else {
      assert.equal(hasRawMissing,false,`${canonical}: wave 18 must preserve the existing unsupported raw category without inventing a missing row`);
      assert.deepEqual(rawCategories,EXPECTED_WAVE18_LEGACY_CATEGORIES[canonical],`${canonical}: wave 18 must preserve the frozen unsupported legacy category hint for audit`);
    }
    wave18Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE19,canonical)){
    assert.equal(hasRawMissing,false,`${canonical}: wave 19 must preserve the existing unsupported raw category without inventing a missing row`);
    assert.deepEqual(rawCategories,EXPECTED_WAVE19_LEGACY_CATEGORIES[canonical],`${canonical}: wave 19 must preserve the frozen unsupported legacy category hint for audit`);
    wave19Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE20,canonical)){
    if(canonical === 'phytosphingosine'){
      assert.equal(hasRawMissing,true,`${canonical}: wave 20 must resolve the existing raw missing-category identity`);
      assert.deepEqual(rawCategories,[],`${canonical}: wave 20 Phytosphingosine must start category-empty`);
    } else {
      assert.equal(hasRawMissing,false,`${canonical}: wave 20 must preserve the existing unsupported raw category without inventing a missing row`);
      assert.deepEqual(rawCategories,EXPECTED_WAVE20_LEGACY_CATEGORIES[canonical],`${canonical}: wave 20 must preserve the frozen barrier-lipid hint for audit`);
    }
    wave20Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE21,canonical)){
    if(canonical === 'lecithin'){
      assert.equal(hasRawMissing,true,`${canonical}: wave 21 must resolve the existing raw missing-category identity`);
      assert.deepEqual(rawCategories,[],`${canonical}: wave 21 Lecithin must start category-empty`);
    } else {
      assert.equal(hasRawMissing,false,`${canonical}: wave 21 must preserve the existing unsupported raw category without inventing a missing row`);
      assert.deepEqual(rawCategories,EXPECTED_WAVE21_LEGACY_CATEGORIES[canonical],`${canonical}: wave 21 must preserve the frozen unsupported legacy category hint for audit`);
    }
    wave21Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE22,canonical)){
    assert.equal(hasRawMissing,false,`${canonical}: wave 22 must preserve the existing unsupported raw category without inventing a missing row`);
    assert.deepEqual(rawCategories,EXPECTED_WAVE22_LEGACY_CATEGORIES[canonical],`${canonical}: wave 22 must preserve the frozen unsupported legacy category hint for audit`);
    wave22Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE23,canonical)){
    if(canonical === 'polyglyceryl-4 caprate'){
      assert.equal(hasRawMissing,true,`${canonical}: wave 23 must resolve the existing raw missing-category identity`);
      assert.deepEqual(rawCategories,[],`${canonical}: wave 23 Polyglyceryl-4 Caprate must start category-empty`);
    } else {
      assert.equal(hasRawMissing,false,`${canonical}: wave 23 must preserve the existing unsupported raw category without inventing a missing row`);
      assert.deepEqual(rawCategories,EXPECTED_WAVE23_LEGACY_CATEGORIES[canonical],`${canonical}: wave 23 must preserve the frozen unsupported legacy category hint for audit`);
    }
    wave23Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE24,canonical)){
    if(Object.hasOwn(EXPECTED_WAVE24_LEGACY_CATEGORIES,canonical)){
      assert.equal(hasRawMissing,EXPECTED_WAVE24_MIXED_MISSING.has(canonical),`${canonical}: wave 24 raw missing-category state changed unexpectedly`);
      assert.deepEqual(rawCategories,EXPECTED_WAVE24_LEGACY_CATEGORIES[canonical],`${canonical}: wave 24 must preserve the frozen unsupported legacy category hint for audit`);
    } else {
      assert.equal(hasRawMissing,true,`${canonical}: wave 24 must resolve an existing raw missing-category identity`);
      assert.deepEqual(rawCategories,[],`${canonical}: wave 24 category-empty identity must remain raw-empty before overlay`);
    }
    wave24Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE25,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 25 must preserve the existing duplicate raw missing-category row alongside fragrance-allergen metadata`);
    assert.deepEqual(rawCategories,EXPECTED_WAVE25_LEGACY_CATEGORIES[canonical],`${canonical}: wave 25 must preserve fragrance-allergen as an auditable legacy label class`);
    wave25Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_OFFICIAL_LABEL_CLOSURE,canonical)){
    assert.equal(hasRawMissing,false,`${canonical}: official-label closure must preserve the existing non-empty raw category state`);
    assert.deepEqual(rawCategories,EXPECTED_OFFICIAL_LABEL_CLOSURE_RAW[canonical],`${canonical}: official-label closure must preserve the frozen raw category inventory`);
    officialLabelClosureReviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_STRONG_RUNTIME_CLOSURE,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: strong-runtime closure must resolve an existing raw missing-category identity`);
    assert.deepEqual(rawCategories,[],`${canonical}: strong-runtime closure must leave raw category data untouched`);
    strongRuntimeClosureReviewed+=1;
  }
}

const merged=parser.mergeDictionaryRecords(rows);
const mergedByCanonical=new Map(merged.map((item)=>[parser.canonicalIdentityKey(item.en),item]));
for(const [canonical,expectedCategory] of Object.entries(EXPECTED_ALL)){
  const item=mergedByCanonical.get(canonical);
  assert.ok(item,`${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.category_verified,true,`${canonical}: verified category flag must survive merge`);
  assert.ok(Array.isArray(item.category_sources)&&item.category_sources.length>0,`${canonical}: category sources must survive merge`);
  assert.ok(item.category_sources.every(validHttpsSource),`${canonical}: merged category sources must remain approved HTTPS URLs`);
  assert.ok(item.category_sources.includes(EXPECTED_SOURCES[canonical]),`${canonical}: reviewed source URL must survive merge`);
  assert.ok(Array.isArray(item.categories)&&item.categories.some((category)=>category.toLowerCase()===expectedCategory.toLowerCase()),`${canonical}: verified category must be present in merged functional categories`);
}

assert.equal(Object.keys(EXPECTED_WAVE10).length,2);
assert.equal(Object.keys(EXPECTED_WAVE11).length,4);
assert.equal(Object.keys(EXPECTED_WAVE12).length,4);
assert.equal(Object.keys(EXPECTED_WAVE13).length,4);
assert.equal(Object.keys(EXPECTED_WAVE14).length,4);
assert.equal(Object.keys(EXPECTED_WAVE15).length,4);
assert.equal(Object.keys(EXPECTED_WAVE16).length,4);
assert.equal(Object.keys(EXPECTED_WAVE17).length,1);
assert.equal(Object.keys(EXPECTED_WAVE18).length,4);
assert.equal(Object.keys(EXPECTED_WAVE19).length,4);
assert.equal(Object.keys(EXPECTED_WAVE20).length,3);
assert.equal(Object.keys(EXPECTED_WAVE21).length,7);
assert.equal(Object.keys(EXPECTED_WAVE22).length,6);
assert.equal(Object.keys(EXPECTED_WAVE23).length,8);
assert.equal(Object.keys(EXPECTED_WAVE24).length,10);
assert.equal(Object.keys(EXPECTED_WAVE25).length,10);
assert.equal(Object.keys(EXPECTED_OFFICIAL_LABEL_CLOSURE).length,14);
assert.equal(Object.keys(EXPECTED_STRONG_RUNTIME_CLOSURE).length,3);
assert.equal(wave6Resolved,3);
assert.equal(wave7Resolved,3);
assert.equal(wave8Resolved,3);
assert.equal(wave9Resolved,1);
assert.equal(wave10Resolved,2,'wave 10 must resolve exactly two completely category-empty canonical identities');
assert.equal(wave11Resolved,4,'wave 11 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave12Resolved,4,'wave 12 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave13Resolved,4,'wave 13 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave14Resolved,4,'wave 14 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave15Reviewed,4,'wave 15 must review exactly four unsupported legacy role categories');
assert.equal(wave16Reviewed,4,'wave 16 must review exactly four unsupported legacy role categories');
assert.equal(wave17Resolved,1,'wave 17 must resolve exactly one completely category-empty canonical identity');
assert.equal(wave18Reviewed,4,'wave 18 must review exactly four high-frequency public-role gaps');
assert.equal(wave19Reviewed,4,'wave 19 must review exactly four official-label public-role gaps');
assert.equal(wave20Reviewed,3,'wave 20 must review exactly three high-frequency ceramide/phytosphingosine public-role gaps');
assert.equal(wave21Reviewed,7,'wave 21 must review exactly seven official-label public-role gaps');
assert.equal(wave22Reviewed,6,'wave 22 must review exactly six official-label public-role gaps');
assert.equal(wave23Reviewed,8,'wave 23 must review exactly eight official-label public-role gaps');
assert.equal(wave24Reviewed,10,'wave 24 must review exactly ten source-backed public-role gaps');
assert.equal(wave25Reviewed,10,'wave 25 must review exactly ten fragrance-allergen legacy categories into source-backed fragrance roles');
assert.equal(officialLabelClosureReviewed,14,'official-label closure must review exactly fourteen additional recognized canonical identities');
assert.equal(strongRuntimeClosureReviewed,3,'strong-runtime closure must review exactly three verified-note role blockers');
assert.equal(evidence['sodium citrate'],undefined,'Sodium Citrate must remain deferred until buffer vs pH-adjuster taxonomy is explicitly resolved');

console.log(JSON.stringify({ status:'pass', phase:'category-provenance-strong-runtime-closure', raw_missing_category_rows_unchanged:rawMissingCategoryRows, verified_category_evidence_canonical_identities:Object.keys(EXPECTED_ALL).length, wave_10_verified_canonical_identities:Object.keys(EXPECTED_WAVE10).length, wave_11_verified_canonical_identities:Object.keys(EXPECTED_WAVE11).length, wave_12_verified_canonical_identities:Object.keys(EXPECTED_WAVE12).length, wave_13_verified_canonical_identities:Object.keys(EXPECTED_WAVE13).length, wave_14_verified_canonical_identities:Object.keys(EXPECTED_WAVE14).length, wave_15_verified_canonical_identities:Object.keys(EXPECTED_WAVE15).length, wave_16_verified_canonical_identities:Object.keys(EXPECTED_WAVE16).length, wave_17_verified_canonical_identities:Object.keys(EXPECTED_WAVE17).length, wave_18_verified_canonical_identities:Object.keys(EXPECTED_WAVE18).length, wave_19_verified_canonical_identities:Object.keys(EXPECTED_WAVE19).length, wave_20_verified_canonical_identities:Object.keys(EXPECTED_WAVE20).length, wave_21_verified_canonical_identities:Object.keys(EXPECTED_WAVE21).length, wave_22_verified_canonical_identities:Object.keys(EXPECTED_WAVE22).length, wave_23_verified_canonical_identities:Object.keys(EXPECTED_WAVE23).length, wave_24_verified_canonical_identities:Object.keys(EXPECTED_WAVE24).length, wave_25_verified_canonical_identities:Object.keys(EXPECTED_WAVE25).length, official_label_closure_verified_canonical_identities:Object.keys(EXPECTED_OFFICIAL_LABEL_CLOSURE).length, strong_runtime_closure_verified_canonical_identities:Object.keys(EXPECTED_STRONG_RUNTIME_CLOSURE).length, newly_classified_completely_category_empty_canonical_identities:newlyClassifiedCanonicalIdentities, wave_6_raw_missing_canonical_identities_resolved:wave6Resolved, wave_7_raw_missing_canonical_identities_resolved:wave7Resolved, wave_8_raw_missing_canonical_identities_resolved:wave8Resolved, wave_9_raw_missing_canonical_identities_resolved:wave9Resolved, wave_10_raw_missing_canonical_identities_resolved:wave10Resolved, wave_11_raw_missing_canonical_identities_resolved:wave11Resolved, wave_12_raw_missing_canonical_identities_resolved:wave12Resolved, wave_13_raw_missing_canonical_identities_resolved:wave13Resolved, wave_14_raw_missing_canonical_identities_resolved:wave14Resolved, wave_15_unsupported_legacy_categories_reviewed:wave15Reviewed, wave_16_unsupported_legacy_categories_reviewed:wave16Reviewed, wave_17_raw_missing_canonical_identities_resolved:wave17Resolved, wave_18_reviewed_canonical_identities:wave18Reviewed, wave_19_reviewed_canonical_identities:wave19Reviewed, wave_20_reviewed_canonical_identities:wave20Reviewed, wave_21_reviewed_canonical_identities:wave21Reviewed, wave_22_reviewed_canonical_identities:wave22Reviewed, wave_23_reviewed_canonical_identities:wave23Reviewed, wave_24_reviewed_canonical_identities:wave24Reviewed, wave_25_reviewed_canonical_identities:wave25Reviewed, official_label_closure_reviewed_canonical_identities:officialLabelClosureReviewed, strong_runtime_closure_reviewed_canonical_identities:strongRuntimeClosureReviewed, wave_10_requires_completely_category_empty_raw_canonical:true, wave_11_requires_completely_category_empty_raw_canonical:true, wave_12_requires_completely_category_empty_raw_canonical:true, wave_13_requires_completely_category_empty_raw_canonical:true, wave_14_requires_completely_category_empty_raw_canonical:true, wave_15_preserves_unsupported_legacy_category_hints:true, wave_16_preserves_unsupported_legacy_category_hints:true, wave_17_requires_completely_category_empty_raw_canonical:true, wave_18_preserves_legacy_category_hints_and_category_empty_state:true, wave_19_preserves_unsupported_legacy_category_hints:true, wave_20_preserves_barrier_lipid_hints_and_category_empty_state:true, wave_21_preserves_unsupported_legacy_category_hints_and_category_empty_state:true, wave_22_preserves_unsupported_legacy_category_hints:true, wave_23_preserves_unsupported_legacy_category_hints_and_category_empty_state:true, sodium_citrate_deferred_for_taxonomy_decision:true, raw_category_inventory:rawCategoryInventory, recognition_records_rewritten:false, safety_contract_changed:false, ambiguity_contract_changed:false, affiliate_contract_changed:false },null,2));
