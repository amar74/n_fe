import React from 'react';
import { X } from 'lucide-react';
import { ContactsForm } from '../ContactsForm';
import { ContactCreate } from '@/types/accounts';

type AddContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: ContactCreate) => Promise<any>;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export function AddContactModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  errors = {},
}: AddContactModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (contact: ContactCreate) => {
    // console.log(formData); // debug
    await onSubmit(contact);
    onClose();
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
              Add Secondary Contact
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
              onCancel={onClose}
              errors={errors}
            />
          </div>
        </div>
      </div>
    </>
  );
}
