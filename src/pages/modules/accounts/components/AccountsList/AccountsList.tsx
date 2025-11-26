import { AccountListItem } from '@/types/accounts';
import { useState } from 'react';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import { ApprovalModal } from '../ApprovalModal';
import { DeclineModal } from '../DeclineModal';
import { apiClient } from '@/services/api/client';
import { STORAGE_CONSTANTS } from '@/constants/storageConstants';

type AccountsListProps = {
  accounts: AccountListItem[];
  isLoading?: boolean;
  onAccountClick?: (accountId: string) => void;
  onApprove?: (accountId: string, notes: string) => void;
  onDecline?: (accountId: string, notes: string) => void;
  pagination?: {
    total: number;
    page: number;
    size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  onPageChange?: (page: number) => void;
}

export function AccountsList({ 
  accounts, 
  isLoading, 
  onAccountClick, 
  onApprove, 
  onDecline,
  pagination,
  onPageChange
}: AccountsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; name: string } | null>(null);
  const [showOnlyApproved, setShowOnlyApproved] = useState(true); // Show only approved by default
  const [isExporting, setIsExporting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed8a09]"></div>
      </div>
    );
  }

  // Show empty state before filtering
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-500 text-lg mb-2">No accounts found</div>
        <div className="text-gray-400 text-sm">Create your first account to get started</div>
      </div>
    );
  }

  const getRiskBadge = (healthScore: number) => {
    if (healthScore >= 80) {
      return {
        label: 'Low',
        bgColor: 'bg-emerald-50',
        textColor: 'text-[#027A48]'
      };
    } else if (healthScore >= 50) {
      return {
        label: 'Medium',
        bgColor: 'bg-[#FEF0C7]',
        textColor: 'text-[#DC6803]'
      };
    } else {
      return {
        label: 'High',
        bgColor: 'bg-[#FEE4E2]',
        textColor: 'text-[#D92D20]'
      };
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-[#DC6803]';
    return 'text-[#D92D20]';
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get auth token to verify user is authenticated
      const token = localStorage.getItem(STORAGE_CONSTANTS.AUTH_TOKEN);
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Call backend export API using apiClient (which handles auth automatically)
      const response = await apiClient.get('/accounts/export', {
        responseType: 'blob', // Important for file downloads
      });

      // Get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `accounts_export_${new Date().toISOString().split('T')[0]}.csv`;

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      
      // For blob responses, we need to read the error data differently
      let errorMessage = 'Export failed. Please try again.';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          console.error('FULL ERROR DATA:', JSON.stringify(errorData, null, 2));
          
          // Handle FastAPI validation errors (detail is an array)
          if (Array.isArray(errorData.detail)) {
            const errors = errorData.detail.map((err: any) => 
              `${err.loc?.join(' -> ') || 'unknown'}: ${err.msg}`
            ).join('; ');
            errorMessage = `Validation Error: ${errors}`;
          } else {
            errorMessage = errorData.detail || errorMessage;
          }
        } catch (parseError) {
          console.error('Could not parse error blob:', parseError);
        }
      } else {
        errorMessage = error.response?.data?.detail || error.message || errorMessage;
      }
      
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter accounts based on search and approval status
  const filteredAccounts = accounts.filter(account => {
    const accountStatus = (account as any).approval_status || 'pending';
    
    // Filter by approval status
    if (showOnlyApproved && accountStatus !== 'approved') {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = account.client_name?.toLowerCase().includes(query);
      const matchesCity = account.client_address?.city?.toLowerCase().includes(query);
      const matchesContact = account.primary_contact_name?.toLowerCase().includes(query);
      const matchesSector = account.market_sector?.toLowerCase().includes(query);
      
      return matchesName || matchesCity || matchesContact || matchesSector;
    }
    
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      
      <div className="px-6 py-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        
        <div className="w-full lg:w-96 pl-4 pr-2.5 py-2.5 bg-white rounded-lg border border-gray-300 flex items-center gap-3 shadow-sm hover:border-slate-400 transition-all">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M9.375 1.5426C13.7009 1.5428 17.209 5.04929 17.209 9.37463C17.2088 11.2677 16.5356 13.0032 15.417 14.3571L18.2373 17.1774C18.5301 17.4703 18.5302 17.946 18.2373 18.2389C17.9445 18.5312 17.4695 18.5313 17.1768 18.2389L14.3564 15.4176C13.0025 16.5342 11.2671 17.2056 9.375 17.2057C5.04936 17.2055 1.54244 13.6996 1.54199 9.37463C1.54199 5.04928 5.04909 1.54278 9.375 1.5426ZM9.375 3.0426C5.87718 3.04278 3.04199 5.87804 3.04199 9.37463C3.04244 12.8708 5.87745 15.7055 9.375 15.7057C12.8725 15.7055 15.7085 12.8708 15.709 9.37463C15.709 5.87806 12.8728 3.0428 9.375 3.0426Z" fill="#667085"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts..."
            className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm font-normal font-outfit leading-tight placeholder:text-gray-400"
          />
        </div>

        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowOnlyApproved(!showOnlyApproved)}
            className={`px-4 py-2.5 rounded-lg shadow-sm border flex items-center gap-2 transition-all ${
              showOnlyApproved 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.91699 10.7754C9.49286 10.7754 10.812 11.8731 11.1523 13.3457H17.708C18.1219 13.346 18.4578 13.6818 18.458 14.0957C18.458 14.5098 18.122 14.8454 17.708 14.8457H11.1523C10.8122 16.3185 9.49308 17.417 7.91699 17.417C6.3411 17.4168 5.0226 16.3183 4.68262 14.8457H2.29102C1.87695 14.8455 1.54102 14.5098 1.54102 14.0957C1.54121 13.6818 1.87707 13.3459 2.29102 13.3457H4.68262C5.02284 11.8733 6.34133 10.7756 7.91699 10.7754ZM7.91699 12.2754C6.91159 12.2756 6.09668 13.0912 6.09668 14.0967C6.09714 15.1018 6.91187 15.9167 7.91699 15.917C8.92232 15.917 9.73782 15.1019 9.73828 14.0967C9.73828 13.0911 8.92261 12.2754 7.91699 12.2754ZM12.083 2.58301C13.6588 2.58322 14.9772 3.68177 15.3174 5.1543H17.707C18.1211 5.15447 18.457 5.49019 18.457 5.9043C18.4568 6.31823 18.121 6.65412 17.707 6.6543H15.3174C14.9773 8.1268 13.6588 9.2244 12.083 9.22461C10.507 9.22461 9.18787 8.12694 8.84766 6.6543H2.29004C1.87595 6.6543 1.54024 6.31834 1.54004 5.9043C1.54004 5.49008 1.87583 5.1543 2.29004 5.1543H8.84766C9.18793 3.68162 10.5071 2.58301 12.083 2.58301ZM12.083 4.08301C11.0775 4.08301 10.2619 4.89883 10.2617 5.9043C10.262 6.90971 11.0775 7.72461 12.083 7.72461C13.0883 7.72436 13.9031 6.90955 13.9033 5.9043C13.9031 4.89898 13.0883 4.08325 12.083 4.08301Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium font-outfit leading-tight whitespace-nowrap">
              {showOnlyApproved ? 'Approved Only' : 'All Accounts'}
            </span>
          </button>

          <button 
            onClick={handleExport}
            disabled={isExporting || filteredAccounts.length === 0}
            className="px-4 py-2.5 rounded-lg shadow-sm border flex items-center gap-2 transition-all bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium font-outfit leading-tight whitespace-nowrap">
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </span>
          </button>
        </div>
      </div>

      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Account Name
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                City
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hosting Area
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tier Type
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Health Score
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Risk
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Value
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center">
                  <div className="text-gray-500 text-lg mb-2">No accounts found</div>
                  <div className="text-gray-400 text-sm">
                    {searchQuery ? 'Try adjusting your search query' : 'No approved accounts available'}
                  </div>
                  {showOnlyApproved && (
                    <button
                      onClick={() => setShowOnlyApproved(false)}
                      className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Show all accounts
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredAccounts.map((account, index) => {
              const riskBadge = getRiskBadge(account.ai_health_score || 0);
              const healthScoreColor = getHealthScoreColor(account.ai_health_score || 0);
              const accountStatus = (account as any).approval_status || 'pending';
              
              const getStatusBadge = (status: string) => {
                switch (status) {
                  case 'approved':
                    return { label: '✅ Approved', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-200' };
                  case 'declined':
                    return { label: '❌ Declined', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200' };
                  default:
                    return { label: '⏳ Pending', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-200' };
                }
              };

              const statusBadge = getStatusBadge(accountStatus);
              const isApproved = accountStatus === 'approved';
              
              return (
                <tr 
                  key={account.account_id} 
                  className={`transition-all duration-200 ${
                    isApproved 
                      ? 'hover:bg-blue-50 hover:shadow-sm cursor-pointer' 
                      : 'hover:bg-gray-50'
                  } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  onClick={() => {
                    if (isApproved) {
                      onAccountClick?.(account.custom_id || account.account_id);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-semibold text-gray-900 font-outfit">
                        {account.client_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-outfit">
                      {account.client_address?.city || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-outfit">
                      {account.client_address?.line1 ? 'West Coast Office' : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-outfit">
                      {account.market_sector || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-outfit">
                      {account.primary_contact_name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 font-outfit">
                      {account.client_type ? account.client_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`${healthScoreColor} text-sm font-semibold font-outfit`}>
                        {account.ai_health_score || 0}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            (account.ai_health_score || 0) >= 80 ? 'bg-emerald-600' : 
                            (account.ai_health_score || 0) >= 50 ? 'bg-[#DC6803]' : 'bg-[#D92D20]'
                          }`}
                          style={{ width: `${account.ai_health_score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${riskBadge.bgColor} ${riskBadge.textColor} font-outfit`}>
                      {riskBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${healthScoreColor} text-sm font-semibold font-outfit`}>
                      ${account.total_value ? (account.total_value / 1000000).toFixed(1) : '0.0'}M
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold ${statusBadge.bgColor} ${statusBadge.textColor} border ${statusBadge.borderColor} font-outfit`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {accountStatus === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAccount({ id: account.account_id, name: account.client_name });
                            setApprovalModalOpen(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                          <span className="text-white text-xs font-bold font-outfit">Approve</span>
                        </button>
                        <button 
                          className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAccount({ id: account.account_id, name: account.client_name });
                            setDeclineModalOpen(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 text-white" />
                          <span className="text-white text-xs font-bold font-outfit">Decline</span>
                        </button>
                      </div>
                    ) : accountStatus === 'approved' ? (
                      <div className="flex items-center justify-center">
                        <span className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-800 text-xs font-bold font-outfit rounded-lg border border-green-300 shadow-sm">
                          ✓ Active
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-800 text-xs font-bold font-outfit rounded-lg border border-red-300 shadow-sm">
                          ✗ Inactive
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
          </div>
        </div>
      </div>

      
      {filteredAccounts.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 rounded-b-2xl">
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredAccounts.length}</span> of{' '}
              <span className="font-medium">{filteredAccounts.length}</span> accounts
              {showOnlyApproved && <span className="text-indigo-600"> (Approved only)</span>}
            </span>
          </div>

          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.has_prev}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                // Show first 5 pages or pages around current page
                let pageNum;
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-indigo-950 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.has_next}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      
      {selectedAccount && (
        <ApprovalModal
          isOpen={approvalModalOpen}
          onClose={() => {
            setApprovalModalOpen(false);
            setSelectedAccount(null);
          }}
          onApprove={(notes) => {
            onApprove?.(selectedAccount.id, notes);
            setApprovalModalOpen(false);
            setSelectedAccount(null);
          }}
          accountName={selectedAccount.name}
        />
      )}

      
      {selectedAccount && (
        <DeclineModal
          isOpen={declineModalOpen}
          onClose={() => {
            setDeclineModalOpen(false);
            setSelectedAccount(null);
          }}
          onDecline={(notes) => {
            onDecline?.(selectedAccount.id, notes);
            setDeclineModalOpen(false);
            setSelectedAccount(null);
          }}
          accountName={selectedAccount.name}
        />
      )}
    </div>
  );
}
