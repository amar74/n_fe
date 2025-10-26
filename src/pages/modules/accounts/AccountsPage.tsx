import { memo, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AccountsList } from './components/AccountsList';
import { CreateAccountModal } from './components/CreateAccountModal';
import { AccountsMap } from './components/AccountsMap';
import { useAccountsPage } from './useAccountsPage';
import { SuccessModal } from '@/components/SuccessModal';
import { useToast } from '@/hooks/useToast';
import { AccountListItem } from '@/types/accounts';
import { apiClient } from '@/services/api/client';

// Type for pagination
interface PaginationData {
  total: number;
  page: number;
  size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

function AccountsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    accounts: originalAccounts,
    stats,
    isLoading,
    isCreateModalOpen,
    isSuccessModalOpen,
    successMessage,
    handleCreateAccount,
    handleCreateAccountSubmit,
    handleAccountClick,
    setIsCreateModalOpen,
    setIsSuccessModalOpen,
    isCreating,
    createErrors,
    pagination,
    setCurrentPage,
    refetchAccounts,
  } = useAccountsPage();

  // Use accounts directly from backend with approval status
  const accounts = useMemo(() => {
    return originalAccounts.map(account => ({
      ...account,
      approval_status: (account as any).approval_status || 'pending',
    }));
  }, [originalAccounts]);

  const handleApproveAccount = async (accountId: string, notes: string) => {
    try {
      // Call backend API to approve account (apiClient already has /api in baseURL)
      await apiClient.post(`/accounts/${accountId}/approve`, { notes });
      
      // Refetch accounts to get updated data from backend (auto-refresh)
      await refetchAccounts();
      
      toast.success('✅ Account approved successfully! The account is now active.');
    } catch (error) {
      console.error('Failed to approve account:', error);
      toast.error('Approve failed. Please try again.');
    }
  };

  const handleDeclineAccount = async (accountId: string, notes: string) => {
    try {
      // Call backend API to decline account (apiClient already has /api in baseURL)
      await apiClient.post(`/accounts/${accountId}/decline`, { notes });
      
      // Refetch accounts to get updated data from backend (auto-refresh)
      await refetchAccounts();
      
      toast.error('❌ Account declined.');
    } catch (err) {
      console.error('Failed to decline account:', err);
      toast.error('Decline failed. Please try again.');
    }
  };

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        
        <div className="flex justify-between items-end">
          
          <div className="flex flex-col gap-3">
            
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Organization details</span>
            </div>
            
            
            <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">My Accounts</h1>
          </div>

          
          <div className="flex items-start gap-3">
            
            <button 
              className="h-11 px-4 py-2 bg-transparent rounded-lg border border-black flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/client-surveys')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.0306 7.71938L14.7806 2.46938C14.7109 2.39975 14.6282 2.34454 14.5371 2.3069C14.4461 2.26926 14.3485 2.24992 14.25 2.25H5.25C4.85218 2.25 4.47064 2.40804 4.18934 2.68934C3.90804 2.97064 3.75 3.35218 3.75 3.75V20.25C3.75 20.6478 3.90804 21.0294 4.18934 21.3107C4.47064 21.592 4.85218 21.75 5.25 21.75H18.75C19.1478 21.75 19.5294 21.592 19.8107 21.3107C20.092 21.0294 20.25 20.6478 20.25 20.25V8.25C20.2501 8.15148 20.2307 8.05391 20.1931 7.96286C20.1555 7.87182 20.1003 7.78908 20.0306 7.71938ZM15 4.81031L17.6897 7.5H15V4.81031ZM18.75 20.25H5.25V3.75H13.5V8.25C13.5 8.44891 13.579 8.63968 13.7197 8.78033C13.8603 8.92098 14.0511 9 14.25 9H18.75V20.25ZM15.75 12.75C15.75 12.9489 15.671 13.1397 15.5303 13.2803C15.3897 13.421 15.1989 13.5 15 13.5H9C8.80109 13.5 8.61032 13.421 8.46967 13.2803C8.32902 13.1397 8.25 12.9489 8.25 12.75C8.25 12.5511 8.32902 12.3603 8.46967 12.2197C8.61032 12.079 8.80109 12 9 12H15C15.1989 12 15.3897 12.079 15.5303 12.2197C15.671 12.3603 15.75 12.5511 15.75 12.75ZM15.75 15.75C15.75 15.9489 15.671 16.1397 15.5303 16.2803C15.3897 16.421 15.1989 16.5 15 16.5H9C8.80109 16.5 8.61032 16.421 8.46967 16.2803C8.32902 16.1397 8.25 15.9489 8.25 15.75C8.25 15.5511 8.32902 15.3603 8.46967 15.2197C8.61032 15.079 8.80109 15 9 15H15C15.1989 15 15.3897 15.079 15.5303 15.2197C15.671 15.3603 15.75 15.5511 15.75 15.75Z" fill="black"/>
              </svg>
              <span className="text-black text-xs font-medium font-outfit leading-normal">Client Survey</span>
            </button>

            
            <button 
              onClick={handleCreateAccount}
              className="h-11 px-5 py-2 bg-indigo-950 rounded-lg flex items-center gap-2.5 hover:bg-indigo-900 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.375 12C21.375 12.2984 21.2565 12.5845 21.0455 12.7955C20.8345 13.0065 20.5484 13.125 20.25 13.125H13.125V20.25C13.125 20.5484 13.0065 20.8345 12.7955 21.0455C12.5845 21.2565 12.2984 21.375 12 21.375C11.7016 21.375 11.4155 21.2565 11.2045 21.0455C10.9935 20.8345 10.875 20.5484 10.875 20.25V13.125H3.75C3.45163 13.125 3.16548 13.0065 2.9545 12.7955C2.74353 12.5845 2.625 12.2984 2.625 12C2.625 11.7016 2.74353 11.4155 2.9545 11.2045C3.16548 10.9935 3.45163 10.875 3.75 10.875H10.875V3.75C10.875 3.45163 10.9935 3.16548 11.2045 2.9545C11.4155 2.74353 11.7016 2.625 12 2.625C12.2984 2.625 12.5845 2.74353 12.7955 2.9545C13.0065 3.16548 13.125 3.45163 13.125 3.75V10.875H20.25C20.5484 10.875 20.8345 10.9935 21.0455 11.2045C21.2565 11.4155 21.375 11.7016 21.375 12Z" fill="white"/>
              </svg>
              <span className="text-white text-xs font-medium font-outfit leading-normal">Create Account</span>
            </button>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6 overflow-hidden">
              
              <div className="flex justify-start items-start gap-6">
                <div className="flex-1 flex flex-col gap-1">
                  <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
                    AI-Enhanced Geospatial Intelligence
                  </h2>
                </div>
              </div>

              
              <div className="flex flex-col gap-6">
                
                <AccountsMap accounts={accounts} />

                
                <div className="flex justify-start items-center gap-4">
                  <div className="flex items-center gap-2">
                    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6" cy="6.5" r="6" fill="#039855"/>
                    </svg>
                    <span className="text-[#0F0901] text-xs font-normal font-outfit">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6" cy="6.5" r="6" fill="#DC6803"/>
                    </svg>
                    <span className="text-[#0F0901] text-xs font-normal font-outfit">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6" cy="6.5" r="6" fill="#D92D20"/>
                    </svg>
                    <span className="text-[#0F0901] text-xs font-normal font-outfit">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col justify-between gap-3">
            
            <div className="h-20 p-5 bg-[#F9FAFB] rounded-2xl border border-gray-200 flex justify-between items-center">
              <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z" fill="#1D2939"/>
                </svg>
              </div>
              <div className="flex flex-col justify-between items-end">
                <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Total Accounts</div>
                <div className="text-[#1A1A1A] text-2xl font-bold font-outfit leading-loose">{stats.totalAccounts}</div>
              </div>
            </div>

            
            <div className="h-20 p-5 bg-[#F9FAFB] rounded-2xl border border-gray-200 flex justify-between items-center">
              <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C10.0226 20.3135 4.91699 17.563 2.86894 13.001L1 13V11L2.21045 11.0009C2.07425 10.3633 2 9.69651 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 9.68542 4.09035 10.3516 4.26658 11.0004L6.43381 11L8.5 7.55635L11.5 12.5563L12.4338 11H17V13H13.5662L11.5 16.4437L8.5 11.4437L7.56619 13L5.10789 13.0006C5.89727 14.3737 7.09304 15.6681 8.64514 16.9029C9.39001 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5Z" fill="#1D2939"/>
                </svg>
              </div>
              <div className="flex flex-col justify-start items-end gap-3">
                <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">AI Health Score</div>
                <div className="px-2 py-0.5 bg-[#FEF0C7] rounded-full flex justify-center items-center">
                  <span className="text-[#DC6803] text-base font-medium font-roboto leading-normal tracking-tight">{stats.aiHealthScore}%</span>
                  <span className="text-[#DC6803] text-xs font-medium font-outfit leading-none"> Average</span>
                </div>
              </div>
            </div>

            
            <div className="h-20 p-5 bg-[#F9FAFB] rounded-2xl border border-gray-200 flex justify-between items-center">
              <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.8659 3.00017L22.3922 19.5002C22.6684 19.9785 22.5045 20.5901 22.0262 20.8662C21.8742 20.954 21.7017 21.0002 21.5262 21.0002H2.47363C1.92135 21.0002 1.47363 20.5525 1.47363 20.0002C1.47363 19.8246 1.51984 19.6522 1.60761 19.5002L11.1339 3.00017C11.41 2.52187 12.0216 2.358 12.4999 2.63414C12.6519 2.72191 12.7782 2.84815 12.8659 3.00017ZM4.20568 19.0002H19.7941L11.9999 5.50017L4.20568 19.0002ZM10.9999 16.0002H12.9999V18.0002H10.9999V16.0002ZM10.9999 9.00017H12.9999V14.0002H10.9999V9.00017Z" fill="#1D2939"/>
                </svg>
              </div>
              <div className="flex flex-col justify-start items-end gap-3">
                <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">High Risk</div>
                <div className="px-2.5 py-0.5 bg-[#FEE4E2] rounded-full flex justify-center items-center">
                  <span className="text-[#D92D20] text-base font-medium font-outfit leading-tight">{stats.highRiskCount}</span>
                </div>
              </div>
            </div>

            
            <div className="h-20 p-5 bg-[#F9FAFB] rounded-2xl border border-gray-200 flex justify-between items-center">
              <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.0049 22.0027C6.48204 22.0027 2.00488 17.5256 2.00488 12.0027C2.00488 6.4799 6.48204 2.00275 12.0049 2.00275C17.5277 2.00275 22.0049 6.4799 22.0049 12.0027C22.0049 17.5256 17.5277 22.0027 12.0049 22.0027ZM12.0049 20.0027C16.4232 20.0027 20.0049 16.421 20.0049 12.0027C20.0049 7.58447 16.4232 4.00275 12.0049 4.00275C7.5866 4.00275 4.00488 7.58447 4.00488 12.0027C4.00488 16.421 7.5866 20.0027 12.0049 20.0027ZM8.50488 14.0027H14.0049C14.281 14.0027 14.5049 13.7789 14.5049 13.5027C14.5049 13.2266 14.281 13.0027 14.0049 13.0027H10.0049C8.62417 13.0027 7.50488 11.8835 7.50488 10.5027C7.50488 9.12203 8.62417 8.00275 10.0049 8.00275H11.0049V6.00275H13.0049V8.00275H15.5049V10.0027H10.0049C9.72874 10.0027 9.50488 10.2266 9.50488 10.5027C9.50488 10.7789 9.72874 11.0027 10.0049 11.0027H14.0049C15.3856 11.0027 16.5049 12.122 16.5049 13.5027C16.5049 14.8835 15.3856 16.0027 14.0049 16.0027H13.0049V18.0027H11.0049V16.0027H8.50488V14.0027Z" fill="#1D2939"/>
                </svg>
              </div>
              <div className="flex flex-col justify-start items-end gap-3">
                <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Total Value</div>
                <div className="flex items-center gap-1">
                  <span className="text-[#1A1A1A] text-xl font-bold font-outfit leading-loose">{stats.totalValue}</span>
                  <span className="text-[#1A1A1A] text-sm font-medium font-outfit leading-tight tracking-tight">Portfolio</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="mt-6">
          <AccountsList 
            accounts={accounts}
            isLoading={isLoading}
            onAccountClick={handleAccountClick}
            onApprove={handleApproveAccount}
            onDecline={handleDeclineAccount}
            pagination={pagination as PaginationData | undefined}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAccountSubmit}
        isLoading={isCreating}
        errors={createErrors}
      />

      
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successMessage.title}
        message={successMessage.description}
        autoCloseDuration={4000}
      />
    </div>
  );
}

export default memo(AccountsPage);
