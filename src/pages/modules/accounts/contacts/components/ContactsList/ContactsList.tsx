import React from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';

import { ContactResponse } from '@/types/accounts';
import { useAccountDetail } from '@/hooks/useAccounts';

interface ContactsListProps {
  contacts: ContactResponse[];
  onEdit: (contact: ContactResponse) => void;
  onDelete: (contactId: string) => void;
  isLoading?: boolean;
  accountId: string;
}

export function ContactsList({ accountId, contacts, onEdit, onDelete, isLoading = false }: ContactsListProps) {
  const formatPhone = (phone: string) => {
    // Simple phone formatting
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };
  const { accountDetail } = useAccountDetail(accountId);

  if (isLoading) {
    return (
      <div className="w-full p-8 bg-white rounded-2xl border border-[#E5E7EB]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-950"></div>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="w-full p-8 bg-white rounded-2xl border border-[#E5E7EB]">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-slate-800 text-lg font-semibold font-['Outfit'] mb-2">No Contacts Yet</h3>
          <p className="text-[#667085] text-sm font-normal font-['Outfit']">
            Add your first contact for this account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-8 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-slate-800 text-lg font-semibold font-['Outfit'] leading-7">
          Client Contact
        </h3>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-black/10"></div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wider">
                Client Name
              </th>
              <th className="text-left py-3 px-4 text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wider">
                Role
              </th>
              <th className="text-left py-3 px-4 text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wider">
                Email
              </th>
              <th className="text-left py-3 px-4 text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wider">
                Phone
              </th>
              <th className="text-left py-3 px-4 text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wider">
                Tags
              </th>
              <th className="text-right py-3 px-4 text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {contacts.map((contact, index) => {
              const isPrimaryContact = contact.contact_id === accountDetail?.primary_contact?.contact_id;
              const isLastRow = index === contacts.length - 1;
              
              return (
                <tr
                  key={contact.contact_id}
                  className={`hover:bg-gray-50 transition-colors ${!isLastRow ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Client Name */}
                  <td className="py-4 px-4">
                    <span className="text-slate-800 text-sm font-medium font-['Outfit']">
                      {contact.name}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4">
                    <span className="text-slate-800 text-sm font-normal font-['Outfit']">
                      {isPrimaryContact ? 'Primary Contact' : 'Secondary Contact'}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4">
                    <span className="text-slate-800 text-sm font-normal font-['Outfit'] truncate max-w-[200px] inline-block">
                      {contact.email}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4">
                    <span className="text-slate-800 text-sm font-normal font-['Outfit']">
                      {formatPhone(contact.phone)}
                    </span>
                  </td>

                  {/* Tags */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Outfit'] ${
                        isPrimaryContact
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isPrimaryContact ? 'Primary' : 'Secondary'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(contact)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit Contact"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      {!isPrimaryContact && (
                        <button
                          onClick={() => onDelete(contact.contact_id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="More Options"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
