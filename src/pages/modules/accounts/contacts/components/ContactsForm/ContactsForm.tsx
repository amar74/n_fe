import React, { useState, useEffect } from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { ContactCreate, ContactResponse, ContactUpdateRequest } from '@/types/accounts';

type ContactsFormProps = {
  onSubmit: (contact: ContactCreate) => Promise<any>;
  isLoading?: boolean;
  initialData?: ContactCreate;
  onCancel?: () => void;
  errors?: Record<string, string>;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
];

export function ContactsForm({ 
  onSubmit, 
  isLoading = false, 
  initialData = {email: '', phone: '', name: '', title: ''}, 
  onCancel,
  errors = {},
}: ContactsFormProps) {
  const [formData, setFormData] = useState<ContactCreate>(initialData);
  const [countryCode, setCountryCode] = useState('+1'); // Default to USA
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    setFormData({
      ...initialData,
    });
    
    if (initialData.phone) {
      const matchedCode = COUNTRY_CODES.find(c => initialData.phone?.startsWith(c.code));
      if (matchedCode) {
        setCountryCode(matchedCode.code);
        setPhoneNumber(initialData.phone.substring(matchedCode.code.length).trim());
      } else {
        setPhoneNumber(initialData.phone);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    // console.log(formData); // debug
    e.preventDefault();
    
    const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    
    if (!formData.title?.trim() || !formData.name?.trim() || !formData.email?.trim() || !phoneNumber.trim()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        phone: fullPhoneNumber,
      });
      
      if (!initialData.name) {
        setFormData({email: '', phone: '', name: '', title: ''});
        setPhoneNumber('');
        setCountryCode('+1');
      }
    } catch (e) {
      // Error handling is done in the hook
    }
  };

  const handleChange = (field: keyof ContactResponse, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        
        <div className="flex gap-5 w-full">
          
          <div className="w-48 flex flex-col gap-1.5">
            <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
              Title<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData?.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter title"
              required
              className={`w-full h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } text-slate-800 text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#9CA3AF] transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
            />
            {errors.title && (
              <span className="text-red-500 text-xs mt-0.5">{errors.title}</span>
            )}
          </div>

          
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
              Contact Name<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData?.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter contact name"
              required
              className={`w-full h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } text-slate-800 text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#9CA3AF] transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-0.5">{errors.name}</span>
            )}
          </div>
        </div>

        
        <div className="flex gap-5 w-full">
          
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
              Email Address<span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={formData?.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="example@company.com"
              required
              className={`w-full h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } text-slate-800 text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#9CA3AF] transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-0.5">{errors.email}</span>
            )}
          </div>

          
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
              Phone Number<span className="text-red-600">*</span>
            </label>
            <div className="flex gap-2">
              
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 h-11 px-2 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.flag} {item.code}
                  </option>
                ))}
              </select>
              
              
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d\s\-()]/g, '');
                  setPhoneNumber(value);
                }}
                placeholder="(555) 123-4567"
                required
                className={`flex-1 h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } text-slate-800 text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#9CA3AF] transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
              />
            </div>
            {errors.phone && (
              <span className="text-red-500 text-xs mt-0.5">{errors.phone}</span>
            )}
          </div>
        </div>

        
        <div className="flex items-center justify-end gap-4 pt-5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-5 py-3 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-indigo-950 text-indigo-950 text-sm font-medium font-['Outfit'] leading-tight hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !formData.title?.trim() || !formData.name?.trim() || !formData.email?.trim() || !phoneNumber?.trim()}
            className="px-5 py-3 bg-indigo-950 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-indigo-950 text-white text-sm font-medium font-['Outfit'] leading-tight hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : initialData.name ? 'Update Contact' : 'Add Contact'}
          </button>
        </div>
    </form>
  );
}
