import React from 'react';
import { X } from 'lucide-react';
import { ContactsForm } from '../ContactsForm';
import { ContactResponse, ContactUpdateRequest } from '@/types/accounts';

type EditContactModalProps = {
  isOpen: boolean;
  contact: ContactResponse | null;
  onClose: () => void;
  onSave: (contactId: string, data: ContactUpdateRequest) => Promise<any>;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export function EditContactModal({ 
  isOpen, 
  contact, 
  onClose, 
  onSave, 
  isLoading = false,
  errors = {} 
}: EditContactModalProps) {
  const handleSubmit = async (formData: ContactUpdateRequest) => {
    if (!contact) return;
    
    console.log('📤 Sending contact update:', {
      contactId: contact.contact_id,
      data: formData
    });
    
    try {
      await onSave(contact.contact_id, formData);
      // onClose is handled by the parent component after successful update
    } catch (error) {
      // Error is handled by the hook and displayed via toast
      console.error('❌ Failed to update contact:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Backend response:', (error as any).response?.data);
      }
    }
  };

  if (!isOpen || !contact) return null;

  const initialData = {
    name: contact.name,
    title: contact.title,
    email: contact.email,
    phone: contact.phone,
  };

  return (
    <>
      
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        
        <div 
          className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-semibold font-['Outfit']">
              Edit Contact
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          
          <div className="p-6">
            <ContactsForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialData={initialData}
              onCancel={onClose}
              errors={errors}
            />
          </div>
        </div>
      </div>
    </>
  );
}
