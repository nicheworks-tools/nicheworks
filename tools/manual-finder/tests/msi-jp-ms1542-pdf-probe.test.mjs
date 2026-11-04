import assert from 'node:assert/strict';
import {pass,verifyManual} from '../scripts/msi-jp-ms1542-pdf-probe.mjs';
assert.equal(pass.groups.length,2);
assert.equal(pass.candidateCount,6);
assert.equal(new Set(pass.groups.flatMap(x=>x.models)).size,6);
assert.ok(pass.manufacturerOfficialMappingUrl.startsWith('https://us-spareparts.msi.com/'));
const bytes=Buffer.concat([Buffer.from('%PDF-1.7'),Buffer.alloc(80000)]);
for(const g of pass.groups){
 assert.equal(verifyManual(g,bytes,'取扱説明書 ノートブック',g.manualUrl).type,g.type);
 assert.throws(()=>verifyManual(g,bytes,'Manual Notebook',g.manualUrl),/Japanese manual title/);
 assert.throws(()=>verifyManual(g,bytes,'取扱説明書 ノートブック','https://download.msi.com/archive/mnu_exe/nb/error_page'),/filename\/redirect mismatch/);
 assert.throws(()=>verifyManual(g,Buffer.from('<html>Error</html>'),'取扱説明書 ノートブック',g.manualUrl),/PDF magic/);
}
console.log('MSI two PDF candidates, exact MSI server final filename and Japanese manual text fixtures PASS.');
