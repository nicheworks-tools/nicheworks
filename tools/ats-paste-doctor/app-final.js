(() => {
  'use strict';

  const STRIPE_LINK = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const PRO_KEY = 'nw_pro_ats_paste_doctor';
  const TEMPLATE_PREFIX = 'nw_ats_paste_doctor_template_';
  const HISTORY_KEY = 'nw_ats_paste_doctor_history';
  const $ = (id) => document.getElementById(id);

  const el = {
    input: $('inputText'), output: $('outputText'), preview: $('previewBox'),
    process: $('processBtn'), copy: $('copyBtn'), download: $('downloadBtn'), reset: $('resetBtn'),
    limit: $('limitInput'), limitMeta: $('limitMeta'), charMeta: $('charMeta'),
    counts: $('countsGrid'), warnings: $('warningsList'), error: $('errorBox'), toast: $('toast'),
    progress: $('progressWrap'), proTools: $('proTools'), proToolsNote: $('proToolsNote'),
    proCard: $('proCard'), proBadge: $('proBadge'), buy: $('buyProLink'),
    exportPdf: $('exportPdfBtn'), historySave: $('historySaveBtn'), historyClear: $('historyClearBtn'), historyList: $('historyList'),
    langJa: $('langJa'), langEn: $('langEn'),
  };

  let currentLang = navigator.language && navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
  let currentMode = 'safe';
  let toastTimer = 0;

  const msg = {
    en: {
      'app.title': 'ATS Paste Doctor',
      'steps.title': 'Quick steps', 'steps.item1': 'Paste your text.', 'steps.item2': 'Pick a mode, then click Generate output.', 'steps.item3': 'Copy or download, then check the 2-line preview.',
      'freepro.title': 'Free vs Pro (quick)', 'freepro.free.title': 'Free', 'freepro.free.item1': 'Formatting fixes (ATS-friendly / keep line breaks / clean)', 'freepro.free.item2': 'Counts + warnings for risky characters', 'freepro.free.item3': 'Copy / TXT download + 2-line preview',
      'freepro.pro.title': 'Pro', 'freepro.pro.item1': 'Hide ads in the UI', 'freepro.pro.item2': 'Higher text limit', 'freepro.pro.item3': 'Templates / history / PDF export',
      'input.title': 'Input', 'input.label': 'Input', 'input.placeholder': 'Paste your text here (job summary, cover letter, bullets)…', 'input.hint': 'May take up to a few seconds.',
      'options.title': 'Options', 'options.mode.label': 'Output mode', 'options.mode.keep': 'Keep line breaks', 'options.mode.clean': 'Clean', 'options.limit.label': 'Character limit (optional)', 'options.limit.placeholder': 'e.g. 1000',
      'actions.process': 'Generate output', 'actions.copy': 'Copy output', 'actions.download': 'Download .txt', 'actions.reset': 'Reset', 'actions.exportPdf': 'Export PDF',
      'results.counts.title': 'Counts', 'results.warnings.title': 'Warnings', 'output.title': 'Output', 'output.label': 'Output', 'progress.label': 'Processing…',
      'preview.title': 'ATS-style preview (2-line textbox)',
      'pro.title': 'Unlock Pro ($2.99 one-time)', 'pro.unlocked': 'Pro unlocked', 'pro.desc': 'Hide ads and unlock templates, history, and PDF export. Pro status is stored locally on this device.',
      'pro.feature.ads': 'Hide ads in the UI', 'pro.feature.limit': 'Higher text limit', 'pro.feature.presets': 'Templates / history / PDF export', 'pro.cta': 'Buy Pro', 'pro.howto': 'After payment, return to this page with ?pro=1 to enable Pro on this device.',
      'protools.title': 'Pro tools', 'protools.note': 'Available with Pro', 'protools.pdf.title': 'PDF export', 'protools.pdf.note': 'Open a printable view to save as PDF.', 'protools.templates.title': 'Templates', 'protools.templates.note': 'Save the current output into a slot on this device.', 'protools.history.title': 'History', 'protools.history.note': 'Save outputs locally to revisit later. Avoid saving sensitive personal text unless needed.',
      'templates.slot1': 'Slot 1', 'templates.slot2': 'Slot 2', 'templates.slot3': 'Slot 3', 'templates.save': 'Save', 'templates.load': 'Load', 'history.save': 'Save to history', 'history.clear': 'Clear all',
      'donate.text': 'If this tool helped, consider supporting continued development.', 'donate.ofuse': '💌 OFUSE', 'donate.kofi': '☕ Ko-fi', 'faq.title': 'FAQ', 'footer.line1': '© NicheWorks — Small Web Tools for Boring Tasks', 'footer.line2': 'This site may contain ads. Information accuracy is not guaranteed. Always verify official sources.', 'footer.home': 'nicheworks.app',
      safeMode: 'ATS-friendly plain text', copied: 'Copied', copyFailed: 'Copy failed', downloaded: 'TXT downloaded', emptyInput: 'Input is empty. Paste your text first.', emptyOutput: 'Generate output first.', tooLong: 'Text is too long. Please split it into smaller chunks.', proLocked: 'Pro feature locked. Open the payment link, then return with ?pro=1 after payment.', noTemplate: 'This slot is empty.', saved: 'Saved', loaded: 'Loaded', cleared: 'Cleared', deleted: 'Deleted', noHistory: 'No history yet.', pdfTip: 'Press Ctrl/Cmd+P to save as PDF.',
      previewNote: 'This is only a small-box readability preview. It does not guarantee how every ATS or job form will display the text.',
      proReady: 'Live Stripe payment link is connected. After payment, return with ?pro=1 to enable Pro on this device.', proActive: 'Pro is enabled on this device.', proToolsLocked: 'Pro tools are locked until purchase. After payment, open this page with ?pro=1.', proToolsActive: 'Pro tools are unlocked on this device.',
      faqQ1: 'Will this always display correctly in every ATS?', faqA1: 'No. ATS and job forms differ. Use this as a plain-text cleanup aid and confirm the result inside the actual form before submitting.', faqQ2: 'Is my pasted text uploaded?', faqA2: 'No. Formatting and checks run in your browser. The page may still load ads and analytics tags for site operation.', faqQ3: 'Can I paste personal application details?', faqA3: 'You can, but it is safer to redact names, addresses, phone numbers, email addresses, employer names, and detailed work history when possible.', faqQ4: 'What is ATS-friendly plain text?', faqA4: 'It reduces special spacing, fragile bullet formatting, and hidden characters so the text is easier to paste and review in application forms.', faqQ5: 'Is text history saved?', faqA5: 'The main cleanup flow does not upload text. Pro templates/history, when used, are saved only in this browser on this device.', relatedTitle: 'Related tools', usage: 'Usage', cover: 'Cover Letter Lite', cold: 'Cold Email Requirement Checker', redactor: 'API Key Token Redactor', linebreak: 'LineBreak Doctor'
    },
    ja: {
      'app.title': 'ATS Paste Doctor',
      'steps.title': 'クイック手順', 'steps.item1': '文章を貼り付けます。', 'steps.item2': 'モードを選び、「出力を作る」を押します。', 'steps.item3': 'コピー/保存して、2行プレビューで確認します。',
      'freepro.title': 'Free / Pro の違い（短く）', 'freepro.free.title': 'Free', 'freepro.free.item1': '整形（ATS向け簡易整形 / 改行保持 / 毒抜き）', 'freepro.free.item2': 'カウント + 警告で崩れリスクを確認', 'freepro.free.item3': 'コピー / TXT保存 + 2行プレビュー',
      'freepro.pro.title': 'Pro', 'freepro.pro.item1': 'UI上の広告を非表示', 'freepro.pro.item2': '文字数上限アップ', 'freepro.pro.item3': 'テンプレ / 履歴 / PDF出力',
      'input.title': '入力', 'input.label': '入力', 'input.placeholder': 'ここに文章を貼り付け（職務要約・志望動機・箇条書きなど）…', 'input.hint': '端末によっては数秒かかる場合があります。',
      'options.title': 'オプション', 'options.mode.label': '出力モード', 'options.mode.keep': '改行保持', 'options.mode.clean': '毒抜き', 'options.limit.label': '文字数上限（任意）', 'options.limit.placeholder': '例：1000',
      'actions.process': '出力を作る', 'actions.copy': '出力をコピー', 'actions.download': 'TXTで保存', 'actions.reset': 'リセット', 'actions.exportPdf': 'PDFで保存',
      'results.counts.title': 'カウント', 'results.warnings.title': '警告', 'output.title': '出力', 'output.label': '出力', 'progress.label': '処理中…',
      'preview.title': 'ATS風プレビュー（2行テキストボックス）',
      'pro.title': 'Pro解放（買い切り $2.99）', 'pro.unlocked': 'Pro解放済み', 'pro.desc': '広告を非表示にし、テンプレ・履歴・PDF出力を使えるようにします。Pro状態はこの端末内に保存されます。',
      'pro.feature.ads': '広告をUI上で非表示', 'pro.feature.limit': '長文の上限アップ', 'pro.feature.presets': 'テンプレ / 履歴 / PDF出力', 'pro.cta': 'Proを購入する', 'pro.howto': '決済後、このページに ?pro=1 を付けて戻るとこの端末でProが有効になります。',
      'protools.title': 'Pro機能', 'protools.note': 'Proで利用可能', 'protools.pdf.title': 'PDF出力', 'protools.pdf.note': '印刷用の表示を開いてPDF保存します。', 'protools.templates.title': 'テンプレ', 'protools.templates.note': '現在の出力をこの端末のスロットに保存します。', 'protools.history.title': '履歴', 'protools.history.note': '出力をこの端末内に保存して後で呼び出せます。個人情報を含む文章は必要がない限り保存しないでください。',
      'templates.slot1': 'スロット1', 'templates.slot2': 'スロット2', 'templates.slot3': 'スロット3', 'templates.save': '保存', 'templates.load': '読込', 'history.save': '履歴に保存', 'history.clear': '全削除',
      'donate.text': '役に立ったら開発継続のご支援をいただけると助かります。', 'donate.ofuse': '💌 OFUSE', 'donate.kofi': '☕ Ko-fi', 'faq.title': 'よくある質問', 'footer.line1': '© NicheWorks — Small Web Tools for Boring Tasks', 'footer.line2': '当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。', 'footer.home': 'nicheworks.app',
      safeMode: 'ATS向け簡易整形', copied: 'コピーしました', copyFailed: 'コピーできませんでした', downloaded: 'TXTを保存しました', emptyInput: '入力が空です。文章を貼り付けてから実行してください。', emptyOutput: '先に出力を作成してください。', tooLong: '文字数が多すぎます。短く分けて試してください。', proLocked: 'Pro限定機能です。購入後に ?pro=1 で戻ると解放されます。', noTemplate: 'このスロットは空です。', saved: '保存しました', loaded: '読み込みました', cleared: '削除しました', deleted: '削除しました', noHistory: '履歴はまだありません。', pdfTip: 'Ctrl/Cmd+P でPDF保存できます。',
      previewNote: 'この2行プレビューは狭い入力欄での見え方の参考です。すべてのATS・応募フォームでの表示を保証するものではありません。',
      proReady: '本番Stripe決済リンク接続済みです。決済後は ?pro=1 付きで戻ると、この端末でProが有効になります。', proActive: 'この端末でProが有効です。', proToolsLocked: 'Pro機能は購入後に ?pro=1 で解放します。', proToolsActive: 'この端末でPro機能が使えます。',
      faqQ1: 'この出力ならATSで必ず崩れませんか？', faqA1: 'いいえ。応募フォームやATSごとに仕様が異なるため、送信前に実際のフォームで確認してください。', faqQ2: '入力した文章は送信されますか？', faqA2: 'いいえ。整形とチェックはブラウザ内で行います。ただしページ表示のため広告・解析タグは読み込まれる場合があります。', faqQ3: '職務経歴や個人情報を貼ってよいですか？', faqA3: '必要に応じて氏名、住所、電話番号、メール、応募先名、職歴詳細などを伏せることを推奨します。', faqQ4: 'ATS向け簡易整形とは何ですか？', faqA4: '特殊な空白、崩れやすい箇条書き、不可視文字などを減らし、応募フォームに貼りやすいプレーンテキストへ寄せる処理です。', faqQ5: '履歴は保存されますか？', faqA5: '通常の整形処理では本文はアップロードされません。Proのテンプレ・履歴を使った場合のみ、このブラウザのlocalStorageに保存されます。', relatedTitle: '関連ツール', usage: '使い方', cover: 'Cover Letter Lite', cold: 'Cold Email Requirement Checker', redactor: 'API Key Token Redactor', linebreak: 'LineBreak Doctor'
    }
  };

  const tr = (key) => (msg[currentLang] && msg[currentLang][key]) || msg.en[key] || key;

  function setText(selector, key) { document.querySelectorAll(selector).forEach((node) => { node.textContent = tr(key); }); }
  function toast(text) { if (!el.toast) return; el.toast.textContent = text; el.toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.toast.hidden = true; }, 2200); }
  function error(text) { if (!el.error) return; el.error.textContent = text; el.error.hidden = false; }
  function clearError() { if (el.error) { el.error.textContent = ''; el.error.hidden = true; } }
  function isPro() { return localStorage.getItem(PRO_KEY) === '1' || !!localStorage.getItem('nw_pro_key'); }

  function setLang(lang) {
    currentLang = lang === 'ja' ? 'ja' : 'en';
    document.documentElement.lang = currentLang;
    el.langJa?.classList.toggle('is-active', currentLang === 'ja');
    el.langEn?.classList.toggle('is-active', currentLang === 'en');
    document.querySelectorAll('[data-i18n]').forEach((node) => { const v = tr(node.dataset.i18n); if (v) node.textContent = v; });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { const v = tr(node.dataset.i18nPlaceholder); if (v) node.setAttribute('placeholder', v); });
    setText('[data-atspd="subtitle"]', currentLang === 'ja' ? 'subtitleJa' : 'subtitleEn');
    const safe = $('modeSafe'); if (safe) safe.textContent = tr('safeMode');
    setText('[data-atspd="noticeTitle"]', currentLang === 'ja' ? 'noticeTitleJa' : 'noticeTitleEn');
    setText('[data-atspd="noticeBody"]', currentLang === 'ja' ? 'noticeBodyJa' : 'noticeBodyEn');
    setText('[data-atspd="guaranteeTitle"]', currentLang === 'ja' ? 'guaranteeTitleJa' : 'guaranteeTitleEn');
    setText('[data-atspd="guaranteeBody"]', currentLang === 'ja' ? 'guaranteeBodyJa' : 'guaranteeBodyEn');
    setText('[data-atspd="previewNote"]', 'previewNote');
    setText('[data-atspd="faqQ1"]', 'faqQ1'); setText('[data-atspd="faqA1"]', 'faqA1');
    setText('[data-atspd="faqQ2"]', 'faqQ2'); setText('[data-atspd="faqA2"]', 'faqA2');
    setText('[data-atspd="faqQ3"]', 'faqQ3'); setText('[data-atspd="faqA3"]', 'faqA3');
    setText('[data-atspd="faqQ4"]', 'faqQ4'); setText('[data-atspd="faqA4"]', 'faqA4');
    setText('[data-atspd="faqQ5"]', 'faqQ5'); setText('[data-atspd="faqA5"]', 'faqA5');
    setText('[data-atspd="relatedTitle"]', 'relatedTitle'); setText('[data-atspd="usage"]', 'usage');
    setText('[data-atspd="cover"]', 'cover'); setText('[data-atspd="cold"]', 'cold'); setText('[data-atspd="redactor"]', 'redactor'); setText('[data-atspd="linebreak"]', 'linebreak');
    renderCounts(); renderHistory(); syncPro();
  }

  Object.assign(msg.en, { subtitleEn: 'Check line breaks, bullets, invisible characters, and character counts before pasting into job forms.', noticeTitleEn: 'Before you paste personal application text', noticeBodyEn: 'This tool processes text locally in your browser and does not upload the pasted content. However, page display may load ads and analytics tags. Redact names, addresses, phone numbers, email addresses, employer names, or detailed work history when needed.', guaranteeTitleEn: 'Not an ATS guarantee', guaranteeBodyEn: 'ATS and job forms behave differently. This output is only an ATS-friendly plain-text approximation. Always check the actual form before submitting.' });
  Object.assign(msg.ja, { subtitleJa: '応募フォーム貼り付け前に、改行崩れ・箇条書き・不可視文字・文字数を確認します。', noticeTitleJa: '応募情報を貼る前の注意', noticeBodyJa: 'このツールの整形処理はブラウザ内で行い、貼り付けた本文はアップロードしません。ただしページ表示のため広告・解析タグは読み込まれる場合があります。氏名、住所、電話番号、メール、応募先企業名、職歴詳細などは必要に応じて伏せてください。', guaranteeTitleJa: 'ATS表示を保証するものではありません', guaranteeBodyJa: 'ATSや応募フォームごとに仕様は異なります。この出力は貼り付けやすいプレーンテキストに寄せるための補助です。送信前に必ず実際のフォーム上で確認してください。' });

  function syncPro() {
    const active = isPro();
    document.body.classList.toggle('is-pro', active);
    if (el.proBadge) el.proBadge.hidden = !active;
    if (el.proCard) { el.proCard.hidden = false; el.proCard.classList.toggle('is-pro', active); }
    if (el.proTools) { el.proTools.hidden = false; el.proTools.classList.toggle('is-locked', !active); }
    if (el.proToolsNote) el.proToolsNote.textContent = active ? tr('proToolsActive') : tr('proToolsLocked');
    document.querySelectorAll('[data-pro-only]').forEach((node) => { if ('disabled' in node) node.disabled = !active; node.setAttribute('aria-hidden', active ? 'false' : 'true'); });
    if (el.buy) { el.buy.href = STRIPE_LINK; el.buy.target = '_blank'; el.buy.rel = 'noopener noreferrer'; el.buy.removeAttribute('aria-disabled'); el.buy.removeAttribute('tabindex'); el.buy.textContent = active ? tr('pro.unlocked') : tr('pro.cta'); const note = el.buy.parentElement?.querySelector('.meta'); if (note) note.textContent = active ? tr('proActive') : tr('proReady'); }
    ['adTop', 'adBottom'].forEach((id) => { const ad = $(id); if (ad) ad.hidden = active; });
  }

  function activateProFromUrl() { const url = new URL(location.href); if (url.searchParams.get('pro') === '1') { localStorage.setItem(PRO_KEY, '1'); url.searchParams.delete('pro'); history.replaceState({}, '', url.toString()); } }
  function setMode(mode) { currentMode = ['safe', 'keep', 'clean'].includes(mode) ? mode : 'safe'; ['safe', 'keep', 'clean'].forEach((m) => { const b = $(`mode${m[0].toUpperCase()}${m.slice(1)}`); if (b) { b.classList.toggle('is-active', m === currentMode); b.setAttribute('aria-checked', m === currentMode ? 'true' : 'false'); } }); }

  function normalize(s) { return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n'); }
  function cleanCommon(s) { return s.replace(/[\u200B\u200C\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\u3000/g, ' '); }
  function build(raw) { const base = cleanCommon(normalize(raw)).replace(/[ \t]+$/gm, ''); if (currentMode === 'clean') return base.replace(/\t/g, ' ').replace(/ {2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); if (currentMode === 'keep') return base.replace(/\n{3,}/g, '\n\n').trim(); return base.split(/\n{2,}/).map((p) => p.split('\n').map((line) => line.replace(/^\s*([•\-*\u2022]|・)\s+/, '• ').trim()).filter(Boolean).join(' ')).filter(Boolean).join(' / ').replace(/ {2,}/g, ' ').trim(); }

  function renderCounts() {
    const raw = el.input?.value || '';
    const lf = normalize(raw);
    const count = (re) => (raw.match(re) || []).length;
    const rows = currentLang === 'ja'
      ? [['合計文字数', raw.length], ['空白除外', raw.replace(/[\s\u00A0\u3000]/g, '').length], ['改行除外', raw.replace(/[\r\n]/g, '').length], ['行数', raw ? lf.split('\n').length : 0], ['段落数', raw.trim() ? lf.trim().split(/\n{2,}/).length : 0], ['箇条書き行', lf.split('\n').filter((l) => /^\s*([•\-*\u2022]|・)\s+/.test(l)).length]]
      : [['Total', raw.length], ['No spaces', raw.replace(/[\s\u00A0\u3000]/g, '').length], ['No newlines', raw.replace(/[\r\n]/g, '').length], ['Lines', raw ? lf.split('\n').length : 0], ['Paragraphs', raw.trim() ? lf.trim().split(/\n{2,}/).length : 0], ['Bullet lines', lf.split('\n').filter((l) => /^\s*([•\-*\u2022]|・)\s+/.test(l)).length]];
    if (el.counts) { el.counts.textContent = ''; rows.forEach(([k, v]) => { const d = document.createElement('div'); d.className = 'check'; const a = document.createElement('div'); a.className = 'check__k'; a.textContent = k; const b = document.createElement('div'); b.className = 'check__v'; b.textContent = String(v); d.append(a, b); el.counts.appendChild(d); }); }
    const warn = [];
    const zw = count(/[\u200B\u200C\u200D\uFEFF]/g), ctrl = count(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g), nbsp = count(/\u00A0/g), sp = count(/ {2,}/g), mixed = /\r\n/.test(raw) && /(^|[^\r])\n/.test(raw);
    if (zw) warn.push(currentLang === 'ja' ? `不可視文字: ${zw}` : `Invisible chars: ${zw}`); if (ctrl) warn.push(currentLang === 'ja' ? `制御文字: ${ctrl}` : `Control chars: ${ctrl}`); if (nbsp) warn.push(currentLang === 'ja' ? `通常と異なる空白: ${nbsp}` : `Non-standard spaces: ${nbsp}`); if (mixed) warn.push(currentLang === 'ja' ? '改行コードが混在しています' : 'Mixed newline formats detected'); if (sp) warn.push(currentLang === 'ja' ? `連続スペース: ${sp}` : `Consecutive spaces blocks: ${sp}`);
    if (el.warnings) { el.warnings.textContent = ''; (warn.length ? warn : ['—']).forEach((w) => { const d = document.createElement('div'); d.className = warn.length ? 'warn is-on' : 'warn'; d.textContent = w; el.warnings.appendChild(d); }); }
    if (el.charMeta) el.charMeta.textContent = raw ? (currentLang === 'ja' ? `${raw.length.toLocaleString()} 文字` : `${raw.length.toLocaleString()} chars`) : '';
    const lim = Number(el.limit?.value || 0); if (el.limitMeta) el.limitMeta.textContent = lim ? (raw.length > lim ? (currentLang === 'ja' ? `${raw.length - lim}文字超過` : `Over by ${raw.length - lim}`) : (currentLang === 'ja' ? `残り${lim - raw.length}文字` : `Remaining ${lim - raw.length}`)) : '';
  }

  function process() { clearError(); const raw = el.input?.value || ''; if (!raw.trim()) return error(tr('emptyInput')); const max = isPro() ? 200000 : 30000; if (raw.length > max) return error(tr('tooLong')); if (el.progress) el.progress.hidden = false; setTimeout(() => { const out = build(raw); if (el.output) el.output.value = out; if (el.preview) el.preview.textContent = out; renderCounts(); if (el.progress) el.progress.hidden = true; }, 50); }
  async function copyOut() { const out = el.output?.value || ''; if (!out.trim()) return error(tr('emptyOutput')); try { await navigator.clipboard.writeText(out); toast(tr('copied')); } catch (_) { const ta = document.createElement('textarea'); ta.value = out; ta.style.position = 'fixed'; ta.style.left = '-9999px'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); ok ? toast(tr('copied')) : error(tr('copyFailed')); } }
  function download() { const out = el.output?.value || ''; if (!out.trim()) return error(tr('emptyOutput')); const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([out], { type: 'text/plain;charset=utf-8' })); a.href = url; a.download = 'ats-paste-doctor.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast(tr('downloaded')); }
  function reset() { clearError(); if (el.input) el.input.value = ''; if (el.output) el.output.value = ''; if (el.preview) el.preview.textContent = ''; if (el.limit) el.limit.value = ''; renderCounts(); }
  function requirePro(ev) { if (isPro()) return true; ev?.preventDefault?.(); ev?.stopImmediatePropagation?.(); toast(tr('proLocked')); return false; }
  function templateSave(slot) { if (!isPro()) return; const out = el.output?.value || ''; if (!out.trim()) return error(tr('emptyOutput')); localStorage.setItem(TEMPLATE_PREFIX + slot, out); toast(tr('saved')); }
  function templateLoad(slot) { if (!isPro()) return; const v = localStorage.getItem(TEMPLATE_PREFIX + slot); if (!v) return error(tr('noTemplate')); if (el.output) el.output.value = v; if (el.preview) el.preview.textContent = v; toast(tr('loaded')); }
  function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (_) { return []; } }
  function setHistory(items) { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 10))); }
  function renderHistory() { if (!el.historyList) return; const items = getHistory(); el.historyList.textContent = ''; if (!items.length) { const d = document.createElement('div'); d.className = 'meta'; d.textContent = tr('noHistory'); el.historyList.appendChild(d); return; } items.forEach((item, i) => { const row = document.createElement('div'); row.className = 'history-row'; const p = document.createElement('div'); p.className = 'meta'; p.textContent = `${item.date || ''} ${String(item.text || '').slice(0, 80)}`; const load = document.createElement('button'); load.type = 'button'; load.className = 'btn btn-small'; load.textContent = currentLang === 'ja' ? '読込' : 'Load'; load.disabled = !isPro(); load.onclick = () => { if (!isPro()) return; if (el.output) el.output.value = item.text || ''; if (el.preview) el.preview.textContent = item.text || ''; toast(tr('loaded')); }; const del = document.createElement('button'); del.type = 'button'; del.className = 'btn btn-small btn-ghost'; del.textContent = currentLang === 'ja' ? '削除' : 'Delete'; del.disabled = !isPro(); del.onclick = () => { if (!isPro()) return; const next = getHistory().filter((_, idx) => idx !== i); setHistory(next); renderHistory(); toast(tr('deleted')); }; row.append(p, load, del); el.historyList.appendChild(row); }); }
  function saveHistory() { if (!isPro()) return; const out = el.output?.value || ''; if (!out.trim()) return error(tr('emptyOutput')); setHistory([{ date: new Date().toISOString().slice(0, 10), text: out }, ...getHistory()]); renderHistory(); toast(tr('saved')); }
  function clearHistory() { if (!isPro()) return; localStorage.removeItem(HISTORY_KEY); renderHistory(); toast(tr('cleared')); }
  function exportPdf() { if (!isPro()) return; const out = el.output?.value || ''; if (!out.trim()) return error(tr('emptyOutput')); const win = window.open('', '_blank', 'noopener,noreferrer'); if (!win) return error('Popup blocked'); const safe = out.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch])); win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>ATS Paste Doctor</title><style>body{font-family:system-ui,sans-serif;margin:24px}pre{white-space:pre-wrap;border:1px solid #ddd;border-radius:10px;padding:12px;background:#fafafa}</style></head><body><h1>ATS Paste Doctor</h1><pre>${safe}</pre><p>${tr('pdfTip')}</p></body></html>`); win.document.close(); toast(tr('pdfTip')); }

  function init() {
    activateProFromUrl(); setLang(currentLang); setMode('safe'); syncPro(); renderCounts();
    el.langJa?.addEventListener('click', () => setLang('ja')); el.langEn?.addEventListener('click', () => setLang('en'));
    document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
    el.input?.addEventListener('input', renderCounts); el.limit?.addEventListener('input', renderCounts); el.process?.addEventListener('click', process); el.copy?.addEventListener('click', copyOut); el.download?.addEventListener('click', download); el.reset?.addEventListener('click', reset);
    el.buy?.addEventListener('click', () => syncPro());
    el.exportPdf?.addEventListener('click', (e) => { if (requirePro(e)) exportPdf(); });
    document.querySelectorAll('.template-save').forEach((b) => b.addEventListener('click', (e) => { if (requirePro(e)) templateSave(b.dataset.slot || '1'); }));
    document.querySelectorAll('.template-load').forEach((b) => b.addEventListener('click', (e) => { if (requirePro(e)) templateLoad(b.dataset.slot || '1'); }));
    el.historySave?.addEventListener('click', (e) => { if (requirePro(e)) saveHistory(); }); el.historyClear?.addEventListener('click', (e) => { if (requirePro(e)) clearHistory(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
