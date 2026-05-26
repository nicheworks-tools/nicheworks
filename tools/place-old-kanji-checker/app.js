const state = {
  lang: 'ja',
  dict: null,
  reverse: new Map(),
  metadata: new Map(),
  compatibility: new Map(),
  shapeNotes: new Map(),
  strokeCounts: new Map()
};

async function loadData() {
  const dictRes = await fetch('../old-kanji-reference/dict.json');
  if (!dictRes.ok) throw new Error('dict load failed');
  state.dict = await dictRes.json();
  state.reverse = buildReverseLookupFromOldToNew(state.dict.old_to_new || {});
  await Promise.all([loadMetadata(), loadCompatibilityNotes()]);
}

function buildReverseLookupFromOldToNew(oldToNew) {
  const map = new Map();
  Object.entries(oldToNew).forEach(([oldForm, modernForm]) => {
    if (!map.has(modernForm)) map.set(modernForm, []);
    map.get(modernForm).push(oldForm);
  });
  return map;
}

async function loadMetadata() {
  const files = ['meta.json', 'meta-extra-2.json', 'meta-extra-3.json', 'meta-extra-4.json', 'meta-extra-5.json', 'meta-extra-6.json'];
  for (const file of files) {
    try {
      const res = await fetch(`../old-kanji-reference/${file}`);
      if (!res.ok) continue;
      const json = await res.json();
      const entries = json.entries || {};
      Object.entries(entries).forEach(([char, meta]) => state.metadata.set(char, meta));
    } catch (_) {}
  }
  try {
    const shape = await fetch('../old-kanji-reference/shape-notes.json');
    if (shape.ok) Object.entries((await shape.json()).entries || {}).forEach(([k, v]) => state.shapeNotes.set(k, v));
  } catch (_) {}
  try {
    const stroke = await fetch('../old-kanji-reference/stroke-counts.json');
    if (stroke.ok) Object.entries((await stroke.json()).entries || {}).forEach(([k, v]) => state.strokeCounts.set(k, v));
  } catch (_) {}
}

async function loadCompatibilityNotes() {
  try {
    const res = await fetch('../old-kanji-reference/compatibility-notes.json');
    if (!res.ok) return;
    const json = await res.json();
    Object.entries(json.entries || {}).forEach(([k, v]) => state.compatibility.set(k, v));
  } catch (_) {}
}

function getFallbackCompatibilityNote(char) {
  const cp = char.codePointAt(0);
  if (cp >= 0xF900 && cp <= 0xFAFF) return { summaryJa:'CJK互換漢字です。', summaryEn:'CJK Compatibility Ideograph.', copyNoteJa:'環境差に注意', copyNoteEn:'Watch rendering differences.', recommendedCheckJa:'自治体・郵便・登記表記を照合', recommendedCheckEn:'Cross-check official records.'};
  if (cp > 0xFFFF) return { summaryJa:'補助漢字面の文字です。', summaryEn:'Supplementary plane character.', copyNoteJa:'文字化けの可能性あり', copyNoteEn:'May not render everywhere.', recommendedCheckJa:'フォント差を確認', recommendedCheckEn:'Check font support.'};
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
  converterAnchor.href = `../kanji-modernizer/?q=${encodeURIComponent(input)}`;
}

function renderResultCard(char) {
  const oldToNew = state.dict.old_to_new || {};
  const oldMatch = oldToNew[char];
  const reverseCandidates = state.reverse.get(char);
  if (!oldMatch && !reverseCandidates) return null;

  const card = document.createElement('article');
  card.className = 'place-result-card';
  const metaKey = oldMatch ? char : (reverseCandidates && reverseCandidates[0]);
  const meta = state.metadata.get(metaKey) || {};
  const compatibility = state.compatibility.get(metaKey) || getFallbackCompatibilityNote(char);
  const shape = state.shapeNotes.get(metaKey);
  const stroke = state.strokeCounts.get(metaKey);

  const candidateText = oldMatch ? `${char} → ${oldMatch}` : `${char} ${state.lang === 'ja' ? 'の旧字体・異体字候補' : 'candidates'}: ${reverseCandidates.join('、')}`;
  const details = [];
  if (meta.reading) details.push(`<div>${state.lang === 'ja' ? '読み' : 'Reading'}: ${meta.reading}</div>`);
  if (meta.meaning) details.push(`<div>${state.lang === 'ja' ? '意味' : 'Meaning'}: ${meta.meaning}</div>`);
  if (meta.category) details.push(`<div>${state.lang === 'ja' ? '候補種別' : 'Candidate type'}: ${meta.category}</div>`);
  if (meta.usage) details.push(`<div>${state.lang === 'ja' ? '用途' : 'Usage'}: ${meta.usage}</div>`);
  if (!details.length) details.push(`<div>${state.lang === 'ja' ? '登録データなし' : 'No data in current reference'}</div>`);

  const referenceChar = oldMatch ? char : reverseCandidates[0];
  card.innerHTML = `<h3>${candidateText}</h3>${details.join('')}
  <div class="copy-actions">
    <button type="button" data-copy="${char}">${state.lang === 'ja' ? '入力字をコピー' : 'Copy input character'}</button>
    ${oldMatch ? `<button type="button" data-copy="${oldMatch}">${state.lang === 'ja' ? '現代表記をコピー' : 'Copy modern form'}</button><button type="button" data-copy="${char}">${state.lang === 'ja' ? '候補をコピー' : 'Copy candidate'}</button>` : `<button type="button" data-copy="${reverseCandidates.join('、')}">${state.lang === 'ja' ? '候補一覧をコピー' : 'Copy all candidates'}</button>`}
  </div>
  <p class="reference-links"><a href="../old-kanji-reference/?q=${encodeURIComponent(referenceChar)}">${state.lang === 'ja' ? '旧字体一覧で詳しく見る' : 'View in Old Kanji Reference'}</a></p>`;

  if (shape || stroke) {
    card.innerHTML += `<div class="candidate-list">${shape ? `<div>${state.lang === 'ja' ? '形の見比べ' : 'Shape comparison'}: ${typeof shape === 'string' ? shape : (shape.summary || '')}</div>` : ''}${stroke ? `<div>${state.lang === 'ja' ? '画数の目安' : 'Stroke count reference'}: ${typeof stroke === 'number' ? stroke : (stroke.old || '')}</div>` : ''}</div>`;
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
  const summary = note.summary || note.summaryJa || note.summaryEn || '';
  const copyNote = note.copyNote || note.copyNoteJa || note.copyNoteEn || '';
  const recommended = note.recommendedCheck || note.recommendedCheckJa || note.recommendedCheckEn || '';
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
          const featureState = adapter.getFeatureState(featureId);
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
  await loadData();
});
