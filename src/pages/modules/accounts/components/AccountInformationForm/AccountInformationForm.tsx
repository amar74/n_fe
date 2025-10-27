import { useState, useEffect } from 'react';
import { AccountFormData } from '../../AccountDetailsPage.types';
import { CLIENT_TYPES, FORM_FIELD_LABELS } from '../../AccountDetailsPage.constants';
import { MARKET_SECTORS, US_STATES, HOSTING_AREAS } from '../CreateAccountModal/CreateAccountModal.constants';
import { lookupByZipCode, getCitiesByState } from '@/utils/addressUtils';
import { useAuth } from '@/hooks/useAuth';

type AccountInformationFormProps = {
  formData: AccountFormData;
  accountId?: string;
  isEditing: boolean;
  isUpdating: boolean;
  onFormChange: (field: keyof AccountFormData, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  errors?: Record<string, string>;
  account?: any; // The full account object from backend with created_by_name, updated_by_name, etc.
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
  account,
}: AccountInformationFormProps) {
  const { user } = useAuth();
  const [isZipLoading, setIsZipLoading] = useState(false);
  const [zipAutoFilled, setZipAutoFilled] = useState(false);
  const [zipError, setZipError] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleZipCodeChange = async (zipCode: string) => {
    const cleanedZip = zipCode.replace(/\D/g, '').slice(0, 5);
    
    handleFieldChange('client_address_zip_code', cleanedZip);

    setZipError('');
    setZipAutoFilled(false);

    if (cleanedZip.length > 0 && cleanedZip.length < 5) {
      setZipError('USA ZIP code must be 5 digits');
      setAvailableCities([]);
      return;
    }

    if (cleanedZip.length !== 5 || !/^\d{5}$/.test(cleanedZip)) {
      setAvailableCities([]);
      return;
    }

    setIsZipLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        const result = lookupByZipCode(zipCode);
        if (result) {
          const cities = getCitiesByState(result.stateCode);
          setAvailableCities(cities);
          handleFieldChange('client_address_city', result.city);
          handleFieldChange('client_address_state', result.state);
          setZipAutoFilled(true);
        } else {
          setZipError('ZIP code not found');
        }
        setIsZipLoading(false);
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&components=country:US&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('fetch failed Google Maps API');
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        let city = '';
        let state = '';
        let stateCode = '';

        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name; // Full state name
            stateCode = component.short_name; // State abbreviation
          }
        }

        if (city && state) {
          const cities = getCitiesByState(stateCode);
          setAvailableCities(cities.length > 0 ? cities : [city]);

          handleFieldChange('client_address_city', city);
          handleFieldChange('client_address_state', state);

          setZipAutoFilled(true);
          setZipError('');
        } else {
          setZipError('couldnt determine city and state from ZIP code');
          setAvailableCities([]);
        }
      } else if (data.status === 'ZERO_RESULTS') {
        setZipError('ZIP code not found');
        setAvailableCities([]);
      } else {
        throw new Error(data.status);
      }
    } catch (err) {
      setZipError('Error looking up ZIP code. Please enter manually.');
      setAvailableCities([]);
    } finally {
      setIsZipLoading(false);
    }
  };

  const handleFieldChange = (field: keyof AccountFormData, value: any) => {
    onFormChange(field, value);
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleStateChange = (state: string) => {
    const stateToCode: Record<string, string> = {
      Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
      Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
      Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
      Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
      Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
      Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH',
      Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
      Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY'
    };

    const stateCode = stateToCode[state];
    if (stateCode) {
      const cities = getCitiesByState(stateCode);
      setAvailableCities(cities);
    } else {
      setAvailableCities([]);
    }

    handleFieldChange('client_address_state', state);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.client_name?.trim()) {
      errors.client_name = 'Client name is required';
    }

    if (!formData.client_address_line1?.trim()) {
      errors.client_address_line1 = 'Address line 1 is required';
    }

    if (!formData.client_address_zip_code) {
      errors.client_address_zip_code = 'ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.client_address_zip_code)) {
      errors.client_address_zip_code = 'ZIP code must be exactly 5 digits';
    }

    if (!formData.client_address_state) {
      errors.client_address_state = 'State is required';
    }

    if (!formData.client_address_city?.trim()) {
      errors.client_address_city = 'City is required';
    }

    if (formData.company_website?.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.company_website.trim())) {
        errors.company_website = 'Please enter a valid website URL';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveWithValidation = () => {
    if (validateForm()) {
      onSave();
    }
  };

  useEffect(() => {
    if (formData.client_address_state) {
      const stateToCode: Record<string, string> = {
        Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
        Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
        Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
        Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
        Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
        Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH',
        Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
        Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY'
      };
      
      const stateCode = stateToCode[formData.client_address_state];
      if (stateCode) {
        const cities = getCitiesByState(stateCode);
        setAvailableCities(cities);
      }
    }
  }, [formData.client_address_state]);

  return (
    <div className="w-full p-8 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] flex flex-col justify-start items-start gap-5">
      
      <div className="self-stretch inline-flex justify-between items-start">
        <div className="justify-start text-slate-800 text-lg font-semibold font-['Outfit'] leading-7">
          Account information
        </div>
        {isEditing ? null : (
          <button 
            onClick={onCancel}
            className="size-10 p-2.5 bg-white rounded-[50px] outline outline-[0.50px] outline-gray-200 flex justify-center items-center gap-[3px] hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.3838 4.40881L11.5913 1.61569C11.4752 1.49956 11.3374 1.40744 11.1857 1.34459C11.034 1.28174 10.8714 1.24939 10.7072 1.24939C10.543 1.24939 10.3804 1.28174 10.2287 1.34459C10.077 1.40744 9.93921 1.49956 9.82313 1.61569L2.11626 9.32319C1.99976 9.43892 1.90739 9.57664 1.84452 9.72834C1.78165 9.88004 1.74953 10.0427 1.75001 10.2069V13.0001C1.75001 13.3316 1.8817 13.6495 2.11612 13.8839C2.35054 14.1184 2.66848 14.2501 3.00001 14.2501H5.79313C5.95734 14.2505 6.12001 14.2184 6.27171 14.1555C6.42341 14.0926 6.56112 14.0003 6.67688 13.8838L14.3838 6.17631C14.6181 5.9419 14.7497 5.62402 14.7497 5.29256C14.7497 4.96111 14.6181 4.64322 14.3838 4.40881ZM5.68751 12.7501H3.25001V10.3126L8.50001 5.06256L10.9375 7.50006L5.68751 12.7501ZM12 6.43756L9.56251 4.00006L10.7088 2.85381L13.1463 5.29131L12 6.43756Z" fill="black"/>
            </svg>
          </button>
        )}
      </div>

      
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-black/10"></div>

      
      <div className="w-full flex flex-col justify-start items-start gap-5">
        
        <div className="self-stretch flex flex-col justify-start items-start gap-5">
          
          <div className="self-stretch flex flex-col justify-start items-start gap-5">
            
            
            <div className="self-stretch flex justify-start items-start gap-5">
              
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

              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Client name<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleFieldChange('client_name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none disabled:opacity-100 disabled:cursor-not-allowed
                    ${validationErrors.client_name ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-[#E5E7EB] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                />
                {validationErrors.client_name && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.client_name}</p>
                )}
              </div>
            </div>

            
            <div className="self-stretch flex justify-start items-start gap-5">
              
              <div className="w-64 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Client type
                </label>
                <div className="relative w-full">
                  <select
                    value={formData.client_type || 'tier_1'}
                    onChange={(e) => onFormChange('client_type', e.target.value)}
                    disabled={!isEditing}
                    className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                  >
                    {CLIENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              
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

            
            <div className="self-stretch flex justify-start items-start gap-5">
              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Address 1<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.client_address_line1}
                  onChange={(e) => handleFieldChange('client_address_line1', e.target.value)}
                  disabled={!isEditing || !!accountId}
                  placeholder="Enter street address"
                  className={`w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none disabled:opacity-100 disabled:cursor-not-allowed
                    ${validationErrors.client_address_line1 ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-[#E5E7EB] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                />
                {validationErrors.client_address_line1 && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.client_address_line1}</p>
                )}
              </div>

              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Address 2
                </label>
                <input
                  type="text"
                  value={formData.client_address_line2 || ''}
                  onChange={(e) => onFormChange('client_address_line2', e.target.value)}
                  disabled={!isEditing || !!accountId}
                  placeholder="Apartment, suite, etc. (optional)"
                  className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            
            <div className="self-stretch flex justify-start items-start gap-5">
              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  ZIP Code (5 digits)<span className="text-red-600">*</span>
                  {isZipLoading && <span className="text-xs text-blue-600 ml-2">🔍 Looking up...</span>}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  value={formData.client_address_zip_code || ''}
                  onChange={(e) => handleZipCodeChange(e.target.value)}
                  disabled={!isEditing || !!accountId}
                  placeholder="e.g., 85001 (5 digits)"
                  className={`w-full h-11 px-3.5 py-2.5 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-slate-800 placeholder:text-[#9CA3AF] text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-100 disabled:cursor-not-allowed
                    ${validationErrors.client_address_zip_code || zipError ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}
                    ${zipAutoFilled && !validationErrors.client_address_zip_code ? 'bg-green-50 border-green-500 focus:border-green-500 focus:ring-green-100' : 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 hover:border-gray-400'}`}
                />
                {validationErrors.client_address_zip_code && <p className="text-xs text-red-600 mt-1">{validationErrors.client_address_zip_code}</p>}
                {zipError && <p className="text-xs text-red-600 mt-1">{zipError}</p>}
                {zipAutoFilled && !validationErrors.client_address_zip_code && <p className="text-xs text-green-600 mt-1">✓ City and State auto-filled</p>}
              </div>

              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  State<span className="text-red-600">*</span>
                  {!formData.client_address_state && accountId && (
                    <span className="text-amber-600 text-xs ml-2">(Missing - Please add)</span>
                  )}
                </label>
                <div className="relative w-full">
                  <select
                    value={formData.client_address_state || ''}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 disabled:opacity-100 disabled:cursor-not-allowed
                      ${validationErrors.client_address_state ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[#E5E7EB] focus:border-indigo-500 focus:ring-indigo-100'}
                      ${!formData.client_address_state && accountId ? 'border-amber-300' : ''}`}
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {validationErrors.client_address_state && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.client_address_state}</p>
                )}
                {!formData.client_address_state && accountId && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ State is missing. Please select a state to complete the address.</p>
                )}
              </div>

              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  City<span className="text-red-600">*</span>
                </label>
                {availableCities.length > 0 ? (
                  <div className="relative w-full">
                    <select
                      value={formData.client_address_city || ''}
                      onChange={(e) => handleFieldChange('client_address_city', e.target.value)}
                      disabled={!isEditing || !!accountId}
                      className={`w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 disabled:opacity-100 disabled:cursor-not-allowed
                        ${validationErrors.client_address_city ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[#E5E7EB] focus:border-indigo-500 focus:ring-indigo-100'}`}
                    >
                      <option value="">Select City</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.client_address_city || ''}
                    onChange={(e) => handleFieldChange('client_address_city', e.target.value)}
                    disabled={!isEditing || !!accountId}
                    placeholder="Enter city name"
                    className={`w-full h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-slate-800 placeholder:text-[#9CA3AF] text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 disabled:opacity-100 disabled:cursor-not-allowed
                      ${validationErrors.client_address_city ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-100'}`}
                  />
                )}
                {validationErrors.client_address_city && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.client_address_city}</p>
                )}
              </div>
            </div>

            
            <div className="self-stretch flex justify-start items-start gap-5">
              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Company website
                </label>
                <input
                  type="text"
                  value={formData.company_website || ''}
                  onChange={(e) => handleFieldChange('company_website', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://example.com"
                  className={`w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none disabled:opacity-100 disabled:cursor-not-allowed
                    ${validationErrors.company_website ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-[#E5E7EB] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                />
                {validationErrors.company_website && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.company_website}</p>
                )}
              </div>

              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Hosting area
                </label>
                <div className="relative w-full">
                  <select
                    value={formData.hosting_area || ''}
                    onChange={(e) => onFormChange('hosting_area', e.target.value)}
                    disabled={!isEditing}
                    className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight appearance-none transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Hosting Area</option>
                    {HOSTING_AREAS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79199 7.39581L10.0003 12.6041L15.2087 7.39581" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              
              <div className="w-28 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  MSA in place
                </label>
                <button
                  type="button"
                  onClick={() => isEditing && onFormChange('msa_in_place', !formData.msa_in_place)}
                  disabled={!isEditing}
                  className={`w-full h-11 px-3.5 py-2.5 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border flex items-center justify-center transition-all duration-200 ${
                    formData.msa_in_place 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-gray-50 border-gray-200'
                  } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                >
                  <span className={`text-xs font-semibold font-['Outfit'] leading-none uppercase ${
                    formData.msa_in_place ? 'text-[#10B981]' : 'text-gray-400'
                  }`}>
                    {formData.msa_in_place ? 'Yes' : 'No'}
                  </span>
                </button>
              </div>
            </div>

            
            <div className="self-stretch flex justify-start items-start gap-5">
              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  {accountId ? 'Updated By' : 'Created By'}
                </label>
                <div className="w-full h-11 px-3.5 py-2.5 bg-gray-100 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 flex items-center">
                  <span className="text-gray-600 text-sm font-medium font-['Outfit'] leading-tight">
                    {accountId 
                      ? (isEditing 
                          ? (user?.name || user?.email || 'Current User')
                          : (account?.updated_by_name || account?.created_by_name || 'Unknown')
                        )
                      : (account?.created_by_name || user?.name || user?.email || 'Current User')
                    }
                  </span>
                </div>
              </div>

              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  {accountId ? 'Date Updated' : 'Date Created'}
                </label>
                <div className="w-full h-11 px-3.5 py-2.5 bg-gray-100 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 flex items-center">
                  <span className="text-gray-600 text-sm font-medium font-['Outfit'] leading-tight">
                    {accountId && account?.updated_at
                      ? new Date(account.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : account?.created_at
                      ? new Date(account.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            
            <div className="self-stretch flex justify-start items-start gap-5">
              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Account Approver
                </label>
                {account?.account_approver ? (
                  <div className="w-full h-11 px-3.5 py-2.5 bg-blue-50 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-blue-200 flex items-center">
                    <span className="text-[#4361EE] text-sm font-semibold font-['Outfit'] leading-tight">
                      {account.account_approver}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-11 px-3.5 py-2.5 bg-gray-50 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-200 flex items-center">
                    <span className="text-gray-400 text-sm font-normal font-['Outfit'] leading-tight">
                      Not yet approved
                    </span>
                  </div>
                )}
              </div>

              
              <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                  Approval date & time
                </label>
                {account?.approval_date ? (
                  <div className="w-full h-11 px-3.5 py-2.5 bg-blue-50 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-blue-200 flex items-center">
                    <span className="text-slate-700 text-sm font-medium font-['Outfit'] leading-tight">
                      {new Date(account.approval_date).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-11 px-3.5 py-2.5 bg-gray-50 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-200 flex items-center">
                    <span className="text-gray-400 text-sm font-normal font-['Outfit'] leading-tight">
                      dd/mm/yyyy, --:-- --
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
        </div>

        
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
              onClick={handleSaveWithValidation}
              disabled={isUpdating}
              className="bg-[#0f0901] rounded-[16px] h-14 flex items-center justify-center px-8 py-2 min-w-[200px] ml-4"
            >
              <span className="font-inter font-medium text-white text-[14px] leading-[24px]">
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>
        )}
    </div>
  );
}
