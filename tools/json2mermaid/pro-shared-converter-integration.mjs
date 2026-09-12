import { runBatch } from "./pro-engine.mjs";

function requireConverterApi(converterApi) {
  if (!converterApi || typeof converterApi.convert !== "function") {
    throw new TypeError("A shared JSON2Mermaid converter API with convert() is required.");
  }
  return converterApi;
}

export function createSharedBatchConverter(converterApi, settings = {}) {
  const api = requireConverterApi(converterApi);
  const options = settings.options && typeof settings.options === "object" ? { ...settings.options } : {};
  const lang = settings.lang === "en" ? "en" : "ja";

  return async function convertBatchItem(jsonText) {
    return api.convert(jsonText, options, lang);
  };
}

export function runBatchWithSharedConverter(items, converterApi, settings = {}) {
  return runBatch(items, createSharedBatchConverter(converterApi, settings));
}
