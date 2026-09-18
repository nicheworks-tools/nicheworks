import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const sandbox={window:{},URL}; const context=vm.createContext(sandbox); const root=new URL('../',import.meta.url);
for (const name of [
 'affiliate-config.js','affiliate-camera-accessories.js','affiliate-nikon-camera-accessories-wave2.js',
 ...fs.readdirSync(root).filter(n=>/^affiliate-dji-camera-accessories-wave\d+\.js$/.test(n)).sort((a,b)=>Number(a.match(/wave(\d+)/)?.[1]||0)-Number(b.match(/wave(\d+)/)?.[1]||0)),
 ...fs.readdirSync(root).filter(n=>/^affiliate-om-system-camera-accessories-wave\d+\.js$/.test(n)).sort((a,b)=>Number(a.match(/wave(\d+)/)?.[1]||0)-Number(b.match(/wave(\d+)/)?.[1]||0)),
 ...fs.readdirSync(root).filter(n=>/^affiliate-gopro-camera-accessories-wave\d+\.js$/.test(n)).sort((a,b)=>Number(a.match(/wave(\d+)/)?.[1]||0)-Number(b.match(/wave(\d+)/)?.[1]||0))
]) vm.runInContext(fs.readFileSync(new URL(name,root),'utf8'),context,{filename:`tools/manual-finder/${name}`});
const config=context.window.MANUALFINDER_AFFILIATE_CONFIG;
const waveRows=context.window.MANUALFINDER_GOPRO_CAMERA_ACCESSORY_WAVE3_LEDGER;
const models=["HERO5 Black","HERO6 Black","HERO7 Black","HERO8 Black","HERO 2018"];
assert.equal(waveRows.length,models.length);
assert.deepEqual(Array.from(waveRows,r=>r.model).sort(),[...models].sort());
for(const model of models){
 const offers=Array.from(config.getAccessoryOffers({maker:'GoPro',model,category:'カメラ・映像'}));
 assert.equal(offers.length,1,`${model} must expose exactly one reviewed GoPro battery handoff`);
 assert.equal(offers[0].query,'GoPro HERO8 Black Rechargeable Battery');
 assert.equal(offers[0].url,'https://www.amazon.co.jp/s?k=GoPro+HERO8+Black+Rechargeable+Battery&tag=nicheworks09-22');
 assert.equal(offers[0].sourceUrl,'https://gopro.com/en/us/shop/mounts-accessories/hero8-black-rechargeable-battery/AJBAT-001.html');
 assert.equal(offers[0].verifiedAt,'2026-09-19');
}
for(const args of [{"maker":"GoPro","model":"HERO5 Session","category":"カメラ・映像"},{"maker":"GoPro","model":"HERO7 Silver","category":"カメラ・映像"},{"maker":"GoPro","model":"HERO4","category":"カメラ・映像"}]) assert.deepEqual(Array.from(config.getAccessoryOffers(args)),[],`unreviewed GoPro Wave 3 mapping must fail closed: ${JSON.stringify(args)}`);
const runtime=fs.readFileSync(new URL('../affiliate-runtime.js',import.meta.url),'utf8');
assert.ok(runtime.includes('affiliate-gopro-camera-accessories-wave3.js'));
assert.ok(runtime.includes('MANUALFINDER_GOPRO_CAMERA_ACCESSORY_WAVE3_LEDGER'));
console.log('ManualFinder GoPro camera accessory Wave 3 passed.');
