const root = document.querySelector('[data-tool="pattern-atlas-vector-lab"]');

if (root) {
  root.dataset.runtimePatch = '20260916-1';

  const progressWrap = root.querySelector('[data-pa-lab-progress-wrap]');
  const progress = root.querySelector('[data-pa-lab-progress]');
  const progressLabel = root.querySelector('[data-pa-lab-progress-label]');
  const progressDetail = root.querySelector('[data-pa-lab-progress-detail]');
  const status = root.querySelector('[data-pa-lab-status]');
  const wasmState = root.querySelector('[data-pa-lab-wasm-state]');
  const resultCount = root.querySelector('[data-pa-lab-result-count]');

  const setProgress = (value, label, detail = '', state = 'busy') => {
    if (!progressWrap || !progress || !progressLabel || !progressDetail) return;
    progressWrap.hidden = false;
    progress.value = Math.max(0, Math.min(100, value));
    progressLabel.textContent = label;
    progressDetail.textContent = detail;
    progressWrap.dataset.state = state;
  };

  const updateFromRuntime = () => {
    const message = status?.textContent?.trim() || '';
    const wasm = wasmState?.textContent?.trim() || '';
    const count = Number.parseInt(resultCount?.textContent || '0', 10) || 0;
    const state = status?.dataset?.state || '';

    if (state === 'error' || /失敗|error/i.test(message) || /load failed/i.test(wasm)) {
      setProgress(100, '処理に失敗しました', message || wasm, 'error');
      return;
    }
    if (state === 'ok' || /完了/.test(message)) {
      setProgress(100, '処理完了', message, 'ok');
      return;
    }
    if (/VTracer WASM: fetching binary/i.test(wasm)) {
      setProgress(Math.max(Number(progress?.value) || 0, 58), 'VTracer WASMを取得中', wasm);
      return;
    }
    if (/VTracer WASM: loading/i.test(wasm)) {
      setProgress(Math.max(Number(progress?.value) || 0, 52), 'VTracer WASMを読み込み中', wasm);
      return;
    }
    if (/VTracer WASM: ready/i.test(wasm) && count >= 1) {
      setProgress(Math.max(Number(progress?.value) || 0, 65), 'VTracer WASMで変換中', `${count}/2 engine result`);
      return;
    }
    if (/VTracer/.test(message)) {
      setProgress(Math.max(Number(progress?.value) || 0, 68), 'VTracer WASMで変換中', message);
      return;
    }
    if (/ImageTracer/.test(message)) {
      setProgress(Math.max(Number(progress?.value) || 0, 18), 'ImageTracerJSで変換中', message);
      return;
    }
    if (count === 1) {
      setProgress(Math.max(Number(progress?.value) || 0, 48), '1/2 エンジン完了', '次のエンジンを実行しています。');
    }
  };

  const deferClickForPaint = (button, label) => {
    button.addEventListener('click', (event) => {
      if (button.dataset.paProgressRedispatched === '1') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setProgress(3, label, '処理を開始しています。');
      if (status) {
        status.textContent = `${label}を開始…`;
        status.dataset.state = 'busy';
      }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        button.dataset.paProgressRedispatched = '1';
        button.click();
        delete button.dataset.paProgressRedispatched;
      }));
    }, true);
  };

  const actions = [
    ['run-imagetracer', 'ImageTracerJS変換'],
    ['run-vtracer', 'VTracer WASM変換'],
    ['run-both', 'A/B比較'],
    ['run-baseline', 'v1/v2比較']
  ];

  actions.forEach(([name, label]) => {
    const button = root.querySelector(`[data-pa-lab-${name}]`);
    if (button) deferClickForPaint(button, label);
  });

  const observer = new MutationObserver(updateFromRuntime);
  [status, wasmState, resultCount].filter(Boolean).forEach((node) => {
    observer.observe(node, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-state'] });
  });

  window.addEventListener('error', (event) => {
    setProgress(100, 'JavaScriptエラー', event.message || 'unknown error', 'error');
  });
  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason?.message || event.reason || 'unknown error');
    setProgress(100, '実行エラー', message, 'error');
  });

  updateFromRuntime();
}
