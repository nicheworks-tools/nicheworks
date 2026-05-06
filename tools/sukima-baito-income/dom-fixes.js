document.addEventListener('DOMContentLoaded', function () {
  var fixes = [
    ['workplaceInput', '例：Amazon倉庫'],
    ['amountInput', '例：4200'],
    ['memoInput', '任意メモ']
  ];

  fixes.forEach(function (item) {
    var el = document.getElementById(item[0]);
    if (!el) return;
    el.removeAttribute('stable');
    el.removeAttribute('content');
    el.setAttribute('placeholder', item[1]);
  });

  var workplaceInput = document.getElementById('workplaceInput');
  var quickPicks = document.getElementById('wpQuickPicks');
  var workplaceList = document.getElementById('workplaceList');
  var storageKey = 'nw-sukima-workplaces-v1';

  if (workplaceInput && !document.getElementById('clearWorkplaceDictBtn')) {
    var btn = document.createElement('button');
    btn.id = 'clearWorkplaceDictBtn';
    btn.type = 'button';
    btn.className = 'mini-danger-btn';
    btn.textContent = '就業先候補を削除';
    btn.addEventListener('click', function () {
      localStorage.removeItem(storageKey);
      if (workplaceList) workplaceList.innerHTML = '';
      if (quickPicks) quickPicks.textContent = '';
      showLocalNotice('就業先候補を削除しました。');
    });
    workplaceInput.insertAdjacentElement('afterend', btn);
  }

  function showLocalNotice(message) {
    var box = document.getElementById('sbiLocalNotice');
    if (!box) {
      box = document.createElement('div');
      box.id = 'sbiLocalNotice';
      box.className = 'local-notice';
      var main = document.querySelector('.nw-main') || document.body;
      main.insertBefore(box, main.firstChild);
    }
    box.textContent = message;
    box.style.display = 'block';
    window.setTimeout(function () {
      box.style.display = 'none';
    }, 2600);
  }
});
