(function(){
  "use strict";

  function $(id){ return document.getElementById(id); }
  function isJa(){ return (document.documentElement.lang || "ja").toLowerCase().indexOf("ja") === 0; }

  function text(){
    return isJa() ? {
      logHint: "適用した修復、検証結果、差分確認がここに表示されます。重要なJSONは保存前に内容を確認してください。",
      causesTitle: "よくある原因",
      causes: "末尾カンマ / 閉じ括弧の不足 / 文字列のクォート漏れ / コメント入りJSON / ログや説明文の混入",
      diffNote: "差分は修復前後の変化を確認するための補助表示です。",
      validateNote: "エラーが出る場合は、行・列・周辺テキストと下の原因候補を確認してください。"
    } : {
      logHint: "Applied repairs, validation results, and diff notes appear here. Check important JSON before saving.",
      causesTitle: "Common causes",
      causes: "Trailing comma / missing closing brace / missing string quotes / comments / logs or prose mixed in",
      diffNote: "The diff helps you inspect what changed between input and output.",
      validateNote: "If validation fails, check the line, column, nearby text, and common causes below."
    };
  }

  function enhanceValidate(){
    var out = $("jrValidateOut");
    if (!out) return;
    var body = (out.textContent || "").trim();
    if (!body) return;
    if (out.querySelector(".jr-validate-extra")) return;
    var t = text();
    var box = document.createElement("div");
    box.className = "jr-validate-extra";
    box.innerHTML = '<div class="jr-mini">' + t.validateNote + '</div><div class="jr-mini"><strong>' + t.causesTitle + '</strong><br>' + t.causes + '</div>';
    out.appendChild(box);
  }

  function enhanceLog(){
    var log = $("jrLog");
    if (log && (log.textContent || "").trim() === "—") log.textContent = text().logHint;
    var diff = $("jrDiff");
    if (diff && !document.querySelector(".jr-diff-note")) {
      var note = document.createElement("div");
      note.className = "jr-mini jr-diff-note";
      note.textContent = text().diffNote;
      diff.insertAdjacentElement("afterend", note);
    }
  }

  function cleanExplain(){
    var nodes = document.querySelectorAll("#jrExplain");
    Array.prototype.slice.call(nodes, 1).forEach(function(node){ node.remove(); });
  }

  function apply(){
    cleanExplain();
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
