(() => {
  const DICT_URL = '../old-kanji-reference/dict.json';
  const METADATA_FILES = [
    'meta.json',
    'meta-extra-2.json',
    'meta-extra-3.json',
    'meta-extra-4.json',
    'meta-extra-5.json',
    'meta-extra-6.json'
  ];
  const COMPATIBILITY_URL = '../old-kanji-reference/compatibility-notes.json';

  const state = {
    lang: 'ja',
    dict: { old_to_new: {} },
    metadataByOldChar: new Map(),
    compatibilityByChar: new Map(),
    modernToOld: new Map(),
    dataStatus: 'loading'
  };

  const el = {
    title: document.getElementById('page-title'),
    description: document.getElementById('page-description'),
    langButtons: Array.from(document.querySelectorAll('.lang-switch button')),
    nameLabel: document.getElementById('name-label'),
    input: document.getElementById('name-input'),
    checkButton: document.getElementById('check-button'),
    loadingState: document.getElementById('loading-state'),
    summary: document.getElementById('result-summary'),
    list: document.getElementById('name-result-list'),
    riskPanel: document.getElementById('risk-panel'),
    converterLinkWrap: document.getElementById('converter-link-wrap'),
    privacyNote: document.getElementById('privacy-note'),
    relatedLinksTitle: document.getElementById('related-links-title')
  };

  const i18n = {
    ja: {
      title: '人名旧字体チェッカー',
      description:
        '名前に含まれる旧字体・異体字候補を確認するための参考ツールです。氏名・戸籍・公的書類では、必ず実際の登録字体を確認してください。',
      nameLabel: '名前を入力',
      placeholder: '例：齋藤、渡邊、濱田、髙橋',
      checkButton: 'チェックする',
      loading: '辞書データを読み込み中です。',
      partialLoadError: '辞書データの一部を読み込めませんでした。基本の対応表のみで表示します。',
      loadError: '辞書データを読み込めませんでした。',
      resultTitle: 'チェック結果',
      found: '旧字体・異体字候補が見つかりました。',
      notFound: '登録済みの旧字体・異体字候補は見つかりませんでした。',
      unknown: '登録データなし / No data in current reference',
      possibleOldCandidates: 'の旧字体・異体字候補：',
      reading: '読み',
      meaning: '意味',
      category: '候補種別',
      categoryMap: {
        name: '人名・地名',
        document: '文献・古文書',
        common: '旧常用漢字',
        rare: '参考',
        popular: 'よく使う旧字体',
        pair_only: '対応表のみ'
      },
      renderingTitle: '表示環境の注意',
      copyInput: '入力字をコピー',
      copyModern: '現代表記をコピー',
      copyCandidate: '候補をコピー',
      copyAll: '候補一覧をコピー',
      detailLink: '旧字体一覧で詳しく見る',
      converterLink: '文章全体を旧字体変換ツールで確認する',
      privacyNote:
        '入力内容はブラウザ内で処理され、外部APIには送信しません。アクセス解析や広告タグが読み込まれる場合があります。',
      relatedLinks: '関連リンク',
      riskTitle: '氏名で使う場合の注意',
      riskText:
        'このツールは旧字体・異体字の参考確認用です。氏名・戸籍・住民票・登記・銀行・保険・学校・勤務先などで使う場合は、必ず実際の登録字体を確認してください。ここで表示される候補は、法的な有効性や登録可否を判断するものではありません。',
      copyNote: 'コピー時注意',
      recommendedCheck: '推奨確認'
    },
    en: {
      title: 'Name Old Kanji Checker',
      description:
        'A reference tool for checking old or variant kanji forms that may appear in names. For names, family registers, or official documents, always confirm the actually registered glyph.',
      nameLabel: 'Enter a name',
      placeholder: 'Example: Saito, Watanabe, Hamada, Takahashi using kanji variants',
      checkButton: 'Check name',
      loading: 'Loading dictionary data.',
      partialLoadError: 'Some optional dictionary data could not be loaded. Showing basic mappings only.',
      loadError: 'Could not load dictionary data.',
      resultTitle: 'Check result',
      found: 'Old or variant kanji candidates were found.',
      notFound: 'No registered old or variant kanji candidates were found.',
      unknown: 'No data in current reference',
      possibleOldCandidates: ' possible old or variant forms:',
      reading: 'Reading',
      meaning: 'Meaning',
      category: 'Candidate type',
      categoryMap: {
        name: 'Names / Places',
        document: 'Old documents',
        common: 'Common-use old forms',
        rare: 'Reference',
        popular: 'Common old forms',
        pair_only: 'Pair-only'
      },
      renderingTitle: 'Rendering note',
      copyInput: 'Copy input character',
      copyModern: 'Copy modern form',
      copyCandidate: 'Copy candidate',
      copyAll: 'Copy all candidates',
      detailLink: 'View in Old Kanji Reference',
      converterLink: 'Check full text in converter',
      privacyNote:
        'Input is processed in the browser and is not sent to an external API. Analytics or ad tags may be loaded on the page.',
      relatedLinks: 'Related links',
      riskTitle: 'Important note for names',
      riskText:
        'This tool is for reference checking of old and variant kanji forms. For names, family registers, residence records, banking, insurance, school, workplace, or other official use, always confirm the actually registered glyph. The candidates shown here do not determine legal validity or registration availability.',
      copyNote: 'Copy note',
      recommendedCheck: 'Recommended check'
    }
  };

  function t(key) {
    return i18n[state.lang][key];
  }

  function splitCharacters(text) {
    return Array.from(text || '');
  }

  function getCodePointInfo(char) {
    if (!char) return null;
    const codePoint = char.codePointAt(0);
    return {
      char,
      codePoint,
      hex: `U+${codePoint.toString(16).toUpperCase()}`
    };
  }

  function hasCompatibilityIdeograph(char) {
    const info = getCodePointInfo(char);
    return !!info && info.codePoint >= 0xf900 && info.codePoint <= 0xfaff;
  }

  function hasSupplementaryPlaneChar(char) {
    const info = getCodePointInfo(char);
    return !!info && info.codePoint > 0xffff;
  }

  function hasVariationSelector(char) {
    const info = getCodePointInfo(char);
    if (!info) return false;
    const cp = info.codePoint;
    return (cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef);
  }

  function getFallbackCompatibilityNote(char) {
    if (!char) return null;
    if (
      !hasCompatibilityIdeograph(char) &&
      !hasSupplementaryPlaneChar(char) &&
      !hasVariationSelector(char)
    ) {
      return null;
    }

    return {
      summaryJa: '環境依存の表示差が出る可能性があります。',
      summaryEn: 'Rendering may vary by environment.',
      copyNoteJa: '貼り付け先で字形が変わる場合があります。',
      copyNoteEn: 'Glyph shape may change in destination apps.',
      recommendedCheckJa: '表示字形とUnicode値を確認してください。',
      recommendedCheckEn: 'Check rendered glyph and Unicode code point.'
    };
  }

  function mapCategoryLabel(category) {
    if (!category) return '';
    const mapping = t('categoryMap')[category];
    return mapping || category;
  }

  function addModernToOldEntry(modern, oldChar) {
    if (!modern || !oldChar) return;
    const oldChars = state.modernToOld.get(modern) || [];
    if (!oldChars.includes(oldChar)) {
      oldChars.push(oldChar);
      state.modernToOld.set(modern, oldChars);
    }
  }

  function buildReverseLookupFromOldToNew(oldToNew) {
    state.modernToOld.clear();

    Object.entries(oldToNew || {}).forEach(([oldChar, modern]) => {
      if (Array.isArray(modern)) {
        modern.forEach((modernChar) => addModernToOldEntry(modernChar, oldChar));
      } else {
        addModernToOldEntry(modern, oldChar);
      }
    });
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.json();
  }

  async function loadData() {
    state.dataStatus = 'loading';

    const dict = await fetchJson(DICT_URL);
    state.dict = dict;
    buildReverseLookupFromOldToNew(dict.old_to_new || {});

    let optionalLoadFailed = false;

    for (const file of METADATA_FILES) {
      try {
        const json = await fetchJson(`../old-kanji-reference/${file}`);
        const entries = json.entries || {};
        Object.entries(entries).forEach(([oldChar, meta]) => {
          if (!oldChar || !meta) return;
          state.metadataByOldChar.set(oldChar, meta);
        });
      } catch (_error) {
        optionalLoadFailed = true;
      }
    }

    try {
      const compatibility = await fetchJson(COMPATIBILITY_URL);
      const entries = compatibility.entries || {};
      Object.entries(entries).forEach(([char, note]) => {
        state.compatibilityByChar.set(char, note);
      });
    } catch (_error) {
      optionalLoadFailed = true;
    }

    state.dataStatus = optionalLoadFailed ? 'partial_error' : 'ready';
  }

  function createCopyButton(label, value) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value);
      }
    });
    return button;
  }

  function getMetadataForCharacters(candidates) {
    for (const char of candidates) {
      if (!char) continue;
      const metadata = state.metadataByOldChar.get(char);
      if (metadata) return metadata;
    }
    return null;
  }

  function renderStatusMessage() {
    el.loadingState.hidden = false;
    el.loadingState.className = `loading-state status-${state.dataStatus}`;

    if (state.dataStatus === 'loading') {
      el.loadingState.textContent = t('loading');
      return;
    }

    if (state.dataStatus === 'partial_error') {
      el.loadingState.textContent = t('partialLoadError');
      return;
    }

    if (state.dataStatus === 'error') {
      el.loadingState.textContent = t('loadError');
      return;
    }

    el.loadingState.hidden = true;
  }

  function render() {
    renderStatusMessage();

    const rawInput = el.input.value.trim();
    const isUsable = state.dataStatus === 'ready' || state.dataStatus === 'partial_error';

    el.summary.hidden = !rawInput || !isUsable;
    el.list.hidden = !rawInput || !isUsable;
    el.riskPanel.hidden = !rawInput || !isUsable;

    el.summary.innerHTML = '';
    el.list.innerHTML = '';
    el.converterLinkWrap.innerHTML = '';

    if (!rawInput || !isUsable) return;

    let foundCount = 0;

    const heading = document.createElement('h2');
    heading.textContent = t('resultTitle');

    const summaryMessage = document.createElement('p');

    splitCharacters(rawInput).forEach((char) => {
      const modernForm = state.dict.old_to_new?.[char] || null;
      const oldCandidates = state.modernToOld.get(char) || [];

      if (modernForm || oldCandidates.length > 0) {
        foundCount += 1;
      }

      const card = document.createElement('article');
      card.className = 'name-result-card';

      const headline = document.createElement('p');
      if (modernForm) {
        const modernText = Array.isArray(modernForm) ? modernForm.join(' / ') : modernForm;
        headline.textContent = `${char} → ${modernText}`;
      } else if (oldCandidates.length > 0) {
        headline.textContent = `${char}${t('possibleOldCandidates')} ${oldCandidates.join(' / ')}`;
      } else {
        headline.textContent = `${char} : ${t('unknown')}`;
      }
      card.appendChild(headline);

      const modernCandidates = Array.isArray(modernForm) ? modernForm : [modernForm];
      const metadata = getMetadataForCharacters([char, ...oldCandidates, ...modernCandidates]);

      if (metadata) {
        if (metadata.readingJa || metadata.readingEn) {
          const reading = state.lang === 'ja' ? metadata.readingJa || metadata.readingEn : metadata.readingEn || metadata.readingJa;
          const readingEl = document.createElement('p');
          readingEl.textContent = `${t('reading')}: ${reading}`;
          card.appendChild(readingEl);
        }

        if (metadata.meaningJa || metadata.meaningEn) {
          const meaning = state.lang === 'ja' ? metadata.meaningJa || metadata.meaningEn : metadata.meaningEn || metadata.meaningJa;
          const meaningEl = document.createElement('p');
          meaningEl.textContent = `${t('meaning')}: ${meaning}`;
          card.appendChild(meaningEl);
        }

        if (metadata.category) {
          const categoryEl = document.createElement('p');
          categoryEl.textContent = `${t('category')}: ${mapCategoryLabel(metadata.category)}`;
          card.appendChild(categoryEl);
        }
      }

      const compatibilityNote =
        state.compatibilityByChar.get(char) ||
        state.compatibilityByChar.get(Array.isArray(modernForm) ? modernForm[0] : modernForm) ||
        getFallbackCompatibilityNote(char);

      if (compatibilityNote) {
        const noteBox = document.createElement('div');
        noteBox.className = 'risk-panel';

        const summaryText = state.lang === 'ja' ? compatibilityNote.summaryJa : compatibilityNote.summaryEn;
        const copyNoteText = state.lang === 'ja' ? compatibilityNote.copyNoteJa : compatibilityNote.copyNoteEn;
        const recommendedText =
          state.lang === 'ja' ? compatibilityNote.recommendedCheckJa : compatibilityNote.recommendedCheckEn;

        noteBox.innerHTML = `
          <strong>${t('renderingTitle')}</strong>
          <p>${summaryText || ''}</p>
          <p>${t('copyNote')}: ${copyNoteText || ''}</p>
          <p>${t('recommendedCheck')}: ${recommendedText || ''}</p>
        `;
        card.appendChild(noteBox);
      }

      const actions = document.createElement('div');
      actions.className = 'copy-actions';
      actions.appendChild(createCopyButton(t('copyInput'), char));

      if (modernForm) {
        const modernText = Array.isArray(modernForm) ? modernForm.join(' / ') : modernForm;
        actions.appendChild(createCopyButton(t('copyModern'), modernText));
      }

      if (oldCandidates.length > 0) {
        oldCandidates.forEach((candidate) => {
          actions.appendChild(createCopyButton(`${t('copyCandidate')}: ${candidate}`, candidate));
        });
        actions.appendChild(createCopyButton(t('copyAll'), oldCandidates.join(' / ')));
      }

      card.appendChild(actions);

      const referenceTarget = modernForm ? char : oldCandidates[0] || char;
      const reference = document.createElement('p');
      reference.className = 'reference-links';
      reference.innerHTML = `<a href="../old-kanji-reference/?q=${encodeURIComponent(referenceTarget)}">${t('detailLink')}</a>`;
      card.appendChild(reference);

      el.list.appendChild(card);
    });

    summaryMessage.textContent = foundCount > 0 ? t('found') : t('notFound');
    el.summary.append(heading, summaryMessage);

    el.riskPanel.innerHTML = `<h2>${t('riskTitle')}</h2><p>${t('riskText')}</p>`;

    const converterLink = document.createElement('a');
    converterLink.href = `../kanji-modernizer/?q=${encodeURIComponent(rawInput)}`;
    converterLink.textContent = t('converterLink');
    el.converterLinkWrap.appendChild(converterLink);
  }

  function setLanguage(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;

    el.title.textContent = t('title');
    el.description.textContent = t('description');
    el.nameLabel.textContent = t('nameLabel');
    el.input.placeholder = t('placeholder');
    el.checkButton.textContent = t('checkButton');
    el.privacyNote.textContent = t('privacyNote');
    el.relatedLinksTitle.textContent = t('relatedLinks');

    el.langButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === lang);
    });

    render();
  }

  function bindEvents() {
    el.langButtons.forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });

    el.checkButton.addEventListener('click', render);
    el.input.addEventListener('input', render);
  }

  async function initialize() {
    bindEvents();
    setLanguage('ja');

    try {
      await loadData();
    } catch (_error) {
      state.dataStatus = 'error';
    }

    render();
  }

  initialize();
})();
