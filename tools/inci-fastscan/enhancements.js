(function enhanceFastScan(root) {
  'use strict';

  const workflows = [
    {
      fileId: 'ocr-file-fast',
      textareaId: 'fast-input',
      statusId: 'fast-ocr-status',
      progressId: 'fast-ocr-progress',
      resetId: 'btn-fast-reset',
      lang: 'en'
    },
    {
      fileId: 'ocr-file',
      textareaId: 'jb-input',
      statusId: 'jb-ocr-status',
      progressId: 'jb-ocr-progress',
      resetId: 'btn-jb-reset',
      lang: 'ja'
    }
  ];

  const ROLE_INFO = {
    humectant: { ja: '保湿', en: 'Humectant', jaNote: '水分を抱え込み、うるおいを保つ目的で使われる成分です。', enNote: 'Helps attract or retain moisture in the formula and on the skin.' },
    moisturizer: { ja: '保湿', en: 'Moisturizer', jaNote: '肌のうるおいを保つ目的で使われる成分です。', enNote: 'Used to help maintain skin moisture.' },
    soothing: { ja: '整肌', en: 'Skin conditioning', jaNote: '肌をすこやかに整える目的で使われる成分です。', enNote: 'Used to help condition and maintain the skin.' },
    active: { ja: '機能性成分', en: 'Functional ingredient', jaNote: '製品に特定の機能を持たせる目的で配合される成分です。', enNote: 'Used to provide a specific functional role in the product.' },
    'amino acid': { ja: 'アミノ酸', en: 'Amino acid', jaNote: '保湿やコンディショニングなどに使われるアミノ酸系成分です。', enNote: 'An amino-acid ingredient used for moisturizing or conditioning roles.' },
    silicone: { ja: 'シリコーン', en: 'Silicone', jaNote: '感触調整や皮膜形成などに使われるシリコーン系成分です。', enNote: 'A silicone ingredient used for feel, slip, or film-forming roles.' },
    'film former': { ja: '皮膜形成', en: 'Film former', jaNote: '肌や毛髪の表面に薄い膜を作る目的で使われる成分です。', enNote: 'Used to form a thin film on skin or hair.' },
    emollient: { ja: 'エモリエント', en: 'Emollient', jaNote: '肌をなめらかにし、水分の蒸散を抑える目的で使われる油性成分です。', enNote: 'Used to soften skin and reduce moisture loss.' },
    oil: { ja: '油性成分', en: 'Oil', jaNote: '感触調整やエモリエント目的で使われる油性成分です。', enNote: 'An oil-based ingredient used for emollience or product feel.' },
    solvent: { ja: '溶剤', en: 'Solvent', jaNote: '他の成分を溶かしたり、処方のベースを作るために使われる成分です。', enNote: 'Used as a solvent or as part of the formulation base.' },
    preservative: { ja: '保存系', en: 'Preservative', jaNote: '製品の品質を保つために使われる保存系の成分です。', enNote: 'Used to help preserve product quality.' },
    fragrance: { ja: '香料', en: 'Fragrance', jaNote: '製品に香りを付けるために使われる成分です。', enNote: 'Used to add fragrance to the product.' },
    surfactant: { ja: '界面活性剤', en: 'Surfactant', jaNote: '水と油をなじませたり、洗浄・乳化などに使われる成分です。', enNote: 'Used for cleansing, emulsifying, or combining oil and water.' },
    cleanser: { ja: '洗浄', en: 'Cleanser', jaNote: '皮脂や汚れを落とす目的で使われる洗浄成分です。', enNote: 'Used to remove oil or dirt.' },
    'uv filter': { ja: 'UVフィルター', en: 'UV filter', jaNote: '紫外線を防ぐ目的で使われるUVフィルター系の成分です。', enNote: 'A UV-filter ingredient used for sun-protection functions.' },
    sunscreen: { ja: 'UVフィルター', en: 'UV filter', jaNote: '紫外線を防ぐ目的で使われるUVフィルター系の成分です。', enNote: 'A UV-filter ingredient used for sun-protection functions.' },
    colorant: { ja: '着色', en: 'Colorant', jaNote: '製品に色を付ける目的で使われる成分です。', enNote: 'Used to add color to the product.' },
    pigment: { ja: '着色', en: 'Pigment', jaNote: '製品に色を付ける目的で使われる成分です。', enNote: 'Used to add color to the product.' },
    antioxidant: { ja: '酸化防止', en: 'Antioxidant', jaNote: '処方中の成分の酸化を抑える目的で使われる成分です。', enNote: 'Used to help limit oxidation in the formulation.' },
    botanical: { ja: '植物由来', en: 'Botanical', jaNote: '植物由来の原料として配合される成分です。', enNote: 'A plant-derived ingredient used in the formulation.' },
    extract: { ja: '植物由来', en: 'Extract', jaNote: '植物由来のエキスとして配合される成分です。', enNote: 'A plant-derived extract used in the formulation.' },
    peptide: { ja: 'ペプチド', en: 'Peptide', jaNote: 'ペプチド系のコンディショニング成分です。', enNote: 'A peptide ingredient used for conditioning roles.' },
    ferment: { ja: '発酵', en: 'Ferment', jaNote: '発酵由来の原料として使われる成分です。', enNote: 'A fermentation-derived ingredient used in the formulation.' },
    thickener: { ja: '増粘', en: 'Thickener', jaNote: '製品のとろみや粘度を調整するために使われる成分です。', enNote: 'Used to adjust thickness or viscosity.' },
    emulsifier: { ja: '乳化', en: 'Emulsifier', jaNote: '水と油を均一になじませるために使われる乳化成分です。', enNote: 'Used to keep oil and water mixed.' },
    chelator: { ja: 'キレート', en: 'Chelating agent', jaNote: '金属イオンを捕捉し、処方の安定性を保つために使われる成分です。', enNote: 'Used to bind metal ions and support formulation stability.' },
    'chelating agent': { ja: 'キレート', en: 'Chelating agent', jaNote: '金属イオンを捕捉し、処方の安定性を保つために使われる成分です。', enNote: 'Used to bind metal ions and support formulation stability.' },
    ph: { ja: 'pH調整', en: 'pH adjuster', jaNote: '製品のpHを調整するために使われる成分です。', enNote: 'Used to adjust product pH.' },
    'ph adjuster': { ja: 'pH調整', en: 'pH adjuster', jaNote: '製品のpHを調整するために使われる成分です。', enNote: 'Used to adjust product pH.' },
    'viscosity adjuster': { ja: '粘度調整', en: 'Viscosity adjuster', jaNote: '製品の粘度や使用感を調整するために使われる成分です。', enNote: 'Used to adjust viscosity or product texture.' },
    general: { ja: 'その他', en: 'Other', jaNote: '処方を構成する成分の一つです。詳しい用途はメーカー等の公式情報も確認してください。', enNote: 'One of the ingredients that makes up the formula. Check official manufacturer information for its specific use.' }
  };

  function textFor(lang, ja, en) {
    return lang === 'ja' ? ja : en;
  }

  function uiLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'ja';
  }

  function setBilingual(el, ja, en) {
    if (!el) return;
    el.dataset.ja = ja;
    el.dataset.en = en;
    el.textContent = uiLang() === 'en' ? en : ja;
  }

  function setupWorkflow(config) {
    const fileInput = document.getElementById(config.fileId);
    const textarea = document.getElementById(config.textareaId);
    const status = document.getElementById(config.statusId);
    const progress = document.getElementById(config.progressId);
    const reset = document.getElementById(config.resetId);
    if (!fileInput || !textarea || !status) return;

    const fileRow = fileInput.closest('.file-row') || fileInput.parentElement;
    const ocrBox = fileInput.closest('.ocr-box') || fileRow?.parentElement;
    if (!fileRow || !ocrBox) return;

    const preview = document.createElement('div');
    preview.className = 'ocr-image-preview';
    preview.hidden = true;
    preview.innerHTML = `
      <img alt="${textFor(config.lang, 'OCR対象画像のプレビュー', 'Preview of image selected for OCR')}" />
      <div class="ocr-image-preview-meta">
        <span class="ocr-image-preview-label"></span>
        <button type="button" class="ocr-image-clear">${textFor(config.lang, '画像を外す', 'Remove image')}</button>
      </div>`;
    fileRow.insertAdjacentElement('afterend', preview);

    const reviewHint = document.createElement('div');
    reviewHint.className = 'ocr-review-hint';
    reviewHint.hidden = true;
    reviewHint.setAttribute('role', 'status');
    reviewHint.textContent = textFor(
      config.lang,
      'OCR結果が入力欄に入りました。商品ラベルと見比べて誤認識を修正してから「日本語成分名を照合」を押してください。',
      'OCR text is now editable above. Compare it with the label, correct any misreads, then run ingredient matching.'
    );
    status.insertAdjacentElement('afterend', reviewHint);

    const image = preview.querySelector('img');
    const label = preview.querySelector('.ocr-image-preview-label');
    const clear = preview.querySelector('.ocr-image-clear');
    let objectUrl = null;

    function clearPreview({ clearInput = false } = {}) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
      preview.hidden = true;
      image.removeAttribute('src');
      label.textContent = '';
      reviewHint.hidden = true;
      if (clearInput) fileInput.value = '';
    }

    function updatePreview() {
      clearPreview();
      const file = fileInput.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      objectUrl = URL.createObjectURL(file);
      image.src = objectUrl;
      const kb = Math.max(1, Math.round(file.size / 1024));
      label.textContent = textFor(config.lang, `選択画像 · ${kb} KB`, `Selected image · ${kb} KB`);
      preview.hidden = false;
    }

    function updateReviewHint() {
      const hasText = Boolean(textarea.value.trim());
      const progressComplete = progress ? Number(progress.value || 0) >= 100 : false;
      const statusText = status.textContent.trim();
      const likelyCompleted = progressComplete || /完了|complete|done|recognized|認識/i.test(statusText);
      reviewHint.hidden = !(hasText && likelyCompleted);
    }

    fileInput.addEventListener('change', updatePreview);
    clear.addEventListener('click', () => clearPreview({ clearInput: true }));
    reset?.addEventListener('click', () => clearPreview({ clearInput: true }));
    textarea.addEventListener('input', updateReviewHint);

    const statusObserver = new MutationObserver(updateReviewHint);
    statusObserver.observe(status, { childList: true, characterData: true, subtree: true, attributes: true });
    if (progress) {
      const progressObserver = new MutationObserver(updateReviewHint);
      progressObserver.observe(progress, { attributes: true, attributeFilter: ['value', 'hidden'] });
    }
  }

  function rewriteStaticProductCopy() {
    setBilingual(document.querySelector('.tool-hero-lead'),
      '商品ラベルの写真をOCRで読み取り、文字を修正したあと、それぞれの成分の主な役割や特徴を確認できます。写真がなくてもテキスト貼り付けで利用できます。',
      'Scan a product label with OCR, correct the text, then review the main role and characteristics of each ingredient. You can also paste text directly.');
    const resultPurpose = document.querySelectorAll('.purpose-strip .purpose-item span')[2];
    setBilingual(resultPurpose, '各成分の役割と特徴を詳しく確認', 'Review ingredient roles and characteristics in detail');

    const intros = document.querySelectorAll('.workspace-intro h2');
    setBilingual(intros[0], 'INCI / 英語成分を読み取って役割を確認', 'Read INCI / English ingredients and review their roles');
    setBilingual(intros[1], '日本語の全成分表示を読み取って役割を確認', 'Read Japanese ingredient labels and review their roles');

    const dictStatus = document.getElementById('dict-status');
    if (dictStatus && !/失敗|failed|一部|fallback/i.test(dictStatus.textContent)) {
      dictStatus.textContent = uiLang() === 'en' ? 'Ingredient information ready.' : '成分情報を読み込みました。';
    }
  }

  function roleFromCard(card) {
    const lines = [...card.querySelectorAll('.small')];
    const categoryLine = lines.find((line) => /^(分類|Category):/.test(line.textContent.trim()));
    if (!categoryLine) return { key: '', info: null, line: null };
    const key = categoryLine.textContent.replace(/^(分類|Category):\s*/, '').trim().toLowerCase();
    return { key, info: ROLE_INFO[key] || ROLE_INFO.general, line: categoryLine };
  }

  function rewriteSummary(container) {
    const summary = container.querySelector('.result-summary');
    if (!summary) return;
    const lang = uiLang();
    const title = summary.querySelector(':scope > strong');
    if (title) title.textContent = lang === 'en' ? 'Ingredient overview' : '成分の概要';
    const spans = summary.querySelectorAll('.summary-grid span');
    if (spans[0]) spans[0].textContent = spans[0].textContent.replace(/^.*?:/, lang === 'en' ? 'Role information:' : '成分情報:');
    if (spans[1]) spans[1].textContent = spans[1].textContent.replace(/^.*?:/, lang === 'en' ? 'Additional review:' : '追加確認:');
    if (spans[2]) spans[2].textContent = spans[2].textContent.replace(/^.*?:/, lang === 'en' ? 'Needs more information:' : '情報不足:');
    const note = summary.querySelector('.summary-grid + .small');
    if (note) note.textContent = lang === 'en'
      ? 'Review the main role of each ingredient below. These descriptions do not determine product safety or personal suitability.'
      : '下で各成分の主な役割を確認できます。ここでの説明は製品の安全性や個人への適合性を判定するものではありません。';
    const filterLabels = {
      all: lang === 'en' ? 'All' : 'すべて',
      matched: lang === 'en' ? 'Role available' : '役割あり',
      review: lang === 'en' ? 'Additional review' : '追加確認',
      unknown: lang === 'en' ? 'Needs info' : '情報不足'
    };
    summary.querySelectorAll('[data-result-filter]').forEach((button) => {
      button.textContent = filterLabels[button.dataset.resultFilter] || button.textContent;
    });
  }

  function rewriteCard(card) {
    const lang = uiLang();
    const state = card.dataset.resultState || '';
    const headBadge = card.querySelector('.review-label');
    const note = card.querySelector('.result-note');
    const role = roleFromCard(card);

    if (state === 'unknown') {
      if (headBadge) headBadge.textContent = lang === 'en' ? 'Needs more information' : '情報不足';
      if (note) note.textContent = lang === 'en'
        ? 'There is not enough information for this spelling. Check the OCR text, product label, or the manufacturer’s official ingredient list.'
        : 'この表記から十分な成分情報を確認できませんでした。OCR結果・製品ラベル・メーカー公式の全成分表示を確認してください。';
      return;
    }

    if (headBadge) {
      if (state === 'review') headBadge.textContent = lang === 'en' ? 'Additional review' : '追加確認';
      else headBadge.textContent = role.info ? (lang === 'en' ? role.info.en : role.info.ja) : (lang === 'en' ? 'Ingredient information' : '成分情報');
    }

    for (const line of card.querySelectorAll('.small')) {
      const text = line.textContent.trim();
      if (/^(Canonical INCI|入力表記|Input|照合方法|Match route|一致表記|Matched name):/.test(text)) {
        line.hidden = true;
      }
    }

    if (role.line && role.info) {
      role.line.hidden = false;
      role.line.textContent = lang === 'en' ? `Main role: ${role.info.en}` : `主な役割: ${role.info.ja}`;
    }

    const jpLine = [...card.querySelectorAll('.small')].find((line) => /^(日本語名候補|Japanese names):/.test(line.textContent.trim()));
    if (jpLine) jpLine.textContent = jpLine.textContent.replace(/^(日本語名候補|Japanese names):\s*/, lang === 'en' ? 'Japanese name: ' : '日本語名: ');

    if (note && role.info) {
      note.textContent = lang === 'en' ? role.info.enNote : role.info.jaNote;
    } else if (note && /辞書|dictionary/i.test(note.textContent)) {
      note.textContent = lang === 'en'
        ? 'The main role of this ingredient is available. Check official manufacturer information for product-specific use.'
        : 'この成分の主な役割を確認できました。製品ごとの詳しい使用目的はメーカー等の公式情報も確認してください。';
    }
  }

  function enhanceResults() {
    for (const id of ['fast-results', 'jb-results']) {
      const container = document.getElementById(id);
      if (!container) continue;
      rewriteSummary(container);
      container.querySelectorAll('.result-card').forEach(rewriteCard);
    }
  }

  function init() {
    for (const workflow of workflows) setupWorkflow(workflow);
    rewriteStaticProductCopy();
    enhanceResults();

    let queued = false;
    const scheduleEnhance = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        rewriteStaticProductCopy();
        enhanceResults();
      });
    };

    for (const id of ['fast-results', 'jb-results']) {
      const container = document.getElementById(id);
      if (!container) continue;
      const observer = new MutationObserver(scheduleEnhance);
      observer.observe(container, { childList: true, subtree: true });
    }

    const langObserver = new MutationObserver(scheduleEnhance);
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof globalThis !== 'undefined' ? globalThis : this);