import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { MARKET_SECTORS, CLIENT_TYPES, HOSTING_AREAS, US_STATES } from '../CreateAccountModal/CreateAccountModal.constants';
import { ClientType } from '../CreateAccountModal/CreateAccountModal.types';

interface UpdateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any) => void;
  accountData: any;
  isLoading?: boolean;
}

const CLIENT_TYPE_DISPLAY: Record<string, string> = {
  'tier_1': 'Tier 1',
  'tier_2': 'Tier 2',
  'tier_3': 'Tier 3',
};

export function UpdateAccountModal({ 
  isOpen, 
  onClose, 
  onUpdate, 
  accountData,
  isLoading = false 
}: UpdateAccountModalProps) {
  const [formData, setFormData] = useState({
    company_website: '',
    client_name: '',
    client_address_line1: '',
    client_address_line2: '',
    client_address_city: '',
    client_address_state: '',
    client_address_zip_code: '',
    primary_contact: '',
    email_address: '',
    market_sector: '',
    client_type: '',
    hosting_area: '',
    msa_in_place: false,
  });

  // Update form data when accountData changes
  useEffect(() => {
    if (accountData) {
      setFormData({
        company_website: accountData.company_website || '',
        client_name: accountData.client_name || '',
        client_address_line1: accountData.client_address_line1 || '',
        client_address_line2: accountData.client_address_line2 || '',
        client_address_city: accountData.client_address_city || '',
        client_address_state: accountData.client_address_state || '',
        client_address_zip_code: accountData.client_address_zip_code || '',
        primary_contact: accountData.primary_contact || '',
        email_address: accountData.email_address || '',
        market_sector: accountData.market_sector || '',
        client_type: accountData.client_type || '',
        hosting_area: accountData.hosting_area || '',
        msa_in_place: accountData.msa_in_place || false,
      });
    }
  }, [accountData]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="w-[653px] p-8 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="self-stretch flex justify-between items-center">
            <div className="text-slate-800 text-3xl font-semibold font-['Outfit'] leading-[48px]">
              Update Account
            </div>
            <button
              onClick={onClose}
              className="size-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Divider */}
          <div className="self-stretch h-0 border-t border-black/10"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="self-stretch flex flex-col gap-5">
            {/* Row 1: Company Website + Client Name */}
            <div className="self-stretch flex gap-5">
              <div className="w-72 flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Company Website<span className="text-red-600">*</span>
                  </label>
                  <div className="px-2 py-0.5 bg-indigo-500 rounded-[999px] flex items-center gap-1">
                    <Sparkles className="size-3 text-white" />
                    <span className="text-white text-xs font-medium font-['Outfit'] leading-none">AI Enhanced</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.company_website}
                  onChange={(e) => handleInputChange('company_website', e.target.value)}
                  className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="xyz.com"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Client Name<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  className="h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Megapolis"
                />
              </div>
            </div>

            {/* Row 2: Address 1 + Address 2 */}
            <div className="self-stretch flex gap-5">
              <div className="w-72 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Address 1<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.client_address_line1}
                  onChange={(e) => handleInputChange('client_address_line1', e.target.value)}
                  className="h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="45, Street"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Address 2
                </label>
                <input
                  type="text"
                  value={formData.client_address_line2}
                  onChange={(e) => handleInputChange('client_address_line2', e.target.value)}
                  className="h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-[#667085] text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Address (optional)"
                />
              </div>
            </div>

            {/* Row 3: City + State + Zip Code */}
            <div className="self-stretch flex gap-5">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  City<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.client_address_city}
                  onChange={(e) => handleInputChange('client_address_city', e.target.value)}
                  className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#667085] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="City name"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  State<span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.client_address_state || ''}
                    onChange={(e) => handleInputChange('client_address_state', e.target.value)}
                    className="w-full h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Zip Code<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.client_address_zip_code}
                  onChange={(e) => handleInputChange('client_address_zip_code', e.target.value)}
                  className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#667085] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Postal code"
                />
              </div>
            </div>

            {/* Row 4: Primary Contact + Email Address */}
            <div className="self-stretch flex gap-5">
              <div className="w-72 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Primary contact
                </label>
                <input
                  type="text"
                  value={formData.primary_contact}
                  onChange={(e) => handleInputChange('primary_contact', e.target.value)}
                  className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#667085] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Contact name"
                />
              </div>

              <div className="w-72 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Email address<span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email_address}
                  onChange={(e) => handleInputChange('email_address', e.target.value)}
                  className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#667085] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="example@gmail.com"
                />
              </div>
            </div>

            {/* Row 5: Client Market Sector + Client Type */}
            <div className="self-stretch flex gap-5">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Client market sector<span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.market_sector || ''}
                    onChange={(e) => handleInputChange('market_sector', e.target.value)}
                    className="w-full h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Select Sector</option>
                    {MARKET_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Client type<span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.client_type || ''}
                    onChange={(e) => handleInputChange('client_type', e.target.value)}
                    className="w-full h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Select Type</option>
                    {CLIENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {CLIENT_TYPE_DISPLAY[type] || type}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 6: Hosting Area/Office + MSA in place */}
            <div className="self-stretch flex gap-5">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Hosting Area/Office
                </label>
                <div className="relative">
                  <select
                    value={formData.hosting_area || ''}
                    onChange={(e) => handleInputChange('hosting_area', e.target.value)}
                    className="w-full h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Select Area</option>
                    {HOSTING_AREAS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  MSA in place
                </label>
                <div className="relative">
                  <select
                    value={formData.msa_in_place ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('msa_in_place', e.target.value === 'true')}
                    className="w-full h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="self-stretch flex gap-5 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-3.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-indigo-950 text-indigo-950 text-sm font-medium font-['Outfit'] leading-tight hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-indigo-950 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-indigo-950 text-white text-sm font-medium font-['Outfit'] leading-tight hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Updating...' : 'Update Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
