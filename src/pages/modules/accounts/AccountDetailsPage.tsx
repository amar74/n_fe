import React from 'react';
import { TabNavigation } from './components/TabNavigation';
import { AccountStatsCards } from './components/AccountStatsCards';
import { AccountInformationForm } from './components/AccountInformationForm';
import { RecentActivity } from './components/RecentActivity';
import { AIHealthScoreWidget } from './components/AIHealthScoreWidget';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { AITieringWidget } from './components/AITieringWidget';
import { DataEnrichmentPanel } from './components/DataEnrichmentPanel';
import { AuditTrailPanel } from './components/AuditTrailPanel';
import ChatbotSelector from '@/components/ChatbotSelector';
import { NotesTab } from './notes';
import { ContactsTab } from './contacts';
import { OpportunitiesTab } from './opportunities';
import { TeamTab } from './team';
import { FinanceTab } from './finance';
import { useAccountDetailsPage } from './useAccountDetailsPage';

function AccountDetailsPage() {
  const {
    account,
    isLoading,
    error,
    activeTab,
    isEditing,
    formData,
    statsCards,
    recentActivity,
    isLoadingActivities,
    handleTabChange,
    handleEditToggle,
    handleFormChange,
    handleSaveChanges,
    handleBackToAccounts,
    isUpdating,
    updateErrors,
  } = useAccountDetailsPage();

  // Loading state
  if (isLoading || (!account && !error)) {
    return (
      <div className="w-full h-full bg-[#f5f3f2] font-outfit flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed8a09]"></div>
          <p className="text-[#6e6e6e] text-sm">Loading account details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div className="w-full h-full bg-[#f5f3f2] font-outfit flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h3 className="text-lg font-medium text-[#0f0901]">Account Not Found</h3>
          <p className="text-[#6e6e6e] mb-4">
            The account you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={handleBackToAccounts}
            className="bg-[#0f0901] text-white px-6 py-2 rounded-[16px] font-medium"
          >
            Return to Accounts
          </button>
        </div>
      </div>
    );
  }

  if (!account || !formData) {
    return (
      <div className="w-full h-full bg-[#f5f3f2] font-outfit flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed8a09]"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] overflow-x-hidden">
      {/* Universal Chatbot for Account Module */}
      <ChatbotSelector />
      
      <main className="py-6 px-6 lg:px-8">
        <div className="w-full">
          
          <div className="inline-flex justify-start items-center gap-1 mb-4">
            <div className="justify-start text-neutral-400 text-xs font-medium font-['Inter']">Dashboard</div>
            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.7418 13.2331L10.9751 9.99974L7.7418 6.76641C7.4168 6.44141 7.4168 5.91641 7.7418 5.59141C8.0668 5.26641 8.5918 5.26641 8.9168 5.59141L12.7418 9.41641C13.0668 9.74141 13.0668 10.2664 12.7418 10.5914L8.9168 14.4164C8.5918 14.7414 8.0668 14.7414 7.7418 14.4164C7.42513 14.0914 7.4168 13.5581 7.7418 13.2331Z" fill="#A7A7A7"/>
              </svg>
            </div>
            <div className="justify-start text-slate-800 text-xs font-medium font-['Inter']">Accounts</div>
          </div>

          
          <h1 className="text-slate-800 text-[32px] sm:text-4xl font-semibold font-['Outfit'] mb-8 pb-4 truncate">
            {account.client_name}
          </h1>

          
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          
          <div className={`w-full mt-6 ${activeTab === 'overview' ? 'flex gap-7 items-start justify-start' : ''}`}>
            
            <div className={activeTab === 'overview' ? 'flex-1 min-w-0' : 'w-full'}>
              {activeTab === 'overview' && (
                <>
                  <AccountInformationForm
                    formData={formData}
                    accountId={account.custom_id || account.account_id}
                    isEditing={isEditing}
                    isUpdating={isUpdating}
                    onFormChange={handleFormChange}
                    onSave={handleSaveChanges}
                    onCancel={handleEditToggle}
                    errors={updateErrors}
                    account={account}
                  />
                  
                  <div className="mt-7">
                    <AIInsightsPanel 
                      accountId={account.account_id} 
                      accountName={account.client_name}
                    />
                  </div>
                  
                  <div className="mt-7">
                    <AuditTrailPanel accountId={account.account_id} />
                  </div>
                </>
              )}
              
              {activeTab === 'notes' && (
                <NotesTab accountId={account.account_id} />
              )}
              
              {activeTab === 'contacts' && (
                <ContactsTab accountId={account.account_id} />
              )}
              
              {activeTab === 'team' && (
                <TeamTab accountId={account.account_id} />
              )}
              
              {activeTab === 'opportunities' && (
                <OpportunitiesTab accountId={account.account_id} />
              )}
              
              {activeTab === 'financial' && (
                <FinanceTab accountId={account.account_id} accountName={account.client_name} />
              )}
              
              
              {!['overview', 'notes', 'contacts', 'team', 'opportunities', 'financial'].includes(activeTab) && (
                <div className="bg-neutral-50 border border-[#f0f0f0] rounded-[28px] p-6 w-full">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <h3 className="font-outfit font-semibold text-[#0f0901] text-[18px] mb-2">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tab
                    </h3>
                    <p className="font-outfit font-medium text-[#a7a7a7] text-[16px]">
                      This tab is coming soon. Stay tuned for updates!
                    </p>
                  </div>
                </div>
              )}
            </div>

            
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-7 flex-shrink-0 w-full max-w-[501px]">
                
                <AIHealthScoreWidget 
                  accountId={account.account_id}
                  initialScore={account.ai_health_score || undefined}
                  initialRiskLevel={account.risk_level || undefined}
                />
                
                <AccountStatsCards stats={statsCards} />
                
                <AITieringWidget 
                  accountId={account.account_id}
                  currentTier={account.client_type}
                />
                
                <RecentActivity activities={recentActivity} isLoading={isLoadingActivities} />
                
                <DataEnrichmentPanel 
                  accountId={account.account_id}
                  accountName={account.client_name}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AccountDetailsPage;
