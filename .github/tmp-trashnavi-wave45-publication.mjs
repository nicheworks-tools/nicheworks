import fs from 'node:fs';

const municipalities = [
  {lgcode:'122025', pref_slug:'chiba', city_slug:'choshi', city:'銚子市'},
  {lgcode:'122050', pref_slug:'chiba', city_slug:'tateyama', city:'館山市'},
  {lgcode:'122157', pref_slug:'chiba', city_slug:'asahi', city:'旭市'},
  {lgcode:'122181', pref_slug:'chiba', city_slug:'katsuura', city:'勝浦市'},
  {lgcode:'122238', pref_slug:'chiba', city_slug:'kamogawa', city:'鴨川市'},
  {lgcode:'122343', pref_slug:'chiba', city_slug:'minamiboso', city:'南房総市'},
  {lgcode:'122360', pref_slug:'chiba', city_slug:'katori', city:'香取市'},
  {lgcode:'122386', pref_slug:'chiba', city_slug:'isumi', city:'いすみ市'},
  {lgcode:'122394', pref_slug:'chiba', city_slug:'oamishirasato', city:'大網白里市'},
  {lgcode:'122351', pref_slug:'chiba', city_slug:'sosa', city:'匝瑳市'}
];

const manifestPath='tools/trashnavi/municipality-page-manifest.json';
let manifestText=fs.readFileSync(manifestPath,'utf8');
const current=JSON.parse(manifestText);
if(current.length!==224) throw new Error('expected 224 manifest entries');
for(const m of municipalities) if(current.some(x=>x.lgcode===m.lgcode)) throw new Error('already published '+m.lgcode);
const compact=municipalities.map(m=>`  {"lgcode":"${m.lgcode}","pref_slug":"${m.pref_slug}","city_slug":"${m.city_slug}","publish":true}`).join(',\n');
if(!/\n\]\s*$/.test(manifestText)) throw new Error('manifest ending not found');
manifestText=manifestText.replace(/\n\]\s*$/, ',\n'+compact+'\n]\n');
fs.writeFileSync(manifestPath,manifestText);

for(const path of ['tools/trashnavi/scripts/generate-municipality-pages.mjs','tools/trashnavi/scripts/check-affiliate-contract.mjs']){
  let s=fs.readFileSync(path,'utf8');
  if(!s.includes('224')) throw new Error(path+' expected count token missing');
  s=s.replaceAll('224','234');
  fs.writeFileSync(path,s);
}

const aiPath='tools/trashnavi/ai-reference.json';
const ai=JSON.parse(fs.readFileSync(aiPath,'utf8'));
if(ai.published_municipality_count!==224 || ai.municipalities.length!==224) throw new Error('AI reference baseline mismatch');
ai.snapshot_date='2026-09-18';
ai.published_municipality_count=234;
for(const m of municipalities){
  ai.municipalities.push({lgcode:m.lgcode,pref_slug:m.pref_slug,city_slug:m.city_slug,url:`https://nicheworks.app/tools/trashnavi/${m.pref_slug}/${m.city_slug}/`});
}
fs.writeFileSync(aiPath,JSON.stringify(ai,null,2)+'\n');

const indexPath='tools/trashnavi/index.html';
let index=fs.readFileSync(indexPath,'utf8');
const tail='<a href="/tools/trashnavi/chiba/tomisato/">富里市</a></div>';
if(!index.includes(tail)) throw new Error('published link tail not found');
const anchors=municipalities.map(m=>`<a href="/tools/trashnavi/chiba/${m.city_slug}/">${m.city}</a>`).join('');
index=index.replace(tail,'<a href="/tools/trashnavi/chiba/tomisato/">富里市</a>'+anchors+'</div>');
fs.writeFileSync(indexPath,index);

const rootPath='sitemap.xml';
let root=fs.readFileSync(rootPath,'utf8');
for(const m of municipalities){
  const url=`https://nicheworks.app/tools/trashnavi/chiba/${m.city_slug}/`;
  if(root.includes(`<loc>${url}</loc>`)) throw new Error('root sitemap duplicate '+url);
}
const blocks=municipalities.map(m=>`  <url>\n    <loc>https://nicheworks.app/tools/trashnavi/chiba/${m.city_slug}/</loc>\n    <lastmod>2026-09-18</lastmod>\n  </url>`).join('\n');
if(!root.includes('</urlset>')) throw new Error('root sitemap closing missing');
root=root.replace('</urlset>',blocks+'\n</urlset>');
fs.writeFileSync(rootPath,root);

const specPath='tools/trashnavi/SPEC.md';
let spec=fs.readFileSync(specPath,'utf8');
if(spec.includes('## Wave 45 batch publication')) throw new Error('Wave45 spec already present');
spec += `\n\n## Wave 45 batch publication\n\nWave 45は千葉県の追加10自治体を、従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific municipal-official link typeで公開し、公開対象を **224自治体から234自治体** へ拡張する。山武市は地域別の処理体系を市全域へ平坦化しないため本Waveでは採用せず、匝瑳市を含む10自治体を公開する。\n\n- 銚子市、館山市、旭市、勝浦市、鴨川市、南房総市、香取市、いすみ市、大網白里市、匝瑳市\n- readiness baseline: 2,790 / 2,790 valid HTTP(S)、234 preferred candidates、48 direct-link datasets / 722 records / 703 unique URLs / 0 invalid URLs\n- publication acceptance: 234 municipality pages、234 root internal links、AI reference 234/234、専用sitemapはtool rootを含む235 URL\n- 2026 calendar callout: 銚子市、館山市、旭市、鴨川市、南房総市、香取市、いすみ市、大網白里市、匝瑳市。勝浦市は年次を明示しない。\n- Amazon契約は \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を維持する。\n`;
fs.writeFileSync(specPath,spec);

console.log('Wave45 publication metadata prepared for 10 municipalities');
