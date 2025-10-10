import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAccountDetail, useAccounts } from '@/hooks/useAccounts';
import { TabType, AccountFormData, AccountStatsCard } from './AccountDetailsPage.types';
import { MOCK_RECENT_ACTIVITY } from './AccountDetailsPage.constants';

export function useAccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AccountFormData | null>(null);

  // API calls
  const { accountDetail: account, isAccountDetailLoading: isLoading, accountDetailError: error } = useAccountDetail(id || '');
  const { updateAccount, isUpdating, updateErrors, isUpdateAccountSuccess } = useAccounts();

  // Initialize form data when account loads or updates
  useEffect(() => {
    if (account) {
      console.log('Updating formData with account:', account.client_name, account.client_address);
      setFormData({
        client_name: account.client_name || '',
        client_type: account.client_type || '',
        market_sector: account.market_sector || '',
        client_address_line1: account.client_address?.line1 || '',
        client_address_line2: account.client_address?.line2,
        client_address_city: account.client_address?.city,
        client_address_state: account.client_address?.state,
        client_address_zip_code: account.client_address?.pincode ? String(account.client_address.pincode) : '',
        company_website: account.company_website || '',
        hosting_area: account.hosting_area || '',
        msa_in_place: account.msa_in_place || false,
        account_approver: account.account_approver || '',
        approval_date_time: account.approval_date_time || '',
      });
    }
  }, [account, account?.client_name, account?.client_address?.city, account?.client_address?.state]);

  useEffect(() => {
    if (isUpdateAccountSuccess) {
      setIsEditing(false);
    }
  }, [isUpdateAccountSuccess]);

  // Computed values
  const statsCards: AccountStatsCard[] = useMemo(() => {
    if (!account) return [];
    
    return [
      {
        id: 'total-value',
        title: 'Total Value',
        value: account.total_value ? `$${account.total_value}M` : '$0M',
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

  // Handlers
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleEditToggle = () => {
    if (isEditing && formData) {
      // Reset form data when canceling edit
      if (account) {
        setFormData({
          client_name: account.client_name || '',
          client_type: account.client_type || '',
          market_sector: account.market_sector || '',
          client_address_line1: account.client_address?.line1 || '',
          client_address_line2: account.client_address?.line2,
          client_address_city: account.client_address?.city,
          client_address_state: account.client_address?.state,
          client_address_zip_code: account.client_address?.pincode ? String(account.client_address.pincode) : '',
          company_website: account.company_website || '',
          hosting_area: account.hosting_area || '',
          msa_in_place: account.msa_in_place || false,
          account_approver: account.account_approver || '',
          approval_date_time: account.approval_date_time || '',
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

    await updateAccount({
      accountId: account.account_id,
      data: {
        client_name: formData.client_name,
        client_type: formData.client_type as any,
        market_sector: formData.market_sector,
        client_address: {
          line1: formData.client_address_line1,
          line2: formData.client_address_line2 || undefined,
          city: formData.client_address_city || undefined,
          state: formData.client_address_state,
          pincode: formData.client_address_zip_code ? parseInt(formData.client_address_zip_code) : undefined,
        },
        company_website: formData.company_website || undefined,
        notes: undefined,
      },
    });
  };

  const handleBackToAccounts = () => {
    navigate('/module/accounts');
  };

    return {
    // Data
    account,
    isLoading,
    error,
    activeTab,
    isEditing,
    formData,
    statsCards,
    recentActivity: MOCK_RECENT_ACTIVITY,

    // Actions
    handleTabChange,
    handleEditToggle,
    handleFormChange,
    handleSaveChanges,
    handleBackToAccounts,

    // Status
    isUpdating,
    
    // Form Errors
    updateErrors,
  };
}