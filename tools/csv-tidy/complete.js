(function(){
  "use strict";

  const samples = {
    accounting: {
      filename: "sample-accounting.csv",
      text: "日付,勘定科目,金額,税額,摘要\n2026-05-01,消耗品費,1200,120,コピー用紙\n2026-05-02,通信費,3300,300,インターネット\n2026-05-03,旅費交通費,560,56,電車代"
    },
    ec: {
      filename: "sample-ec.csv",
      text: "商品コード,商品名,数量,単価,小計\nA001,白Tシャツ,2,1500,3000\nB002,黒キャップ,1,2200,2200\nC003,ステッカー,5,300,1500"
    },
    contacts: {
      filename: "sample-contacts.csv",
      text: "氏名,メール,電話番号,メモ\n山田太郎,taro@example.com,090-0000-0000,確認済み\n佐藤花子,hanako@example.com,080-1111-1111,未確認\n鈴木一郎,ichiro@example.com,070-2222-2222,要返信"
    }
  };

  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

  function lang(){
    const active = qs('.nw-lang-switch button.active');
    if (active && active.dataset.lang) return active.dataset.lang;
    return (navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : 'en';
  }

  function applyOptionLabels(nextLang){
    const l = nextLang === 'en' ? 'en' : 'ja';
    qsa('option[data-label-ja], option[data-label-en]').forEach(function(option){
      const text = l === 'en' ? option.dataset.labelEn : option.dataset.labelJa;
      if (text) option.textContent = text;
    });
  }

  function makeFile(sample){
    return new File([sample.text], sample.filename, { type: 'text/csv;charset=utf-8' });
  }

  function loadSample(kind){
    const sample = samples[kind];
    const input = qs('#fileInput');
    if (!sample || !input) return;

    const file = makeFile(sample);
    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
    } catch (err) {
      // Browsers without DataTransfer support can still fall back to the old sample download button.
    }

    input.dispatchEvent(new Event('change', { bubbles:true }));
    setTimeout(renderSummary, 160);
    setTimeout(renderSummary, 500);
  }

  function visibleRows(){ return qsa('#previewTable tbody tr').filter(function(tr){ return tr.offsetParent !== null; }); }
  function headerCells(){ return qsa('#previewTable thead th'); }
  function colItems(){ return qsa('#colsList .col-item'); }

  function excludedNames(){
    return colItems().filter(function(item){
      const checkbox = qs('.col-exclude', item);
      return checkbox && checkbox.checked;
    }).map(function(item, index){
      const input = qs('.col-name', item);
      return input && input.value ? input.value.trim() : 'Column ' + (index + 1);
    }).filter(Boolean);
  }

  function selectedText(id, fallback){
    const el = qs('#' + id);
    if (!el) return fallback;
    if (el.tagName === 'SELECT') {
      const opt = el.options[el.selectedIndex];
      return opt ? opt.textContent.trim() : fallback;
    }
    return el.value || fallback;
  }

  function bomText(){
    const on = qs('#bomOn');
    return on && on.classList.contains('active') ? 'ON' : 'OFF';
  }

  function delimiterText(){
    const out = qs('#outDelimiter');
    if (out && out.value) return selectedText('outDelimiter', out.value);
    return selectedText('delimiter', ',');
  }

  function newlineText(){ return selectedText('outNewline', 'CRLF'); }

  function renderSummary(){
    const box = qs('#csvTidyOutputSummary');
    if (!box) return;

    const l = lang();
    const cols = Math.max(headerCells().length, colItems().length);
    const rows = visibleRows().length;
    const excluded = excludedNames();
    const outputCols = cols ? Math.max(0, cols - excluded.length) : 0;

    if (!cols && !rows) {
      box.innerHTML = l === 'en'
        ? 'Load a CSV to see the output summary here.'
        : 'CSVを読み込むと、ここに出力前の確認内容が表示されます。';
      return;
    }

    const labels = l === 'en'
      ? { input:'Input', output:'Output', excluded:'Excluded', bom:'BOM', delimiter:'Delimiter', newline:'Line ending', cols:'columns', rows:'preview rows', none:'None', warn:'Warning: some columns are excluded from output.' }
      : { input:'入力', output:'出力', excluded:'除外列', bom:'BOM', delimiter:'区切り文字', newline:'改行', cols:'列', rows:'プレビュー行', none:'なし', warn:'注意：出力から除外される列があります。' };

    const excludedLabel = excluded.length ? excluded.join(', ') : labels.none;
    const warning = excluded.length
      ? '<div class="csvtidy-warning">' + labels.warn + '<br>' + escapeHtml(excludedLabel) + '</div>'
      : '';

    box.innerHTML = '' +
      '<div class="csvtidy-summary-grid">' +
        '<div><strong>' + labels.input + '</strong><span>' + cols + ' ' + labels.cols + ' / ' + rows + ' ' + labels.rows + '</span></div>' +
        '<div><strong>' + labels.output + '</strong><span>' + outputCols + ' ' + labels.cols + ' / ' + rows + ' ' + labels.rows + '</span></div>' +
        '<div><strong>' + labels.excluded + '</strong><span>' + excluded.length + ' ' + labels.cols + '</span></div>' +
        '<div><strong>' + labels.bom + '</strong><span>' + escapeHtml(bomText()) + '</span></div>' +
        '<div><strong>' + labels.delimiter + '</strong><span>' + escapeHtml(delimiterText()) + '</span></div>' +
        '<div><strong>' + labels.newline + '</strong><span>' + escapeHtml(newlineText()) + '</span></div>' +
      '</div>' + warning;
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function confirmExcluded(ev){
    const excluded = excludedNames();
    if (!excluded.length) return;
    const msg = lang() === 'en'
      ? 'Some columns are excluded from output:\n' + excluded.join(', ') + '\n\nContinue saving?'
      : '除外される列があります:\n' + excluded.join(', ') + '\n\nこのまま保存しますか？';
    if (!window.confirm(msg)) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }
  }

  function install(){
    applyOptionLabels(lang());

    qsa('.nw-lang-switch button[data-lang]').forEach(function(button){
      button.addEventListener('click', function(){
        setTimeout(function(){
          applyOptionLabels(button.dataset.lang);
          renderSummary();
        }, 0);
      });
    });

    qsa('[data-csv-sample]').forEach(function(button){
      button.addEventListener('click', function(){ loadSample(button.dataset.csvSample); });
    });

    const download = qs('#downloadBtn');
    if (download) download.addEventListener('click', confirmExcluded, true);

    document.addEventListener('change', function(){ setTimeout(renderSummary, 40); });
    document.addEventListener('input', function(){ setTimeout(renderSummary, 80); });
    document.addEventListener('click', function(ev){
      if (ev.target && ev.target.closest('button,input,select,label')) setTimeout(renderSummary, 120);
    });

    const table = qs('#previewTable');
    if (table && 'MutationObserver' in window) {
      new MutationObserver(function(){ renderSummary(); }).observe(table, { childList:true, subtree:true });
    }
    const cols = qs('#colsList');
    if (cols && 'MutationObserver' in window) {
      new MutationObserver(function(){ renderSummary(); }).observe(cols, { childList:true, subtree:true, attributes:true });
    }

    renderSummary();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
