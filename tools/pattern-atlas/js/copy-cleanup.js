const root = document.querySelector('[data-tool="pattern-atlas"]');
const isJapanese = document.documentElement.lang === 'ja';

if (root) {
  const intro = root.querySelector('#intro-title')?.closest('.pa-section')?.querySelector('.pa-muted');
  if (intro) {
    intro.textContent = isJapanese
      ? 'Pattern Atlas は、世界の文様を辞典として読み、色や透過を編集し、タイルを確認し、SVG・PNG・CSS素材として出力できるブラウザ内ツールです。'
      : 'Pattern Atlas is a browser-based visual dictionary for browsing world patterns, editing colors and transparency, previewing tiles, and exporting SVG, PNG, and CSS assets.';
  }

  const detailTitle = root.querySelector('#detail-title');
  if (detailTitle) detailTitle.textContent = isJapanese ? '詳細 / 編集 / 出力' : 'Detail / edit / export';

  const faq = root.querySelector('#faq-title')?.closest('.pa-section');
  if (faq) {
    faq.replaceChildren(
      Object.assign(document.createElement('h2'), { className: 'pa-section-title', id: 'faq-title', textContent: 'FAQ' }),
      faqItem(isJapanese ? 'このツールで何ができますか？' : 'What can I do with Pattern Atlas?', isJapanese
        ? '文様を探し、文脈を確認し、色や透過を編集し、タイルプレビューを見て、SVG・PNG・CSSとして保存できます。'
        : 'You can browse pattern entries, inspect context notes, edit colors and transparency, preview repeating tiles, copy an AI prompt, and export SVG, PNG, or CSS assets.'),
      faqItem(isJapanese ? 'ファイルはサーバーに送信されますか？' : 'Are files sent to a server?', isJapanese
        ? '文様の編集・プレビュー・出力はブラウザ内で処理されます。ただし、サイト全体の広告や解析タグは別途読み込まれる場合があります。'
        : 'Pattern editing, previewing, and export are handled in the browser. Analytics and ads may load separately as described by the site.'),
      faqItem(isJapanese ? '公式な歴史復元素材ですか？' : 'Are these official historical reproductions?', isJapanese
        ? 'いいえ。各文様は参考・デザイン探索用の現代的なSVG再構成です。商用利用や公的利用では文化的文脈を追加確認してください。'
        : 'No. Entries are modern SVG-oriented reconstructions for reference and design exploration. Review cultural context before commercial or public use.')
    );
  }
}

function faqItem(question, answer) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = question;
  p.append(strong, document.createElement('br'), document.createTextNode(answer));
  return p;
}
