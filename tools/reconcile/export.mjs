function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function resultsToCsv(results) {
  const headers = ['status', 'relation', 'a_rows', 'b_rows', 'normalized_amount', 'normalized_date', 'reason'];
  const lines = [headers.join(',')];
  for (const item of results) {
    lines.push([
      item.status,
      item.relation,
      item.aRows.join('|'),
      item.bRows.join('|'),
      item.amount ?? '',
      item.date ?? '',
      item.reason
    ].map(csvEscape).join(','));
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
