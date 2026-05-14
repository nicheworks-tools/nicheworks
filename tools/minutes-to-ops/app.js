(() => {
  'use strict';

  const TOOL = 'minutes-to-ops';
  const HISTORY_KEY = 'nw_mto_history_v2';
  const $ = (id) => document.getElementById(id);
  const els = {
    uiJA: $('uiJA'), uiEN: $('uiEN'),
    title: $('title'), subhead: $('subhead'), notes: $('notes'), meetingTitle: $('meetingTitle'), meetingDate: $('meetingDate'), participants: $('participants'),
    gen: $('genBtn'), clear: $('clearBtn'), paste: $('pasteExampleBtn'),
    todoBody: $('todoBody'), todoMeta: $('todoMeta'), decisions: $('decisions'), sop: $('sop'),
    csvPreview: $('csvPreview'), mdPreview: $('mdPreview'), dlCsv: $('dlCsvBtn'), dlMd: $('dlMdBtn'), copyMd: $('copyMdBtn'), copySop: $('copySopBtn'),
    hTodo: $('hTodo'), hDec: $('hDec'), hSop: $('hSop'), hExport: $('hExport'), exportState: $('exportState'),
    lblNotes: $('lblNotes'), lblMeeting: $('lblMeeting'), lblDate: $('lblDate'), lblParts: $('lblParts'), lblCsvPreview: $('lblCsvPreview'), lblMdPreview: $('lblMdPreview'),
    privacyNote: $('privacyNote'), ruleNote: $('ruleNote'), langNote: $('langNote'), faq: $('faq'), toast: $('toast'),
    proTitle: $('proTitle'), proLead: $('proLead'), saveHistory: $('saveHistoryBtn'), compareHistory: $('compareHistoryBtn'), downloadPack: $('downloadPackBtn'),
    historyTitle: $('historyTitle'), proHistory: $('proHistory'), githubTitle: $('githubTitle'), codexTitle: $('codexTitle'), handoffTitle: $('handoffTitle'),
    githubPreview: $('githubPreview'), codexPreview: $('codexPreview'), handoffPreview: $('handoffPreview'),
    copyGithub: $('copyGithubBtn'), downloadGithub: $('downloadGithubBtn'), copyCodex: $('copyCodexBtn'), downloadCodex: $('downloadCodexBtn'), copyHandoff: $('copyHandoffBtn'), downloadHandoff: $('downloadHandoffBtn')
  };

  const I18N = {
    JA: {
      title: '議事録→ToDo→決定事項→SOP', subhead: '議事録を“運用成果物”に整形（ルールベース / 翻訳なし）',
      lblNotes: '議事録（貼り付け）', lblMeeting: '会議名', lblDate: '日付', lblParts: '参加者',
      phNotes: '議事録を貼り付けてください', phMeeting: '例: 週次MTG / Sprint planning', phDate: '例: 2026-02-03', phParts: '例: A, B, C',
      gen: '生成', clear: 'クリア', pasteExample: '例を入れる', hTodo: 'ToDo', hDec: '決定事項', hSop: 'SOPドラフト', hExport: 'Export',
      exportState: 'CSV / Markdown保存は無料。Proでは履歴保存・比較・出力パックが使えます。', copyMd: 'Markdownをコピー', copySop: 'SOPをコピー', dlCsv: 'CSVを保存', dlMd: 'Markdownを保存',
      privacyNote: '抽出処理はブラウザ内で行います。ただし広告・解析タグは読み込まれます。公開前の重要情報は貼り付けないでください。',
      ruleNote: 'AI要約ではありません。Task / 担当 / 期限 / 決定 / 合意 などの語をもとに、ルールベースで抽出します。重要な内容は原文と照合してください。',
      langNote: 'UIだけ切り替えます。議事録本文は翻訳しません。出力見出しは入力言語を推定して切り替えます。',
      proTitle: 'Pro', proLead: '履歴保存・履歴比較・Pro出力パック・GitHub Issue・Codex依頼文・SOP handoffを共通Proで解放します。',
      saveHistory: '履歴保存', compareHistory: '履歴比較', downloadPack: 'Pro出力パック保存', historyTitle: '履歴 / 比較', githubTitle: 'GitHub Issue形式', codexTitle: 'Codex依頼文', handoffTitle: 'SOP handoff Markdown',
      pasteFirst: '議事録を貼り付けてください', examplePasted: '例を入力しました', csvSaved: 'CSVを保存しました', mdSaved: 'Markdownを保存しました', mdCopied: 'Markdownをコピーしました', sopCopied: 'SOPをコピーしました',
      copyEmpty: 'コピーする内容がありません', copyFailed: 'コピーに失敗しました', proNeeded: 'Pro専用copy/exportはNicheWorks Proで解放されます', historySaved: '履歴に保存しました', needTwo: '比較には履歴が2件以上必要です', packSaved: 'Pro出力パックを保存しました', copied: 'コピーしました', saved: '保存しました',
      historyEmpty: '保存履歴はありません', historyHeading: '保存履歴', previewPrefix: 'Previewサンプル', copyLabel: 'コピー', saveLabel: '保存', buyPro: 'Proを購入',
      faq: [
        ['AI要約ですか？', 'いいえ。キーワードとテンプレートによるルールベース抽出です。'],
        ['翻訳できますか？', 'できません。UI表示だけ切り替わり、本文は翻訳しません。'],
        ['無料とProの違いは？', '無料は議事録貼り付け、ToDo抽出、決定事項抽出、SOPドラフト、CSV/Markdown preview、基本CSV/Markdown保存です。Proは履歴保存、履歴比較、Pro出力パック保存、GitHub Issue形式、Codex依頼文、SOP handoff Markdownを使えます。'],
        ['購入後のPro状態は維持されますか？', '購入後、このブラウザではNicheWorks Proが有効になります。タブやブラウザを閉じても通常は維持されます。別端末、別ブラウザ、シークレットモード、サイトデータ削除後は再度有効化が必要です。']
      ]
    },
    EN: {
      title: 'Minutes → ToDos → Decisions → SOP', subhead: 'Turn minutes into operational artifacts (rule-based / no translation)',
      lblNotes: 'Meeting notes (paste)', lblMeeting: 'Meeting title', lblDate: 'Date', lblParts: 'Participants',
      phNotes: 'Paste meeting notes here', phMeeting: 'Example: Weekly sync / Sprint planning', phDate: 'Example: 2026-02-03', phParts: 'Example: A, B, C',
      gen: 'Generate', clear: 'Clear', pasteExample: 'Paste example', hTodo: 'ToDos', hDec: 'Decisions', hSop: 'SOP draft', hExport: 'Export',
      exportState: 'CSV / Markdown downloads are free. Pro adds history, comparison, and export packs.', copyMd: 'Copy Markdown', copySop: 'Copy SOP', dlCsv: 'Download CSV', dlMd: 'Download Markdown',
      privacyNote: 'Extraction runs in your browser. Ads and analytics scripts may still load. Do not paste unpublished important information.',
      ruleNote: 'This is not AI summarization. It uses rule-based extraction from Task, Owner, Due, Decision, and Agreed. Check important items against the original notes.',
      langNote: 'The UI changes labels only. Pasted notes are not translated. Output headings are inferred from the input language.',
      proTitle: 'Pro', proLead: 'Common Pro unlocks history, comparison, Pro output packs, GitHub Issue output, Codex prompts, and SOP handoff Markdown.',
      saveHistory: 'Save history', compareHistory: 'Compare history', downloadPack: 'Save Pro output pack', historyTitle: 'History / Compare', githubTitle: 'GitHub Issue format', codexTitle: 'Codex request prompt', handoffTitle: 'SOP handoff Markdown',
      pasteFirst: 'Paste notes first', examplePasted: 'Example pasted', csvSaved: 'CSV downloaded', mdSaved: 'Markdown downloaded', mdCopied: 'Markdown copied', sopCopied: 'SOP copied',
      copyEmpty: 'Nothing to copy', copyFailed: 'Copy failed', proNeeded: 'Pro-only copy/export unlocks with NicheWorks Pro', historySaved: 'Saved to history', needTwo: 'At least two history items are required', packSaved: 'Pro output pack downloaded', copied: 'Copied', saved: 'Saved',
      historyEmpty: 'No saved history', historyHeading: 'Saved history', previewPrefix: 'Preview sample', copyLabel: 'Copy', saveLabel: 'Save', buyPro: 'Buy Pro',
      faq: [
        ['Is this AI summarization?', 'No. It is rule-based extraction using keywords and templates.'],
        ['Can it translate notes?', 'No. UI labels can switch languages, but pasted notes are not translated.'],
        ['What is free vs Pro?', 'Free includes pasted minutes, ToDo extraction, decision extraction, SOP draft, CSV/Markdown previews, and basic CSV/Markdown downloads. Pro adds history, comparison, Pro output packs, GitHub Issue output, Codex prompts, and SOP handoff Markdown.'],
        ['Does Pro stay active after purchase?', 'After purchase, NicheWorks Pro becomes active in this browser. It usually remains active after closing tabs or the browser. You need to activate again on another device, another browser, private browsing, or after clearing site data.']
      ]
    }
  };

  const EXAMPLES = {
    JA: '週次MTG\n決定: 次スプリントはP0を優先\nTask: LPの見出し修正 担当: A 期限: 2026-02-05\nTask: GA4イベント確認 担当: B 期限: 2026-02-06\n懸念: モバイルで一覧が長すぎる\n決定: 詳細は全画面シートにする',
    EN: 'Weekly sync\nDecision: Prioritise P0 items next sprint\nTask: Fix landing page headline Owner: A Due: Feb 5\nAction: Verify GA4 events Owner: B Due: Feb 6\nRisk: Mobile list view is too long\nAgreed: Use full-screen sheet for details'
  };

  let UI = 'JA';
  let todos = [];
  let decisions = [];
  let sop = '';
  let markdown = '';
  let githubIssue = '';
  let codexPrompt = '';
  let handoffMarkdown = '';

  function text(el, value) { if (el) el.textContent = value; }
  function placeholder(el, value) { if (el) el.placeholder = value; }
  function isProActive() { return document.documentElement.dataset.proActive === 'true'; }
  function toast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.style.display = 'block';
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { els.toast.style.display = 'none'; }, 1800);
  }
  function event(name, params) {
    try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (error) {}
  }

  function setUI(lang) {
    UI = lang;
    const t = I18N[lang];
    document.documentElement.lang = lang === 'JA' ? 'ja' : 'en';
    if (els.uiJA) els.uiJA.disabled = lang === 'JA';
    if (els.uiEN) els.uiEN.disabled = lang === 'EN';
    ['title', 'subhead', 'lblNotes', 'lblMeeting', 'lblDate', 'lblParts', 'hTodo', 'hDec', 'hSop', 'hExport', 'exportState', 'copyMd', 'copySop', 'dlCsv', 'dlMd', 'privacyNote', 'ruleNote', 'langNote', 'proTitle', 'proLead', 'saveHistory', 'compareHistory', 'downloadPack', 'historyTitle', 'githubTitle', 'codexTitle', 'handoffTitle'].forEach((key) => text(els[key], t[key]));
    text(els.gen, t.gen); text(els.clear, t.clear); text(els.paste, t.pasteExample);
    [els.copyGithub, els.copyCodex, els.copyHandoff].forEach((button) => text(button, t.copyLabel));
    [els.downloadGithub, els.downloadCodex, els.downloadHandoff].forEach((button) => text(button, t.saveLabel));
    document.querySelectorAll('[data-pro-buy]').forEach((link) => text(link, t.buyPro));
    text(els.lblCsvPreview, 'CSV preview'); text(els.lblMdPreview, 'Markdown preview');
    placeholder(els.notes, t.phNotes); placeholder(els.meetingTitle, t.phMeeting); placeholder(els.meetingDate, t.phDate); placeholder(els.participants, t.phParts);
    renderFAQ(); renderHistory(); renderProOutputs();
    if (window.NWMinutesToOpsPro && typeof window.NWMinutesToOpsPro.refresh === 'function') window.NWMinutesToOpsPro.refresh();
    event('tool_open', { tool_slug: TOOL, lang: UI });
  }

  function renderFAQ() {
    if (!els.faq) return;
    els.faq.textContent = '';
    I18N[UI].faq.forEach(([summary, body]) => {
      const details = document.createElement('details');
      const s = document.createElement('summary');
      const p = document.createElement('p');
      s.textContent = summary;
      p.textContent = body;
      details.append(s, p);
      els.faq.appendChild(details);
    });
  }

  function meta() {
    return {
      title: (els.meetingTitle?.value || '').trim(),
      date: (els.meetingDate?.value || '').trim(),
      participants: (els.participants?.value || '').trim()
    };
  }
  function isJapanese(value) {
    const chars = String(value || '').match(/[\u3040-\u30ff\u4e00-\u9faf]/g) || [];
    return chars.length / Math.max(1, String(value || '').length) > 0.08;
  }
  function lines(value) { return String(value || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean); }
  function unique(array, key = (x) => String(x).toLowerCase().replace(/\s+/g, ' ')) {
    const seen = new Set();
    const out = [];
    array.forEach((item) => {
      const value = key(item);
      if (!seen.has(value)) { seen.add(value); out.push(item); }
    });
    return out;
  }

  function extractTodos(sourceLines) {
    const out = [];
    sourceLines.forEach((line) => {
      if (out.length >= 30 || !/(TODO|ToDo|Task|Action|We will|Need to|Follow up|Owner:|Due:|やる|対応|確認|作る|修正|送る|依頼|担当|期限)/i.test(line)) return;
      out.push({
        task: line,
        owner: (line.match(/(?:担当|Owner)\s*[:：]\s*([^\s]+)/) || [])[1] || '',
        due: (line.match(/(?:期限|Due)\s*[:：]\s*([0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2}|[0-9]{1,2}\/[0-9]{1,2}|[A-Za-z]{3,9}\s+\d{1,2})/) || [])[1] || '',
        priority: (line.match(/(?:優先|Priority)\s*[:：]\s*(High|Med|Low|P0|P1|P2)/i) || [])[1] || '',
        status: ''
      });
    });
    return unique(out, (item) => item.task.toLowerCase().replace(/\s+/g, ' '));
  }
  function extractDecisions(sourceLines) {
    return unique(sourceLines.filter((line) => /(決定|合意|方針|採用|却下|Decision|Agreed|We decided|Conclusion)/i.test(line)).slice(0, 20));
  }

  function buildSop(currentMeta, currentTodos, currentDecisions, raw) {
    const ja = isJapanese(raw);
    const title = currentMeta.title || (ja ? '（会議名未入力）' : '(No meeting title)');
    const date = currentMeta.date || (ja ? '（日付未入力）' : '(No date)');
    const participants = currentMeta.participants || (ja ? '（参加者未入力）' : '(No participants)');
    const risks = lines(raw).filter((line) => /(リスク|懸念|課題|blocker|risk|issue)/i.test(line)).slice(0, 6);
    const steps = currentTodos.slice(0, 10).map((item, index) => `${index + 1}. ${item.task}${item.owner ? ` (${item.owner})` : ''}${item.due ? ` [${item.due}]` : ''}`);
    return ja ? [
      '# SOPドラフト', '## 目的', `${title} の決定事項とToDoを運用手順に落とし込む。`, '',
      '## 範囲', `対象: ${participants} / 日付: ${date}`, '',
      '## 手順', steps.length ? steps.join('\n') : '（ToDoが見つかりませんでした）', '',
      '## チェック', currentDecisions.length ? currentDecisions.map((item) => `- ${item}`).join('\n') : '- （決定事項なし）', '',
      '## 例外・リスク', risks.length ? risks.map((item) => `- ${item}`).join('\n') : '- （記載なし）'
    ].join('\n') : [
      '# SOP Draft', '## Purpose', `Turn outcomes of "${title}" into executable steps.`, '',
      '## Scope', `Participants: ${participants} / Date: ${date}`, '',
      '## Procedure', steps.length ? steps.join('\n') : '(No ToDos found.)', '',
      '## Checklist', currentDecisions.length ? currentDecisions.map((item) => `- ${item}`).join('\n') : '- (No decisions found)', '',
      '## Exceptions / Risks', risks.length ? risks.map((item) => `- ${item}`).join('\n') : '- (none)'
    ].join('\n');
  }

  function renderTodos(items) {
    if (!els.todoBody) return;
    els.todoBody.textContent = '';
    if (!items.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.className = 'nw-muted';
      td.textContent = '—';
      tr.appendChild(td);
      els.todoBody.appendChild(tr);
      return;
    }
    items.forEach((item) => {
      const tr = document.createElement('tr');
      ['task', 'owner', 'due', 'priority', 'status'].forEach((key) => {
        const td = document.createElement('td');
        td.textContent = item[key] || '';
        tr.appendChild(td);
      });
      els.todoBody.appendChild(tr);
    });
  }

  function csvCell(value) {
    const str = String(value || '');
    return /[,"\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }
  function makeCsv(items, options = {}) {
    const rows = [['task', 'owner', 'due', 'priority', 'status'].join(',')];
    items.forEach((item) => rows.push([item.task, item.owner, item.due, item.priority, item.status].map(csvCell).join(',')));
    return (options.bom ? '\uFEFF' : '') + rows.join(options.nl || '\n');
  }
  function pipe(value) { return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' '); }
  function makeMarkdown(currentMeta, currentTodos, currentDecisions, currentSop, raw) {
    const out = [
      '# Minutes to Ops', `- Timestamp: ${new Date().toLocaleString()}`, `- Title: ${currentMeta.title || '-'}`,
      `- Date: ${currentMeta.date || '-'}`, `- Participants: ${currentMeta.participants || '-'}`,
      `- Headings: ${isJapanese(raw) ? 'JA' : 'EN'} (content not translated)`, '- Extraction: rule-based keyword/template extraction, not AI summarization', '',
      '## Decisions', currentDecisions.length ? currentDecisions.map((item) => `- ${item}`).join('\n') : '- (none)', '', '## ToDos'
    ];
    if (currentTodos.length) {
      out.push('| Task | Owner | Due | Priority | Status |', '|---|---|---|---|---|');
      currentTodos.forEach((item) => out.push(`| ${pipe(item.task)} | ${pipe(item.owner)} | ${pipe(item.due)} | ${pipe(item.priority)} | ${pipe(item.status)} |`));
    } else {
      out.push('- (none)');
    }
    out.push('', '## SOP', '```', currentSop, '```');
    return out.join('\n');
  }

  function makeGithubIssue(currentMeta) {
    const title = currentMeta.title || 'Minutes follow-up';
    return [
      `## Summary`,
      `Operational follow-up generated from: ${title}`,
      '',
      `## Decisions`,
      decisions.length ? decisions.map((item) => `- ${item}`).join('\n') : '- none',
      '',
      `## Tasks`,
      todos.length ? todos.map((item) => `- [ ] ${item.task}${item.owner ? ` / owner: ${item.owner}` : ''}${item.due ? ` / due: ${item.due}` : ''}`).join('\n') : '- [ ] Add first task',
      '',
      `## Acceptance criteria`,
      '- Decisions are reflected in the SOP draft.',
      '- Each owner confirms their next action.',
      '- Risks are reviewed before handoff.'
    ].join('\n');
  }
  function makeCodexPrompt(currentMeta) {
    return [
      'You are working in the NicheWorks repository.',
      '',
      `Context: ${currentMeta.title || 'Meeting follow-up'} / ${currentMeta.date || 'date unknown'}`,
      '',
      'Please implement the operational changes below without inventing missing data.',
      '',
      'Decisions:',
      decisions.length ? decisions.map((item) => `- ${item}`).join('\n') : '- none captured',
      '',
      'Tasks:',
      todos.length ? todos.map((item) => `- ${item.task}${item.owner ? ` (owner: ${item.owner})` : ''}${item.due ? ` (due: ${item.due})` : ''}`).join('\n') : '- none captured',
      '',
      'Deliverables:',
      '- Summarize changed files.',
      '- Run relevant checks.',
      '- Report any assumptions or missing inputs.'
    ].join('\n');
  }
  function makeHandoff(currentMeta) {
    return [
      '# SOP Handoff',
      '',
      `- Meeting: ${currentMeta.title || '-'}`,
      `- Date: ${currentMeta.date || '-'}`,
      `- Participants: ${currentMeta.participants || '-'}`,
      '',
      sop,
      '',
      '## Handoff checklist',
      '- [ ] Owners reviewed assigned ToDos.',
      '- [ ] Decisions are linked from the issue tracker or project board.',
      '- [ ] SOP risks and exceptions were acknowledged.'
    ].join('\n');
  }

  function stamp() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }
  function download(name, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 0);
  }
  async function copy(value, message) {
    const textValue = String(value || '');
    if (!textValue.trim()) return toast(I18N[UI].copyEmpty);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textValue);
        return toast(message);
      }
    } catch (error) {}
    const textarea = document.createElement('textarea');
    textarea.value = textValue;
    textarea.readOnly = true;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try { toast(document.execCommand('copy') ? message : I18N[UI].copyFailed); } finally { textarea.remove(); }
  }

  function generate(silent = false) {
    const raw = (els.notes?.value || '').trim();
    event('tool_run', { tool_slug: TOOL, lang: UI });
    if (!raw) {
      clearOutputs();
      if (!silent) toast(I18N[UI].pasteFirst);
      return false;
    }
    const sourceLines = lines(raw);
    const currentMeta = meta();
    todos = extractTodos(sourceLines);
    decisions = extractDecisions(sourceLines);
    sop = buildSop(currentMeta, todos, decisions, raw);
    markdown = makeMarkdown(currentMeta, todos, decisions, sop, raw);
    githubIssue = makeGithubIssue(currentMeta);
    codexPrompt = makeCodexPrompt(currentMeta);
    handoffMarkdown = makeHandoff(currentMeta);
    renderTodos(todos);
    text(els.todoMeta, `${todos.length} todos / ${decisions.length} decisions`);
    text(els.decisions, decisions.length ? decisions.map((item) => `- ${item}`).join('\n') : '—');
    text(els.sop, sop);
    if (els.csvPreview) {
      const rows = makeCsv(todos).split('\n');
      els.csvPreview.value = rows.slice(0, 21).join('\n') + (rows.length > 21 ? '\n...' : '');
    }
    if (els.mdPreview) els.mdPreview.value = markdown;
    renderProOutputs();
    return true;
  }
  function ensureGenerated() { return Boolean((els.notes?.value || '').trim() && (markdown || generate(true))); }

  function clearOutputs() {
    todos = []; decisions = []; sop = ''; markdown = ''; githubIssue = ''; codexPrompt = ''; handoffMarkdown = '';
    renderTodos([]);
    text(els.todoMeta, '—'); text(els.decisions, '—'); text(els.sop, '—');
    if (els.csvPreview) els.csvPreview.value = '';
    if (els.mdPreview) els.mdPreview.value = '';
    renderProOutputs();
  }

  function previewSample(label) {
    return `# ${I18N[UI].previewPrefix}: ${label}\n\n- ${I18N[UI].pasteFirst}\n- ${I18N[UI].proNeeded}`;
  }
  function renderProOutputs() {
    if (els.githubPreview) els.githubPreview.value = githubIssue || previewSample(I18N[UI].githubTitle);
    if (els.codexPreview) els.codexPreview.value = codexPrompt || previewSample(I18N[UI].codexTitle);
    if (els.handoffPreview) els.handoffPreview.value = handoffMarkdown || previewSample(I18N[UI].handoffTitle);
  }
  function requirePro() {
    if (isProActive()) return true;
    toast(I18N[UI].proNeeded);
    return false;
  }

  function history() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]').filter(Boolean); } catch (error) { return []; }
  }
  function setHistory(items) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20))); } catch (error) {}
  }
  function snapshot() {
    const currentMeta = meta();
    return {
      id: Date.now(), savedAt: new Date().toISOString(), title: currentMeta.title || 'Untitled', date: currentMeta.date || '', participants: currentMeta.participants || '',
      todos, decisions, sop, markdown, csv: makeCsv(todos), githubIssue, codexPrompt, handoffMarkdown
    };
  }
  function renderHistory(content) {
    if (!els.proHistory) return;
    if (content) { els.proHistory.textContent = content; return; }
    const items = history();
    els.proHistory.textContent = items.length
      ? [I18N[UI].historyHeading, ...items.slice(0, 8).map((item, index) => `${index + 1}. ${item.title} / ${item.date || '-'} / ${(item.todos || []).length} todos / ${(item.decisions || []).length} decisions`)].join('\n')
      : I18N[UI].historyEmpty;
  }
  function saveHistory() {
    if (!requirePro()) return;
    if (!ensureGenerated()) return toast(I18N[UI].pasteFirst);
    setHistory([snapshot(), ...history()]);
    renderHistory();
    event('pro_feature_use', { tool_slug: TOOL, feature: 'history_save' });
    toast(I18N[UI].historySaved);
  }
  function compareHistory() {
    if (!requirePro()) return;
    const items = history();
    if (items.length < 2) return toast(I18N[UI].needTwo);
    const [latest, previous] = items;
    const latestTasks = new Set((latest.todos || []).map((item) => item.task));
    const previousTasks = new Set((previous.todos || []).map((item) => item.task));
    const added = [...latestTasks].filter((item) => !previousTasks.has(item));
    const removed = [...previousTasks].filter((item) => !latestTasks.has(item));
    renderHistory([
      `Compare: ${latest.title} ← ${previous.title}`,
      `Saved: ${latest.savedAt} ← ${previous.savedAt}`,
      `ToDos: ${(latest.todos || []).length} ← ${(previous.todos || []).length}`,
      `Decisions: ${(latest.decisions || []).length} ← ${(previous.decisions || []).length}`,
      '', 'Added tasks:', added.length ? added.map((item) => `+ ${item}`).join('\n') : '- none',
      '', 'Removed tasks:', removed.length ? removed.map((item) => `- ${item}`).join('\n') : '- none'
    ].join('\n'));
    event('pro_feature_use', { tool_slug: TOOL, feature: 'history_compare' });
  }
  function outputPack() {
    if (!requirePro()) return;
    if (!ensureGenerated()) return toast(I18N[UI].pasteFirst);
    download(`minutes-to-ops-pro-pack-${stamp()}.json`, JSON.stringify(snapshot(), null, 2), 'application/json;charset=utf-8');
    event('pro_feature_use', { tool_slug: TOOL, feature: 'export_pack' });
    toast(I18N[UI].packSaved);
  }
  function proCopy(value) {
    if (!requirePro()) return;
    if (!ensureGenerated()) return toast(I18N[UI].pasteFirst);
    copy(value(), I18N[UI].copied);
  }
  function proDownload(filename, value) {
    if (!requirePro()) return;
    if (!ensureGenerated()) return toast(I18N[UI].pasteFirst);
    download(filename, value(), 'text/markdown;charset=utf-8');
    toast(I18N[UI].saved);
  }

  els.uiJA?.addEventListener('click', () => setUI('JA'));
  els.uiEN?.addEventListener('click', () => setUI('EN'));
  els.gen?.addEventListener('click', () => generate(false));
  els.clear?.addEventListener('click', () => {
    [els.notes, els.meetingTitle, els.meetingDate, els.participants].forEach((el) => { if (el) el.value = ''; });
    clearOutputs();
  });
  els.paste?.addEventListener('click', () => { if (els.notes) els.notes.value = EXAMPLES[UI]; toast(I18N[UI].examplePasted); });
  els.dlCsv?.addEventListener('click', () => { if (!ensureGenerated()) return toast(I18N[UI].pasteFirst); download(`minutes-to-ops-todos-${stamp()}.csv`, makeCsv(todos, { bom: true, nl: '\r\n' }), 'text/csv;charset=utf-8'); toast(I18N[UI].csvSaved); });
  els.dlMd?.addEventListener('click', () => { if (!ensureGenerated()) return toast(I18N[UI].pasteFirst); download(`minutes-to-ops-${stamp()}.md`, markdown, 'text/markdown;charset=utf-8'); toast(I18N[UI].mdSaved); });
  els.copyMd?.addEventListener('click', () => { if (!ensureGenerated()) return toast(I18N[UI].pasteFirst); copy(markdown, I18N[UI].mdCopied); });
  els.copySop?.addEventListener('click', () => { if (!ensureGenerated()) return toast(I18N[UI].pasteFirst); copy(sop, I18N[UI].sopCopied); });
  els.saveHistory?.addEventListener('click', saveHistory);
  els.compareHistory?.addEventListener('click', compareHistory);
  els.downloadPack?.addEventListener('click', outputPack);
  els.copyGithub?.addEventListener('click', () => proCopy(() => githubIssue));
  els.downloadGithub?.addEventListener('click', () => proDownload(`minutes-to-ops-github-issue-${stamp()}.md`, () => githubIssue));
  els.copyCodex?.addEventListener('click', () => proCopy(() => codexPrompt));
  els.downloadCodex?.addEventListener('click', () => proDownload(`minutes-to-ops-codex-request-${stamp()}.md`, () => codexPrompt));
  els.copyHandoff?.addEventListener('click', () => proCopy(() => handoffMarkdown));
  els.downloadHandoff?.addEventListener('click', () => proDownload(`minutes-to-ops-sop-handoff-${stamp()}.md`, () => handoffMarkdown));
  window.addEventListener('nw-pro-status-change', () => renderProOutputs());

  setUI('JA');
  clearOutputs();
})();
