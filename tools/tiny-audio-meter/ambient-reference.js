(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const micButton = $("micButton");
  const stopMicButton = $("stopMicButton");
  const micStateBadge = $("micStateBadge");
  const deviceSelect = $("deviceSelect");
  const volumeValue = $("volumeValue");
  const echoChip = $("echoChip");
  const noiseChip = $("noiseChip");
  const gainChip = $("gainChip");
  const baselineCard = $("baselineButton")?.closest(".analysis-card");
  if (!micStateBadge || !volumeValue || !baselineCard) return;

  const SAMPLE_MS = 100;
  const SAMPLE_DURATION_MS = 2000;
  const MIN_SAMPLES = 10;

  let ambientReference = null;
  let samplingTimer = null;
  let samplingStopTimer = null;
  let samplingValues = [];
  let refreshTimer = null;

  function isEnglish() {
    return (document.documentElement.lang || "ja").toLowerCase().startsWith("en");
  }

  function micRunning() {
    return micStateBadge.classList.contains("on");
  }

  function relativeDb() {
    if (String(volumeValue.textContent || "").includes("--")) return null;
    const match = String(volumeValue.textContent || "").replace(",", ".").match(/[+-]?\d+(?:\.\d+)?/);
    const value = match ? Number(match[0]) : null;
    return Number.isFinite(value) ? value : null;
  }

  function processingOn() {
    return [echoChip, noiseChip, gainChip].some((chip) => chip?.classList.contains("on"));
  }

  function median(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function signed(value) {
    if (!Number.isFinite(value)) return "—";
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)} dB`;
  }

  function ensureCard() {
    let card = $("ambientReferenceCard");
    if (card) return card;
    card = document.createElement("article");
    card.id = "ambientReferenceCard";
    card.className = "analysis-card ambient-reference-card";
    card.innerHTML = `
      <h3 id="ambientReferenceTitle"></h3>
      <p id="ambientReferenceDescription" class="small-note"></p>
      <div class="ambient-actions">
        <button id="ambientReferenceButton" class="primary-btn" type="button" disabled></button>
        <button id="ambientReferenceReset" class="secondary-btn" type="button" hidden></button>
      </div>
      <p id="ambientReferenceStatus" class="ambient-reference-status"></p>
      <div class="delta-grid ambient-delta-grid">
        <div class="delta-item"><span id="ambientReferenceLabel"></span><strong id="ambientReferenceValue">—</strong></div>
        <div class="delta-item"><span id="ambientDeltaLabel"></span><strong id="ambientDeltaValue">—</strong></div>
      </div>
      <p id="ambientProcessingNote" class="processing-warning" hidden></p>
    `;
    baselineCard.insertAdjacentElement("afterend", card);
    $("ambientReferenceButton").addEventListener("click", startSampling);
    $("ambientReferenceReset").addEventListener("click", clearAmbientReference);
    return card;
  }

  function stopSamplingTimers() {
    if (samplingTimer) window.clearInterval(samplingTimer);
    if (samplingStopTimer) window.clearTimeout(samplingStopTimer);
    samplingTimer = null;
    samplingStopTimer = null;
  }

  function cancelSampling() {
    stopSamplingTimers();
    samplingValues = [];
    render();
  }

  function clearAmbientReference() {
    stopSamplingTimers();
    samplingValues = [];
    ambientReference = null;
    render();
  }

  function collectSample() {
    if (!micRunning()) {
      cancelSampling();
      return;
    }
    const value = relativeDb();
    if (Number.isFinite(value)) samplingValues.push(value);
  }

  function finishSampling() {
    stopSamplingTimers();
    if (!micRunning() || samplingValues.length < MIN_SAMPLES) {
      ambientReference = null;
      render({ failed: true });
      samplingValues = [];
      return;
    }
    const value = median(samplingValues);
    ambientReference = {
      relativeDb: value,
      samples: samplingValues.length,
      processingOn: processingOn(),
      capturedAt: Date.now()
    };
    samplingValues = [];
    render();
  }

  function startSampling() {
    if (!micRunning() || samplingTimer) return;
    ambientReference = null;
    samplingValues = [];
    collectSample();
    samplingTimer = window.setInterval(collectSample, SAMPLE_MS);
    samplingStopTimer = window.setTimeout(finishSampling, SAMPLE_DURATION_MS);
    render();
  }

  function render(options = {}) {
    ensureCard();
    const en = isEnglish();
    const sampling = Boolean(samplingTimer);
    const current = relativeDb();
    const button = $("ambientReferenceButton");
    const reset = $("ambientReferenceReset");
    const status = $("ambientReferenceStatus");
    const referenceValue = $("ambientReferenceValue");
    const deltaValue = $("ambientDeltaValue");
    const processingNote = $("ambientProcessingNote");

    $("ambientReferenceTitle").textContent = en ? "Ambient relative reference" : "環境音の相対基準";
    $("ambientReferenceDescription").textContent = en
      ? "Sample the displayed relative microphone-input level for about 2 seconds and use the median as a same-microphone reference. This is not microphone calibration or dB SPL."
      : "表示中の相対マイク入力レベルを約2秒間サンプリングし、中央値を同じマイク内の基準にします。マイク校正やdB SPL測定ではありません。";
    $("ambientReferenceLabel").textContent = en ? "Ambient reference" : "環境基準";
    $("ambientDeltaLabel").textContent = en ? "Current − reference" : "現在値 − 基準";

    button.textContent = sampling
      ? (en ? "Sampling for 2 seconds…" : "2秒間測定中…")
      : (en ? "Set 2-second ambient reference" : "2秒の環境基準を取る");
    button.disabled = !micRunning() || sampling;
    reset.textContent = en ? "Clear ambient reference" : "環境基準を解除";
    reset.hidden = !ambientReference && !sampling;

    if (sampling) {
      status.textContent = en
        ? "Keep the microphone and sound source position unchanged while sampling."
        : "測定中はマイクと音源の位置を変えないでください。";
      referenceValue.textContent = "—";
      deltaValue.textContent = "—";
    } else if (ambientReference) {
      status.textContent = en
        ? `Reference captured from ${ambientReference.samples} displayed readings. Compare only under similar device, microphone, position, and processing conditions.`
        : `表示値${ambientReference.samples}点の中央値を基準にしました。同じ端末・マイク・位置・入力処理に近い条件だけで比較してください。`;
      referenceValue.textContent = `${ambientReference.relativeDb.toFixed(1)} dB relative`;
      deltaValue.textContent = Number.isFinite(current) ? `${signed(current - ambientReference.relativeDb)} relative` : "—";
    } else {
      status.textContent = options.failed
        ? (en ? "Could not collect enough valid readings. Keep the microphone running and try again." : "有効な表示値を十分に取得できませんでした。マイクを動作させたまま再度試してください。")
        : (en ? "No ambient reference captured." : "環境基準は未設定です。");
      referenceValue.textContent = "—";
      deltaValue.textContent = "—";
    }

    const affected = Boolean(ambientReference?.processingOn || (ambientReference && processingOn()));
    processingNote.hidden = !affected;
    processingNote.textContent = en
      ? "EC / NS / AGC is or was reported ON for this reference. Automatic processing can change relative comparisons."
      : "この基準ではEC / NS / AGCのいずれかがONと報告されています。自動処理により相対比較が変わる可能性があります。";
  }

  micButton?.addEventListener("click", clearAmbientReference, { capture: true });
  stopMicButton?.addEventListener("click", clearAmbientReference, { capture: true });
  deviceSelect?.addEventListener("change", clearAmbientReference, { capture: true });

  const languageObserver = new MutationObserver(() => render());
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const processingObserver = new MutationObserver(() => { if (ambientReference) render(); });
  [echoChip, noiseChip, gainChip].filter(Boolean).forEach((chip) => {
    processingObserver.observe(chip, { attributes: true, childList: true, subtree: true });
  });

  const style = document.createElement("style");
  style.textContent = `
    .ambient-actions{display:flex;gap:8px;flex-wrap:wrap}
    .ambient-reference-status{min-height:2.6em;margin:10px 0;font-size:.9rem;line-height:1.5;color:#475569}
    .ambient-delta-grid{margin-top:8px}
  `;
  document.head.appendChild(style);

  refreshTimer = window.setInterval(() => {
    if (ambientReference || samplingTimer) render();
    else {
      ensureCard();
      const button = $("ambientReferenceButton");
      if (button) button.disabled = !micRunning();
    }
  }, 100);

  ensureCard();
  render();
  window.addEventListener("pagehide", () => {
    stopSamplingTimers();
    if (refreshTimer) window.clearInterval(refreshTimer);
    languageObserver.disconnect();
    processingObserver.disconnect();
  }, { once: true });
})();
