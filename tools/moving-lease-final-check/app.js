(() => {
  const $ = (id) => document.getElementById(id);
  const LAST = 'nw_moving_final_last_v1';

  const TASKS = {
    common: [
      ['c1', '最終退出前に、室内・収納・ベランダ・ポストなどに忘れ物や残置物がないか確認した', '最終退出'],
      ['c2', '電気・ガス・水道などの停止予定と、当日に必要な閉栓・メーター確認を整理した', 'ライフライン最終確認'],
      ['c3', '引渡しに必要な鍵・書類・返却物を一箇所にまとめた', '引渡し準備']
    ],
    rental: [
      ['r1', '退去通知の控え、管理会社からの案内、立会い日時を確認できる状態にした', '退去通知'],
      ['r2', '退去立会い当日の持ち物、鍵本数、返却方法を確認した', '鍵返却'],
      ['r3', '鍵本数と鍵の状態を写真で記録した', '返却記録'],
      ['r4', '室内全体、床、壁、水回り、設備、既存傷を写真で記録した', '写真記録'],
      ['r5', '電気・ガス・水道メーターを必要に応じて撮影できるよう確認した', 'メーター'],
      ['r6', '火災保険の終了・継続・住所変更について契約先の案内を最終確認した', '保険'],
      ['r7', '敷金・保証金などの返金先と、退去後の連絡先を管理会社へ伝える準備をした', '精算連絡'],
      ['r8', '管理会社へ提出する書類・返却物・当日の連絡事項を確認した', '提出物'],
      ['r9', 'エアコン、照明、備品、設備など残す物/外す物を契約内容と照合した', '設備確認'],
      ['r10', '原状回復や修繕費は自己判断せず、契約書・管理会社案内を確認する前提にした', '契約確認']
    ],
    owned: [
      ['o1', '最終退出時のブレーカー、止水栓、ガス元栓などの扱いを確認した', '事故防止'],
      ['o2', '売却・賃貸化・引渡し予定がある場合、渡す鍵・書類・設備資料をまとめた', '引渡し'],
      ['o3', 'メーター、室内、外回り、設備状態を必要に応じて写真で記録した', '写真記録'],
      ['o4', '仲介会社・管理会社・買主など、引渡し相手との最終連絡事項を確認した', '連絡'],
      ['o5', '空き家になる場合、換気・通水・郵便物・草木・見回りの初回対応を決めた', '空き家管理'],
      ['o6', '引渡し後も継続する管理費・保険・固定回線などがないか最終確認した', '継続契約'],
      ['o7', '残す設備・撤去する物・付属品の状態を引渡し条件と照合した', '設備確認'],
      ['o8', '玄関・窓・勝手口などの戸締りと火気・水回りを最終確認した', '最終退出'],
      ['o9', '引渡し後に必要な連絡先・受領書類・控えを保管した', '記録保管']
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
      '注意: 退去・引渡し直前の一般的な確認用です。契約内容や退去精算結果を保証しません。'
    ].join('\n');
  }

  async function copyTxt() {
    const out = basicText();
    if (!out) return toast('先にチェックリストを表示してください。');
    try {
      await navigator.clipboard.writeText(out);
      toast('TXTをコピーしました。');
    } catch (error) {
      toast('コピーできませんでした。');
    }
  }

  function saveTxt() {
    const context = ctx();
    const out = basicText();
    if (!out) return toast('先にチェックリストを表示してください。');
    const blob = new Blob([out], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `moving-lease-final-check-${context.date}-${context.homeType}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast('TXTを保存しました。');
  }

  function printBasic() {
    if ($('result').hidden) return toast('先にチェックリストを表示してください。');
    window.print();
  }

  function reset() {
    $('moveDate').value = '';
    $('homeType').value = 'rental';
    $('result').hidden = true;
    $('taskList').textContent = '';
    $('progressFill').style.width = '0%';
    $('progressText').textContent = '0 / 0 完了';
    toast('入力欄をリセットしました。');
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

    try {
      const last = JSON.parse(localStorage.getItem(LAST) || 'null');
      if (last) {
        $('moveDate').value = last.dateStr || '';
        $('homeType').value = last.homeType || 'rental';
      }
    } catch (error) {}
  }

  document.addEventListener('DOMContentLoaded', init);
})();
