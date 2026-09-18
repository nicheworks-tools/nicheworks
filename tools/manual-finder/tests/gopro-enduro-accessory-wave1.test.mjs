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
const waveRows=context.window.MANUALFINDER_GOPRO_CAMERA_ACCESSORY_WAVE1_LEDGER;
const models=["HERO9 Black","HERO10 Black","HERO11 Black","HERO12 Black"];
assert.equal(waveRows.length,models.length);
assert.deepEqual(Array.from(waveRows,r=>r.model).sort(),[...models].sort());
for(const model of models){
 const offers=Array.from(config.getAccessoryOffers({maker:'GoPro',model,category:'カメラ・映像'}));
 assert.equal(offers.length,1,`${model} must expose exactly one reviewed GoPro battery handoff`);
 assert.equal(offers[0].query,'GoPro Enduro Battery');
 assert.equal(offers[0].url,'https://www.amazon.co.jp/s?k=GoPro+Enduro+Battery&tag=nicheworks09-22');
 assert.equal(offers[0].sourceUrl,'https://gopro.com/en/au/shop/mounts-accessories/enduro-extended-cold-weather-battery/ADBAT-011.html');
 assert.equal(offers[0].verifiedAt,'2026-09-19');
}
for(const args of [{"maker":"GoPro","model":"HERO8 Black","category":"カメラ・映像"},{"maker":"gopro","model":"HERO9 Black","category":"カメラ・映像"},{"maker":"GoPro","model":"HERO9","category":"カメラ・映像"}]) assert.deepEqual(Array.from(config.getAccessoryOffers(args)),[],`unreviewed GoPro Wave 1 mapping must fail closed: ${JSON.stringify(args)}`);
const runtime=fs.readFileSync(new URL('../affiliate-runtime.js',import.meta.url),'utf8');
assert.ok(runtime.includes('affiliate-gopro-camera-accessories-wave1.js'));
assert.ok(runtime.includes('MANUALFINDER_GOPRO_CAMERA_ACCESSORY_WAVE1_LEDGER'));
console.log('ManualFinder GoPro camera accessory Wave 1 passed.');
