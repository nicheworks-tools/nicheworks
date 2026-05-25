const READ_LIMIT_BYTES = 4096;

const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone') || document.querySelector('.drop-zone');
const selectedFileName = document.getElementById('selectedFileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const progress = document.getElementById('progress');
const progressBar = progress ? progress.querySelector('.bar') : null;
const resultSection = document.getElementById('resultSection');
const warningBox = document.getElementById('warningBox');
const summaryContent = document.getElementById('summaryContent');
const jsonOutput = document.getElementById('jsonOutput');
const copySummaryBtn = document.getElementById('copySummaryBtn');
const copyJsonBtn = document.getElementById('copyJsonBtn');
const resetBtn = document.getElementById('resetBtn');

const READABLE_LANG = document.documentElement.lang === 'en' ? 'en' : 'ja';

let currentFile = null;
let currentSummaryText = '';

const UI_TEXT = {
  ja: {
    noFile: '未選択',
    copied: 'コピーしました',
    selectFile: 'ファイルを選択してください。',
    readFailed: 'ファイルを読み取れませんでした。',
    labels: {
      fileName: 'ファイル名',
      size: 'サイズ',
      bytesRead: '読み取り量',
      extension: '拡張子',
      detected: '判定形式',
      mime: 'MIME type',
      confidence: '信頼度',
      signature: 'シグネチャ',
      bytes: '検出バイト',
      match: '一致判定',
      container: 'ZIPコンテナ補足',
      risk: 'リスクメモ',
      next: '次に確認すること'
    },
    readLimit: (bytesRead) => `${formatBytes(bytesRead)} / 先頭最大 ${formatBytes(READ_LIMIT_BYTES)}`,
    matchOk: '一致またはZIPコンテナとして妥当',
    mismatch: '⚠️ 拡張子と内容が一致しません。',
    safeUnknown: '形式推定のみ。安全性は未判定です。',
    executableRisk: '実行可能ファイルの可能性があります。出所不明な場合は開かないでください。',
    nextSteps: {
      mismatch: '拡張子と判定形式が違うため、出所不明なら開かない。',
      executable: '実行可能ファイルの可能性があります。出所不明な場合は実行しない。',
      container: 'ZIPコンテナ系は、必要に応じて中身を確認してから開く。',
      safety: 'この結果は形式推定のみです。安全性は別途確認してください。'
    },
    warnings: {
      mismatch: '拡張子と内容が一致しません。出所不明な場合は開かないでください。',
      executable: '実行可能ファイルまたはインストール可能ファイルの可能性があります。',
      container: 'この拡張子はZIPコンテナ形式として扱われます。'
    },
    zipNotes: {
      docx: 'DOCXはZIPベースのOffice文書です。',
      xlsx: 'XLSXはZIPベースのOffice表計算ファイルです。',
      pptx: 'PPTXはZIPベースのOfficeプレゼン資料です。',
      apk: 'APKはZIPベースのAndroidパッケージです。実行・インストール系として注意してください。',
      jar: 'JARはZIPベースのJavaアーカイブです。出所不明なJARは実行しないでください。',
      epub: 'EPUBはZIPベースの電子書籍パッケージです。',
      odt: 'ODTはZIPベースのOpenDocument文書です。',
      ods: 'ODSはZIPベースのOpenDocument表計算ファイルです。',
      odp: 'ODPはZIPベースのOpenDocumentプレゼン資料です。'
    }
  },
  en: {
    noFile: 'No file selected',
    copied: 'Copied!',
    selectFile: 'Please select a file first.',
    readFailed: 'Could not read the file.',
    labels: {
      fileName: 'File name',
      size: 'Size',
      bytesRead: 'Bytes read',
      extension: 'Extension',
      detected: 'Detected type',
      mime: 'MIME type',
      confidence: 'Confidence',
      signature: 'Signature',
      bytes: 'Matched bytes',
      match: 'Match',
      container: 'ZIP container note',
      risk: 'Risk note',
      next: 'What to check next'
    },
    readLimit: (bytesRead) => `${formatBytes(bytesRead)} / first ${formatBytes(READ_LIMIT_BYTES)} max`,
    matchOk: 'Match or acceptable ZIP container',
    mismatch: '⚠️ Extension and content do not match.',
    safeUnknown: 'Format estimate only. Safety is not verified.',
    executableRisk: 'This may be an executable file. Do not open it if the source is unknown.',
    nextSteps: {
      mismatch: 'The extension and detected format differ. Do not open it if the source is unknown.',
      executable: 'This may be an executable or installable file. Do not run it if the source is unknown.',
      container: 'ZIP-based containers should be inspected before opening when necessary.',
      safety: 'This result estimates the file format only. Check safety separately.'
    },
    warnings: {
      mismatch: 'Extension and content do not match. Do not open it if the source is unknown.',
      executable: 'This may be an executable or installable file.',
      container: 'This extension is treated as a ZIP-based container.'
    },
    zipNotes: {
      docx: 'DOCX is a ZIP-based Office document.',
      xlsx: 'XLSX is a ZIP-based Office spreadsheet.',
      pptx: 'PPTX is a ZIP-based Office presentation.',
      apk: 'APK is a ZIP-based Android package. Treat it as installable content.',
      jar: 'JAR is a ZIP-based Java archive. Do not run unknown JAR files.',
      epub: 'EPUB is a ZIP-based ebook package.',
      odt: 'ODT is a ZIP-based OpenDocument text file.',
      ods: 'ODS is a ZIP-based OpenDocument spreadsheet.',
      odp: 'ODP is a ZIP-based OpenDocument presentation.'
    }
  }
};

const t = UI_TEXT[READABLE_LANG];
const EXEC_EXTS = new Set(['exe', 'elf', 'dll', 'scr', 'sys', 'apk', 'jar', 'app', 'dylib', 'bundle']);

const signatures = [
  sig('PDF', 'pdf', ['pdf'], 'application/pdf', 0.99, 0, 5, (v) => at(v, 0, [0x25, 0x50, 0x44, 0x46, 0x2d])),
  sig('PNG', 'png', ['png'], 'image/png', 0.99, 0, 8, (v) => at(v, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  sig('JPEG', 'jpg', ['jpg', 'jpeg', 'jpe'], 'image/jpeg', 0.98, 0, 3, (v) => at(v, 0, [0xff, 0xd8, 0xff])),
  sig('GIF', 'gif', ['gif'], 'image/gif', 0.97, 0, 6, (v) => at(v, 0, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || at(v, 0, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])),
  sig('WEBP', 'webp', ['webp'], 'image/webp', 0.95, 0, 12, (v) => at(v, 0, [0x52, 0x49, 0x46, 0x46]) && at(v, 8, [0x57, 0x45, 0x42, 0x50])),
  sig('AVIF', 'avif', ['avif', 'avifs'], 'image/avif', 0.92, 4, 12, (v) => ftyp(v, ['avif', 'avis'])),
  sig('HEIC/HEIF', 'heic', ['heic', 'heif', 'heics', 'heifs'], 'image/heic', 0.9, 4, 12, (v) => ftyp(v, ['heic', 'heix', 'hevc', 'hevx', 'heif', 'heim', 'mif1', 'msf1'])),
  sig('MP4', 'mp4', ['mp4', 'm4v', 'm4a', 'mov'], 'video/mp4', 0.85, 4, 12, (v) => ftyp(v, ['isom', 'iso2', 'mp41', 'mp42', 'm4v ', 'm4a ', 'qt  '])),
  sig('WEBM', 'webm', ['webm'], 'video/webm', 0.82, 0, 4, (v) => at(v, 0, [0x1a, 0x45, 0xdf, 0xa3]) && hasText(v, 'webm')),
  sig('MKV', 'mkv', ['mkv', 'mka', 'mks'], 'video/x-matroska', 0.82, 0, 4, (v) => at(v, 0, [0x1a, 0x45, 0xdf, 0xa3]) && hasText(v, 'matroska')),
  sig('WEBM/MKV (EBML)', 'webm', ['webm', 'mkv', 'mka', 'mks'], 'application/octet-stream', 0.65, 0, 4, (v) => at(v, 0, [0x1a, 0x45, 0xdf, 0xa3])),
  sig('ZIP', 'zip', ['zip', 'docx', 'xlsx', 'pptx', 'apk', 'jar', 'epub', 'odt', 'ods', 'odp'], 'application/zip', 0.9, 0, 4, (v) => at(v, 0, [0x50, 0x4b, 0x03, 0x04]) || at(v, 0, [0x50, 0x4b, 0x05, 0x06]) || at(v, 0, [0x50, 0x4b, 0x07, 0x08])),
  sig('7Z', '7z', ['7z'], 'application/x-7z-compressed', 0.97, 0, 6, (v) => at(v, 0, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])),
  sig('GZIP', 'gz', ['gz', 'gzip', 'tgz'], 'application/gzip', 0.95, 0, 3, (v) => at(v, 0, [0x1f, 0x8b, 0x08])),
  sig('RAR', 'rar', ['rar'], 'application/vnd.rar', 0.95, 0, 8, (v) => at(v, 0, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00]) || at(v, 0, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00])),
  sig('MP3', 'mp3', ['mp3'], 'audio/mpeg', 0.75, 0, 4, (v) => at(v, 0, [0x49, 0x44, 0x33]) || (v.byteLength > 1 && v.getUint8(0) === 0xff && (v.getUint8(1) & 0xe0) === 0xe0)),
  sig('WAV', 'wav', ['wav'], 'audio/wav', 0.9, 0, 12, (v) => at(v, 0, [0x52, 0x49, 0x46, 0x46]) && at(v, 8, [0x57, 0x41, 0x56, 0x45])),
  sig('BMP', 'bmp', ['bmp'], 'image/bmp', 0.96, 0, 2, (v) => at(v, 0, [0x42, 0x4d])),
  sig('TIFF', 'tif', ['tif', 'tiff'], 'image/tiff', 0.96, 0, 4, (v) => at(v, 0, [0x49, 0x49, 0x2a, 0x00]) || at(v, 0, [0x4d, 0x4d, 0x00, 0x2a])),
  sig('ICO', 'ico', ['ico'], 'image/x-icon', 0.9, 0, 4, (v) => at(v, 0, [0x00, 0x00, 0x01, 0x00])),
  sig('EXE (MZ)', 'exe', ['exe', 'dll', 'scr', 'sys'], 'application/x-msdownload', 0.95, 0, 2, (v) => at(v, 0, [0x4d, 0x5a])),
  sig('ELF', 'elf', ['elf', 'so'], 'application/x-elf', 0.95, 0, 4, (v) => at(v, 0, [0x7f, 0x45, 0x4c, 0x46])),
  sig('Mach-O', 'app', ['app', 'dylib', 'bundle', 'o'], 'application/x-mach-binary', 0.9, 0, 4, (v) => at(v, 0, [0xfe, 0xed, 0xfa, 0xce]) || at(v, 0, [0xfe, 0xed, 0xfa, 0xcf]) || at(v, 0, [0xce, 0xfa, 0xed, 0xfe]) || at(v, 0, [0xcf, 0xfa, 0xed, 0xfe]) || at(v, 0, [0xca, 0xfe, 0xba, 0xbe]))
];

function sig(name, ext, validExts, mime, confidence, evidenceOffset, evidenceLength, match) {
  return { name, ext, validExts, mime, confidence, evidenceOffset, evidenceLength, match };
}

function at(view, offset, bytes) {
  if (view.byteLength < offset + bytes.length) return false;
  return bytes.every((byte, i) => view.getUint8(offset + i) === byte);
}

function ascii(view, offset, length) {
  if (view.byteLength < offset + length) return '';
  return Array.from({ length }, (_, i) => String.fromCharCode(view.getUint8(offset + i))).join('');
}

function ftyp(view, brands) {
  if (!at(view, 4, [0x66, 0x74, 0x79, 0x70])) return false;
  for (let offset = 8; offset + 4 <= Math.min(view.byteLength, 64); offset += 4) {
    if (brands.includes(ascii(view, offset, 4))) return true;
  }
  return false;
}

function hasText(view, needle) {
  let text = '';
  for (let i = 0; i < Math.min(view.byteLength, READ_LIMIT_BYTES); i += 1) {
    const byte = view.getUint8(i);
    text += byte >= 32 && byte <= 126 ? String.fromCharCode(byte).toLowerCase() : ' ';
  }
  return text.includes(needle.toLowerCase());
}

function hex(view, offset, length) {
  const max = Math.min(view.byteLength, offset + length);
  const out = [];
  for (let i = offset; i < max; i += 1) out.push(view.getUint8(i).toString(16).padStart(2, '0'));
  return out.join(' ');
}

function normalizeExt(ext) {
  const lower = (ext || '').toLowerCase().trim();
  if (lower === 'jpeg') return 'jpg';
  if (lower === 'tiff') return 'tif';
  return lower;
}

function fileExt(name) {
  const dot = (name || '').lastIndexOf('.');
  return dot > 0 && dot < name.length - 1 ? normalizeExt(name.slice(dot + 1)) : '';
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i += 1; }
  return `${value.toFixed(value < 10 && i > 0 ? 2 : 0)} ${units[i]}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
}

function detect(view) {
  const found = signatures.find((item) => item.match(view));
  if (!found) {
    return {
      detectedName: 'Unknown',
      detectedExt: 'unknown',
      expectedExtensions: [],
      detectedMime: 'application/octet-stream',
      confidence: 0,
      evidence: { signature: 'No match', offset: 0, bytes: hex(view, 0, Math.min(16, view.byteLength)) }
    };
  }
  return {
    detectedName: found.name,
    detectedExt: found.ext,
    expectedExtensions: found.validExts,
    detectedMime: found.mime,
    confidence: found.confidence,
    evidence: { signature: found.name, offset: found.evidenceOffset, bytes: hex(view, found.evidenceOffset, found.evidenceLength) }
  };
}

function isExpected(ext, detection) {
  if (!ext || detection.detectedExt === 'unknown') return false;
  return detection.expectedExtensions.map(normalizeExt).includes(normalizeExt(ext));
}

function getMeta(file, detection, bytesRead) {
  const ext = fileExt(file.name);
  const containerNote = detection.detectedExt === 'zip' ? (t.zipNotes[ext] || '') : '';
  const extensionMismatch = Boolean(ext && detection.detectedExt !== 'unknown' && !isExpected(ext, detection));
  const executableLike = EXEC_EXTS.has(ext) || EXEC_EXTS.has(normalizeExt(detection.detectedExt)) || detection.detectedName === 'Mach-O';
  const nextSteps = [];
  if (extensionMismatch) nextSteps.push(t.nextSteps.mismatch);
  if (executableLike) nextSteps.push(t.nextSteps.executable);
  if (containerNote) nextSteps.push(t.nextSteps.container);
  nextSteps.push(t.nextSteps.safety);
  return { ext, bytesRead, containerNote, extensionMismatch, executableLike, nextSteps };
}

function buildSummary(file, detection, meta) {
  const confidence = `${Math.round(detection.confidence * 100)}%`;
  const rows = [
    [t.labels.fileName, file.name],
    [t.labels.size, formatBytes(file.size)],
    [t.labels.bytesRead, t.readLimit(meta.bytesRead)],
    [t.labels.extension, meta.ext || '-'],
    [t.labels.detected, `${detection.detectedName} / ${detection.detectedExt.toUpperCase()}`],
    [t.labels.mime, detection.detectedMime],
    [t.labels.confidence, confidence],
    [t.labels.signature, detection.evidence.signature],
    [t.labels.bytes, `${detection.evidence.bytes} (offset ${detection.evidence.offset})`],
    [t.labels.match, meta.extensionMismatch ? t.mismatch : t.matchOk]
  ];
  if (meta.containerNote) rows.push([t.labels.container, meta.containerNote]);
  rows.push([t.labels.risk, meta.executableLike ? t.executableRisk : t.safeUnknown]);

  const html = `${rows.map(([key, value]) => `<p><span class="result-label">${escapeHtml(key)}:</span> ${escapeHtml(value)}</p>`).join('')}<div class="next-steps"><span class="result-label">${escapeHtml(t.labels.next)}:</span><ul>${meta.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ul></div>`;
  const text = rows.map(([key, value]) => `${key}: ${value}`).concat([`${t.labels.next}:`, ...meta.nextSteps.map((step) => `- ${step}`)]).join('\n');
  return { html, text };
}

function updateWarning(message) {
  if (!warningBox) return;
  warningBox.textContent = message || '';
  warningBox.style.display = message ? 'block' : 'none';
  if (message && resultSection) resultSection.style.display = 'block';
}

function warningText(meta) {
  return [
    meta.extensionMismatch ? t.warnings.mismatch : '',
    meta.executableLike ? t.warnings.executable : '',
    meta.containerNote ? t.warnings.container : ''
  ].filter(Boolean).join(' ');
}

function showResult(file, detection, bytesRead) {
  if (!resultSection || !summaryContent || !jsonOutput) return;
  const meta = getMeta(file, detection, bytesRead);
  const summary = buildSummary(file, detection, meta);
  currentSummaryText = summary.text;
  summaryContent.innerHTML = summary.html;
  jsonOutput.textContent = JSON.stringify({
    file: {
      name: file.name,
      size: file.size,
      sizeReadable: formatBytes(file.size),
      extension: meta.ext || null,
      bytesRead,
      readLimitBytes: READ_LIMIT_BYTES
    },
    detection: {
      ...detection,
      extensionMismatch: meta.extensionMismatch,
      containerNote: meta.containerNote || null,
      executableWarning: meta.executableLike || null,
      nextSteps: meta.nextSteps
    }
  }, null, 2);
  resultSection.style.display = 'block';
  updateWarning(warningText(meta));
  if (copySummaryBtn) copySummaryBtn.onclick = () => copyToClipboard(currentSummaryText, copySummaryBtn);
  if (copyJsonBtn) copyJsonBtn.onclick = () => copyToClipboard(jsonOutput.textContent, copyJsonBtn);
}

function setProgress(active) {
  if (!progress) return;
  progress.style.display = active ? 'block' : 'none';
  if (progressBar) progressBar.style.width = active ? '100%' : '0%';
}

async function analyzeFile(file) {
  if (!file) return;
  setProgress(true);
  try {
    const buffer = await file.slice(0, READ_LIMIT_BYTES).arrayBuffer();
    showResult(file, detect(new DataView(buffer)), buffer.byteLength);
  } catch (error) {
    console.error(error);
    updateWarning(t.readFailed);
  } finally {
    setProgress(false);
  }
}

function handleFileSelection(file) {
  if (!file) return;
  currentFile = file;
  if (selectedFileName) selectedFileName.textContent = file.name;
  if (dropZone) dropZone.classList.add('has-file');
  analyzeFile(file);
}

function copyToClipboard(text, button) {
  if (!text) return;
  const original = button ? button.textContent : '';
  const done = () => {
    if (!button) return;
    button.textContent = button.dataset.copiedLabel || t.copied;
    setTimeout(() => { button.textContent = original; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  else fallbackCopy(text, done);
}

function fallbackCopy(text, done) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'absolute';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  try { document.execCommand('copy'); } catch (error) { console.warn('Copy failed', error); }
  document.body.removeChild(area);
  done();
}

if (selectedFileName && selectedFileName.textContent.trim() === '') {
  selectedFileName.textContent = t.noFile;
}

if (fileInput) fileInput.addEventListener('change', (event) => handleFileSelection(event.target.files && event.target.files[0]));
if (dropZone) {
  dropZone.addEventListener('dragover', (event) => { event.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    handleFileSelection(event.dataTransfer.files && event.dataTransfer.files[0]);
  });
}
if (analyzeBtn) analyzeBtn.addEventListener('click', () => currentFile ? analyzeFile(currentFile) : updateWarning(t.selectFile));
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    currentFile = null;
    currentSummaryText = '';
    if (fileInput) fileInput.value = '';
    if (selectedFileName) selectedFileName.textContent = t.noFile;
    if (dropZone) dropZone.classList.remove('has-file', 'dragover');
    if (resultSection) resultSection.style.display = 'none';
    if (summaryContent) summaryContent.innerHTML = '';
    if (jsonOutput) jsonOutput.textContent = '';
    updateWarning('');
  });
}
