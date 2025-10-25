import { useEffect, useState, useMemo } from 'react';
import { useAccountContacts } from '@/hooks/useAccountContacts';
import { ContactCreate, ContactResponse, ContactUpdateRequest } from '@/types/accounts';
import { AxiosError } from 'axios';
import { parseBackendErrors } from '@/utils/errorParser';
import { HTTPValidationError } from '@/types/validationError';
import { useAccountDetail } from '@/hooks/useAccounts';

export function useContacts(accountId: string) {
  const {
    contactsData, 
    addContact, deleteContact, updateContact,
    isAddingContact, isContactsLoading, isDeletingContact, isUpdatingContact,
    addContactError, updateContactError, deleteContactError,
    addContactSuccess, updateContactSuccess, deleteContactSuccess,
   } = useAccountContacts(accountId)
  
  const { accountDetail } = useAccountDetail(accountId);
  
  // Merge primary contact from account with contacts list
  const contacts = useMemo(() => {
    const contactsList = contactsData?.contacts || [];
    const primaryContact = accountDetail?.primary_contact;
    
    console.log('🔍 useContacts - Raw data:', {
      contactsData,
      contactsList,
      contactsListLength: contactsList.length,
      primaryContact,
    });
    
    // If no primary contact, return contacts as is
    if (!primaryContact) return contactsList;
    
    // Check if primary contact is already in the contacts list
    const primaryExists = contactsList.some(c => c.contact_id === primaryContact.contact_id);
    
    // If primary contact exists in list, return as is
    if (primaryExists) {
      console.log('✅ Primary exists in list, returning contactsList:', contactsList);
      return contactsList;
    }
    
    // Otherwise, add primary contact to the beginning of the list
    console.log('⚠️ Adding primary to beginning of list');
    return [primaryContact, ...contactsList];
  }, [contactsData?.contacts, accountDetail?.primary_contact]);
  // State
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>();
  const [editingContact, setEditingContact] = useState<ContactResponse | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);


  // Actions
  const createContact = async (contactData: ContactCreate) => {
    await addContact({accountId, contact: contactData});
  };

  const handleUpdateContact = async (contactId: string, contactData: ContactUpdateRequest) => {
    await updateContact({accountId, contactId, contact: contactData});
  };

  const handleDeleteContact = async (contactId: string) => {      
    deleteContact({accountId, contactId})
  };

  const startEditContact = (contact: ContactResponse) => {
    setEditingContact(contact);
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingContact(null);
    setShowEditModal(false);
  };


  useEffect(() => {
    if (addContactError && (addContactError as AxiosError)?.response?.data) {
      const errors = parseBackendErrors((addContactError as AxiosError).response?.data as HTTPValidationError, ['name', 'email', 'phone', 'title']);
      setCreateErrors(errors);
    } else {
      setCreateErrors({});
    }
  }, [addContactError]);

  useEffect(() => {
    if (updateContactError && (updateContactError as AxiosError)?.response?.data) {
      const errors = parseBackendErrors((updateContactError as AxiosError).response?.data as HTTPValidationError, ['name', 'email', 'phone', 'title']);
      setUpdateErrors(errors);
    } else {
      setUpdateErrors({});
    }
  }, [updateContactError]);

  useEffect(() => {
    if (addContactSuccess) {
      setCreateErrors({});
    }
  }, [addContactSuccess]);

  useEffect(() => {
    if (updateContactSuccess) {
      setEditingContact(null);
      setShowEditModal(false);
      setUpdateErrors({});
    }
  }, [updateContactSuccess]);

  return {
    // Data
    contacts,
    editingContact,
    showEditModal,
    
    // State
    isContactsLoading,
    isAddingContact,
    isUpdatingContact,
    isDeletingContact,
    createErrors,
    updateErrors,
    addContactSuccess,
    updateContactSuccess,
    
    // Actions
    createContact,
    updateContact: handleUpdateContact,
    deleteContact: handleDeleteContact,
    startEditContact,
    cancelEdit,
  };
}
