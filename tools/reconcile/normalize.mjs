export function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function normalizeReference(value) {
  return normalizeText(value).toLowerCase();
}

export function normalizeAmount(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Number(value.toFixed(12)) : null;
  }
  let text = normalizeText(value);
  if (!text) return null;

  let negative = false;
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }

  text = text
    .replace(/[¥￥$€£]/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '');

  if (!/^[-+]?\d+(?:\.\d+)?$/.test(text)) return null;
  const number = Number(text);
  if (!Number.isFinite(number)) return null;
  const signed = negative ? -Math.abs(number) : number;
  return Number(signed.toFixed(12));
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function validDateParts(year, month, day) {
  return year >= 1900 && year <= 2200 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

function toDayKey(year, month, day) {
  if (!validDateParts(year, month, day)) return null;
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

export function normalizeDate(value, mode = 'auto') {
  const text = normalizeText(value);
  if (!text) return { dayKey: null, iso: '', error: null };

  let match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const dayKey = toDayKey(year, month, day);
    return dayKey === null
      ? { dayKey: null, iso: '', error: 'invalid_date' }
      : { dayKey, iso: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, error: null };
  }

  match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (!match) return { dayKey: null, iso: '', error: 'invalid_date' };

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);
  let month;
  let day;

  if (mode === 'mdy') {
    month = first; day = second;
  } else if (mode === 'dmy') {
    day = first; month = second;
  } else if (first > 12 && second <= 12) {
    day = first; month = second;
  } else if (second > 12 && first <= 12) {
    month = first; day = second;
  } else {
    return { dayKey: null, iso: '', error: 'ambiguous_date' };
  }

  const dayKey = toDayKey(year, month, day);
  return dayKey === null
    ? { dayKey: null, iso: '', error: 'invalid_date' }
    : { dayKey, iso: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, error: null };
}
