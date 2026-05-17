(() => {
  const $ = (id) => document.getElementById(id);
  const LAST = 'nw_moving_final_last_v1';

  const TASKS = {
    common: [
      ['c1', '郵便転送届、宅配、定期配送の転送・停止を確認した', '郵便・配送'],
      ['c2', '銀行、クレカ、保険、主要通販、勤務先などの住所変更先を把握した', '住所変更'],
      ['c3', '契約書、本人確認書類、鍵、重要書類を一箇所にまとめた', '紛失防止'],
      ['c4', '粗大ごみ、残置物、不用品回収の予定を確認した', '残置物'],
      ['c5', '電気・ガス・水道・ネット回線の停止/移転日と返却物を確認した', '継続課金']
    ],
    rental: [
      ['r1', '退去通知の控え、管理会社からの案内、立会い日時を保存した', '退去通知'],
      ['r2', '退去立会い当日の持ち物、鍵本数、返却方法を確認した', '鍵返却'],
      ['r3', '鍵本数と鍵の状態を写真で記録した', '返却記録'],
      ['r4', '室内全体、床、壁、水回り、設備、既存傷を写真で記録した', '写真記録'],
      ['r5', '電気・ガス・水道メーターの写真を撮る準備をした', 'メーター'],
      ['r6', '火災保険の解約または住所変更の要否を確認した', '保険'],
      ['r7', '敷金・保証金などの返金先口座、退去後の連絡先を整理した', '精算連絡'],
      ['r8', '管理会社へ提出する書類・返却物・連絡事項を確認した', '提出物'],
      ['r9', 'エアコン、照明、備品、設備など残す物/外す物を契約内容と照合した', '設備確認'],
      ['r10', '原状回復や修繕費の判断は契約書・管理会社案内で確認する前提にした', '契約確認']
    ],
    owned: [
      ['o1', 'ブレーカー、止水栓、ガス元栓など停止ポイントを確認した', '事故防止'],
      ['o2', '固定資産税や自治体書類の送付先を確認した', '税・書類'],
      ['o3', '火災保険・地震保険の住所変更または契約見直しを確認した', '保険'],
      ['o4', '自治会、管理組合、近隣、管理会社への連絡が必要か確認した', '連絡'],
      ['o5', '空き家になる場合の換気、通水、郵便物、草木、見回り方法を決めた', '空き家管理'],
      ['o6', '売却・賃貸化・引渡し予定がある場合の書類と鍵管理を確認した', '引渡し'],
      ['o7', '電気・ガス・水道・固定回線・管理費など継続課金を棚卸しした', '継続課金'],
      ['o8', 'メーター、室内、外回り、設備状態の写真を残す準備をした', '写真記録'],
      ['o9', '転出・転入など自治体手続きの期限と必要書類を確認した', '自治体']
    ]
  };

  let armed = false;

  function toast(message) {
    const element = $('toast');
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      element.hidden = true;
    }, 2400);
  }

  function isProActive() {
    return document.documentElement.dataset.proActive === 'true';
  }

  function requirePro(event) {
    if (isProActive()) return true;
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
    toast('共通Proを有効化すると、このPro出力をコピー・保存できます。');
    document.querySelector('[data-pro-buy]')?.focus?.();
    return false;
  }

  function fmt(value) {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? '' : value;
  }

  function homeType() {
    return $('homeType').value === 'owned' ? 'owned' : 'rental';
  }

  function label(type) {
    return type === 'rental' ? '賃貸' : '持ち家';
  }

  function tasks(type) {
    return TASKS.common.concat(TASKS[type]).map((item) => ({
      id: item[0],
      text: item[1],
      meta: item[2]
    }));
  }

  function ctx() {
    const date = fmt($('moveDate').value);
    if (!date) return null;
    const type = homeType();
    return {
      date,
      homeType: type,
      key: `nw_moving_final_v1:${date}:${type}`,
      tasks: tasks(type)
    };
  }

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}') || {};
    } catch (error) {
      return {};
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function progress(taskItems, checks) {
    const done = taskItems.filter((task) => checks[task.id]).length;
    const percent = taskItems.length ? Math.round((done / taskItems.length) * 100) : 0;
    $('progressFill').style.width = `${percent}%`;
    $('progressText').textContent = `${done} / ${taskItems.length} 完了`;
    ['btnClear', 'btnCopyTxt', 'btnSaveTxt', 'btnPrint'].forEach((id) => {
      if ($(id)) $(id).disabled = !taskItems.length;
    });
    updateProOutput();
  }

  function render() {
    const context = ctx();
    if (!context) return toast('退去日 / 引っ越し日を入力してください。');

    const checks = load(context.key);
    $('resultMeta').textContent = `${context.date} / ${label(context.homeType)}（この条件で保存）`;
    $('taskList').textContent = '';

    context.tasks.forEach((task) => {
      const listItem = document.createElement('li');
      listItem.className = 'task-item';
      const row = document.createElement('label');
      row.className = 'task';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!checks[task.id];
      checkbox.addEventListener('change', () => {
        checks[task.id] = checkbox.checked;
        save(context.key, checks);
        progress(context.tasks, checks);
      });
      const body = document.createElement('div');
      body.innerHTML = '<div class="ttext"></div><div class="tmeta"></div>';
      body.querySelector('.ttext').textContent = task.text;
      body.querySelector('.tmeta').textContent = `カテゴリ: ${task.meta}`;
      row.append(checkbox, body);
      listItem.appendChild(row);
      $('taskList').appendChild(listItem);
    });

    $('result').hidden = false;
    localStorage.setItem(LAST, JSON.stringify({ dateStr: context.date, homeType: context.homeType }));
    progress(context.tasks, checks);
    return true;
  }

  function clearChecks() {
    const context = ctx();
    if (!context) return toast('退去日 / 引っ越し日を入力してください。');
    if (!armed) {
      armed = true;
      $('btnClear').textContent = 'もう一度押すと全解除';
      toast('全解除する場合はもう一度押してください。');
      setTimeout(() => {
        armed = false;
        $('btnClear').textContent = 'チェック全解除';
      }, 4500);
      return;
    }
    localStorage.removeItem(context.key);
    armed = false;
    render();
    toast('チェックを全解除しました。');
  }

  function basicText() {
    const context = ctx();
    if (!context) return '';
    const checks = load(context.key);
    const done = context.tasks.filter((task) => checks[task.id]).length;
    return [
      'Moving / Lease Final Check',
      `日付: ${context.date}`,
      `住居タイプ: ${label(context.homeType)}`,
      `進捗: ${done} / ${context.tasks.length}`,
      '',
      'チェック項目:',
      ...context.tasks.map((task) => `${checks[task.id] ? '[x]' : '[ ]'} ${task.text}（${task.meta}）`),
      '',
      '注意: 一般的な確認用です。契約内容や退去精算結果を保証しません。'
    ].join('\n');
  }

  function proPack(options = {}) {
    const context = ctx();
    if (!context) return '';
    const checks = load(context.key);
    const done = context.tasks.filter((task) => checks[task.id]).length;
    const md = options.markdown;
    const heading = md ? (text, level = 2) => `${'#'.repeat(level)} ${text}` : (text) => `【${text}】`;
    const bullet = md ? '- ' : '・';
    const checkLine = (task) => `${md ? '- ' : ''}${checks[task.id] ? '[x]' : '[ ]'} ${task.text}（${task.meta}）`;

    return [
      md ? '# Moving / Lease Final Pack' : 'Moving / Lease Final Pack',
      `日付: ${context.date}`,
      `住居タイプ: ${label(context.homeType)}`,
      `進捗: ${done} / ${context.tasks.length}`,
      '',
      heading('提出・共有用チェックリスト完全版'),
      ...context.tasks.map(checkLine),
      '',
      heading('退去立会いメモ完成版'),
      `${bullet}立会い日時: ${context.date} / 時刻:`,
      `${bullet}管理会社・担当者:`,
      `${bullet}返却する鍵の種類・本数:`,
      `${bullet}メーター写真: 電気 / ガス / 水道`,
      `${bullet}確認した傷・汚れ・設備:`,
      `${bullet}その場で共有した内容:`,
      '',
      heading('管理会社連絡メモ'),
      `${bullet}退去日・引っ越し日: ${context.date}`,
      `${bullet}退去後の連絡先:`,
      `${bullet}返金先口座・確認事項:`,
      `${bullet}書類・返却物:`,
      '',
      heading('住所変更・解約先整理テンプレ'),
      `${bullet}郵便転送:`,
      `${bullet}電気・ガス・水道:`,
      `${bullet}ネット回線・サブスク・定期配送:`,
      `${bullet}銀行・カード・保険・勤務先:`,
      '',
      heading('敷金/保証金・返金先確認メモ'),
      `${bullet}返金先口座:`,
      `${bullet}退去後住所:`,
      `${bullet}管理会社から受領する書類:`,
      `${bullet}確認したい点（判断は契約書・管理会社・専門窓口で確認）:`,
      '',
      heading('写真記録リスト'),
      `${bullet}室内全体 / 床 / 壁 / 水回り / 設備 / 既存傷`,
      `${bullet}鍵 / メーター / 返却物 / 残置物がない状態`,
      `${bullet}撮影日・場所・補足メモを残す`,
      '',
      heading('家族共有用まとめ'),
      `${bullet}今日確認すること:`,
      `${bullet}担当者:`,
      `${bullet}未完了の連絡・解約・住所変更:`,
      `${bullet}当日の持ち物:`,
      '',
      heading('制限事項'),
      `${bullet}退去費用、原状回復、敷金精算、修繕費請求、法的判断を自動判定しません。`,
      `${bullet}契約内容や管理会社判断を保証しません。`,
      `${bullet}公式な提出書類ではなく、確認・共有・記録用の整理パックです。`,
      `${bullet}最終判断は契約書、管理会社、自治体、専門窓口で確認してください。`
    ].join('\n');
  }

  function inspectionMemo() {
    return proPack().split('【管理会社連絡メモ】')[0].trim();
  }

  function addressMemo() {
    const text = proPack();
    return text.slice(text.indexOf('【住所変更・解約先整理テンプレ】'), text.indexOf('【敷金/保証金・返金先確認メモ】')).trim();
  }

  function familyMemo() {
    const text = proPack();
    return text.slice(text.indexOf('【家族共有用まとめ】'), text.indexOf('【制限事項】')).trim();
  }

  function updateProOutput() {
    const output = $('proPackOutput');
    if (!output) return;
    output.textContent = ctx() ? proPack() : '退去日 / 引っ越し日を入力し、最終チェックを表示するとPro Packを生成できます。';
  }

  async function copyText(out, successMessage) {
    if (!out) return toast('先にチェックリストを表示してください。');
    try {
      await navigator.clipboard.writeText(out);
      toast(successMessage);
    } catch (error) {
      toast('コピーできませんでした。');
    }
  }

  async function copyTxt() {
    await copyText(basicText(), 'TXTをコピーしました。');
  }

  function saveBlob(out, filename) {
    if (!out) return toast('先にチェックリストを表示してください。');
    const blob = new Blob([out], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast('TXTを保存しました。');
  }

  function saveTxt() {
    const context = ctx();
    saveBlob(basicText(), `moving-lease-final-check-${context?.date || 'check'}-${context?.homeType || 'home'}.txt`);
  }

  function printBasic() {
    if ($('result').hidden) return toast('先にチェックリストを表示してください。');
    document.body.dataset.printMode = 'basic';
    window.print();
  }

  function saveProTxt(event) {
    if (!requirePro(event)) return;
    const context = ctx();
    saveBlob(proPack(), `moving-lease-final-pack-${context?.date || 'check'}-${context?.homeType || 'home'}.txt`);
  }

  function printPro(event) {
    if (!requirePro(event)) return;
    if (!ctx()) return toast('先にチェックリストを表示してください。');
    updateProOutput();
    document.body.dataset.printMode = 'pro';
    window.print();
  }

  function reset() {
    $('moveDate').value = '';
    $('homeType').value = 'rental';
    $('result').hidden = true;
    $('taskList').textContent = '';
    $('progressFill').style.width = '0%';
    $('progressText').textContent = '0 / 0 完了';
    updateProOutput();
    toast('入力欄をリセットしました。');
  }

  function bindProButtons() {
    document.querySelectorAll('[data-pro-locked]').forEach((button) => {
      button.addEventListener('click', requirePro);
    });

    const bindings = [
      ['btnCopyProPack', () => copyText(proPack(), 'Pro Packをコピーしました。')],
      ['btnSaveProPack', saveProTxt],
      ['btnCopyMarkdown', () => copyText(proPack({ markdown: true }), 'Markdownをコピーしました。')],
      ['btnCopyInspectionMemo', () => copyText(inspectionMemo(), '退去立会いメモをコピーしました。')],
      ['btnCopyAddressMemo', () => copyText(addressMemo(), '住所変更・解約メモをコピーしました。')],
      ['btnCopyFamilyMemo', () => copyText(familyMemo(), '家族共有メモをコピーしました。')],
      ['btnPrintPro', printPro]
    ];

    bindings.forEach(([id, handler]) => {
      const button = $(id);
      if (!button) return;
      button.addEventListener('click', (event) => {
        if (!requirePro(event)) return;
        handler(event);
      });
    });
  }

  function init() {
    $('btnGenerate').addEventListener('click', render);
    $('btnClear').addEventListener('click', clearChecks);
    $('btnReset').addEventListener('click', reset);
    $('btnDeleteCurrentData').addEventListener('click', () => {
      const context = ctx();
      if (context) localStorage.removeItem(context.key);
      render();
    });
    $('btnDeleteLastData').addEventListener('click', () => {
      localStorage.removeItem(LAST);
      toast('前回条件の保存を削除しました。');
    });
    $('btnCopyTxt').addEventListener('click', copyTxt);
    $('btnSaveTxt').addEventListener('click', saveTxt);
    $('btnPrint').addEventListener('click', printBasic);
    bindProButtons();

    try {
      const last = JSON.parse(localStorage.getItem(LAST) || 'null');
      if (last) {
        $('moveDate').value = last.dateStr || '';
        $('homeType').value = last.homeType || 'rental';
      }
    } catch (error) {}

    window.addEventListener('nw-pro-state-change', updateProOutput);
    window.addEventListener('afterprint', () => {
      delete document.body.dataset.printMode;
    });
    updateProOutput();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
