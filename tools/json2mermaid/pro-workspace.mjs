import {
  createPresetStore,
  createSvgBlob,
  renderWithAdapter,
  svgToPngBlob
} from "./pro-engine.mjs";
import { createMermaidRenderer } from "./mermaid-renderer-adapter.mjs";
import { runBatchWithSharedConverter } from "./pro-shared-converter-integration.mjs";

function requireBatchRecord(record) {
  if (!record || typeof record !== "object") {
    throw new TypeError("A batch result record is required.");
  }
  if (record.status !== "ok" || typeof record.code !== "string" || !record.code.trim()) {
    throw new TypeError("Only successful batch results with Mermaid source can be rendered.");
  }
  return record;
}

function resolvePreset(presetStore, presetId) {
  if (presetId == null || presetId === "") return { config: {} };
  const preset = presetStore.get(presetId);
  if (!preset) throw new TypeError(`Unknown style preset: ${presetId}`);
  return preset;
}

export function createProWorkspace({ converterApi, mermaidApi, storage, idPrefix = "nw-j2m-pro" } = {}) {
  if (!converterApi || typeof converterApi.convert !== "function") {
    throw new TypeError("A shared JSON2Mermaid converter API is required.");
  }

  const presets = createPresetStore(storage);
  const renderer = createMermaidRenderer(mermaidApi, { idPrefix });

  const runBatch = (items, settings = {}) => runBatchWithSharedConverter(items, converterApi, settings);

  const renderCode = async (mermaidCode, options = {}) => {
    const preset = resolvePreset(presets, options.presetId);
    return renderWithAdapter(mermaidCode, preset, renderer);
  };

  const renderBatchResult = async (record, options = {}) => {
    const result = requireBatchRecord(record);
    return renderCode(result.code, options);
  };

  const exportBatchResultSvg = async (record, options = {}) => {
    const rendered = await renderBatchResult(record, options);
    return createSvgBlob(rendered.svg, options.BlobCtor);
  };

  const exportBatchResultPng = async (record, options = {}) => {
    const rendered = await renderBatchResult(record, options);
    return svgToPngBlob(rendered.svg, options.pngOptions || {});
  };

  return Object.freeze({
    presets,
    runBatch,
    renderCode,
    renderBatchResult,
    exportBatchResultSvg,
    exportBatchResultPng
  });
}
