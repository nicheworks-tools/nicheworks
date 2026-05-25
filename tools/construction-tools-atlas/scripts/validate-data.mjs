import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const toolDir = path.resolve(scriptDir, "..");
const dataDir = path.join(toolDir, "data");
const indexPath = path.join(dataDir, "index.json");

const errors = [];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const addError = (file, entryId, message) => {
  errors.push(`[${file}] [${entryId}] ${message}`);
};

const readJson = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
};

const normalizeDefinitions = (value, label, fileLabel) => {
  const list = [];
  const seen = new Set();

  const addId = (id, source) => {
    if (typeof id !== "string" || id.trim() === "") {
      addError(fileLabel, "index", `${label} id must be a non-empty string (${source}).`);
      return;
    }
    if (seen.has(id)) {
      addError(fileLabel, "index", `${label} id is duplicated: ${id}.`);
      return;
    }
    seen.add(id);
    list.push({ id });
  };

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "string") {
        addId(item, `array[${index}]`);
        return;
      }
      if (isObject(item)) {
        if (typeof item.id === "string" && item.id.trim() !== "") {
          addId(item.id, `array[${index}]`);
        } else {
          addError(fileLabel, "index", `${label} entry missing id in array[${index}].`);
        }
        return;
      }
      addError(fileLabel, "index", `${label} entry must be object or string in array[${index}].`);
    });
    return { list, idSet: seen };
  }

  if (isObject(value)) {
    Object.entries(value).forEach(([key, entry]) => {
      if (!isObject(entry)) {
        addError(fileLabel, "index", `${label} map entry for ${key} must be an object.`);
        return;
      }
      addId(key, `map.${key}`);
    });
    return { list, idSet: seen };
  }

  addError(fileLabel, "index", `${label} must be an array or object map.`);
  return { list, idSet: seen };
};

const safeResolve = (relativePath, fileLabel) => {
  const resolved = path.resolve(toolDir, relativePath);
  if (!resolved.startsWith(toolDir + path.sep)) {
    addError(fileLabel, "pack", `Invalid pack path outside tool directory: ${relativePath}`);
    return null;
  }
  return resolved;
};

const resolvePackPath = async (packFile, fileLabel) => {
  if (typeof packFile !== "string" || packFile.trim() === "") {
    addError(fileLabel, "pack", "Pack file path must be a non-empty string.");
    return null;
  }

  const normalized = packFile.replace(/\\/g, "/").replace(/^\.\//, "");
  const candidates = [];

  if (normalized.startsWith("data/")) {
    candidates.push(normalized);
  } else if (normalized.startsWith("packs/")) {
    candidates.push(path.join("data", normalized));
  } else {
    candidates.push(path.join("data", "packs", normalized));
    candidates.push(path.join("data", normalized));
    candidates.push(normalized);
  }

  for (const candidate of candidates) {
    const resolved = safeResolve(candidate, fileLabel);
    if (!resolved) {
      continue;
    }
    try {
      await fs.access(resolved);
      return { resolved, display: candidate };
    } catch {
      continue;
    }
  }

  addError(fileLabel, "pack", `Pack file not found for path: ${packFile}`);
  return null;
};

const validateEntry = (entry, packLabel, categoriesSet, tasksSet, seenIds) => {
  if (!isObject(entry)) {
    addError(packLabel, "unknown", "Entry must be an object.");
    return;
  }

  const entryId = typeof entry.id === "string" ? entry.id.trim() : "";
  if (!entryId) {
    addError(packLabel, "missing-id", "Entry id is required and must be a non-empty string.");
  } else if (seenIds.has(entryId)) {
    addError(packLabel, entryId, "Entry id is duplicated across packs.");
  } else {
    seenIds.add(entryId);
  }

  const term = entry.term ?? entry.title;
  if (!isObject(term)) {
    addError(packLabel, entryId || "missing-id", "Entry term/title must be an object.");
  } else {
    const hasJa = typeof term.ja === "string" && term.ja.trim() !== "";
    const hasEn = typeof term.en === "string" && term.en.trim() !== "";
    if (!hasJa && !hasEn) {
      addError(packLabel, entryId || "missing-id", "Entry term/title must include ja or en text.");
    }
  }

  if (Object.prototype.hasOwnProperty.call(entry, "description") && !isObject(entry.description)) {
    addError(packLabel, entryId || "missing-id", "Entry description must be an object when present.");
  }

  const validateRefs = (value, set, label) => {
    if (value === undefined || value === null) {
      return;
    }
    const ids = [];
    if (typeof value === "string") {
      ids.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => ids.push(item));
    } else {
      addError(packLabel, entryId || "missing-id", `${label} must be a string or array.`);
      return;
    }

    ids.forEach((id) => {
      if (typeof id !== "string" || id.trim() === "") {
        addError(packLabel, entryId || "missing-id", `${label} id must be a non-empty string.`);
        return;
      }
      if (!set.has(id)) {
        addError(packLabel, entryId || "missing-id", `${label} id not found in index: ${id}.`);
      }
    });
  };

  validateRefs(entry.categories, categoriesSet, "category");
  validateRefs(entry.tasks, tasksSet, "task");
};

const run = async () => {
  let index;
  try {
    index = await readJson(indexPath);
  } catch (error) {
    addError("data/index.json", "index", `Failed to load index.json: ${error.message}`);
    return;
  }

  const { idSet: categorySet } = normalizeDefinitions(index.categories, "category", "data/index.json");
  const { idSet: taskSet } = normalizeDefinitions(index.tasks, "task", "data/index.json");

  if (!Array.isArray(index.packs)) {
    addError("data/index.json", "index", "packs must be an array.");
    return;
  }

  const seenIds = new Set();

  for (const pack of index.packs) {
    if (!isObject(pack)) {
      addError("data/index.json", "index", "Each pack entry must be an object.");
      continue;
    }

    const packFile = pack.file;
    const resolved = await resolvePackPath(packFile, "data/index.json");
    if (!resolved) {
      continue;
    }

    const packLabel = resolved.display;
    let packData;
    try {
      packData = await readJson(resolved.resolved);
    } catch (error) {
      addError(packLabel, "pack", `Failed to load pack JSON: ${error.message}`);
      continue;
    }

    const entries = Array.isArray(packData)
      ? packData
      : isObject(packData) && Array.isArray(packData.entries)
        ? packData.entries
        : null;

    if (!entries) {
      addError(packLabel, "pack", "Pack must be an array or an object with entries array.");
      continue;
    }

    entries.forEach((entry) => validateEntry(entry, packLabel, categorySet, taskSet, seenIds));
  }
};

await run();

if (errors.length > 0) {
  errors.forEach((message) => console.error(message));
  console.error(`Validation failed with ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log("Validation passed.");
}
