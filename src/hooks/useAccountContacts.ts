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
			return result;
		} catch (error) {
			const fetchEnd = performance.now();
			throw error;
		}
		},
		enabled: !!accountId,
		staleTime: 1000 * 60 * 5, // 5 minutes - contacts don't change very frequently
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
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.contacts(variables.accountId),
        type: 'active'
      });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.detail(variables.accountId) });
      toast.success('Contact Added', {
        description: data.message || 'Contact added sucessfully'
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
  