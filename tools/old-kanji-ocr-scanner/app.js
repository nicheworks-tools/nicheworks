const i18n = {
  ja: {
    title: '旧字体OCRスキャナー',
    lead: '画像やスマホ撮影画像から旧字体・異体字を確認するためのOCR入口です。',
    inputHeading: '画像を選択',
    inputHelp: '看板、碑文、古い資料、古地図、紙面の写真などを1枚読み込めます。',
    previewHeading: '画像プレビュー',
    fileNameLabel: 'ファイル名',
    fileSizeLabel: 'サイズ',
    fileTypeLabel: '種類',
    removeImage: '画像を削除',
    ocrHeading: 'OCR結果',
    ocrButton: 'OCRを実行する',
    ocrIdleText: '画像を選択するとOCRを実行できます。',
    ocrBusyText: 'OCR処理中です…',
    ocrCompleteText: 'OCRが完了しました。結果は必要に応じて手動で修正できます。',
    ocrFailedText: 'OCRに失敗しました。画像を変えるか、手動入力欄に文字を入力してください。',
    ocrNoImageText: '先に画像を選択してください。',
    ocrEmptyText: 'OCR結果が空でした。必要に応じて手動入力してください。',
    ocrUnsupportedText: 'この画像形式はサポートされていません。別の画像を選択してください。',
    ocrEngineLoading: 'OCRエンジンを読み込み中です。',
    ocrAnalyzing: '画像を解析中です。',
    ocrRecognizing: 'テキストを認識中です。',
    ocrLangNote: '初期版では日本語OCRを想定しています。旧字体や異体字は誤認識される場合があります。',
    resultHeading: 'OCR結果テキスト',
    resultLabel: 'OCR結果テキスト',
    resultHelp: 'OCR結果は必要に応じて手動修正してください。OCR前は手動入力欄としても使えます。',
    editableHelp: 'OCR結果は編集できます。修正すると検出結果も更新されます。',
    copyButton: 'OCR結果をコピー',
    copied: 'コピーしました',
    detectionHeading: '旧字体検出結果',
    foundText: 'OCR結果内に登録済みの旧字体・異体字が見つかりました。',
    notFoundText: 'OCR結果内に登録済みの旧字体・異体字は見つかりませんでした。',
    highlightHeading: 'ハイライト表示',
    modernPreviewHeading: '現代表記プレビュー',
    modernPreviewNote: 'これはOCR結果に対する機械的な置換プレビューです。文意・固有名詞・正式表記を保証するものではありません。',
    copyOldForms: '検出された旧字だけコピー',
    copyPairTable: '対応表をコピー',
    copyModernPreview: '現代表記プレビューをコピー',
    oldForm: '旧字体', modernForm: '新字体', occurrences: '出現', reading: '読み', meaning: '意味', usage: '用途', category: '分類', renderingNote: '表示環境の注意', copyOld: '旧字をコピー', copyModern: '新字をコピー', viewReference: '旧字体一覧で詳しく見る',
    loadDataError: '旧字体データを読み込めませんでした。OCR結果の手動確認と関連ツールリンクのみ利用できます。',
    privacyNote: '画像と入力内容はこの画面内で扱い、外部OCR APIには送信しません。OCRエンジンのスクリプトや解析用データ、アクセス解析、広告タグが読み込まれる場合があります。',
    accuracyHeading: 'OCR利用時の注意',
    accuracyText: '旧字体、異体字、縦書き、かすれた文字、崩し字、古い看板や碑文はOCRで正しく読み取れない場合があります。OCR結果は必ず目視で確認し、必要に応じて手動修正してください。',
    proNote: '無料版では1枚の画像確認を想定しています。複数画像OCR、履歴保存、トリミング、レポート出力は Old Kanji Toolkit Pro の対象予定です。',
    proPanelHeading: 'Old Kanji Toolkit Pro',
    proBadge: 'Pro',
    proPanelLead: '一括OCR、履歴保存、トリミングOCR、拡大確認、画像内マーキング、調査レポート出力は Pro 機能として提供予定です。',
    proPanelPrice: '$4.99 買い切り',
    proBatchTitle: '一括OCRは Pro 機能です',
    proBatchText: '複数画像のOCR、連続スキャン、検出結果のまとめ処理は Old Kanji Toolkit Pro で利用できます。',
    proHistoryTitle: '履歴保存は Pro 機能です',
    proHistoryText: 'スキャン履歴、OCR結果の保存は Old Kanji Toolkit Pro で利用できます。',
    proHistoryLockedButton: '履歴は Pro 機能です',
    proCollectionTitle: '旧字体コレクションは Pro 機能です',
    proCollectionText: '検出された旧字体の保存・整理は Old Kanji Toolkit Pro で利用できます。',
    proCollectionLockedButton: 'コレクションは Pro 機能です',
    proCropTitle: 'トリミング・拡大確認は Pro 機能です',
    proCropText: '画像の一部を切り出したOCR、拡大確認、画像内マーキングは Old Kanji Toolkit Pro で利用できます。',
    proReportTitle: 'レポート・出力は Pro 機能です',
    proReportText: 'OCR結果、旧字体検出結果、現代表記プレビューをCSV、Markdown、JSON、調査レポートとして出力する機能は Old Kanji Toolkit Pro で利用できます。',
    proPanelCta: 'Pro を確認する',
    proPanelBillingNote: '現在、Pro機能は準備中です。課金導線はまだ接続されていません。',
  },
  en: {
    title: 'Old Kanji OCR Scanner', lead: 'An OCR entry point for checking old or variant kanji from images or smartphone photos.',
    inputHeading: 'Choose image', inputHelp: 'Load one image, such as a sign, inscription, old document, old map, or printed page photo.', previewHeading: 'Image preview',
    fileNameLabel: 'File name', fileSizeLabel: 'Size', fileTypeLabel: 'Type', removeImage: 'Remove image',
    ocrHeading: 'OCR result', ocrButton: 'Run OCR', ocrIdleText: 'Choose an image to run OCR.', ocrBusyText: 'Running OCR…',
    ocrCompleteText: 'OCR is complete. You can manually correct the result if needed.', ocrFailedText: 'OCR failed. Try another image or enter text manually.',
    ocrNoImageText: 'Please choose an image first.', ocrEmptyText: 'OCR returned empty text. Please enter text manually if needed.',
    ocrUnsupportedText: 'This image type is not supported. Please choose another image.', ocrEngineLoading: 'Loading OCR engine.', ocrAnalyzing: 'Analyzing image.', ocrRecognizing: 'Recognizing text.',
    ocrLangNote: 'The initial version assumes Japanese OCR. Old or variant kanji may be misread.',
    resultHeading: 'OCR result text', resultLabel: 'OCR result text', resultHelp: 'Manually correct the OCR result if needed. Before OCR, this area can be used for manual input.', editableHelp: 'The OCR result is editable. Detection updates when you correct the text.',
    copyButton: 'Copy OCR result', copied: 'Copied', detectionHeading: 'Old kanji detection result', foundText: 'Registered old or variant kanji forms were found in the OCR result.', notFoundText: 'No registered old or variant kanji forms were found in the OCR result.',
    highlightHeading: 'Highlighted OCR text', modernPreviewHeading: 'Modern-form preview', modernPreviewNote: 'This is a mechanical replacement preview for the OCR result. It does not guarantee meaning, proper nouns, or official spelling.',
    copyOldForms: 'Copy detected old forms', copyPairTable: 'Copy pair table', copyModernPreview: 'Copy modern preview', oldForm: 'Old form', modernForm: 'Modern form', occurrences: 'Occurrences', reading: 'Reading', meaning: 'Meaning', usage: 'Usage', category: 'Category', renderingNote: 'Rendering note', copyOld: 'Copy old', copyModern: 'Copy modern', viewReference: 'View in Old Kanji Reference',
    loadDataError: 'Could not load old-kanji data. OCR result editing and related tool links are still available.',
    privacyNote: 'Images and text are handled in this page and are not sent to an external OCR API. OCR engine scripts or data files, analytics, and ad tags may be loaded.',
    accuracyHeading: 'OCR accuracy note', accuracyText: 'Old kanji, variant kanji, vertical writing, faded text, cursive forms, old signs, and inscriptions may not be read correctly by OCR. Always visually confirm the OCR result and correct it manually if needed.',
    proNote: 'The free version is intended for checking one image. Multiple-image OCR, saved history, crop tools, and report exports are planned for Old Kanji Toolkit Pro.',
    proPanelHeading: 'Old Kanji Toolkit Pro',
    proBadge: 'Pro',
    proPanelLead: 'Batch OCR, saved history, crop OCR, zoom inspection, image marking, and research reports are planned as Pro features.',
    proPanelPrice: '$4.99 one-time',
    proBatchTitle: 'Batch OCR is a Pro feature',
    proBatchText: 'Multiple-image OCR, continuous scanning, and grouped detection results are available in Old Kanji Toolkit Pro.',
    proHistoryTitle: 'Saved history is a Pro feature',
    proHistoryText: 'Scan history and OCR result saving are available in Old Kanji Toolkit Pro.',
    proHistoryLockedButton: 'History is Pro',
    proCollectionTitle: 'Old-kanji collection is a Pro feature',
    proCollectionText: 'Saving and organizing detected old-kanji forms are available in Old Kanji Toolkit Pro.',
    proCollectionLockedButton: 'Collection is Pro',
    proCropTitle: 'Crop, zoom, and image marking are Pro features',
    proCropText: 'Crop OCR, zoom inspection, and image marking are available in Old Kanji Toolkit Pro.',
    proReportTitle: 'Reports and exports are Pro features',
    proReportText: 'OCR results, old-kanji detection results, and modern-form previews can be exported as CSV, Markdown, JSON, or research reports in Old Kanji Toolkit Pro.',
    proPanelCta: 'View Pro',
    proPanelBillingNote: 'Pro features are being prepared. Billing is not connected yet.',
  }
};

let currentLang = 'ja';
let currentObjectUrl = null;
let ocrBusy = false;
let copyToastTimer = null;
let oldToNewMap = {};
let metadataMap = new Map();
let compatibilityMap = new Map();
let dataLoadFailed = false;
let lastDetectionResult = null;

async function loadOldKanjiData() { try { const json = await fetch('../old-kanji-reference/dict.json').then((r) => r.json()); oldToNewMap = json?.old_to_new || {}; if (!Object.keys(oldToNewMap).length) dataLoadFailed = true; } catch { dataLoadFailed = true; oldToNewMap = {}; } }
async function loadMetadata() { const files = ['meta.json', 'meta-extra-2.json', 'meta-extra-3.json', 'meta-extra-4.json', 'meta-extra-5.json', 'meta-extra-6.json']; for (const file of files) { try { const json = await fetch(`../old-kanji-reference/${file}`).then((r) => r.json()); Object.entries(json.entries || {}).forEach(([c, m]) => metadataMap.set(c, m || {})); } catch {} } }
async function loadCompatibilityNotes() { try { const json = await fetch('../old-kanji-reference/compatibility-notes.json').then((r) => r.json()); Object.entries(json.entries || {}).forEach(([c, n]) => compatibilityMap.set(c, n || {})); } catch {} }
function getOldToModernText(old) { const mapped = oldToNewMap[old]; return Array.isArray(mapped) ? (mapped[0] || '') : (typeof mapped === 'string' ? mapped : ''); }
function getMetadataFields(meta) { if (!meta) return {}; const ja = currentLang === 'ja'; return { reading: ja ? (meta.readingJa || meta.readingEn) : (meta.readingEn || meta.readingJa), meaning: ja ? (meta.meaningJa || meta.meaningEn) : (meta.meaningEn || meta.meaningJa), usage: ja ? (meta.usageJa || meta.usageEn) : (meta.usageEn || meta.usageJa) }; }
function getCategoryLabel(v) { const m = { ja: { name: '人名・地名', document: '文献・古文書', common: '旧常用漢字', rare: '参考', popular: 'よく使う旧字体', pair_only: '対応のみ' }, en: { name: 'Names / Places', document: 'Old documents', common: 'Common-use old forms', rare: 'Reference', popular: 'Common old forms', pair_only: 'Pair only' } }; return (m[currentLang] && m[currentLang][v]) || v || ''; }
function getCompatibilityNote(char) { const note = compatibilityMap.get(char); if (note) { const ja = currentLang === 'ja'; return [ja ? note.summaryJa : note.summaryEn, ja ? note.copyNoteJa : note.copyNoteEn, ja ? note.technicalJa : note.technicalEn, ja ? note.recommendedCheckJa : note.recommendedCheckEn].filter(Boolean); } return []; }
function detectOldKanji(text) { const items = new Map(); let total = 0; for (const ch of text || '') { if (Object.prototype.hasOwnProperty.call(oldToNewMap, ch)) { total++; if (!items.has(ch)) items.set(ch, { oldChar: ch, modern: getOldToModernText(ch), count: 0, meta: metadataMap.get(ch) || {} }); items.get(ch).count++; } } return { total, unique: items.size, items: [...items.values()] }; }
function renderDetectionSummary(result) { const el = document.getElementById('detection-summary'); const text = document.getElementById('manual-text').value.trim(); el.hidden = !text; el.textContent = ''; if (!text) return; const h = document.createElement('h2'); h.textContent = i18n[currentLang].detectionHeading; const p = document.createElement('p'); p.textContent = result.total ? i18n[currentLang].foundText : i18n[currentLang].notFoundText; const c = document.createElement('p'); c.textContent = currentLang === 'ja' ? `検出数：${result.total}件 / 種類：${result.unique}種類` : `Matches: ${result.total} / Unique forms: ${result.unique}`; el.append(h, p, c); if (dataLoadFailed) { const w = document.createElement('p'); w.className = 'empty-state'; w.textContent = i18n[currentLang].loadDataError; el.appendChild(w); } }
function renderHighlightedText(text, result) { const panel = document.getElementById('highlight-panel'); const out = document.getElementById('highlight-output'); panel.hidden = !text; out.textContent = ''; if (!text) return; const hitSet = new Set(result.items.map((i) => i.oldChar)); for (const ch of text) { if (ch === '\n') { out.appendChild(document.createElement('br')); continue; } if (hitSet.has(ch)) { const s = document.createElement('span'); s.className = 'old-kanji-hit'; s.textContent = ch; s.addEventListener('click', () => { document.getElementById(`card-${encodeURIComponent(ch)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }); out.appendChild(s); } else { out.appendChild(document.createTextNode(ch)); } } }
function renderDetectedCard(item) { const card = document.createElement('article'); card.className = 'detected-card'; card.id = `card-${encodeURIComponent(item.oldChar)}`; const title = document.createElement('h3'); title.className = 'detected-card__glyph'; title.textContent = `${item.oldChar} → ${item.modern || '-'}`; card.appendChild(title); return card; }
function renderDetectedCards(result) { const list = document.getElementById('detected-list'); list.hidden = !result.items.length; list.textContent = ''; result.items.forEach((item) => list.appendChild(renderDetectedCard(item))); }
function renderModernPreview(text) { const p = document.getElementById('modern-preview-panel'); const out = document.getElementById('modern-preview-output'); p.hidden = !text; let r = ''; for (const ch of text || '') r += Object.prototype.hasOwnProperty.call(oldToNewMap, ch) ? (getOldToModernText(ch) || ch) : ch; out.textContent = r; out.dataset.value = r; }
async function copyText(value) { if (!value) return; try { await navigator.clipboard.writeText(value); } catch { const h = document.createElement('textarea'); h.value = value; document.body.appendChild(h); h.select(); document.execCommand('copy'); h.remove(); } const t = document.getElementById('copy-toast'); t.textContent = i18n[currentLang].copied; clearTimeout(copyToastTimer); copyToastTimer = setTimeout(() => { t.textContent = ''; }, 1500); }
function copyDetectedOldForms() { copyText((lastDetectionResult?.items || []).map((i) => i.oldChar).join('\n')); }
function copyPairTable() { copyText((lastDetectionResult?.items || []).map((i) => `${i.oldChar}\t${i.modern || ''}`).join('\n')); }
function copyModernPreview() { copyText(document.getElementById('modern-preview-output').dataset.value || ''); }
function updateDetection() { const text = document.getElementById('manual-text').value || ''; const result = detectOldKanji(text); lastDetectionResult = result; renderDetectionSummary(result); renderHighlightedText(text, result); renderDetectedCards(result); renderModernPreview(text); document.getElementById('copy-actions').hidden = false; document.getElementById('copy-old-forms').disabled = !result.items.length; document.getElementById('copy-pair-table').disabled = !result.items.length; document.getElementById('copy-modern-preview').disabled = !text; document.getElementById('copy-ocr').disabled = !text; }
function setLang(lang) { currentLang = i18n[lang] ? lang : 'ja'; document.documentElement.lang = currentLang; document.querySelectorAll('[data-i18n]').forEach((e) => { const k = e.dataset.i18n; if (i18n[currentLang][k]) e.textContent = i18n[currentLang][k]; }); document.getElementById('lang-ja').classList.toggle('active', currentLang === 'ja'); document.getElementById('lang-en').classList.toggle('active', currentLang === 'en'); if (lastDetectionResult) updateDetection(); }
function handleImageSelection(event) { const [file] = event.target.files || []; if (!file) { clearImage(); return; } if (!file.type || !file.type.startsWith('image/')) { setOcrStatus('ocrUnsupportedText'); clearImage(); return; } renderImagePreview(file); setOcrStatus('ocrIdleText'); setOcrProgress(null); document.getElementById('run-ocr').disabled = false; }
function renderImagePreview(file) { const p = document.getElementById('preview-panel'); const i = document.getElementById('preview-image'); revokeCurrentObjectUrl(); currentObjectUrl = URL.createObjectURL(file); i.src = currentObjectUrl; i.alt = file.name; document.getElementById('file-name').textContent = file.name; document.getElementById('file-size').textContent = formatFileSize(file.size); document.getElementById('file-type').textContent = file.type || '-'; p.hidden = false; }
function clearImage() { revokeCurrentObjectUrl(); const input = document.getElementById('image-input'); const p = document.getElementById('preview-panel'); const i = document.getElementById('preview-image'); input.value = ''; i.removeAttribute('src'); i.alt = ''; document.getElementById('file-name').textContent = ''; document.getElementById('file-size').textContent = ''; document.getElementById('file-type').textContent = ''; p.hidden = true; setOcrBusy(false); setOcrProgress(null); setOcrStatus('ocrIdleText'); document.getElementById('run-ocr').disabled = true; }
function formatFileSize(bytes) { if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'; if (bytes < 1024) return `${bytes} B`; const kb = bytes / 1024; if (kb < 1024) return `${kb.toFixed(1)} KB`; return `${(kb / 1024).toFixed(2)} MB`; }
function updateManualLinks() { const text = document.getElementById('manual-text').value.trim(); document.querySelectorAll('#manual-links a').forEach((link) => { link.href = `${link.dataset.baseHref}?q=${text ? encodeURIComponent(text) : ''}`; }); }
function revokeCurrentObjectUrl() { if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; } }
async function runOcr() { if (ocrBusy) return; const [file] = document.getElementById('image-input').files || []; if (!file) return setOcrStatus('ocrNoImageText'); if (!file.type || !file.type.startsWith('image/')) return setOcrStatus('ocrUnsupportedText'); if (typeof Tesseract === 'undefined') return setOcrStatus('ocrFailedText'); setOcrBusy(true); setOcrStatus('ocrBusyText'); setOcrProgress(0); try { const result = await Tesseract.recognize(file, 'jpn', { logger: (event) => { if (event?.status?.includes('loading')) setOcrStatus('ocrEngineLoading'); else if (event?.status?.includes('initializing')) setOcrStatus('ocrAnalyzing'); else if (event?.status?.includes('recognizing')) setOcrStatus('ocrRecognizing'); if (typeof event?.progress === 'number') setOcrProgress(event.progress); } }); const text = (result?.data?.text || '').trim(); updateResultText(text); setOcrStatus(text ? 'ocrCompleteText' : 'ocrEmptyText'); } catch { setOcrStatus('ocrFailedText'); } finally { setOcrBusy(false); } }
function setOcrStatus(k) { document.getElementById('ocr-status').textContent = i18n[currentLang][k] || k || ''; }
function setOcrProgress(v) { document.getElementById('ocr-progress').textContent = typeof v === 'number' ? `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%` : ''; }
function setOcrBusy(b) { ocrBusy = !!b; document.getElementById('image-input').disabled = ocrBusy; document.getElementById('run-ocr').disabled = ocrBusy || !document.getElementById('image-input').files[0]; document.getElementById('remove-image').disabled = ocrBusy; }
function copyOcrText() { copyText(document.getElementById('manual-text').value); }
function updateResultText(text) { document.getElementById('manual-text').value = text || ''; updateManualLinks(); updateDetection(); }


function syncOkjProRuntimeState() {
  const adapter = window.NicheWorksProEntitlement;
  const panels = document.querySelectorAll('[data-okj-pro-state]');
  if (!panels.length) return;
  panels.forEach((panel) => {
    const featureEls = panel.querySelectorAll('[data-okj-feature-id]');
    let runtimeState = 'billing-unavailable';
    let runtimeActive = false;
    if (adapter && typeof adapter.getFeatureState === 'function') {
      featureEls.forEach((featureEl) => {
        const featureIds = (featureEl.dataset.okjFeatureId || '').split(/\s+/).filter(Boolean);
        featureIds.forEach((featureId) => {
          const featureState = adapter.getFeatureState({
            productId: 'okj.toolkit_pro',
            featureId
          });
          if (featureState && typeof featureState.state === 'string') runtimeState = featureState.state;
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

function syncLockedFeaturePlaceholder(featureId) {
  const adapter = window.NicheWorksProEntitlement;
  const featureEl = document.querySelector(`[data-okj-feature-id="${featureId}"]`);
  if (!featureEl) return;
  const featureState = (adapter && typeof adapter.getFeatureState === 'function')
    ? adapter.getFeatureState({ productId: 'okj.toolkit_pro', featureId })
    : { state: 'billing-unavailable', active: false };
  featureEl.dataset.okjRuntimeProState = featureState?.state || 'billing-unavailable';
  featureEl.dataset.okjRuntimeProActive = String(!!featureState?.active);
}
document.addEventListener('DOMContentLoaded', async () => {
  setLang('ja');
  await loadOldKanjiData();
  await loadMetadata();
  await loadCompatibilityNotes();
  updateManualLinks();
  setOcrStatus('ocrIdleText');
  updateDetection();
  syncOkjProRuntimeState();
  syncLockedFeaturePlaceholder('okj.scanHistory');
  syncLockedFeaturePlaceholder('okj.oldKanjiCollection');

  document.getElementById('lang-ja').addEventListener('click', () => setLang('ja'));
  document.getElementById('lang-en').addEventListener('click', () => setLang('en'));
  document.getElementById('image-input').addEventListener('change', handleImageSelection);
  document.getElementById('remove-image').addEventListener('click', clearImage);
  document.getElementById('manual-text').addEventListener('input', () => { updateManualLinks(); updateDetection(); });
  document.getElementById('run-ocr').addEventListener('click', runOcr);
  document.getElementById('copy-ocr').addEventListener('click', copyOcrText);
  document.getElementById('copy-old-forms').addEventListener('click', copyDetectedOldForms);
  document.getElementById('copy-pair-table').addEventListener('click', copyPairTable);
  document.getElementById('copy-modern-preview').addEventListener('click', copyModernPreview);
  window.addEventListener('beforeunload', revokeCurrentObjectUrl);
});
