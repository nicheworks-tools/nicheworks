(function(){
  "use strict";

  var PRO_KEY = "jr_pro_key";
  var HIST_KEY = "jr_hist_enabled";

  var COPY = {
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
      how4: "4. 修復ログと差分を確認してからコピーまたは保存する。",
      safe: "Safe：意味を変えにくい範囲で、末尾カンマやコメント除去などを中心に修復します。",
      standard: "Standard：Safeに加えて、ログ内のJSON候補抽出も試します。",
      aggressive: "Aggressive：シングルクォート、未クォートキー、Python風リテラルなども試します。意味が変わる可能性があります。",
      aggressiveLocked: "Aggressiveは追加機能です。無料ではSafe / Standardを使ってください。",
      invalidKey: "Proキーが無効です。",
      activated: "Proを有効化しました。ページを再読み込みします。",
      cleared: "Proを解除しました。ページを再読み込みします。",
      samplePro: "このサンプルはAggressive修復の例です。無料版では完全修復できない場合があります。",
      logHint: "適用した修復、検証結果、差分確認がここに表示されます。重要なJSONは保存前に内容を確認してください。",
      causesTitle: "よくある原因",
      causes: "末尾カンマ / 閉じ括弧の不足 / 文字列のクォート漏れ / コメント入りJSON / ログや説明文の混入",
      diffNote: "差分は修復前後の変化を確認するための補助表示です。",
      validateNote: "エラーが出る場合は、行・列・周辺テキストと下の原因候補を確認してください。"
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
      how4: "4. Check the repair log and diff before copying or saving.",
      safe: "Safe: Repairs low-risk issues such as trailing commas and comments.",
      standard: "Standard: Includes Safe repair and JSON candidate extraction from mixed logs.",
      aggressive: "Aggressive: Tries single quotes, unquoted keys, and Python-like literals. It may change meaning.",
      aggressiveLocked: "Aggressive is an extra feature. Use Safe / Standard for free.",
      invalidKey: "Invalid Pro key.",
      activated: "Pro activated. Reloading the page.",
      cleared: "Pro cleared. Reloading the page.",
      samplePro: "This sample is for Aggressive repair. The free version may not fully repair it.",
      logHint: "Applied repairs, validation results, and diff notes appear here. Check important JSON before saving.",
      causesTitle: "Common causes",
      causes: "Trailing comma / missing closing brace / missing string quotes / comments / logs or prose mixed in",
      diffNote: "The diff helps you inspect what changed between input and output.",
      validateNote: "If validation fails, check the line, column, nearby text, and common causes below."
    }
  };

  var PATCH_SAMPLES = {
    array: '[\n  { "id": 1, "name": "alpha" },\n  { "id": 2, "name": "beta" }\n]\n',
    config: '{\n  "name": "demo",\n  "enabled": true,\n  "limits": {\n    "max": 10,\n    "retry": 3\n  }\n}\n'
  };

  function $(id){ return document.getElementById(id); }
  function lang(){ return (document.documentElement.lang || navigator.language || "ja").toLowerCase().indexOf("ja") === 0 ? "ja" : "en"; }
  function msg(key){ return (COPY[lang()] && COPY[lang()][key]) || key; }
  function isPro(){ return !!localStorage.getItem(PRO_KEY); }

  function toast(message){
    var box = $("jrToast");
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
    clearTimeout(box.__jrCompleteTimer);
    box.__jrCompleteTimer = setTimeout(function(){ box.hidden = true; }, 2600);
  }

  function normalizeKey(key){
    return String(key || "").toUpperCase().replace(/\s+/g, "").trim();
  }

  function checksum97(str){
    var sum = 0;
    for (var i = 0; i < str.length; i++) sum = (sum + str.charCodeAt(i)) % 97;
    return sum;
  }

  function validateProKey(key){
    var k = normalizeKey(key);
    var m = /^NW-JR-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(k);
    if (!m) return { ok:false, norm:k };
    var want = checksum97(m[1] + m[2]).toString(36).toUpperCase().padStart(2, "0");
    return { ok:m[3].slice(-2) === want, norm:k };
  }

  function insertGuide(){
    if (document.querySelector(".jr-scope-guide")) return;
    var free = document.querySelector("section[aria-label='Free features']");
    if (!free) return;
    var guide = document.createElement("section");
    guide.className = "jr-pro jr-scope-guide";
    guide.innerHTML = '<div class="jr-pro-head"><h2 class="jr-h2" data-i18n="scopeTitle"></h2><div class="jr-mini">Free / Extra</div></div>' +
      '<div class="jr-pro-note" data-i18n="scopeFree"></div>' +
      '<div class="jr-pro-note" data-i18n="scopeExtra"></div>' +
      '<div class="jr-pro-head jr-how-head"><h2 class="jr-h2" data-i18n="howTitle"></h2></div>' +
      '<ol class="jr-how-list"><li data-i18n="how1"></li><li data-i18n="how2"></li><li data-i18n="how3"></li><li data-i18n="how4"></li></ol>';
    free.insertAdjacentElement("afterend", guide);
  }

  function applyI18n(){
    var map = COPY[lang()] || COPY.ja;
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var key = el.getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(map, key)) el.textContent = map[key];
    });
  }

  function renderLevelHelp(){
    var help = $("jrLevelHelp");
    var sel = $("selRepairLevel");
    if (!help || !sel) return;
    var level = sel.value || "safe";
    help.textContent = (level === "aggressive" && !isPro()) ? msg("aggressiveLocked") : msg(level);
  }

  function syncControls(){
    var sample = $("selSample");
    var pro = isPro();
    if (sample) {
      Array.prototype.forEach.call(sample.querySelectorAll("option[data-pro='true']"), function(opt){
        opt.disabled = !pro;
        opt.hidden = !pro;
      });
      if (!pro && sample.selectedOptions[0] && sample.selectedOptions[0].dataset.pro === "true") sample.value = "";
    }
    var level = $("selRepairLevel");
    if (level) {
      var opt = Array.prototype.find.call(level.options, function(o){ return o.value === "aggressive"; });
      if (opt) opt.disabled = !pro;
      if (!pro && level.value === "aggressive") level.value = "safe";
    }
    renderLevelHelp();
  }

  function wireProButtons(){
    var activate = $("btnProActivate");
    var clear = $("btnProClear");
    if (activate && !activate.__jrComplete) {
      var cloneA = activate.cloneNode(true);
      activate.parentNode.replaceChild(cloneA, activate);
      cloneA.__jrComplete = true;
      cloneA.addEventListener("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var keyEl = $("jrProKey");
        var v = validateProKey(keyEl ? keyEl.value : "");
        if (!v.ok) { toast(msg("invalidKey")); return; }
        localStorage.setItem(PRO_KEY, v.norm);
        toast(msg("activated"));
        setTimeout(function(){ location.reload(); }, 350);
      });
    }
    if (clear && !clear.__jrComplete) {
      var cloneC = clear.cloneNode(true);
      clear.parentNode.replaceChild(cloneC, clear);
      cloneC.__jrComplete = true;
      cloneC.addEventListener("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        localStorage.removeItem(PRO_KEY);
        toast(msg("cleared"));
        setTimeout(function(){ location.reload(); }, 350);
      });
    }
  }

  function wireSamples(){
    var sample = $("selSample");
    if (!sample || sample.__jrComplete) return;
    sample.__jrComplete = true;
    sample.addEventListener("change", function(ev){
      var key = sample.value;
      if (PATCH_SAMPLES[key]) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        var input = $("jrInput");
        if (input) {
          input.value = PATCH_SAMPLES[key];
          input.dispatchEvent(new Event("input", { bubbles:true }));
        }
        return;
      }
      var selected = sample.selectedOptions && sample.selectedOptions[0];
      if (selected && selected.dataset.pro === "true" && !isPro()) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        sample.value = "";
        toast(msg("samplePro"));
      }
    }, true);
  }

  function wireLevel(){
    var sel = $("selRepairLevel");
    if (!sel || sel.__jrComplete) return;
    sel.__jrComplete = true;
    sel.addEventListener("change", function(){
      if (sel.value === "aggressive" && !isPro()) sel.value = "safe";
      renderLevelHelp();
    });
  }

  function wireHistory(){
    var hist = $("jrHistEnable");
    if (!hist || hist.__jrComplete) return;
    hist.__jrComplete = true;
    hist.checked = localStorage.getItem(HIST_KEY) === "1";
    hist.addEventListener("change", function(){
      localStorage.setItem(HIST_KEY, hist.checked ? "1" : "0");
    });
  }

  function enhanceValidate(){
    var out = $("jrValidateOut");
    if (!out || !out.textContent.trim() || out.querySelector(".jr-validate-extra")) return;
    var box = document.createElement("div");
    box.className = "jr-validate-extra";
    box.innerHTML = '<div class="jr-mini">' + msg("validateNote") + '</div><div class="jr-mini"><strong>' + msg("causesTitle") + '</strong><br>' + msg("causes") + '</div>';
    out.appendChild(box);
  }

  function enhanceLog(){
    var log = $("jrLog");
    if (log && (log.textContent || "").trim() === "—") log.textContent = msg("logHint");
    var diff = $("jrDiff");
    if (diff && !document.querySelector(".jr-diff-note")) {
      var note = document.createElement("div");
      note.className = "jr-mini jr-diff-note";
      note.textContent = msg("diffNote");
      diff.insertAdjacentElement("afterend", note);
    }
  }

  function cleanDom(){
    var explains = document.querySelectorAll("#jrExplain");
    Array.prototype.slice.call(explains, 1).forEach(function(node){ node.remove(); });
  }

  function apply(){
    insertGuide();
    cleanDom();
    applyI18n();
    syncControls();
    wireProButtons();
    wireSamples();
    wireLevel();
    wireHistory();
    enhanceValidate();
    enhanceLog();
  }

  document.addEventListener("DOMContentLoaded", function(){
    apply();
    ["btnValidate", "btnRepair", "btnFormatPretty", "btnFormatMinify", "btnReset"].forEach(function(id){
      var el = $(id);
      if (el) el.addEventListener("click", function(){ setTimeout(apply, 0); setTimeout(apply, 120); });
    });
    document.querySelectorAll(".nw-lang-btn").forEach(function(btn){
      btn.addEventListener("click", function(){ setTimeout(apply, 0); setTimeout(apply, 120); });
    });
  });
})();
