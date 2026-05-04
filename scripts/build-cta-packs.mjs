import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'tools/construction-tools-atlas/data');
const packDir = path.join(dataDir, 'packs');
const baseFile = path.join(dataDir, 'tools.basic.json');
const TARGET_TOTAL = 5000;
const PACK_SIZE = 240;

fs.mkdirSync(packDir, { recursive: true });

const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
if (!Array.isArray(base)) throw new Error('tools.basic.json must be a JSON array');

const existingIds = new Set(base.map((x) => x && x.id).filter(Boolean));
const need = Math.max(0, TARGET_TOTAL - base.length);

const domains = [
  ['大工','Carpentry','carpentry'],['内装','Interior','interior'],['外装','Exterior','exterior'],['左官','Plastering','plastering'],['塗装','Painting','painting'],
  ['電気','Electrical','electrical'],['設備','MEP','mep'],['配管','Plumbing','plumbing'],['空調','HVAC','hvac'],['防水','Waterproofing','waterproofing'],
  ['屋根','Roofing','roofing'],['足場','Scaffolding','scaffolding'],['型枠','Formwork','formwork'],['鉄筋','Rebar','rebar'],['コンクリート','Concrete','concrete'],
  ['土工','Earthwork','earthwork'],['解体','Demolition','demolition'],['測量','Surveying','surveying'],['墨出し','Layout','layout'],['安全','Safety','safety'],
  ['建具','Joinery','joinery'],['床','Flooring','flooring'],['天井','Ceiling','ceiling'],['壁','Wall','wall'],['基礎','Foundation','foundation'],
  ['舗装','Paving','paving'],['造園','Landscaping','landscaping'],['金属','Metalwork','metalwork'],['溶接','Welding','welding'],['清掃','Cleaning','cleaning']
];

const nouns = [
  ['工具','tool'],['材料','material'],['部材','component'],['金物','hardware'],['ビス','screw'],['ボルト','bolt'],['ナット','nut'],['アンカー','anchor'],
  ['下地','backing'],['仕上げ','finish'],['目地','joint'],['開口','opening'],['枠','frame'],['板材','board'],['シート','sheet'],['テープ','tape'],
  ['接着剤','adhesive'],['シーリング材','sealant'],['パテ','putty'],['モルタル','mortar'],['コンクリート','concrete'],['鉄筋','rebar'],['型枠','form'],
  ['配管','pipe'],['継手','fitting'],['ダクト','duct'],['ケーブル','cable'],['スイッチ','switch'],['コンセント','outlet'],['照明','lighting'],
  ['防水材','waterproofing material'],['塗料','paint'],['刷毛','brush'],['ローラー','roller'],['養生材','protection material'],['足場材','scaffold component'],
  ['安全具','ppe'],['ヘルメット','hard hat'],['手袋','gloves'],['保護メガネ','safety glasses'],['水平器','level'],['墨つぼ','chalk line'],['レーザー','laser'],
  ['スケール','tape measure'],['定規','ruler'],['丸のこ','circular saw'],['ドリル','drill'],['インパクト','impact driver'],['グラインダー','grinder'],['サンダー','sander'],
  ['カッター','utility knife'],['脚立','stepladder'],['はしご','ladder'],['タッカー','stapler'],['釘','nail'],['ワッシャー','washer'],['プレート','plate'],
  ['ブラケット','bracket'],['レール','rail'],['パネル','panel'],['断熱材','insulation'],['ボード','drywall board'],['合板','plywood'],['コンパネ','form plywood'],
  ['タイル','tile'],['巾木','baseboard'],['見切り','trim'],['笠木','coping'],['水切り','flashing'],['コーナー材','corner bead'],['スペーサー','spacer'],
  ['クランプ','clamp'],['ジャッキ','jack'],['チェーン','chain'],['ワイヤー','wire'],['バルブ','valve'],['ポンプ','pump'],['メーター','meter'],
  ['センサー','sensor'],['カバー','cover'],['キャップ','cap'],['ホース','hose'],['ノズル','nozzle'],['フィルター','filter'],['グリス','grease'],
  ['プライマー','primer'],['錆止め','rust primer'],['溶接棒','welding rod'],['砥石','grinding wheel'],['刃','blade'],['替刃','replacement blade'],['チップソー','tipped saw blade'],
  ['ビット','bit'],['ソケット','socket'],['レンチ','wrench'],['ハンマー','hammer'],['バール','pry bar'],['のみ','chisel'],['かんな','plane'],['やすり','file']
];

const qualifiers = [
  ['標準','standard'],['小型','compact'],['大型','large'],['軽量','lightweight'],['高耐久','heavy-duty'],['防水','waterproof'],['防じん','dust-resistant'],
  ['仮設','temporary'],['仕上げ用','finish'],['下地用','substrate'],['屋外用','outdoor'],['屋内用','indoor'],['高所用','work-at-height'],['狭所用','tight-space'],
  ['交換用','replacement'],['調整用','adjustment'],['固定用','fixing'],['切断用','cutting'],['研磨用','sanding'],['測定用','measuring'],['確認用','inspection'],
  ['補修用','repair'],['施工用','installation'],['撤去用','removal'],['仮止め用','temporary fixing'],['精密','precision'],['粗作業用','rough work'],['耐熱','heat-resistant'],
  ['防錆','rust-resistant'],['省施工','quick-install']
];

const actions = [
  ['切る','cut','cutting'],['削る','grind','grinding'],['締める','fasten','fastening'],['固定する','fix','fixing'],['測る','measure','measuring'],
  ['確認する','inspect','inspection'],['保護する','protect','protection'],['仕上げる','finish','finishing'],['穴をあける','drill','drilling'],['運ぶ','carry','handling'],
  ['塗る','paint','painting'],['埋める','fill','filling'],['ならす','level','leveling'],['組む','assemble','assembly'],['外す','remove','removal'],
  ['養生する','mask','masking'],['接続する','connect','connection'],['支持する','support','supporting'],['調整する','adjust','adjustment'],['清掃する','clean','cleaning']
];

function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }

function buildEntry(i) {
  const d = domains[i % domains.length];
  const n = nouns[Math.floor(i / domains.length) % nouns.length];
  const q = qualifiers[Math.floor(i / (domains.length * nouns.length)) % qualifiers.length];
  const a = actions[Math.floor(i / (domains.length * nouns.length * qualifiers.length)) % actions.length];
  const serial = Math.floor(i / (domains.length * nouns.length * qualifiers.length * actions.length)) + 1;
  const suffix = serial > 1 ? ` ${serial}` : '';
  const id = `pack_${slug(d[2])}_${slug(q[1])}_${slug(n[1])}_${slug(a[2])}_${serial}`;
  const ja = `${d[0]}${q[0]}${n[0]}${suffix}`;
  const en = `${q[1]} ${d[1]} ${n[1]} ${a[1]} term${suffix}`.replace(/\s+/g, ' ').trim();
  const summaryJa = `${ja}：${d[0]}の${a[0]}作業に関する現場用語`;
  const summaryEn = `${en}: a ${d[1].toLowerCase()} term related to ${a[1]} work.`;
  const detailJa = `${ja}は、${d[0]}まわりの${a[0]}作業で確認される現場用語です。用途、材料、周辺部材、施工条件、安全条件を合わせて確認します。`;
  const detailEn = `${en} is a construction reference term used around ${d[1].toLowerCase()} work. Check purpose, material, adjacent components, installation conditions, and safety requirements together.`;
  return {
    id,
    type: 'generated_term',
    term: { ja, en },
    aliases: { ja: [`${q[0]}${n[0]}`, `${d[0]}${n[0]}`], en: [`${q[1]} ${n[1]}`, `${d[1]} ${n[1]}`] },
    description: { ja: detailJa, en: detailEn },
    categories: [d[2], slug(n[1]), slug(q[1])],
    tasks: [a[2], d[2]],
    fuzzy: [d[0], d[1], n[0], n[1], q[0], q[1], a[0], a[1], a[2], ja, en],
    region: ['jp', 'global'],
    summary_ja: summaryJa,
    summary_en: summaryEn,
    detail_ja: detailJa,
    detail_en: detailEn,
    bullets_ja: ['用途と施工条件を確認する。', '安全上の注意点を確認する。'],
    bullets_en: ['Confirm purpose and installation conditions.', 'Check relevant safety points.'],
    examples: { ja: [`${ja}を使う場面を確認する。`, `${d[0]}作業で${n[0]}の状態を確認する。`], en: [`Check when ${en} is used.`, `Confirm ${n[1]} conditions during ${d[1].toLowerCase()} work.`] },
    summary: { ja: summaryJa, en: summaryEn },
    bullets: { ja: ['用途と施工条件を確認する。', '安全上の注意点を確認する。'], en: ['Confirm purpose and installation conditions.', 'Check relevant safety points.'] },
    meta: { generated: true, batch: 'split-pack-5000' }
  };
}

const generated = [];
let i = 0;
while (generated.length < need) {
  const item = buildEntry(i++);
  if (existingIds.has(item.id)) continue;
  existingIds.add(item.id);
  generated.push(item);
}

for (const old of fs.readdirSync(packDir).filter((name) => /^pack-\d+\.json$/.test(name) || name === 'manifest.json')) {
  fs.unlinkSync(path.join(packDir, old));
}

const files = [];
for (let start = 0, packNo = 1; start < generated.length; start += PACK_SIZE, packNo += 1) {
  const items = generated.slice(start, start + PACK_SIZE);
  const filename = `pack-${String(packNo).padStart(3, '0')}.json`;
  fs.writeFileSync(path.join(packDir, filename), `${JSON.stringify(items, null, 2)}\n`);
  files.push(filename);
}

const manifest = { version: 1, base: '../tools.basic.json', totalTarget: TARGET_TOTAL, packSize: PACK_SIZE, files };
fs.writeFileSync(path.join(packDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`base=${base.length}, generated=${generated.length}, packs=${files.length}, target=${base.length + generated.length}`);
