(() => {
  "use strict";

  const button = document.getElementById("nwFivePackCopy");
  const template = document.getElementById("nwFivePackTemplate");
  const status = document.getElementById("nwFivePackStatus");
  if (!button || !template || !status) return;

  function fallbackCopy(value) {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    let success = false;
    try {
      success = document.execCommand("copy") === true;
    } catch (_) {}
    field.remove();
    return success;
  }

  button.addEventListener("click", async () => {
    const value = (template.textContent || "").trim();
    if (!value) return;
    const isJa = document.documentElement.lang === "ja";
    let success = false;

    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        success = true;
      } catch (_) {}
    }
    if (!success) success = fallbackCopy(value);

    status.textContent = success
      ? (isJa ? "テンプレートをコピーしました。" : "Template copied.")
      : (isJa ? "コピーできませんでした。選択して手動でコピーしてください。" :
          "Copy failed. Select the template and copy it manually.");
  });
})();