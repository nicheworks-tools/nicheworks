import fs from 'node:fs';

const municipalities = [
  {lgcode:'082171', pref_slug:'ibaraki', city_slug:'toride', city:'取手市'},
  {lgcode:'082261', pref_slug:'ibaraki', city_slug:'naka', city:'那珂市'},
  {lgcode:'082279', pref_slug:'ibaraki', city_slug:'chikusei', city:'筑西市'},
  {lgcode:'082295', pref_slug:'ibaraki', city_slug:'inashiki', city:'稲敷市'},
  {lgcode:'082309', pref_slug:'ibaraki', city_slug:'kasumigaura', city:'かすみがうら市'},
  {lgcode:'082350', pref_slug:'ibaraki', city_slug:'tsukubamirai', city:'つくばみらい市'},
  {lgcode:'082228', pref_slug:'ibaraki', city_slug:'kashima', city:'鹿嶋市'},
  {lgcode:'082325', pref_slug:'ibaraki', city_slug:'kamisu', city:'神栖市'},
  {lgcode:'082368', pref_slug:'ibaraki', city_slug:'omitama', city:'小美玉市'},
  {lgcode:'082333', pref_slug:'ibaraki', city_slug:'namegata', city:'行方市'}
];

const manifestPath='tools/trashnavi/municipality-page-manifest.json';
let manifestText=fs.readFileSync(manifestPath,'utf8');
const current=JSON.parse(manifestText);
if(current.length!==244) throw new Error('expected 244 manifest entries');
for(const m of municipalities) if(current.some(x=>x.lgcode===m.lgcode)) throw new Error('already published '+m.lgcode);
const compact=municipalities.map(m=>`  {"lgcode":"${m.lgcode}","pref_slug":"${m.pref_slug}","city_slug":"${m.city_slug}","publish":true}`).join(',\n');
if(!/\n\]\s*$/.test(manifestText)) throw new Error('manifest ending not found');
manifestText=manifestText.replace(/\n\]\s*$/, ',\n'+compact+'\n]\n');
fs.writeFileSync(manifestPath,manifestText);

{
  const path='tools/trashnavi/scripts/generate-municipality-pages.mjs';
  let s=fs.readFileSync(path,'utf8');
  const old='if(outputs.length!==244) throw new Error(`municipality page count must be 244; got ${outputs.length}`);';
  const neu='if(outputs.length!==254) throw new Error(`municipality page count must be 254; got ${outputs.length}`);';
  if(!s.includes(old)) throw new Error('generator count contract changed');
  fs.writeFileSync(path,s.replace(old,neu));
}
{
  const path='tools/trashnavi/scripts/check-affiliate-contract.mjs';
  let s=fs.readFileSync(path,'utf8');
  const old='check(manifest.length === 244, `expected 244 published municipality pages, got ${manifest.length}`);';
  const neu='check(manifest.length === 254, `expected 254 published municipality pages, got ${manifest.length}`);';
  if(!s.includes(old)) throw new Error('affiliate count contract changed');
  fs.writeFileSync(path,s.replace(old,neu));
}

const aiPath='tools/trashnavi/ai-reference.json';
const ai=JSON.parse(fs.readFileSync(aiPath,'utf8'));
if(ai.published_municipality_count!==244 || ai.municipalities.length!==244) throw new Error('AI reference baseline mismatch');
ai.snapshot_date='2026-09-18';
ai.published_municipality_count=254;
for(const m of municipalities){
  ai.municipalities.push({lgcode:m.lgcode,pref_slug:m.pref_slug,city_slug:m.city_slug,url:`https://nicheworks.app/tools/trashnavi/${m.pref_slug}/${m.city_slug}/`});
}
fs.writeFileSync(aiPath,JSON.stringify(ai,null,2)+'\n');

const indexPath='tools/trashnavi/index.html';
let index=fs.readFileSync(indexPath,'utf8');
const tail='<a href="/tools/trashnavi/ibaraki/moriya/">守谷市</a></div>';
if(!index.includes(tail)) throw new Error('published link tail not found');
const anchors=municipalities.map(m=>`<a href="/tools/trashnavi/ibaraki/${m.city_slug}/">${m.city}</a>`).join('');
index=index.replace(tail,'<a href="/tools/trashnavi/ibaraki/moriya/">守谷市</a>'+anchors+'</div>');
if(!index.includes('id="trashnaviAmazonAffiliate"')) throw new Error('root Amazon block lost');
fs.writeFileSync(indexPath,index);

const rootPath='sitemap.xml';
let root=fs.readFileSync(rootPath,'utf8');
for(const m of municipalities){
  const url=`https://nicheworks.app/tools/trashnavi/ibaraki/${m.city_slug}/`;
  if(root.includes(`<loc>${url}</loc>`)) throw new Error('root sitemap duplicate '+url);
}
const blocks=municipalities.map(m=>`  <url>\n    <loc>https://nicheworks.app/tools/trashnavi/ibaraki/${m.city_slug}/</loc>\n    <lastmod>2026-09-18</lastmod>\n  </url>`).join('\n');
if(!root.includes('</urlset>')) throw new Error('root sitemap closing missing');
fs.writeFileSync(rootPath,root.replace('</urlset>',blocks+'\n</urlset>'));

const specPath='tools/trashnavi/SPEC.md';
let spec=fs.readFileSync(specPath,'utf8');
if(spec.includes('## Wave 47 batch publication')) throw new Error('Wave47 spec already present');
spec += `\n\n## Wave 47 batch publication\n\nWave 47は茨城県の10自治体を、従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific municipal-official link typeで公開し、公開対象を **244自治体から254自治体** へ拡張する。坂東市は市公式の独立3 URL thresholdを無理に満たさず、行方市へ差し替える。Wave 46後に追加されたtype-aware municipality generatorとroot Amazon affiliate isolation contractを正本として維持する。\n\n- 取手市、那珂市、筑西市、稲敷市、かすみがうら市、つくばみらい市、鹿嶋市、神栖市、小美玉市、行方市\n- readiness baseline: 2,850 / 2,850 valid HTTP(S)、254 preferred candidates、50 direct-link datasets / 782 records / 763 unique URLs / 0 invalid URLs\n- publication acceptance: 254 municipality pages、254 root internal links、AI reference 254/254、専用sitemapはtool rootを含む255 URL\n- 2026 calendar callout: 取手市、那珂市、稲敷市、つくばみらい市、鹿嶋市、小美玉市、行方市。筑西市・かすみがうら市・神栖市には年次calloutを生成しない。\n- Amazon契約は \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を維持し、root directory affiliate blockも検索結果・自治体公式情報とは分離する。\n`;
fs.writeFileSync(specPath,spec);

console.log('Wave47 publication metadata prepared for 10 municipalities');
