import { tableFromRows } from './parser.mjs';

function xlsxApi(api = globalThis.XLSX) {
  if (!api || typeof api.read !== 'function' || !api.utils) {
    throw new Error('xlsx_library_missing');
  }
  return api;
}

export function isXlsxAvailable(api = globalThis.XLSX) {
  return Boolean(api && typeof api.read === 'function' && api.utils);
}

let loaderPromise = null;

export async function ensureXlsxAvailable(url = './vendor/xlsx.full.min.js') {
  if (isXlsxAvailable()) return globalThis.XLSX;
  if (typeof document === 'undefined') throw new Error('xlsx_library_missing');
  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.dataset.reconcileXlsxVendor = 'true';
      script.addEventListener('load', () => isXlsxAvailable() ? resolve(globalThis.XLSX) : reject(new Error('xlsx_library_missing')), { once: true });
      script.addEventListener('error', () => reject(new Error('xlsx_vendor_load_failed')), { once: true });
      document.head.appendChild(script);
    }).catch((error) => {
      loaderPromise = null;
      throw error;
    });
  }
  return loaderPromise;
}

export async function readXlsxFile(file, api = globalThis.XLSX) {
  const XLSX = xlsxApi(api);
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetNames = Array.isArray(workbook?.SheetNames) ? workbook.SheetNames.filter(Boolean) : [];
  if (!sheetNames.length) throw new Error('xlsx_no_worksheet');
  return { workbook, sheetNames, name: file.name, size: file.size };
}

export function tableFromXlsx(source, sheetName, headerRow = 1, api = globalThis.XLSX) {
  const XLSX = xlsxApi(api);
  const worksheet = source?.workbook?.Sheets?.[sheetName];
  if (!worksheet) throw new Error('xlsx_worksheet_missing');
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    dateNF: 'yyyy-mm-dd',
    defval: '',
    blankrows: false
  });
  return tableFromRows(rows, headerRow);
}

function reportRows(results) {
  return results.map((item) => ({
    status: item.status,
    relation: item.relation,
    a_rows: item.aRows.join('|'),
    b_rows: item.bRows.join('|'),
    normalized_amount: item.amount ?? '',
    normalized_date: item.date ?? '',
    reason: item.reason
  }));
}

export function createResultsWorkbook(results, context = {}, api = globalThis.XLSX) {
  const XLSX = xlsxApi(api);
  const workbook = XLSX.utils.book_new();
  const summaryRows = [
    ['NicheWorks Reconcile'],
    ['Generated at', context.generatedAt || new Date().toISOString()],
    ['File A', context.fileA || ''],
    ['File B', context.fileB || ''],
    ['Date tolerance days', context.dateToleranceDays ?? ''],
    ['Amount tolerance', context.amountTolerance ?? ''],
    [],
    ['Status', 'Count']
  ];
  const statuses = ['exact_match', 'tolerant_match', 'candidate', 'a_only', 'b_only', 'duplicate', 'conflict'];
  for (const status of statuses) summaryRows.push([status, results.filter((item) => item.status === status).length]);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary');

  const sheets = [
    ['Matches', new Set(['exact_match', 'tolerant_match'])],
    ['Candidates', new Set(['candidate'])],
    ['A Only', new Set(['a_only'])],
    ['B Only', new Set(['b_only'])],
    ['Duplicates', new Set(['duplicate'])],
    ['Conflicts', new Set(['conflict'])]
  ];
  for (const [name, accepted] of sheets) {
    const rows = reportRows(results.filter((item) => accepted.has(item.status)));
    const worksheet = rows.length
      ? XLSX.utils.json_to_sheet(rows)
      : XLSX.utils.aoa_to_sheet([['status', 'relation', 'a_rows', 'b_rows', 'normalized_amount', 'normalized_date', 'reason']]);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  }
  return workbook;
}

export function resultsWorkbookBytes(results, context = {}, api = globalThis.XLSX) {
  const XLSX = xlsxApi(api);
  const workbook = createResultsWorkbook(results, context, XLSX);
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array', compression: true });
}
