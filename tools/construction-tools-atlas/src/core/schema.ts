import { normalizeAliases, normalizeOptionalDescription, normalizeString, normalizeStringArray } from './normalize';

export interface AtlasTerm {
  ja: string;
  en: string;
}

export interface AtlasAliases {
  ja: string[];
  en: string[];
}

export interface AtlasDescription {
  ja?: string;
  en?: string;
}

export interface AtlasEntry {
  id: string;
  term: AtlasTerm;
  category: string;
  tags?: string[];
  aliases?: Partial<AtlasAliases>;
  description?: AtlasDescription;
}

export interface NormalizedAtlasEntry {
  id: string;
  term: AtlasTerm;
  category: string;
  tags: string[];
  aliases: AtlasAliases;
  description?: AtlasDescription;
}

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  path: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationResult {
  success: boolean;
  issues: ValidationIssue[];
  value?: NormalizedAtlasEntry;
}

const MAX_ID_LENGTH = 120;
const MAX_TERM_LENGTH = 200;
const MAX_ALIAS_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

function ensureNonEmpty(value: string | undefined): boolean {
  return !!value && value.length > 0;
}

function validateLength(value: string | undefined, max: number): boolean {
  if (value === undefined) return true;
  return value.length <= max;
}

export function validateEntry(raw: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!raw || typeof raw !== 'object') {
    return { success: false, issues: [{ path: '', message: 'Entry must be an object', severity: 'error' }] };
  }

  const data = raw as Record<string, unknown>;

  const id = normalizeString(data.id);
  if (!ensureNonEmpty(id)) {
    issues.push({ path: 'id', message: 'id is required and must be a non-empty string', severity: 'error' });
  } else if (!validateLength(id, MAX_ID_LENGTH)) {
    issues.push({ path: 'id', message: `id exceeds ${MAX_ID_LENGTH} characters`, severity: 'error' });
  }

  const termRaw = data.term as Record<string, unknown> | undefined;
  if (!termRaw || typeof termRaw !== 'object') {
    issues.push({ path: 'term', message: 'term is required', severity: 'error' });
  }

  const termJa = normalizeString(termRaw?.ja);
  const termEn = normalizeString(termRaw?.en ?? '');

  if (!ensureNonEmpty(termJa)) {
    issues.push({ path: 'term.ja', message: 'term.ja is required and must be non-empty', severity: 'error' });
  } else if (!validateLength(termJa, MAX_TERM_LENGTH)) {
    issues.push({ path: 'term.ja', message: `term.ja exceeds ${MAX_TERM_LENGTH} characters`, severity: 'error' });
  }

  if (termEn === undefined) {
    issues.push({ path: 'term.en', message: 'term.en must be a string (can be empty)', severity: 'error' });
  } else if (!validateLength(termEn, MAX_TERM_LENGTH)) {
    issues.push({ path: 'term.en', message: `term.en exceeds ${MAX_TERM_LENGTH} characters`, severity: 'error' });
  } else if (termEn.length === 0) {
    issues.push({ path: 'term.en', message: 'term.en is empty (allowed, but noted)', severity: 'warning' });
  }

  const category = normalizeString(data.category);
  if (!ensureNonEmpty(category)) {
    issues.push({ path: 'category', message: 'category is required and must be non-empty', severity: 'error' });
  }

  const tags = normalizeStringArray(data.tags);
  if ((data.tags !== undefined && !Array.isArray(data.tags))) {
    issues.push({ path: 'tags', message: 'tags must be an array of strings', severity: 'error' });
  }

  const aliases = normalizeAliases(data.aliases);

  const description = normalizeOptionalDescription(data.description);
  if (description?.ja && !description.en) {
    issues.push({ path: 'description.en', message: 'description.ja exists but description.en is missing', severity: 'warning' });
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

  const normalized: NormalizedAtlasEntry | undefined = ensureNonEmpty(id) && ensureNonEmpty(termJa) && ensureNonEmpty(category)
    ? {
        id: id as string,
        term: { ja: termJa as string, en: termEn ?? '' },
        category: category as string,
        tags,
        aliases,
        description: description,
      }
    : undefined;

  const hasErrors = issues.some((issue) => issue.severity === 'error');

  return {
    success: !hasErrors,
    issues,
    value: !hasErrors && normalized ? normalized : undefined,
  };
}
