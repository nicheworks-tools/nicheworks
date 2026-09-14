import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui = fs.readFileSync('tools/inci-fastscan/js/web_ui.js', 'utf8');
const css = fs.readFileSync('tools/inci-fastscan/enhancements.css', 'utf8');

for (const required of [
  'fastscan-review-queue',
  'data-review-nav="prev"',
  'data-review-nav="next"',
  'reviewQueuePosition',
  'reviewQueueEmpty',
  'reviewCards = () =>',
  'card.dataset.resultState === "review"',
  'card.dataset.resultState === "unknown"',
  'card.scrollIntoView',
  'card.focus',
  'reviewIndex = -1'
]) {
  assert.ok(ui.includes(required), `FastScan review queue missing: ${required}`);
}

assert.ok(
  ui.includes('!card.hidden && (card.dataset.resultState === "review" || card.dataset.resultState === "unknown")'),
  'review queue must navigate only visible review/unmatched cards'
);
assert.ok(ui.includes('button.disabled = disabled'), 'review navigation must disable when no visible review items exist');
assert.ok(ui.includes('reviewIndex = (reviewIndex + direction + queue.length) % queue.length'), 'review navigation must cycle deterministically');
assert.ok(!ui.includes('btn-fast-check.click('), 'review queue must not automatically rerun FastScan analysis');
assert.ok(!ui.includes('btn-jb-check.click('), 'review queue must not automatically rerun Japanese analysis');
assert.ok(css.includes('.result-card.is-current-review'), 'current-review focus styling missing');
assert.ok(css.includes('.fastscan-review-nav:disabled'), 'disabled review-navigation styling missing');

console.log('FastScan review queue regression checks passed');
