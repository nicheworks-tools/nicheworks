  // ---------------------------
  // Pro modal (UI only for now)
  // ---------------------------
  const proBackdrop = document.getElementById("proModalBackdrop");
  const proModal = document.getElementById("proModal");
  const openProBtn = document.getElementById("openProBtn");
  const learnProBtn = document.getElementById("learnProBtn");
  const closeProModalBtn = document.getElementById("closeProModalBtn");
  const proLaterBtn = document.getElementById("proLaterBtn");
  const proBuyBtn = document.getElementById("proBuyBtn");

  function openPro() {
    proBackdrop.hidden = false;
    proModal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closePro() {
    proBackdrop.hidden = true;
    proModal.hidden = true;
    document.body.style.overflow = "";
  }

  if (openProBtn) openProBtn.addEventListener("click", openPro);
  if (learnProBtn) learnProBtn.addEventListener("click", openPro);
  if (closeProModalBtn) closeProModalBtn.addEventListener("click", closePro);
  if (proLaterBtn) proLaterBtn.addEventListener("click", closePro);
  if (proBackdrop) proBackdrop.addEventListener("click", closePro);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && proModal && !proModal.hidden) closePro();
  });

  if (proBuyBtn) {
    proBuyBtn.addEventListener("click", () => {
      // 次ステップで Stripe / PayPal に差し替え
      alert("Coming next: payment + unlock (¥200).");
    });
  }
