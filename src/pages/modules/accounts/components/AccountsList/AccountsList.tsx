import { AccountListItem } from '@/types/accounts';
import { useState } from 'react';

interface AccountsListProps {
  accounts: AccountListItem[];
  isLoading?: boolean;
  onAccountClick?: (accountId: string) => void;
}

export function AccountsList({ accounts, isLoading, onAccountClick }: AccountsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed8a09]"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-500 text-lg mb-2">No accounts found</div>
        <div className="text-gray-400 text-sm">Try adjusting your search or filters</div>
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Table title & button */}
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Search */}
        <div className="w-96 pl-4 pr-2.5 py-2 bg-[#F9FAFB] rounded-lg border border-gray-200 flex justify-between items-center overflow-hidden">
          <div className="flex justify-start items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.375 1.5426C13.7009 1.5428 17.209 5.04929 17.209 9.37463C17.2088 11.2677 16.5356 13.0032 15.417 14.3571L18.2373 17.1774C18.5301 17.4703 18.5302 17.946 18.2373 18.2389C17.9445 18.5312 17.4695 18.5313 17.1768 18.2389L14.3564 15.4176C13.0025 16.5342 11.2671 17.2056 9.375 17.2057C5.04936 17.2055 1.54244 13.6996 1.54199 9.37463C1.54199 5.04928 5.04909 1.54278 9.375 1.5426ZM9.375 3.0426C5.87718 3.04278 3.04199 5.87804 3.04199 9.37463C3.04244 12.8708 5.87745 15.7055 9.375 15.7057C12.8725 15.7055 15.7085 12.8708 15.709 9.37463C15.709 5.87806 12.8728 3.0428 9.375 3.0426Z" fill="#667085"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or type command..."
              className="bg-transparent border-none outline-none text-[#667085] text-sm font-normal font-outfit leading-tight placeholder:text-[#667085]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start items-center gap-3">
          <button className="px-4 py-3 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.91699 10.7754C9.49286 10.7754 10.812 11.8731 11.1523 13.3457H17.708C18.1219 13.346 18.4578 13.6818 18.458 14.0957C18.458 14.5098 18.122 14.8454 17.708 14.8457H11.1523C10.8122 16.3185 9.49308 17.417 7.91699 17.417C6.3411 17.4168 5.0226 16.3183 4.68262 14.8457H2.29102C1.87695 14.8455 1.54102 14.5098 1.54102 14.0957C1.54121 13.6818 1.87707 13.3459 2.29102 13.3457H4.68262C5.02284 11.8733 6.34133 10.7756 7.91699 10.7754ZM7.91699 12.2754C6.91159 12.2756 6.09668 13.0912 6.09668 14.0967C6.09714 15.1018 6.91187 15.9167 7.91699 15.917C8.92232 15.917 9.73782 15.1019 9.73828 14.0967C9.73828 13.0911 8.92261 12.2754 7.91699 12.2754ZM12.083 2.58301C13.6588 2.58322 14.9772 3.68177 15.3174 5.1543H17.707C18.1211 5.15447 18.457 5.49019 18.457 5.9043C18.4568 6.31823 18.121 6.65412 17.707 6.6543H15.3174C14.9773 8.1268 13.6588 9.2244 12.083 9.22461C10.507 9.22461 9.18787 8.12694 8.84766 6.6543H2.29004C1.87595 6.6543 1.54024 6.31834 1.54004 5.9043C1.54004 5.49008 1.87583 5.1543 2.29004 5.1543H8.84766C9.18793 3.68162 10.5071 2.58301 12.083 2.58301ZM12.083 4.08301C11.0775 4.08301 10.2619 4.89883 10.2617 5.9043C10.262 6.90971 11.0775 7.72461 12.083 7.72461C13.0883 7.72436 13.9031 6.90955 13.9033 5.9043C13.9031 4.89898 13.0883 4.08325 12.083 4.08301Z" fill="#344054"/>
            </svg>
            <span className="text-[#344054] text-sm font-medium font-outfit leading-tight">All Accounts</span>
          </button>

          <button className="px-4 py-3 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors">
            <span className="text-[#344054] text-sm font-medium font-outfit leading-tight">Actions</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6925 7.94217L10.4425 14.1922C10.3845 14.2503 10.3156 14.2964 10.2397 14.3278C10.1638 14.3593 10.0825 14.3755 10.0003 14.3755C9.91821 14.3755 9.83688 14.3593 9.76101 14.3278C9.68514 14.2964 9.61621 14.2503 9.55816 14.1922L3.30816 7.94217C3.19088 7.82489 3.125 7.66583 3.125 7.49998C3.125 7.33413 3.19088 7.17507 3.30816 7.05779C3.42544 6.94052 3.5845 6.87463 3.75035 6.87463C3.9162 6.87463 4.07526 6.94052 4.19253 7.05779L10.0003 12.8664L15.8082 7.05779C15.8662 6.99972 15.9352 6.95366 16.011 6.92224C16.0869 6.89081 16.1682 6.87463 16.2503 6.87463C16.3325 6.87463 16.4138 6.89081 16.4897 6.92224C16.5655 6.95366 16.6345 6.99972 16.6925 7.05779C16.7506 7.11586 16.7967 7.1848 16.8281 7.26067C16.8595 7.33654 16.8757 7.41786 16.8757 7.49998C16.8757 7.5821 16.8595 7.66342 16.8281 7.73929C16.7967 7.81516 16.7506 7.8841 16.6925 7.94217Z" fill="#0F0901"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-3 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-b border-[#EAECF0]">
              <th className="h-11 pr-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">Account Name</span>
              </th>
              <th className="h-11 px-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">City</span>
              </th>
              <th className="h-11 px-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">Hosting Area</span>
              </th>
              <th className="h-11 px-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">Type</span>
              </th>
              <th className="h-11 px-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">Contact</span>
              </th>
              <th className="h-11 px-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">Tier Type</span>
              </th>
              <th className="h-11 px-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">Health Score</span>
              </th>
              <th className="h-11 px-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">Risk</span>
              </th>
              <th className="h-11 px-6 py-3 text-left">
                <span className="text-[#667085] text-xs font-medium font-outfit leading-none">Total Value</span>
              </th>
              <th className="h-11 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const riskBadge = getRiskBadge(account.ai_health_score || 0);
              const healthScoreColor = getHealthScoreColor(account.ai_health_score || 0);
              
              return (
                <tr 
                  key={account.account_id} 
                  className="border-b border-[#EAECF0] hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onAccountClick?.(account.account_id)}
                >
                  <td className="h-16 pr-6 py-2">
                    <div className="w-36 text-[#1A1A1A] text-sm font-medium font-outfit leading-tight">
                      {account.client_name}
                    </div>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <span className="text-black text-sm font-normal font-outfit leading-tight">
                      {account.client_address?.city || 'N/A'}
                    </span>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <span className="text-black text-sm font-normal font-outfit leading-tight">
                      {account.client_address?.line1 ? 'West Coast Office' : 'N/A'}
                    </span>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <span className="text-black text-sm font-normal font-outfit leading-tight">
                      {account.market_sector || 'N/A'}
                    </span>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <span className="text-black text-sm font-normal font-outfit leading-tight">
                      {account.primary_contact_name || 'N/A'}
                    </span>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <span className="text-black text-sm font-normal font-outfit leading-tight">
                      {account.client_type ? account.client_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                    </span>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <span className={`${healthScoreColor} text-sm font-normal font-outfit leading-tight`}>
                      {account.ai_health_score || 0}%
                    </span>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <div className={`px-2 py-0.5 ${riskBadge.bgColor} rounded-full inline-flex justify-center items-center`}>
                      <span className={`${riskBadge.textColor} text-xs font-medium font-outfit leading-none`}>
                        {riskBadge.label}
                      </span>
                    </div>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <span className={`${healthScoreColor} text-sm font-normal font-outfit leading-tight`}>
                      ${account.total_value ? (account.total_value / 1000000).toFixed(1) : '0.0'}M
                    </span>
                  </td>
                  <td className="h-16 px-6 py-2">
                    <button 
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu click
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.1826 16.2588C13.0653 16.3482 13.7539 17.0937 13.7539 18C13.7539 18.9063 13.0653 19.6518 12.1826 19.7412L12.0039 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0039L12.1826 16.2588ZM12.1826 10.2588C13.0653 10.3482 13.7539 11.0937 13.7539 12C13.7539 12.9063 13.0653 13.6518 12.1826 13.7412L12.0039 13.75H11.9941C11.0276 13.75 10.2441 12.9665 10.2441 12C10.2441 11.0335 11.0276 10.25 11.9941 10.25H12.0039L12.1826 10.2588ZM12.1826 4.25879C13.0653 4.34819 13.7539 5.09375 13.7539 6C13.7539 6.90625 13.0653 7.65181 12.1826 7.74121L12.0039 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0039L12.1826 4.25879Z" fill="#98A2B3"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
