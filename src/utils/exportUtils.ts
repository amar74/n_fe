import { AccountListItem } from '@/types/accounts';

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};

const formatAddress = (address: any): string => {
  if (!address) return '';
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.pincode
  ].filter(Boolean);
  return parts.join(', ');
};

export const exportToCSV = (accounts: AccountListItem[]): void => {
  // Define headers and corresponding data keys
  const headers = [
    'Client Name',
    'Client Type',
    'Market Sector',
    'Address',
    'Primary Contact Name',
    'Primary Contact Email',
    'Total Value',
    'AI Health Score',
    'Last Contact'
  ];

  const rows = accounts.map(account => [
    account.client_name,
    account.client_type,
    account.market_sector || '',
    formatAddress(account.client_address),
    account.primary_contact_name || '',
    account.primary_contact_email || '',
    account.total_value?.toString() || '',
    account.ai_health_score?.toString() || '',
    formatDate(account.last_contact)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `accounts_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToExcel = async (accounts: AccountListItem[]): Promise<void> => {
  // Excel export using CSV format (compatible with Excel, Google Sheets, etc.)
  // This avoids Node.js dependencies while providing Excel-compatible exports
  exportToCSV(accounts);
};
