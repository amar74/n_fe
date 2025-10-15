import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddContactModal } from './components/AddContactModal';
import { ContactsList } from './components/ContactsList';
import { EditContactModal } from './components/EditContactModal';
import { useContacts } from './useContacts';

export type ContactsTabProps = {
  accountId: string;
}

export function ContactsTab({ accountId }: ContactsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const {
    // Data
    contacts,
    editingContact,
    showEditModal,
    
    // State
    isContactsLoading: isLoading,
    isAddingContact: isCreating,
    isUpdatingContact: isUpdating,
    isDeletingContact: isDeleting,
    createErrors,
    updateErrors,
    
    // Actions
    createContact,
    startEditContact,
    cancelEdit,
    updateContact,
    deleteContact,
  } = useContacts(accountId);

  const handleAddContact = async (contactData: any) => {
    await createContact(contactData);
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-950 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-indigo-950 text-white text-sm font-medium font-['Outfit'] leading-tight hover:bg-indigo-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Secondary Contact
        </button>
      </div>

      
      <ContactsList
        accountId={accountId}
        contacts={contacts}
        onEdit={startEditContact}
        onDelete={deleteContact}
        isLoading={isLoading}
      />

      
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddContact}
        isLoading={isCreating}
        errors={createErrors}
      />

      
      <EditContactModal
        isOpen={showEditModal}
        contact={editingContact}
        onClose={cancelEdit}
        onSave={updateContact}
        isLoading={isUpdating}
        errors={updateErrors}
      />
    </div>
  );
}
