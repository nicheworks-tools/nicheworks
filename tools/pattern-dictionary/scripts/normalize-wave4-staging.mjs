#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const file=path.join(root,'data','wave4-production-content.json');
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const map={
'壁紙':'wallpaper','生地':'textiles','家具装飾':'furnishing ornament','陶磁器':'ceramics','刺繍':'embroidery','椅子張り':'upholstery','クッション':'cushions','タペストリー':'tapestries','シルク':'silk','リボン':'ribbon','ドレス生地':'dress fabric','着物':'kimono','帯':'obi','和小物':'Japanese accessories','和装小物':'Japanese accessories','能装束':'Noh costume','有職文様':'courtly Japanese patterning','竹工芸':'bamboo craft','絞り染め':'shibori textiles','江戸小紋':'Edo komon','手ぬぐい':'tenugui','社寺装飾':'shrine and temple ornament','家紋':'heraldry','衣料':'apparel','サロン':'sarongs','サリー':'saris','ドゥパッタ':'dupattas','ショール':'shawls','寺院布':'temple cloths','壁掛け':'wall hangings'};
for(const p of data.patterns){
  p.common_uses.en=p.common_uses.ja.map(x=>map[x]||x);
  if(p.common_uses.en.some(x=>/[ぁ-んァ-ヶ一-龯]/.test(x)))throw new Error(`${p.pattern_id}: untranslated common use remains: ${p.common_uses.en.join(', ')}`);
}
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log('Wave 4 common_uses.en normalized for 20 records.');
