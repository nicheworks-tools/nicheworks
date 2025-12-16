function renderResults(container, results) {
  container.innerHTML = "";

  results.forEach(r => {
    const div = document.createElement("div");
    div.className = "result-card";

    if (r.found) {
      div.classList.add("result-" + r.safety);
      div.innerHTML = `
        <strong>${escapeHtml(r.en)}</strong>
        <div class="small">Input: ${escapeHtml(r.input)}</div>
        <div><strong>${String(r.safety || "").toUpperCase()}</strong></div>
        <div class="small">${escapeHtml(r.note_short || "")}</div>
      `;
    } else {
      div.innerHTML = `
        <strong>${escapeHtml(r.input)}</strong>
        <div class="small">Unknown ingredient</div>
      `;
    }

    container.appendChild(div);
  });
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
