(function(){
  "use strict";

  const STRIPE_URL = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const UNLOCK_URL = "/pro/unlock/";

  function isJa(){
    return (document.documentElement.lang || navigator.language || "ja").toLowerCase().startsWith("ja");
  }

  function copy(){
    return isJa() ? {
      intro: "Pro unlock はJSON Repairの追加機能を使うための購入導線です。",
      features: "Pro: Aggressive repair / JSON候補抽出 / Schema check / ローカル履歴",
      buy: "Proを購入",
      paid: "購入済みの方",
      hint: "Stripe決済後、Pro unlockページでキーをコピーして下の入力欄に貼り付けてください。"
    } : {
      intro: "Pro unlock is the purchase flow for extra JSON Repair features.",
      features: "Pro: Aggressive repair / JSON candidates / Schema check / Local history",
      buy: "Buy Pro",
      paid: "Already paid",
      hint: "After Stripe checkout, copy the key on the Pro unlock page and paste it below."
    };
  }

  function ensureProCommerce(){
    const key = document.getElementById("jrProKey");
    if (!key) return;

    key.removeAttribute("stable");
    key.removeAttribute("content");
    key.setAttribute("placeholder", "NW-JR-XXXX-XXXX-XXXX");

    const proSection = key.closest("section");
    if (!proSection || proSection.querySelector(".jr-pro-commerce")) return;

    const t = copy();
    const box = document.createElement("div");
    box.className = "jr-pro-commerce";
    box.innerHTML =
      '<div class="jr-pro-note"><strong>' + t.intro + '</strong><br>' + t.features + '</div>' +
      '<div class="jr-pro-row" style="margin-top:10px">' +
        '<a class="jr-btn jr-btn-primary" href="' + STRIPE_URL + '" target="_blank" rel="noopener">' + t.buy + '</a>' +
        '<a class="jr-btn" href="' + UNLOCK_URL + '">' + t.paid + '</a>' +
      '</div>' +
      '<div class="jr-pro-note">' + t.hint + '</div>';

    const row = key.closest(".jr-pro-row");
    if (row) row.insertAdjacentElement("beforebegin", box);
    else proSection.appendChild(box);
  }

  function apply(){
    ensureProCommerce();
  }

  document.addEventListener("DOMContentLoaded", function(){
    apply();
    document.querySelectorAll(".nw-lang-btn").forEach(function(btn){
      btn.addEventListener("click", function(){
        const old = document.querySelector(".jr-pro-commerce");
        if (old) old.remove();
        setTimeout(apply, 80);
      });
    });
  });
})();
