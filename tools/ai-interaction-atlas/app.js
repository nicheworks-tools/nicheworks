(() => {
  'use strict';

  const J = document.documentElement.lang === 'ja';
  const BUY_URL = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const TEXT = J ? {
    load: '読み込み中...',
    fail: 'データを読み込めませんでした。',
    none: '一致するパターンがありません。',
    shown: '件表示',
    copied: 'コピーしました',
    copyFail: 'コピーに失敗しました。手動でコピーしてください。',
    favLimit: 'お気に入りは無料版では5件までです。',
    cmpFull: '無料比較は2件までです。Proで3〜4件比較できます。',
    cmpFullPro: 'Pro比較は最大4件までです。',
    empty: 'カードから最大2件まで追加してください。Pro有効時は3〜4件比較できます。',
    proLocked: 'Previewモードです。Pro出力のコピー・保存・3〜4件比較には共通Proの有効化が必要です。',
    selectPattern: 'パターンを選択するとPro出力を生成します。',
    exportReady: 'エクスポートを作成しました。',
    downloadMd: 'Markdownを保存',
    downloadJson: 'JSONを保存'
  } : {
    load: 'Loading data...',
    fail: 'Data load failed.',
    none: 'No matching patterns.',
    shown: 'patterns shown',
    copied: 'Copied',
    copyFail: 'Copy failed. Please select and copy manually.',
    favLimit: 'Free users can save up to 5 favorites.',
    cmpFull: 'Free compare supports 2 patterns. Pro unlocks 3–4.',
    cmpFullPro: 'Pro compare supports up to 4 patterns.',
    empty: 'Add up to 2 patterns from the cards. Pro unlocks 3–4 pattern comparison.',
    proLocked: 'Preview mode. Common Pro is required for Pro copy, export, save, and 3–4 pattern comparison.',
    selectPattern: 'Select a pattern to generate Pro outputs.',
    exportReady: 'Export prepared.',
    downloadMd: 'Save Markdown',
    downloadJson: 'Save JSON'
  };
  const STORE = { f: 'nw_aiia_favorites', r: 'nw_aiia_recent', c: 'nw_aiia_compare' };
  const CATEGORY_JA = {
    'Prompt input': 'プロンプト入力',
    'AI response': 'AI回答',
    Suggestions: '候補・提案',
    'Agent workflow': 'エージェント進行',
    'Copilot UI': 'Copilot UI',
    'Review / control': '確認・制御',
    'Trust / transparency': '信頼・透明性',
    'Failure / fallback': '失敗・代替導線',
    'Personalization / memory': '個人化・メモリ',
    'AI-native navigation': 'AIネイティブナビ'
  };
  const PURPOSE_JA = {
    Input: '入力',
    Answer: '回答',
    Trust: '信頼',
    Review: 'レビュー',
    Automation: '自動化',
    Navigation: 'ナビゲーション',
    Recovery: '復旧',
    Personalization: '個人化'
  };

  let patterns = [];
  const state = {
    q: '', cat: '', pur: '', risk: '', ctl: '', vis: '', sel: '', diff: false,
    fav: read(STORE.f, []), rec: read(STORE.r, []), cmp: read(STORE.c, []), proActive: false
  };

  const $ = (id) => document.getElementById(id);
  const L = (en, ja) => J ? ja : en;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function button(text, handler, className = 'btn') {
    const node = el('button', className, text);
    node.type = 'button';
    node.addEventListener('click', handler);
    return node;
  }

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (error) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) {}
  }

  function slug(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function enhance(raw) {
    return {
      ...raw,
      slug: raw.slug || slug(raw.name_en),
      search: [raw.name_en, raw.name_ja, raw.category, raw.purpose, raw.risk, raw.control, raw.visibility,
        'AI UI agent copilot citation sources review before apply human approval prompt suggestions autocomplete semantic search failure fallback'].join(' ').toLowerCase()
    };
  }

  function nameOf(pattern) { return J ? pattern.name_ja : pattern.name_en; }
  function categoryOf(pattern) { return J ? (CATEGORY_JA[pattern.category] || pattern.category) : pattern.category; }
  function purposeOf(pattern) { return J ? (PURPOSE_JA[pattern.purpose] || pattern.purpose) : pattern.purpose; }
  function summaryOf(pattern) {
    return L(
      `${pattern.name_en} helps users handle ${pattern.purpose.toLowerCase()} moments in AI products while keeping control, trust, and fallback behavior visible.`,
      `${pattern.name_ja}は、AI機能の${purposeOf(pattern)}場面で、操作・信頼性・失敗時の逃げ道を見えるようにするUIパターン。`
    );
  }
  function bestFor(pattern) {
    return J ? [`AI機能の${purposeOf(pattern)}`, 'Copilot / エージェントUI', 'AIを使うWebサービス'] : [`${pattern.purpose} in AI products`, 'Copilot or agent interfaces', 'Builder-facing AI tools'];
  }
  function notFor() {
    return J ? ['AIの挙動を見せる必要がない場面', '完全に裏側だけで処理する導線', '人間確認なしの高リスク変更'] : ['Cases where no AI behavior is visible', 'Silent automation-only flows', 'High-risk changes without human review'];
  }
  function failures() {
    return J ? ['AI出力が不完全', 'ユーザーが結果を確認できない', '復旧導線が分かりにくい', '根拠や制限が見えない'] : ['AI output is incomplete', 'Users cannot verify the result', 'Recovery path is unclear', 'Limitations or sources are hidden'];
  }
  function notes() {
    return J ? ['色だけでリスクを表現しない。', '再試行・取り消し・手動移行のどれかを用意する。', 'AI出力が必ず正しいように見せない。', 'キーボード操作とフォーカス表示を確認する。'] : ['Do not express risk with color alone.', 'Provide retry, undo, or manual fallback.', 'Do not imply AI output is guaranteed correct.', 'Check keyboard access and visible focus.'];
  }
  function promptFor(pattern) {
    return L(
      `Design a ${pattern.name_en} pattern for an AI product. Show purpose, user control, trust cues, failure states, and a clear fallback path. Keep it accessible, lightweight, and easy to scan.`,
      `AIプロダクト向けに「${pattern.name_ja}」を設計してください。目的、ユーザー操作、信頼性表示、失敗状態、フォールバック導線を含め、軽量でアクセシブルにしてください。`
    );
  }
  function commonMistakes() {
    return J ? ['AI用語説明だけでUI挙動がない', '確認前に変更を適用してしまう', '失敗時の手動導線がない'] : ['Only explaining AI terms without UI behavior', 'Applying changes before review', 'No manual path after failure'];
  }
  function requiredStates() {
    return ['empty', 'loading', 'partial', 'error', 'refusal', 'fallback'];
  }

  function tags(items) {
    const wrap = el('div', 'chips');
    items.forEach((item) => wrap.append(el('span', 'tag', item)));
    return wrap;
  }

  function section(parent, title, items) {
    const sec = el('section', 'detail-section');
    sec.append(el('h3', '', title));
    const list = el('ul');
    items.forEach((item) => list.append(el('li', '', item)));
    sec.append(list);
    parent.append(sec);
  }

  function toast(message) {
    const node = $('toast');
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    clearTimeout(window.aiiaToast);
    window.aiiaToast = setTimeout(() => { node.hidden = true; }, 2200);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast(TEXT.copied);
    } catch (error) {
      toast(TEXT.copyFail);
    }
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = el('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast(TEXT.exportReady);
  }

  function bind() {
    $('atlas-search').addEventListener('input', (event) => { state.q = event.target.value.trim().toLowerCase(); render(); });
    $('open-filters').addEventListener('click', () => $('filter-panel').classList.add('is-open'));
    $('close-filters').addEventListener('click', () => $('filter-panel').classList.remove('is-open'));
    $('clear-filters').addEventListener('click', () => { state.q = state.cat = state.pur = state.risk = state.ctl = state.vis = ''; $('atlas-search').value = ''; renderFilters(); render(); });
    $('diff-only').addEventListener('change', (event) => { state.diff = event.target.checked; renderCompare(); });
    $('clear-compare').addEventListener('click', () => { state.cmp = []; write(STORE.c, state.cmp); renderCompare(); renderProPack(); });
    $('copy-compare').addEventListener('click', () => copy(compareMarkdown()));
    $('mobile-detail-close').addEventListener('click', () => $('detail-panel').classList.remove('is-open'));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        $('detail-panel').classList.remove('is-open');
        $('filter-panel').classList.remove('is-open');
      }
    });
    window.addEventListener('nw-pro-status-change', (event) => {
      state.proActive = Boolean(event.detail && event.detail.active);
      if (!state.proActive && state.cmp.length > 2) {
        state.cmp = state.cmp.slice(0, 2);
        write(STORE.c, state.cmp);
        toast(TEXT.cmpFull);
      }
      renderCompare();
      renderProPack();
    });
  }

  function filterGroup(label, key, values) {
    const wrap = el('fieldset', 'filter-group');
    wrap.append(el('legend', 'filter-title', label));
    values.forEach((value) => {
      const labelNode = el('label', 'check');
      const input = el('input');
      input.type = 'radio';
      input.name = key;
      input.checked = state[key] === value;
      input.addEventListener('click', () => {
        state[key] = state[key] === value ? '' : value;
        renderFilters();
        render();
      });
      const text = key === 'cat' ? categoryOf({ category: value }) : (key === 'pur' ? (J ? (PURPOSE_JA[value] || value) : value) : value);
      labelNode.append(input, el('span', '', text));
      wrap.append(labelNode);
    });
    return wrap;
  }

  function renderFilters() {
    const container = $('filters');
    container.textContent = '';
    container.append(
      filterGroup(L('Category', 'カテゴリ'), 'cat', [...new Set(patterns.map((pattern) => pattern.category))]),
      filterGroup(L('Purpose', '目的'), 'pur', [...new Set(patterns.map((pattern) => pattern.purpose))]),
      filterGroup(L('AI risk', 'AIリスク'), 'risk', ['Low', 'Medium', 'High', 'Critical']),
      filterGroup(L('User control', 'ユーザー制御'), 'ctl', [...new Set(patterns.map((pattern) => pattern.control))]),
      filterGroup(L('AI visibility', 'AI表示'), 'vis', [...new Set(patterns.map((pattern) => pattern.visibility))])
    );
  }

  function renderShortcuts() {
    const container = $('shortcut-list');
    const shortcuts = [
      [L('I need users to trust AI results', 'AI結果を信頼してもらいたい'), 'Trust'],
      [L('I need human review before AI changes', 'AIの変更前に人間確認を入れたい'), 'Review'],
      [L('I need a better prompt input', 'プロンプト入力欄を改善したい'), 'Input'],
      [L('I need an agent progress UI', 'エージェントの進行状況を見せたい'), 'Automation'],
      [L('I need to show sources', '出典を表示したい'), 'Trust'],
      [L('I need to recover from AI failure', 'AI失敗時の逃げ道を作りたい'), 'Recovery']
    ];
    shortcuts.forEach(([label, purpose]) => container.append(button(label, () => { state.pur = purpose; renderFilters(); render(); }, 'chip')));
  }

  function filtered() {
    return patterns.filter((pattern) =>
      (!state.q || pattern.search.includes(state.q)) &&
      (!state.cat || pattern.category === state.cat) &&
      (!state.pur || pattern.purpose === state.pur) &&
      (!state.risk || pattern.risk === state.risk) &&
      (!state.ctl || pattern.control === state.ctl) &&
      (!state.vis || pattern.visibility === state.vis)
    );
  }

  function card(pattern) {
    const node = el('article', 'pattern-card');
    node.tabIndex = 0;
    node.append(el('div', 'card-top', nameOf(pattern)), tags([categoryOf(pattern), pattern.risk, pattern.control, pattern.visibility]), el('p', 'summary', summaryOf(pattern)));
    const preview = el('div', 'mini-preview');
    preview.append(el('span', 'dot'), el('span', '', nameOf(pattern)), el('small', '', ` ${purposeOf(pattern)}`));
    node.append(preview);
    const actions = el('div', 'actions');
    actions.append(
      button(L('Open detail', '詳細'), () => selectPattern(pattern.slug, true)),
      button(L('Compare', '比較'), () => addCompare(pattern.slug), 'btn secondary'),
      button(state.fav.includes(pattern.slug) ? '★' : '☆', () => toggleFavorite(pattern.slug), 'btn icon'),
      button(L('Copy prompt', '依頼文コピー'), () => copy(promptFor(pattern)), 'btn secondary')
    );
    node.append(actions);
    node.addEventListener('keydown', (event) => { if (event.key === 'Enter') selectPattern(pattern.slug, true); });
    return node;
  }

  function render() {
    const visible = filtered();
    const list = $('pattern-list');
    list.textContent = '';
    $('result-count').textContent = `${visible.length} ${TEXT.shown}`;
    if (!visible.length) list.append(el('p', 'empty', TEXT.none));
    visible.forEach((pattern) => list.append(card(pattern)));
    renderCompare();
    renderRecent();
  }

  function selectPattern(slugValue, open) {
    state.sel = slugValue;
    const pattern = patterns.find((item) => item.slug === slugValue);
    if (!pattern) return;
    state.rec = [slugValue, ...state.rec.filter((item) => item !== slugValue)].slice(0, 10);
    write(STORE.r, state.rec);

    const detail = $('detail-content');
    detail.textContent = '';
    detail.append(el('h2', '', nameOf(pattern)), el('p', 'lead', summaryOf(pattern)), tags([categoryOf(pattern), pattern.risk, pattern.control, pattern.visibility]));
    section(detail, L('Mini preview', 'ミニプレビュー'), [`${nameOf(pattern)} → ${purposeOf(pattern)} → ${L('fallback path', 'フォールバック導線')}`]);
    section(detail, L('Best for', '向いている場面'), bestFor(pattern));
    section(detail, L('Not for', '向かない場面'), notFor(pattern));
    section(detail, L('How it behaves', '挙動'), notes().slice(0, 2));
    section(detail, L('Failure states', '失敗状態'), failures(pattern));
    section(detail, L('Trust / transparency notes', '信頼性・透明性メモ'), notes().slice(1, 3));
    section(detail, L('AI-ready prompt', 'AI依頼文'), [promptFor(pattern)]);
    section(detail, L('Implementation notes', '実装メモ'), notes());
    section(detail, L('Common mistakes', 'よくある失敗'), commonMistakes());

    const actions = el('div', 'detail-actions');
    actions.append(
      button(L('Add to compare', '比較に追加'), () => addCompare(pattern.slug)),
      button(L('Copy basic prompt', '基本依頼文コピー'), () => copy(promptFor(pattern))),
      button(state.fav.includes(pattern.slug) ? L('Unfavorite', '解除') : L('Favorite', 'お気に入り'), () => toggleFavorite(pattern.slug))
    );
    detail.append(actions);
    if (open) $('detail-panel').classList.add('is-open');
    renderRecent();
    renderProPack();
  }

  function toggleFavorite(slugValue) {
    if (state.fav.includes(slugValue)) {
      state.fav = state.fav.filter((item) => item !== slugValue);
    } else {
      if (state.fav.length >= 5) return toast(TEXT.favLimit);
      state.fav.push(slugValue);
    }
    write(STORE.f, state.fav);
    render();
    selectPattern(state.sel, false);
  }

  function addCompare(slugValue) {
    if (state.cmp.includes(slugValue)) return;
    const limit = state.proActive ? 4 : 2;
    if (state.cmp.length >= limit) return toast(state.proActive ? TEXT.cmpFullPro : TEXT.cmpFull);
    state.cmp.push(slugValue);
    write(STORE.c, state.cmp);
    renderCompare();
    renderProPack();
  }

  function comparePatterns() {
    return state.cmp.map((slugValue) => patterns.find((pattern) => pattern.slug === slugValue)).filter(Boolean);
  }

  function compareRows(items) {
    const base = [
      [L('Pattern', 'パターン'), ...items.map(nameOf)],
      [L('Primary purpose', '主目的'), ...items.map(purposeOf)],
      [L('Best for', '向き'), ...items.map((pattern) => bestFor(pattern)[0])],
      [L('Not for', '不向き'), ...items.map(() => notFor()[0])],
      [L('AI risk', 'AIリスク'), ...items.map((pattern) => pattern.risk)],
      [L('User control', 'ユーザー制御'), ...items.map((pattern) => pattern.control)],
      [L('AI visibility', 'AI表示'), ...items.map((pattern) => pattern.visibility)],
      [L('Trust load', '信頼負荷'), ...items.map((pattern) => pattern.risk === 'Low' ? L('Light', '軽い') : L('Needs explicit cues', '明示が必要'))],
      [L('Human review need', '人間確認'), ...items.map((pattern) => ['High', 'Critical'].includes(pattern.risk) ? L('Required before apply', '適用前に必要') : L('Recommended', '推奨'))],
      [L('Failure risk', '失敗リスク'), ...items.map(() => failures()[0])],
      [L('Implementation difficulty', '実装難度'), ...items.map((pattern) => pattern.control === 'Autonomous' ? L('High', '高') : L('Medium', '中'))],
      [L('Accessibility caution', 'アクセシビリティ注意'), ...items.map(() => notes()[3])],
      [L('Similar misuse', '似た誤用'), ...items.map(() => commonMistakes()[0])],
      [L('Prompting clarity', '依頼文の明確さ'), ...items.map((pattern) => `${nameOf(pattern)} + ${purposeOf(pattern)} + fallback`)]
    ];
    return state.proActive ? base : base.slice(0, 7);
  }

  function renderCompare() {
    const container = $('compare-content');
    const items = comparePatterns();
    container.textContent = '';
    if (!items.length) {
      container.append(el('p', 'empty', TEXT.empty));
      return;
    }
    const table = el('table', 'compare-table');
    compareRows(items).forEach((row, rowIndex) => {
      if (state.diff && rowIndex && new Set(row.slice(1)).size === 1) return;
      const tr = el('tr');
      row.forEach((cell, cellIndex) => tr.append(el(cellIndex ? 'td' : 'th', '', cell)));
      table.append(tr);
    });
    container.append(table);
    const actions = el('div', 'actions compare-actions');
    items.forEach((pattern) => actions.append(button(`${L('Remove', '削除')}: ${nameOf(pattern)}`, () => {
      state.cmp = state.cmp.filter((item) => item !== pattern.slug);
      write(STORE.c, state.cmp);
      renderCompare();
      renderProPack();
    }, 'btn secondary')));
    container.append(actions);
  }

  function renderRecent() {
    const container = $('recent-list');
    if (!container) return;
    container.textContent = '';
    state.rec.map((slugValue) => patterns.find((pattern) => pattern.slug === slugValue)).filter(Boolean).forEach((pattern) => {
      container.append(button(nameOf(pattern), () => selectPattern(pattern.slug, true), 'linkbtn'));
    });
  }

  function proData(pattern) {
    if (!pattern) return null;
    const label = `${pattern.name_ja} / ${pattern.name_en}`;
    return {
      patternName: pattern.name_en,
      japaneseLabel: pattern.name_ja,
      category: pattern.category,
      purpose: pattern.purpose,
      aiRisk: pattern.risk,
      userControlLevel: pattern.control,
      aiVisibility: pattern.visibility,
      trustTransparencyNotes: notes(),
      bestFor: bestFor(pattern),
      notFor: notFor(pattern),
      requiredUiStates: requiredStates(),
      userControlRequirements: [pattern.control, L('Allow edit, retry, undo, and manual fallback where relevant.', '必要に応じて編集、再試行、取り消し、手動移行を可能にする。')],
      failureFallbackBehavior: failures(),
      acceptanceCriteria: [
        `${label} is visible as an AI interaction, not a hidden automation.`,
        'Free behavior remains usable without Pro.',
        'No AI API call and no external data send are added.',
        'Keyboard focus, readable labels, and non-color-only risk cues are provided.'
      ],
      codexTask: codexTask(pattern),
      githubIssue: githubIssue(pattern),
      uxRiskChecklist: uxRiskChecklist(),
      safetyFallbackChecklist: safetyChecklist(pattern),
      stateDesignMemo: stateMemo(pattern)
    };
  }

  function codexTask(pattern) {
    return [
      `${L('Implementation target', '実装対象')}: ${nameOf(pattern)} (${pattern.name_en})`,
      `${L('Expected files to change', '変更対象ファイルの想定')}: static HTML, CSS, and client-side JS for the selected AI UI pattern.`,
      `${L('UI states', 'UI states')}: ${requiredStates().join(', ')}`,
      `${L('Accessibility requirements', 'アクセシビリティ要件')}: keyboard operation, visible focus, semantic labels, and non-color-only risk signals.`,
      `${L('Trust / transparency requirements', '信頼性・透明性要件')}: show AI limits, user control, fallback behavior, and review needs.`,
      `${L('Free behavior', '無料動作')}: pattern research, details, 2-item comparison, and basic prompt copy stay available.`,
      `${L('Pro behavior', 'Pro動作')}: copy/export handoff packs and 3–4 item comparison only after Common Pro is active.`,
      'No AI API call.',
      'No external data send.',
      `${L('Acceptance criteria', '受け入れ条件')}: selected pattern outputs generate locally and locked actions remain disabled in Preview mode.`
    ];
  }

  function githubIssue(pattern) {
    return [
      `## Summary\nImplement ${pattern.name_en} as a safe AI interaction pattern.`,
      `## Scope\nPattern: ${pattern.name_en} / ${pattern.name_ja}. Category: ${pattern.category}.`,
      `## Implementation requirements\n- Purpose: ${pattern.purpose}\n- Risk: ${pattern.risk}\n- Control: ${pattern.control}\n- Visibility: ${pattern.visibility}`,
      '## Free behavior\nSearch, filters, detail, 2-item compare, best/not-for, failure states, trust notes, and basic prompt copy remain free.',
      '## Pro behavior\nProduct spec, Codex task, GitHub Issue, UX risk, safety checklist, Markdown/JSON export, and 3–4 compare unlock with Common Pro.',
      `## UI states\n${requiredStates().map((item) => `- ${item}`).join('\n')}`,
      '## Accessibility requirements\n- Keyboard access\n- Visible focus\n- Screen-reader friendly labels\n- Do not rely on color alone',
      '## QA checklist\n- Free flow works without Pro\n- Pro actions are locked in Preview\n- Pro actions work when Common Pro is active\n- No network AI calls are added',
      '## Out of scope\nIndividual Stripe products, individual webhooks, individual D1 tables, and tool-specific entitlement systems.'
    ];
  }

  function uxRiskChecklist() {
    return J ? [
      'AIが正しく見えすぎないか', 'AI生成であることが分かるか', '出典 / 根拠 / 制限が見えるか', '人間確認が必要な場面が明確か', 'ユーザーが編集 / 拒否 / 取り消しできるか', '失敗時に詰まらないか', '高リスク操作を自動適用していないか'
    ] : [
      'Does the AI look more correct than it is?', 'Is AI-generated content clearly labeled?', 'Are sources, evidence, and limits visible?', 'Is the need for human review clear?', 'Can users edit, reject, or undo?', 'Can users recover when the AI fails?', 'Are high-risk actions prevented from auto-apply?'
    ];
  }

  function safetyChecklist() {
    return ['empty state', 'loading state', 'partial result', 'no useful answer', 'unsafe request refusal', 'rate limit', 'source unavailable', 'manual fallback', 'retry', 'edit and retry', 'undo', 'human handoff'];
  }

  function stateMemo(pattern) {
    return [
      `${L('Selected pattern', '選択中パターン')}: ${nameOf(pattern)}`,
      `${L('Empty state', '空状態')}: ${L('Explain what users can ask or select first.', '最初に何を入力・選択できるか説明する。')}`,
      `${L('Loading state', '読み込み状態')}: ${L('Show progress without implying certainty.', '確実性を装わず進行を示す。')}`,
      `${L('Partial state', '部分結果')}: ${L('Mark incomplete results and next steps.', '未完了結果と次の操作を示す。')}`,
      `${L('Error/refusal/fallback', 'エラー・拒否・代替')}: ${L('Provide reason, retry/edit, undo, and manual handoff.', '理由、再試行・編集、取り消し、手動移行を用意する。')}`
    ];
  }

  function markdownForPattern(pattern) {
    const data = proData(pattern);
    if (!data) return TEXT.selectPattern;
    const lines = [
      `# ${data.patternName} — Pro handoff pack`,
      '',
      '## Product spec handoff',
      `- Pattern name: ${data.patternName}`,
      `- Japanese label: ${data.japaneseLabel}`,
      `- Category: ${data.category}`,
      `- Purpose: ${data.purpose}`,
      `- AI risk: ${data.aiRisk}`,
      `- User control level: ${data.userControlLevel}`,
      `- AI visibility: ${data.aiVisibility}`,
      `- Trust / transparency notes: ${data.trustTransparencyNotes.join('; ')}`,
      `- Best for: ${data.bestFor.join('; ')}`,
      `- Not for: ${data.notFor.join('; ')}`,
      `- Required UI states: ${data.requiredUiStates.join(', ')}`,
      `- User control requirements: ${data.userControlRequirements.join('; ')}`,
      `- Failure / fallback behavior: ${data.failureFallbackBehavior.join('; ')}`,
      `- Acceptance criteria: ${data.acceptanceCriteria.join('; ')}`,
      '',
      '## Codex implementation task',
      ...data.codexTask.map((item) => `- ${item}`),
      '',
      '## GitHub Issue',
      ...data.githubIssue,
      '',
      '## UX risk checklist',
      ...data.uxRiskChecklist.map((item) => `- [ ] ${item}`),
      '',
      '## Safety / fallback checklist',
      ...data.safetyFallbackChecklist.map((item) => `- [ ] ${item}`),
      '',
      '## State design memo',
      ...data.stateDesignMemo.map((item) => `- ${item}`)
    ];
    return lines.join('\n');
  }

  function compareMarkdown() {
    const items = comparePatterns();
    if (!items.length) return TEXT.empty;
    const lines = ['# AI interaction comparison', ''];
    compareRows(items).forEach((row) => {
      lines.push(`## ${row[0]}`);
      row.slice(1).forEach((cell, index) => lines.push(`- ${nameOf(items[index])}: ${cell}`));
      lines.push('');
    });
    return lines.join('\n');
  }

  function renderOutputBlock(parent, title, items, copyText) {
    const block = el('section', 'pro-output-block');
    const head = el('div', 'pro-output-head');
    head.append(el('h3', '', title));
    const copyButton = button(L('Copy', 'コピー'), () => state.proActive ? copy(copyText) : toast(TEXT.proLocked), 'btn secondary');
    copyButton.dataset.proAction = 'copy';
    copyButton.disabled = !state.proActive;
    copyButton.classList.toggle('is-locked', !state.proActive);
    head.append(copyButton);
    block.append(head);
    const list = el('ul');
    items.forEach((item) => list.append(el('li', '', item)));
    block.append(list);
    parent.append(block);
  }

  function renderProPack() {
    const container = $('pro-handoff-content');
    if (!container) return;
    const pattern = patterns.find((item) => item.slug === state.sel);
    container.textContent = '';
    if (!pattern) {
      container.append(el('p', 'empty', TEXT.selectPattern));
      return;
    }
    const data = proData(pattern);
    const markdown = markdownForPattern(pattern);
    const json = JSON.stringify({ pattern: data, comparison: comparePatterns().map(proData) }, null, 2);
    const preview = !state.proActive;

    if (preview) {
      const note = el('p', 'pro-note', L('Free features remain usable. Preview samples below show what Common Pro unlocks.', '無料機能は引き続き利用できます。以下は共通Proで解放される出力サンプルです。'));
      note.dataset.proPreview = '';
      container.append(note);
    }

    renderOutputBlock(container, L('Product spec handoff', 'Product spec handoff'), [
      `${data.patternName} / ${data.japaneseLabel}`,
      `${L('Purpose', '目的')}: ${data.purpose}`,
      `${L('Risk / control / visibility', 'リスク・制御・表示')}: ${data.aiRisk} / ${data.userControlLevel} / ${data.aiVisibility}`,
      `${L('Acceptance criteria', '受け入れ条件')}: ${data.acceptanceCriteria[0]}`
    ], markdown);
    renderOutputBlock(container, L('Codex implementation task', 'Codex実装依頼文'), data.codexTask, data.codexTask.join('\n'));
    renderOutputBlock(container, L('GitHub Issue format', 'GitHub Issue形式'), data.githubIssue, data.githubIssue.join('\n\n'));
    renderOutputBlock(container, L('UX risk checklist', 'UX risk checklist'), data.uxRiskChecklist, data.uxRiskChecklist.map((item) => `- [ ] ${item}`).join('\n'));
    renderOutputBlock(container, L('Safety / fallback checklist', 'Safety / fallback checklist'), data.safetyFallbackChecklist, data.safetyFallbackChecklist.map((item) => `- [ ] ${item}`).join('\n'));

    const exports = el('div', 'pro-export-actions');
    const mdButton = button(TEXT.downloadMd, () => state.proActive ? download(`${pattern.slug}-handoff.md`, markdown, 'text/markdown') : toast(TEXT.proLocked));
    const jsonButton = button(TEXT.downloadJson, () => state.proActive ? download(`${pattern.slug}-handoff.json`, json, 'application/json') : toast(TEXT.proLocked));
    const compareMdButton = button(L('Save comparison Markdown', '比較Markdownを保存'), () => state.proActive ? download('aiia-comparison.md', compareMarkdown(), 'text/markdown') : toast(TEXT.proLocked), 'btn secondary');
    const compareJsonButton = button(L('Save comparison JSON', '比較JSONを保存'), () => state.proActive ? download('aiia-comparison.json', JSON.stringify(comparePatterns().map(proData), null, 2), 'application/json') : toast(TEXT.proLocked), 'btn secondary');
    [mdButton, jsonButton, compareMdButton, compareJsonButton].forEach((node) => {
      node.dataset.proAction = 'export';
      node.disabled = !state.proActive;
      node.classList.toggle('is-locked', !state.proActive);
      exports.append(node);
    });
    container.append(exports);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    bind();
    state.proActive = document.documentElement.dataset.proActive === 'true';
    try {
      patterns = (await (await fetch('./data/patterns.json')).json()).map(enhance);
      state.cmp = state.cmp.filter((slugValue) => patterns.some((pattern) => pattern.slug === slugValue)).slice(0, state.proActive ? 4 : 2);
      write(STORE.c, state.cmp);
      renderFilters();
      renderShortcuts();
      selectPattern(patterns[0].slug, false);
      render();
      if (window.NWAIIAProBridge && typeof window.NWAIIAProBridge.refresh === 'function') window.NWAIIAProBridge.refresh();
    } catch (error) {
      $('pattern-list').textContent = TEXT.fail;
    }
  });
})();
