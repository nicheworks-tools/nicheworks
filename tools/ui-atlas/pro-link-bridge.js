(function () {
  const root = document.body;
  const app = document.querySelector('[data-ui-atlas-root]');
  if (!root || !app || root.dataset.page !== 'index') return;

  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const labels = lang === 'ja'
    ? {
        detail: 'このUIでProメモを作る',
        compare: '比較内容でProメモを作る',
        copied: 'Proメモ作成ページへ送る内容を更新しました。'
      }
    : {
        detail: 'Generate Pro memo for this UI',
        compare: 'Generate Pro memo from compare',
        copied: 'Updated Pro memo handoff values.'
      };

  function clean(value) {
    return (value || '')
      .replace(/\s+/g, ' ')
      .replace(/^[-–—:：\s]+/, '')
      .trim();
  }

  function proBase() {
    return lang === 'ja' ? 'pro/' : 'pro/';
  }

  function makeUrl(values) {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      const cleaned = clean(value);
      if (cleaned) params.set(key, cleaned);
    });
    const query = params.toString();
    return proBase() + (query ? `?${query}` : '');
  }

  function getDetailValues() {
    const title = clean(app.querySelector('[data-detail-title]')?.textContent || '');
    const goal = clean(app.querySelector('[data-detail-best]')?.textContent || app.querySelector('[data-detail-use-case]')?.textContent || '');
    const risk = clean(app.querySelector('[data-detail-not-for]')?.textContent || '');
    return { pattern: title, goal, risk };
  }

  function getCompareValues() {
    const items = Array.from(app.querySelectorAll('[data-compare-list] .compare-item, [data-compare-list] article'));
    const names = items.map((item) => clean(item.querySelector('h4, h3')?.textContent || item.textContent || '')).filter(Boolean).slice(0, 2);
    const compare = names.join(',');
    return {
      compare,
      goal: lang === 'ja' ? '候補UIの使い分けを判断する' : 'choose the better UI pattern for the current product context',
      risk: lang === 'ja' ? '見た目だけでUIを選んでしまう' : 'choosing a UI pattern based only on appearance'
    };
  }

  function ensureDetailButton() {
    const content = app.querySelector('[data-detail-content]');
    if (!content) return;
    let wrap = content.querySelector('[data-pro-handoff-detail]');
    if (!wrap) {
      wrap = document.createElement('p');
      wrap.setAttribute('data-pro-handoff-detail', 'true');
      const link = document.createElement('a');
      link.className = 'primary-pro-cta';
      link.setAttribute('data-pro-handoff-detail-link', 'true');
      link.textContent = labels.detail;
      wrap.appendChild(link);
      const promptButton = content.querySelector('[data-copy-prompt]');
      if (promptButton && promptButton.parentNode) {
        promptButton.insertAdjacentElement('afterend', wrap);
      } else {
        content.appendChild(wrap);
      }
    }
    const link = wrap.querySelector('[data-pro-handoff-detail-link]');
    if (link) link.href = makeUrl(getDetailValues());
  }

  function ensureCompareButton() {
    const tray = app.querySelector('.compare-tray');
    if (!tray) return;
    let wrap = tray.querySelector('[data-pro-handoff-compare]');
    if (!wrap) {
      wrap = document.createElement('p');
      wrap.setAttribute('data-pro-handoff-compare', 'true');
      const link = document.createElement('a');
      link.className = 'primary-pro-cta';
      link.setAttribute('data-pro-handoff-compare-link', 'true');
      link.textContent = labels.compare;
      wrap.appendChild(link);
      tray.appendChild(wrap);
    }
    const link = wrap.querySelector('[data-pro-handoff-compare-link]');
    const values = getCompareValues();
    if (link) link.href = makeUrl(values);
    wrap.hidden = !values.compare;
  }

  function update() {
    ensureDetailButton();
    ensureCompareButton();
  }

  const observer = new MutationObserver(() => window.setTimeout(update, 80));
  observer.observe(app, { childList: true, subtree: true, characterData: true });
  window.addEventListener('click', () => window.setTimeout(update, 100));
  window.addEventListener('input', () => window.setTimeout(update, 100));
  window.setTimeout(update, 300);
  window.setTimeout(update, 1200);
})();
