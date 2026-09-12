const DEFAULT_PRESET_STORAGE_KEY = "nw_json2mermaid_pro_style_presets_v1";
const FORBIDDEN_CONFIG_KEYS = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "json",
  "jsontext",
  "input",
  "inputtext",
  "source",
  "sourcejson",
  "mermaid",
  "mermaidcode",
  "filename",
  "file_name",
  "content"
]);

const MAX_CONFIG_DEPTH = 8;
const MAX_PRESET_NAME_LENGTH = 80;
const PRESET_ID_RE = /^[A-Za-z0-9._-]{1,64}$/;

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function cloneJsonSafe(value, depth = 0) {
  if (depth > MAX_CONFIG_DEPTH) throw new TypeError("Style preset config is too deeply nested.");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Style preset numbers must be finite.");
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => cloneJsonSafe(item, depth + 1));
  if (!isPlainObject(value)) throw new TypeError("Style preset config must be JSON-safe data.");

  const result = Object.create(null);
  for (const [key, child] of Object.entries(value)) {
    const normalizedKey = String(key).toLowerCase();
    if (FORBIDDEN_CONFIG_KEYS.has(normalizedKey)) {
      throw new TypeError(`Style preset config cannot contain ${key}.`);
    }
    result[key] = cloneJsonSafe(child, depth + 1);
  }
  return result;
}

function normalizePresetName(name) {
  const normalized = String(name ?? "").trim();
  if (!normalized) throw new TypeError("Style preset name is required.");
  if (normalized.length > MAX_PRESET_NAME_LENGTH) {
    throw new TypeError(`Style preset name must be ${MAX_PRESET_NAME_LENGTH} characters or fewer.`);
  }
  return normalized;
}

function normalizePresetId(id) {
  const normalized = String(id ?? "").trim();
  if (!PRESET_ID_RE.test(normalized)) {
    throw new TypeError("Style preset id must use 1-64 letters, numbers, dots, underscores, or hyphens.");
  }
  return normalized;
}

function normalizeBatchItem(item, index) {
  if (typeof item === "string") {
    return { id: `item-${index + 1}`, name: `Item ${index + 1}`, jsonText: item };
  }
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new TypeError(`Batch item ${index + 1} must be a JSON string or item object.`);
  }
  if (typeof item.jsonText !== "string") {
    throw new TypeError(`Batch item ${index + 1} must include string jsonText.`);
  }
  const id = item.id == null ? `item-${index + 1}` : String(item.id);
  const name = item.name == null ? `Item ${index + 1}` : String(item.name);
  return { id, name, jsonText: item.jsonText };
}

function normalizeBatchResult(result) {
  if (!result || typeof result !== "object" || typeof result.code !== "string") {
    throw new TypeError("Converter must return an object with string code.");
  }
  return {
    code: result.code,
    warnings: Array.isArray(result.warnings) ? result.warnings.map((value) => String(value)) : [],
    stats: result.stats && typeof result.stats === "object" ? { ...result.stats } : {}
  };
}

function normalizeError(error) {
  if (error instanceof Error && error.message) return error.message;
  return String(error || "Conversion failed.");
}

export async function runBatch(items, convertOne) {
  if (!Array.isArray(items)) throw new TypeError("Batch items must be an array.");
  if (typeof convertOne !== "function") throw new TypeError("A converter callback is required.");

  const results = [];
  for (let index = 0; index < items.length; index += 1) {
    let normalized;
    try {
      normalized = normalizeBatchItem(items[index], index);
      const converted = normalizeBatchResult(await convertOne(normalized.jsonText, {
        id: normalized.id,
        name: normalized.name,
        index
      }));
      results.push({
        id: normalized.id,
        name: normalized.name,
        status: "ok",
        code: converted.code,
        warnings: converted.warnings,
        stats: converted.stats
      });
    } catch (error) {
      results.push({
        id: normalized?.id ?? `item-${index + 1}`,
        name: normalized?.name ?? `Item ${index + 1}`,
        status: "error",
        error: normalizeError(error)
      });
    }
  }
  return results;
}

function readPresetRecords(storage, storageKey) {
  const raw = storage.getItem(storageKey);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new TypeError("Stored style presets are invalid.");
  return parsed.map((record) => ({
    id: normalizePresetId(record.id),
    name: normalizePresetName(record.name),
    config: cloneJsonSafe(record.config)
  }));
}

function writePresetRecords(storage, storageKey, records) {
  storage.setItem(storageKey, JSON.stringify(records));
}

export function createPresetStore(storage, storageKey = DEFAULT_PRESET_STORAGE_KEY) {
  if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") {
    throw new TypeError("A local storage-compatible adapter is required.");
  }
  const key = String(storageKey || DEFAULT_PRESET_STORAGE_KEY);

  return Object.freeze({
    list() {
      return readPresetRecords(storage, key).map((record) => ({
        id: record.id,
        name: record.name,
        config: cloneJsonSafe(record.config)
      }));
    },
    get(id) {
      const target = normalizePresetId(id);
      const record = readPresetRecords(storage, key).find((item) => item.id === target);
      return record ? { id: record.id, name: record.name, config: cloneJsonSafe(record.config) } : null;
    },
    save({ id, name, config }) {
      const record = {
        id: normalizePresetId(id),
        name: normalizePresetName(name),
        config: cloneJsonSafe(config ?? {})
      };
      const records = readPresetRecords(storage, key);
      const existingIndex = records.findIndex((item) => item.id === record.id);
      if (existingIndex >= 0) records[existingIndex] = record;
      else records.push(record);
      writePresetRecords(storage, key, records);
      return { id: record.id, name: record.name, config: cloneJsonSafe(record.config) };
    },
    remove(id) {
      const target = normalizePresetId(id);
      const records = readPresetRecords(storage, key);
      const filtered = records.filter((item) => item.id !== target);
      if (filtered.length === records.length) return false;
      writePresetRecords(storage, key, filtered);
      return true;
    },
    clear() {
      if (typeof storage.removeItem === "function") storage.removeItem(key);
      else writePresetRecords(storage, key, []);
    }
  });
}

export async function renderWithAdapter(mermaidCode, preset, renderer) {
  if (typeof mermaidCode !== "string" || !mermaidCode.trim()) {
    throw new TypeError("Mermaid source is required.");
  }
  if (typeof renderer !== "function") throw new TypeError("A local renderer adapter is required.");

  const config = preset && typeof preset === "object" && Object.prototype.hasOwnProperty.call(preset, "config")
    ? cloneJsonSafe(preset.config)
    : cloneJsonSafe(preset ?? {});
  const rendered = await renderer(mermaidCode, config);
  const svg = typeof rendered === "string" ? rendered : rendered?.svg;
  if (typeof svg !== "string" || !/<svg\b/i.test(svg)) {
    throw new TypeError("Renderer adapter must return SVG markup.");
  }
  return { svg, config };
}

export function createSvgBlob(svgMarkup, BlobCtor = globalThis.Blob) {
  if (typeof svgMarkup !== "string" || !/<svg\b/i.test(svgMarkup)) {
    throw new TypeError("Valid SVG markup is required.");
  }
  if (typeof BlobCtor !== "function") throw new TypeError("Blob support is required.");
  return new BlobCtor([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
}

export async function svgToPngBlob(svgMarkup, options = {}) {
  const BlobCtor = options.BlobCtor ?? globalThis.Blob;
  const urlApi = options.urlApi ?? globalThis.URL;
  const imageFactory = options.imageFactory ?? (() => new globalThis.Image());
  const canvasFactory = options.canvasFactory ?? (() => globalThis.document.createElement("canvas"));

  if (!urlApi || typeof urlApi.createObjectURL !== "function" || typeof urlApi.revokeObjectURL !== "function") {
    throw new TypeError("Object URL support is required for PNG export.");
  }
  if (typeof imageFactory !== "function" || typeof canvasFactory !== "function") {
    throw new TypeError("Image and canvas factories are required for PNG export.");
  }

  const svgBlob = createSvgBlob(svgMarkup, BlobCtor);
  const objectUrl = urlApi.createObjectURL(svgBlob);

  try {
    const image = imageFactory();
    if (!image) throw new TypeError("Image factory did not return an image object.");

    await new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("SVG image could not be loaded for PNG export."));
      image.src = objectUrl;
    });

    const width = Number(options.width ?? image.naturalWidth ?? image.width);
    const height = Number(options.height ?? image.naturalHeight ?? image.height);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
      throw new TypeError("PNG export requires positive render dimensions.");
    }

    const canvas = canvasFactory();
    if (!canvas || typeof canvas.getContext !== "function" || typeof canvas.toBlob !== "function") {
      throw new TypeError("Canvas export support is required for PNG export.");
    }
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const context = canvas.getContext("2d");
    if (!context || typeof context.drawImage !== "function") {
      throw new TypeError("2D canvas context is required for PNG export.");
    }
    if (options.background) {
      context.save?.();
      context.fillStyle = String(options.background);
      context.fillRect?.(0, 0, canvas.width, canvas.height);
      context.restore?.();
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("PNG export failed."));
        else resolve(blob);
      }, "image/png");
    });
  } finally {
    urlApi.revokeObjectURL(objectUrl);
  }
}

export const JSON2MERMAID_PRO_ENGINE_VERSION = 1;
