function countDelimiter(line, delimiter) {
  let quoted = false;
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') i += 1;
      else quoted = !quoted;
    } else if (!quoted && ch === delimiter) {
      count += 1;
    }
  }
  return count;
}

export function detectDelimiter(text) {
  const line = String(text).split(/\r?\n/).find((item) => item.trim()) || '';
  const candidates = [',', '\t', ';'];
  return candidates
    .map((delimiter) => ({ delimiter, count: countDelimiter(line, delimiter) }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter || ',';
}

export function parseCsvText(text, delimiter = 'auto') {
  const source = String(text ?? '').replace(/^\uFEFF/, '');
  const sep = delimiter === 'auto' ? detectDelimiter(source) : delimiter;
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === sep) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (quoted) throw new Error('csv_unclosed_quote');
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }

  return { delimiter: sep, rows };
}

function decode(buffer, encoding, fatal = false) {
  return new TextDecoder(encoding, { fatal }).decode(buffer);
}

export async function readCsvFile(file, { encoding = 'auto', delimiter = 'auto' } = {}) {
  const buffer = await file.arrayBuffer();
  let usedEncoding = encoding;
  let text;

  if (encoding === 'auto') {
    try {
      text = decode(buffer, 'utf-8', true);
      usedEncoding = 'utf-8';
    } catch {
      text = decode(buffer, 'shift_jis');
      usedEncoding = 'shift_jis';
    }
  } else {
    text = decode(buffer, encoding === 'shift_jis' ? 'shift_jis' : 'utf-8');
  }

  const parsed = parseCsvText(text, delimiter);
  return { ...parsed, encoding: usedEncoding, size: file.size, name: file.name };
}

function makeUniqueHeaders(values) {
  const seen = new Map();
  return values.map((value, i) => {
    const base = String(value || `Column ${i + 1}`).trim() || `Column ${i + 1}`;
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });
}

export function tableFromRows(rows, headerRow = 1) {
  const index = Math.max(0, Number(headerRow || 1) - 1);
  const headers = makeUniqueHeaders(rows[index] || []);
  const data = rows.slice(index + 1).filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));
  return {
    headers,
    rows: data.map((values, dataIndex) => ({
      sourceRow: index + dataIndex + 2,
      values: Object.fromEntries(headers.map((header, colIndex) => [header, values[colIndex] ?? '']))
    }))
  };
}
