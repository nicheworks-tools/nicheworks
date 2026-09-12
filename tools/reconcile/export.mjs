function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const ORIGINAL_FIELDS = ['amount', 'date', 'reference', 'description'];

function rowIndex(rows = []) {
  return new Map(rows.map((row) => [Number(row.sourceRow), row]));
}

function originalValues(sourceRows, index, mapping = {}, field) {
  const column = mapping?.[field];
  if (!column) return '';
  return sourceRows
    .map((sourceRow) => index.get(Number(sourceRow))?.values?.[column] ?? '')
    .map((value) => String(value ?? ''))
    .join(' || ');
}

export function buildAuditRows(results, context = {}) {
  const indexA = rowIndex(context.rowsA);
  const indexB = rowIndex(context.rowsB);
  return results.map((item) => {
    const row = {
      status: item.status,
      relation: item.relation,
      a_rows: item.aRows.join('|'),
      b_rows: item.bRows.join('|'),
      normalized_amount: item.amount ?? '',
      normalized_date: item.date ?? '',
      reason: item.reason
    };
    for (const field of ORIGINAL_FIELDS) {
      row[`a_${field}_original`] = originalValues(item.aRows, indexA, context.mappingA, field);
      row[`b_${field}_original`] = originalValues(item.bRows, indexB, context.mappingB, field);
    }
    return row;
  });
}

export function auditExportHeaders() {
  return [
    'status', 'relation', 'a_rows', 'b_rows', 'normalized_amount', 'normalized_date', 'reason',
    'a_amount_original', 'a_date_original', 'a_reference_original', 'a_description_original',
    'b_amount_original', 'b_date_original', 'b_reference_original', 'b_description_original'
  ];
}

export function resultsToCsv(results, context = {}) {
  const headers = auditExportHeaders();
  const lines = [headers.join(',')];
  for (const row of buildAuditRows(results, context)) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }
  return `\uFEFF${lines.join('\r\n')}`;
}

function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  triggerDownload(filename, new Blob([text], { type }));
}

export function downloadBytes(filename, bytes, type = 'application/octet-stream') {
  triggerDownload(filename, new Blob([bytes], { type }));
}
