(function () {
  'use strict';

  const state = {
    lang: 'ja',
    dict: { old_to_new: {} },
    reverseLookup: new Map(),
    metadata: new Map(),
    compatibilityNotes: new Map(),
    lastAnalysis: null
  };

  const I18N = {
    ja: {
      title: 'Unicode漢字チェッカー', description: '漢字・旧字体・異体字のUnicodeコードポイント、HTMLエンティティ、表示環境の注意、旧字体一覧との対応を確認するためのブラウザ内ツールです。',
      inputLabel: '文字を入力', analyzeBtn: '確認する', copyAll: '全結果をコピー', copyCsv: 'CSV形式でコピー',
      privacyNote: '入力内容はブラウザ内で処理され、外部APIには送信しません。アクセス解析や広告タグが読み込まれる場合があります。',
      relatedLinks: '関連リンク', modernizerLink: '旧字体変換ツールで確認する', resultHeading: 'チェック結果',
      characters: '文字数', unique: '種類', compatibility: '互換漢字', supplementary: '補助平面文字', variation: '異体字セレクタ',
      char: '字', unicode: 'Unicode', decimal: '10進', htmlHex: 'HTML hex', htmlDec: 'HTML decimal', utf16: 'UTF-16',
      oldModern: '旧字体対応', oldCandidates: '旧字体・異体字候補', reading: '読み', meaning: '意味', category: '分類',
      renderNote: '表示環境の注意', summary: '概要', copyNote: 'コピー時の注意', recommended: '確認ポイント',
      copyCharacter: '文字をコピー', copyUnicode: 'Unicodeをコピー', copyHtmlHex: 'HTML hexをコピー', copyHtmlDec: 'HTML decimalをコピー', copyUtf16: 'UTF-16をコピー',
      viewInRef: '旧字体一覧で詳しく見る', cautionHeading: 'Unicode確認時の注意',
      cautionText: 'このツールは文字コード・表示環境の確認を補助する参考ツールです。氏名、地名、戸籍、登記、契約書類、システム登録などで使う場合は、実際の登録字体・保存形式・利用先システムでの表示を確認してください。',
      copied: 'コピーしました', fallbackCompatibility: 'この文字は互換漢字の範囲に含まれるため、環境やフォントによって表示差が出る場合があります。',
      fallbackSupplementary: 'この文字は補助平面の文字です。一部の古い環境やアプリでは正しく表示・保存できない場合があります。',
      fallbackVariation: 'この文字は異体字セレクタを含む可能性があり、対応していない環境では見え方が変わる場合があります。'
    },
    en: {
      title: 'Unicode Kanji Checker', description: 'A browser-side tool for checking Unicode code points, HTML entities, rendering notes, and old/modern kanji mappings for kanji, old forms, and variants.',
      inputLabel: 'Enter characters', analyzeBtn: 'Check characters', copyAll: 'Copy all results', copyCsv: 'Copy as CSV',
      privacyNote: 'Input is processed in the browser and is not sent to an external API. Analytics or ad tags may be loaded on the page.',
      relatedLinks: 'Related links', modernizerLink: 'Check in Kanji Modernizer', resultHeading: 'Check result',
      characters: 'Characters', unique: 'Unique', compatibility: 'Compatibility ideographs', supplementary: 'Supplementary-plane characters', variation: 'Variation selectors',
      char: 'Character', unicode: 'Unicode', decimal: 'Decimal', htmlHex: 'HTML hex', htmlDec: 'HTML decimal', utf16: 'UTF-16',
      oldModern: 'Old/modern mapping', oldCandidates: 'Possible old or variant forms', reading: 'Reading', meaning: 'Meaning', category: 'Category',
      renderNote: 'Rendering note', summary: 'Summary', copyNote: 'Copy note', recommended: 'Recommended check',
      copyCharacter: 'Copy character', copyUnicode: 'Copy Unicode', copyHtmlHex: 'Copy HTML hex', copyHtmlDec: 'Copy HTML decimal', copyUtf16: 'Copy UTF-16',
      viewInRef: 'View in Old Kanji Reference', cautionHeading: 'Important note for Unicode checks',
      cautionText: 'This tool is a reference aid for checking character codes and rendering behavior. For names, place names, family registers, registrations, contracts, or system records, confirm the actual registered glyph, storage format, and rendering in the target system.',
      copied: 'Copied', fallbackCompatibility: 'This character is in a compatibility ideograph range and may render differently depending on the environment or font.',
      fallbackSupplementary: 'This is a supplementary-plane character and may not display or save correctly in some older environments or apps.',
      fallbackVariation: 'This character may include a variation selector, and unsupported environments may render it differently.'
    }
  };

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, text) => { const n = document.createElement(tag); if (typeof text === 'string') n.textContent = text; return n; };

  async function loadData() {
    const base = '../old-kanji-reference/';
    const reqs = [
      fetch(base + 'dict.json').then((r) => r.ok ? r.json() : null),
      loadMetadata(base),
      loadCompatibilityNotes(base)
    ];
    const [dict] = await Promise.all(reqs);
    if (dict && dict.old_to_new) {
      state.dict = dict;
      state.reverseLookup = buildReverseLookupFromOldToNew(dict.old_to_new);
    }
  }

  function buildReverseLookupFromOldToNew(oldToNew) {
    const map = new Map();
    Object.entries(oldToNew || {}).forEach(([oldChar, modernChar]) => {
      if (!map.has(modernChar)) map.set(modernChar, []);
      map.get(modernChar).push(oldChar);
    });
    return map;
  }

  async function loadMetadata(base) {
    const files = ['meta.json', 'meta-extra-2.json', 'meta-extra-3.json', 'meta-extra-4.json', 'meta-extra-5.json', 'meta-extra-6.json'];
    for (const file of files) {
      try {
        const res = await fetch(base + file);
        if (!res.ok) continue;
        const json = await res.json();
        Object.entries(json || {}).forEach(([k, v]) => state.metadata.set(k, v));
      } catch (_e) {}
    }
  }

  async function loadCompatibilityNotes(base) {
    try {
      const res = await fetch(base + 'compatibility-notes.json');
      if (!res.ok) return;
      const json = await res.json();
      Object.entries(json || {}).forEach(([k, v]) => state.compatibilityNotes.set(k, v));
    } catch (_e) {}
  }

  function getCodePointInfo(char) { const cp = char.codePointAt(0); return { codePoint: cp, hex: getCodePointHex(char), decimal: String(cp) }; }
  function getCodePointHex(char) { return `U+${char.codePointAt(0).toString(16).toUpperCase()}`; }
  function getHtmlHexEntity(char) { return `&#x${char.codePointAt(0).toString(16).toUpperCase()};`; }
  function getHtmlDecimalEntity(char) { return `&#${char.codePointAt(0)};`; }
  function getUtf16CodeUnits(char) { return Array.from(char).join('').split('').map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' '); }
  function hasCompatibilityIdeograph(char) { const cp = char.codePointAt(0); return cp >= 0xF900 && cp <= 0xFAFF; }
  function hasSupplementaryPlaneChar(char) { return char.codePointAt(0) > 0xFFFF; }
  function hasVariationSelector(char) { const cp = char.codePointAt(0); return (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF); }

  function getFallbackCompatibilityNote(char) {
    const notes = [];
    if (hasCompatibilityIdeograph(char)) notes.push({ type: 'compat', text: I18N[state.lang].fallbackCompatibility });
    if (hasSupplementaryPlaneChar(char)) notes.push({ type: 'supp', text: I18N[state.lang].fallbackSupplementary });
    if (hasVariationSelector(char)) notes.push({ type: 'vs', text: I18N[state.lang].fallbackVariation });
    return notes;
  }

  function analyzeInput() {
    const raw = $('#inputText').value || '';
    const chars = Array.from(raw).filter((c) => c.trim() !== '');
    const unique = [...new Set(chars)];
    const rows = unique.map((ch) => {
      const info = getCodePointInfo(ch);
      const oldModern = state.dict.old_to_new[ch] || null;
      const oldCandidates = state.reverseLookup.get(ch) || [];
      const meta = state.metadata.get(ch) || {};
      const compatNote = state.compatibilityNotes.get(ch) || null;
      const fallback = getFallbackCompatibilityNote(ch);
      return { ch, ...info, htmlHex: getHtmlHexEntity(ch), htmlDec: getHtmlDecimalEntity(ch), utf16: getUtf16CodeUnits(ch), oldModern, oldCandidates, meta, compatNote, fallback };
    });
    state.lastAnalysis = { raw, chars, rows };
    renderSummary(chars, rows);
    renderCharacterCards(rows);
    renderCautionPanel(chars.length > 0);
    const wrap = $('#modernizerLinkWrap');
    wrap.hidden = chars.length === 0;
    $('#modernizerLink').href = `../kanji-modernizer/?q=${encodeURIComponent(raw)}`;
  }

  function renderSummary(chars, rows) {
    const t = I18N[state.lang];
    const compatCount = rows.filter((r) => hasCompatibilityIdeograph(r.ch)).length;
    const suppCount = rows.filter((r) => hasSupplementaryPlaneChar(r.ch)).length;
    const vsCount = rows.filter((r) => hasVariationSelector(r.ch)).length;
    const sec = $('#summarySection');
    sec.hidden = chars.length === 0;
    sec.innerHTML = '';
    if (!chars.length) return;
    sec.appendChild(el('h2', t.resultHeading));
    [[t.characters, chars.length], [t.unique, rows.length], [t.compatibility, compatCount], [t.supplementary, suppCount], [t.variation, vsCount]].forEach(([k, v]) => {
      const p = el('p'); p.textContent = `${k}: ${v}`; sec.appendChild(p);
    });
  }

  function renderCharacterCards(rows) {
    const sec = $('#cardSection'); sec.innerHTML = '';
    const t = I18N[state.lang];
    rows.forEach((row) => sec.appendChild(renderCharacterCard(row, t)));
  }

  function renderCharacterCard(row, t) {
    const card = el('article'); card.className = 'unicode-card';
    const grid = el('div'); grid.className = 'code-grid';
    const items = [[t.char, row.ch], [t.unicode, row.hex], [t.decimal, row.decimal], [t.htmlHex, row.htmlHex], [t.htmlDec, row.htmlDec], [t.utf16, row.utf16]];
    if (row.oldModern) items.push([t.oldModern, `${row.ch} → ${row.oldModern}`]);
    if (row.oldCandidates.length) items.push([t.oldCandidates, row.oldCandidates.join(', ')]);
    if (row.meta.reading) items.push([t.reading, row.meta.reading]);
    if (row.meta.meaning) items.push([t.meaning, row.meta.meaning]);
    if (row.meta.category) items.push([t.category, row.meta.category]);
    items.forEach(([k, v]) => { const r = el('div'); r.className = 'code-row'; const l = el('strong', `${k}: `); const s = el('span', v); r.append(l, s); grid.appendChild(r); });
    card.appendChild(grid);

    card.appendChild(renderCompatibilityNote(row, t));

    const copy = el('div'); copy.className = 'copy-actions';
    [[t.copyCharacter, row.ch], [t.copyUnicode, row.hex], [t.copyHtmlHex, row.htmlHex], [t.copyHtmlDec, row.htmlDec], [t.copyUtf16, row.utf16]].forEach(([label, text]) => {
      const b = el('button', label); b.type = 'button'; b.addEventListener('click', () => copyText(text)); copy.appendChild(b);
    });
    card.appendChild(copy);

    const link = el('a', t.viewInRef);
    const key = row.oldCandidates[0] || row.ch;
    link.href = `../old-kanji-reference/?q=${encodeURIComponent(key)}`;
    link.rel = 'noopener';
    card.appendChild(link);
    return card;
  }

  function renderCompatibilityNote(row, t) {
    const wrap = el('section'); wrap.className = 'compatibility-note';
    const title = el('h3', t.renderNote); wrap.appendChild(title);
    if (row.compatNote) {
      wrap.appendChild(el('p', `${t.summary}: ${row.compatNote.summary || ''}`));
      wrap.appendChild(el('p', `${t.copyNote}: ${row.compatNote.copy_note || ''}`));
      wrap.appendChild(el('p', `${t.recommended}: ${row.compatNote.recommended_check || ''}`));
      return wrap;
    }
    row.fallback.forEach((n) => wrap.appendChild(el('p', n.text)));
    if (!row.fallback.length) wrap.appendChild(el('p', '-'));
    return wrap;
  }

  function renderCautionPanel(show) {
    const t = I18N[state.lang];
    const sec = $('#cautionSection');
    sec.hidden = !show;
    sec.innerHTML = '';
    if (!show) return;
    sec.append(el('h2', t.cautionHeading), el('p', t.cautionText));
  }

  function setLang(lang) {
    state.lang = lang;
    document.documentElement.lang = lang === 'ja' ? 'ja' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = I18N[lang][node.dataset.i18n] || '';
    });
    const input = $('#inputText');
    input.placeholder = lang === 'ja' ? input.dataset.placeholderJa : input.dataset.placeholderEn;
    document.querySelectorAll('.nw-lang-btn').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    if (state.lastAnalysis) analyzeInput();
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      showToast(I18N[state.lang].copied);
    } catch (_e) {}
  }

  function toCsv(rows) {
    const header = ['character', 'unicode', 'decimal', 'htmlHex', 'htmlDecimal', 'utf16', 'oldModern', 'oldCandidates'];
    const lines = rows.map((r) => [r.ch, r.hex, r.decimal, r.htmlHex, r.htmlDec, r.utf16, r.oldModern || '', r.oldCandidates.join('|')]);
    return [header, ...lines].map((arr) => arr.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(',')).join('\n');
  }

  function showToast(message) {
    const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1400);
  }

  async function init() {
    setLang('ja');
    await loadData();
    $('#analyzeBtn').addEventListener('click', analyzeInput);
    $('#inputText').addEventListener('input', analyzeInput);
    $('#copyAllBtn').addEventListener('click', () => {
      if (!state.lastAnalysis) return;
      copyText(state.lastAnalysis.rows.map((r) => `${r.ch}\t${r.hex}\t${r.htmlHex}\t${r.htmlDec}\t${r.utf16}`).join('\n'));
    });
    $('#copyCsvBtn').addEventListener('click', () => {
      if (!state.lastAnalysis) return;
      copyText(toCsv(state.lastAnalysis.rows));
    });
    document.querySelectorAll('.nw-lang-btn').forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.lang)));
  }

  init();
})();
