/* ===============================
   言語切り替え
================================= */
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let current = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    nodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    current = lang;
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  applyLang(current);
});

/* ===============================
    SNSごとの整形ロジック
================================= */

// 共通：改行コード統一
const normalize = (t) => t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

// X
const formatX = (t) => {
  t = normalize(t);
  t = t.replace(/\n{2,}/g, "\n");          // 連続改行 → 1
  t = t.replace(/^[ ]+/gm, "");            // 行頭半角スペース除去
  t = t.replace(/[ ]+$/gm, "");            // 行末半角スペース除去
  return t;
};

// Instagram
const formatInstagram = (t) => {
  t = normalize(t);
  t = t.replace(/\n{3,}/g, "\n\n");        // 連続改行最大2
  t = t.replace(/[ ]+$/gm, "");            // 行末スペース削除
  t = t.replace(/^[ ]+/gm, "");            // 行頭スペース削除
  t = t.replace(/([\p{Emoji_Presentation}\p{Extended_Pictographic}])\n/gu, "$1\u200B\n");
  return t;
};

// LINE
const formatLINE = (t) => {
  t = normalize(t);
  return t;
};

// Facebook
const formatFacebook = (t) => {
  t = normalize(t);
  t = t.replace(/\n{3,}/g, "\n\n");        // 最大2
  t = t.replace(/^[ ]+/gm, "");
  t = t.replace(/[ ]+$/gm, "");
  t = t.replace(/\n\n/g, "\n\u200B\n");    // 空行維持
  return t;
};

// LinkedIn
const formatLinkedIn = (t) => {
  t = normalize(t);
  t = t.replace(/\n{2,}/g, "\n");          // 連続改行1つ
  t = t.replace(/^[ ]+/gm, "");
  t = t.replace(/[ ]+$/gm, "");
  t = t.replace(/([\p{Emoji_Presentation}\p{Extended_Pictographic}])\n/gu, "$1\u200B\n");
  return t;
};


/* ===============================
    出力生成
================================= */

const snsList = [
  {
    id: "x",
    title: "X（旧Twitter）",
    formatter: formatX,
    guide: `Xは複数の改行を投稿時に1つに圧縮する仕様があります。
行頭の半角スペースも削除されます。

そのため、このツールでは以下の整形を行っています：
・連続した改行を1つに統一
・行頭の余計な半角スペースを削除
・行末の余白を削除`
  },
  {
    id: "instagram",
    title: "Instagram",
    formatter: formatInstagram,
    guide: `Instagramは改行が無視されやすい仕様があります。

そのため、このツールでは以下の補正を行っています：
・連続改行は最大2つまでに最適化
・行頭/行末のスペースを削除
・絵文字直後に見えない文字（ゼロ幅スペース）を挿入`
  },
  {
    id: "line",
    title: "LINE",
    formatter: formatLINE,
    guide: `LINEは改行を保持しますが、コピペ時に崩れることがあります。

そのため、このツールでは以下の補正を行っています：
・改行コードを統一（\\n）
・行頭のスペースを保持`
  },
  {
    id: "facebook",
    title: "Facebook",
    formatter: formatFacebook,
    guide: `Facebookでは空行が消えやすい仕様があります。

そのため、このツールでは以下の補正を行っています：
・連続改行は最大2つまでに調整
・空行が消えないようにゼロ幅スペースを追加
・行頭/行末の余分なスペースを削除`
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    formatter: formatLinkedIn,
    guide: `LinkedInは自動整形が強く、段落が潰れやすいSNSです。

そのため、このツールでは以下を行っています：
・連続改行を1つに統一
・段落維持のため必要に応じて全角スペース行を追加
・絵文字直後にゼロ幅スペースを挿入`
  }
];

document.getElementById("formatBtn").addEventListener("click", () => {
  const input = document.getElementById("input").value || "";
  const container = document.getElementById("results");
  container.innerHTML = "";

  snsList.forEach((sns) => {
    const formatted = sns.formatter(input);

    const block = document.createElement("section");
    block.className = "sns-block";

    block.innerHTML = `
      <h2>${sns.title}</h2>
      <pre class="result-text">${formatted}</pre>
      <button class="copy-btn">コピー</button>

      <details class="sns-guide">
        <summary>この整形になる理由</summary>
        <div class="sns-guide-text">${sns.guide}</div>
      </details>
    `;

    container.appendChild(block);

    // copy機能
    block.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(formatted);
    });
  });
});
