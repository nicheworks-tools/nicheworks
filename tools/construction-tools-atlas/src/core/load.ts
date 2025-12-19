import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { NormalizedAtlasEntry, validateEntry } from './schema';

export interface AtlasPackIndex {
  id: string;
  file: string;
  count?: number;
  title?: { ja?: string; en?: string };
}

export interface AtlasDataIndex {
  version: number;
  packs: AtlasPackIndex[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_DIR = path.resolve(__dirname, '..', '..', 'data');

async function loadJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function normalizeEntryOrThrow(entry: unknown, source: string): NormalizedAtlasEntry {
  const result = validateEntry(entry);
  if (!result.success || !result.value) {
    const messages = result.issues
      .map((issue) => `${issue.severity.toUpperCase()}: [${issue.path}] ${issue.message}`)
      .join('; ');
    throw new Error(`Validation failed for ${source}: ${messages}`);
  }
  return result.value;
}

export async function loadAtlasData(dataDir: string = DEFAULT_DATA_DIR): Promise<NormalizedAtlasEntry[]> {
  const indexPath = path.join(dataDir, 'index.json');
  const index = await loadJsonFile<AtlasDataIndex>(indexPath);

  if (!index || !Array.isArray(index.packs)) {
    throw new Error('index.json is missing a valid packs array');
  }

  const entries: NormalizedAtlasEntry[] = [];

  for (const pack of index.packs) {
    const packPath = path.join(dataDir, pack.file);
    const packEntries = await loadJsonFile<unknown[]>(packPath);
    packEntries.forEach((entry, idx) => {
      const normalized = normalizeEntryOrThrow(entry, `${pack.file}#${idx}`);
      entries.push(normalized);
    });
  }

  return entries;
}
