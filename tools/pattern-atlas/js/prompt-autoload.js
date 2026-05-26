import { patterns } from './data/patterns-all.js';
import { setupPromptCopy } from './prompt-ui.js';

const root = document.querySelector('[data-tool="pattern-atlas"]');
if (root && !root.dataset.paPromptReady) {
  root.dataset.paPromptReady = 'true';
  setupPromptCopy({
    root,
    patterns,
    isJapanese: document.documentElement.lang === 'ja'
  });
}
