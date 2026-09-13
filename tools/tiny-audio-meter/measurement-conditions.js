(() => {
  "use strict";

  const SPECTRUM_EVENT = "nw-tiny-audio-spectrum";
  const $ = (id) => document.getElementById(id);
  const analysisGrid = document.querySelector(".analysis-grid");
  const micStateBadge = $("micStateBadge");
  const deviceSelect = $("deviceSelect");
  const echoChip = $("echoChip");
  const noiseChip = $("noiseChip");
  const gainChip = $("gainChip");
  if (!analysisGrid || !micStateBadge) return;

  let sampleRate = null;
  let fftSize = null;

  function isEnglish() {
    return (document.documentElement.lang || "ja").toLowerCase().startsWith("en");
  }

  function micRunning() {
    return micStateBadge.classList.contains("on");
  }

  function chipState(chip) {
    if (!chip) return "—";
    if (chip.classList.contains("on")) return "ON";
    if (chip.classList.contains("off")) return "OFF";
    const text = String(chip.textContent || "").trim();
    const match = text.match(/(?:^|\s)(ON|OFF|—)(?:$|\s)/i);
    return match ? match[1].toUpperCase() : "—";
  }

  function deviceLabel() {
    const selected = deviceSelect?.selectedOptions?.[0]?.textContent?.trim();
    return selected || (isEnglish() ? "Browser-selected input" : "ブラウザ選択の入力");
  }

  function ensureCard() {
    let card = $("measurementConditionsCard");
    if (card) return card;
    card = document.createElement("article");
    card.id = "measurementConditionsCard";
    card.className = "analysis-card measurement-conditions-card";
    card.innerHTML = `
      <h3 id="measurementConditionsTitle"></h3>
      <p id="measurementConditionsDescription" class="small-note"></p>
      <dl class="measurement-conditions-grid">
        <div><dt id="conditionsDeviceLabel"></dt><dd id="conditionsDeviceValue">—</dd></div>
        <div><dt id="conditionsSampleRateLabel"></dt><dd id="conditionsSampleRateValue">—</dd></div>
        <div><dt id="conditionsFftLabel"></dt><dd id="conditionsFftValue">—</dd></div>
        <div><dt>EC / NS / AGC</dt><dd id="conditionsProcessingValue">— / — / —</dd></div>
      </dl>
      <button id="copyMeasurementConditions" class="secondary-btn" type="button" disabled></button>
      <p id="measurementConditionsStatus" class="small-note"></p>
    `;
    analysisGrid.appendChild(card);
    $("copyMeasurementConditions")?.addEventListener("click", copyConditions);
    return card;
  }

  function snapshot() {
    return {
      running: micRunning(),
      device: deviceLabel(),
      sampleRate: Number.isFinite(sampleRate) ? sampleRate : null,
      fftSize: Number.isFinite(fftSize) ? fftSize : null,
      echoCancellation: chipState(echoChip),
      noiseSuppression: chipState(noiseChip),
      autoGainControl: chipState(gainChip)
    };
  }

  function copyText(data) {
    const en = isEnglish();
    return [
      en ? "Tiny Audio Meter — measurement conditions" : "Tiny Audio Meter — 測定条件",
      `${en ? "Input" : "入力"}: ${data.device}`,
      `${en ? "Sample rate" : "サンプルレート"}: ${data.sampleRate ? `${data.sampleRate} Hz` : "—"}`,
      `FFT: ${data.fftSize || "—"}`,
      `EC: ${data.echoCancellation}`,
      `NS: ${data.noiseSuppression}`,
      `AGC: ${data.autoGainControl}`,
      en
        ? "Values from this tool are relative browser microphone-input measurements, not calibrated dB SPL."
        : "このツールの値はブラウザの相対マイク入力値であり、校正済みdB SPLではありません。"
    ].join("\n");
  }

  async function copyConditions() {
    const data = snapshot();
    if (!data.running) return;
    const status = $("measurementConditionsStatus");
    try {
      await navigator.clipboard.writeText(copyText(data));
      if (status) status.textContent = isEnglish() ? "Conditions copied locally." : "測定条件をローカルコピーしました。";
    } catch (_) {
      if (status) status.textContent = isEnglish() ? "Could not copy conditions." : "測定条件をコピーできませんでした。";
    }
  }

  function render() {
    ensureCard();
    const en = isEnglish();
    const data = snapshot();
    $("measurementConditionsTitle").textContent = en ? "Measurement conditions" : "測定条件メモ";
    $("measurementConditionsDescription").textContent = en
      ? "Keep these acquisition settings with a before/after comparison. Device labels are shown and copied only in this browser session; they are not sent to analytics or affiliate links."
      : "前後比較では、この取得条件も一緒に確認してください。device名はこのブラウザ内の表示・コピーだけに使い、analyticsやaffiliateには送りません。";
    $("conditionsDeviceLabel").textContent = en ? "Input" : "入力";
    $("conditionsSampleRateLabel").textContent = en ? "Sample rate" : "サンプルレート";
    $("conditionsFftLabel").textContent = "FFT";
    $("conditionsDeviceValue").textContent = data.running ? data.device : "—";
    $("conditionsSampleRateValue").textContent = data.running && data.sampleRate ? `${data.sampleRate} Hz` : "—";
    $("conditionsFftValue").textContent = data.running && data.fftSize ? String(data.fftSize) : "—";
    $("conditionsProcessingValue").textContent = data.running
      ? `${data.echoCancellation} / ${data.noiseSuppression} / ${data.autoGainControl}`
      : "— / — / —";
    const copy = $("copyMeasurementConditions");
    if (copy) {
      copy.textContent = en ? "Copy conditions" : "測定条件をコピー";
      copy.disabled = !data.running;
    }
    const status = $("measurementConditionsStatus");
    if (status && !data.running) {
      status.textContent = en
        ? "Start the microphone to populate the active acquisition conditions."
        : "マイクを開始すると現在の取得条件を表示します。";
    }
  }

  window.addEventListener(SPECTRUM_EVENT, (event) => {
    const nextSampleRate = Number(event.detail?.sampleRate);
    const nextFftSize = Number(event.detail?.fftSize);
    const changed = nextSampleRate !== sampleRate || nextFftSize !== fftSize;
    sampleRate = Number.isFinite(nextSampleRate) ? nextSampleRate : null;
    fftSize = Number.isFinite(nextFftSize) ? nextFftSize : null;
    if (changed) render();
  });

  $("micButton")?.addEventListener("click", () => {
    sampleRate = null;
    fftSize = null;
    queueMicrotask(render);
  }, { capture: true });
  $("stopMicButton")?.addEventListener("click", () => {
    sampleRate = null;
    fftSize = null;
    queueMicrotask(render);
  }, { capture: true });
  deviceSelect?.addEventListener("change", () => {
    sampleRate = null;
    fftSize = null;
    queueMicrotask(render);
  });

  const stateObserver = new MutationObserver(render);
  stateObserver.observe(micStateBadge, { attributes: true, childList: true, subtree: true });
  [echoChip, noiseChip, gainChip].filter(Boolean).forEach((chip) => {
    stateObserver.observe(chip, { attributes: true, childList: true, subtree: true });
  });
  if (deviceSelect) stateObserver.observe(deviceSelect, { childList: true, subtree: true, attributes: true });

  const languageObserver = new MutationObserver(render);
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const style = document.createElement("style");
  style.textContent = `
    .measurement-conditions-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0 12px}
    .measurement-conditions-grid div{padding:9px;border:1px solid #e2e8f0;border-radius:9px;background:#f8fafc}
    .measurement-conditions-grid dt{font-size:.76rem;color:#64748b}.measurement-conditions-grid dd{margin:3px 0 0;font-weight:700;overflow-wrap:anywhere}
    @media(max-width:560px){.measurement-conditions-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  ensureCard();
  render();
  window.addEventListener("pagehide", () => {
    stateObserver.disconnect();
    languageObserver.disconnect();
  }, { once: true });
})();
