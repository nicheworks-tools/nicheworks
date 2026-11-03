(() => {
  const body = document.body;
  const langButtons = document.querySelectorAll('.nw-lang-switch button');
  const analyzeBtn = document.getElementById('analyze-btn');
  const urlInput = document.getElementById('url-input');
  const errorText = document.getElementById('error-text');
  const progress = document.getElementById('progress');
  const resultCard = document.getElementById('result-card');
  const resTitle = document.getElementById('res-title');
  const resDesc = document.getElementById('res-desc');
  const resOgp = document.getElementById('res-ogp');
  const resCanonical = document.getElementById('res-canonical');
  const resetBtn = document.getElementById('reset-btn');

  let requestSerial = 0;
  let activeController = null;
  const cancelActiveRequest = () => {
    requestSerial += 1;
    if (activeController) activeController.abort();
    activeController = null;
  };

  const state = {
    lang: 'ja',
    title: '',
    description: '',
    ogImage: '',
    canonical: ''
  };

  const messages = {
    empty: { ja: 'URLを入力してください。', en: 'Please enter a URL.' },
    invalid: { ja: 'http/httpsのURLを入力してください。', en: 'Enter a URL starting with http or https.' },
    fetchFailed: {
      ja: 'ページを取得できませんでした。取得先サイトまたはプロキシの制限が考えられます。時間を置くか別のURLでお試しください。',
      en: 'The page could not be fetched. The target site or proxy may be blocking the request. Try again later or use another URL.'
    },
    notFound: { ja: '未検出', en: 'Not Found' }
  };

  const workerProxy = (url) =>
    `https://curly-meadow-fda4.nicheworks-tools.workers.dev/?url=${encodeURIComponent(url)}`;

  const allOriginsProxy = (url) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  const setLang = (lang) => {
    state.lang = lang === 'en' ? 'en' : 'ja';
    body.classList.remove('lang-ja', 'lang-en');
    body.classList.add(`lang-${state.lang}`);
    langButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === state.lang);
    });
    renderResults();
    renderError();
  };

  const renderError = () => {
    const key = errorText.dataset.key || '';
    errorText.textContent = key ? (messages[key]?.[state.lang] || '') : '';
  };

  const setError = (key = '') => {
    errorText.dataset.key = key;
    renderError();
  };

  const getLocalized = (value) => value || messages.notFound[state.lang];

  const clearMetadataState = () => {
    state.title = '';
    state.description = '';
    state.ogImage = '';
    state.canonical = '';
    resTitle.textContent = '';
    resDesc.textContent = '';
    resCanonical.textContent = '';
    resOgp.removeAttribute('src');
    resOgp.alt = '';
    resOgp.hidden = true;
  };

  const renderResults = () => {
    if (resultCard.hasAttribute('hidden')) return;
    resTitle.textContent = getLocalized(state.title);
    resDesc.textContent = getLocalized(state.description);
    resCanonical.textContent = getLocalized(state.canonical);

    if (state.ogImage) {
      resOgp.src = state.ogImage;
      resOgp.alt = 'OGP';
      resOgp.hidden = false;
    } else {
      resOgp.removeAttribute('src');
      resOgp.alt = '';
      resOgp.hidden = true;
    }
  };

  const validateUrl = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('empty');
      return false;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError('invalid');
      return false;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('invalid_protocol');
    } catch (_) {
      setError('invalid');
      return false;
    }
    setError('');
    return true;
  };

  const fetchHTML = async (userURL, signal) => {
    const proxies = [workerProxy, allOriginsProxy];
    for (const build of proxies) {
      if (signal?.aborted) throw new Error('request_cancelled');
      try {
        const response = await fetch(build(userURL), { mode: 'cors', signal });
        if (signal?.aborted) throw new Error('request_cancelled');
        if (response.ok) {
          const html = await response.text();
          if (signal?.aborted) throw new Error('request_cancelled');
          return html;
        }
      } catch (_) {
        // Reset/superseded requests must never continue to the third-party
        // AllOrigins fallback after the primary Worker request is canceled.
        if (signal?.aborted) throw new Error('request_cancelled');
      }
    }
    throw new Error('all_proxies_failed');
  };

  const parseWithDom = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return {
        title: doc.querySelector('title')?.textContent?.trim() || '',
        description: doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '',
        ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content')?.trim() || '',
        canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() || ''
      };
    } catch (_) {
      return null;
    }
  };

  const regexExtract = (html, pattern) => {
    const match = html.match(pattern);
    return match ? match[1].trim() : '';
  };

  const parseWithRegex = (html) => ({
    title: regexExtract(html, /<title[^>]*>([^<]*)<\/title>/i),
    description: regexExtract(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i),
    ogImage: regexExtract(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i),
    canonical: regexExtract(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)
  });

  const analyze = async () => {
    const url = urlInput.value.trim();
    cancelActiveRequest();
    if (!validateUrl(url)) {
      clearMetadataState();
      resultCard.hidden = true;
      progress.hidden = true;
      return;
    }
    const thisRequest = requestSerial;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    activeController = controller;

    analyzeBtn.disabled = true;
    urlInput.disabled = true;
    clearMetadataState();
    resultCard.hidden = true;
    progress.hidden = false;

    try {
      const html = await fetchHTML(url, controller?.signal);
      if (thisRequest !== requestSerial) return;
      const parsed = parseWithDom(html) || parseWithRegex(html);
      state.title = parsed?.title || '';
      state.description = parsed?.description || '';
      state.ogImage = parsed?.ogImage || '';
      state.canonical = parsed?.canonical || '';
      setError('');
      resultCard.hidden = false;
      renderResults();
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_) {
      if (thisRequest !== requestSerial) return;
      clearMetadataState();
      resultCard.hidden = true;
      setError('fetchFailed');
    } finally {
      if (thisRequest === requestSerial) {
        activeController = null;
        progress.hidden = true;
        analyzeBtn.disabled = false;
        urlInput.disabled = false;
      }
    }
  };

  const reset = () => {
    cancelActiveRequest();
    urlInput.value = '';
    urlInput.disabled = false;
    analyzeBtn.disabled = false;
    setError('');
    progress.hidden = true;
    resultCard.hidden = true;
    clearMetadataState();
    urlInput.focus();
  };

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  analyzeBtn.addEventListener('click', analyze);
  urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') analyze();
  });
  resetBtn.addEventListener('click', reset);

  document.addEventListener('DOMContentLoaded', () => {
    resultCard.hidden = true;
    progress.hidden = true;
    resOgp.hidden = true;
  });

  setLang(state.lang);
})();
