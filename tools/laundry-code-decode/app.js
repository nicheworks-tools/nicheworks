const grid = document.getElementById("symbolGrid");
const result = document.getElementById("result");
const summary = document.getElementById("resultSummary");
const detail = document.getElementById("resultDetail");

let currentLang = (navigator.language || "").startsWith("ja") ? "ja" : "en";

function renderSymbols() {
  SYMBOLS.forEach(sym => {
    const btn = document.createElement("button");
    btn.className = "symbol-btn";
    btn.textContent = sym.icon;
    btn.onclick = () => showResult(sym);
    grid.appendChild(btn);
  });
}

function showResult(sym) {
  summary.textContent = sym[currentLang].summary;
  detail.textContent = sym[currentLang].detail;
  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth" });
}

/* language switch */
document.querySelectorAll(".nw-lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });
    document.querySelectorAll(".nw-lang-switch button").forEach(b =>
      b.classList.toggle("active", b.dataset.lang === currentLang)
    );
  });
});

renderSymbols();
