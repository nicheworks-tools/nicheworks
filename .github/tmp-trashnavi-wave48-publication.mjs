import fs from 'node:fs';

const municipalities = [
  {lgcode:'082121', pref_slug:'ibaraki', city_slug:'hitachiota', city:'常陸太田市'},
  {lgcode:'082252', pref_slug:'ibaraki', city_slug:'hitachiomiya', city:'常陸大宮市'},
  {lgcode:'084433', pref_slug:'ibaraki', city_slug:'ami', city:'阿見町'},
  {lgcode:'083097', pref_slug:'ibaraki', city_slug:'oarai', city:'大洗町'},
  {lgcode:'083020', pref_slug:'ibaraki', city_slug:'ibaraki-town', city:'茨城町'},
  {lgcode:'085642', pref_slug:'ibaraki', city_slug:'tone', city:'利根町'},
  {lgcode:'085219', pref_slug:'ibaraki', city_slug:'yachiyo', city:'八千代町'},
  {lgcode:'083411', pref_slug:'ibaraki', city_slug:'tokai', city:'東海村'},
  {lgcode:'082317', pref_slug:'ibaraki', city_slug:'sakuragawa', city:'桜川市'},
  {lgcode:'085421', pref_slug:'ibaraki', city_slug:'goka', city:'五霞町'}
];

const manifestPath='tools/trashnavi/municipality-page-manifest.json';
let manifestText=fs.readFileSync(manifestPath,'utf8');
const current=JSON.parse(manifestText);
if(current.length!==254) throw new Error('expected 254 manifest entries');
for(const m of municipalities) if(current.some(x=>x.lgcode===m.lgcode)) throw new Error('already published '+m.lgcode);
const compact=municipalities.map(m=>`  {"lgcode":"${m.lgcode}","pref_slug":"${m.pref_slug}","city_slug":"${m.city_slug}","publish":true}`).join(',\n');
if(!/\n\]\s*$/.test(manifestText)) throw new Error('manifest ending not found');
manifestText=manifestText.replace(/\n\]\s*$/, ',\n'+compact+'\n]\n');
fs.writeFileSync(manifestPath,manifestText);

{
  const path='tools/trashnavi/scripts/generate-municipality-pages.mjs';
  let s=fs.readFileSync(path,'utf8');
  const old='if(outputs.length!==254) throw new Error(`municipality page count must be 254; got ${outputs.length}`);';
  const neu='if(outputs.length!==264) throw new Error(`municipality page count must be 264; got ${outputs.length}`);';
  if(!s.includes(old)) throw new Error('generator count contract missing');
  fs.writeFileSync(path,s.replace(old,neu));
}
{
  const path='tools/trashnavi/scripts/check-affiliate-contract.mjs';
  let s=fs.readFileSync(path,'utf8');
  const old='check(manifest.length === 254, `expected 254 published municipality pages, got ${manifest.length}`);';
  const neu='check(manifest.length === 264, `expected 264 published municipality pages, got ${manifest.length}`);';
  if(!s.includes(old)) throw new Error('affiliate count contract missing');
  fs.writeFileSync(path,s.replace(old,neu));
}

const aiPath='tools/trashnavi/ai-reference.json';
const ai=JSON.parse(fs.readFileSync(aiPath,'utf8'));
if(ai.published_municipality_count!==254 || ai.municipalities.length!==254) throw new Error('AI reference baseline mismatch');
ai.snapshot_date='2026-09-18';
ai.published_municipality_count=264;
for(const m of municipalities){
  ai.municipalities.push({lgcode:m.lgcode,pref_slug:m.pref_slug,city_slug:m.city_slug,url:`https://nicheworks.app/tools/trashnavi/${m.pref_slug}/${m.city_slug}/`});
}
fs.writeFileSync(aiPath,JSON.stringify(ai,null,2)+'\n');

const indexPath='tools/trashnavi/index.html';
let index=fs.readFileSync(indexPath,'utf8');
const tail='<a href="/tools/trashnavi/ibaraki/namegata/">行方市</a></div>';
if(!index.includes(tail)) throw new Error('published link tail not found');
const anchors=municipalities.map(m=>`<a href="/tools/trashnavi/ibaraki/${m.city_slug}/">${m.city}</a>`).join('');
index=index.replace(tail,'<a href="/tools/trashnavi/ibaraki/namegata/">行方市</a>'+anchors+'</div>');
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
if(spec.includes('## Wave 48 batch publication')) throw new Error('Wave48 spec already present');
spec += `\n\n## Wave 48 batch publication\n\nWave 48は茨城県の追加10自治体を、従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific municipal-official link typeで公開し、公開対象を **254自治体から264自治体** へ拡張する。常総市は地域別処理体系、北茨城市は外部組合依存を市全域の単一制度として扱わないため採用しない。\n\n- 常陸太田市、常陸大宮市、阿見町、大洗町、茨城町、利根町、八千代町、東海村、桜川市、五霞町\n- readiness baseline: 2,880 / 2,880 valid HTTP(S)、264 preferred candidates、51 direct-link datasets / 812 records / 793 unique URLs / 0 invalid URLs\n- publication acceptance: 264 municipality pages、264 root internal links、AI reference 264/264、専用sitemapはtool rootを含む265 URL\n- 2026 calendar callout: 阿見町、大洗町、茨城町、利根町、八千代町、東海村、五霞町。常陸太田市、常陸大宮市、桜川市は年次を推測しない。\n- Amazon契約は \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を維持する。\n`;
fs.writeFileSync(specPath,spec);

console.log('Wave48 publication metadata prepared for 10 municipalities');
