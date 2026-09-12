(() => {
  "use strict";

  const SPECTRUM_EVENT = "nw-tiny-audio-spectrum";

  function installAnalyserHook(ContextCtor) {
    const proto = ContextCtor?.prototype;
    if (!proto || proto.__nwTinyAudioComparisonHooked) return;
    const originalCreateAnalyser = proto.createAnalyser;
    if (typeof originalCreateAnalyser !== "function") return;

    Object.defineProperty(proto, "__nwTinyAudioComparisonHooked", { value: true });
    proto.createAnalyser = function (...args) {
      const analyser = originalCreateAnalyser.apply(this, args);
      if (!analyser || analyser.__nwTinyAudioComparisonWrapped) return analyser;
      const originalGetByteFrequencyData = analyser.getByteFrequencyData.bind(analyser);
      Object.defineProperty(analyser, "__nwTinyAudioComparisonWrapped", { value: true });

      analyser.getByteFrequencyData = function (array) {
        originalGetByteFrequencyData(array);
        if (!array?.length) return;

        const sampleRate = analyser.context?.sampleRate || 48000;
        const binHz = sampleRate / analyser.fftSize;
        const minBin = Math.max(1, Math.ceil(40 / binHz));
        const maxBin = Math.min(array.length - 1, Math.floor(12000 / binHz));
        let peakIndex = minBin;
        let peakValue = 0;

        for (let i = minBin; i <= maxBin; i += 1) {
          if (array[i] > peakValue) {
            peakValue = array[i];
            peakIndex = i;
          }
        }

        const peakHz = peakValue > 0 ? peakIndex * binHz : null;
        window.dispatchEvent(new CustomEvent(SPECTRUM_EVENT, {
          detail: { peakHz, peakValue }
        }));
      };
      return analyser;
    };
  }

  installAnalyserHook(window.AudioContext);
  if (window.webkitAudioContext && window.webkitAudioContext !== window.AudioContext) {
    installAnalyserHook(window.webkitAudioContext);
  }

  const $ = (id) => document.getElementById(id);
  const els = {
    micButton: $("micButton"),
    stopMicButton: $("stopMicButton"),
    micStateBadge: $("micStateBadge"),
    deviceSelect: $("deviceSelect"),
    echoChip: $("echoChip"),
    noiseChip: $("noiseChip"),
    gainChip: $("gainChip"),
    processingWarning: $("processingWarning"),
    volumeValue: $("volumeValue"),
    pitchValue: $("pitchValue"),
    noteValue: $("noteValue"),
    confidenceValue: $("confidenceValue"),
    peakFrequencyValue: $("peakFrequencyValue"),
    baselineButton: $("baselineButton"),
    baselineReset: $("baselineReset"),
    baselineSummary: $("baselineSummary"),
    levelDeltaValue: $("levelDeltaValue"),
    pitchDeltaValue: $("pitchDeltaValue")
  };

  let baseline = null;
  let latestPeakHz = null;
  let timer = null;

  function isEnglish() {
    return (document.documentElement.lang || "ja").toLowerCase().startsWith("en");
  }

  function micRunning() {
    return Boolean(els.micStateBadge?.classList.contains("on"));
  }

  function numberFromText(node) {
    const match = String(node?.textContent || "").replace(",", ".").match(/[+-]?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
  }

  function currentReading() {
    const db = numberFromText(els.volumeValue);
    const hz = String(els.pitchValue?.textContent || "").includes("--") ? null : numberFromText(els.pitchValue);
    const confidence = String(els.confidenceValue?.textContent || "").includes("--") ? null : numberFromText(els.confidenceValue);
    const note = String(els.noteValue?.textContent || "").trim();
    return {
      db: Number.isFinite(db) ? db : null,
      hz: Number.isFinite(hz) ? hz : null,
      confidence: Number.isFinite(confidence) ? confidence : null,
      note: note && note !== "--" ? note : null
    };
  }

  function signed(value, digits = 1) {
    if (!Number.isFinite(value)) return "—";
    return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
  }

  function clearBaseline() {
    baseline = null;
    renderBaseline();
  }

  function captureBaseline() {
    if (!micRunning()) return;
    const reading = currentReading();
    if (!Number.isFinite(reading.db)) return;
    baseline = { ...reading, capturedAt: Date.now() };
    renderBaseline();
  }

  function renderBaseline() {
    const en = isEnglish();
    if (!els.baselineSummary) return;

    if (!baseline) {
      els.baselineSummary.textContent = en
        ? "No baseline captured. Capture a reading to compare changes on the same microphone."
        : "基準値は未設定です。同じマイクで変化を比べるときに現在値を基準として保存します。";
      els.levelDeltaValue.textContent = "—";
      els.pitchDeltaValue.textContent = "—";
      els.baselineReset.hidden = true;
      updateControls();
      return;
    }

    const pitch = Number.isFinite(baseline.hz)
      ? `${baseline.hz.toFixed(1)} Hz${baseline.note ? ` / ${baseline.note}` : ""}`
      : (en ? "no valid pitch" : "有効なpitchなし");
    els.baselineSummary.textContent = en
      ? `Baseline: ${baseline.db.toFixed(1)} dB relative / ${pitch}`
      : `基準: 相対 ${baseline.db.toFixed(1)} dB / ${pitch}`;
    els.baselineReset.hidden = false;
    updateDelta();
    updateControls();
  }

  function updateDelta() {
    if (!baseline) return;
    const current = currentReading();
    const en = isEnglish();

    els.levelDeltaValue.textContent = Number.isFinite(current.db)
      ? `${signed(current.db - baseline.db)} dB ${en ? "relative change" : "相対差"}`
      : "—";

    if (Number.isFinite(current.hz) && Number.isFinite(baseline.hz)) {
      els.pitchDeltaValue.textContent = `${signed(current.hz - baseline.hz)} Hz`;
    } else {
      els.pitchDeltaValue.textContent = en ? "No comparable pitch" : "比較可能なpitchなし";
    }
  }

  function updateControls() {
    if (els.baselineButton) els.baselineButton.disabled = !micRunning();
  }

  function updateProcessingWarning() {
    if (!els.processingWarning) return;
    const on = [els.echoChip, els.noiseChip, els.gainChip].some((chip) => chip?.classList.contains("on"));
    els.processingWarning.hidden = !on;
  }

  function formatPeak(hz) {
    if (!Number.isFinite(hz)) return "—";
    if (hz >= 1000) return `${(hz / 1000).toFixed(hz >= 10000 ? 1 : 2)} kHz`;
    return `${Math.round(hz)} Hz`;
  }

  function updatePeak() {
    if (!els.peakFrequencyValue) return;
    els.peakFrequencyValue.textContent = micRunning() ? formatPeak(latestPeakHz) : "—";
  }

  function refresh() {
    updateControls();
    updateProcessingWarning();
    updatePeak();
    if (baseline) updateDelta();
  }

  els.baselineButton?.addEventListener("click", captureBaseline);
  els.baselineReset?.addEventListener("click", clearBaseline);
  els.micButton?.addEventListener("click", () => {
    latestPeakHz = null;
    clearBaseline();
  }, { capture: true });
  els.stopMicButton?.addEventListener("click", () => {
    latestPeakHz = null;
    clearBaseline();
  }, { capture: true });
  els.deviceSelect?.addEventListener("change", () => {
    latestPeakHz = null;
    clearBaseline();
  }, { capture: true });

  window.addEventListener(SPECTRUM_EVENT, (event) => {
    latestPeakHz = Number.isFinite(event.detail?.peakHz) ? event.detail.peakHz : null;
  });

  const processingObserver = new MutationObserver(updateProcessingWarning);
  [els.echoChip, els.noiseChip, els.gainChip].filter(Boolean).forEach((chip) => {
    processingObserver.observe(chip, { attributes: true, childList: true, subtree: true });
  });

  const languageObserver = new MutationObserver(() => renderBaseline());
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  timer = window.setInterval(refresh, 100);
  window.addEventListener("pagehide", () => {
    if (timer) window.clearInterval(timer);
    processingObserver.disconnect();
    languageObserver.disconnect();
  }, { once: true });

  renderBaseline();
  refresh();
})();