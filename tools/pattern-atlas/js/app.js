const root = document.querySelector('[data-tool="pattern-atlas"]');

if (root) {
  const langButtons = root.querySelectorAll('[data-pa-lang]');
  const langNodes = root.querySelectorAll('[data-lang-ja], [data-lang-en]');
  const searchInput = root.querySelector('[data-pa-search]');
  const resultCount = root.querySelector('[data-pa-results-count]');
  const cards = Array.from(root.querySelectorAll('[data-pa-card]'));

  const applyLang = (lang) => {
    langNodes.forEach((node) => {
      const value = node.getAttribute(`data-lang-${lang}`);
      if (value) node.textContent = value;
    });
    langButtons.forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.paLang === lang ? 'true' : 'false');
    });
    try {
      localStorage.setItem('pattern-atlas-lang', lang);
    } catch (_) {}
  };

  const getInitialLang = () => {
    try {
      const saved = localStorage.getItem('pattern-atlas-lang');
      if (saved === 'ja' || saved === 'en') return saved;
    } catch (_) {}
    return (navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : 'en';
  };

  const updateResults = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const haystack = (card.dataset.paSearch || '').toLowerCase();
      const show = !query || haystack.includes(query);
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (resultCount) resultCount.textContent = `${visible} mock patterns`;
  };

  langButtons.forEach((button) => {
    button.addEventListener('click', () => applyLang(button.dataset.paLang));
  });

  searchInput?.addEventListener('input', updateResults);

  applyLang(getInitialLang());
  updateResults();
}
