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
    notFound: { ja: '未検出', en: 'Not Found' }
  };

  const proxy = 'https://api.allorigins.win/raw?url=';

  const setLang = (lang) => {
    state.lang = lang;
    body.classList.remove('lang-ja', 'lang-en');
    body.classList.add(`lang-${lang}`);
    langButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    renderResults();
    renderError();
  };

  const renderError = () => {
    if (!errorText.dataset.key) {
      errorText.textContent = '';
      return;
    }
    const key = errorText.dataset.key;
    errorText.textContent = messages[key]?.[state.lang] || '';
  };

  const setError = (key = '') => {
    errorText.dataset.key = key;
    renderError();
  };

  const getLocalized = (value) => {
    if (!value) {
      return messages.notFound[state.lang];
    }
    return value;
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
    if (!value.trim()) {
      setError('empty');
      return false;
    }
    if (!/^https?:\/\//i.test(value.trim())) {
      setError('invalid');
      return false;
    }
    setError('');
    return true;
  };

  const fetchHtml = async (url) => {
    const fetchURL = proxy + encodeURIComponent(url);
    try {
      const resp = await fetch(fetchURL);
      if (!resp.ok) return '';
      return await resp.text();
    } catch (e) {
      return '';
    }
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
    } catch (e) {
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
    if (!validateUrl(url)) return;

    analyzeBtn.disabled = true;
    urlInput.disabled = true;
    resultCard.hidden = true;
    progress.hidden = false;

    let parsed = { title: '', description: '', ogImage: '', canonical: '' };
    let hasHtml = false;

    try {
      const html = await fetchHtml(url);

      if (html) {
        hasHtml = true;
        parsed = parseWithDom(html) || parseWithRegex(html) || parsed;
      }

      state.title = parsed.title || '';
      state.description = parsed.description || '';
      state.ogImage = parsed.ogImage || '';
      state.canonical = parsed.canonical || '';

      if (hasHtml) {
        resultCard.hidden = false;
        renderResults();
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } finally {
      progress.hidden = true;
      analyzeBtn.disabled = false;
      urlInput.disabled = false;
    }
  };

  const reset = () => {
    urlInput.value = '';
    urlInput.disabled = false;
    analyzeBtn.disabled = false;
    setError('');
    progress.hidden = true;
    resultCard.hidden = true;
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
    urlInput.focus();
  };

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  analyzeBtn.addEventListener('click', analyze);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      analyze();
    }
  });
  resetBtn.addEventListener('click', reset);

  resultCard.hidden = true;
  setLang(state.lang);
})();
