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
});
