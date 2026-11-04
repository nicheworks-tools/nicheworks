import assert from 'node:assert/strict';
import {verifyExtractedText,source} from '../scripts/acer-jp-manual-pdf-probe.mjs';
assert.equal(source.groups.length,5);
assert.equal(source.modelCount,16);
assert.equal(new Set(source.groups.flatMap(g=>g.models)).size,16);
assert.equal(source.heldModels.length,1);
assert.equal(source.heldModels[0].model,'SF713-51');
assert.equal(source.candidateUniverseModelCount,17);
for(const group of source.groups){
 assert.equal(new URL(group.url).hostname,'global-download.acer.com');
 assert.equal(new URL(group.url).searchParams.get('LC')==='ja'||group.group==='Swift 3 2019',true,'Japanese source selection');
 const text='ユーザーマニュアル\n対象モデル：'+group.models.join(' / ');
 assert.deepEqual(verifyExtractedText(group,text).models,group.models);
 assert.throws(()=>verifyExtractedText(group,'USER MANUAL\nA999-999'),/model identifier/);
 assert.throws(()=>verifyExtractedText(group,group.models.join(' / ')),/no user manual title/);
}
console.log('Acer exact five manufacturer PDF provenance and strict model header parsing fixture passed.');
