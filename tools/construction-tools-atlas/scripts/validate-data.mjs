import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');

const MAX_ID_LENGTH = 120;
const MAX_TERM_LENGTH = 200;
const MAX_ALIAS_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

function normalizeWhitespace(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeString(value) {
  if (typeof value !== 'string') return undefined;
  return normalizeWhitespace(value);
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => normalizeWhitespace(item))
    .filter((item) => item.length > 0);
}

function normalizeDescription(value) {
  if (!value || typeof value !== 'object') return undefined;
  const ja = normalizeString(value.ja);
  const en = normalizeString(value.en);
  if (!ja && !en) return undefined;
  const description = {};
  if (ja) description.ja = ja;
  if (en !== undefined) description.en = en;
  return description;
}

function normalizeAliases(value) {
  const aliases = value && typeof value === 'object' ? value : {};
  return {
    ja: normalizeStringArray(aliases.ja),
    en: normalizeStringArray(aliases.en),
  };
}

function validateLength(value, max) {
  if (value === undefined) return true;
  return value.length <= max;
}

function validateEntry(entry) {
  const issues = [];
  const warnings = [];

  if (!entry || typeof entry !== 'object') {
    return { issues: [{ path: '', message: 'Entry must be an object', severity: 'error' }], warnings, normalized: undefined };
  }

  const id = normalizeString(entry.id);
  if (!id) {
    issues.push({ path: 'id', message: 'id is required and must be non-empty', severity: 'error' });
  } else if (!validateLength(id, MAX_ID_LENGTH)) {
    issues.push({ path: 'id', message: `id exceeds ${MAX_ID_LENGTH} characters`, severity: 'error' });
  }

  const term = entry.term && typeof entry.term === 'object' ? entry.term : undefined;
  if (!term) {
    issues.push({ path: 'term', message: 'term is required', severity: 'error' });
  }
  const termJa = normalizeString(term?.ja);
  const termEn = normalizeString(term?.en ?? '');

  if (!termJa) {
    issues.push({ path: 'term.ja', message: 'term.ja is required and must be non-empty', severity: 'error' });
  } else if (!validateLength(termJa, MAX_TERM_LENGTH)) {
    issues.push({ path: 'term.ja', message: `term.ja exceeds ${MAX_TERM_LENGTH} characters`, severity: 'error' });
  }

  if (termEn === undefined) {
    issues.push({ path: 'term.en', message: 'term.en must be a string (can be empty)', severity: 'error' });
  } else if (!validateLength(termEn, MAX_TERM_LENGTH)) {
    issues.push({ path: 'term.en', message: `term.en exceeds ${MAX_TERM_LENGTH} characters`, severity: 'error' });
  } else if (termEn.length === 0) {
    warnings.push({ path: 'term.en', message: 'term.en is empty (allowed)', severity: 'warning' });
  }

  const category = normalizeString(entry.category);
  if (!category) {
    issues.push({ path: 'category', message: 'category is required and must be non-empty', severity: 'error' });
  }

  const tags = normalizeStringArray(entry.tags);
  if (entry.tags !== undefined && !Array.isArray(entry.tags)) {
    issues.push({ path: 'tags', message: 'tags must be an array of strings', severity: 'error' });
  }

  const aliases = normalizeAliases(entry.aliases);

  const description = normalizeDescription(entry.description);
  if (description?.ja && !description.en) {
    warnings.push({ path: 'description.en', message: 'description.ja exists but description.en is missing', severity: 'warning' });
  }

  if (description) {
    if (!validateLength(description.ja, MAX_DESCRIPTION_LENGTH)) {
      issues.push({ path: 'description.ja', message: `description.ja exceeds ${MAX_DESCRIPTION_LENGTH} characters`, severity: 'error' });
    }
    if (!validateLength(description.en, MAX_DESCRIPTION_LENGTH)) {
      issues.push({ path: 'description.en', message: `description.en exceeds ${MAX_DESCRIPTION_LENGTH} characters`, severity: 'error' });
    }
  }

  aliases.ja.forEach((value, index) => {
    if (!validateLength(value, MAX_ALIAS_LENGTH)) {
      issues.push({ path: `aliases.ja[${index}]`, message: `alias exceeds ${MAX_ALIAS_LENGTH} characters`, severity: 'error' });
    }
  });
  aliases.en.forEach((value, index) => {
    if (!validateLength(value, MAX_ALIAS_LENGTH)) {
      issues.push({ path: `aliases.en[${index}]`, message: `alias exceeds ${MAX_ALIAS_LENGTH} characters`, severity: 'error' });
    }
  });

  const hasErrors = issues.some((issue) => issue.severity === 'error');
  const normalized = !hasErrors && id && termJa && category
    ? {
        id,
        term: { ja: termJa, en: termEn ?? '' },
        category,
        tags,
        aliases,
        description,
      }
    : undefined;

  return { issues, warnings, normalized };
}

async function loadJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

function reportIssue(file, entryId, issue, collector) {
  const idPart = entryId ? `:${entryId}` : '';
  const pathPart = issue.path ? `/${issue.path}` : '';
  collector.push(`${issue.severity.toUpperCase()} [${file}${idPart}${pathPart}] ${issue.message}`);
}

async function main() {
  const errors = [];
  const warnings = [];
  const seenIds = new Map();

  const indexPath = path.join(DATA_DIR, 'index.json');
  const indexData = await loadJson(indexPath);

  if (!indexData || !Array.isArray(indexData.packs)) {
    console.error('index.json must contain a packs array');
    process.exitCode = 1;
    return;
  }

  for (const pack of indexData.packs) {
    const packPath = path.join(DATA_DIR, pack.file);
    let packEntries;
    try {
      packEntries = await loadJson(packPath);
    } catch (err) {
      errors.push(`ERROR [${pack.file}] ${err.message}`);
      continue;
    }
    if (!Array.isArray(packEntries)) {
      errors.push(`ERROR [${pack.file}] pack file must contain an array`);
      continue;
    }

    packEntries.forEach((entry, index) => {
      const { issues, warnings: entryWarnings, normalized } = validateEntry(entry);
      const entryId = normalized?.id || (typeof entry?.id === 'string' ? entry.id : `index-${index}`);

      issues.forEach((issue) => reportIssue(pack.file, entryId, issue, errors));
      entryWarnings.forEach((issue) => reportIssue(pack.file, entryId, issue, warnings));

      if (normalized) {
        if (seenIds.has(normalized.id)) {
          const firstLocation = seenIds.get(normalized.id);
          errors.push(`ERROR [${pack.file}:${normalized.id}] duplicate id also found in ${firstLocation}`);
        } else {
          seenIds.set(normalized.id, pack.file);
        }
      }
    });
  }

  if (warnings.length > 0) {
    console.warn('Warnings:');
    warnings.forEach((line) => console.warn(`  - ${line}`));
  }

  if (errors.length > 0) {
    console.error('Validation failed:');
    errors.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('Validation passed. Packs loaded: %d. Unique entries: %d.', indexData.packs.length, seenIds.size);
}

main().catch((err) => {
  console.error('Unexpected error during validation:', err);
  process.exitCode = 1;
});
