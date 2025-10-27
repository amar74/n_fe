import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { createQueryKeys } from '@/lib/query-client';
import { accountsApi } from '@/services/api/accountsApi';
import { useToast } from '@/hooks/useToast';
import { parseBackendErrors } from '@/utils/errorParser';
import { AxiosError } from 'axios';
import type {
  AccountCreate,
  AccountUpdate,
  ContactAddRequest,
  ContactUpdateRequest,
} from '@/types/accounts';
import { HTTPValidationError } from '@/types/validationError';

export const accountsKeys = createQueryKeys('accounts');

export const accountsQueryKeys = {
  ...accountsKeys,
  list: (params?: Record<string, any>) => [...accountsKeys.all, 'list', params],
  detail: (id: string) => [...accountsKeys.all, 'detail', id],
  contacts: (id: string) => [...accountsKeys.all, 'contacts', id],
  insights: (id: string) => [...accountsKeys.all, 'insights', id],
};

/**
 * Hook for fetching account contacts
 * Only fetches when explicitly called with an account ID
 */
export function useAccountContacts(accountId: string) {
  const {
    data: accountContacts,
    isLoading: isContactsLoading,
    error: contactsError,
  } = useQuery({
    queryKey: accountsQueryKeys.contacts(accountId),
    queryFn: async () => {
      if (!accountId) throw new Error('Account ID is required');
      return accountsApi.getContacts(accountId);
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  return {
    accountContacts,
    isContactsLoading,
    contactsError,
  };
}

/**
 * Hook for fetching account insights
 * Only fetches when explicitly called with an account ID
 */
export function useAccountInsights(accountId: string) {
  const {
    data: accountInsights,
    isLoading: isInsightsLoading,
    error: insightsError,
  } = useQuery({
    queryKey: accountsQueryKeys.insights(accountId),
    queryFn: async () => {
      if (!accountId) throw new Error('Account ID is required');
      return accountsApi.getAIInsights(accountId);
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    accountInsights,
    isInsightsLoading,
    insightsError,
  };
}

/**
 * Hook for fetching a single account's details
 * Only fetches when explicitly called with an account ID
 */
export function useAccountDetail(accountId: string) {
  const startTime = performance.now();
  
  // FIXME: this not working properly - amar74.soft
  const {
    data: accountDetail,
    isLoading: isAccountDetailLoading,
    error: accountDetailError,
  } = useQuery({
    queryKey: accountsQueryKeys.detail(accountId),
    queryFn: async () => {
      const fetchStart = performance.now();
      try {
        const result = await accountsApi.getAccount(accountId);
        const fetchEnd = performance.now();
        return result;
      } catch (error) {
        const fetchEnd = performance.now();
        throw error;
      }
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Reduce retry attempts from 3 to 1
    retryDelay: 1000, // Simple 1 second delay instead of exponential backoff
  });

  if (accountDetail && import.meta.env.DEV) {
    const totalTime = performance.now() - startTime;
  }

  return {
    accountDetail,
    isAccountDetailLoading,
    accountDetailError,
  };
}

/**
 * Main hook for accounts list and operations
 * @param options.initialParams - Initial search parameters
 * @param options.eager - If true, fetches data immediately on mount (default: true)
 */
export function useAccounts(options?: {
  initialParams?: {
    search?: string;
    tier?: string;
    page?: number;
    size?: number;
  };
  eager?: boolean;
}) {
  const { initialParams, eager = false } = options || {};
  const queryClient = useQueryClient();
  // @harsh.pawar - refactor needed
  const { toast } = useToast();
  
  const [enabled, setEnabled] = useState(eager);
  const [queryParams, setQueryParams] = useState(initialParams);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialParams?.page || 1);
  const [pageSize, setPageSize] = useState(initialParams?.size || 10);
  
  // Error states
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  const fetchAccounts = useCallback((params?: typeof initialParams) => {
    setQueryParams(params);
    setEnabled(true);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  const query = useQuery({
    queryKey: accountsQueryKeys.list({ ...queryParams, page: currentPage, size: pageSize }),
    queryFn: async () => accountsApi.listAccounts({ 
      ...queryParams, 
      page: currentPage, 
      size: pageSize 
    }),
    enabled: enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountCreate): Promise<{ status_code: number; account_id: string; message: string }> => {
      return await accountsApi.createAccount(data);
    },
    onSuccess: async (data) => {
      // Invalidate all accounts list queries (any pagination/filter combination)
      await queryClient.invalidateQueries({ queryKey: accountsKeys.all });
      // Refetch the current query to immediately show new data
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.list({ ...queryParams, page: currentPage, size: pageSize }),
        exact: true 
      });
      toast.success('Account Created', {
        description: data.message || 'Account created sucessfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Creating Account', {
        description: error.response?.data?.message || 'create failed'
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({
      accountId,
      data,
    }: {
      accountId: string;
      data: AccountUpdate;
    }): Promise<{ status_code: number; message: string }> => {
      return await accountsApi.updateAccount(accountId, data);
    },
    onSuccess: async (data, variables) => {
      // Invalidate all accounts queries
      await queryClient.invalidateQueries({ queryKey: accountsKeys.all });
      // Refetch current list
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.list({ ...queryParams, page: currentPage, size: pageSize }),
        exact: true 
      });
      toast.success('Account Updated', {
        description: data.message || 'Account updated sucessfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Updating Account', {
        description: error.response?.data?.message || 'update failed'
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: string): Promise<{ status_code: number; message: string }> => {
      return await accountsApi.deleteAccount(accountId);
    },
    onSuccess: async (data, accountId) => {
      // Remove the deleted account's detail query
      queryClient.removeQueries({ queryKey: accountsQueryKeys.detail(accountId) });
      // Invalidate all accounts queries
      await queryClient.invalidateQueries({ queryKey: accountsKeys.all });
      // Refetch current list immediately
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.list({ ...queryParams, page: currentPage, size: pageSize }),
        exact: true 
      });
      toast.success('Account Deleted', {
        description: data.message || 'Account deleted successfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Deleting Account', {
        description: error.response?.data?.message || 'delete failed'
      });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async ({
      accountId,
      contact,
    }: {
      accountId: string;
      contact: ContactAddRequest;
    }): Promise<{ status_code: number; contact_id: string; message: string }> => {
      return await accountsApi.addContact(accountId, contact);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.contacts(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.detail(variables.accountId) });
      toast.success('Contact Added', {
        description: data.message || 'Contact added successfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Adding Contact', {
        description: error.response?.data?.message || 'add failed'
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({
      accountId,
      contactId,
      contact,
    }: {
      accountId: string;
      contactId: string;
      contact: ContactUpdateRequest;
    }): Promise<{ status_code: number; message: string }> => {
      return await accountsApi.updateContact(accountId, contactId, contact);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.contacts(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.detail(variables.accountId) });
      toast.success('Contact Updated', {
        description: data.message || 'Contact updated successfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Updating Contact', {
        description: error.response?.data?.message || 'update failed'
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async ({
      accountId,
      contactId,
    }: {
      accountId: string;
      contactId: string;
    }): Promise<{ status_code: number; message: string }> => {
      return await accountsApi.deleteContact(accountId, contactId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.contacts(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.detail(variables.accountId) });
      toast.success('Contact Deleted', {
        description: data.message || 'Contact deleted sucessfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Deleting Contact', {
        description: error.response?.data?.message || 'delete failed'
      });
    },
  });

  const promoteContactToPrimaryMutation = useMutation({
    mutationFn: async ({
      accountId,
      contactId,
    }: {
      accountId: string;
      contactId: string;
    }): Promise<{ status_code: number; message: string }> => {
      return await accountsApi.promoteContactToPrimary(accountId, contactId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.contacts(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.detail(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.list() });
      toast.success('Contact Promoted', {
        description: data.message || 'Contact has been promoted to primary successfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Promoting Contact', {
        description: error.response?.data?.message || 'promote failed to primary'
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (accountId: string): Promise<{ report_url: string; report_id: string }> => {
      return await accountsApi.generateAccountReport(accountId);
    },
    onSuccess: (data) => {
      toast.success('Report Generated', {
        description: `Report generated successfully. URL: ${data.report_url}`
      });
    },
    onError: (error: any) => {
      toast.error('Error Generating Report', {
        description: error.response?.data?.message || 'generate failed report'
      });
    },
  });

  const enrichAccountDataMutation = useMutation({
    mutationFn: async (website: string) => {
      return await accountsApi.enrichAccountData(website);
    },
    onSuccess: () => {
      toast.success('Data Enriched', {
        description: 'Account data enriched successfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Enriching Data', {
        description: error.response?.data?.message || 'enrich failed data'
      });
    },
  });

  useEffect(() => {
    if (createAccountMutation.error) {
      const error = createAccountMutation.error as AxiosError;
      if (error.response?.data) {
        const errors = parseBackendErrors(error.response.data as HTTPValidationError, [
          'client_name',
          'client_type',
          'market_sector',
          'line1',
          'line2',
          'city',
          'pincode',
          'company_website'
        ]);
        if(errors.line1){
          errors.client_address_line1 = errors.line1;
          delete errors.line1;
        }
        if(errors.line2){
          errors.client_address_line2 = errors.line2;
          delete errors.line2;
        }
        if(errors.city){
          errors.client_address_city = errors.city;
          delete errors.city;
        }
        if(errors.pincode){
          errors.client_address_zip_code = errors.pincode;
          delete errors.pincode;
        }
        setCreateErrors(errors);
      }
    } else {
      setCreateErrors({});
    }
  }, [createAccountMutation.error]);

  useEffect(() => {
    if (updateAccountMutation.error) {
      const error = updateAccountMutation.error as AxiosError;
      if (error.response?.data) {
        const errors = parseBackendErrors(error.response.data as HTTPValidationError, [
          'client_name',
          'client_type',
          'market_sector',
          'line1',
          'line2',
          'city',
          'pincode',
          'company_website'
        ]);

        if(errors.line1){
          errors.client_address_line1 = errors.line1;
          delete errors.line1;
        }
        if(errors.line2){
          errors.client_address_line2 = errors.line2;
          delete errors.line2;
        }
        if(errors.city){
          errors.client_address_city = errors.city;
          delete errors.city;
        }
        if(errors.pincode){
          errors.client_address_zip_code = errors.pincode;
          delete errors.pincode;
        }
        setUpdateErrors(errors);
      }
    } else {
      setUpdateErrors({});
    }
  }, [updateAccountMutation.error]);

  useEffect(() => {
    if (createAccountMutation.isSuccess) {
      setCreateErrors({});
    }
  }, [createAccountMutation.isSuccess]);

  useEffect(() => {
    if (updateAccountMutation.isSuccess) {
      setUpdateErrors({});
    }
  }, [updateAccountMutation.isSuccess]);

  return {
    fetchAccounts,
    accountsList: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,

    // Pagination data and controls
    pagination: query.data?.pagination,
    currentPage,
    pageSize,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange,

    createAccount: createAccountMutation.mutateAsync,
    updateAccount: updateAccountMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,

    // Account error states
    createAccountError: createAccountMutation.error,
    updateAccountError: updateAccountMutation.error,
    deleteAccountError: deleteAccountMutation.error,
    createErrors,
    updateErrors,

    // Account success states
    isCreateAccountSuccess: createAccountMutation.isSuccess,
    isUpdateAccountSuccess: updateAccountMutation.isSuccess,
    isDeleteAccountSuccess: deleteAccountMutation.isSuccess,

    addContact: addContactMutation.mutateAsync,
    updateContact: updateContactMutation.mutateAsync,
    deleteContact: deleteContactMutation.mutateAsync,
    promoteContactToPrimary: promoteContactToPrimaryMutation.mutateAsync,

    isCreating: createAccountMutation.isPending,
    isUpdating: updateAccountMutation.isPending,
    isDeleting: deleteAccountMutation.isPending,

    isAddingContact: addContactMutation.isPending,
    isUpdatingContact: updateContactMutation.isPending,
    isDeletingContact: deleteContactMutation.isPending,
    isPromotingContact: promoteContactToPrimaryMutation.isPending,

    generateReport: generateReportMutation.mutateAsync,
    enrichAccountData: enrichAccountDataMutation.mutateAsync,

    isGeneratingReport: generateReportMutation.isPending,
    isEnriching: enrichAccountDataMutation.isPending,
  };
}
