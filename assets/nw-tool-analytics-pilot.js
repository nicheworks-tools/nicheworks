(() => {
  'use strict';

  const api = () => window.NWToolAnalytics;
  const track = (name) => api()?.track(name);
  const trackOnce = (name) => api()?.trackOnce(name);

  function bindTinyAudioMeter() {
    const badge = document.getElementById('micStateBadge');
    const volume = document.getElementById('volumeValue');
    const snapshot = document.getElementById('snapshotButton');
    const segmentStart = document.getElementById('segmentStart');

    if (badge) {
      const observer = new MutationObserver(() => {
        if (badge.classList.contains('on')) {
          trackOnce('tool_start');
          observer.disconnect();
        }
      });
      observer.observe(badge, { attributes: true, attributeFilter: ['class'] });
    }

    if (volume) {
      const observer = new MutationObserver(() => {
        const text = (volume.textContent || '').trim();
        if (text && !text.startsWith('--')) {
          trackOnce('result_shown');
          observer.disconnect();
        }
      });
      observer.observe(volume, { childList: true, characterData: true, subtree: true });
    }

    snapshot?.addEventListener('click', () => {
      if (!snapshot.disabled) track('snapshot_capture');
    });

    segmentStart?.addEventListener('click', () => {
      if (!segmentStart.disabled) track('tool_execute');
    });
  }

  function bindColorReplace() {
    const file = document.getElementById('imageFile');
    const apply = document.getElementById('applyBtn');
    const download = document.getElementById('downloadBtn');

    file?.addEventListener('change', () => {
      if (file.files?.length) {
        trackOnce('tool_start');
        track('file_selected');
      }
    });

    apply?.addEventListener('click', () => {
      if (!apply.disabled) track('tool_execute');
    });

    if (download) {
      const observer = new MutationObserver(() => {
        if (!download.disabled) {
          trackOnce('result_shown');
          observer.disconnect();
        }
      });
      observer.observe(download, { attributes: true, attributeFilter: ['disabled'] });

      download.addEventListener('click', () => {
        if (!download.disabled) track('download_result');
      });
    }
  }

  function bindMotionAtlas() {
    const search = document.getElementById('motion-search');
    const list = document.getElementById('motion-list');

    search?.addEventListener('input', () => {
      if ((search.value || '').trim()) {
        trackOnce('tool_start');
        trackOnce('search_use');
      }
    });

    list?.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      const card = event.target.closest('.motion-card');
      if (!card) return;

      trackOnce('tool_start');

      if (!button) {
        track('detail_open');
        return;
      }

      const label = (button.textContent || '').trim().toLowerCase();
      if (label.includes('compare') || label.includes('比較')) {
        track('compare_use');
      } else if (label.includes('copy') || label.includes('コピー')) {
        track('copy_result');
      } else if (label.includes('view') || label.includes('詳細')) {
        track('detail_open');
      }
    });
  }

  function init() {
    const path = window.location.pathname;
    if (path.includes('/tools/tiny-audio-meter/')) bindTinyAudioMeter();
    else if (path.includes('/tools/color-replace/')) bindColorReplace();
    else if (path.includes('/tools/motion-atlas/')) bindMotionAtlas();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
