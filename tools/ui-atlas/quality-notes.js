(function () {
  const root = document.body;
  const app = document.querySelector('[data-ui-atlas-root]');
  if (!root || !app || root.dataset.page !== 'index') return;

  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
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
    {
      test: /modal|dialog|confirmation|確認|ダイアログ/i,
      a11y: lang === 'ja' ? 'フォーカストラップ、Escapeで閉じる挙動、閉じた後のフォーカス復帰、aria-labelledby/aria-describedby を確認してください。' : 'Check focus trap, Escape close behavior, focus return, aria-labelledby, and aria-describedby.',
      mobile: lang === 'ja' ? 'モバイルでは全画面寄りの表示も検討し、本文が長い時に主要ボタンが隠れないか確認してください。' : 'Consider a near-fullscreen treatment on mobile and verify primary actions remain visible with long copy.',
      similar: lang === 'ja' ? 'Inline warning / Toast / Bottom sheet / Full-screen confirmation' : 'Inline warning / Toast / Bottom sheet / Full-screen confirmation'
    },
    {
      test: /toast|snackbar|通知|トースト/i,
      a11y: lang === 'ja' ? '自動で消える通知は読み上げや操作時間に注意し、重要情報をトーストだけに閉じ込めないでください。' : 'Be careful with auto-dismiss timing and screen readers; do not put critical information only in a toast.',
      mobile: lang === 'ja' ? '下部ナビや固定CTAと重ならない位置を確認してください。' : 'Check that it does not overlap bottom navigation or sticky CTAs.',
      similar: lang === 'ja' ? 'Inline message / Banner / Modal / Status row' : 'Inline message / Banner / Modal / Status row'
    },
    {
      test: /drawer|sheet|bottom|mobile|swipe|ドロワー|シート|モバイル|スワイプ/i,
      a11y: lang === 'ja' ? '開閉状態、フォーカス移動、背景操作の無効化、スクリーンリーダーでの領域名を確認してください。' : 'Check open/close state, focus movement, background inert behavior, and screen-reader naming.',
      mobile: lang === 'ja' ? '親指で届く位置、スクロール領域、OSジェスチャーとの干渉を確認してください。' : 'Check thumb reach, scroll area, and conflicts with OS gestures.',
      similar: lang === 'ja' ? 'Drawer / Bottom sheet / Full-screen page / Popover' : 'Drawer / Bottom sheet / Full-screen page / Popover'
    },
    {
      test: /form|input|validation|autosave|wizard|フォーム|入力|検証|保存/i,
      a11y: lang === 'ja' ? 'エラー文と入力欄の関連付け、必須/任意表示、入力補助、送信後フォーカスを確認してください。' : 'Check field-error association, required/optional labels, input help, and focus after submission.',
      mobile: lang === 'ja' ? 'キーボード表示時の押しやすさ、入力型、エラー位置、送信ボタンの見切れを確認してください。' : 'Check keyboard overlap, input type, error placement, and whether submit remains reachable.',
      similar: lang === 'ja' ? 'Inline validation / Summary error / Wizard / Autosave status' : 'Inline validation / Summary error / Wizard / Autosave status'
    },
    {
      test: /search|filter|facet|sort|command|検索|フィルター|絞り込み|並び替え/i,
      a11y: lang === 'ja' ? '検索結果件数、フィルター状態、キーボード移動、解除操作を明確にしてください。' : 'Make result count, active filters, keyboard movement, and clear actions explicit.',
      mobile: lang === 'ja' ? 'フィルターが画面を占有しすぎないよう、シート化・チップ化・要約表示を検討してください。' : 'Avoid filters taking over the screen; consider sheets, chips, and summary bars.',
      similar: lang === 'ja' ? 'Search box / Command palette / Filter chips / Faceted sidebar' : 'Search box / Command palette / Filter chips / Faceted sidebar'
    },
    {
      test: /ai|agent|prompt|generated|confidence|approval|AI|エージェント|プロンプト|生成|承認/i,
      a11y: lang === 'ja' ? 'AI出力の根拠、変更前後、承認前確認、取り消し導線を明確にしてください。' : 'Make rationale, before/after changes, human approval, and undo paths explicit.',
      mobile: lang === 'ja' ? '長い生成文や差分がモバイルで読めるか、承認ボタンが誤タップされないか確認してください。' : 'Verify generated text and diffs remain readable on mobile and approval actions are hard to mis-tap.',
      similar: lang === 'ja' ? 'AI suggestion card / Draft diff / Approval gate / Agent timeline' : 'AI suggestion card / Draft diff / Approval gate / Agent timeline'
    },
    {
      test: /dashboard|kpi|chart|metric|data|table|ダッシュボード|指標|チャート|テーブル/i,
      a11y: lang === 'ja' ? '数値の単位、比較基準、色だけに依存しない差分表現、表の読み順を確認してください。' : 'Check units, comparison baseline, non-color-only differences, and table reading order.',
      mobile: lang === 'ja' ? '横幅が狭い時にカード/表/チャートをどう崩すか確認してください。' : 'Check how cards, tables, and charts collapse at narrow widths.',
      similar: lang === 'ja' ? 'KPI card / Data table / Drilldown panel / Chart annotation' : 'KPI card / Data table / Drilldown panel / Chart annotation'
    },
    {
      test: /account|billing|payment|plan|usage|security|permission|アカウント|請求|支払い|プラン|権限|セキュリティ/i,
      a11y: lang === 'ja' ? '料金、権限、上限、危険操作の説明を曖昧にせず、確認操作とキャンセル導線を明確にしてください。' : 'Make pricing, permissions, limits, and dangerous actions explicit with clear confirmation and cancel paths.',
      mobile: lang === 'ja' ? '価格表や権限表が横スクロール前提になりすぎないか確認してください。' : 'Avoid making pricing or permission tables depend entirely on horizontal scrolling.',
      similar: lang === 'ja' ? 'Pricing table / Usage meter / Permission matrix / Destructive zone' : 'Pricing table / Usage meter / Permission matrix / Destructive zone'
    }
  ];

  function cleanText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function currentContext() {
    const title = cleanText(app.querySelector('[data-detail-title]')?.textContent);
    const what = cleanText(app.querySelector('[data-detail-what]')?.textContent);
    const useCase = cleanText(app.querySelector('[data-detail-use-case]')?.textContent);
    const best = cleanText(app.querySelector('[data-detail-best]')?.textContent);
    const notFor = cleanText(app.querySelector('[data-detail-not-for]')?.textContent);
    const sample = cleanText(app.querySelector('[data-detail-sample]')?.textContent);
    return [title, what, useCase, best, notFor, sample].join(' ');
  }

  function pickNotes(context) {
    return qualityMap.find((entry) => entry.test.test(context)) || null;
  }

  function ensureSection() {
    const content = app.querySelector('[data-detail-content]');
    if (!content || content.hidden) return;
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
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    return ul;
  }

  function update() {
    const context = currentContext();
    if (!context || /select a pattern|項目を選択/i.test(context)) return;
    const section = ensureSection();
    if (!section) return;
    const notes = pickNotes(context);
    const a11y = notes?.a11y || labels.defaultA11y;
    const mobile = notes?.mobile || labels.defaultMobile;
    const similar = notes?.similar || labels.defaultSimilar;

    section.textContent = '';
    const h = document.createElement('h3');
    h.textContent = lang === 'ja' ? '品質メモ' : 'Quality notes';
    section.appendChild(h);

    const a = document.createElement('p');
    a.innerHTML = `<strong>${labels.accessibility}:</strong> `;
    a.appendChild(document.createTextNode(a11y));
    section.appendChild(a);

    const m = document.createElement('p');
    m.innerHTML = `<strong>${labels.mobile}:</strong> `;
    m.appendChild(document.createTextNode(mobile));
    section.appendChild(m);

    const s = document.createElement('p');
    s.innerHTML = `<strong>${labels.similar}:</strong> `;
    s.appendChild(document.createTextNode(similar));
    section.appendChild(s);

    const rTitle = document.createElement('p');
    rTitle.innerHTML = `<strong>${labels.review}:</strong>`;
    section.appendChild(rTitle);
    section.appendChild(renderList(labels.defaultReview));

    const p = document.createElement('p');
    p.innerHTML = `<strong>${labels.pro}:</strong> `;
    p.appendChild(document.createTextNode(labels.defaultPro));
    section.appendChild(p);
  }

  const observer = new MutationObserver(() => window.setTimeout(update, 120));
  observer.observe(app, { childList: true, subtree: true, characterData: true });
  window.addEventListener('click', () => window.setTimeout(update, 150));
  window.setTimeout(update, 500);
  window.setTimeout(update, 1500);
})();
