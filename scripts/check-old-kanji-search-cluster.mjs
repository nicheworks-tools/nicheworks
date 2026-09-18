import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const contracts = {
  'old-kanji-reference': {
    title: '旧字体検索・旧字体一覧｜旧字と新字体を無料で調べる | NicheWorks',
    h1: '旧字体検索・旧字体一覧',
    desc: ['旧字体・旧字を1文字から検索', '一覧', '無料'],
    spec: ['look up one old/new kanji pair', '旧字体 一覧', '旧字体 検索'],
  },
  'kanji-modernizer': {
    title: '旧字体変換・旧漢字変換｜新字体⇄旧字体を無料で一括変換 | NicheWorks',
    h1: '旧字体変換・旧漢字変換',
    desc: ['一括変換', '無料', '辞書ベース'],
    spec: ['convert pasted text', '旧字体 変換', '旧字 新字 変換'],
  },
  'old-kanji-ocr-scanner': {
    title: '旧字体OCRスキャナー｜画像から旧字を読み取る | NicheWorks',
    h1: '旧字体OCRスキャナー',
    desc: ['日本語OCR', '旧字体・異体字', '無料'],
    spec: ['photographed/scanned image', '旧字体 OCR', '画像 旧字体 読み取り'],
  },
  'old-document-kanji-highlighter': {
    title: '古文書旧字体ハイライター｜Old Document Kanji Highlighter | NicheWorks',
    h1: '古文書旧字体ハイライター',
    desc: ['古い文章', '旧字体・異体字', 'ハイライト'],
    spec: ['historical-style text', '古文書 旧字体', '旧字体 ハイライト'],
  },
  'unicode-kanji-checker': {
    title: 'Unicode漢字チェッカー | Unicode Kanji Checker | NicheWorks',
    h1: 'Unicode漢字チェッカー',
    desc: ['Unicodeコードポイント', 'HTMLエンティティ', '表示環境'],
    spec: ['code points', '漢字 Unicode', '旧字体 Unicode'],
  },
  'variant-kanji-compare': {
    title: '異体字比較ツール | Variant Kanji Compare | NicheWorks',
    h1: '異体字比較ツール',
    desc: ['見た目が近い', '字形差', '表示環境'],
    spec: ['compare visually similar', '異体字 比較', '漢字 字形 比較'],
  },
  'place-old-kanji-checker': {
    title: '地名旧字体チェッカー | Place Old Kanji Checker | NicheWorks',
    h1: '地名旧字体チェッカー',
    desc: ['地名・住所・駅名', '旧字体・異体字候補', '登録表記'],
    spec: ['place/address/station', '地名 旧字体', '住所 旧字体'],
  },
  'name-old-kanji-checker': {
    title: '名前の旧字体・異体字を調べる｜人名旧字体チェッカー | NicheWorks',
    h1: '名前の旧字体・異体字を調べる',
    desc: ['名前', '旧字体・異体字候補', '戸籍'],
    spec: ['personal-name text', '名前 旧字体', '人名 旧字体'],
  },
};

function textContent(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

for (const [slug, contract] of Object.entries(contracts)) {
  const dir = path.join(root, 'tools', slug);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const spec = fs.readFileSync(path.join(dir, 'SPEC.md'), 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] || '';
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] || '';
  const h1Html = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '';
  const h1 = textContent(h1Html);
  const expectedCanonical = `https://nicheworks.app/tools/${slug}/`;

  check(title === contract.title, `${slug}: title drift (got "${title}")`);
  check(canonical === expectedCanonical, `${slug}: canonical drift (got "${canonical}")`);
  check(h1.includes(contract.h1), `${slug}: H1 does not preserve its cluster role`);
  for (const phrase of contract.desc) check(description.includes(phrase), `${slug}: description missing "${phrase}"`);
  check(html.includes('"@type":"WebApplication"') || /"@type"\s*:\s*"WebApplication"/.test(html), `${slug}: WebApplication schema missing`);
  check(html.includes(`"url":"${expectedCanonical}"`) || html.includes(`"url": "${expectedCanonical}"`), `${slug}: WebApplication URL drift`);

  check(spec.includes('## Search cluster role'), `${slug}: SPEC search cluster role missing`);
  for (const phrase of contract.spec) check(spec.includes(phrase), `${slug}: SPEC search role missing "${phrase}"`);

  if (slug !== 'old-kanji-reference') {
    check(!title.includes('旧字体検索') && !title.includes('旧字体一覧'), `${slug}: non-reference page is cannibalizing generic lookup/list intent`);
  }
}

const ocrHtml = fs.readFileSync(path.join(root, 'tools/old-kanji-ocr-scanner/index.html'), 'utf8');
const ocrApp = fs.readFileSync(path.join(root, 'tools/old-kanji-ocr-scanner/app.js'), 'utf8');
for (const stale of ['準備画面', 'This initial version', 'later OCR/detection flows', '初期版では日本語OCR', 'The initial version assumes Japanese OCR']) {
  check(!ocrHtml.includes(stale) && !ocrApp.includes(stale), `OCR stale pre-live copy remains: ${stale}`);
}

const titles = Object.keys(contracts).map((slug) => {
  const html = fs.readFileSync(path.join(root, 'tools', slug, 'index.html'), 'utf8');
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
});
check(new Set(titles).size === titles.length, 'Old Kanji cluster contains duplicate page titles');

if (failures.length) {
  console.error(`Old Kanji search-cluster reconciliation failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji search-cluster reconciliation passed for 8 tools.');
