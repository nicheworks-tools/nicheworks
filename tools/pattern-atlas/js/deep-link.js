// Keep the route on the current JA/EN page and accept only catalog slugs.
export function setupPatternDeepLinks({ root, patterns }) {
  const bySlug = new Map(patterns.map((pattern) => [pattern.slug, pattern]));

  root.addEventListener('click', (event) => {
    const button = event.target.closest('.pa-card-actions button');
    const card = button?.closest('[data-pa-card]');
    if (!card) return;
    const pattern = patterns.find((item) => item.id === card.dataset.paPatternId);
    if (!pattern || !window.history?.replaceState) return;
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set('pattern', pattern.slug);
    window.history.replaceState(null, '', url.pathname + url.search);
  });

  const requestedSlug = new URLSearchParams(window.location.search).get('pattern');
  const selected = bySlug.get(requestedSlug);
  if (!selected) return;
  const card = [...root.querySelectorAll('[data-pa-card]')]
    .find((entry) => entry.dataset.paPatternId === selected.id);
  card?.querySelector('.pa-card-actions button')?.click();
}
