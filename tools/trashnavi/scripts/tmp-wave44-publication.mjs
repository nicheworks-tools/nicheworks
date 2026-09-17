import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const readJson = p => JSON.parse(fs.readFileSync(p,'utf8'));
const writeJson = (p,v) => fs.writeFileSync(p, JSON.stringify(v,null,2)+'\n');
const entries = [
  ['122254','kimitsu','君津市'],['122262','futtsu','富津市'],['122297','sodegaura','袖ケ浦市'],
  ['122106','mobara','茂原市'],['122131','togane','東金市'],['122301','yachimata','八街市'],
  ['122319','inzai','印西市'],['122327','shiroi','白井市'],['122289','yotsukaido','四街道市'],
  ['122335','tomisato','富里市']
];

const manifestPath='tools/trashnavi/municipality-page-manifest.json';
const manifest=readJson(manifestPath);
if(manifest.length!==214) throw new Error(`manifest baseline ${manifest.length}`);
const existing=new Set(manifest.map(x=>x.lgcode));
for(const [code,slug] of entries){
  if(existing.has(code)) throw new Error(`already published ${code}`);
  manifest.push({lgcode:code,pref_slug:'chiba',city_slug:slug,publish:true});
}
writeJson(manifestPath,manifest);

for(const [path,oldText,newText] of [
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs','if(outputs.length!==214) throw new Error(`municipality page count must be 214; got ${outputs.length}`);','if(outputs.length!==224) throw new Error(`municipality page count must be 224; got ${outputs.length}`);'],
  ['tools/trashnavi/scripts/check-affiliate-contract.mjs','check(manifest.length === 214, `expected 214 published municipality pages, got ${manifest.length}`);','check(manifest.length === 224, `expected 224 published municipality pages, got ${manifest.length}`);']
]){
  const s=fs.readFileSync(path,'utf8');
  if(!s.includes(oldText)) throw new Error(`baseline missing ${path}`);
  fs.writeFileSync(path,s.replace(oldText,newText));
}

const aiPath='tools/trashnavi/ai-reference.json';
const ai=readJson(aiPath);
if(ai.published_municipality_count!==214 || ai.municipalities.length!==214) throw new Error('AI baseline mismatch');
const aiExisting=new Set(ai.municipalities.map(x=>x.lgcode));
for(const [code,slug] of entries){
  if(aiExisting.has(code)) throw new Error(`AI duplicate ${code}`);
  ai.municipalities.push({lgcode:code,pref_slug:'chiba',city_slug:slug,url:`https://nicheworks.app/tools/trashnavi/chiba/${slug}/`});
}
ai.published_municipality_count=224;
ai.snapshot_date='2026-09-18';
writeJson(aiPath,ai);

const specPath='tools/trashnavi/SPEC.md';
let spec=fs.readFileSync(specPath,'utf8').trimEnd();
if(spec.includes('## Wave 44 ten-municipality publication')) throw new Error('Wave44 spec already exists');
spec += '\n\n## Wave 44 ten-municipality publication\n\nWave 44は既存の10自治体batch scaling ruleとpreferred readiness thresholdを維持し、214自治体から224自治体へ拡張する。対象は君津市・富津市・袖ケ浦市・茂原市・東金市・八街市・印西市・白井市・四街道市・富里市。各自治体は `municipal_home` を除く3種類の異なるwaste-specific official link typeと3つの自治体公式URLを持ち、同一ページ二重計上や外部衛生組合・委託先URLによる閾値補完は行わない。Readiness baselineは2,760/2,760 valid HTTP(S)、224 preferred candidates、47 datasets / 692 records / 673 unique URLs / invalid 0。Publicationでは224ページ、AI reference 224/224、root/dedicated sitemap、root internal links、Amazon 4 fixed categories (`nicheworks09-22`) を検証する。2026 calendar calloutは `fiscal_year: 2026` が明示された富津市・袖ケ浦市・茂原市・東金市・八街市・四街道市・富里市のみ表示し、君津市・印西市・白井市には表示しない。\n';
fs.writeFileSync(specPath,spec);

const rootPath='sitemap.xml';
let root=fs.readFileSync(rootPath,'utf8').trimEnd();
if(!root.endsWith('</urlset>')) throw new Error('root sitemap malformed');
const blocks=[];
for(const [,slug] of entries){
  const canonical=`https://nicheworks.app/tools/trashnavi/chiba/${slug}/`;
  if(root.includes(canonical)) throw new Error(`root duplicate ${slug}`);
  blocks.push(`  <url>\n    <loc>${canonical}</loc>\n    <lastmod>2026-09-18</lastmod>\n  </url>`);
}
root=root.slice(0,-'</urlset>'.length)+blocks.join('\n')+'\n</urlset>\n';
fs.writeFileSync(rootPath,root);

const indexPath='tools/trashnavi/index.html';
let html=fs.readFileSync(indexPath,'utf8');
const marker='<div class="municipality-related-links">';
let start=html.indexOf(marker), end=html.indexOf('</div>',start);
if(start<0||end<0) throw new Error('related links marker missing');
for(const [,slug,name] of entries){
  const href=`/tools/trashnavi/chiba/${slug}/`;
  if(html.includes(href)) throw new Error(`index duplicate ${slug}`);
  const chunk=`<a href="${href}">${name}</a>`;
  html=html.slice(0,end)+chunk+html.slice(end);
  end+=chunk.length;
}
fs.writeFileSync(indexPath,html);

for(const args of [
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs'],
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs','--check'],
  ['tools/trashnavi/scripts/audit-coverage.mjs','--strict'],
  ['scripts/check-trashnavi-direct-links.mjs','--inventory'],
  ['tools/trashnavi/scripts/check-affiliate-contract.mjs'],
  ['tools/trashnavi/scripts/check-runtime-contract.mjs']
]) execFileSync('node',args,{stdio:'inherit'});

const rows=readJson('tools/trashnavi/data/direct-waste-links-supply-wave44.json');
const by=new Map();
for(const r of rows){ if(!by.has(r.lgcode)) by.set(r.lgcode,[]); by.get(r.lgcode).push(r); }
const dedicated=fs.readFileSync('sitemap-trashnavi.xml','utf8');
const rootFinal=fs.readFileSync(rootPath,'utf8');
const indexFinal=fs.readFileSync(indexPath,'utf8');
for(const [code,slug] of entries){
  const rs=by.get(code); if(!rs || rs.length!==3) throw new Error(`rows ${code}`);
  const canonical=`https://nicheworks.app/tools/trashnavi/chiba/${slug}/`, href=`/tools/trashnavi/chiba/${slug}/`;
  const page=fs.readFileSync(`tools/trashnavi/chiba/${slug}/index.html`,'utf8');
  if(!page.includes(`<link rel="canonical" href="${canonical}">`)) throw new Error(`canonical ${slug}`);
  if((page.match(/class="official-link-card"/g)||[]).length!==3) throw new Error(`cards ${slug}`);
  if(!page.includes('[PR]')) throw new Error(`PR ${slug}`);
  const callout=rs.some(r=>r.link_type==='collection_calendar' && String(r.fiscal_year||'')==='2026');
  if(page.includes('class="current-calendar-callout"')!==callout) throw new Error(`callout ${slug}`);
  if(dedicated.split(`<loc>${canonical}</loc>`).length-1!==1) throw new Error(`dedicated ${slug}`);
  if(rootFinal.split(`<loc>${canonical}</loc>`).length-1!==1) throw new Error(`root ${slug}`);
  if(indexFinal.split(`href="${href}"`).length-1!==1) throw new Error(`index ${slug}`);
}
const aiFinal=readJson(aiPath), manifestFinal=readJson(manifestPath);
if(aiFinal.published_municipality_count!==224 || aiFinal.municipalities.length!==224) throw new Error('AI final');
if(manifestFinal.length!==224 || manifestFinal.some(x=>!x.publish)) throw new Error('manifest final');
if((dedicated.match(/<loc>/g)||[]).length!==225) throw new Error('dedicated URL count');
console.log('Wave44 publication acceptance: 10/10 pages; AI 224/224; dedicated sitemap 225 URLs including tool root; root sitemap/internal links OK');
