import type {
  PostTypeSummary,
  MetaKeySummary,
  TaxonomySummary
} from "./types.js";

interface SqlParseResult {
  tablePrefix: string;
  postTypes: PostTypeSummary[];
  metaKeys: MetaKeySummary[];
  taxonomies: TaxonomySummary[];
}

interface PostRow {
  id: number;
  postType: string;
  postStatus: string;
  postName: string;
}

interface MetaRow {
  postId: number;
  key: string;
}

export function parseSqlDump(sql: string): SqlParseResult {
  const tablePrefix = detectTablePrefix(sql);

  const posts = extractPosts(sql, tablePrefix);
  const postTypes = summarizePostTypes(posts);

  const metas = extractPostmeta(sql, tablePrefix);
  const metaKeys = summarizeMetaKeys(metas, posts);

  const taxonomies = extractTaxonomies(sql, tablePrefix);

  return {
    tablePrefix,
    postTypes,
    metaKeys,
    taxonomies
  };
}

function detectTablePrefix(sql: string): string {
  const m = sql.match(/CREATE TABLE\s+`?([a-zA-Z0-9_]+)_posts`?/);
  return m ? m[1] : "wp";
}

function extractPosts(sql: string, prefix: string): PostRow[] {
  const table = `${prefix}_posts`;
  const rows: PostRow[] = [];

  const insertRegex = new RegExp(
    `INSERT INTO\s+\`?${table}\`?\s*\([^)]*\)\s*VALUES\s*([\s\S]*?);`,
    "gi"
  );

  let m: RegExpExecArray | null;
  while ((m = insertRegex.exec(sql))) {
    const valuesChunk = m[1];
    const tuples = splitTuples(valuesChunk);
    for (const t of tuples) {
      const cols = splitColumns(t);

      const id = parseInt(cols[0] || "0", 10);
      const postStatus = stripQuotes(cols[7] || "");
      const postName = stripQuotes(cols[11] || "");
      const postType = stripQuotes(cols[17] || "");

      if (!isNaN(id) && postType) {
        rows.push({ id, postType, postStatus, postName });
      }
    }
  }

  return rows;
}

function extractPostmeta(sql: string, prefix: string): MetaRow[] {
  const table = `${prefix}_postmeta`;
  const rows: MetaRow[] = [];

  const insertRegex = new RegExp(
    `INSERT INTO\s+\`?${table}\`?\s*\([^)]*\)\s*VALUES\s*([\s\S]*?);`,
    "gi"
  );

  let m: RegExpExecArray | null;
  while ((m = insertRegex.exec(sql))) {
    const valuesChunk = m[1];
    const tuples = splitTuples(valuesChunk);
    for (const t of tuples) {
      const cols = splitColumns(t);
      const postId = parseInt(cols[1] || "0", 10);
      const key = stripQuotes(cols[2] || "");
      if (!isNaN(postId) && key) {
        rows.push({ postId, key });
      }
    }
  }

  return rows;
}

function extractTaxonomies(sql: string, prefix: string): TaxonomySummary[] {
  const table = `${prefix}_term_taxonomy`;
  const rows: Record<string, number> = {};

  const insertRegex = new RegExp(
    `INSERT INTO\s+\`?${table}\`?\s*\([^)]*\)\s*VALUES\s*([\s\S]*?);`,
    "gi"
  );

  let m: RegExpExecArray | null;
  while ((m = insertRegex.exec(sql))) {
    const valuesChunk = m[1];
    const tuples = splitTuples(valuesChunk);
    for (const t of tuples) {
      const cols = splitColumns(t);
      const taxonomy = stripQuotes(cols[1] || "");
      const count = parseInt(cols[4] || "0", 10);
      if (!taxonomy) continue;
      rows[taxonomy] = (rows[taxonomy] || 0) + (isNaN(count) ? 0 : count);
    }
  }

  return Object.entries(rows).map(([taxonomy, terms]) => ({
    taxonomy,
    terms
  }));
}

function summarizePostTypes(posts: PostRow[]): PostTypeSummary[] {
  const map: Record<string, PostTypeSummary> = {};

  for (const p of posts) {
    if (!map[p.postType]) {
      map[p.postType] = {
        postType: p.postType,
        total: 0,
        byStatus: {},
        sampleSlugs: []
      };
    }
    const s = map[p.postType];
    s.total++;
    s.byStatus[p.postStatus] = (s.byStatus[p.postStatus] || 0) + 1;
    if (s.sampleSlugs.length < 5 && p.postName) {
      s.sampleSlugs.push(p.postName);
    }
  }

  return Object.values(map).sort((a, b) => b.total - a.total);
}

function summarizeMetaKeys(
  metas: MetaRow[],
  posts: PostRow[]
): MetaKeySummary[] {
  const postTypeById = new Map<number, string>();
  for (const p of posts) {
    postTypeById.set(p.id, p.postType);
  }

  const map: Record<string, MetaKeySummary> = {};
  for (const m of metas) {
    const pt = postTypeById.get(m.postId) || "_unknown";
    if (!map[m.key]) {
      map[m.key] = {
        metaKey: m.key,
        count: 0,
        postTypes: {}
      };
    }
    const s = map[m.key];
    s.count++;
    s.postTypes[pt] = (s.postTypes[pt] || 0) + 1;
  }

  return Object.values(map)
    .sort((a, b) => b.count - a.count)
    .slice(0, 500);
}

function splitTuples(valuesChunk: string): string[] {
  const tuples: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < valuesChunk.length; i++) {
    const c = valuesChunk[i];
    if (c === "(") {
      if (depth === 0) current = "";
      depth++;
      current += c;
    } else if (c === ")") {
      depth--;
      current += c;
      if (depth === 0) {
        tuples.push(current.trim());
        current = "";
      }
    } else {
      current += c;
    }
  }
  return tuples;
}

function splitColumns(tuple: string): string[] {
  let inner = tuple.trim();
  if (inner.startsWith("(")) inner = inner.slice(1);
  if (inner.endsWith(")")) inner = inner.slice(0, -1);

  const cols: string[] = [];
  let current = "";
  let inString = false;
  let prev = "";

  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === "'" && prev !== "\\") {
      inString = !inString;
      current += c;
    } else if (c === "," && !inString) {
      cols.push(current.trim());
      current = "";
    } else {
      current += c;
    }
    prev = c;
  }
  if (current) cols.push(current.trim());
  return cols;
}

function stripQuotes(v: string): string {
  if (v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1).replace(/\\'/g, "'");
  }
  return v;
}
