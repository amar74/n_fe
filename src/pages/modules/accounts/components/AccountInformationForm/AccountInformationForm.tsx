import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AccountFormData } from '../../AccountDetailsPage.types';
import { CLIENT_TYPES, FORM_FIELD_LABELS } from '../../AccountDetailsPage.constants';
import { MARKET_SECTORS, US_STATES } from '../CreateAccountModal/CreateAccountModal.constants';
import { UpdateAccountModal } from '../UpdateAccountModal';
import { accountsQueryKeys, useAccounts } from '@/hooks/useAccounts';

interface AccountInformationFormProps {
  formData: AccountFormData;
  accountId?: string;
  isEditing: boolean;
  isUpdating: boolean;
  onFormChange: (field: keyof AccountFormData, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  errors?: Record<string, string>;
}

export function AccountInformationForm({
  formData,
  accountId,
  isEditing,
  isUpdating,
  onFormChange,
  onSave,
  onCancel,
  errors = {},
}: AccountInformationFormProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { updateAccount, isUpdating: isUpdatingAccount } = useAccounts();

  const handleUpdate = async (modalData: any) => {
    if (!accountId) return;
    
    try {
      // Directly call the update API with the modal's data
      await updateAccount({
        accountId,
        data: {
          client_name: modalData.client_name,
          client_type: modalData.client_type,
          market_sector: modalData.market_sector,
          client_address: {
            line1: modalData.client_address_line1,
            line2: modalData.client_address_line2 || undefined,
            city: modalData.client_address_city || undefined,
            state: modalData.client_address_state || undefined,
            pincode: modalData.client_address_zip_code ? parseInt(modalData.client_address_zip_code) : undefined,
          },
          company_website: modalData.company_website || undefined,
          notes: undefined,
        },
      });
      
      // Force refetch the account detail query to get fresh data
      await queryClient.refetchQueries({ 
        queryKey: accountsQueryKeys.detail(accountId),
        type: 'active'
      });
      
      // Close modal after successful update
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Failed to update account:', error);
      // Modal will stay open so user can retry
    }
  };
  return (
    <div className="w-full p-8 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] flex flex-col justify-start items-start gap-5">
      {/* Header */}
      <div className="self-stretch inline-flex justify-between items-start">
        <div className="justify-start text-slate-800 text-lg font-semibold font-['Outfit'] leading-7">
          Account information
        </div>
        {isEditing ? null : (
          <button 
            onClick={() => setIsUpdateModalOpen(true)}
            className="size-10 p-2.5 bg-white rounded-[50px] outline outline-[0.50px] outline-gray-200 flex justify-center items-center gap-[3px] hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.3838 4.40881L11.5913 1.61569C11.4752 1.49956 11.3374 1.40744 11.1857 1.34459C11.034 1.28174 10.8714 1.24939 10.7072 1.24939C10.543 1.24939 10.3804 1.28174 10.2287 1.34459C10.077 1.40744 9.93921 1.49956 9.82313 1.61569L2.11626 9.32319C1.99976 9.43892 1.90739 9.57664 1.84452 9.72834C1.78165 9.88004 1.74953 10.0427 1.75001 10.2069V13.0001C1.75001 13.3316 1.8817 13.6495 2.11612 13.8839C2.35054 14.1184 2.66848 14.2501 3.00001 14.2501H5.79313C5.95734 14.2505 6.12001 14.2184 6.27171 14.1555C6.42341 14.0926 6.56112 14.0003 6.67688 13.8838L14.3838 6.17631C14.6181 5.9419 14.7497 5.62402 14.7497 5.29256C14.7497 4.96111 14.6181 4.64322 14.3838 4.40881ZM5.68751 12.7501H3.25001V10.3126L8.50001 5.06256L10.9375 7.50006L5.68751 12.7501ZM12 6.43756L9.56251 4.00006L10.7088 2.85381L13.1463 5.29131L12 6.43756Z" fill="black"/>
            </svg>
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-black/10"></div>

      {/* Form with social login */}
      <div className="w-full flex flex-col justify-start items-start gap-5">
        {/* Form element */}
        <div className="self-stretch flex flex-col justify-start items-start gap-5">
          {/* Inputs */}
          <div className="self-stretch flex flex-col justify-start items-start gap-5">
            
            {/* Row 1: Account ID + Client Name */}
            <div className="self-stretch flex justify-start items-start gap-5">
              {/* Account ID */}
              <div className="w-36 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Account Id
                </label>
                <div className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] flex items-center">
                  <span className="text-slate-700 text-sm font-normal font-['Outfit'] leading-tight truncate">
                    {accountId || '000-01'}
                  </span>
                </div>
              </div>

              {/* Client Name */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Client name
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => onFormChange('client_name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 2: Client Type + Market Sector */}
            <div className="self-stretch flex justify-start items-start gap-5">
              {/* Client Type */}
              <div className="w-64 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Client type
                </label>
                <div className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] flex items-center">
                  <span className="text-slate-700 text-sm font-normal font-['Outfit'] leading-tight">
                    {formData.client_type || 'tier_1'}
                  </span>
                </div>
              </div>

              {/* Market Sector */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Market sector
                </label>
                <div className="relative w-full">
                  <select
                    value={formData.market_sector}
                    onChange={(e) => onFormChange('market_sector', e.target.value)}
                    disabled={!isEditing}
                    className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                  >
                    {MARKET_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Address 1 */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                Address 1<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.client_address_line1}
                onChange={(e) => onFormChange('client_address_line1', e.target.value)}
                disabled={!isEditing}
                className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Row 4: City + State + Zip Code */}
            <div className="self-stretch flex justify-start items-start gap-5">
              {/* City */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  City<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.client_address_city || ''}
                  onChange={(e) => onFormChange('client_address_city', e.target.value)}
                  disabled={!isEditing}
                  placeholder="City name"
                  className="w-full h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-slate-800 placeholder:text-[#9CA3AF] text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* State */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  State<span className="text-red-600">*</span>
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Select State"
                    disabled={!isEditing}
                    className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 placeholder:text-[#9CA3AF] text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                  />
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Zip Code */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Zip Code<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.client_address_zip_code || ''}
                  onChange={(e) => onFormChange('client_address_zip_code', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Postal code"
                  className="w-full h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-slate-800 placeholder:text-[#9CA3AF] text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 5: Company Website + Hosting Area + MSA */}
            <div className="self-stretch flex justify-start items-start gap-5">
              {/* Company Website */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Company website
                </label>
                <input
                  type="text"
                  value={formData.company_website || ''}
                  onChange={(e) => onFormChange('company_website', e.target.value)}
                  disabled={!isEditing}
                  className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Hosting Area */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Hosting area
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Select State"
                    disabled={!isEditing}
                    value={formData.hosting_area || ''}
                    onChange={(e) => onFormChange('hosting_area', e.target.value)}
                    className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 placeholder:text-[#9CA3AF] text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                  />
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* MSA in place */}
              <div className="w-28 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  MSA in place
                </label>
                <div className="w-full h-11 px-3.5 py-2.5 bg-emerald-50 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-emerald-200 flex items-center justify-center">
                  <span className="text-[#10B981] text-xs font-semibold font-['Outfit'] leading-none uppercase">
                    {formData.msa_in_place ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 6: Account Approver + Approval Date & Time */}
            <div className="self-stretch flex justify-start items-start gap-5">
              {/* Account Approver */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Account Approver
                </label>
                <input
                  type="text"
                  value={formData.account_approver || ''}
                  onChange={(e) => onFormChange('account_approver', e.target.value)}
                  disabled={!isEditing}
                  className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-[#4361EE] text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Approval Date & Time */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Approval date & time
                </label>
                <input
                  type="text"
                  value={formData.approval_date_time || ''}
                  onChange={(e) => onFormChange('approval_date_time', e.target.value)}
                  disabled={!isEditing}
                  className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-[#4361EE] text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

          </div>
        </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-between w-full pt-4">
            <button
              onClick={onCancel}
              disabled={isUpdating}
              className="bg-transparent border border-[#0f0901] rounded-[16px] h-14 flex items-center justify-center px-6 py-2 min-w-[148px]"
            >
              <span className="font-inter font-medium text-[#0f0901] text-[14px] leading-[24px]">
                Cancel
              </span>
            </button>
            <button
              onClick={onSave}
              disabled={isUpdating}
              className="bg-[#0f0901] rounded-[16px] h-14 flex items-center justify-center px-8 py-2 min-w-[200px] ml-4"
            >
              <span className="font-inter font-medium text-white text-[14px] leading-[24px]">
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>
        )}

      {/* Update Account Modal */}
      <UpdateAccountModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdate={handleUpdate}
        accountData={formData}
        isLoading={isUpdatingAccount}
      />
    </div>
  );
}
