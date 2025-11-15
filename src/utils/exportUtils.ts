type CsvRow = Record<string, string | number | null | undefined>;

type ExportColumn = {
  key: string;
  label: string;
  format?: (value: unknown, row: CsvRow) => string | number | null | undefined;
};

type ExportOptions = {
  headers: ExportColumn[];
  filename?: string;
};

const escapeCell = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  return `"${String(value).replace(/"/g, '""')}"`;
};

const buildRow = (row: CsvRow, headers: ExportColumn[]): string => {
  return headers
    .map(header => {
      const rawValue =
        typeof header.format === 'function'
          ? header.format(row[header.key], row)
          : row[header.key];
      return escapeCell(rawValue);
    })
    .join(',');
};

export const exportToCSV = (
  rows: CsvRow[],
  { headers, filename }: ExportOptions
): void => {
  if (!rows.length) {
    return;
  }

  const headerRow = headers.map(header => escapeCell(header.label)).join(',');
  const dataRows = rows.map(row => buildRow(row, headers));

  const csvContent = [headerRow, ...dataRows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename ?? `export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToExcel = async (
  rows: CsvRow[],
  options: ExportOptions
): Promise<void> => {
  exportToCSV(rows, options);
};
