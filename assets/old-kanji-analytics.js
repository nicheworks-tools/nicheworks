(() => {
  'use strict';

  if (window.__nicheworksOldKanjiAnalyticsInitialized) return;
  window.__nicheworksOldKanjiAnalyticsInitialized = true;

  const CLUSTER = new Set([
    'old-kanji-reference',
    'kanji-modernizer',
    'old-kanji-ocr-scanner',
    'old-document-kanji-highlighter',
    'unicode-kanji-checker',
    'variant-kanji-compare',
    'place-old-kanji-checker',
    'name-old-kanji-checker'
  ]);

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const sourceTool = pathParts[0] === 'tools' && CLUSTER.has(pathParts[1]) ? pathParts[1] : '';
  if (!sourceTool) return;

  function sendEvent(name, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, params);
  }

  function toolSlugFromLink(anchor) {
    const raw = anchor.getAttribute('href') || anchor.dataset.baseHref || '';
    if (!raw) return '';
    let pathname = '';
    try {
      pathname = new URL(raw, window.location.origin).pathname;
    } catch {
      return '';
    }
    const parts = pathname.split('/').filter(Boolean);
    return parts[0] === 'tools' && CLUSTER.has(parts[1]) ? parts[1] : '';
  }

  function handoffPlacement(anchor) {
    return anchor.closest('.nw-links, .related-links, .reference-links') ? 'related_tools' : 'task_handoff';
  }

  function supportProvider(anchor) {
    const raw = anchor.getAttribute('href') || '';
    if (!raw) return '';
    let hostname = '';
    try {
      hostname = new URL(raw, window.location.origin).hostname.toLowerCase();
    } catch {
      return '';
    }
    if (hostname === 'ofuse.me' || hostname.endsWith('.ofuse.me')) return 'ofuse';
    if (hostname === 'ko-fi.com' || hostname.endsWith('.ko-fi.com')) return 'ko-fi';
    return '';
  }

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const anchor = target.closest('a');
    if (anchor) {
      const destinationTool = toolSlugFromLink(anchor);
      if (destinationTool && destinationTool !== sourceTool) {
        sendEvent('old_kanji_handoff', {
          source_tool: sourceTool,
          target_tool: destinationTool,
          placement: handoffPlacement(anchor)
        });
        return;
      }

      const provider = supportProvider(anchor);
      if (provider) {
        sendEvent('support_click', {
          tool: sourceTool,
          provider,
          placement: 'support'
        });
      }
      return;
    }

    const proCta = target.closest('[data-okj-pro-cta]');
    if (!proCta) return;
    const panel = proCta.closest('[data-okj-pro-state]');
    const disabled = proCta.matches(':disabled') || proCta.getAttribute('aria-disabled') === 'true';
    const unavailable = panel && panel.getAttribute('data-okj-pro-state') === 'billing-unavailable';
    if (disabled || unavailable) return;

    sendEvent('old_kanji_pro_click', {
      tool: sourceTool,
      placement: 'pro_panel'
    });
  }, true);
})();
