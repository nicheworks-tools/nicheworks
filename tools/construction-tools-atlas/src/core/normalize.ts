export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return normalizeWhitespace(value);
}

export function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter((v) => typeof v === 'string')
    .map((v) => normalizeWhitespace(v))
    .filter((v) => v.length > 0);
}

export function normalizeOptionalDescription(description: unknown): { ja?: string; en?: string } | undefined {
  if (!description || typeof description !== 'object') return undefined;
  const ja = normalizeString((description as Record<string, unknown>).ja);
  const en = normalizeString((description as Record<string, unknown>).en);
  if (ja || en) {
    const normalized: { ja?: string; en?: string } = {};
    if (ja && ja.length > 0) normalized.ja = ja;
    if (en !== undefined) normalized.en = en;
    return normalized;
  }
  return undefined;
}

export function normalizeAliases(aliases: unknown): { ja: string[]; en: string[] } {
  const data = (aliases && typeof aliases === 'object') ? (aliases as Record<string, unknown>) : {};
  return {
    ja: normalizeStringArray(data.ja),
    en: normalizeStringArray(data.en),
  };
}
