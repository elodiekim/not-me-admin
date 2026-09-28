// Excel/Sheets evaluate a cell starting with =, +, -, or @ as a formula. Since
// these fields come from user-controlled data (name, address, etc.), a value
// like =HYPERLINK("http://evil.example") would run when an admin opens the
// export. Prefixing with a single quote forces it to render as plain text —
// only applied to strings, since our own numeric fields are never raw user input.
const FORMULA_PREFIX = /^[=+\-@]/;

function escapeCsvField(value: string | number): string {
  let str = String(value);
  if (typeof value === 'string' && FORMULA_PREFIX.test(str)) {
    str = `'${str}`;
  }
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h])).join(',')),
  ];
  return lines.join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
