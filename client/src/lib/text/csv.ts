export type CsvDirection = 'csv_to_json' | 'json_to_csv';

export interface CsvJsonResult {
  result: string;
  rows: number;
}

/** Parse CSV text into rows of fields, honouring quoted fields and escapes. */
function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function escapeCsvField(value: string, delimiter: string): string {
  if (value.includes('"') || value.includes(delimiter) || /[\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function csvToJson(text: string, delimiter: string): CsvJsonResult {
  const rows = parseCsv(text.trim(), delimiter);
  if (rows.length === 0) return { result: '[]', rows: 0 };

  const [header, ...dataRows] = rows;
  const records = dataRows.map((row) =>
    header.reduce<Record<string, string>>((acc, key, index) => {
      acc[key] = row[index] ?? '';
      return acc;
    }, {}),
  );
  return { result: JSON.stringify(records, null, 2), rows: records.length };
}

export function jsonToCsv(text: string, delimiter: string): CsvJsonResult {
  const parsed = JSON.parse(text);
  const records: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed];
  if (records.length === 0) return { result: '', rows: 0 };

  const headers = Array.from(
    records.reduce<Set<string>>((keys, record) => {
      Object.keys(record ?? {}).forEach((key) => keys.add(key));
      return keys;
    }, new Set()),
  );

  const lines = [headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter)];
  for (const record of records) {
    const line = headers
      .map((header) => {
        const value = record?.[header];
        const asString = value === null || value === undefined ? '' : String(value);
        return escapeCsvField(asString, delimiter);
      })
      .join(delimiter);
    lines.push(line);
  }

  return { result: lines.join('\n'), rows: records.length };
}

export function convertCsvJson(
  text: string,
  direction: CsvDirection,
  delimiter: string,
): CsvJsonResult {
  return direction === 'csv_to_json'
    ? csvToJson(text, delimiter)
    : jsonToCsv(text, delimiter);
}
