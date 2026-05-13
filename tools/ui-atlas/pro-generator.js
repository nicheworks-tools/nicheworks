(function () {
  const root = document.body;
  if (!root || root.dataset.page !== 'pro') return;
  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const mount = document.querySelector('[data-pro-generator]');
  if (!mount) return;

  const text = {
    en: {
      title: 'Generate Pro handoff output', pattern: 'Selected UI pattern', goal: 'Goal / use case', risk: 'Main risk to avoid', button: 'Generate output', copy: 'Copy Markdown', copied: 'Markdown copied.', failed: 'Copy failed. Please copy manually.', placeholderPattern: 'e.g. confirmation dialog', placeholderGoal: 'e.g. prevent accidental account deletion', placeholderRisk: 'e.g. user misses the consequence copy', decision: 'Decision memo', checklist: 'Implementation checklist', prompt: 'AI/Codex handoff prompt', markdown: 'Markdown output', imported: 'Loaded values from URL parameters.'
    },
    ja: {
      title: 'Pro引き継ぎ出力を生成', pattern: '選択したUIパターン', goal: '目的 / 利用場面', risk: '避けたい主なリスク', button: '出力を生成', copy: 'Markdownをコピー', copied: 'Markdownをコピーしました。', failed: 'コピーに失敗しました。手動でコピーしてください。', placeholderPattern: '例: 確認ダイアログ', placeholderGoal: '例: 誤ってアカウント削除しないようにする', placeholderRisk: '例: ユーザーが影響範囲を見落とす', decision: '判断メモ', checklist: '実装チェックリスト', prompt: 'AI/Codex引き継ぎプロンプト', markdown: 'Markdown出力', imported: 'URLパラメータから初期値を読み込みました。'
    }
  }[lang];

  mount.innerHTML = `
    <section class="nw-card pro-generator-card">
      <h2>${text.title}</h2>
      <div class="local-blocks">
        <label class="local-box"><strong>${text.pattern}</strong><input class="search-input" data-pro-pattern placeholder="${text.placeholderPattern}"></label>
        <label class="local-box"><strong>${text.goal}</strong><input class="search-input" data-pro-goal placeholder="${text.placeholderGoal}"></label>
        <label class="local-box"><strong>${text.risk}</strong><input class="search-input" data-pro-risk placeholder="${text.placeholderRisk}"></label>
      </div>
      <p><button type="button" class="support-btn" data-pro-generate>${text.button}</button> <button type="button" class="support-btn" data-pro-copy>${text.copy}</button></p>
      <p class="copy-state" data-pro-copy-state aria-live="polite"></p>
      <div class="local-blocks">
        <section class="local-box"><h3>${text.decision}</h3><p data-pro-decision></p></section>
        <section class="local-box"><h3>${text.checklist}</h3><ul class="faq-list" data-pro-checklist></ul></section>
        <section class="local-box"><h3>${text.prompt}</h3><p data-pro-prompt></p></section>
      </div>
      <h3>${text.markdown}</h3>
      <textarea class="textarea" data-pro-markdown rows="10" readonly></textarea>
    </section>
  `;

  const patternEl = mount.querySelector('[data-pro-pattern]');
  const goalEl = mount.querySelector('[data-pro-goal]');
  const riskEl = mount.querySelector('[data-pro-risk]');
  const decisionEl = mount.querySelector('[data-pro-decision]');
  const checklistEl = mount.querySelector('[data-pro-checklist]');
  const promptEl = mount.querySelector('[data-pro-prompt]');
  const markdownEl = mount.querySelector('[data-pro-markdown]');
  const stateEl = mount.querySelector('[data-pro-copy-state]');

  const params = new URLSearchParams(window.location.search);
  const patternParam = params.get('pattern') || params.get('ui') || params.get('slug') || '';
  const goalParam = params.get('goal') || params.get('use_case') || '';
  const riskParam = params.get('risk') || params.get('avoid') || '';
  const compareParam = params.get('compare') || '';

  if (patternParam) patternEl.value = decodeURIComponent(patternParam).replace(/[-_]+/g, ' ');
  if (goalParam) goalEl.value = decodeURIComponent(goalParam).replace(/[-_]+/g, ' ');
  if (riskParam) riskEl.value = decodeURIComponent(riskParam).replace(/[-_]+/g, ' ');
  if (compareParam && !patternEl.value) {
    patternEl.value = decodeURIComponent(compareParam).split(',').map((value) => value.trim().replace(/[-_]+/g, ' ')).filter(Boolean).join(' vs ');
  }
  if ((patternParam || goalParam || riskParam || compareParam) && stateEl) stateEl.textContent = text.imported;

  function val(el, fallback) { return (el.value || '').trim() || fallback; }
  function build() {
    const pattern = val(patternEl, lang === 'ja' ? '確認ダイアログ' : 'confirmation dialog');
    const goal = val(goalEl, lang === 'ja' ? '重要操作の誤実行を防ぐ' : 'prevent accidental destructive action');
    const risk = val(riskEl, lang === 'ja' ? 'ユーザーが影響範囲を見落とす' : 'the user misses the consequence');
    const decision = lang === 'ja'
      ? `${pattern}を採用する。目的は「${goal}」。主なリスクは「${risk}」であるため、操作前に明示的な確認、影響範囲の説明、キャンセル導線を用意する。`
      : `Use ${pattern}. The goal is to ${goal}. The main risk is that ${risk}, so the UI must provide explicit confirmation, consequence copy, and a clear cancel path.`;
    const checklist = lang === 'ja'
      ? ['タイトルで操作内容を明確にする', '影響範囲・失われる内容を説明する', 'キャンセル導線を残す', '危険操作ボタンを視覚的に区別する', 'キーボード操作とフォーカス移動を確認する', 'モバイル幅で文面が崩れないか確認する']
      : ['State the action clearly in the title', 'Explain consequences and what may be lost', 'Keep a clear cancel path', 'Make the destructive/primary action visually distinct', 'Check keyboard and focus behavior', 'Verify copy and layout on mobile widths'];
    const prompt = lang === 'ja'
      ? `${pattern}を使って「${goal}」ためのUIを実装してください。主なリスクは「${risk}」です。アクセシビリティ、モバイル表示、空状態、エラー状態、ローディング状態、受け入れ条件を含めてください。`
      : `Implement a UI using ${pattern} to ${goal}. The main risk is that ${risk}. Include accessibility, mobile layout, empty state, error state, loading state, and acceptance criteria.`;
    const md = `# UI Decision Memo\n\n## Pattern\n${pattern}\n\n## Goal\n${goal}\n\n## Risk to avoid\n${risk}\n\n## Decision\n${decision}\n\n## Implementation checklist\n${checklist.map((x) => `- ${x}`).join('\n')}\n\n## AI/Codex handoff prompt\n${prompt}\n`;
    decisionEl.textContent = decision;
    checklistEl.innerHTML = '';
    checklist.forEach((item) => { const li = document.createElement('li'); li.textContent = item; checklistEl.appendChild(li); });
    promptEl.textContent = prompt;
    markdownEl.value = md;
  }

  mount.querySelector('[data-pro-generate]').addEventListener('click', build);
  mount.querySelector('[data-pro-copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(markdownEl.value); stateEl.textContent = text.copied; }
    catch (error) { markdownEl.focus(); markdownEl.select(); stateEl.textContent = text.failed; }
  });
  [patternEl, goalEl, riskEl].forEach((el) => el.addEventListener('input', build));
  build();
})();
