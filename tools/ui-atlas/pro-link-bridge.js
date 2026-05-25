(function () {
  const root = document.body;
  const app = document.querySelector('[data-ui-atlas-root]');
  if (!root || !app || root.dataset.page !== 'index') return;

  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const labels = lang === 'ja'
    ? {
        detail: 'このUIでProメモを作る',
        compare: 'この比較でProメモを作る',
        help: 'このUIの文脈をPro Generatorに渡します。',
        compareGoal: 'このプロダクト文脈に合うUIパターンを選ぶ',
        compareRisk: '文脈に合わないUIを選び、結果の見落としやモバイル表示崩れを招く',
        bestFor: '向いている場面',
        notFor: '向いていない場面',
        category: 'カテゴリ',
        purpose: '用途',
        mobile: 'モバイル適性',
        difficulty: '実装難易度',
        similar: '近いUI',
        prompt: 'Short AI prompt',
        implementation: '実装メモ'
      }
    : {
        detail: 'Create Pro memo for this UI',
        compare: 'Create Pro compare memo',
        help: 'Open the Pro Generator with this UI context.',
        compareGoal: 'Choose the right UI pattern for this product context',
        compareRisk: 'Choosing a pattern that hides consequences or breaks mobile layout',
        bestFor: 'Best for',
        notFor: 'Not for',
        category: 'Category',
        purpose: 'Purpose',
        mobile: 'Mobile fit',
        difficulty: 'Difficulty',
        similar: 'Similar UI',
        prompt: 'Short AI prompt',
        implementation: 'Implementation note'
      };

  function clean(value) {
    return (value || '')
      .replace(/\s+/g, ' ')
      .replace(/^[-–—:：\s]+/, '')
      .trim();
  }

  function compactText(value, maxLength) {
    const text = clean(value);
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
  }

  function toSafeParam(value, maxLength) {
    return compactText(value, maxLength || 180);
  }

  function proBase(pageLang) {
    return pageLang === 'ja' ? 'pro/' : 'pro/';
  }

  function safeSlug(value) {
    return clean(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9一-龯ぁ-んァ-ンー]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function addParam(params, key, value, maxLength) {
    const cleaned = toSafeParam(value, maxLength);
    if (cleaned) params.set(key, cleaned);
  }

  function makeUrl(values, pageLang) {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => addParam(params, key, value, key === 'context' ? 260 : 180));
    const query = params.toString();
    return proBase(pageLang || lang) + (query ? `?${query}` : '');
  }

  function textFrom(selector) {
    return clean(app.querySelector(selector)?.textContent || '');
  }

  function datasetFromDetail() {
    const content = app.querySelector('[data-detail-content]');
    return content?.dataset || {};
  }

  function joinLabeled(parts) {
    return parts
      .map(([label, value]) => {
        const cleaned = clean(value);
        return cleaned ? `${label}: ${cleaned}` : '';
      })
      .filter(Boolean)
      .join(' / ');
  }

  function getDetailRecordFromDom() {
    const dataset = datasetFromDetail();
    const title = textFrom('[data-detail-title]');
    const best = clean(dataset.best || textFrom('[data-detail-best]'));
    const notFor = clean(dataset.notFor || textFrom('[data-detail-not-for]'));
    const summary = clean(dataset.summary || textFrom('[data-detail-what]'));
    const practicalIntent = clean(dataset.practicalIntent || textFrom('[data-detail-practical-intent]'));
    const useCase = clean(dataset.usecase || textFrom('[data-detail-use-case]'));
    return {
      pattern: title,
      slug: clean(dataset.slug || dataset.id || ''),
      goal: best || practicalIntent || useCase,
      context: [summary, best].filter(Boolean).join(' '),
      risk: notFor,
      best_for: best,
      not_for: notFor,
      mobile: clean(dataset.mobileFit || ''),
      difficulty: clean(dataset.difficulty || ''),
      category: clean(dataset.category || ''),
      purpose: clean(dataset.purpose || ''),
      similar: clean(dataset.similar || textFrom('[data-detail-similar]')),
      short_prompt: clean(dataset.prompt || textFrom('[data-detail-prompt]')),
      implementation_note: clean(dataset.notes || textFrom('[data-detail-implementation]'))
    };
  }

  function buildProMemoUrl(record, pageLang) {
    const values = record || getDetailRecordFromDom();
    return makeUrl(values, pageLang || lang);
  }

  function compareItemToRecord(item) {
    return {
      slug: clean(item.getAttribute('data-compare-slug') || ''),
      name: clean(item.getAttribute('data-compare-name') || item.querySelector('h4, h3, strong')?.textContent || item.textContent || ''),
      best: clean(item.getAttribute('data-compare-best') || ''),
      notFor: clean(item.getAttribute('data-compare-not-for') || ''),
      category: clean(item.getAttribute('data-compare-category') || ''),
      purpose: clean(item.getAttribute('data-compare-purpose') || ''),
      mobileFit: clean(item.getAttribute('data-compare-mobile') || ''),
      difficulty: clean(item.getAttribute('data-compare-difficulty') || '')
    };
  }

  function getCompareRecordsFromDom() {
    return Array.from(app.querySelectorAll('[data-compare-list] .compare-item, [data-compare-list] article'))
      .map(compareItemToRecord)
      .filter((item) => item.slug || item.name);
  }

  function buildProCompareUrl(records, pageLang) {
    const selected = (records && records.length ? records : getCompareRecordsFromDom()).slice(0, 5);
    const slugs = selected.map((item) => item.slug || safeSlug(item.name)).filter(Boolean);
    const names = selected.map((item) => item.name).filter(Boolean);
    const best = selected.map((item) => item.best).filter(Boolean).join(' / ');
    const notFor = selected.map((item) => item.notFor).filter(Boolean).join(' / ');
    const mobile = selected.map((item) => item.mobileFit).filter(Boolean).join(', ');
    const difficulty = selected.map((item) => item.difficulty).filter(Boolean).join(', ');
    const context = selected.map((item) => joinLabeled([
      [item.name || item.slug, item.category || item.purpose]
    ]) || [item.name || item.slug, item.category || item.purpose].filter(Boolean).join(': ')).filter(Boolean).join(' / ');
    return makeUrl({
      compare: slugs.join(','),
      goal: best || labels.compareGoal,
      context,
      risk: notFor || labels.compareRisk,
      candidates: names.join(', '),
      mobile,
      difficulty
    }, pageLang || lang);
  }

  function ensureHelpText(wrap) {
    let help = wrap.querySelector('[data-pro-handoff-help]');
    if (!help) {
      help = document.createElement('span');
      help.className = 'muted-small';
      help.setAttribute('data-pro-handoff-help', 'true');
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(help);
    }
    help.textContent = labels.help;
  }

  function ensureDetailButton() {
    const content = app.querySelector('[data-detail-content]');
    if (!content) return;
    let wrap = content.querySelector('[data-pro-handoff-detail]');
    if (!wrap) {
      wrap = document.createElement('p');
      wrap.className = 'pro-handoff-cta';
      wrap.setAttribute('data-pro-handoff-detail', 'true');
      const link = document.createElement('a');
      link.className = 'primary-pro-cta';
      link.setAttribute('data-pro-handoff-detail-link', 'true');
      link.textContent = labels.detail;
      wrap.appendChild(link);
      ensureHelpText(wrap);
      const promptButton = content.querySelector('[data-copy-prompt]');
      if (promptButton && promptButton.parentNode) {
        promptButton.insertAdjacentElement('afterend', wrap);
      } else {
        content.appendChild(wrap);
      }
    }
    const link = wrap.querySelector('[data-pro-handoff-detail-link]');
    if (link) {
      link.textContent = labels.detail;
      link.href = buildProMemoUrl(getDetailRecordFromDom(), lang);
    }
    ensureHelpText(wrap);
  }

  function ensureCompareButton() {
    const tray = app.querySelector('.compare-tray');
    if (!tray) return;
    let wrap = tray.querySelector('[data-pro-handoff-compare]');
    if (!wrap) {
      wrap = document.createElement('p');
      wrap.className = 'pro-handoff-cta';
      wrap.setAttribute('data-pro-handoff-compare', 'true');
      const link = document.createElement('a');
      link.className = 'primary-pro-cta';
      link.setAttribute('data-pro-handoff-compare-link', 'true');
      link.textContent = labels.compare;
      wrap.appendChild(link);
      ensureHelpText(wrap);
      const diff = tray.querySelector('[data-compare-diff]');
      if (diff) diff.insertAdjacentElement('afterend', wrap);
      else tray.appendChild(wrap);
    }
    const records = getCompareRecordsFromDom();
    const link = wrap.querySelector('[data-pro-handoff-compare-link]');
    if (link) {
      link.textContent = labels.compare;
      link.href = buildProCompareUrl(records, lang);
    }
    ensureHelpText(wrap);
    wrap.hidden = records.length === 0;
  }

  function update() {
    ensureDetailButton();
    ensureCompareButton();
  }

  window.UIAtlasProLinkBridge = Object.assign(window.UIAtlasProLinkBridge || {}, {
    buildProMemoUrl,
    buildProCompareUrl,
    toSafeParam,
    compactText
  });

  const observer = new MutationObserver(() => window.setTimeout(update, 80));
  observer.observe(app, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-slug', 'data-id', 'data-best', 'data-not-for', 'data-mobile-fit', 'data-difficulty', 'data-category', 'data-purpose'] });
  window.addEventListener('click', () => window.setTimeout(update, 100));
  window.addEventListener('input', () => window.setTimeout(update, 100));
  window.setTimeout(update, 300);
  window.setTimeout(update, 1200);
})();
