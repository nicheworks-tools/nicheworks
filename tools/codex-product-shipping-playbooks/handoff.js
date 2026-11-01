(() => {
  "use strict";
  const copy = document.getElementById("copyHandoff");
  const template = document.getElementById("handoffTemplate");
  const status = document.getElementById("handoffStatus");
  if (!copy || !template || !status) return;
  const isJa = document.documentElement.lang === "ja";

  function fallbackCopy(text) {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    let ok = false;
    try {
      ok = document.execCommand("copy") === true;
    } catch (_) {
      ok = false;
    }
    input.remove();
    return ok;
  }

  copy.addEventListener("click", async () => {
    const text = template.textContent.trim();
    if (!text) return;
    let copied = false;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (_) {}
    }
    if (!copied) copied = fallbackCopy(text);
    status.textContent = copied
      ? (isJa ? "チェックリストをコピーしました。" : "Checklist copied.")
      : (isJa ? "コピーできませんでした。テキストを選択してコピーしてください。" : "Copy failed. Select the checklist and copy manually.");
  });
})();