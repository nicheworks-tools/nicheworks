import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, "tools");
const REVIEW_INDEX_PATH = path.join(TOOLS_DIR, "tools-index-review.json");

const EXCLUDE = new Set(["_codex", "_template"]);

const REVIEW_ONLY_SLUGS = new Set([
  "json-repair",
  "json2mermaid",
  "pdf2csv-local",
  "pdf-page-tools-mini",
  "csv-tidy",
  "exif-cleaner-mini",
  "image-redact",
  "filetype-sniffer",
  "api-key-token-redactor",
  "command-safety-checker",
  "manual-finder",
  "old-kanji-reference",
  "kanji-modernizer",
  "laundry-code-decode",
  "unitmaster",
  "linebreak-doctor",
  "log-formatter",
  "color-replace"
]);

const FALLBACK_META = {
  "json-repair": ["JSON Repair", "JSON修復ツール", "Repair broken JSON and show safer copy-and-paste candidates.", "壊れたJSONを修正候補つきで整え、コピーしやすい形にします。", ["json", "repair", "developer", "format"]],
  "json2mermaid": ["JSON to Mermaid", "JSONからMermaid図", "Convert JSON structures into Mermaid diagrams for documentation.", "JSON構造をMermaid図へ変換し、データ構造を把握しやすくします。", ["json", "mermaid", "diagram", "docs"]],
  "pdf2csv-local": ["PDF to CSV Local", "PDF表CSV変換ローカル", "Extract table-like PDF data into CSV-style output locally.", "PDF内の表データをローカル処理でCSV化します。", ["pdf", "csv", "table", "local"]],
  "pdf-page-tools-mini": ["PDF Page Tools Mini", "PDFページ操作ミニ", "Split, reorder, remove, or prepare PDF pages in the browser.", "PDFページの分割、並べ替え、削除などを行います。", ["pdf", "pages", "split", "browser"]],
  "csv-tidy": ["CSV Tidy", "CSV整形ツール", "Reorder, rename, trim, and clean CSV columns in the browser.", "CSVの列並べ替え、列名変更、空白トリムを行います。", ["csv", "tidy", "columns", "data"]],
  "exif-cleaner-mini": ["EXIF Cleaner Mini", "EXIF削除ミニ", "Remove image metadata before sharing photos or screenshots.", "写真共有前にEXIFなどのメタデータを確認・削除します。", ["exif", "image", "metadata", "privacy"]],
  "image-redact": ["Image Redact", "画像ぼかし・黒塗りツール", "Hide sensitive parts of screenshots with blur, mosaic, or black boxes.", "スクリーンショットや画像の一部をぼかし・黒塗りで隠します。", ["image", "redact", "privacy", "screenshot"]],
  "filetype-sniffer": ["FileType Sniffer", "ファイル種別判定ツール", "Inspect file signatures and estimate file types locally.", "ファイルの先頭情報から種類を推定します。", ["file", "type", "sniffer", "privacy"]],
  "api-key-token-redactor": ["API Key Token Redactor", "APIキー・トークン伏せ字ツール", "Detect and mask API keys, tokens, and secrets before sharing text or logs.", "共有前のテキストからAPIキーやトークンらしき値を検出してマスクします。", ["api", "token", "secret", "redact"]],
  "command-safety-checker": ["Command Safety Checker", "コマンド安全確認ツール", "Check shell commands for risky operations before running them.", "実行前のコマンドに危険操作が含まれないか確認します。", ["command", "shell", "safety", "terminal"]],
  "manual-finder": ["ManualFinder", "公式マニュアル検索補助", "Help find official manuals and support pages.", "公式マニュアル・サポートページ探しを補助します。", ["manual", "support", "search", "life"]],
  "old-kanji-reference": ["Old Kanji Reference", "旧字体一覧・旧字新字対応表", "Search old Japanese kanji forms and compare them with modern equivalents.", "旧字体と新字体の対応を検索できる一覧です。", ["kanji", "old-kanji", "japanese", "reference"]],
  "kanji-modernizer": ["Kanji Modernizer", "旧字体変換ツール", "Convert or compare old Japanese kanji forms with modern forms.", "旧字体と新字体を比較・変換します。", ["kanji", "japanese", "old-kanji", "convert"]],
  "laundry-code-decode": ["Laundry Code Decode", "洗濯表示コード読み解き", "Decode laundry symbols and care-label notes.", "洗濯表示やケアラベルの意味を確認します。", ["laundry", "clothing", "symbols", "life"]],
  "unitmaster": ["UnitMaster", "単位換算ツール", "Convert common units such as length, weight, temperature, and volume.", "長さ、重さ、温度などの単位換算を行います。", ["unit", "convert", "calculator", "utility"]],
  "linebreak-doctor": ["Linebreak Doctor", "改行整形ドクター", "Fix awkward line breaks in pasted text.", "貼り付け前の不自然な改行を整えます。", ["text", "linebreak", "format", "writing"]],
  "log-formatter": ["Log Formatter", "ログ整形ツール", "Format pasted logs so errors and timestamps are easier to inspect.", "ログを読みやすく整え、エラー確認を補助します。", ["log", "formatter", "developer", "debug"]],
  "color-replace": ["Color Replace", "画像カラー置換ツール", "Replace or compare colors in simple images directly in the browser.", "画像内の色をブラウザ上で確認・置換します。", ["image", "color", "replace", "browser"]]
};

const titleCase = (slug) => slug.split("-").map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(" ");
const fallbackDescEn = (slug) => `${titleCase(slug)} is a NicheWorks browser tool. Use it as a lightweight utility and verify important results yourself.`;
const fallbackDescJa = (slug) => `${titleCase(slug)} はNicheWorksのブラウザ用軽量ツールです。重要な結果は必ず利用者自身で確認してください。`;

const isToolDir = (name) => {
  if (!name) return false;
  if (name.startsWith(".")) return false;
  if (name.startsWith("_")) return false;
  if (EXCLUDE.has(name)) return false;
  const p = path.join(TOOLS_DIR, name);
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

const readReviewIndex = () => {
  if (!existsSync(REVIEW_INDEX_PATH)) return new Map();
  try {
    const data = JSON.parse(readFileSync(REVIEW_INDEX_PATH, "utf-8"));
    return new Map((data.items || []).map((item) => [item.slug, item]));
  } catch {
    return new Map();
  }
};

const reviewMap = readReviewIndex();
const dirs = readdirSync(TOOLS_DIR)
  .filter(isToolDir)
  .filter((slug) => REVIEW_ONLY_SLUGS.has(slug))
  .sort((a, b) => a.localeCompare(b));

const buildItem = (slug) => {
  const review = reviewMap.get(slug);
  if (review) {
    return {
      slug,
      title_en: review.title_en || titleCase(slug),
      title_ja: review.title_ja || review.title_en || titleCase(slug),
      desc_en: review.desc_en || fallbackDescEn(slug),
      desc_ja: review.desc_ja || fallbackDescJa(slug),
      tags: Array.isArray(review.tags) ? review.tags : []
    };
  }

  const metaPath = path.join(TOOLS_DIR, slug, "meta.json");
  let meta = {};
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    } catch {
      meta = {};
    }
  }

  const fallback = FALLBACK_META[slug] || [];
  return {
    slug,
    title_en: meta.title_en || fallback[0] || titleCase(slug),
    title_ja: meta.title_ja || fallback[1] || meta.title_en || titleCase(slug),
    desc_en: meta.desc_en || fallback[2] || fallbackDescEn(slug),
    desc_ja: meta.desc_ja || fallback[3] || fallbackDescJa(slug),
    tags: Array.isArray(meta.tags) && meta.tags.length ? meta.tags : (fallback[4] || [])
  };
};

const items = dirs.map(buildItem);
const out = {
  generatedAt: "2026-05-12T00:00:00.000Z",
  reviewMode: true,
  total: items.length,
  items
};

writeFileSync(path.join(TOOLS_DIR, "tools-index.json"), JSON.stringify(out, null, 2) + "\n", "utf-8");
console.log(`OK: tools/tools-index.json updated. total=${items.length}`);
