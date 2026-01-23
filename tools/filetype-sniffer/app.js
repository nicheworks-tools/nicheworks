const fileInput = document.getElementById('fileInput');
const dropZone = document.querySelector('.drop-zone');
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

let currentFile = null;

const signatureMatchers = [
  {
    name: 'PDF',
    ext: 'pdf',
    mime: 'application/pdf',
    confidence: 0.99,
    evidenceOffset: 0,
    evidenceLength: 5,
    match: (view) => matchAt(view, 0, [0x25, 0x50, 0x44, 0x46, 0x2d])
  },
  {
    name: 'PNG',
    ext: 'png',
    mime: 'image/png',
    confidence: 0.99,
    evidenceOffset: 0,
    evidenceLength: 8,
    match: (view) => matchAt(view, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  },
  {
    name: 'JPEG',
    ext: 'jpg',
    mime: 'image/jpeg',
    confidence: 0.98,
    evidenceOffset: 0,
    evidenceLength: 3,
    match: (view) => matchAt(view, 0, [0xff, 0xd8, 0xff])
  },
  {
    name: 'GIF',
    ext: 'gif',
    mime: 'image/gif',
    confidence: 0.97,
    evidenceOffset: 0,
    evidenceLength: 6,
    match: (view) =>
      matchAt(view, 0, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
      matchAt(view, 0, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  },
  {
    name: 'WEBP',
    ext: 'webp',
    mime: 'image/webp',
    confidence: 0.95,
    evidenceOffset: 0,
    evidenceLength: 12,
    match: (view) =>
      matchAt(view, 0, [0x52, 0x49, 0x46, 0x46]) &&
      matchAt(view, 8, [0x57, 0x45, 0x42, 0x50])
  },
  {
    name: 'ZIP',
    ext: 'zip',
    mime: 'application/zip',
    confidence: 0.9,
    evidenceOffset: 0,
    evidenceLength: 4,
    match: (view) =>
      matchAt(view, 0, [0x50, 0x4b, 0x03, 0x04]) ||
      matchAt(view, 0, [0x50, 0x4b, 0x05, 0x06]) ||
      matchAt(view, 0, [0x50, 0x4b, 0x07, 0x08])
  },
  {
    name: 'MP3',
    ext: 'mp3',
    mime: 'audio/mpeg',
    confidence: 0.75,
    evidenceOffset: 0,
    evidenceLength: 4,
    match: (view) =>
      matchAt(view, 0, [0x49, 0x44, 0x33]) ||
      (view.byteLength > 1 && view.getUint8(0) === 0xff && (view.getUint8(1) & 0xe0) === 0xe0)
  },
  {
    name: 'MP4',
    ext: 'mp4',
    mime: 'video/mp4',
    confidence: 0.85,
    evidenceOffset: 4,
    evidenceLength: 8,
    match: (view) => matchAt(view, 4, [0x66, 0x74, 0x79, 0x70])
  },
  {
    name: 'WAV',
    ext: 'wav',
    mime: 'audio/wav',
    confidence: 0.9,
    evidenceOffset: 0,
    evidenceLength: 12,
    match: (view) =>
      matchAt(view, 0, [0x52, 0x49, 0x46, 0x46]) &&
      matchAt(view, 8, [0x57, 0x41, 0x56, 0x45])
  },
  {
    name: 'EXE (MZ)',
    ext: 'exe',
    mime: 'application/x-msdownload',
    confidence: 0.95,
    evidenceOffset: 0,
    evidenceLength: 2,
    match: (view) => matchAt(view, 0, [0x4d, 0x5a])
  },
  {
    name: 'ELF',
    ext: 'elf',
    mime: 'application/x-elf',
    confidence: 0.95,
    evidenceOffset: 0,
    evidenceLength: 4,
    match: (view) => matchAt(view, 0, [0x7f, 0x45, 0x4c, 0x46])
  },
  {
    name: 'RAR',
    ext: 'rar',
    mime: 'application/vnd.rar',
    confidence: 0.95,
    evidenceOffset: 0,
    evidenceLength: 8,
    match: (view) =>
      matchAt(view, 0, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00]) ||
      matchAt(view, 0, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00])
  }
];

function matchAt(view, offset, bytes) {
  if (view.byteLength < offset + bytes.length) {
    return false;
  }
  for (let i = 0; i < bytes.length; i += 1) {
    if (view.getUint8(offset + i) !== bytes[i]) {
      return false;
    }
  }
  return true;
}

function bytesToHex(view, offset, length) {
  const values = [];
  const max = Math.min(view.byteLength, offset + length);
  for (let i = offset; i < max; i += 1) {
    values.push(view.getUint8(i).toString(16).padStart(2, '0'));
  }
  return values.join(' ');
}

function detectFileType(view) {
  for (const signature of signatureMatchers) {
    if (signature.match(view)) {
      const evidenceOffset = signature.evidenceOffset ?? 0;
      const evidenceLength = signature.evidenceLength ?? 8;
      return {
        detectedExt: signature.ext,
        detectedMime: signature.mime,
        confidence: signature.confidence,
        evidence: {
          signature: signature.name,
          offset: evidenceOffset,
          bytes: bytesToHex(view, evidenceOffset, Math.min(evidenceLength, view.byteLength))
        }
      };
    }
  }
  return {
    detectedExt: 'unknown',
    detectedMime: 'application/octet-stream',
    confidence: 0.0,
    evidence: {
      signature: 'No match',
      offset: 0,
      bytes: bytesToHex(view, 0, Math.min(16, view.byteLength))
    }
  };
}

function normalizeExt(ext) {
  if (!ext) {
    return '';
  }
  const lower = ext.toLowerCase();
  if (lower === 'jpeg') {
    return 'jpg';
  }
  return lower;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return '-';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`;
}

function buildSummary(file, detection, extensionMismatch) {
  const extFromName = normalizeExt(file.name.split('.').pop());
  const confidencePercent = `${Math.round(detection.confidence * 100)}%`;
  const mismatchText = extensionMismatch ? '⚠️ 拡張子と内容が一致しません。' : '一致';
  return {
    html: `
      <p><span class="result-label">ファイル名:</span> ${file.name}</p>
      <p><span class="result-label">サイズ:</span> ${formatBytes(file.size)}</p>
      <p><span class="result-label">拡張子:</span> ${extFromName || '-'}</p>
      <p><span class="result-label">判定形式:</span> ${detection.detectedExt.toUpperCase()} (${detection.detectedMime})</p>
      <p><span class="result-label">信頼度:</span> ${confidencePercent}</p>
      <p><span class="result-label">シグネチャ:</span> ${detection.evidence.signature}</p>
      <p><span class="result-label">検出バイト:</span> ${detection.evidence.bytes} (offset ${detection.evidence.offset})</p>
      <p><span class="result-label">一致判定:</span> ${mismatchText}</p>
    `.trim(),
    text: `File: ${file.name}\nSize: ${formatBytes(file.size)}\nExtension: ${extFromName || '-'}\nDetected: ${detection.detectedExt.toUpperCase()} (${detection.detectedMime})\nConfidence: ${confidencePercent}\nSignature: ${detection.evidence.signature}\nBytes: ${detection.evidence.bytes} (offset ${detection.evidence.offset})\nMatch: ${extensionMismatch ? 'Mismatch' : 'Match'}`
  };
}

function buildEnglishSummary(file, detection, extensionMismatch) {
  const extFromName = normalizeExt(file.name.split('.').pop());
  const confidencePercent = `${Math.round(detection.confidence * 100)}%`;
  const mismatchText = extensionMismatch ? '⚠️ Extension and content mismatch.' : 'Match';
  return {
    html: `
      <p><span class="result-label">File:</span> ${file.name}</p>
      <p><span class="result-label">Size:</span> ${formatBytes(file.size)}</p>
      <p><span class="result-label">Extension:</span> ${extFromName || '-'}</p>
      <p><span class="result-label">Detected:</span> ${detection.detectedExt.toUpperCase()} (${detection.detectedMime})</p>
      <p><span class="result-label">Confidence:</span> ${confidencePercent}</p>
      <p><span class="result-label">Signature:</span> ${detection.evidence.signature}</p>
      <p><span class="result-label">Matched bytes:</span> ${detection.evidence.bytes} (offset ${detection.evidence.offset})</p>
      <p><span class="result-label">Match:</span> ${mismatchText}</p>
    `.trim(),
    text: `File: ${file.name}\nSize: ${formatBytes(file.size)}\nExtension: ${extFromName || '-'}\nDetected: ${detection.detectedExt.toUpperCase()} (${detection.detectedMime})\nConfidence: ${confidencePercent}\nSignature: ${detection.evidence.signature}\nBytes: ${detection.evidence.bytes} (offset ${detection.evidence.offset})\nMatch: ${extensionMismatch ? 'Mismatch' : 'Match'}`
  };
}

function updateWarning(message) {
  if (!warningBox) {
    return;
  }
  if (message) {
    warningBox.textContent = message;
    warningBox.style.display = 'block';
    if (resultSection) {
      resultSection.style.display = 'block';
    }
  } else {
    warningBox.style.display = 'none';
    warningBox.textContent = '';
  }
}

function updateResult(file, detection) {
  if (!resultSection || !summaryContent || !jsonOutput) {
    return;
  }

  const extFromName = normalizeExt(file.name.split('.').pop());
  const extDetected = normalizeExt(detection.detectedExt);
  const extensionMismatch = extFromName && extDetected && extFromName !== extDetected && extDetected !== 'unknown';

  const isEnglish = document.documentElement.lang === 'en';
  const summary = isEnglish
    ? buildEnglishSummary(file, detection, extensionMismatch)
    : buildSummary(file, detection, extensionMismatch);

  summaryContent.innerHTML = summary.html;

  const jsonData = {
    file: {
      name: file.name,
      size: file.size,
      sizeReadable: formatBytes(file.size),
      extension: extFromName || null
    },
    detection
  };

  jsonOutput.textContent = JSON.stringify(jsonData, null, 2);
  resultSection.style.display = 'block';

  if (extensionMismatch) {
    updateWarning(isEnglish ? 'Extension and content mismatch' : '拡張子と内容が一致しません');
  } else {
    updateWarning('');
  }

  if (copySummaryBtn) {
    copySummaryBtn.onclick = () => copyToClipboard(summary.text, copySummaryBtn);
  }
  if (copyJsonBtn) {
    copyJsonBtn.onclick = () => copyToClipboard(jsonOutput.textContent, copyJsonBtn);
  }
}

function copyToClipboard(text, button) {
  if (!text) {
    return;
  }
  const originalLabel = button ? button.textContent : '';
  const showCopied = () => {
    if (button) {
      button.textContent = button.dataset.copiedLabel || (document.documentElement.lang === 'en' ? 'Copied!' : 'コピーしました');
      setTimeout(() => {
        button.textContent = originalLabel;
      }, 1500);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(showCopied).catch(() => fallbackCopy(text, showCopied));
  } else {
    fallbackCopy(text, showCopied);
  }
}

function fallbackCopy(text, done) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } catch (error) {
    console.warn('Copy failed', error);
  }
  document.body.removeChild(textarea);
  done();
}

function setProgress(active) {
  if (!progress) {
    return;
  }
  progress.style.display = active ? 'block' : 'none';
  if (progressBar) {
    progressBar.style.width = active ? '100%' : '0%';
  }
}

async function analyzeFile(file) {
  if (!file) {
    return;
  }
  setProgress(true);
  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    const detection = detectFileType(view);
    updateResult(file, detection);
  } catch (error) {
    console.error(error);
  } finally {
    setProgress(false);
  }
}

function handleFileSelection(file) {
  if (!file) {
    return;
  }
  currentFile = file;
  if (dropZone) {
    dropZone.textContent = file.name;
  }
  analyzeFile(file);
}

if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    handleFileSelection(file);
  });
}

if (dropZone) {
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    handleFileSelection(file);
  });
}

if (analyzeBtn) {
  analyzeBtn.addEventListener('click', () => {
    if (!currentFile) {
      updateWarning(document.documentElement.lang === 'en' ? 'Please select a file first.' : 'ファイルを選択してください。');
      return;
    }
    analyzeFile(currentFile);
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    currentFile = null;
    if (fileInput) {
      fileInput.value = '';
    }
    if (dropZone) {
      dropZone.innerHTML = document.documentElement.lang === 'en'
        ? '<p>Drag & Drop your file here</p>'
        : '<p>ここにファイルをドラッグ＆ドロップ</p>';
    }
    if (resultSection) {
      resultSection.style.display = 'none';
    }
    updateWarning('');
  });
}
