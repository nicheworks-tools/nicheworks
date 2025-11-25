async function loadServices() {
  try {
    const res = await fetch("./data/services.json", { cache: "no-store" });
    if (!res.ok) throw new Error("failed");
    return await res.json();
  } catch (e) {
    console.error(e);
    const el = document.getElementById("results");
    el.innerHTML =
      '<p class="card-notes">データの読み込みに失敗しました。</p>';
    return [];
  }
}

function render(services, query = "") {
  const root = document.getElementById("results");
  root.innerHTML = "";

  const q = query.trim().toLowerCase();

  const filtered = services.filter((s) => {
    if (!q) return true;
    const text =
      (s.name || "") +
      " " +
      (s.keywords || []).join(" ") +
      " " +
      (s.notes || "");
    return text.toLowerCase().includes(q);
  });

  if (!filtered.length) {
    root.innerHTML =
      '<p class="card-notes">該当するサービスが見つかりませんでした。</p>';
    return;
  }

  filtered.forEach((s) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.className = "card-title";
    title.innerHTML = `
      <span>${s.name}</span>
      <span class="badge">公式リンク</span>
    `;

    const link = document.createElement("a");
    link.href = s.cancelPage || s.site;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = s.cancelPage || s.site;

    const notes = document.createElement("div");
    notes.className = "card-notes";
    notes.textContent = s.notes || "";

    card.appendChild(title);
    card.appendChild(link);
    if (notes.textContent) card.appendChild(notes);

    if (s.status === "check") {
      const warn = document.createElement("div");
      warn.className = "status-check";
      warn.textContent = "※自動チェックで要確認となっています。リンク先をご確認ください。";
      card.appendChild(warn);
    }

    root.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const services = await loadServices();
  render(services);

  const input = document.getElementById("searchInput");
  input.addEventListener("input", () => {
    render(services, input.value);
  });
});
