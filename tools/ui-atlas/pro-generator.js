(function () {
  const root = document.body;
  if (!root || root.dataset.page !== 'pro') return;
  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const mount = document.querySelector('[data-pro-generator]');
  if (!mount) return;

  let commonProActive = false;
  let currentMode = 'decision';
  let latestBundle = null;

  function loadNWPro() {
    return new Promise((resolve) => {
      if (window.NWPro) return resolve(window.NWPro);
      const script = document.createElement('script');
      script.src = '/assets/nw-pro.js';
      script.onload = () => resolve(window.NWPro || null);
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }

  const i18n = {
    en: {
      title: 'Generate Pro handoff output',
      intro: 'Choose a generator mode, fill the product context, then copy or export implementation-ready Markdown.',
      modeLabel: 'Generator mode',
      modes: {
        decision: 'Decision Memo',
        compare: 'Multi-Pattern Compare',
        prompt: 'Codex / GitHub Issue Prompt',
        acceptance: 'Acceptance Criteria',
        full: 'Full Markdown Export'
      },
      pattern: 'Pattern / UI pattern',
      goal: 'Goal / use case',
      context: 'Context',
      risk: 'Main risk',
      device: 'Device priority',
      priority: 'Implementation priority',
      candidates: 'Candidate patterns for compare',
      candidatesHint: 'Enter 2–5 candidates separated by commas or new lines.',
      button: 'Generate output',
      copyAll: 'Copy all Markdown',
      copyDecision: 'Copy decision memo',
      copyCompare: 'Copy compare memo',
      copyPrompt: 'Copy Codex prompt',
      copyAcceptance: 'Copy acceptance criteria',
      copyReview: 'Copy review checklist',
      exportMarkdown: 'Export Markdown',
      exportJson: 'Export JSON',
      copied: 'Copied.',
      exportedMarkdown: 'Markdown export prepared.',
      exportedJson: 'JSON export prepared.',
      failed: 'Copy failed. Please copy manually.',
      imported: 'Loaded values from URL parameters.',
      activeStatus: 'Pro unlocked. Common Pro is active in this browser.',
      inactiveStatus: 'Preview mode. Common Pro is not active in this browser yet.',
      unknownStatus: 'Could not check Pro status. Preview output remains available.',
      previewMarker: '[Preview output]',
      fullBadge: 'Full output',
      previewBadge: 'Preview output',
      compareLock: 'Unlock Pro to compare up to 5 patterns.',
      lockedSuffix: 'locked in Preview',
      markdownTitle: 'Markdown output',
      jsonTitle: 'JSON output preview',
      placeholderPattern: 'e.g. confirmation dialog',
      placeholderGoal: 'e.g. prevent accidental account deletion',
      placeholderContext: 'e.g. account settings, destructive action, returning users',
      placeholderRisk: 'e.g. user misses the consequence copy',
      placeholderDevice: 'e.g. mobile-first / desktop dashboard / both',
      placeholderPriority: 'e.g. accessibility first, low implementation cost, conversion clarity',
      placeholderCandidates: 'modal\ntoast\ndrawer',
      fallbackPattern: 'confirmation dialog',
      fallbackGoal: 'prevent accidental destructive action',
      fallbackContext: 'A user is making an important product decision and needs clear guidance before continuing.',
      fallbackRisk: 'the user misses the consequence',
      fallbackDevice: 'mobile and desktop',
      fallbackPriority: 'accessibility, responsive behavior, and maintainability',
      fallbackCandidates: ['modal', 'toast', 'drawer'],
      sectionLabels: {
        decision: 'Decision memo',
        compare: 'Compare memo',
        prompt: 'Codex prompt',
        acceptance: 'Acceptance criteria',
        review: 'Review checklist'
      }
    },
    ja: {
      title: 'Pro引き継ぎ出力を生成',
      intro: '生成モードを選び、プロダクト文脈を入力して、実装に渡せるMarkdownをコピーまたは出力できます。',
      modeLabel: '生成モード',
      modes: {
        decision: 'Decision Memo / 判断メモ',
        compare: 'Multi-Pattern Compare / 複数UI比較',
        prompt: 'Codex / GitHub Issue依頼文',
        acceptance: 'Acceptance Criteria / 受け入れ条件',
        full: 'Full Markdown Export / Markdown一括出力'
      },
      pattern: 'UIパターン',
      goal: '目的 / 利用場面',
      context: '文脈',
      risk: '主なリスク',
      device: '優先デバイス',
      priority: '実装優先度',
      candidates: '比較候補',
      candidatesHint: '2〜5件の候補をカンマまたは改行区切りで入力してください。',
      button: '出力を生成',
      copyAll: 'Markdown全文をコピー',
      copyDecision: '判断メモをコピー',
      copyCompare: '比較メモをコピー',
      copyPrompt: 'Codex依頼文をコピー',
      copyAcceptance: '受け入れ条件をコピー',
      copyReview: '確認チェックリストをコピー',
      exportMarkdown: 'Markdown出力',
      exportJson: 'JSON出力',
      copied: 'コピーしました。',
      exportedMarkdown: 'Markdownを出力しました。',
      exportedJson: 'JSONを出力しました。',
      failed: 'コピーに失敗しました。手動でコピーしてください。',
      imported: 'URLパラメータから初期値を読み込みました。',
      activeStatus: 'Pro解放済み。このブラウザでは共通Proが有効です。',
      inactiveStatus: 'Previewモードです。このブラウザでは共通Proがまだ有効ではありません。',
      unknownStatus: 'Pro状態を確認できませんでした。Preview出力は利用できます。',
      previewMarker: '[Preview出力]',
      fullBadge: 'Full output',
      previewBadge: 'Preview output',
      compareLock: 'Proを解放すると最大5件まで比較できます。',
      lockedSuffix: 'Previewではロック',
      markdownTitle: 'Markdown出力',
      jsonTitle: 'JSON出力プレビュー',
      placeholderPattern: '例: 確認ダイアログ',
      placeholderGoal: '例: 誤ってアカウント削除しないようにする',
      placeholderContext: '例: アカウント設定、破壊的操作、再訪ユーザー',
      placeholderRisk: '例: ユーザーが影響範囲を見落とす',
      placeholderDevice: '例: モバイル優先 / PC管理画面 / 両方',
      placeholderPriority: '例: アクセシビリティ優先、実装コスト低め、CV明確化',
      placeholderCandidates: 'モーダル\nトースト\nドロワー',
      fallbackPattern: '確認ダイアログ',
      fallbackGoal: '重要操作の誤実行を防ぐ',
      fallbackContext: 'ユーザーが重要な判断を行う場面で、続行前に明確な案内が必要です。',
      fallbackRisk: 'ユーザーが影響範囲を見落とす',
      fallbackDevice: 'モバイルとPC',
      fallbackPriority: 'アクセシビリティ、レスポンシブ対応、保守性',
      fallbackCandidates: ['モーダル', 'トースト', 'ドロワー'],
      sectionLabels: {
        decision: '判断メモ',
        compare: '比較メモ',
        prompt: 'Codex依頼文',
        acceptance: '受け入れ条件',
        review: '確認チェックリスト'
      }
    }
  }[lang];

  function esc(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  mount.innerHTML = `
    <section class="nw-card pro-generator-card" data-pro-generator-card>
      <style>
        .pro-generator-card .pro-mode-tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}.pro-generator-card .pro-mode-tab{border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:999px;padding:.55rem .85rem;cursor:pointer;font-weight:700}.pro-generator-card .pro-mode-tab[aria-selected="true"]{background:#111827;color:#fff;border-color:#111827}.pro-generator-card .pro-input-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}.pro-generator-card .pro-input-grid label,.pro-generator-card .pro-wide-field{display:flex;flex-direction:column;gap:.4rem}.pro-generator-card .pro-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}.pro-generator-card .pro-output-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}.pro-generator-card .pro-output-box{white-space:pre-wrap;overflow-wrap:anywhere}.pro-generator-card .pro-status-badge{display:inline-block;border-radius:999px;padding:.25rem .65rem;background:#eef2ff;color:#3730a3;font-weight:700}.pro-generator-card .pro-lock-note{color:#9a3412;font-weight:700}.pro-generator-card textarea{width:100%;box-sizing:border-box}@media(max-width:520px){.pro-generator-card .pro-mode-tab,.pro-generator-card .pro-actions .support-btn{width:100%;text-align:center}}
      </style>
      <h2>${esc(i18n.title)}</h2>
      <p>${esc(i18n.intro)}</p>
      <p class="copy-state" data-common-pro-state aria-live="polite">${esc(i18n.unknownStatus)}</p>
      <p><span class="pro-status-badge" data-pro-output-kind>${esc(i18n.previewBadge)}</span></p>
      <div aria-label="${esc(i18n.modeLabel)}" class="pro-mode-tabs" role="tablist">
        ${Object.entries(i18n.modes).map(([key, label]) => `<button type="button" class="pro-mode-tab" role="tab" data-pro-mode="${key}" aria-selected="${key === currentMode ? 'true' : 'false'}">${esc(label)}</button>`).join('')}
      </div>
      <div class="pro-input-grid">
        <label><strong>${esc(i18n.pattern)}</strong><input class="search-input" data-pro-pattern placeholder="${esc(i18n.placeholderPattern)}"></label>
        <label><strong>${esc(i18n.goal)}</strong><input class="search-input" data-pro-goal placeholder="${esc(i18n.placeholderGoal)}"></label>
        <label><strong>${esc(i18n.context)}</strong><input class="search-input" data-pro-context placeholder="${esc(i18n.placeholderContext)}"></label>
        <label><strong>${esc(i18n.risk)}</strong><input class="search-input" data-pro-risk placeholder="${esc(i18n.placeholderRisk)}"></label>
        <label><strong>${esc(i18n.device)}</strong><input class="search-input" data-pro-device placeholder="${esc(i18n.placeholderDevice)}"></label>
        <label><strong>${esc(i18n.priority)}</strong><input class="search-input" data-pro-priority placeholder="${esc(i18n.placeholderPriority)}"></label>
      </div>
      <label class="pro-wide-field" style="margin-top:1rem"><strong>${esc(i18n.candidates)}</strong><textarea class="textarea" data-pro-candidates rows="4" placeholder="${esc(i18n.placeholderCandidates)}"></textarea><small>${esc(i18n.candidatesHint)}</small></label>
      <p class="pro-lock-note" data-pro-lock-note aria-live="polite"></p>
      <div class="pro-actions">
        <button type="button" class="support-btn" data-pro-generate>${esc(i18n.button)}</button>
        <button type="button" class="support-btn" data-pro-copy="all">${esc(i18n.copyAll)}</button>
        <button type="button" class="support-btn" data-pro-copy="decision">${esc(i18n.copyDecision)}</button>
        <button type="button" class="support-btn" data-pro-copy="compare">${esc(i18n.copyCompare)}</button>
        <button type="button" class="support-btn" data-pro-copy="prompt">${esc(i18n.copyPrompt)}</button>
        <button type="button" class="support-btn" data-pro-copy="acceptance">${esc(i18n.copyAcceptance)}</button>
        <button type="button" class="support-btn" data-pro-copy="review">${esc(i18n.copyReview)}</button>
        <button type="button" class="support-btn" data-pro-export="markdown">${esc(i18n.exportMarkdown)}</button>
        <button type="button" class="support-btn" data-pro-export="json">${esc(i18n.exportJson)}</button>
      </div>
      <p class="copy-state" data-pro-copy-state aria-live="polite"></p>
      <div class="pro-output-grid">
        <section class="local-box"><h3>${esc(i18n.sectionLabels.decision)}</h3><div class="pro-output-box" data-pro-preview="decision"></div></section>
        <section class="local-box"><h3>${esc(i18n.sectionLabels.compare)}</h3><div class="pro-output-box" data-pro-preview="compare"></div></section>
        <section class="local-box"><h3>${esc(i18n.sectionLabels.prompt)}</h3><div class="pro-output-box" data-pro-preview="prompt"></div></section>
        <section class="local-box"><h3>${esc(i18n.sectionLabels.acceptance)}</h3><div class="pro-output-box" data-pro-preview="acceptance"></div></section>
        <section class="local-box"><h3>${esc(i18n.sectionLabels.review)}</h3><div class="pro-output-box" data-pro-preview="review"></div></section>
      </div>
      <h3>${esc(i18n.markdownTitle)}</h3>
      <textarea class="textarea" data-pro-markdown rows="16" readonly></textarea>
      <h3>${esc(i18n.jsonTitle)}</h3>
      <textarea class="textarea" data-pro-json rows="8" readonly></textarea>
    </section>
  `;

  const cardEl = mount.querySelector('[data-pro-generator-card]');
  const commonProEl = mount.querySelector('[data-common-pro-state]');
  const outputKindEl = mount.querySelector('[data-pro-output-kind]');
  const stateEl = mount.querySelector('[data-pro-copy-state]');
  const lockEl = mount.querySelector('[data-pro-lock-note]');
  const patternEl = mount.querySelector('[data-pro-pattern]');
  const goalEl = mount.querySelector('[data-pro-goal]');
  const contextEl = mount.querySelector('[data-pro-context]');
  const riskEl = mount.querySelector('[data-pro-risk]');
  const deviceEl = mount.querySelector('[data-pro-device]');
  const priorityEl = mount.querySelector('[data-pro-priority]');
  const candidatesEl = mount.querySelector('[data-pro-candidates]');
  const markdownEl = mount.querySelector('[data-pro-markdown]');
  const jsonEl = mount.querySelector('[data-pro-json]');
  const previewEls = {
    decision: mount.querySelector('[data-pro-preview="decision"]'),
    compare: mount.querySelector('[data-pro-preview="compare"]'),
    prompt: mount.querySelector('[data-pro-preview="prompt"]'),
    acceptance: mount.querySelector('[data-pro-preview="acceptance"]'),
    review: mount.querySelector('[data-pro-preview="review"]')
  };

  function cleanParam(value) {
    const raw = value || '';
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch (error) {
      decoded = raw;
    }
    return decoded.replace(/[-_]+/g, ' ').trim();
  }

  function inputValue(el, fallback) {
    return (el.value || '').trim() || fallback;
  }

  function splitCandidates(value) {
    return (value || '')
      .split(/[\n,]+|\s+vs\s+/i)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5);
  }

  function getInputs() {
    const pattern = inputValue(patternEl, i18n.fallbackPattern);
    const goal = inputValue(goalEl, i18n.fallbackGoal);
    const context = inputValue(contextEl, i18n.fallbackContext);
    const risk = inputValue(riskEl, i18n.fallbackRisk);
    const device = inputValue(deviceEl, i18n.fallbackDevice);
    const priority = inputValue(priorityEl, i18n.fallbackPriority);
    const fromCandidateBox = splitCandidates(candidatesEl.value);
    const fromPattern = splitCandidates(patternEl.value);
    const candidates = (fromCandidateBox.length ? fromCandidateBox : (fromPattern.length > 1 ? fromPattern : [pattern].concat(i18n.fallbackCandidates.filter((item) => item !== pattern)))).slice(0, 5);
    return { pattern, goal, context, risk, device, priority, candidates };
  }

  function visibleCandidates(candidates) {
    const max = commonProActive ? 5 : 2;
    return candidates.slice(0, max);
  }

  function lockedCandidates(candidates) {
    return commonProActive ? [] : candidates.slice(2, 5);
  }

  function mdList(items, checkbox) {
    return items.map((item) => `${checkbox ? '- [ ]' : '-'} ${item}`).join('\n');
  }

  function buildDecision(data) {
    if (lang === 'ja') {
      return `# UI判断メモ\n\n## 採用UI\n${data.pattern}\n\n## 目的\n${data.goal}\n\n## 文脈\n${data.context}\n\n## 採用理由\n${data.pattern} は、主なリスク「${data.risk}」を抑えながら目的を達成しやすいため採用候補にします。優先デバイスは ${data.device} です。\n\n## 向いている場面\n${data.context} のように、ユーザーが判断前に理由・影響・次の操作を確認する必要がある場面に向いています。\n\n## 向いていない場面\n短い通知だけで十分な場面、またはユーザーの作業を止める必要がない軽量なフィードバックには向きません。\n\n## 却下した代替案\n${data.candidates.filter((item) => item !== data.pattern).slice(0, 3).map((item) => `- ${item}: ${data.risk} を十分に抑えられない可能性があるため優先度を下げます。`).join('\n') || '- 代替案は比較候補に追加して判断します。'}\n\n## 実装リスク\n- ${data.risk}\n- ${data.device} で文量や操作導線が崩れる可能性\n- ${data.priority} を満たすための状態設計不足\n\n## 検証計画\n- 主要導線で迷わず完了できるか確認する。\n- キーボード操作、フォーカス、読み上げラベルを確認する。\n- 360px幅と長文でレイアウトが破綻しないか確認する。`;
    }
    return `# UI Decision Memo\n\n## Selected pattern\n${data.pattern}\n\n## Goal\n${data.goal}\n\n## Context\n${data.context}\n\n## Why this pattern\nUse ${data.pattern} because it supports the goal while reducing the main risk: ${data.risk}. The device priority is ${data.device}.\n\n## Best use case\nUse it when the product context requires users to understand the consequence, confirm intent, and continue with confidence.\n\n## Not for\nAvoid it for lightweight feedback, background status changes, or moments where interrupting the user would add unnecessary friction.\n\n## Rejected alternatives\n${data.candidates.filter((item) => item !== data.pattern).slice(0, 3).map((item) => `- ${item}: lower priority because it may not reduce ${data.risk} enough.`).join('\n') || '- Add alternatives to the compare candidates before final selection.'}\n\n## Implementation risks\n- ${data.risk}\n- Layout or interaction issues on ${data.device}\n- Missing states while optimizing for ${data.priority}\n\n## Validation plan\n- Confirm users can complete the main path without confusion.\n- Check keyboard behavior, visible focus, and screen reader labels.\n- Test 360px width and long content without layout breakage.`;
  }

  function buildCompare(data) {
    const shown = visibleCandidates(data.candidates);
    const locked = lockedCandidates(data.candidates);
    const recommended = shown[0] || data.pattern;
    const rejected = shown.slice(1);
    if (lang === 'ja') {
      return `# UI比較メモ\n\n## 比較候補\n${shown.map((item) => `- ${item}`).join('\n')}${locked.length ? `\n${locked.map((item) => `- ${item}（${i18n.lockedSuffix}）`).join('\n')}\n\n${i18n.compareLock}` : ''}\n\n## 推奨UI\n${recommended}\n\n## 理由\n${recommended} は「${data.goal}」に対して、${data.priority} を優先しながら主なリスク「${data.risk}」を抑えやすい候補です。\n\n## 却下した代替案\n${rejected.map((item) => `- ${item}: 文脈「${data.context}」では、操作負荷・情報量・保守性のいずれかで推奨案より弱い可能性があります。`).join('\n') || '- Previewでは比較候補を追加して判断します。'}\n\n## トレードオフ\n- 情報量が多いほど判断材料は増えますが、操作完了までの負荷も増えます。\n- 軽量UIは速い一方で、${data.risk} を見落とすリスクがあります。\n\n## アクセシビリティリスク\nフォーカス順、読み上げラベル、キーボード操作、閉じる操作を候補ごとに確認します。\n\n## モバイルリスク\n${data.device} を優先し、360px幅で横スクロールやボタン折り返しが起きないか確認します。\n\n## 実装コスト\n状態管理、エラー表示、フォーカス制御が必要な候補ほど高くなります。\n\n## 保守コスト\n文言、状態、例外ケースが増える候補は、将来の変更時に確認範囲が広がります。`;
    }
    return `# UI Compare Memo\n\n## Candidate list\n${shown.map((item) => `- ${item}`).join('\n')}${locked.length ? `\n${locked.map((item) => `- ${item} (${i18n.lockedSuffix})`).join('\n')}\n\n${i18n.compareLock}` : ''}\n\n## Recommended pattern\n${recommended}\n\n## Reason\n${recommended} best supports "${data.goal}" while prioritizing ${data.priority} and reducing the main risk: ${data.risk}.\n\n## Rejected alternatives\n${rejected.map((item) => `- ${item}: weaker fit for "${data.context}" across user effort, information density, or maintainability.`).join('\n') || '- Add compare candidates to evaluate rejected alternatives.'}\n\n## Trade-offs\n- More information can improve confidence but adds completion friction.\n- Lightweight UI can feel faster but may not reduce ${data.risk}.\n\n## Accessibility risk\nCheck focus order, screen reader labels, keyboard operation, and dismissal behavior for each candidate.\n\n## Mobile risk\nPrioritize ${data.device}; verify 360px width without horizontal overflow or broken button layout.\n\n## Implementation cost\nPatterns that require state management, error messaging, and focus control have higher implementation cost.\n\n## Maintenance cost\nPatterns with more copy, states, and exceptions require broader regression checks over time.`;
  }

  function buildPrompt(data) {
    if (lang === 'ja') {
      return `# Codex / GitHub Issue依頼文\n\n${data.goal} のために ${data.pattern} を実装してください。\n\n## Role\nあなたはNicheWorksの静的UIを壊さずに実装するフロントエンド実装者です。\n\n## 文脈\n${data.context}\n\n## 要件\n- UIパターン: ${data.pattern}\n- 目的: ${data.goal}\n- 主なリスク: ${data.risk}\n- 優先デバイス: ${data.device}\n- 実装優先度: ${data.priority}\n\n## 状態\n- 通常\n- 読み込み中\n- 空状態\n- エラー\n- 長文\n\n## アクセシビリティ\n- キーボード操作\n- 見えるフォーカス\n- 読み上げ用ラベル\n- 必要に応じたreduced motion\n\n## レスポンシブ\n- 360px幅で動作すること\n- 横スクロールを出さないこと\n\n## 受け入れ条件\n${buildAcceptance(data).split('\n').slice(2).join('\n')}\n\n## やってはいけないこと\n- 既存の無料版カタログや比較上限ロジックを変更しない。\n- ツール専用の決済・Webhook・D1権限フローを追加しない。\n- 既存の言語切替を壊さない。`;
    }
    return `# Codex / GitHub Issue Prompt\n\nYou are implementing ${data.pattern} for ${data.goal}.\n\n## Role\nYou are a frontend implementer working within the existing static NicheWorks UI.\n\n## Context\n${data.context}\n\n## Requirements\n- UI pattern: ${data.pattern}\n- Goal: ${data.goal}\n- Main risk: ${data.risk}\n- Device priority: ${data.device}\n- Implementation priority: ${data.priority}\n\n## States\n- Default\n- Loading\n- Empty\n- Error\n- Long content\n\n## Accessibility\n- Keyboard support\n- Visible focus\n- Screen reader labels\n- Reduced motion where relevant\n\n## Responsive\n- Must work at 360px width\n- Avoid horizontal overflow\n\n## Acceptance criteria\n${buildAcceptance(data).split('\n').slice(2).join('\n')}\n\n## Do not do\n- Do not change the existing free catalog or compare-limit logic.\n- Do not add individual Stripe, webhook, or D1 flows.\n- Do not break existing language switching.`;
  }

  function buildAcceptance(data) {
    const items = lang === 'ja'
      ? [
        'PC幅でレイアウトが崩れない。',
        '360px幅で横スクロールが出ない。',
        'キーボードだけで主要操作に到達できる。',
        'フォーカス状態が見える。',
        '読み上げ用ラベルまたは代替テキストが不足していない。',
        '読み込み中、空状態、エラー状態がある。',
        '長文でもレイアウトが破綻しない。',
        '必要に応じてreduced motionを考慮している。',
        `${data.pattern} が「${data.goal}」を支援し、主なリスク「${data.risk}」を抑えている。`
      ]
      : [
        'Works on desktop without layout breakage.',
        'Works at 360px width without horizontal scrolling.',
        'Keyboard users can reach and operate all controls.',
        'Focus state is visible.',
        'Screen reader labels or alternative text are not missing.',
        'Loading, empty, and error states are handled.',
        'Long text does not break the layout.',
        'Reduced motion fallback is considered where relevant.',
        `${data.pattern} supports "${data.goal}" while reducing the main risk: ${data.risk}.`
      ];
    return `${lang === 'ja' ? '# 受け入れ条件' : '# Acceptance Criteria'}\n\n${mdList(items, true)}`;
  }

  function buildReview(data) {
    const items = lang === 'ja'
      ? [
        `アクセシビリティ確認: ${data.pattern} のフォーカス順、読み上げ、キーボード操作を確認する。`,
        `モバイル確認: ${data.device} を前提に360px幅、折り返し、タップ領域を確認する。`,
        `実装チェック: ${data.priority} を満たす状態、エラー、長文、保守性を確認する。`,
        `リスク確認: ${data.risk} が文言・配置・状態で抑えられている。`
      ]
      : [
        `Accessibility review: verify focus order, screen reader output, and keyboard operation for ${data.pattern}.`,
        `Mobile review: test 360px width, wrapping, and tap targets for ${data.device}.`,
        `Implementation checklist: verify states, errors, long content, and maintainability for ${data.priority}.`,
        `Risk review: confirm copy, layout, and states reduce ${data.risk}.`
      ];
    return `${lang === 'ja' ? '# 確認チェックリスト' : '# Review Checklist'}\n\n${mdList(items, true)}`;
  }

  function buildFull(data, sections) {
    if (lang === 'ja') {
      return `# UI実装引き継ぎパック\n\n## 採用UI\n${data.pattern}\n\n## 文脈\n${data.context}\n\n## 目的\n${data.goal}\n\n## 主なリスク\n${data.risk}\n\n## 判断メモ\n${sections.decision}\n\n## 比較メモ\n${sections.compare}\n\n## Codex / GitHub Issue依頼文\n${sections.prompt}\n\n## 受け入れ条件\n${sections.acceptance}\n\n## アクセシビリティ確認\n- フォーカス、キーボード操作、読み上げ用ラベルを確認する。\n\n## モバイル確認\n- 360px幅で横スクロールと操作不能なボタンがないことを確認する。\n\n## 実装チェックリスト\n${sections.review}`;
    }
    return `# UI Decision Handoff Pack\n\n## Selected pattern\n${data.pattern}\n\n## Context\n${data.context}\n\n## Goal\n${data.goal}\n\n## Main risk\n${data.risk}\n\n## Decision memo\n${sections.decision}\n\n## Compare memo\n${sections.compare}\n\n## Codex / GitHub Issue prompt\n${sections.prompt}\n\n## Acceptance criteria\n${sections.acceptance}\n\n## Accessibility review\n- Verify focus, keyboard operation, and screen reader labels.\n\n## Mobile review\n- Verify 360px width without horizontal overflow or unreachable controls.\n\n## Implementation checklist\n${sections.review}`;
  }

  function withPreviewMarker(output) {
    return commonProActive ? output : `${i18n.previewMarker}\n\n${output}`;
  }

  function buildBundle() {
    const data = getInputs();
    const sections = {
      decision: buildDecision(data),
      compare: buildCompare(data),
      prompt: buildPrompt(data),
      acceptance: buildAcceptance(data),
      review: buildReview(data)
    };
    sections.all = buildFull(data, sections);
    const modeOutput = currentMode === 'full' ? sections.all : sections[currentMode];
    const output = withPreviewMarker(modeOutput);
    const json = {
      tool: 'ui-atlas',
      mode: currentMode,
      pro_active: commonProActive,
      pattern: data.pattern,
      goal: data.goal,
      context: data.context,
      risk: data.risk,
      output,
      generated_at: new Date().toISOString()
    };
    latestBundle = { data, sections, output, json };
    return latestBundle;
  }

  function render() {
    const bundle = buildBundle();
    Object.keys(previewEls).forEach((key) => {
      previewEls[key].textContent = bundle.sections[key];
    });
    markdownEl.value = bundle.output;
    jsonEl.value = JSON.stringify(bundle.json, null, 2);
    const locked = lockedCandidates(bundle.data.candidates);
    lockEl.textContent = locked.length ? i18n.compareLock : '';
    outputKindEl.textContent = commonProActive ? i18n.fullBadge : i18n.previewBadge;
  }

  function applyProState(active, statusKnown) {
    commonProActive = Boolean(active);
    cardEl.dataset.commonProActive = commonProActive ? 'true' : 'false';
    commonProEl.dataset.proActive = commonProActive ? 'true' : 'false';
    commonProEl.textContent = statusKnown ? (commonProActive ? i18n.activeStatus : i18n.inactiveStatus) : i18n.unknownStatus;
    render();
  }

  function setMode(mode) {
    currentMode = mode;
    mount.querySelectorAll('[data-pro-mode]').forEach((button) => {
      button.setAttribute('aria-selected', button.dataset.proMode === currentMode ? 'true' : 'false');
    });
    render();
  }

  function sectionForCopy(kind) {
    const bundle = latestBundle || buildBundle();
    if (kind === 'all') return withPreviewMarker(bundle.sections.all);
    return withPreviewMarker(bundle.sections[kind] || bundle.output);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      stateEl.textContent = i18n.copied;
    } catch (error) {
      markdownEl.focus();
      markdownEl.select();
      stateEl.textContent = i18n.failed;
    }
  }

  function downloadFile(filename, type, content) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const patternParam = params.get('pattern') || params.get('ui') || params.get('slug') || '';
    const goalParam = params.get('goal') || params.get('use_case') || '';
    const riskParam = params.get('risk') || params.get('avoid') || '';
    const compareParam = params.get('compare') || '';
    const contextParam = params.get('context') || '';
    const deviceParam = params.get('device') || '';
    if (patternParam) patternEl.value = cleanParam(patternParam);
    if (goalParam) goalEl.value = cleanParam(goalParam);
    if (riskParam) riskEl.value = cleanParam(riskParam);
    if (contextParam) contextEl.value = cleanParam(contextParam);
    if (deviceParam) deviceEl.value = cleanParam(deviceParam);
    if (compareParam) {
      candidatesEl.value = compareParam.split(',').map(cleanParam).filter(Boolean).join('\n');
      currentMode = 'compare';
    }
    if (patternParam || goalParam || riskParam || compareParam || contextParam || deviceParam) stateEl.textContent = i18n.imported;
  }

  mount.querySelectorAll('[data-pro-mode]').forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.proMode));
  });
  mount.querySelector('[data-pro-generate]').addEventListener('click', render);
  mount.querySelectorAll('[data-pro-copy]').forEach((button) => {
    button.addEventListener('click', () => copyText(sectionForCopy(button.dataset.proCopy)));
  });
  mount.querySelector('[data-pro-export="markdown"]').addEventListener('click', () => {
    const bundle = latestBundle || buildBundle();
    downloadFile('ui-atlas-pro-generator.md', 'text/markdown;charset=utf-8', withPreviewMarker(bundle.sections.all));
    stateEl.textContent = i18n.exportedMarkdown;
  });
  mount.querySelector('[data-pro-export="json"]').addEventListener('click', () => {
    const bundle = latestBundle || buildBundle();
    const json = Object.assign({}, bundle.json, { output: withPreviewMarker(bundle.sections.all), generated_at: new Date().toISOString() });
    downloadFile('ui-atlas-pro-generator.json', 'application/json;charset=utf-8', JSON.stringify(json, null, 2));
    stateEl.textContent = i18n.exportedJson;
  });
  [patternEl, goalEl, contextEl, riskEl, deviceEl, priorityEl, candidatesEl].forEach((el) => el.addEventListener('input', render));

  initFromUrl();
  setMode(currentMode);
  loadNWPro().then((helper) => {
    if (!helper || typeof helper.getLocalStatus !== 'function') {
      applyProState(false, false);
      return;
    }
    const status = helper.getLocalStatus();
    applyProState(Boolean(status && status.active), true);
  }).catch(() => applyProState(false, false));
})();
