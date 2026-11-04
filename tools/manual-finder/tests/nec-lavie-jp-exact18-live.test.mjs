import assert from 'node:assert/strict';
import {verifyOfficialHtml} from '../scripts/nec-lavie-jp-exact18-live.mjs';
const record={model:'PC-NS350NAS-E3',shortModel:'NS350/NAS-E3',standardModel:'NS350/NAS'};
const sample='<html>型番：PC-NS350NAS-E3 型名：NS350/NAS-E3 <a href="/amend">添付マニュアルの読み替え</a><a href="/base">標準モデル（ NS350/NAS ）の添付マニュアル</a></html>';
assert.equal(verifyOfficialHtml(record,sample).verified,true);
assert.throws(()=>verifyOfficialHtml(record,sample.replace('PC-NS350NAS-E3','PC-NS350NAS-E4')),/exact PC SKU/);
assert.throws(()=>verifyOfficialHtml(record,sample.replace('標準モデル（ NS350/NAS ）','標準モデル（ NS350/NAB ）')),/standard model association/);
assert.throws(()=>verifyOfficialHtml(record,sample.replace('読み替え','')),/amendment/);
console.log('NEC LAVIE model-index fixture fail-closed guard PASS.');
