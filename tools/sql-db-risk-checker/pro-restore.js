"use strict";

(function () {
  const PRO_KEY = "nw_sql_pro";
  const PRO_RETURN_PARAM = "pro";

  // Set the real Stripe Payment Link or another external checkout URL here.
  const PRO_PAYMENT_URL = "";

  const $ = (id) => document.getElementById(id);

  function currentLang() {
    return document.documentElement.dataset.lang === "en" ? "en" : "ja";
  }

  function labels() {
    const en = currentLang() === "en";
    return {
      locked: "Locked",
      unlocked: "Unlocked",
      pending: en ? "Set payment link" : "決済リンクを設定",
      buy: en ? "Buy Pro" : "Proを購入",
      restore: en ? "Restore purchase" : "購入済みを復元",
      copied: en ? "Copied." : "コピーしました。",
      restored: en ? "Pro restored." : "Proを復元しました。",
      lockedAgain: en ? "Pro locked for testing." : "テスト用にProをロックしました。",
      notConfigured: en ? "Set PRO_PAYMENT_URL before selling." : "販売前に PRO_PAYMENT_URL を設定してください。",
      template: en ? "Copy template" : "テンプレをコピー",
      lockTest: en ? "Lock Pro (test)" : "Proをロック（テスト用）"
    };
  }

  function toast(message) {
    const node = $("toast");
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { node.hidden = true; }, 1800);
  }

  function isPro() {
    return localStorage.getItem(PRO_KEY) === "1";
  }

  function setPro(value) {
    if (value) localStorage.setItem(PRO_KEY, "1");
    else localStorage.removeItem(PRO_KEY);
    render();
  }

  async function copyText(text) {
    const label = labels();
    try {
      await navigator.clipboard.writeText(text);
      toast(label.copied);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast(label.copied);
    }
  }

  function render() {
    const label = labels();
    const tag = $("proStateTag");
    const locked = $("proLocked");
    const unlocked = $("proUnlocked");
    const buy = $("buyProBtn");
    const restore = $("restoreProBtn");
    const copy = $("copyTemplateBtn");
    const lock = $("lockProBtn");
    const pending = $("proPendingNote");

    if (!tag || !locked || !unlocked) return;

    if (isPro()) {
      tag.textContent = label.unlocked;
      tag.classList.add("is-unlocked");
      locked.hidden = true;
      unlocked.hidden = false;
    } else {
      tag.textContent = label.locked;
      tag.classList.remove("is-unlocked");
      locked.hidden = false;
      unlocked.hidden = true;
    }

    if (buy) {
      buy.textContent = PRO_PAYMENT_URL ? label.buy : label.pending;
      buy.disabled = !PRO_PAYMENT_URL;
      buy.classList.toggle("is-disabled", !PRO_PAYMENT_URL);
    }
    if (restore) restore.textContent = label.restore;
    if (copy) copy.textContent = label.template;
    if (lock) lock.textContent = label.lockTest;
    if (pending) pending.hidden = Boolean(PRO_PAYMENT_URL);
  }

  function restoreFromUrl() {
    const url = new URL(window.location.href);
    if (url.searchParams.get(PRO_RETURN_PARAM) === "1") {
      setPro(true);
      url.searchParams.delete(PRO_RETURN_PARAM);
      history.replaceState({}, "", url.toString());
      toast(labels().restored);
    }
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("#buyProBtn")) {
      if (!PRO_PAYMENT_URL) {
        toast(labels().notConfigured);
        return;
      }
      location.href = PRO_PAYMENT_URL;
    }
    if (event.target.closest("#restoreProBtn")) {
      setPro(true);
      toast(labels().restored);
    }
    if (event.target.closest("#copyTemplateBtn")) {
      const code = $("proTemplateCode");
      copyText(code ? code.textContent : "");
    }
    if (event.target.closest("#lockProBtn")) {
      setPro(false);
      toast(labels().lockedAgain);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-lang-btn]")) setTimeout(render, 0);
  });

  restoreFromUrl();
  render();
})();
