"use strict";

(function () {
  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const ENTITLEMENT = "nicheworks_pro";
  const PREVIEW_TEXT = "Previewモードです。このブラウザでは共通Proがまだ有効ではありません。";
  const ACTIVE_TEXT = "Pro解放済み。このブラウザでは共通Proが有効です。";
  const ERROR_TEXT = "Pro状態を確認できませんでした。無料機能は引き続き利用できます。";

  function normalizeStatus(status) {
    if (!status) return { active: false, source: "none" };
    if (typeof status === "string") return { active: status === "active" || status === "unlocked", source: "string" };
    const entitlementMatches = !status.entitlement || status.entitlement === ENTITLEMENT;
    const hasExplicitActiveState = status.active === true || status.pro === true || status.unlocked === true || status.status === "active";
    return { active: Boolean(entitlementMatches && hasExplicitActiveState), source: status.source || "nw-pro" };
  }

  function setElements(active, failed) {
    document.documentElement.dataset.proActive = active ? "true" : "false";

    document.querySelectorAll("[data-pro-buy]").forEach((node) => {
      if (node.tagName === "A") node.href = PAYMENT_LINK;
      else node.setAttribute("data-href", PAYMENT_LINK);
      node.hidden = active;
    });

    document.querySelectorAll("[data-pro-status]").forEach((node) => {
      node.textContent = failed ? ERROR_TEXT : (active ? ACTIVE_TEXT : PREVIEW_TEXT);
      node.classList.toggle("is-active", active);
      node.classList.toggle("is-preview", !active && !failed);
      node.classList.toggle("is-error", Boolean(failed));
    });

    document.querySelectorAll("[data-pro-preview]").forEach((node) => {
      node.hidden = active;
    });

    document.querySelectorAll("[data-pro-only]").forEach((node) => {
      node.hidden = !active;
    });

    document.querySelectorAll("[data-pro-action]").forEach((node) => {
      node.disabled = !active;
      node.setAttribute("aria-disabled", active ? "false" : "true");
      node.title = active ? "" : "NicheWorks Proで利用できます。";
    });

    window.dispatchEvent(new CustomEvent("nw-pro-status", { detail: { active, failed: Boolean(failed) } }));
  }

  async function refresh() {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") {
        setElements(false, true);
        return { active: false, failed: true };
      }
      const localStatus = await window.NWPro.getLocalStatus();
      const normalized = normalizeStatus(localStatus);
      setElements(normalized.active, false);
      return normalized;
    } catch (error) {
      console.warn("NicheWorks Pro status check failed", error);
      setElements(false, true);
      return { active: false, failed: true };
    }
  }

  function hasTopLevelWhere(sql) {
    const source = String(sql || "");
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    let inBacktick = false;

    for (let i = 0; i < source.length; i += 1) {
      const ch = source[i];
      const next = source[i + 1];

      if (inSingle) {
        if (ch === "'" && next === "'") { i += 1; continue; }
        if (ch === "'" && source[i - 1] !== "\\") inSingle = false;
        continue;
      }
      if (inDouble) {
        if (ch === '"' && next === '"') { i += 1; continue; }
        if (ch === '"' && source[i - 1] !== "\\") inDouble = false;
        continue;
      }
      if (inBacktick) {
        if (ch === "`") inBacktick = false;
        continue;
      }

      if (ch === "'") { inSingle = true; continue; }
      if (ch === '"') { inDouble = true; continue; }
      if (ch === "`") { inBacktick = true; continue; }
      if (ch === "(") { depth += 1; continue; }
      if (ch === ")") { depth = Math.max(0, depth - 1); continue; }

      if (depth !== 0) continue;
      if ((ch === "w" || ch === "W") && /^where\b/i.test(source.slice(i))) {
        const prev = i === 0 ? "" : source[i - 1];
        if (!/[A-Za-z0-9_$]/.test(prev)) return true;
      }
    }
    return false;
  }

  function installSqlSafetyGuard() {
    // app-sdrc.js defines hasTopWhere in the classic-script global scope. Replace
    // the naive /where/ check after scripts have loaded so WHERE inside a nested
    // subquery cannot suppress the full-table UPDATE/DELETE warning.
    window.hasTopWhere = hasTopLevelWhere;
    window.SQLDbRiskHasTopLevelWhere = hasTopLevelWhere;
  }

  window.SQLDbRiskProBridge = { refresh, paymentLink: PAYMENT_LINK };
  document.addEventListener("DOMContentLoaded", () => {
    installSqlSafetyGuard();
    refresh();
  });
})();
