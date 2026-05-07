/* WeatherDiff WD-03 safety patch
   Prevents permission-denied geolocation from falling back to Tokyo. */
(function () {
  function isEnglish() {
    return (document.documentElement.lang || "").toLowerCase().startsWith("en");
  }

  function message(key) {
    const en = isEnglish();
    const map = {
      https: en
        ? "Using current location requires HTTPS. Please enter a location name instead."
        : "現在地取得にはHTTPSが必要です。地点名を入力してください。",
      noGeo: en
        ? "Geolocation is unavailable. Please enter a location name instead."
        : "現在地を取得できません。地点名を入力してください。",
      denied: en
        ? "Location permission was denied. Please enter a location name instead."
        : "位置情報が許可されませんでした。地点名を入力してください。",
      generic: en
        ? "Could not use current location. Please enter a location name instead."
        : "現在地検索を実行できませんでした。地点名を入力してください。",
    };
    return map[key] || map.generic;
  }

  function setError(text) {
    const errorText = document.getElementById("errorText");
    if (errorText) errorText.textContent = text;
  }

  function hideProgress() {
    const progressArea = document.getElementById("progressArea");
    if (progressArea) progressArea.classList.add("hidden");
  }

  function setDomesticPlaceholder() {
    const input = document.getElementById("locationInput");
    if (!input) return;
    input.setAttribute("placeholder", isEnglish() ? "Chiba / Shibuya / Sapporo" : "千葉市 / 渋谷 / 札幌");
  }

  function hardenExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function bindSafeGeolocation() {
    const btnGeo = document.getElementById("btnGeo");
    if (!btnGeo) return;

    btnGeo.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (location.protocol !== "https:") {
          setError(message("https"));
          hideProgress();
          return;
        }

        if (!navigator.geolocation) {
          setError(message("noGeo"));
          hideProgress();
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              if (typeof window.runFullProcess === "function") {
                await window.runFullProcess({
                  lat: pos.coords.latitude,
                  lon: pos.coords.longitude,
                });
              }
            } catch (error) {
              setError(message("generic"));
            } finally {
              hideProgress();
            }
          },
          () => {
            setError(message("denied"));
            hideProgress();
          },
          {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 0,
          }
        );
      },
      true
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    setDomesticPlaceholder();
    hardenExternalLinks();
    bindSafeGeolocation();

    ["langJP", "langEN"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          window.setTimeout(() => {
            setDomesticPlaceholder();
            hardenExternalLinks();
          }, 0);
        });
      }
    });
  });
})();
