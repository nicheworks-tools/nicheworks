(() => {
  "use strict";

  const input = document.getElementById("imageFile");
  if (!input) return;

  input.addEventListener("change", () => {
    input.value = "";
  });
})();
