const state = {
  lang: 'ja',
  dict: null,
  reverse: new Map(),
  metadata: new Map(),
  compatibility: new Map(),
  shapeNotes: new Map(),
  strokeCounts: new Map(),
  dataStatus: 'loading'
};

async function loadData() {
  state.dataStatus = 'loading';
  const dictRes = await fetch('../old-kanji-reference/dict.json');
  if (!dictRes.ok) {
    state.dataStatus = 'error';
    throw new Error('dict load failed');
  }
  state.dict = await dictRes.json();
  state.reverse = buildReverseLookupFromOldToNew(state.dict.old_to_new || {});
  const [metadataOk, compatibilityOk] = await Promise.all([loadMetadata(), loadCompatibilityNotes()]);
  state.dataStatus = metadataOk && compatibilityOk ? 'ready' : 'partial_error';
  return state.dataStatus;
}

function addReverseCandidate(map, modernForm, oldForm) {
  if (!modernForm || !oldForm) return;
  const candidates = map.get(modernForm) || [];
  if (!candidates.includes(oldForm)) {
    candidates.push(oldForm);
    map.set(modernForm, candidates);
  }
}

function buildReverseLookupFromOldToNew(oldToNew) {
  const map = new Map();
  Object.entries(oldToNew || {}).forEach(([oldForm, modernValue]) => {
    const modernForms = Array.isArray(modernValue) ? modernValue : [modernValue];
    modernForms.forEach((modernForm) => addReverseCandidate(map, modernForm, oldForm));
  });
  return map;
}

function getMetadataFields(meta, lang = state.lang) {
  if (!meta) return {};
  const ja = lang === 'ja';
  return {
    reading: ja ? (meta.readingJa || meta.readingEn || meta.reading || '') : (meta.readingEn || meta.readingJa || meta.reading || ''),
    meaning: ja ? (meta.meaningJa || meta.meaningEn || meta.meaning || '') : (meta.meaningEn || meta.meaningJa || meta.meaning || ''),
    usage: ja ? (meta.usageJa || meta.usageEn || meta.usage || '') : (meta.usageEn || meta.usageJa || meta.usage || ''),
    category: meta.category || ''
  };
}

function getShapeText(shape, lang = state.lang) {
  if (!shape) return '';
  if (typeof shape === 'string') return shape;
  return lang === 'ja'
    ? (shape.structureJa || shape.differenceJa || shape.noteJa || shape.summary || '')
    : (shape.structureEn || shape.differenceEn || shape.noteEn || shape.summary || '');
}

function getStrokeText(stroke, lang = state.lang) {
  if (!stroke) return '';
  if (typeof stroke === 'number') return String(stroke);
  if (stroke.oldStrokes == null && stroke.modernStrokes == null && stroke.difference == null) {
    return stroke.old != null ? String(stroke.old) : '';
  }
  return lang === 'ja'
    ? `旧字 ${stroke.oldStrokes ?? '-'} / 新字 ${stroke.modernStrokes ?? '-'} / 差 ${stroke.difference ?? '-'}`
    : `old ${stroke.oldStrokes ?? '-'} / modern ${stroke.modernStrokes ?? '-'} / difference ${stroke.difference ?? '-'}`;
}

function getLocalizedCompatibilityFields(note, lang = state.lang) {
  if (!note) return { summary: '', copyNote: '', recommended: '' };
  const ja = lang === 'ja';
  return {
    summary: note.summary || (ja ? (note.summaryJa || note.summaryEn) : (note.summaryEn || note.summaryJa)) || '',
    copyNote: note.copyNote || (ja ? (note.copyNoteJa || note.copyNoteEn) : (note.copyNoteEn || note.copyNoteJa)) || '',
    recommended: note.recommendedCheck || (ja ? (note.recommendedCheckJa || note.recommendedCheckEn) : (note.recommendedCheckEn || note.recommendedCheckJa)) || ''
  };
}

function buildConverterHref(input) {
  return `../kanji-modernizer/?q=${encodeURIComponent(input || '')}`;
}

async function loadMetadata() {
  const files = ['meta.json', 'meta-extra-2.json', 'meta-extra-3.json', 'meta-extra-4.json', 'meta-extra-5.json', 'meta-extra-6.json'];
  let ok = true;
  for (const file of files) {
    try {
      const res = await fetch(`../old-kanji-reference/${file}`);
      if (!res.ok) { ok = false; continue; }
      const json = await res.json();
      const entries = json.entries || {};
      Object.entries(entries).forEach(([char, meta]) => state.metadata.set(char, meta));
    } catch (_) { ok = false; }
  }
  try {
    const shape = await fetch('../old-kanji-reference/shape-notes.json');
    if (shape.ok) {
      Object.entries((await shape.json()).entries || {}).forEach(([k, v]) => state.shapeNotes.set(k, v));
    } else {
      ok = false;
    }
  } catch (_) { ok = false; }
  try {
    const stroke = await fetch('../old-kanji-reference/stroke-counts.json');
    if (stroke.ok) {
      Object.entries((await stroke.json()).entries || {}).forEach(([k, v]) => state.strokeCounts.set(k, v));
    } else {
      ok = false;
    }
  } catch (_) { ok = false; }
  return ok;
}

async function loadCompatibilityNotes() {
  try {
    const res = await fetch('../old-kanji-reference/compatibility-notes.json');
    if (!res.ok) return false;
    const json = await res.json();
    Object.entries(json.entries || {}).forEach(([k, v]) => state.compatibility.set(k, v));
    return true;
  } catch (_) {
    return false;
  }
}

function getFallbackCompatibilityNote(char) {
  const cp = char.codePointAt(0);
  if ((cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF)) {
    return { summaryJa:'異体字セレクタです。', summaryEn:'Variation Selector.', copyNoteJa:'対応していない環境では字形指定が失われる場合があります。', copyNoteEn:'Unsupported environments may lose the glyph variation.', recommendedCheckJa:'利用先の対応状況を確認', recommendedCheckEn:'Check target-system support.' };
  }
  if ((cp >= 0xF900 && cp <= 0xFAFF) || (cp >= 0x2F800 && cp <= 0x2FA1F)) {
    return { summaryJa:'CJK互換漢字です。', summaryEn:'CJK Compatibility Ideograph.', copyNoteJa:'環境差に注意', copyNoteEn:'Watch rendering differences.', recommendedCheckJa:'自治体・郵便・登記表記を照合', recommendedCheckEn:'Cross-check official records.' };
  }
  if (cp > 0xFFFF) {
    return { summaryJa:'補助平面の文字です。', summaryEn:'Supplementary-plane character.', copyNoteJa:'文字化けの可能性あり', copyNoteEn:'May not render everywhere.', recommendedCheckJa:'フォント差を確認', recommendedCheckEn:'Check font support.' };
  }
  return null;
}

function analyzeInput() {
  const input = document.getElementById('placeInput').value;
  const resultList = document.getElementById('resultList');
  const summary = document.getElementById('resultSummary');
  const converterLink = document.getElementById('converterLink');
  const converterAnchor = document.getElementById('converterAnchor');
  resultList.innerHTML = '';
  if (!input.trim()) { summary.hidden = true; document.getElementById('cautionPanel').hidden = true; converterLink.hidden = true; return; }
  if (!state.dict || state.dataStatus === 'loading' || state.dataStatus === 'error') {
    summary.hidden = true;
    document.getElementById('cautionPanel').hidden = true;
    converterLink.hidden = true;
    return;
  }

  let found = false;
  [...input].forEach((char) => {
    const card = renderResultCard(char);
    if (card) { found = true; resultList.appendChild(card); }
  });
  summary.hidden = false;
  summary.innerHTML = `<h2>${state.lang === 'ja' ? 'チェック結果' : 'Check result'}</h2><p>${found
    ? (state.lang === 'ja' ? '地名・住所で見かける可能性がある旧字体・異体字候補が見つかりました。' : 'Old or variant kanji candidates that may appear in place names or addresses were found.')
    : (state.lang === 'ja' ? '登録済みの旧字体・異体字候補は見つかりませんでした。' : 'No registered old or variant kanji candidates were found.')}</p>`;

  renderCautionPanel();
  converterLink.hidden = false;
  converterAnchor.href = buildConverterHref(input);
}

function renderResultCard(char) {
  const oldToNew = state.dict?.old_to_new || {};
  const oldMatch = oldToNew[char];
  const reverseCandidates = state.reverse.get(char) || [];
  if (!oldMatch && reverseCandidates.length === 0) return null;

  const card = document.createElement('article');
  card.className = 'place-result-card';
  const modernForms = oldMatch ? (Array.isArray(oldMatch) ? oldMatch : [oldMatch]) : [];
  const modernText = modernForms.filter(Boolean).join(' / ');
  const metaKey = oldMatch ? char : reverseCandidates[0];
  const meta = state.metadata.get(metaKey) || {};
  const metaFields = getMetadataFields(meta);
  const compatibility = state.compatibility.get(metaKey) || getFallbackCompatibilityNote(char);
  const shape = state.shapeNotes.get(metaKey);
  const stroke = state.strokeCounts.get(metaKey);

  const candidateText = oldMatch ? `${char} → ${modernText}` : `${char} ${state.lang === 'ja' ? 'の旧字体・異体字候補' : 'candidates'}: ${reverseCandidates.join('、')}`;
  const details = [];
  if (metaFields.reading) details.push(`<div>${state.lang === 'ja' ? '読み' : 'Reading'}: ${metaFields.reading}</div>`);
  if (metaFields.meaning) details.push(`<div>${state.lang === 'ja' ? '意味' : 'Meaning'}: ${metaFields.meaning}</div>`);
  if (metaFields.category) details.push(`<div>${state.lang === 'ja' ? '候補種別' : 'Candidate type'}: ${metaFields.category}</div>`);
  if (metaFields.usage) details.push(`<div>${state.lang === 'ja' ? '用途' : 'Usage'}: ${metaFields.usage}</div>`);
  if (!details.length) details.push(`<div>${state.lang === 'ja' ? '登録データなし' : 'No data in current reference'}</div>`);

  const referenceChar = oldMatch ? char : reverseCandidates[0];
  card.innerHTML = `<h3>${candidateText}</h3>${details.join('')}
  <div class="copy-actions">
    <button type="button" data-copy="${char}">${state.lang === 'ja' ? '入力字をコピー' : 'Copy input character'}</button>
    ${oldMatch ? `<button type="button" data-copy="${modernText}">${state.lang === 'ja' ? '現代表記をコピー' : 'Copy modern form'}</button><button type="button" data-copy="${char}">${state.lang === 'ja' ? '候補をコピー' : 'Copy candidate'}</button>` : `<button type="button" data-copy="${reverseCandidates.join('、')}">${state.lang === 'ja' ? '候補一覧をコピー' : 'Copy all candidates'}</button>`}
  </div>
  <p class="reference-links"><a href="../old-kanji-reference/?q=${encodeURIComponent(referenceChar)}">${state.lang === 'ja' ? '旧字体一覧で詳しく見る' : 'View in Old Kanji Reference'}</a></p>`;

  const shapeText = getShapeText(shape);
  const strokeText = getStrokeText(stroke);
  if (shapeText || strokeText) {
    card.innerHTML += `<div class="candidate-list">${shapeText ? `<div>${state.lang === 'ja' ? '形の見比べ' : 'Shape comparison'}: ${shapeText}</div>` : ''}${strokeText ? `<div>${state.lang === 'ja' ? '画数の目安' : 'Stroke count reference'}: ${strokeText}</div>` : ''}</div>`;
  }
  if (compatibility) {
    card.appendChild(renderCompatibilityNote(compatibility));
  }

  card.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', () => copyText(btn.dataset.copy)));
  return card;
}

function renderCompatibilityNote(note) {
  const block = document.createElement('div');
  block.className = 'compatibility-note';
  const { summary, copyNote, recommended } = getLocalizedCompatibilityFields(note);
  block.innerHTML = `<strong>${state.lang === 'ja' ? '表示環境の注意' : 'Rendering note'}</strong><div>${summary}</div><div>${copyNote}</div><div>${recommended}</div>`;
  return block;
}

function renderCautionPanel() {
  const caution = document.getElementById('cautionPanel');
  caution.hidden = false;
  caution.innerHTML = state.lang === 'ja'
    ? '<h2>地名・住所で使う場合の注意</h2><p>このツールは旧字体・異体字の参考確認用です。正式な住所表記、行政上の地名、登記、郵便、契約書類、地図掲載、店舗所在地などで使う場合は、必ず実際の登録表記を確認してください。ここで表示される候補は、公式な住所表記や行政上の有効性を判断するものではありません。</p>'
    : '<h2>Important note for place names and addresses</h2><p>This tool is for reference checking of old and variant kanji forms. For official address records, administrative place names, registrations, postal use, contracts, map listings, or business locations, always confirm the actual registered spelling. The candidates shown here do not determine official address spelling or administrative validity.</p>';
}

function setLang(lang) {
  state.lang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('.nw-lang-switch button').forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === lang));
  document.getElementById('placeInput').placeholder = lang === 'ja'
    ? '例：廣島、濱松、澤、邊、舊國名'
    : 'Example: old or variant kanji used in place names or addresses';
  analyzeInput();
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const helper = document.createElement('textarea');
      helper.value = text;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    const toast = document.getElementById('toast');
    toast.textContent = state.lang === 'ja' ? 'コピーしました' : 'Copied';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1200);
  } catch (_) {}
}

function syncOkjProRuntimeState() {
  const adapter = window.NicheWorksProEntitlement;
  const panels = document.querySelectorAll('[data-okj-pro-state]');
  panels.forEach((panel) => {
    const features = panel.querySelectorAll('[data-okj-feature-id]');
    let runtimeState = 'billing-unavailable';
    let runtimeActive = false;
    if (adapter && typeof adapter.getFeatureState === 'function') {
      features.forEach((featureEl) => {
        const featureIds = (featureEl.dataset.okjFeatureId || '').split(/\s+/).filter(Boolean);
        featureIds.forEach((featureId) => {
          const featureState = adapter.getFeatureState({
            productId: 'okj.toolkit_pro',
            featureId
          });
          runtimeState = featureState?.state || runtimeState;
          runtimeActive = runtimeActive || !!featureState?.active;
          featureEl.dataset.okjRuntimeProState = featureState?.state || runtimeState;
          featureEl.dataset.okjRuntimeProActive = String(!!featureState?.active);
        });
      });
    }
    panel.dataset.okjRuntimeProState = runtimeState;
    panel.dataset.okjRuntimeProActive = String(runtimeActive);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('checkBtn').addEventListener('click', analyzeInput);
  document.getElementById('placeInput').addEventListener('input', analyzeInput);
  document.querySelectorAll('.nw-lang-switch button').forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.lang)));
  setLang('ja');
  syncOkjProRuntimeState();
  try {
    await loadData();
  } catch (_) {
    state.dataStatus = 'error';
  }
  analyzeInput();
});
