import fs from "fs";
import path from "path";
import cheerio from "cheerio";

const __dirname = new URL(".", import.meta.url).pathname;

const targets = [
  {
    id: "netflix",
    name: "Netflix",
    site: "https://www.netflix.com",
    cancelPage: "https://help.netflix.com/ja/node/407",
    keywords: ["動画配信", "サブスク"],
    notes: "ヘルプセンターから解約手続き。アカウント設定から。"
  },
  {
    id: "amazon-prime",
    name: "Amazonプライム",
    site: "https://www.amazon.co.jp",
    cancelPage: "https://www.amazon.co.jp/gp/help/customer/display.html?nodeId=GFGWZ7FQWQ2ZMDAB",
    keywords: ["通販", "サブスク"],
    notes: "アカウントサービス内「プライム会員情報の管理」から解約。"
  },
    {
    id: "spotify",
    name: "Spotify",
    site: "https://www.spotify.com",
    cancelPage: "https://support.spotify.com/jp/article/cancel-premium/",
    keywords: ["音楽", "サブスク"],
    notes: "Webブラウザでログインし、アカウントページからキャンセル。"
  },
  {
    id: "u-next",
    name: "U-NEXT",
    site: "https://video.unext.jp",
    cancelPage: "https://help.unext.jp/guide/detail/support_kaijo",
    keywords: ["動画配信", "日本"],
    notes: "「設定・サポート」→「契約内容の確認・解約」から操作。"
  }
];

async function checkPage(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return { ok: false, status: res.status };
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = ($("title").text() || "").trim();
    return { ok: true, status: res.status, title };
  } catch (e) {
    return { ok: false, status: 0 };
  }
}

async function main() {
  const results = [];

  for (const t of targets) {
    const info = await checkPage(t.cancelPage);
    results.push({
      id: t.id,
      name: t.name,
      site: t.site,
      cancelPage: t.cancelPage,
      keywords: t.keywords,
      notes: t.notes,
      status: info.ok ? "ok" : "check",
      title: info.title || ""
    });
  }

  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "services.json"),
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  const publicDataDir = path.join(__dirname, "..", "public", "data");
  if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });
  fs.writeFileSync(
    path.join(publicDataDir, "services.json"),
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  console.log(`Updated ${results.length} services.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
