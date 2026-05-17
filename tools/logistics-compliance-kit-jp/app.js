(function(){
  "use strict";

  var TOOL_SLUG = "logistics-compliance-kit-jp";

  function gtagSafe(){
    try{
      if(typeof window.gtag === "function"){
        window.gtag.apply(null, arguments);
      }
    }catch(e){}
  }

  function isPro(){
    return document.documentElement.dataset.proActive === "true";
  }

  function renderTopNav(){
    var nav = document.getElementById("top-nav");
    if(!nav) return;

    nav.textContent = "";

    var usage = document.createElement("a");
    usage.className = "nw-link";
    usage.href = "./usage.html";
    usage.textContent = "使い方";

    var dot = document.createElement("span");
    dot.className = "nw-dot";
    dot.textContent = "•";

    var home = document.createElement("a");
    home.className = "nw-link";
    home.href = "/";
    home.textContent = "Home";

    nav.appendChild(usage);
    nav.appendChild(dot);
    nav.appendChild(home);
  }

  function render(){
    var main = document.getElementById("tool-main");
    if(!main) return;

    main.innerHTML = [
      '<h2>セルフ判定フォーム</h2>',
      '<p class="nw-note">現状メモは判定ロジックには使わず、出力メモとして記録します。</p>',
      '<div class="lck-form-grid">',
        selectRowHTML("is_shipper", "あなたは荷主（または荷主側の担当）ですか？"),
        selectRowHTML("has_outsourcing", "運送・倉庫などを委託していますか？"),
        selectRowHTML("has_waiting", "待機（荷待ち）が頻発していますか？"),
        selectRowHTML("has_strict_window", "納品時間帯の指定が厳しいですか？"),
        selectRowHTML("has_low_visibility", "現場状況が見えづらい（可視化できていない）ですか？"),
        selectRowHTML("has_congestion", "混雑・渋滞・荷役の詰まりが多いですか？"),
      '</div>',
      '<div class="lck-field-block">',
        '<label for="memo">現状メモ（任意）</label>',
        '<textarea id="memo" rows="5" placeholder="例：月曜午前に待機が集中。委託先から荷待ち時間の共有あり。"></textarea>',
      '</div>',
      '<div class="lck-actions">',
        '<button class="nw-btn" id="btn-generate" type="button">判定・ドラフト作成</button>',
        '<button class="nw-btn nw-btn--ghost" id="btn-clear" type="button">クリア</button>',
      '</div>',
      '<hr class="nw-separator" />',
      '<div id="results" aria-live="polite"></div>',
      '<div class="lck-export">',
        '<h3>Markdown preview（無料）</h3>',
        '<p class="nw-note">判定結果、根拠シグナル、次にやること、中長期計画ドラフト、現状メモの画面反映とMarkdown previewは無料で利用できます。</p>',
        '<label for="md-preview">Markdown preview</label>',
        '<textarea id="md-preview" rows="10" readonly></textarea>',
      '</div>',
      '<section class="lck-pro-panel" aria-labelledby="pro-panel-title">',
        '<div class="lck-pro-heading">',
          '<h3 id="pro-panel-title">NicheWorks Pro output</h3>',
          '<span class="lck-pro-status" data-pro-status>Previewモードです。このブラウザでは共通Proがまだ有効ではありません。</span>',
        '</div>',
        '<p class="nw-note">共通クライアント <code>/assets/nw-pro.js</code> の <code>NWPro.getLocalStatus()</code> で NicheWorks Pro（entitlement: <code>nicheworks_pro</code>）を確認します。localStorageは補助状態で、サーバー側D1 <code>pro_entitlements</code> が正です。</p>',
        '<div data-pro-preview>',
          '<p class="nw-note">Pro未有効時はPreviewモードです。社内共有メモ、委託先確認メモ、改善計画たたき台、GitHub Issue、Codex依頼文のサンプルを表示します。Copy / export / save 操作は共通Pro有効後に解放されます。</p>',
          '<div class="lck-actions"><a class="nw-btn" data-pro-buy href="https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209" target="_blank" rel="noopener noreferrer">Buy Pro</a></div>',
          '<div id="pro-preview-samples" class="lck-pro-grid"></div>',
        '</div>',
        '<div data-pro-only hidden>',
          '<p class="nw-note">Pro解放済みです。現在の入力と判定結果からPro出力を生成し、copy/export/saveできます。</p>',
          '<div class="lck-actions">',
            '<button class="nw-btn" id="btn-copy-internal" type="button" data-pro-only hidden>Copy社内共有メモ</button>',
            '<button class="nw-btn" id="btn-copy-vendor" type="button" data-pro-only hidden>Copy委託先確認メモ</button>',
            '<button class="nw-btn" id="btn-copy-improvement" type="button" data-pro-only hidden>Copy改善計画</button>',
            '<button class="nw-btn" id="btn-copy-issue" type="button" data-pro-only hidden>Copy GitHub Issue</button>',
            '<button class="nw-btn" id="btn-copy-codex" type="button" data-pro-only hidden>Copy Codex task</button>',
            '<button class="nw-btn nw-btn--ghost" id="btn-export-handoff" type="button" data-pro-only hidden>Export handoff Markdown</button>',
            '<button class="nw-btn nw-btn--ghost" id="btn-export-json" type="button" data-pro-only hidden>Export JSON</button>',
            '<button class="nw-btn nw-btn--ghost" id="btn-save-markdown" type="button" data-pro-only hidden>Markdown保存</button>',
          '</div>',
          '<div id="pro-outputs" class="lck-pro-grid"></div>',
        '</div>',
        '<p class="nw-note">購入後、このブラウザではNicheWorks Proが有効になります。タブやブラウザを閉じても通常は維持されます。ただし、別端末・別ブラウザ・シークレットモード・サイトデータ削除後は再度有効化が必要です。</p>',
      '</section>'
    ].join("");

    renderIdleResult();
    renderProSamples();
    renderProOutputs();
    bindEvents();
    if(window.NWLogisticsProBridge && typeof window.NWLogisticsProBridge.refresh === "function"){
      window.NWLogisticsProBridge.refresh();
    }

    loadFAQ();
    gtagSafe("event", "tool_open", {tool_slug: TOOL_SLUG, lang: document.documentElement.lang || "ja"});
  }

  function bindEvents(){
    var gen = document.getElementById("btn-generate");
    if(gen) gen.addEventListener("click", function(){
      gtagSafe("event", "tool_run", {tool_slug: TOOL_SLUG, lang: document.documentElement.lang || "ja"});
      runAssessment();
    });

    var clear = document.getElementById("btn-clear");
    if(clear) clear.addEventListener("click", resetAll);

    bindProButton("btn-copy-internal", function(){ copyProText("internal", "社内共有メモをコピーしました。"); });
    bindProButton("btn-copy-vendor", function(){ copyProText("vendor", "委託先確認メモをコピーしました。"); });
    bindProButton("btn-copy-improvement", function(){ copyProText("improvement", "改善計画をコピーしました。"); });
    bindProButton("btn-copy-issue", function(){ copyProText("issue", "GitHub Issueをコピーしました。"); });
    bindProButton("btn-copy-codex", function(){ copyProText("codex", "Codex taskをコピーしました。"); });
    bindProButton("btn-export-handoff", exportHandoffMarkdown);
    bindProButton("btn-export-json", exportJSON);
    bindProButton("btn-save-markdown", downloadMD);
  }

  function bindProButton(id, handler){
    var button = document.getElementById(id);
    if(!button) return;
    button.addEventListener("click", function(){
      if(!isPro()){
        alert("共通Proが有効になると利用できます。");
        return;
      }
      handler();
    });
  }

  function selectRowHTML(id, label){
    return [
      '<div class="lck-field">',
        '<label for="' + id + '">' + label + '</label>',
        '<select id="' + id + '">',
          '<option value="unknown">不明</option>',
          '<option value="yes">はい</option>',
          '<option value="no">いいえ</option>',
        '</select>',
      '</div>'
    ].join("");
  }

  var last = {
    level: "",
    why: [],
    checklist: [],
    plan: "",
    memo: "",
    markdown: ""
  };

  var criteriaLines = [
    "高：待機・時間指定・委託・混雑・可視化不足などのシグナルが3つ以上",
    "中：シグナルが1〜2個",
    "低：顕著なシグナルが少ない",
    "不明：未入力が多く、判断材料が不足"
  ];

  var sampleState = {
    level: "中",
    why: ["待機（荷待ち）", "納品時間帯の厳しさ"],
    checklist: [
      "待機の発生地点/時間を記録し、原因（バース不足/前工程遅延）を分類する",
      "時間帯指定の根拠（商習慣/受入体制）を整理し、緩和余地を確認する"
    ],
    plan: [
      "1 現状整理：待機発生地点と時間帯を記録",
      "2 目標：待機時間の削減と納品枠の平準化",
      "3 施策候補：受入枠の見直し / 委託先KPI共有",
      "4 体制：荷主側責任者・委託先窓口・現場担当を明確化"
    ].join("\n"),
    memo: "サンプル：月曜午前に搬入口待機が発生。委託先から納品枠見直しの相談あり。",
    markdown: ""
  };

  sampleState.markdown = buildMarkdown(sampleState.level, sampleState.why, sampleState.checklist, sampleState.plan, sampleState.memo);

  function getVal(id){
    var el = document.getElementById(id);
    return el ? el.value : "unknown";
  }

  function getMemo(){
    var el = document.getElementById("memo");
    return el ? el.value.trim() : "";
  }

  function resetAll(){
    ["is_shipper", "has_outsourcing", "has_waiting", "has_strict_window", "has_low_visibility", "has_congestion"].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.value = "unknown";
    });

    var memo = document.getElementById("memo");
    if(memo) memo.value = "";

    var md = document.getElementById("md-preview");
    if(md) md.value = "";

    last = {
      level: "",
      why: [],
      checklist: [],
      plan: "",
      memo: "",
      markdown: ""
    };

    renderIdleResult();
    renderProOutputs();
  }

  function runAssessment(){
    var signals = {
      waiting: getVal("has_waiting") === "yes",
      window: getVal("has_strict_window") === "yes",
      outsourcing: getVal("has_outsourcing") === "yes",
      congestion: getVal("has_congestion") === "yes",
      visibility: getVal("has_low_visibility") === "yes"
    };

    var yesCount = Object.keys(signals).filter(function(k){ return signals[k]; }).length;
    var unknownCount = ["is_shipper", "has_outsourcing", "has_waiting", "has_strict_window", "has_low_visibility", "has_congestion"]
      .map(getVal)
      .filter(function(v){ return v === "unknown"; })
      .length;

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
    if(why.length === 0) why.push("顕著なシグナルが少ない（または未入力が多い）");

    var checklist = [];
    if(signals.waiting) checklist.push("待機の発生地点/時間を記録し、原因（バース不足/前工程遅延）を分類する");
    if(signals.window) checklist.push("時間帯指定の根拠（商習慣/受入体制）を整理し、緩和余地を確認する");
    if(signals.visibility) checklist.push("現場状況（入出庫/到着/待機）を簡易に可視化する指標を決める");
    if(signals.outsourcing) checklist.push("委託先とKPI（待機/積載/遅延）を合意し、定例でレビューする");
    if(signals.congestion) checklist.push("混雑のピーク時間を避ける搬入計画（予約/平準化）を検討する");
    if(checklist.length === 0) checklist.push("まず現状を棚卸し（待機/時間帯指定/可視化/委託）し、課題仮説を1つ置く");

    var plan = [
      "1 現状整理：",
      "  - 未入力/未確定があれば補完（現場ヒアリング、記録）",
      "2 目標：",
      "  - 待機時間削減、平準化、可視化など（仮）",
      "3 施策候補：",
      "  - " + checklist.slice(0, 3).join(" / "),
      "4 体制：",
      "  - 荷主側責任者・委託先窓口・現場担当を明確化",
      "5 スケジュール：",
      "  - 2週間：記録開始 / 1ヶ月：仮説検証 / 3ヶ月：施策定着（仮）",
      "6 リスク・留意点：",
      "  - 断定せず、データと合意で進める"
    ].join("\n");

    var memo = getMemo();
    var md = buildMarkdown(level, why, checklist, plan, memo);

    last = {
      level: level,
      why: why,
      checklist: checklist,
      plan: plan,
      memo: memo,
      markdown: md
    };

    renderResult(level, why, checklist, plan, memo);

    var mdPrev = document.getElementById("md-preview");
    if(mdPrev) mdPrev.value = md;
    renderProOutputs();
  }

  function buildMarkdown(level, why, checklist, plan, memo){
    var ts = new Date().toISOString();
    var parts = [
      "# 物流効率化セルフチェック・計画ドラフト",
      "",
      "- Timestamp: " + ts,
      "- 判定（目安）: " + level,
      "- 根拠: " + why.join(" / "),
      "",
      "## 判定基準",
      criteriaLines.map(function(x){ return "- " + x; }).join("\n"),
      "",
      "## 次にやること",
      checklist.map(function(x){ return "- " + x; }).join("\n")
    ];

    if(memo){
      parts.push("", "## 現状メモ", memo, "", "※現状メモは判定ロジックには使わず、出力メモとして記録しています。");
    }

    parts.push(
      "",
      "## 中長期計画ドラフト",
      "```",
      plan,
      "```",
      "",
      "※これは法的助言ではありません。法令対応、行政提出、契約義務、荷主責任の有無を判定するものではありません。制度対応や法的判断は、公式情報、専門家、社内法務・物流部門に確認してください。"
    );

    return parts.join("\n");
  }

  function clearNode(node){
    if(!node) return;
    while(node.firstChild) node.removeChild(node.firstChild);
  }

  function appendTextEl(parent, tag, text, className){
    var node = document.createElement(tag);
    if(className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function renderIdleResult(){
    var res = document.getElementById("results");
    if(!res) return;
    clearNode(res);
    appendTextEl(res, "p", "未実行です。「判定・ドラフト作成」を押してください。", "nw-note");
  }

  function renderResult(level, why, checklist, plan, memo){
    var res = document.getElementById("results");
    if(!res) return;

    clearNode(res);

    appendTextEl(res, "h3", "判定結果（目安）");

    var levelP = document.createElement("p");
    var levelStrong = document.createElement("b");
    levelStrong.textContent = "判定：";
    levelP.appendChild(levelStrong);
    levelP.appendChild(document.createTextNode(level));
    res.appendChild(levelP);

    var whyP = document.createElement("p");
    var whyStrong = document.createElement("b");
    whyStrong.textContent = "根拠（検出シグナル）：";
    whyP.appendChild(whyStrong);
    whyP.appendChild(document.createTextNode(why.join(" / ")));
    res.appendChild(whyP);

    appendTextEl(res, "h3", "次にやること");
    var ul = document.createElement("ul");
    checklist.forEach(function(item){
      appendTextEl(ul, "li", item);
    });
    res.appendChild(ul);

    appendTextEl(res, "h3", "判定基準");
    var criteria = document.createElement("ul");
    criteriaLines.forEach(function(item){
      appendTextEl(criteria, "li", item);
    });
    res.appendChild(criteria);

    if(memo){
      appendTextEl(res, "h3", "現状メモ");
      appendTextEl(res, "p", memo, "nw-note");
      appendTextEl(res, "p", "現状メモは判定ロジックには使わず、出力メモとして記録しています。", "nw-note");
    }

    appendTextEl(res, "h3", "中長期計画ドラフト");
    var pre = document.createElement("pre");
    pre.className = "nw-pre";
    pre.textContent = plan;
    res.appendChild(pre);
  }

  function currentProState(){
    return last.markdown ? last : sampleState;
  }

  function proOutputs(state){
    var base = state || currentProState();
    var signalText = base.why.join(" / ");
    var checklistText = base.checklist.map(function(item){ return "- " + item; }).join("\n");
    var memoText = base.memo || "（現状メモ未入力）";
    var internal = [
      "# 社内共有メモ",
      "",
      "## 判定サマリー",
      "- 目安レベル: " + base.level,
      "- 根拠シグナル: " + signalText,
      "",
      "## 共有したい現状",
      memoText,
      "",
      "## 次アクション",
      checklistText,
      "",
      "## 注意",
      "この出力は状況整理用です。法的判断や行政提出の確定資料ではありません。"
    ].join("\n");

    var vendor = [
      "# 委託先確認メモ",
      "",
      "委託先と確認したい事項を、事実確認ベースで整理します。",
      "",
      "## 確認事項",
      checklistText,
      "",
      "## 共有メモ",
      memoText,
      "",
      "## 合意したい運用",
      "- 待機・遅延・混雑などの記録粒度",
      "- レビュー頻度と窓口",
      "- 改善施策の試行期間"
    ].join("\n");

    var improvement = [
      "# 改善計画たたき台",
      "",
      "## 目的",
      "物流効率化に向けて、待機・時間指定・可視化・混雑の課題を小さく検証します。",
      "",
      "## 現状シグナル",
      "- " + signalText,
      "",
      "## 計画ドラフト",
      base.plan,
      "",
      "## 次回レビュー",
      "記録開始から2週間後に、待機時間・混雑時間帯・委託先コメントを確認します。"
    ].join("\n");

    var issue = [
      "## Summary",
      "Logistics Compliance Kit JPで判定された物流効率化課題を整理し、初期改善タスクに落とし込みます。",
      "",
      "## Signals",
      "- Level: " + base.level,
      "- Evidence: " + signalText,
      "",
      "## Tasks",
      checklistText,
      "",
      "## Memo",
      memoText,
      "",
      "## Acceptance criteria",
      "- 現状記録の項目が決まっている",
      "- 委託先/現場との確認事項が共有されている",
      "- 2週間後のレビュー日が設定されている"
    ].join("\n");

    var codex = [
      "あなたはNicheWorksの業務改善支援エージェントです。",
      "以下の物流効率化セルフチェック結果をもとに、社内共有用の改善タスク一覧と委託先確認メモをMarkdownで整えてください。",
      "",
      "# 入力",
      "- 判定: " + base.level,
      "- 根拠シグナル: " + signalText,
      "- 現状メモ: " + memoText,
      "",
      "# 次にやること",
      checklistText,
      "",
      "# 制約",
      "- 法的助言として断定しない",
      "- 公式情報や専門家確認が必要な点を明示する",
      "- 社内で実行しやすい粒度に分解する"
    ].join("\n");

    var handoff = [
      "# Logistics Compliance Handoff",
      "",
      "## Free assessment Markdown",
      base.markdown,
      "",
      internal,
      "",
      vendor,
      "",
      improvement,
      "",
      "## GitHub Issue",
      issue,
      "",
      "## Codex task",
      codex
    ].join("\n");

    return {
      internal: internal,
      vendor: vendor,
      improvement: improvement,
      issue: issue,
      codex: codex,
      handoff: handoff
    };
  }

  function renderProSamples(){
    var box = document.getElementById("pro-preview-samples");
    if(!box) return;
    renderOutputCards(box, proOutputs(sampleState), true);
  }

  function renderProOutputs(){
    var box = document.getElementById("pro-outputs");
    if(!box) return;
    renderOutputCards(box, proOutputs(currentProState()), false);
  }

  function renderOutputCards(box, outputs, preview){
    clearNode(box);
    var labels = [
      ["internal", preview ? "社内共有メモのサンプル" : "社内共有メモ"],
      ["vendor", preview ? "委託先確認メモのサンプル" : "委託先確認メモ"],
      ["improvement", preview ? "改善計画たたき台のサンプル" : "改善計画たたき台"],
      ["issue", preview ? "GitHub Issueサンプル" : "GitHub Issue形式"],
      ["codex", preview ? "Codex依頼文サンプル" : "Codex依頼文"]
    ];

    labels.forEach(function(item){
      var card = document.createElement("article");
      card.className = "lck-pro-card";
      appendTextEl(card, "h4", item[1]);
      var pre = document.createElement("pre");
      pre.className = "nw-pre";
      pre.textContent = outputs[item[0]];
      card.appendChild(pre);
      box.appendChild(card);
    });
  }

  function ensureMarkdown(){
    if(!last.markdown){
      runAssessment();
    }
    return last.markdown;
  }

  function downloadMD(){
    var md = ensureMarkdown();
    if(!md){
      alert("先に判定・ドラフト作成を実行してください。");
      return;
    }
    downloadFile("logistics-plan.md", md, "text/markdown;charset=utf-8");
    gtagSafe("event", "export_click", {tool_slug: TOOL_SLUG, type: "markdown"});
  }

  function copyProText(key, message){
    var outputs = proOutputs(currentProState());
    var text = outputs[key] || "";
    if(!text) return;
    if(navigator.clipboard && typeof navigator.clipboard.writeText === "function"){
      navigator.clipboard.writeText(text).then(function(){
        alert(message);
      }).catch(function(){
        fallbackCopy(text, message);
      });
    }else{
      fallbackCopy(text, message);
    }
    gtagSafe("event", "pro_copy", {tool_slug: TOOL_SLUG, type: key});
  }

  function fallbackCopy(text, message){
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "readonly");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try{ document.execCommand("copy"); }catch(e){}
    area.remove();
    alert(message);
  }

  function exportHandoffMarkdown(){
    var outputs = proOutputs(currentProState());
    downloadFile("logistics-handoff.md", outputs.handoff, "text/markdown;charset=utf-8");
    gtagSafe("event", "export_click", {tool_slug: TOOL_SLUG, type: "handoff_markdown"});
  }

  function exportJSON(){
    var state = currentProState();
    var payload = {
      tool: TOOL_SLUG,
      generatedAt: new Date().toISOString(),
      entitlement: "nicheworks_pro",
      assessment: {
        level: state.level,
        why: state.why,
        checklist: state.checklist,
        plan: state.plan,
        memo: state.memo,
        markdown: state.markdown
      },
      proOutputs: proOutputs(state)
    };
    downloadFile("logistics-handoff.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
    gtagSafe("event", "export_click", {tool_slug: TOOL_SLUG, type: "json"});
  }

  function downloadFile(filename, content, type){
    var blob = new Blob([content], {type: type});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(function(){
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }

  function loadFAQ(){
    var box = document.getElementById("faq-extra");
    if(!box || box.dataset.loaded === "true") return;
    box.dataset.loaded = "true";

    fetch("./qa.json")
      .then(function(r){
        if(!r.ok) throw new Error("FAQ HTTP error");
        return r.json();
      })
      .then(function(items){
        if(!Array.isArray(items) || items.length === 0) return;

        var heading = document.createElement("h3");
        heading.textContent = "追加FAQ";
        box.appendChild(heading);

        items.slice(0, 6).forEach(function(item, idx){
          var q = item.q || item.question || ("Q" + (idx + 1));
          var a = item.a || item.answer || "";

          var details = document.createElement("details");
          var summary = document.createElement("summary");
          var answer = document.createElement("p");

          summary.textContent = q;
          answer.textContent = a;

          details.appendChild(summary);
          details.appendChild(answer);
          box.appendChild(details);
        });
      })
      .catch(function(){
        // Static FAQ is already present in HTML. Missing qa.json should not look like a public-page failure.
      });
  }

  window.addEventListener("nw-logistics-pro-change", function(){
    renderProOutputs();
  });

  renderTopNav();
  render();
})();
