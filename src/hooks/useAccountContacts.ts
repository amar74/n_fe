import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/services/api/accountsApi';
import { useToast } from '@/hooks/useToast';
import { accountsQueryKeys } from './useAccounts';
import { ContactAddRequest, ContactUpdateRequest } from '@/types/accounts';

/**
 * Hook for fetching account contacts
 * Only fetches when explicitly called with an account ID
 */
export function useAccountContacts(accountId: string) {
  const queryClient = useQueryClient();

	const {
		data: contactsData,
		isLoading: isContactsLoading,
		error: contactsError,
	} = useQuery({
		queryKey: accountsQueryKeys.contacts(accountId),
		queryFn: async () => {
		if (!accountId) throw new Error('Account ID is required');
		const fetchStart = performance.now();
		try {
   // TODO: need to fix this - jhalak32
			const result = await accountsApi.getContacts(accountId);
			const fetchEnd = performance.now();
			console.log('🔍 API Response - getContacts:', {
				accountId,
				resultType: Array.isArray(result) ? 'Array' : 'Object',
				contactsCount: Array.isArray(result) ? result.length : 0,
				result
			});
			// Backend returns array directly, wrap it in object format expected by frontend
			return { contacts: Array.isArray(result) ? result : [] };
		} catch (error) {
			const fetchEnd = performance.now();
			throw error;
		}
		},
		enabled: !!accountId,
		staleTime: 0, // Always fetch fresh data
		refetchOnMount: 'always',
	});

  const { toast } = useToast();

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
    onSuccess: async (data, variables) => {
      console.log('✅ Contact added, invalidating queries for:', variables.accountId);
      
      // Invalidate first to mark as stale
      queryClient.invalidateQueries({ 
        queryKey: accountsQueryKeys.contacts(variables.accountId)
      });
      
      queryClient.invalidateQueries({ 
        queryKey: accountsQueryKeys.detail(variables.accountId)
      });
      
      // Then force refetch
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.contacts(variables.accountId),
        type: 'active'
      });
      
      console.log('✅ Queries refetched');
      
      toast.success('Contact Added', {
        description: 'Contact added successfully'
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
      console.log('🔄 API Call - Update Contact:', {
        accountId,
        contactId,
        contactData: contact,
        endpoint: `/accounts/${accountId}/contacts/${contactId}`
      });
      return await accountsApi.updateContact(accountId, contactId, contact);
    },
    onSuccess: async (data, variables) => {
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.contacts(variables.accountId),
        type: 'active'
      });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.detail(variables.accountId) });
      toast.success('Contact Updated', {
        description: data.message || 'Contact updated sucessfully'
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
    onSuccess: async (data, variables) => {
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.contacts(variables.accountId),
        type: 'active'
      });
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
    onSuccess: async (data, variables) => {
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.contacts(variables.accountId),
        type: 'active'
      });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.detail(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.list() });
      toast.success('Contact Promoted', {
        description: data.message || 'Contact has been promoted to primary sucessfully'
      });
    },
    onError: (error: any) => {
      toast.error('Error Promoting Contact', {
        description: error.response?.data?.message || 'promote failed to primary'
      });
    },
  });


  return {
    contactsData,
    isContactsLoading,
    contactsError,


    addContact: addContactMutation.mutateAsync,
    updateContact: updateContactMutation.mutateAsync,
    deleteContact: deleteContactMutation.mutateAsync,
    promoteContactToPrimary: promoteContactToPrimaryMutation.mutateAsync,

   
    isAddingContact: addContactMutation.isPending,
    isUpdatingContact: updateContactMutation.isPending,
    isDeletingContact: deleteContactMutation.isPending,
    isPromotingContact: promoteContactToPrimaryMutation.isPending,

    // error states
    addContactError: addContactMutation.error,
    updateContactError: updateContactMutation.error,
    deleteContactError: deleteContactMutation.error,
    promoteContactToPrimaryError: promoteContactToPrimaryMutation.error,

    // success states
    addContactSuccess: addContactMutation.isSuccess,
    updateContactSuccess: updateContactMutation.isSuccess,
    deleteContactSuccess: deleteContactMutation.isSuccess,
    promoteContactToPrimarySuccess: promoteContactToPrimaryMutation.isSuccess,
  };
  }
  