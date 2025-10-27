import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAccountDetail, useAccounts } from '@/hooks/useAccounts';
import { TabType, AccountFormData, AccountStatsCard } from './AccountDetailsPage.types';
import { MOCK_RECENT_ACTIVITY } from './AccountDetailsPage.constants';
import { STATE_ABBREVIATION_TO_NAME } from './components/CreateAccountModal/CreateAccountModal.constants';

export function useAccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  // FIXME: this not working properly - guddy.tech
  const [formData, setFormData] = useState<AccountFormData | null>(null);

  const { accountDetail: account, isAccountDetailLoading: isLoading, accountDetailError: error } = useAccountDetail(id || '');
  const { updateAccount, isUpdating, updateErrors, isUpdateAccountSuccess } = useAccounts();
  useEffect(() => {
    if (account && account.custom_id && id === account.account_id) {
      const newUrl = `/module/accounts/${account.custom_id}`;
      navigate(newUrl, { replace: true });
    }
  }, [account, id, navigate]);


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
    recentActivity: MOCK_RECENT_ACTIVITY,

    handleTabChange,
    handleEditToggle,
    handleFormChange,
    handleSaveChanges,
    handleBackToAccounts,

    isUpdating,
    
    updateErrors,
  };
}