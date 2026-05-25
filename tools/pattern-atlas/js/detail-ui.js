export function setupPatternDetail({ root, patterns, isJapanese }) {
  const section = root.querySelector('#detail-title')?.closest('.pa-section');
  const patternMap = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  const text = (pattern, enKey, jaKey) => isJapanese ? pattern[jaKey] : pattern[enKey];

  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };

  const addInfo = (list, label, value) => {
    const item = el('div', 'pa-info-item');
    item.append(el('span', 'pa-info-label', label), document.createTextNode(value));
    list.append(item);
  };

  const render = (pattern) => {
    if (!section || !pattern) return;

    const title = el('h2', 'pa-section-title', isJapanese ? '詳細 / 編集 / 出力' : 'Detail / edit / export');
    title.id = 'detail-title';

    const grid = el('div', 'pa-detail-grid');
    const preview = el('div', 'pa-large-preview');
    const sample = el('div', 'pa-pattern-sample');
    sample.setAttribute('aria-hidden', 'true');
    preview.append(sample);

    const detail = el('div');
    detail.append(el('h3', 'pa-detail-title', text(pattern, 'nameEn', 'nameJa')));

    const tags = el('div', 'pa-tag-row');
    [...pattern.regions, ...pattern.categories, pattern.cautionLevel].forEach((tagText) => tags.append(el('span', 'pa-tag', tagText)));

    const list = el('div', 'pa-info-list');
    addInfo(list, isJapanese ? '意味' : 'Meaning', text(pattern, 'meaningEn', 'meaningJa'));
    addInfo(list, isJapanese ? '文脈' : 'Context', text(pattern, 'contextEn', 'contextJa'));
    addInfo(list, isJapanese ? '使い方' : 'Usage notes', text(pattern, 'usageNotesEn', 'usageNotesJa'));
    addInfo(list, isJapanese ? '出典メモ' : 'Source notes', pattern.sourceNotes.join(' / '));

    detail.append(tags, list);
    grid.append(preview, detail);

    const notice = el('div', 'pa-notice', pattern.exportSafety.requireWarning
      ? (isJapanese ? 'この文様は文化的・宗教的・民族的背景を持つ可能性があります。商用利用や公的利用では追加調査を推奨します。' : 'This pattern may have cultural, religious, or ethnic context. Review additional sources before commercial or public use.')
      : (isJapanese ? 'これは現代的なSVG向け再構成です。公式な歴史復元素材ではありません。' : 'This is a modern SVG-oriented reconstruction, not an official historical reproduction.'));

    const exportRow = el('div', 'pa-export-row');
    const format = el('select', 'pa-select');
    ['SVG', 'PNG', 'CSS'].forEach((item) => format.append(new Option(`${isJapanese ? '形式' : 'Format'}: ${item}`, item.toLowerCase())));
    const size = el('select', 'pa-select');
    ['512', '1024'].forEach((item) => size.append(new Option(`${isJapanese ? 'サイズ' : 'Size'}: ${item}`, item)));
    const button = el('button', 'pa-button pa-button-primary', isJapanese ? 'ダウンロード' : 'Download');
    button.type = 'button';
    button.disabled = true;
    button.title = isJapanese ? '出力機能は後続PRで実装します' : 'Export will be implemented in a later PR';
    exportRow.append(format, size, button);

    section.replaceChildren(title, grid, notice, exportRow);
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    const card = event.target.closest('[data-pa-card]');
    if (!button || !card) return;
    const pattern = patternMap.get(card.dataset.paPatternId);
    render(pattern);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  render(patterns[0]);
}
