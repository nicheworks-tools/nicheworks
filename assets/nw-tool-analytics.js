(() => {
  'use strict';

  const ALLOWED_EVENTS = new Set([
    'tool_start',
    'file_selected',
    'tool_execute',
    'result_shown',
    'copy_result',
    'download_result',
    'compare_use',
    'snapshot_capture',
    'segment_complete',
    'detail_open',
    'search_use',
  ]);

  const onceEvents = new Set();

  function emit(name, once) {
    if (!ALLOWED_EVENTS.has(name)) return false;
    if (once && onceEvents.has(name)) return false;
    if (typeof window.gtag !== 'function') return false;

    if (once) onceEvents.add(name);

    try {
      window.gtag('event', name, {
        event_category: 'tool_usage',
        event_version: '1',
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  window.NWToolAnalytics = Object.freeze({
    track(name) {
      return emit(name, false);
    },
    trackOnce(name) {
      return emit(name, true);
    },
  });
})();
