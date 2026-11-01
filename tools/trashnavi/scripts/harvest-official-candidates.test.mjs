import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {extract,pendingSlice,allowed} from './harvest-official-candidates.mjs';

test('only same official host candidate links are extracted',()=>{
 const html='<a href="/kurashi/gomi.html">ごみ分別</a><a href="https://random.example.com/gomi">ごみ</a><a href="/seikatsu.html">暮らしと生活</a>';
 const links=extract(html,'https://www.city.example.jp/','www.city.example.jp');
 assert.equal(links.length,2);
 assert.equal(links[0].url,'https://www.city.example.jp/kurashi/gomi.html');
 assert.deepEqual(links.map(x=>x.score),[3,1]);
});
test('basic robots disallow and exception',()=>{
 const robots='User-agent: *\nDisallow: /secret/\nAllow: /secret/public/\n';
 assert.equal(allowed(robots,'/secret/info'),false);
 assert.equal(allowed(robots,'/secret/public/gomi'),true);
 assert.equal(allowed(robots,'/gomi'),true);
});
test('only pending municipalities selected and original ledger not modified',()=>{
 const ledger={municipalities:[
  {lgcode:'012025',pref:'北海道',municipality:'函館市',coverage_state:'limited'},
  {lgcode:'012084',pref:'北海道',municipality:'北見市',coverage_state:'pending_review'},
  {lgcode:'012106',pref:'北海道',municipality:'岩見沢市',coverage_state:'pending_review'}
 ]};
 const gov=[{lgcode:'012084',url:'https://www.city.kitami.lg.jp/'},{lgcode:'012106',url:'https://www.iwamizawa.jp/'}];
 assert.deepEqual(pendingSlice(ledger,gov,0,1).map(x=>x.lgcode),[]);
 assert.deepEqual(pendingSlice(ledger,gov,1,1).map(x=>x.lgcode),['012084']);
 assert.deepEqual(pendingSlice(ledger,gov,2,1).map(x=>x.lgcode),['012106']);
 assert.equal(ledger.municipalities[1].coverage_state,'pending_review');
});

test('fixed ledger shards remain stable as municipalities are reviewed',()=>{
 const ledger={municipalities:[
  {lgcode:'01',coverage_state:'pending_review'},
  {lgcode:'02',coverage_state:'pending_review'},
  {lgcode:'03',coverage_state:'limited'},
  {lgcode:'04',coverage_state:'pending_review'},
  {lgcode:'05',coverage_state:'pending_review'}
 ]};
 const gov=ledger.municipalities.map(x=>({lgcode:x.lgcode,url:'https://www.example.jp/'}));
 assert.deepEqual(pendingSlice(ledger,gov,0,2).map(x=>x.lgcode),['01','02']);
 assert.deepEqual(pendingSlice(ledger,gov,1,2).map(x=>x.lgcode),['04']);
 assert.deepEqual(pendingSlice(ledger,gov,2,2).map(x=>x.lgcode),['05']);
 ledger.municipalities[0].coverage_state='limited';
 assert.deepEqual(pendingSlice(ledger,gov,1,2).map(x=>x.lgcode),['04']);
 assert.deepEqual(pendingSlice(ledger,gov,2,2).map(x=>x.lgcode),['05']);
});

test('workflow interpolates GitHub expressions and covers all full-ledger shards',()=>{
 const workflow=fs.readFileSync(new URL('../../../.github/workflows/harvest-trashnavi-official-candidates.yml',import.meta.url),'utf8');
 assert.doesNotMatch(workflow,/\$\{\s+(?:inputs|steps|secrets)\./);
 assert.match(workflow,/\$\{\{ inputs\.shard \}\}/);
 assert.match(workflow,/SHARD_COUNT/);
});
