import fs from 'node:fs';

const municipalities = [
  {lgcode:'082023', pref_slug:'ibaraki', city_slug:'hitachi', city:'日立市'},
  {lgcode:'082031', pref_slug:'ibaraki', city_slug:'tsuchiura', city:'土浦市'},
  {lgcode:'082058', pref_slug:'ibaraki', city_slug:'ishioka', city:'石岡市'},
  {lgcode:'082082', pref_slug:'ibaraki', city_slug:'ryugasaki', city:'龍ケ崎市'},
  {lgcode:'082104', pref_slug:'ibaraki', city_slug:'shimotsuma', city:'下妻市'},
  {lgcode:'082163', pref_slug:'ibaraki', city_slug:'kasama', city:'笠間市'},
  {lgcode:'082198', pref_slug:'ibaraki', city_slug:'ushiku', city:'牛久市'},
  {lgcode:'082201', pref_slug:'ibaraki', city_slug:'tsukuba', city:'つくば市'},
  {lgcode:'082210', pref_slug:'ibaraki', city_slug:'hitachinaka', city:'ひたちなか市'},
  {lgcode:'082244', pref_slug:'ibaraki', city_slug:'moriya', city:'守谷市'}
];

const manifestPath='tools/trashnavi/municipality-page-manifest.json';
let manifestText=fs.readFileSync(manifestPath,'utf8');
const current=JSON.parse(manifestText);
if(current.length!==234) throw new Error('expected 234 manifest entries');
for(const m of municipalities) if(current.some(x=>x.lgcode===m.lgcode)) throw new Error('already published '+m.lgcode);
const compact=municipalities.map(m=>`  {"lgcode":"${m.lgcode}","pref_slug":"${m.pref_slug}","city_slug":"${m.city_slug}","publish":true}`).join(',\n');
if(!/\n\]\s*$/.test(manifestText)) throw new Error('manifest ending not found');
manifestText=manifestText.replace(/\n\]\s*$/, ',\n'+compact+'\n]\n');
fs.writeFileSync(manifestPath,manifestText);

{
  const path='tools/trashnavi/scripts/generate-municipality-pages.mjs';
  let s=fs.readFileSync(path,'utf8');
  for (const token of ['if(outputs.length!==234)','municipality page count must be 234']) {
    if(!s.includes(token)) throw new Error(path+' missing '+token);
  }
  s=s.replace('if(outputs.length!==234)','if(outputs.length!==244)')
     .replace('municipality page count must be 234','municipality page count must be 244');
  fs.writeFileSync(path,s);
}
{
  const path='tools/trashnavi/scripts/check-affiliate-contract.mjs';
  let s=fs.readFileSync(path,'utf8');
  for (const token of ['manifest.length === 234','expected 234 published municipality pages']) {
    if(!s.includes(token)) throw new Error(path+' missing '+token);
  }
  s=s.replace('manifest.length === 234','manifest.length === 244')
     .replace('expected 234 published municipality pages','expected 244 published municipality pages');
  fs.writeFileSync(path,s);
}

const aiPath='tools/trashnavi/ai-reference.json';
const ai=JSON.parse(fs.readFileSync(aiPath,'utf8'));
if(ai.published_municipality_count!==234 || ai.municipalities.length!==234) throw new Error('AI reference baseline mismatch');
ai.snapshot_date='2026-09-18';
ai.published_municipality_count=244;
for(const m of municipalities){
  ai.municipalities.push({lgcode:m.lgcode,pref_slug:m.pref_slug,city_slug:m.city_slug,url:`https://nicheworks.app/tools/trashnavi/${m.pref_slug}/${m.city_slug}/`});
}
fs.writeFileSync(aiPath,JSON.stringify(ai,null,2)+'\n');

const indexPath='tools/trashnavi/index.html';
let index=fs.readFileSync(indexPath,'utf8');
const tail='<a href="/tools/trashnavi/chiba/sosa/">匝瑳市</a></div>';
if(!index.includes(tail)) throw new Error('published link tail not found');
const anchors=municipalities.map(m=>`<a href="/tools/trashnavi/ibaraki/${m.city_slug}/">${m.city}</a>`).join('');
index=index.replace(tail,'<a href="/tools/trashnavi/chiba/sosa/">匝瑳市</a>'+anchors+'</div>');
index=index.replaceAll('データ更新日：2026-09-16','データ更新日：2026-09-18')
           .replaceAll('Data updated: 2026-09-16','Data updated: 2026-09-18');
fs.writeFileSync(indexPath,index);

const rootPath='sitemap.xml';
let root=fs.readFileSync(rootPath,'utf8');
for(const m of municipalities){
  const url=`https://nicheworks.app/tools/trashnavi/ibaraki/${m.city_slug}/`;
  if(root.includes(`<loc>${url}</loc>`)) throw new Error('root sitemap duplicate '+url);
}
const blocks=municipalities.map(m=>`  <url>\n    <loc>https://nicheworks.app/tools/trashnavi/ibaraki/${m.city_slug}/</loc>\n    <lastmod>2026-09-18</lastmod>\n  </url>`).join('\n');
if(!root.includes('</urlset>')) throw new Error('root sitemap closing missing');
root=root.replace('</urlset>',blocks+'\n</urlset>');
fs.writeFileSync(rootPath,root);

const specPath='tools/trashnavi/SPEC.md';
let spec=fs.readFileSync(specPath,'utf8');
if(spec.includes('## Wave 46 batch publication')) throw new Error('Wave46 spec already present');
spec += `\n\n## Wave 46 batch publication\n\nWave 46は茨城県の10自治体を、従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific municipal-official link typeで公開し、公開対象を **234自治体から244自治体** へ拡張する。古河市は地区別の収集・粗大ごみ条件を市全域へ平坦化しないため採用せず、守谷市へ差し替えた。\n\n- 日立市、土浦市、石岡市、龍ケ崎市、下妻市、笠間市、牛久市、つくば市、ひたちなか市、守谷市\n- readiness baseline: 2,820 / 2,820 valid HTTP(S)、244 preferred candidates、49 direct-link datasets / 752 records / 733 unique URLs / 0 invalid URLs\n- publication acceptance: 244 municipality pages、244 root internal links、AI reference 244/244、専用sitemapはtool rootを含む245 URL\n- 2026 calendar callout: 日立市、石岡市、龍ケ崎市、つくば市、守谷市。その他5市は年次を推測しない。\n- Amazon契約は \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を維持する。\n`;
fs.writeFileSync(specPath,spec);

console.log('Wave46 publication metadata prepared for 10 municipalities');
