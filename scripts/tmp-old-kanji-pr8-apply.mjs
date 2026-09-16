import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const dictPath = 'tools/old-kanji-reference/dict.json';
let raw = fs.readFileSync(dictPath, 'utf8');

function replaceOnce(before, after, label) {
  const first = raw.indexOf(before);
  if (first < 0) throw new Error(`Missing expected text for ${label}`);
  if (raw.indexOf(before, first + before.length) >= 0) throw new Error(`Expected exactly one match for ${label}`);
  raw = raw.slice(0, first) + after + raw.slice(first + before.length);
}

replaceOnce('    "據": "据",\n', '', 'remove conflicting 據→据 duplicate');
replaceOnce('    "獨": "獨",\n', '    "獨": "独",\n', 'repair 獨→独');
replaceOnce('    "頰": "頬",\n', '', 'remove unsafe 頰→頬 auto-conversion');
replaceOnce('    "驪": "麗",\n', '', 'remove unsafe 驪→麗 auto-conversion');

replaceOnce('    "体": ["體"],\n', '    "体": ["體","躰"],\n    "村": ["邨"],\n', 'add verified variant reverse entries for 躰 and 邨');
replaceOnce('    "据": ["據"],\n', '', 'remove wrong 據 reverse target');
replaceOnce('    "淚": ["淚"],\n', '    "涙": ["淚"],\n', 'repair 淚 reverse target');
replaceOnce('    "獣": ["獸"],\n', '    "獣": ["獸"],\n    "独": ["獨"],\n', 'add 獨 reverse');
replaceOnce('    "魯": ["魯","虜","魯"],\n', '    "虜": ["虜"],\n    "魯": ["魯","魯"],\n', 'repair compatibility ideograph 虜 reverse');
replaceOnce('    "藝": ["藝"],\n', '', 'remove wrong 藝 self reverse');
replaceOnce('    "覇": ["覇"],\n', '    "覇": ["覇","霸"],\n', 'add 霸 reverse');
replaceOnce('    "難": ["難","難"],\n', '    "雑": ["雜"],\n    "難": ["難","難"],\n', 'add 雜 reverse');
replaceOnce('    "願": ["願"],\n', '    "顔": ["顏"],\n    "顕": ["顯"],\n    "願": ["願"],\n', 'add 顏 and 顯 reverse');
replaceOnce('    "髪": ["髮"],\n', '    "髄": ["髓"],\n    "髪": ["髮"],\n', 'add 髓 reverse');
replaceOnce('    "黒": ["黑"]\n', '    "黒": ["黑"],\n    "斎": ["齋"],\n    "齢": ["齡"],\n    "歯": ["齒"]\n', 'add 齋 齡 齒 reverse');

JSON.parse(raw);
fs.writeFileSync(dictPath, raw);

const evidence = {
  version: '2026-09-16-pr8-1',
  basis: 'authoritative_external_verification',
  policy: 'Only record-level repairs supported by primary or authoritative character sources are applied. NFKC and model inference are not evidence.',
  records: [
    { source: '藝', beforeTarget: '芸', afterTarget: '芸', action: 'keep_forward_remove_wrong_self_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '芸（藝）', establishes: '藝 is the parenthesized old form associated with the common-use form 芸.' },
    { source: '據', beforeTarget: '据', afterTarget: '拠', action: 'remove_conflicting_duplicate_and_wrong_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '拠（據）', establishes: 'The authoritative old/new-form pair is 拠（據）; JSON last-write 據→据 is not authoritative.' },
    { source: '淚', beforeTarget: '涙', afterTarget: '涙', action: 'repair_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '涙（淚）', establishes: '淚 is the old form associated with 涙.' },
    { source: '獨', beforeTarget: '獨', afterTarget: '独', action: 'repair_forward_and_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '独（獨）', establishes: '獨 is the old form associated with 独.' },
    { source: '髓', beforeTarget: '髄', afterTarget: '髄', action: 'add_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '髄（髓）', establishes: '髓 is the old form associated with 髄.' },
    { source: '虜', beforeTarget: '虜', afterTarget: '虜', action: 'repair_reverse_and_remove_wrong_魯_association', relation: 'unicode_compatibility', authority: 'Unicode Consortium NamesList', url: 'https://www.unicode.org/charts/nameslist/n_F900.html', locator: 'U+F936 ≡ U+865C 虜', establishes: 'U+F936 虜 has compatibility equivalence to U+865C 虜, not 魯.' },
    { source: '躰', beforeTarget: '体', afterTarget: '体', action: 'add_reverse', relation: 'variant', authority: '厚生労働省 異体字検索漢字リスト', url: 'https://licenseif.mhlw.go.jp/search_iyaku/html/itaiji.pdf', locator: '正字 体 / 異体字等 躰・體', establishes: '躰 is listed as a variant under the standard character 体.' },
    { source: '邨', beforeTarget: '村', afterTarget: '村', action: 'add_reverse', relation: 'semantic_variant', authority: 'Unicode Consortium Unihan variant data', url: 'https://www.unicode.org/L2/L2022/22070-fdbk.html', locator: 'U+6751 kSemanticVariant U+90A8', establishes: '村 and 邨 are linked as semantic variants; this is not labeled a Japanese old/new-form pair.' },
    { source: '霸', beforeTarget: '覇', afterTarget: '覇', action: 'add_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '覇（霸）', establishes: '霸 is the old form associated with 覇.' },
    { source: '雜', beforeTarget: '雑', afterTarget: '雑', action: 'add_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '雑（雜）', establishes: '雜 is the old form associated with 雑.' },
    { source: '頰', beforeTarget: '頬', afterTarget: null, action: 'remove_from_auto_conversion_forward', relation: 'current_form_with_accepted_variant', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '字体注記: 通用字体「頰」に対する「頬」などの使用も差し支えない', establishes: '頰 is the table common-use form; 頬 is an accepted alternate rendering, so 頰→頬 must not be treated as modernization.' },
    { source: '顏', beforeTarget: '顔', afterTarget: '顔', action: 'add_reverse', relation: 'old_to_modern', authority: '漢字ペディア（日本漢字能力検定協会）', url: 'https://www.kanjipedia.jp/kanji/0001169700', locator: '顔 / 旧字 顏', establishes: 'The dictionary explicitly labels 顏 as the old form of 顔.' },
    { source: '顯', beforeTarget: '顕', afterTarget: '顕', action: 'add_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '顕（顯）', establishes: '顯 is the old form associated with 顕.' },
    { source: '驪', beforeTarget: '麗', afterTarget: null, action: 'remove_from_auto_conversion_forward', relation: 'distinct_character', authorities: [
      { authority: 'Unicode Consortium NamesList', url: 'https://www.unicode.org/charts/nameslist/n_F900.html', locator: 'U+F987 ≡ U+9A6A 驪; U+F988 ≡ U+9E97 麗' },
      { authority: '漢字ペディア（日本漢字能力検定協会）', url: 'https://www.kanjipedia.jp/kanji/0007099500', locator: '驪: くろうま・くろい・ならべる' }
    ], establishes: 'Unicode assigns separate unified characters and separate compatibility ideographs to 驪 and 麗; dictionary semantics for 驪 are independent. The destructive 驪→麗 mapping is unsupported.' },
    { source: '齋', beforeTarget: '斎', afterTarget: '斎', action: 'add_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '斎（齋）', establishes: '齋 is the old form associated with 斎.' },
    { source: '齡', beforeTarget: '齢', afterTarget: '齢', action: 'add_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '齢（齡）', establishes: '齡 is the old form associated with 齢.' },
    { source: '齒', beforeTarget: '歯', afterTarget: '歯', action: 'add_reverse', relation: 'old_to_modern', authority: '文化庁 常用漢字表', url: 'https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf', locator: '歯（齒）', establishes: '齒 is the old form associated with 歯.' }
  ]
};

fs.writeFileSync('tools/old-kanji-reference/dictionary-repair-evidence.json', `${JSON.stringify(evidence, null, 2)}\n`);
execFileSync(process.execPath, ['scripts/build-old-kanji-dictionary-audit.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/build-old-kanji-dictionary-audit.mjs', '--check'], { stdio: 'inherit' });

const generatedAudit = JSON.parse(fs.readFileSync('tools/old-kanji-reference/dictionary-audit.json', 'utf8'));
if (generatedAudit.summary.issueRecords !== 0) throw new Error(`Expected issueRecords=0, got ${generatedAudit.summary.issueRecords}`);
if (generatedAudit.summary.conflictingRawDuplicateKeys !== 0) throw new Error(`Expected conflictingRawDuplicateKeys=0, got ${generatedAudit.summary.conflictingRawDuplicateKeys}`);
if (generatedAudit.summary.reverseIssues >= 53) throw new Error(`Expected reverse issues to decrease from 53, got ${generatedAudit.summary.reverseIssues}`);

fs.rmSync('scripts/tmp-old-kanji-pr8-apply.mjs');
fs.rmSync('.github/workflows/old-kanji-pr8-apply.yml');
