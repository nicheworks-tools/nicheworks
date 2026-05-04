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

  function renderTopNav(){
    var nav = document.getElementById("top-nav");
    if(!nav) return;

    nav.textContent = "";

    var usage = document.createElement("a");
    usage.className = "nw-link";
    usage.href = "./usage.html";
    usage.textContent = "Usage";

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
        '<textarea id="memo" rows="5"></textarea>',
      '</div>',
      '<div class="lck-actions">',
        '<button class="nw-btn" id="btn-generate" type="button">判定・ドラフト作成</button>',
        '<button class="nw-btn nw-btn--ghost" id="btn-clear" type="button">クリア</button>',
      '</div>',
      '<hr class="nw-separator" />',
      '<div id="results" aria-live="polite"></div>',
      '<div class="lck-export">',
        '<h3>エクスポート</h3>',
        '<label for="md-preview">Markdown プレビュー（無料）</label>',
        '<textarea id="md-preview" rows="10" readonly></textarea>',
        '<div class="lck-actions">',
          '<button class="nw-btn" id="btn-md-download" type="button">Download .md</button>',
        '</div>',
        '<p class="nw-note">PDF export は初期版では未提供です。必要な場合はMarkdownを保存してからPDF化してください。</p>',
      '</div>'
    ].join("");

    renderIdleResult();

    var gen = document.getElementById("btn-generate");
    if(gen) gen.addEventListener("click", function(){
      gtagSafe("event", "tool_run", {tool_slug: TOOL_SLUG, lang: document.documentElement.lang || "ja"});
      runAssessment();
    });

    var clear = document.getElementById("btn-clear");
    if(clear) clear.addEventListener("click", resetAll);

    var mdDl = document.getElementById("btn-md-download");
    if(mdDl) mdDl.addEventListener("click", function(){
      gtagSafe("event", "export_click", {tool_slug: TOOL_SLUG, type: "md"});
      downloadMD();
    });

    loadFAQ();

    gtagSafe("event", "tool_open", {tool_slug: TOOL_SLUG, lang: document.documentElement.lang || "ja"});
  }

  function selectRowHTML(id, label){
    return [
      '<div class="lck-field">',
        '<label for="' + id + '">' + label + '</label>',
        '<select id="' + id + '">',
          '<option value="unknown">Unknown</option>',
          '<option value="yes">Yes</option>',
          '<option value="no">No</option>',
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

  function downloadMD(){
    var md = last.markdown || "";
    if(!md){
      alert("先に判定・ドラフト作成を実行してください。");
      return;
    }

    var blob = new Blob([md], {type: "text/markdown;charset=utf-8"});
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

  function loadFAQ(){
    var box = document.getElementById("faq-extra");
    if(!box) return;

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

  renderTopNav();
  render();
})();
