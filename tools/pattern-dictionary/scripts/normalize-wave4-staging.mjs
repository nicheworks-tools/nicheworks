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

const thirdCue={
  'baroque-scroll':{ja:'巻き線が横方向へ連続して走る反復リズム',en:'A running scroll rhythm that continues laterally across the repeat'},
  'chinoiserie':{ja:'情景要素を余白とともに非対称に配置する構成',en:'Scenic motifs commonly arranged asymmetrically with open space between them'},
  'flame-stitch':{ja:'段階的に上下するジグザグが炎状の峰をつくる',en:'Stepped zigzags rise and fall into flame-like peaks'},
  'tree-of-life':{ja:'中央の幹から左右へ枝葉が展開する樹形',en:'A central trunk expands outward into branching foliage'},
  'moire':{ja:'水面のような波紋が重なって流れる光沢線',en:'Overlapping watered ripples create a flowing, lustrous surface effect'},
  'yagasuri':{ja:'矢羽根形のV字単位が同方向へ整列する',en:'Arrow-feather V units align in a consistent directional repeat'},
  'sayagata':{ja:'卍を崩した鍵形の線が途切れず連結する',en:'Interlocking key-fret lines derived from manji forms connect continuously'},
  'uroko':{ja:'三角形が上下反転しながら規則的に並ぶ',en:'Triangles alternate orientation in a regular scale-like repeat'},
  'tatewaku':{ja:'平行する波状線が縦方向へ立ち上がる',en:'Parallel undulating lines rise vertically through the repeat'},
  'kagome':{ja:'斜線が交差して三角形と六角形を連結する籠目格子',en:'Interlaced diagonals form a connected lattice of triangles and hexagons'},
  'kanoko':{ja:'小さな結び防染の点が群として反復する',en:'Small tied-resist dots repeat in clustered formations'},
  'hanabishi':{ja:'菱形の輪郭内に四弁の花形が収まる',en:'A four-petal floral unit is contained within a lozenge-shaped structure'},
  'same-komon':{ja:'極小の点が高密度に集まり鮫肌状の面をつくる',en:'Extremely fine dense dots create the characteristic shark-skin-like field'},
  'nami-chidori':{ja:'波の曲線と飛ぶ千鳥を一組として読む',en:'Curving waves and flying plovers are read together as the defining motif pair'},
  'tomoe':{ja:'勾玉状の曲線単位が中心の周囲を旋回する',en:'Comma-shaped curved units revolve around a shared center'},
  'shibori':{ja:'防染部のにじみや輪郭の揺らぎが反復に残る',en:'Resist-dyed edges retain characteristic soft halos and irregularity'},
  'batik':{ja:'蝋防染による輪郭と細かなひび割れ状の線が現れる',en:'Wax-resist contours may be accompanied by fine crackle-like lines'},
  'bandhani':{ja:'結び防染の小点が列や幾何・花形を組み立てる',en:'Tiny tied-resist dots assemble into rows, geometric forms, or floral motifs'},
  'ajrakh':{ja:'幾何と植物要素を対称的なブロック反復へ組み込む',en:'Geometric and vegetal motifs are organized into strongly ordered block repeats'},
  'kalamkari':{ja:'植物の蔓や花を流れる線でつなぐ描画的構成',en:'Flowing drawn or printed lines connect vines, flowers, and other pictorial motifs'}
};

for(const p of data.patterns){
  p.common_uses.en=p.common_uses.ja.map(x=>map[x]||x);
  if(p.common_uses.en.some(x=>/[ぁ-んァ-ヶ一-龯]/.test(x)))throw new Error(`${p.pattern_id}: untranslated common use remains: ${p.common_uses.en.join(', ')}`);
  const cue=thirdCue[p.pattern_id];
  if(!cue)throw new Error(`${p.pattern_id}: missing third distinguishing cue`);
  if(!Array.isArray(p.distinguishing_features?.ja)||!Array.isArray(p.distinguishing_features?.en))throw new Error(`${p.pattern_id}: distinguishing feature arrays missing`);
  if(p.distinguishing_features.ja.length<3)p.distinguishing_features.ja.push(cue.ja);
  if(p.distinguishing_features.en.length<3)p.distinguishing_features.en.push(cue.en);
  if(p.distinguishing_features.ja.length<3||p.distinguishing_features.en.length<3)throw new Error(`${p.pattern_id}: 3+ distinguishing features required after normalization`);
}
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log('Wave 4 staging normalized: English common uses and 3+ pattern-specific distinguishing cues for 20 records.');
