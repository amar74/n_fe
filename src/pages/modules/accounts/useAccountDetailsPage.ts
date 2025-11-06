import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAccountDetail, useAccounts } from '@/hooks/useAccounts';
import { TabType, AccountFormData, AccountStatsCard, RecentActivityItem } from './AccountDetailsPage.types';
import { MOCK_RECENT_ACTIVITY } from './AccountDetailsPage.constants';
import { STATE_ABBREVIATION_TO_NAME } from './components/CreateAccountModal/CreateAccountModal.constants';
import { apiClient } from '@/services/api/client';

// Utility function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);
  const diffMonths = Math.floor(diffMs / 2628000000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export function useAccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  // FIXME: this not working properly - guddy.tech
  const [formData, setFormData] = useState<AccountFormData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(MOCK_RECENT_ACTIVITY);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const { accountDetail: account, isAccountDetailLoading: isLoading, accountDetailError: error } = useAccountDetail(id || '');
  const { updateAccount, isUpdating, updateErrors, isUpdateAccountSuccess } = useAccounts();
  useEffect(() => {
    if (account && account.custom_id && id === account.account_id) {
      const newUrl = `/module/accounts/${account.custom_id}`;
      navigate(newUrl, { replace: true });
    }
  }, [account, id, navigate]);


  // Fetch account activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!account?.account_id) {
        console.log('⏸️ No account ID, skipping activity fetch');
        return;
      }
      
      try {
        setIsLoadingActivities(true);
        console.log('📊 Fetching activities for account:', account.account_id);
        
        const response = await apiClient.get(`/accounts/${account.account_id}/activities`, {
          params: { limit: 10 }
        });
        
        console.log('✅ Activities response:', response.data);
        
        if (response.data.activities && response.data.activities.length > 0) {
          // Transform backend activities to frontend format with time ago
          const transformedActivities = response.data.activities.map((activity: any) => ({
            id: activity.id,
            title: activity.title,
            timestamp: formatTimeAgo(new Date(activity.timestamp)),
            color: activity.color
          }));
          console.log('📋 Transformed activities:', transformedActivities);
          setRecentActivity(transformedActivities);
        } else {
          console.log('📭 No activities found for this account');
          setRecentActivity([]);
        }
      } catch (error: any) {
        console.error('❌ Error fetching account activities:', error);
        console.error('Error response:', error.response?.data);
        setRecentActivity([]);
      } finally {
        setIsLoadingActivities(false);
      }
    };
    
    fetchActivities();
  }, [account?.account_id]);

  useEffect(() => {
    if (account) {
      // Convert state abbreviation to full name for dropdown
      const stateValue = account.client_address?.state;
      const fullStateName = stateValue && stateValue.length === 2 
        ? STATE_ABBREVIATION_TO_NAME[stateValue] || stateValue 
        : stateValue;

      setFormData({
        client_name: account.client_name || '',
        client_type: account.client_type || '',
        market_sector: account.market_sector || '',
        client_address_line1: account.client_address?.line1 || '',
        client_address_line2: account.client_address?.line2,
        client_address_city: account.client_address?.city,
        client_address_state: fullStateName,
        client_address_zip_code: account.client_address?.pincode ? String(account.client_address.pincode) : '',
        company_website: account.company_website || '',
        hosting_area: account.hosting_area || '',
        msa_in_place: account.msa_in_place || false,
        account_approver: account.account_approver || '',
        approval_date_time: account.approval_date || '',
      });
    }
  }, [account, account?.client_name, account?.client_address?.city, account?.client_address?.state]);

  useEffect(() => {
    if (isUpdateAccountSuccess) {
      setIsEditing(false);
    }
  }, [isUpdateAccountSuccess]);

  const statsCards: AccountStatsCard[] = useMemo(() => {
    if (!account) return [];
    
    return [
      {
        id: 'total-value',
        title: 'Total Value',
        value: account.total_value ? `$${(account.total_value / 1000000).toFixed(1)}M` : '$0M',
        icon: 'DollarSign',
      },
      {
        id: 'opportunities',
        title: 'Opportunities',
        value: account.opportunities || 0,
        icon: 'Target',
      },
      {
        id: 'last-contact',
        title: 'Last Contact',
        value: account.last_contact 
          ? new Date(account.last_contact).toLocaleDateString()
          : 'Never',
        icon: 'Calendar',
      },
      {
        id: 'client-type',
        title: 'Client Type',
        value: account.client_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A',
        icon: 'Award',
      },
    ];
  }, [account]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleEditToggle = () => {
    if (isEditing && formData) {
      if (account) {
        // Convert state abbreviation to full name for dropdown
        const stateValue = account.client_address?.state;
        const fullStateName = stateValue && stateValue.length === 2 
          ? STATE_ABBREVIATION_TO_NAME[stateValue] || stateValue 
          : stateValue;

        setFormData({
          client_name: account.client_name || '',
          client_type: account.client_type || '',
          market_sector: account.market_sector || '',
          client_address_line1: account.client_address?.line1 || '',
          client_address_line2: account.client_address?.line2,
          client_address_city: account.client_address?.city,
          client_address_state: fullStateName,
          client_address_zip_code: account.client_address?.pincode ? String(account.client_address.pincode) : '',
          company_website: account.company_website || '',
          hosting_area: account.hosting_area || '',
          msa_in_place: account.msa_in_place || false,
          account_approver: account.account_approver || '',
          approval_date_time: account.approval_date || '',
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleFormChange = (field: keyof AccountFormData, value: any) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSaveChanges = async () => {
    if (!account?.account_id || !formData) return;

    // Convert full state name back to abbreviation for database
    const stateAbbreviation = formData.client_address_state 
      ? Object.entries(STATE_ABBREVIATION_TO_NAME).find(([abbr, name]) => name === formData.client_address_state)?.[0] || formData.client_address_state
      : undefined;

    const updateData = {
      client_name: formData.client_name,
      client_type: formData.client_type as any,
      market_sector: formData.market_sector,
      msa_in_place: formData.msa_in_place,
      client_address: {
        line1: formData.client_address_line1,
        line2: formData.client_address_line2 || undefined,
        city: formData.client_address_city || undefined,
        state: stateAbbreviation,
        pincode: formData.client_address_zip_code ? parseInt(formData.client_address_zip_code) : undefined,
      },
      company_website: formData.company_website || undefined,
      hosting_area: formData.hosting_area && formData.hosting_area !== "" ? formData.hosting_area : undefined,
      account_approver: formData.account_approver && formData.account_approver !== "" ? formData.account_approver : undefined,
      approval_date: formData.approval_date_time && formData.approval_date_time !== "" ? formData.approval_date_time : undefined,
      notes: undefined,
    };
    await updateAccount({
      accountId: account.account_id,
      data: updateData,
    });
  };

  const handleBackToAccounts = () => {
    navigate('/module/accounts');
  };

    return {
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
  };
}