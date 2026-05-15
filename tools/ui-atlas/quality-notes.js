(function () {
  const root = document.body;
  const app = document.querySelector('[data-ui-atlas-root]');
  if (!root || !app || root.dataset.page !== 'index') return;

  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';

  function injectFinishCss() {
    if (document.getElementById('ui-atlas-finish-fixes')) return;
    const style = document.createElement('style');
    style.id = 'ui-atlas-finish-fixes';
    style.textContent = `
      .compare-dock-mobile[hidden],
      .compare-dock-mobile:not(.has-items) {
        display: none !important;
      }
      @media (max-width: 820px) {
        .compare-dock-mobile.has-items {
          display: flex !important;
        }
        body:not(.ui-atlas-lock-scroll).has-compare-items,
        .has-compare-items {
          padding-bottom: 0;
        }
      }
      .pro-preview-bank {
        content-visibility: auto;
        contain-intrinsic-size: 900px;
      }
      .pro-preview-grid {
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)) !important;
      }
      .pro-preview-card {
        align-content: start;
      }
      .pro-preview-card h4,
      .pro-preview-card p,
      .pro-preview-meta dd,
      .pro-preview-meta dt {
        overflow-wrap: anywhere;
        word-break: normal;
      }
      .pro-preview-summary {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .pro-preview-details {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: rgba(255,255,255,.74);
        padding: 8px 10px;
      }
      .pro-preview-details summary {
        cursor: pointer;
        font-weight: 800;
        color: #1d4ed8;
        font-size: 13px;
      }
      .pro-preview-details[open] summary {
        margin-bottom: 8px;
      }
      @media (max-width: 980px) {
        .pro-preview-grid,
        .result-grid,
        .local-blocks {
          grid-template-columns: 1fr !important;
        }
      }
      @media (max-width: 420px) {
        .nw-header,
        .nw-main,
        .nw-footer {
          width: min(100vw - 16px, var(--max));
        }
        .results-header,
        .results-toolbar,
        .result-grid,
        .local-blocks {
          padding-left: 10px !important;
          padding-right: 10px !important;
        }
        .pro-preview-bank,
        .compare-tray {
          margin-left: 8px !important;
          margin-right: 8px !important;
          padding-left: 10px !important;
          padding-right: 10px !important;
        }
        .pro-preview-card {
          padding: 11px !important;
        }
        .pro-preview-badge {
          white-space: normal !important;
        }
        .btn,
        .pro-preview-actions .btn {
          width: 100%;
          min-width: 0;
          white-space: normal;
          overflow-wrap: anywhere;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setText(el, text) {
    if (el && text) el.textContent = text;
  }

  function patchMarketingCopy() {
    const points = Array.from(document.querySelectorAll('.nw-points .pill'));
    if (lang === 'ja') {
      ['検索 + 実務ワード', '一覧 + 詳細 + 比較', 'ローカルお気に入り + 履歴', '無料100件', 'Pro専用50件', '合計150件', 'Pro判断パックあり'].forEach((text, index) => setText(points[index], text));
      setText(document.querySelector('.nw-intro h2'), 'Interactive UI pattern catalog');
      setText(document.querySelector('.nw-intro p'), '無料版では公開UIパターン100件を検索・詳細確認・2件比較できます。Proではさらに高度な50件と、判断メモ・Codex依頼文・引き継ぎ出力を使えます。');
      const summary = document.querySelectorAll('.catalog-summary > div');
      if (summary[0]) { setText(summary[0].querySelector('strong'), '無料版: 100件'); setText(summary[0].querySelector('span'), '公開UIパターン辞典'); }
      if (summary[1]) { setText(summary[1].querySelector('strong'), 'Pro: +50件'); setText(summary[1].querySelector('span'), 'Pro専用の高度UIサンプル'); }
      if (summary[2]) { setText(summary[2].querySelector('strong'), 'Pro出力'); setText(summary[2].querySelector('span'), '判断メモ、比較メモ、Codex依頼文、Markdown/JSON'); }
      const callout = document.querySelector('.pro-callout');
      if (callout) {
        setText(callout.querySelector('h2'), 'Proは判断と引き継ぎのための層です');
        setText(callout.querySelector('p'), '無料版UI Atlasは、100件のUIパターンを探して比較するための辞典です。UI Atlas Proは、追加50件の高度サンプルと、実装依頼や仕様メモに変換するための出力を解放します。');
        const items = callout.querySelectorAll('li');
        setText(items[0], '無料版: 公開UI例100件、検索、絞り込み、詳細表示、ローカルお気に入り、最近見た項目、2件比較。');
        setText(items[1], 'Pro: Pro専用50件、5件比較、判断メモ、比較メモ、Codex/GitHub Issue依頼文、アクセシビリティ/モバイル確認、Markdown/JSON出力。');
      }
      const extended = document.querySelector('[aria-label="Extended UI example bank"]');
      if (extended) {
        setText(extended.querySelector('h2'), 'Pro専用サンプルバンク: 追加50件');
        setText(extended.querySelector('p'), 'Pro専用Previewは上の別セクションで確認できます。無料検索は公開100件が対象で、Proを解放すると追加50件をGeneratorや引き継ぎ出力で使えます。');
      }
      const faq = document.querySelector('.nw-card .faq-list');
      if (faq) {
        const items = faq.querySelectorAll('li');
        setText(items[0], '現在のカタログ規模は？ 無料版は公開UI例100件です。Proでは高度なUIサンプル50件を追加し、合計150件を扱える設計です。');
        setText(items[1], '無料で使える範囲は？ 検索・絞り込み・詳細・お気に入り・履歴・2件比較は無料です。Proは5件比較、追加50件、判断と引き継ぎ用の出力です。');
      }
    } else {
      ['Search + practical wording', 'Grid + detail + compare', 'Local favorites + history', 'Free 100 examples', 'Pro-only +50', '150 with Pro', 'Pro decision pack'].forEach((text, index) => setText(points[index], text));
      setText(document.querySelector('.nw-intro h2'), 'Interactive UI pattern catalog');
      setText(document.querySelector('.nw-intro p'), 'Use the free catalog to search, inspect, and compare 100 public UI patterns. Pro adds 50 advanced samples plus decision memos, Codex prompts, and handoff exports.');
      const summary = document.querySelectorAll('.catalog-summary > div');
      if (summary[0]) { setText(summary[0].querySelector('strong'), 'Free: 100 examples'); setText(summary[0].querySelector('span'), 'Public UI pattern reference'); }
      if (summary[1]) { setText(summary[1].querySelector('strong'), 'Pro: +50 examples'); setText(summary[1].querySelector('span'), 'Advanced Pro-only UI samples'); }
      if (summary[2]) { setText(summary[2].querySelector('strong'), 'Pro output'); setText(summary[2].querySelector('span'), 'Decision memo, compare memo, Codex prompt, Markdown/JSON'); }
      const callout = document.querySelector('.pro-callout');
      if (callout) {
        setText(callout.querySelector('h2'), 'Pro adds the decision and handoff layer');
        setText(callout.querySelector('p'), 'Free UI Atlas helps you find and compare 100 UI patterns. UI Atlas Pro unlocks 50 advanced samples and turns UI choices into implementation-ready memos, prompts, and exports.');
        const items = callout.querySelectorAll('li');
        setText(items[0], 'Free: 100 public UI examples, search, filters, detail view, local favorites, recent history, and 2-item compare.');
        setText(items[1], 'Pro: 50 Pro-only samples, 5-way compare, decision memo, compare memo, Codex/GitHub Issue prompt, accessibility/mobile review, Markdown/JSON export.');
      }
      const extended = document.querySelector('[aria-label="Extended UI example bank"]');
      if (extended) {
        setText(extended.querySelector('h2'), 'Pro-only sample bank: 50 additional cases');
        setText(extended.querySelector('p'), 'The Pro-only previews are shown above as a separate bank. Free search covers the public 100 examples; Pro unlocks the additional 50 for generator and handoff workflows.');
      }
      const faq = document.querySelector('.nw-card .faq-list');
      if (faq) {
        const items = faq.querySelectorAll('li');
        setText(items[0], 'How large is the current catalog? The free release includes 100 public UI examples. Pro adds 50 advanced samples, for 150 total examples with Pro.');
        setText(items[1], 'Can I use everything for free now? Search, filtering, details, favorites, recent history, and 2-item compare are free. Pro adds 5-way compare, 50 advanced samples, and decision/handoff exports.');
      }
    }
  }

  const labels = lang === 'ja'
    ? {
        accessibility: 'アクセシビリティ注意',
        mobile: 'モバイル確認',
        similar: '近いUIパターン',
        review: '実装レビュー観点',
        pro: 'Pro引き継ぎ文脈',
        defaultA11y: 'キーボード操作、フォーカス順序、スクリーンリーダーでの意味、十分なコントラストを確認してください。',
        defaultMobile: '360px幅で主要操作が押しやすいか、長い文面で崩れないか、下部固定UIと干渉しないか確認してください。',
        defaultSimilar: 'Modal / Drawer / Toast / Inline message / Card list など、同じ目的の近いUIと比較してください。',
        defaultReview: ['状態が空・読み込み中・エラー・成功のすべてで破綻しない', '文面が長くなっても押し間違いが起きない', '主要操作とキャンセル/戻る操作が明確', '実装後にPC/モバイル両方で確認する'],
        defaultPro: 'このUIを採用する理由、避けた代替案、実装時のリスクをProメモに残してください。'
      }
    : {
        accessibility: 'Accessibility note',
        mobile: 'Mobile review',
        similar: 'Similar UI patterns',
        review: 'Implementation review',
        pro: 'Pro handoff context',
        defaultA11y: 'Check keyboard operation, focus order, screen-reader meaning, and sufficient contrast.',
        defaultMobile: 'Check 360px width, long copy, tap target size, and conflicts with sticky bottom UI.',
        defaultSimilar: 'Compare with nearby patterns such as Modal, Drawer, Toast, Inline message, or Card list.',
        defaultReview: ['Works across empty, loading, error, and success states', 'Long copy does not break the layout or action priority', 'Primary action and cancel/back path are clear', 'Review both desktop and mobile after implementation'],
        defaultPro: 'Record why this UI was selected, what alternatives were rejected, and which implementation risks must be tested.'
      };

  const qualityMap = [
    { test: /modal|dialog|confirmation|確認|ダイアログ/i, a11y: lang === 'ja' ? 'フォーカストラップ、Escapeで閉じる挙動、閉じた後のフォーカス復帰、aria-labelledby/aria-describedby を確認してください。' : 'Check focus trap, Escape close behavior, focus return, aria-labelledby, and aria-describedby.', mobile: lang === 'ja' ? 'モバイルでは全画面寄りの表示も検討し、本文が長い時に主要ボタンが隠れないか確認してください。' : 'Consider a near-fullscreen treatment on mobile and verify primary actions remain visible with long copy.', similar: 'Inline warning / Toast / Bottom sheet / Full-screen confirmation' },
    { test: /toast|snackbar|通知|トースト/i, a11y: lang === 'ja' ? '自動で消える通知は読み上げや操作時間に注意し、重要情報をトーストだけに閉じ込めないでください。' : 'Be careful with auto-dismiss timing and screen readers; do not put critical information only in a toast.', mobile: lang === 'ja' ? '下部ナビや固定CTAと重ならない位置を確認してください。' : 'Check that it does not overlap bottom navigation or sticky CTAs.', similar: 'Inline message / Banner / Modal / Status row' },
    { test: /drawer|sheet|bottom|mobile|swipe|ドロワー|シート|モバイル|スワイプ/i, a11y: lang === 'ja' ? '開閉状態、フォーカス移動、背景操作の無効化、スクリーンリーダーでの領域名を確認してください。' : 'Check open/close state, focus movement, background inert behavior, and screen-reader naming.', mobile: lang === 'ja' ? '親指で届く位置、スクロール領域、OSジェスチャーとの干渉を確認してください。' : 'Check thumb reach, scroll area, and conflicts with OS gestures.', similar: 'Drawer / Bottom sheet / Full-screen page / Popover' },
    { test: /form|input|validation|autosave|wizard|フォーム|入力|検証|保存/i, a11y: lang === 'ja' ? 'エラー文と入力欄の関連付け、必須/任意表示、入力補助、送信後フォーカスを確認してください。' : 'Check field-error association, required/optional labels, input help, and focus after submission.', mobile: lang === 'ja' ? 'キーボード表示時の押しやすさ、入力型、エラー位置、送信ボタンの見切れを確認してください。' : 'Check keyboard overlap, input type, error placement, and whether submit remains reachable.', similar: 'Inline validation / Summary error / Wizard / Autosave status' },
    { test: /search|filter|facet|sort|command|検索|フィルター|絞り込み|並び替え/i, a11y: lang === 'ja' ? '検索結果件数、フィルター状態、キーボード移動、解除操作を明確にしてください。' : 'Make result count, active filters, keyboard movement, and clear actions explicit.', mobile: lang === 'ja' ? 'フィルターが画面を占有しすぎないよう、シート化・チップ化・要約表示を検討してください。' : 'Avoid filters taking over the screen; consider sheets, chips, and summary bars.', similar: 'Search box / Command palette / Filter chips / Faceted sidebar' },
    { test: /ai|agent|prompt|generated|confidence|approval|AI|エージェント|プロンプト|生成|承認/i, a11y: lang === 'ja' ? 'AI出力の根拠、変更前後、承認前確認、取り消し導線を明確にしてください。' : 'Make rationale, before/after changes, human approval, and undo paths explicit.', mobile: lang === 'ja' ? '長い生成文や差分がモバイルで読めるか、承認ボタンが誤タップされないか確認してください。' : 'Verify generated text and diffs remain readable on mobile and approval actions are hard to mis-tap.', similar: 'AI suggestion card / Draft diff / Approval gate / Agent timeline' },
    { test: /dashboard|kpi|chart|metric|data|table|ダッシュボード|指標|チャート|テーブル/i, a11y: lang === 'ja' ? '数値の単位、比較基準、色だけに依存しない差分表現、表の読み順を確認してください。' : 'Check units, comparison baseline, non-color-only differences, and table reading order.', mobile: lang === 'ja' ? '横幅が狭い時にカード/表/チャートをどう崩すか確認してください。' : 'Check how cards, tables, and charts collapse at narrow widths.', similar: 'KPI card / Data table / Drilldown panel / Chart annotation' },
    { test: /account|billing|payment|plan|usage|security|permission|アカウント|請求|支払い|プラン|権限|セキュリティ/i, a11y: lang === 'ja' ? '料金、権限、上限、危険操作の説明を曖昧にせず、確認操作とキャンセル導線を明確にしてください。' : 'Make pricing, permissions, limits, and dangerous actions explicit with clear confirmation and cancel paths.', mobile: lang === 'ja' ? '価格表や権限表が横スクロール前提になりすぎないか確認してください。' : 'Avoid making pricing or permission tables depend entirely on horizontal scrolling.', similar: 'Pricing table / Usage meter / Permission matrix / Destructive zone' }
  ];

  function cleanText(value) { return (value || '').replace(/\s+/g, ' ').trim(); }
  function currentContext() {
    return ['[data-detail-title]', '[data-detail-what]', '[data-detail-use-case]', '[data-detail-best]', '[data-detail-not-for]', '[data-detail-sample]']
      .map((selector) => cleanText(app.querySelector(selector)?.textContent)).join(' ');
  }
  function pickNotes(context) { return qualityMap.find((entry) => entry.test.test(context)) || null; }
  function ensureSection() {
    const content = app.querySelector('[data-detail-content]');
    if (!content || content.hidden) return null;
    let section = content.querySelector('[data-quality-notes]');
    if (!section) {
      section = document.createElement('section');
      section.setAttribute('data-quality-notes', 'true');
      section.className = 'quality-notes local-box';
      content.appendChild(section);
    }
    return section;
  }
  function renderList(items) {
    const ul = document.createElement('ul');
    ul.className = 'faq-list';
    items.forEach((item) => { const li = document.createElement('li'); li.textContent = item; ul.appendChild(li); });
    return ul;
  }
  function update() {
    const context = currentContext();
    if (!context || /select a pattern|項目を選択/i.test(context)) return;
    const section = ensureSection();
    if (!section) return;
    const notes = pickNotes(context);
    section.textContent = '';
    const h = document.createElement('h3'); h.textContent = lang === 'ja' ? '品質メモ' : 'Quality notes'; section.appendChild(h);
    [[labels.accessibility, notes?.a11y || labels.defaultA11y], [labels.mobile, notes?.mobile || labels.defaultMobile], [labels.similar, notes?.similar || labels.defaultSimilar]].forEach(([title, text]) => {
      const p = document.createElement('p'); p.innerHTML = `<strong>${title}:</strong> `; p.appendChild(document.createTextNode(text)); section.appendChild(p);
    });
    const rTitle = document.createElement('p'); rTitle.innerHTML = `<strong>${labels.review}:</strong>`; section.appendChild(rTitle); section.appendChild(renderList(labels.defaultReview));
    const p = document.createElement('p'); p.innerHTML = `<strong>${labels.pro}:</strong> `; p.appendChild(document.createTextNode(labels.defaultPro)); section.appendChild(p);
  }

  injectFinishCss();
  patchMarketingCopy();
  const observer = new MutationObserver(() => window.setTimeout(update, 120));
  observer.observe(app, { childList: true, subtree: true, characterData: true });
  window.addEventListener('click', () => window.setTimeout(update, 150));
  window.setTimeout(patchMarketingCopy, 300);
  window.setTimeout(patchMarketingCopy, 1200);
  window.setTimeout(update, 500);
  window.setTimeout(update, 1500);
})();