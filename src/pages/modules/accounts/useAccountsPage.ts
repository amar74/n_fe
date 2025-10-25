import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAccounts } from '@/hooks/useAccounts';
import { AccountStatsData, FilterState } from './AccountsPage.types';
import { AccountCreate, AccountListItem } from '@/types/accounts';
import { ClientType } from './components/CreateAccountModal/CreateAccountModal.types';
import { tr } from 'date-fns/locale';

export function useAccountsPage() {
  const navigate = useNavigate();
  // will optimize later - rose11
  const { toast } = useToast();
  
  // Local state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tier: 'all',
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' });

  const {
    isLoading,
    accountsList,
    createAccount,
    fetchAccounts,
    refetch,
    isCreating,
    isDeleting,
    createErrors,
    pagination,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = useAccounts({eager: true});

  const accounts = accountsList?.accounts || [];
 



  const stats: AccountStatsData = useMemo(() => {
    if (accounts.length === 0) {
      return {
        totalAccounts: 0,
        aiHealthScore: 0,
        highRiskCount: 0,
        growingCount: 0,
        totalValue: '$0',
      };
    }

    const totalAccounts = accounts.length;
    const aiHealthScore = Math.round(
      accounts.reduce((sum, acc) => sum + (acc.ai_health_score || 0), 0) / totalAccounts
    );
    // Since these fields don't exist in AccountListItem, we'll set them to 0
    const highRiskCount = 0;
    const growingCount = 0;
    
  const totalValueNumber = accounts.reduce((sum, acc) => {
    return sum + (acc.total_value || 0);
  }, 0);
  // Convert to millions by dividing by 1,000,000
  const totalValue = `$${(totalValueNumber / 1000000).toFixed(1)}M`;

    return {
      totalAccounts,
      aiHealthScore,
      highRiskCount,
      growingCount,
      totalValue,
    };
  }, [accounts]);

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleTierChange = (tier: FilterState['tier']) => {
    fetchAccounts(tier === 'all' ? undefined : { tier });
    setFilters(prev => ({ ...prev, tier }));
  };

  const handleCreateAccount = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateAccountSubmit = async (formData: any) => {
    try {
      const accountData: AccountCreate = {
        company_website: formData.company_website || null,
        client_name: formData.client_name,
        client_address: {
          line1: formData.client_address_line1,
          line2: formData.client_address_line2 || null,
          city: formData.client_address_city || null,
          pincode: formData.client_address_zip_code ? parseInt(formData.client_address_zip_code) : null,
        },
        primary_contact: {
          name: formData.primary_contact || formData.client_name,
          email: formData.email_address,
          phone: formData.phone,
          title: null,
        },
        secondary_contacts: [],
        client_type: formData.client_type as ClientType,
        market_sector: formData.market_sector || null,
      };

      await createAccount(accountData);
      
      // Only close modal and show success modal if API call succeeds
      setIsCreateModalOpen(false);
      setSuccessMessage({
        title: 'Created Account',
        description: `${formData.client_name} has been added to your accounts.`,
      });
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      const validationErrors = error.response?.data?.detail;
      
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        // Collect all error messages
        const errorMessages = validationErrors.map((err: any) => {
          const fieldPath = err.loc?.slice(1).join('.') || 'field';
          const message = err.msg || 'Validation error';
          return `• ${fieldPath}: ${message}`;
        }).join('\n');
        
        toast({
          title: 'Validation Error',
          description: errorMessages,
          variant: 'destructive',
        });
      } else {
        const errorMessage = error.response?.data?.message 
          || error.message
          || 'There was an error creating the account. Please try again.';
        
        toast({
          title: 'Error Creating Account',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      // Re-throw error so the form component can handle it
      throw error;
    }
  };

  const handleAccountClick = (accountId: string) => {
    const account = accounts.find(acc => acc.account_id === accountId);
    const urlId = account?.custom_id || accountId;
    navigate(`/module/accounts/${urlId}`);
  };

  // will optimize later - guddy.tech
  const handleExport = (format: string) => {
    toast({
      title: `Exporting to ${format.toUpperCase()}`,
      description: `Account data is being exported to ${format} format.`,
    });
  };

  const handleStatClick = (statId: string) => {
  };

  return {
    // Data
    accounts,
    stats,
    filters,
    isLoading,
    isCreateModalOpen,
    isSuccessModalOpen,
    successMessage,
    
    // Pagination
    pagination,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    
    // Actions
    handleSearchChange,
    handleTierChange,
    handleCreateAccount,
    handleCreateAccountSubmit,
    handleAccountClick,
    handleExport,
    handleStatClick,
    setIsCreateModalOpen,
    setIsSuccessModalOpen,
    refetchAccounts: refetch,
    
    // Status
    isCreating: isCreating || false,
    isDeleting: isDeleting || false,
    createErrors,
  };
}
