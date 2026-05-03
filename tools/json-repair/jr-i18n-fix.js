(function(){
  "use strict";

  var D = {
    ja: {
      freeTitle: "無料でできること",
      freeBadge: "Free / Local",
      freeDesc: "検証、末尾カンマ・コメント入りJSONの修復、Pretty/Minify、コピー、JSON保存、修復ログ、差分確認が使えます。",
      sampleLabel: "Samples",
      proTitle: "追加機能（ローカル解除）",
      activateBtn: "Activate",
      clearBtn: "Clear",
      proDesc: "より強い修復・JSON候補抽出・Schema check・ローカル履歴・詳細な修復説明を使う場合の追加機能です。無料機能だけでも通常のJSON修復・検証・整形は使えます。",
      candidatesTitle: "JSON候補抽出（追加機能）",
      schemaTitle: "Schema check（追加機能）",
      schemaHelp: "例: required user.id, user.name / type user.id=number",
      schemaRunBtn: "Schema check",
      historyTitle: "ローカル履歴（追加機能）",
      historyEnable: "この端末に履歴を保存",
      linksTitle: "関連ツール",
      faq1q: "入力したJSONはサーバーに送信されますか？",
      faq1a: "いいえ。入力内容はブラウザ内で処理されます。",
      faq2q: "どんな壊れたJSONを直せますか？",
      faq2a: "末尾カンマ、コメント入りJSON、一部のログ混在JSONなどを修復できます。",
      faq3q: "すべてのJSONを自動修復できますか？",
      faq3a: "いいえ。意味が曖昧な壊れ方や大きく崩れたJSONは修復できない場合があります。",
      faq4q: "元データは変更されますか？",
      faq4a: "いいえ。入力欄の内容は残り、修復結果は出力欄に表示されます。",
      scopeTitle: "修復できる範囲",
      scopeFree: "無料：末尾カンマ、コメント除去、一部のログ混在JSON、検証、Pretty、Minify、コピー、JSON保存、差分確認。",
      scopeExtra: "追加機能：シングルクォート、未クォートキー、Python風 True / False / None、JSON候補抽出、Schema check、ローカル履歴。",
      howTitle: "使い方",
      how1: "1. 壊れたJSONやログ混在テキストを入力欄に貼り付ける。",
      how2: "2. まず Validate で状態を確認する。",
      how3: "3. Safe または Standard を選んで Repair を押す。",
      how4: "4. 修復ログと差分を確認してからコピーまたは保存する。"
    },
    en: {
      freeTitle: "What you can do for free",
      freeBadge: "Free / Local",
      freeDesc: "Validate JSON, repair trailing commas and comments, Pretty/Minify, copy, save JSON, inspect the repair log, and check the diff.",
      sampleLabel: "Samples",
      proTitle: "Extra features (local unlock)",
      activateBtn: "Activate",
      clearBtn: "Clear",
      proDesc: "Extra features for stronger repair, JSON candidate extraction, schema checks, local history, and detailed explanations. Regular repair, validation, and formatting work for free.",
      candidatesTitle: "JSON candidates (extra)",
      schemaTitle: "Schema check (extra)",
      schemaHelp: "Example: required user.id, user.name / type user.id=number",
      schemaRunBtn: "Schema check",
      historyTitle: "Local history (extra)",
      historyEnable: "Save history on this device",
      linksTitle: "Related tools",
      faq1q: "Is my JSON sent to a server?",
      faq1a: "No. Your input is processed in your browser.",
      faq2q: "What kinds of broken JSON can this repair?",
      faq2a: "It can repair trailing commas, JSON with comments, and some JSON fragments mixed into logs.",
      faq3q: "Can it repair every broken JSON automatically?",
      faq3a: "No. Ambiguous or heavily damaged JSON may not be repairable automatically.",
      faq4q: "Will the original input be changed?",
      faq4a: "No. The input remains in the input box and the repaired JSON appears in the output box.",
      scopeTitle: "Repair scope",
      scopeFree: "Free: trailing commas, comment removal, some JSON mixed into logs, validation, Pretty, Minify, copy, JSON save, and diff check.",
      scopeExtra: "Extra: single quotes, unquoted keys, Python-like True / False / None, JSON candidate extraction, schema check, and local history.",
      howTitle: "How to use",
      how1: "1. Paste broken JSON or log-mixed text into the input box.",
      how2: "2. Use Validate first to see the current state.",
      how3: "3. Select Safe or Standard, then press Repair.",
      how4: "4. Check the repair log and diff before copying or saving."
    }
  };

  function currentLang(){
    return (document.documentElement.lang || navigator.language || "ja").toLowerCase().indexOf("ja") === 0 ? "ja" : "en";
  }

  function insertGuide(){
    if (document.querySelector(".jr-scope-guide")) return;
    var free = document.querySelector("section[aria-label='Free features']");
    if (!free || !free.parentNode) return;
    var guide = document.createElement("section");
    guide.className = "jr-pro jr-scope-guide";
    guide.innerHTML = '<div class="jr-pro-head"><h2 class="jr-h2" data-i18n="scopeTitle"></h2><div class="jr-mini">Free / Extra</div></div>' +
      '<div class="jr-pro-note" data-i18n="scopeFree"></div>' +
      '<div class="jr-pro-note" data-i18n="scopeExtra"></div>' +
      '<div class="jr-pro-head jr-how-head"><h2 class="jr-h2" data-i18n="howTitle"></h2></div>' +
      '<ol class="jr-how-list"><li data-i18n="how1"></li><li data-i18n="how2"></li><li data-i18n="how3"></li><li data-i18n="how4"></li></ol>';
    free.insertAdjacentElement("afterend", guide);
  }

  function apply(){
    insertGuide();
    var map = D[currentLang()] || D.ja;
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var key = el.getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(map, key)) el.textContent = map[key];
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    apply();
    document.querySelectorAll(".nw-lang-btn").forEach(function(btn){
      btn.addEventListener("click", function(){ setTimeout(apply, 0); setTimeout(apply, 80); });
    });
  });
})();
