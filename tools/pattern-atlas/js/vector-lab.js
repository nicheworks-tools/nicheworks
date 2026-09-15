const root = document.querySelector('[data-tool="pattern-atlas-vector-lab"]');

if (root) {
  const samples = {
    asanoha: {
      label: '麻の葉 / Asanoha',
      src: './assets/vector-lab/asanoha.png',
      alt: '麻の葉の元PNG'
    },
    seigaiha: {
      label: '青海波 / Seigaiha',
      src: './assets/vector-lab/seigaiha.png',
      alt: '青海波の元PNG'
    },
    shippo: {
      label: '七宝 / Shippo',
      src: './assets/vector-lab/shippo.png',
      alt: '七宝の元PNG'
    }
  };

  const presets = {
    geometric: {
      ltres: 0.45,
      qtres: 1.4,
      pathomit: 18,
      rightangleenhance: true,
      colorsampling: 2,
      numberofcolors: 5,
      colorquantcycles: 3,
      layering: 0,
      strokewidth: 0,
      linefilter: false,
      scale: 1,
      roundcoords: 2,
      viewbox: true,
      desc: false,
      blurradius: 0,
      blurdelta: 20
    },
    balanced: {
      ltres: 0.75,
      qtres: 0.75,
      pathomit: 8,
      rightangleenhance: true,
      colorsampling: 2,
      numberofcolors: 8,
      colorquantcycles: 3,
      layering: 0,
      strokewidth: 0,
      linefilter: false,
      scale: 1,
      roundcoords: 2,
      viewbox: true,
      desc: false,
      blurradius: 1,
      blurdelta: 24
    },
    detail: {
      ltres: 0.25,
      qtres: 0.25,
      pathomit: 2,
      rightangleenhance: false,
      colorsampling: 2,
      numberofcolors: 16,
      colorquantcycles: 4,
      layering: 0,
      strokewidth: 0,
      linefilter: false,
      scale: 1,
      roundcoords: 3,
      viewbox: true,
      desc: false,
      blurradius: 0,
      blurdelta: 20
    }
  };

  const patternSelect = root.querySelector('[data-pa-lab-pattern]');
  const presetSelect = root.querySelector('[data-pa-lab-preset]');
  const sourceImage = root.querySelector('[data-pa-lab-source]');
  const sourceName = root.querySelector('[data-pa-lab-source-name]');
  const sourcePath = root.querySelector('[data-pa-lab-source-path]');
  const results = root.querySelector('[data-pa-lab-results]');
  const resultCount = root.querySelector('[data-pa-lab-result-count]');
  const runButton = root.querySelector('[data-pa-lab-run]');
  const runAllButton = root.querySelector('[data-pa-lab-run-all]');
  const status = root.querySelector('[data-pa-lab-status]');
  const tileSize = root.querySelector('[data-pa-lab-tile-size]');
  const tileOutput = root.querySelector('[data-pa-lab-tile-output]');

  const states = new Map();

  function setStatus(message, state = '') {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function updateSource() {
    const sample = samples[patternSelect.value];
    sourceImage.src = sample.src;
    sourceImage.alt = sample.alt;
    sourceName.textContent = sample.label;
    sourcePath.textContent = sample.src.replace('./', '');
    results.innerHTML = '<p class="pa-muted">まだ変換していません。</p>';
    resultCount.textContent = '0 results';
    states.clear();
    setStatus('準備完了');
  }

  function serializeSvg(svg) {
    return new XMLSerializer().serializeToString(svg);
  }

  function svgBytes(svgText) {
    return new TextEncoder().encode(svgText).byteLength;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  function svgDataUrl(svgText) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
  }

  function getSvgPalette(svg) {
    const colors = [];
    const seen = new Set();
    svg.querySelectorAll('[fill]').forEach((node) => {
      const value = (node.getAttribute('fill') || '').trim();
      if (!/^#[0-9a-f]{6}$/i.test(value)) return;
      const normalized = value.toLowerCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      colors.push(normalized);
    });
    return colors.slice(0, 10);
  }

  function refreshState(state) {
    const svg = state.stage.querySelector('svg');
    if (!svg) return;
    const serialized = serializeSvg(svg);
    state.serialized = serialized;
    state.repeat.style.backgroundImage = `url("${svgDataUrl(serialized)}")`;
    state.repeat.style.backgroundSize = `${tileSize.value}px auto`;
    state.byteMetric.textContent = `SVG ${formatBytes(svgBytes(serialized))}`;
  }

  function downloadSvg(state) {
    const svg = state.stage.querySelector('svg');
    if (!svg) return;
    const serialized = serializeSvg(svg);
    const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${patternSelect.value}-${state.preset}.svg`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function buildPaletteEditor(state, palette) {
    const fragment = document.createDocumentFragment();

    palette.forEach((originalColor, index) => {
      const label = document.createElement('label');
      label.className = 'pa-lab-color';

      const input = document.createElement('input');
      input.type = 'color';
      input.value = originalColor;
      input.setAttribute('aria-label', `Color ${index + 1}`);

      const text = document.createElement('span');
      text.textContent = originalColor;

      input.addEventListener('input', () => {
        const currentSvg = state.stage.querySelector('svg');
        if (!currentSvg) return;
        const previous = input.dataset.current || originalColor;
        currentSvg.querySelectorAll('[fill]').forEach((node) => {
          if ((node.getAttribute('fill') || '').toLowerCase() === previous.toLowerCase()) {
            node.setAttribute('fill', input.value);
          }
        });
        input.dataset.current = input.value;
        text.textContent = input.value;
        refreshState(state);
      });

      label.append(input, text);
      fragment.append(label);
    });

    return fragment;
  }

  function renderResult(sampleKey, preset, svgText, elapsedMs) {
    if (results.querySelector('.pa-muted')) results.innerHTML = '';

    const parser = new DOMParser();
    const parsed = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = parsed.documentElement;
    if (svg.nodeName.toLowerCase() !== 'svg') throw new Error('SVG parse failed');

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    if (!svg.getAttribute('viewBox')) {
      const width = svgText.match(/width="([0-9.]+)"/)?.[1];
      const height = svgText.match(/height="([0-9.]+)"/)?.[1];
      if (width && height) svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${samples[sampleKey].label} ${preset} vector result`);

    const card = document.createElement('article');
    card.className = 'pa-lab-result';
    card.dataset.preset = preset;

    const head = document.createElement('div');
    head.className = 'pa-lab-result-head';

    const title = document.createElement('h3');
    title.className = 'pa-lab-result-title';
    title.textContent = preset;

    const metrics = document.createElement('p');
    metrics.className = 'pa-lab-metrics';
    const pathCount = svg.querySelectorAll('path').length;
    const colorCount = getSvgPalette(svg).length;
    const byteMetric = document.createElement('span');
    byteMetric.className = 'pa-lab-metric';
    byteMetric.textContent = `SVG ${formatBytes(svgBytes(svgText))}`;
    [`paths ${pathCount}`, `colors ${colorCount}`, `${elapsedMs.toFixed(0)} ms`].forEach((textValue) => {
      const metric = document.createElement('span');
      metric.className = 'pa-lab-metric';
      metric.textContent = textValue;
      metrics.append(metric);
    });
    metrics.prepend(byteMetric);
    head.append(title, metrics);

    const grid = document.createElement('div');
    grid.className = 'pa-lab-result-grid';

    const vectorPanel = document.createElement('div');
    vectorPanel.className = 'pa-lab-panel';
    const vectorTitle = document.createElement('h4');
    vectorTitle.textContent = '単体SVG';
    const stage = document.createElement('div');
    stage.className = 'pa-lab-svg-stage';
    stage.append(document.importNode(svg, true));
    vectorPanel.append(vectorTitle, stage);

    const repeatPanel = document.createElement('div');
    repeatPanel.className = 'pa-lab-panel';
    const repeatTitle = document.createElement('h4');
    repeatTitle.textContent = '反復プレビュー';
    const repeat = document.createElement('div');
    repeat.className = 'pa-lab-repeat-stage';
    repeatPanel.append(repeatTitle, repeat);
    grid.append(vectorPanel, repeatPanel);

    const editor = document.createElement('div');
    editor.className = 'pa-lab-editor';

    const actions = document.createElement('div');
    actions.className = 'pa-lab-editor-actions';
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'pa-button';
    resetButton.textContent = '色を戻す';
    const downloadButton = document.createElement('button');
    downloadButton.type = 'button';
    downloadButton.className = 'pa-button pa-button-primary';
    downloadButton.textContent = 'SVG保存';
    actions.append(resetButton, downloadButton);

    const state = {
      key: `${sampleKey}:${preset}`,
      sampleKey,
      preset,
      originalSvg: svgText,
      stage,
      repeat,
      byteMetric,
      editor,
      actions,
      serialized: svgText
    };

    const palette = getSvgPalette(stage.querySelector('svg'));
    editor.append(buildPaletteEditor(state, palette), actions);
    card.append(head, grid, editor);
    results.append(card);
    states.set(state.key, state);

    resetButton.addEventListener('click', () => {
      const original = parser.parseFromString(state.originalSvg, 'image/svg+xml').documentElement;
      original.removeAttribute('width');
      original.removeAttribute('height');
      stage.replaceChildren(document.importNode(original, true));
      const freshPalette = getSvgPalette(stage.querySelector('svg'));
      editor.querySelectorAll('.pa-lab-color').forEach((node) => node.remove());
      editor.prepend(buildPaletteEditor(state, freshPalette));
      refreshState(state);
    });

    downloadButton.addEventListener('click', () => downloadSvg(state));
    refreshState(state);
  }

  function trace(sampleKey, preset) {
    return new Promise((resolve, reject) => {
      if (!window.ImageTracer || typeof window.ImageTracer.imageToSVG !== 'function') {
        reject(new Error('ImageTracerJSを読み込めませんでした'));
        return;
      }
      const started = performance.now();
      const options = { ...presets[preset] };
      try {
        window.ImageTracer.imageToSVG(samples[sampleKey].src, (svgText) => {
          try {
            const elapsed = performance.now() - started;
            renderResult(sampleKey, preset, svgText, elapsed);
            resolve();
          } catch (error) {
            reject(error);
          }
        }, options);
      } catch (error) {
        reject(error);
      }
    });
  }

  async function runSelected() {
    const sampleKey = patternSelect.value;
    const preset = presetSelect.value;
    results.innerHTML = '';
    states.clear();
    resultCount.textContent = '0 results';
    setStatus(`${samples[sampleKey].label} / ${preset} を変換中…`, 'busy');
    runButton.disabled = true;
    runAllButton.disabled = true;
    try {
      await trace(sampleKey, preset);
      resultCount.textContent = '1 result';
      setStatus('変換完了。元PNGと拡大表示、path数、色編集を確認してください。', 'ok');
    } catch (error) {
      results.innerHTML = `<p class="pa-muted">変換に失敗しました: ${String(error.message || error)}</p>`;
      setStatus('変換に失敗しました。', 'error');
    } finally {
      runButton.disabled = false;
      runAllButton.disabled = false;
    }
  }

  async function runAll() {
    const sampleKey = patternSelect.value;
    results.innerHTML = '';
    states.clear();
    resultCount.textContent = '0 results';
    runButton.disabled = true;
    runAllButton.disabled = true;
    try {
      let completed = 0;
      for (const preset of Object.keys(presets)) {
        setStatus(`${samples[sampleKey].label} / ${preset} を変換中…`, 'busy');
        await trace(sampleKey, preset);
        completed += 1;
        resultCount.textContent = `${completed} results`;
      }
      setStatus('3プリセットの比較が完了しました。', 'ok');
    } catch (error) {
      setStatus(`比較途中で失敗しました: ${String(error.message || error)}`, 'error');
    } finally {
      runButton.disabled = false;
      runAllButton.disabled = false;
    }
  }

  patternSelect.addEventListener('change', updateSource);
  runButton.addEventListener('click', runSelected);
  runAllButton.addEventListener('click', runAll);
  tileSize.addEventListener('input', () => {
    tileOutput.textContent = `${tileSize.value}px`;
    states.forEach((state) => refreshState(state));
  });

  updateSource();
}
