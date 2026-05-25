const root = document.querySelector('[data-tool="pattern-atlas"]');

if (root) {
  const searchInput = root.querySelector('[data-pa-search]');
  const resultCount = root.querySelector('[data-pa-results-count]');
  const cards = Array.from(root.querySelectorAll('[data-pa-card]'));

  const updateResults = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const haystack = (card.dataset.paSearch || '').toLowerCase();
      const show = !query || haystack.includes(query);
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) {
      const unit = resultCount.dataset.paUnit || 'patterns';
      resultCount.textContent = `${visible} ${unit}`;
    }
  };

  searchInput?.addEventListener('input', updateResults);
  updateResults();
}
