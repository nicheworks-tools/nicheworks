(function(){
  "use strict";
  var TOOL_SLUG = "logistics-compliance-kit-jp";
  var PRO_KEY = "nw_pro_" + TOOL_SLUG;

  function gtagSafe(){ try{ if(typeof window.gtag==="function"){ window.gtag.apply(null, arguments); } }catch(e){} }
  function isPro(){ return localStorage.getItem(PRO_KEY) === "1"; }
  function setPro(){ localStorage.setItem(PRO_KEY, "1"); }
  function qs(sel){ return document.querySelector(sel); }

  function renderTopNav(){
    var nav = document.getElementById("top-nav");
    if(!nav) return;
    nav.innerHTML = '<a class="nw-link" href="./usage.html">Usage</a><span class="nw-dot">•</span><a class="nw-link" href="./howto.html">HowTo</a>';
  }

  function render(){
    var main = document.getElementById("tool-main");
    if(!main) return;

    var pro = isPro();
    var payLink = "REPLACE_STRIPE_PAYMENT_LINK_LOGISTICS_COMPLIANCE_KIT_JP";

    main.innerHTML = `
      <div class="nw-note" id="pro-state">
        Pro: <b>${pro ? "Enabled" : "Free"}</b>
        <span class="nw-dot">•</span>
        <a class="nw-link" id="btn-unlock" href="${payLink}" target="_blank" rel="noopener">Unlock Pro</a>
        <button class="nw-btn nw-btn--ghost" id="btn-manual" type="button" style="margin-left:10px;">Enable Pro on this browser (manual)</button>
      </div>

      <h2 style="margin-top:14px;">セルフ判定フォーム</h2>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top:10px;">
        ${selRow("is_shipper","あなたは荷主（または荷主側の担当）ですか？")}
        ${selRow("has_outsourcing","運送・倉庫などを委託していますか？")}
        ${selRow("has_waiting","待機（荷待ち）が頻発していますか？")}
        ${selRow("has_strict_window","納品時間帯の指定が厳しいですか？")}
        ${selRow("has_low_visibility","現場状況が見えづらい（可視化できていない）ですか？")}
        ${selRow("has_congestion","混雑・渋滞・荷役の詰まりが多いですか？")}
      </div>

      <div style="margin-top:12px;">
        <label for="memo" style="display:block; font-weight:600;">現状メモ（任意）</label>
        <textarea id="memo" rows="5" style="width:100%; border:1px solid #ddd; border-radius:12px; padding:10px;"></textarea>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
        <button class="nw-btn" id="btn-generate" type="button">判定・ドラフト作成</button>
        <button class="nw-btn nw-btn--ghost" id="btn-clear" type="button">クリア</button>
      </div>

      <hr style="border:none; border-top:1px solid #ddd; margin:16px 0;" />

      <div id="results">
        <p class="nw-note">未実行です。「判定・ドラフト作成」を押してください。</p>
      </div>

      <div style="margin-top:14px;">
        <h3>エクスポート</h3>
        <label style="display:block; font-weight:600; margin:6px 0;">Markdown プレビュー（無料）</label>
        <textarea id="md-preview" rows="8" readonly style="width:100%; border:1px solid #ddd; border-radius:12px; padding:10px;"></textarea>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
          <button class="nw-btn" id="btn-md-download" type="button" ${pro ? "" : "disabled"}>Download .md (Pro)</button>
          <button class="nw-btn" id="btn-pdf-download" type="button" ${pro ? "" : "disabled"}>Download PDF (Pro)</button>
        </div>
        <p class="nw-note" style="margin-top:10px;">
          ※これは法的助言ではありません。断定はせず、実務の「目安」として使ってください。<br/>
          ※入力はブラウザ内で処理する想定（ただし広告/解析スクリプトは読み込まれます）。
        </p>
      </div>

      <div class="nw-doc__section" style="margin-top:14px;" id="faq-box">
        <h2>FAQ</h2>
        <div id="faq-items"><p class="nw-note">読み込み中…</p></div>
      </div>
    `;

    // bind
    var unlock = document.getElementById("btn-unlock");
    if(unlock) unlock.addEventListener("click", function(){ gtagSafe("event","pro_unlock_click",{tool_slug:TOOL_SLUG}); });

    var manual = document.getElementById("btn-manual");
    if(manual) manual.addEventListener("click", function(){
      setPro();
      gtagSafe("event","pro_manual_enable",{tool_slug:TOOL_SLUG});
      alert("Pro enabled on this browser (manual).");
      render();
    });

    var gen = document.getElementById("btn-generate");
    if(gen) gen.addEventListener("click", function(){
      gtagSafe("event","tool_run",{tool_slug:TOOL_SLUG, lang: document.documentElement.lang || "ja"});
      runAssessment();
    });

    var clear = document.getElementById("btn-clear");
    if(clear) clear.addEventListener("click", function(){
      resetAll();
    });

    var mdDl = document.getElementById("btn-md-download");
    if(mdDl) mdDl.addEventListener("click", function(){
      if(!isPro()){ alert("Unlock Pro to export."); return; }
      gtagSafe("event","export_click",{tool_slug:TOOL_SLUG, type:"md"});
      downloadMD();
    });

    var pdfDl = document.getElementById("btn-pdf-download");
    if(pdfDl) pdfDl.addEventListener("click", function(){
      gtagSafe("event","export_click",{tool_slug:TOOL_SLUG, type:"pdf"});
      handlePDF();
    });

    // initial faq load
    loadFAQ();

    // tool open
    gtagSafe("event","tool_open",{tool_slug:TOOL_SLUG, lang: document.documentElement.lang || "ja"});
  }

  function selRow(id, label){
    return `
      <div>
        <label for="${id}" style="display:block; font-weight:600; margin-bottom:6px;">${label}</label>
        <select id="${id}" style="width:100%; border:1px solid #ddd; border-radius:12px; padding:10px;">
          <option value="unknown">Unknown</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    `;
  }

  // state
  var last = { level:"", why:[], checklist:[], plan:"", markdown:"" };

  function getVal(id){
    var el = document.getElementById(id);
    return el ? el.value : "unknown";
  }

  function resetAll(){
    ["is_shipper","has_outsourcing","has_waiting","has_strict_window","has_low_visibility","has_congestion"].forEach(function(id){
      var el=document.getElementById(id); if(el) el.value="unknown";
    });
    var memo=document.getElementById("memo"); if(memo) memo.value="";
    var res=document.getElementById("results"); if(res) res.innerHTML='<p class="nw-note">未実行です。「判定・ドラフト作成」を押してください。</p>';
    var md=document.getElementById("md-preview"); if(md) md.value="";
    last = { level:"", why:[], checklist:[], plan:"", markdown:"" };
  }

  function runAssessment(){
    // TASK 07: Heuristic v1 (non-legal, non-assertive)
    // - Do NOT claim legal compliance/illegality.
    // - Output is “目安”.
    // - High: 3+ yes signals
    // - Medium: 1-2 yes signals
    // - Low: 0 yes signals with enough inputs
    // - Unknown: too many unknowns and no signal
    // For now, just produce something deterministic.
    var signals = {
      waiting: getVal("has_waiting")==="yes",
      window: getVal("has_strict_window")==="yes",
      outsourcing: getVal("has_outsourcing")==="yes",
      congestion: getVal("has_congestion")==="yes",
      visibility: getVal("has_low_visibility")==="yes"
    };
    var yesCount = Object.keys(signals).filter(function(k){return signals[k];}).length;
    var unknownCount = ["is_shipper","has_outsourcing","has_waiting","has_strict_window","has_low_visibility","has_congestion"]
      .map(getVal).filter(function(v){return v==="unknown";}).length;

    var level = "不明";
    if(unknownCount >= 5 && yesCount === 0) level = "不明";
    else if(yesCount >= 3) level = "高";
    else if(yesCount >= 1) level = "中";
    else level = "低";

    var why = [];
    if(signals.waiting) why.push("待機（荷待ち）");
    if(signals.window) why.push("納品時間帯の厳しさ");
    if(signals.outsourcing) why.push("委託あり");
    if(signals.congestion) why.push("混雑/詰まり");
    if(signals.visibility) why.push("可視化不足");
    if(why.length===0) why.push("顕著なシグナルが少ない（または未入力が多い）");

    var checklist = [];
    if(signals.waiting) checklist.push("待機の発生地点/時間を記録し、原因（バース不足/前工程遅延）を分類する");
    if(signals.window) checklist.push("時間帯指定の根拠（商習慣/受入体制）を整理し、緩和余地を確認する");
    if(signals.visibility) checklist.push("現場状況（入出庫/到着/待機）を簡易に可視化する指標を決める");
    if(signals.outsourcing) checklist.push("委託先とKPI（待機/積載/遅延）を合意し、定例でレビューする");
    if(signals.congestion) checklist.push("混雑のピーク時間を避ける搬入計画（予約/平準化）を検討する");
    if(checklist.length===0) checklist.push("まず現状を棚卸し（待機/時間帯指定/可視化/委託）し、課題仮説を1つ置く");

    var plan = [
      "1 現状整理：",
      "  - 未入力/未確定があれば補完（現場ヒアリング、記録）",
      "2 目標：",
      "  - 待機時間削減、平準化、可視化など（仮）",
      "3 施策候補：",
      "  - " + checklist.slice(0,3).join(" / "),
      "4 体制：",
      "  - 荷主側責任者・委託先窓口・現場担当を明確化",
      "5 スケジュール：",
      "  - 2週間：記録開始 / 1ヶ月：仮説検証 / 3ヶ月：施策定着（仮）",
      "6 リスク・留意点：",
      "  - 断定せず、データと合意で進める"
    ].join("\n");

    var md = buildMarkdown(level, why, checklist, plan);

    last.level = level;
    last.why = why;
    last.checklist = checklist;
    last.plan = plan;
    last.markdown = md;

    var res = document.getElementById("results");
    if(res){
      res.innerHTML = `
        <h3>判定結果（目安）</h3>
        <p><b>判定：</b>${level}</p>
        <p><b>根拠（検出シグナル）：</b>${why.join(" / ")}</p>
        <h3>次にやること</h3>
        <ul>${checklist.map(function(x){return "<li>"+x+"</li>";}).join("")}</ul>
        <h3>中長期計画ドラフト</h3>
        <pre class="nw-pre" style="white-space:pre-wrap;">${plan}</pre>
      `;
    }

    var mdPrev = document.getElementById("md-preview");
    if(mdPrev) mdPrev.value = md;
  }

  function buildMarkdown(level, why, checklist, plan){
    var ts = new Date().toISOString();
    return [
      "# 物流効率化 対応キット（荷主向け）",
      "",
      "- Timestamp: " + ts,
      "- 判定（目安）: " + level,
      "- 根拠: " + why.join(" / "),
      "",
      "## 次にやること",
      checklist.map(function(x){ return "- " + x; }).join("\n"),
      "",
      "## 中長期計画ドラフト",
      "```",
      plan,
      "```",
      "",
      "※これは法的助言ではありません。断定はせず、実務の目安として使ってください。"
    ].join("\n");
  }

  function downloadMD(){
    var md = last.markdown || "";
    if(!md){ alert("Nothing to export yet."); return; }
    var blob = new Blob([md], {type:"text/markdown;charset=utf-8"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "logistics-plan.md";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }

  function handlePDF(){
    if(!isPro()){
      alert("Unlock Pro to export.");
      return;
    }
    alert("PDF export is coming soon. Use Markdown export for now.");
  }

  function loadFAQ(){
    var box = document.getElementById("faq-items");
    if(!box) return;
    fetch("./qa.json").then(function(r){ return r.json(); }).then(function(items){
      if(!Array.isArray(items) || items.length===0){
        box.innerHTML = '<p class="nw-note">FAQは準備中です。</p>';
        return;
      }
      var show = items.slice(0,6);
      box.innerHTML = show.map(function(it, idx){
        var q = it.q || it.question || ("Q" + (idx+1));
        var a = it.a || it.answer || "";
        return '<details style="margin:8px 0;"><summary style="cursor:pointer; font-weight:600;">'+q+'</summary><div class="nw-note" style="margin-top:8px;">'+a+'</div></details>';
      }).join("");
    }).catch(function(){
      box.innerHTML = '<p class="nw-note">FAQの読み込みに失敗しました。</p>';
    });
  }

  // boot
  renderTopNav();
  render();

})();
