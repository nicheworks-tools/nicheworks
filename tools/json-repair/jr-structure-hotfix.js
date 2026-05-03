(function(){
  "use strict";

  var PRO_KEY = "jr_pro_key";
  var HIST_KEY = "jr_hist_enabled";

  var TEXT = {
    ja: {
      safe: "Safe：意味を変えにくい範囲で、末尾カンマやコメント除去などを中心に修復します。",
      standard: "Standard：Safeに加えて、ログ内のJSON候補抽出も試します。",
      aggressive: "Aggressive：シングルクォート、未クォートキー、Python風リテラルなども試します。意味が変わる可能性があります。",
      aggressiveLocked: "Aggressiveは追加機能です。無料ではSafe / Standardを使ってください。",
      invalidKey: "Proキーが無効です。",
      activated: "Proを有効化しました。ページを再読み込みします。",
      cleared: "Proを解除しました。ページを再読み込みします。",
      samplePro: "このサンプルはAggressive修復の例です。無料版では完全修復できない場合があります。"
    },
    en: {
      safe: "Safe: Repairs low-risk issues such as trailing commas and comments.",
      standard: "Standard: Includes Safe repair and JSON candidate extraction from mixed logs.",
      aggressive: "Aggressive: Tries single quotes, unquoted keys, and Python-like literals. It may change meaning.",
      aggressiveLocked: "Aggressive is an extra feature. Use Safe / Standard for free.",
      invalidKey: "Invalid Pro key.",
      activated: "Pro activated. Reloading the page.",
      cleared: "Pro cleared. Reloading the page.",
      samplePro: "This sample is for Aggressive repair. The free version may not fully repair it."
    }
  };

  var PATCH_SAMPLES = {
    array: '[\n  { "id": 1, "name": "alpha" },\n  { "id": 2, "name": "beta" }\n]\n',
    config: '{\n  "name": "demo",\n  "enabled": true,\n  "limits": {\n    "max": 10,\n    "retry": 3\n  }\n}\n'
  };

  function $(id){ return document.getElementById(id); }
  function lang(){ return (document.documentElement.lang || navigator.language || "ja").toLowerCase().startsWith("ja") ? "ja" : "en"; }
  function isPro(){ return !!localStorage.getItem(PRO_KEY); }

  function toast(message){
    var box = $("jrToast");
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
    clearTimeout(box.__jrHotfixTimer);
    box.__jrHotfixTimer = setTimeout(function(){ box.hidden = true; }, 2400);
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
    var body = m[1] + m[2];
    var want = checksum97(body).toString(36).toUpperCase().padStart(2, "0");
    var got = m[3].slice(-2);
    return { ok: got === want, norm:k };
  }

  function renderLevelHelp(){
    var help = $("jrLevelHelp");
    var sel = $("selRepairLevel");
    if (!help || !sel) return;
    var l = lang();
    var level = sel.value || "safe";
    if (level === "aggressive" && !isPro()) {
      help.textContent = TEXT[l].aggressiveLocked;
      return;
    }
    help.textContent = TEXT[l][level] || TEXT[l].safe;
  }

  function syncProSamples(){
    var sample = $("selSample");
    if (!sample) return;
    var pro = isPro();
    Array.prototype.forEach.call(sample.querySelectorAll("option[data-pro='true']"), function(opt){
      opt.disabled = !pro;
      opt.hidden = !pro;
    });
    if (!pro && sample.selectedOptions[0] && sample.selectedOptions[0].dataset.pro === "true") {
      sample.value = "";
    }
  }

  function syncAggressive(){
    var sel = $("selRepairLevel");
    if (!sel) return;
    var opt = Array.prototype.find.call(sel.options, function(o){ return o.value === "aggressive"; });
    if (opt) opt.disabled = !isPro();
    if (!isPro() && sel.value === "aggressive") sel.value = "safe";
    renderLevelHelp();
  }

  function wireCleanProButtons(){
    var activate = $("btnProActivate");
    var clear = $("btnProClear");

    if (activate && !activate.__jrHotfixCleaned) {
      var cloneA = activate.cloneNode(true);
      activate.parentNode.replaceChild(cloneA, activate);
      cloneA.__jrHotfixCleaned = true;
      cloneA.addEventListener("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var keyEl = $("jrProKey");
        var v = validateProKey(keyEl ? keyEl.value : "");
        if (!v.ok) {
          toast(TEXT[lang()].invalidKey);
          return;
        }
        localStorage.setItem(PRO_KEY, v.norm);
        toast(TEXT[lang()].activated);
        setTimeout(function(){ location.reload(); }, 350);
      });
    }

    if (clear && !clear.__jrHotfixCleaned) {
      var cloneC = clear.cloneNode(true);
      clear.parentNode.replaceChild(cloneC, clear);
      cloneC.__jrHotfixCleaned = true;
      cloneC.addEventListener("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        localStorage.removeItem(PRO_KEY);
        toast(TEXT[lang()].cleared);
        setTimeout(function(){ location.reload(); }, 350);
      });
    }
  }

  function wireSamplePatch(){
    var sample = $("selSample");
    if (!sample || sample.__jrHotfixSample) return;
    sample.__jrHotfixSample = true;
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
        toast(TEXT[lang()].samplePro);
      }
    }, true);
  }

  function wireLevelPatch(){
    var sel = $("selRepairLevel");
    if (!sel || sel.__jrHotfixLevel) return;
    sel.__jrHotfixLevel = true;
    sel.addEventListener("change", function(){
      if (sel.value === "aggressive" && !isPro()) sel.value = "safe";
      renderLevelHelp();
    });
  }

  function wireHistoryToggle(){
    var hist = $("jrHistEnable");
    if (!hist || hist.__jrHotfixHist) return;
    hist.__jrHotfixHist = true;
    hist.checked = localStorage.getItem(HIST_KEY) === "1";
    hist.addEventListener("change", function(){
      localStorage.setItem(HIST_KEY, hist.checked ? "1" : "0");
    });
  }

  function assertDom(){
    var explains = document.querySelectorAll("#jrExplain");
    if (explains.length > 1) {
      Array.prototype.slice.call(explains, 1).forEach(function(node){ node.remove(); });
    }
  }

  function apply(){
    assertDom();
    syncAggressive();
    syncProSamples();
    wireCleanProButtons();
    wireSamplePatch();
    wireLevelPatch();
    wireHistoryToggle();
    renderLevelHelp();
  }

  document.addEventListener("DOMContentLoaded", function(){
    apply();
    document.querySelectorAll(".nw-lang-btn").forEach(function(btn){
      btn.addEventListener("click", function(){ setTimeout(apply, 0); setTimeout(apply, 50); });
    });
  });
})();
