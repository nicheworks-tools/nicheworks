import test from 'node:test';
import assert from 'node:assert/strict';
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
 assert.deepEqual(pendingSlice(ledger,gov,0,1).map(x=>x.lgcode),['012084']);
 assert.deepEqual(pendingSlice(ledger,gov,1,1).map(x=>x.lgcode),['012106']);
 assert.equal(ledger.municipalities[1].coverage_state,'pending_review');
});
