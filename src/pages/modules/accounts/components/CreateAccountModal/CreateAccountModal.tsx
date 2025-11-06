import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, MapPin } from 'lucide-react';
import { MARKET_SECTORS, CLIENT_TYPES, HOSTING_AREAS, US_STATES, MSA_OPTIONS, STATE_ABBREVIATION_TO_NAME } from './CreateAccountModal.constants';
import { CreateAccountModalProps } from './CreateAccountModal.types';
import { lookupByZipCode, getCitiesByState } from '@/utils/addressUtils';
import { useAuth } from '@/hooks/useAuth';
import { useDataEnrichment } from '@/hooks/useDataEnrichment';
import { PlacesAutocomplete } from '@/components/ui/places-autocomplete';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';

const CLIENT_TYPE_DISPLAY: Record<string, string> = {
  'tier_1': 'Tier 1',
  'tier_2': 'Tier 2',
  'tier_3': 'Tier 3',
};

export function CreateAccountModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false,
  errors: backendErrors = {}
}: CreateAccountModalProps) {
  const { authState } = useAuth();
  const { toast } = useToast();
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const getUserName = () => {
    // First priority: Get name from user profile
    const userName = (authState.user as any)?.name;
    if (userName && userName.trim()) {
      return userName;
    }
    
    // Second priority: Extract from email
    const email = authState.user?.email || '';
    if (email && email.includes('@')) {
      const namePart = email.split('@')[0];
      return namePart; // Return as-is (e.g., "amar74.soft")
    }
    
    // Fallback to email
    if (email) {
      return email;
    }
    
    return 'Unknown User';
  };
  
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
    phone: '',
    market_sector: '',
    client_type: '',
    hosting_area: '',
    msa_in_place: false,
    created_by: getUserName(),
    created_at: currentDate,
  });

  // Update created_by when user data loads or changes
  useEffect(() => {
    // Get user name from auth state
    const userName = (authState.user as any)?.name;
    const email = authState.user?.email || '';
    
    let currentUserName = 'Unknown User';
    if (userName && userName.trim()) {
      currentUserName = userName;
    } else if (email && email.includes('@')) {
      currentUserName = email.split('@')[0];
    } else if (email) {
      currentUserName = email;
    }
    
    setFormData(prev => ({
      ...prev,
      created_by: currentUserName
    }));
  }, [authState.user]);

  const [isZipLoading, setIsZipLoading] = useState(false);
  const [zipAutoFilled, setZipAutoFilled] = useState(false);
  const [zipError, setZipError] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [primaryContactPhone, setPrimaryContactPhone] = useState<string>('');
  const [mainPhone, setMainPhone] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);
  
  // Phone number formatting for USA (13 digits: +1 XXX-XXX-XXXX)
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Limit to 11 digits (1 + 10 digits)
    const limitedNumber = phoneNumber.slice(0, 11);
    
    // Format as +1 XXX-XXX-XXXX
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 1) return `+${limitedNumber}`;
    if (limitedNumber.length <= 4) return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1)}`;
    if (limitedNumber.length <= 7) return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1, 4)}-${limitedNumber.slice(4)}`;
    return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1, 4)}-${limitedNumber.slice(4, 7)}-${limitedNumber.slice(7, 11)}`;
  };
  
  const handlePrimaryPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPrimaryContactPhone(formatted);
  };
  
  const handleMainPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setMainPhone(formatted);
  };

  const { enhanceAccountData, isLoading: isAILoading, error: aiError } = useDataEnrichment({
    autoApply: true,
    confidenceThreshold: 0.85,
    onSuggestionReceived: (suggestion) => {
      suggestion.suggestions.forEach((suggestionItem: any) => {
        applySuggestion(suggestionItem.field, suggestionItem.value);
      });
    },
    onError: (error) => {
      // Error handled
    }
  });

  // Handler for Google Places Autocomplete
  const handlePlaceSelect = (value: string, placeDetails?: google.maps.places.PlaceResult) => {
    console.log('Place selected:', value, placeDetails);
    
    if (!placeDetails || !placeDetails.address_components) {
      // User manually typed an address
      setFormData(prev => ({
        ...prev,
        client_address_line1: value,
      }));
      return;
    }

    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';

    placeDetails.address_components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        street = component.long_name + ' ';
      }
      if (types.includes('route')) {
        street += component.long_name;
      }
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
      if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    console.log('Parsed address:', { street, city, state, zipCode });

    // Update form with parsed address
    setFormData(prev => ({
      ...prev,
      client_address_line1: street || placeDetails.formatted_address || value,
      client_address_city: city,
      client_address_state: state,
      client_address_zip_code: zipCode,
    }));
    
    // Show success indicator for ZIP code
    if (zipCode) {
      setZipAutoFilled(true);
      setTimeout(() => setZipAutoFilled(false), 3000);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
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
  }, [isOpen]);

  const handleWebsiteAIEnhancement = async (websiteUrl: string) => {
    if (!websiteUrl || !websiteUrl.includes('.')) return;

    setIsAnalyzing(true);
    setShowAISuggestions(false);
    setAiSuggestions(null);
    setAppliedSuggestions([]);

    let scraperData: any = null;
    
    try {
      console.log('🔍 Starting data enrichment for:', websiteUrl);
      
      // Step 1: Use scraper to get basic data (address, contacts)
      try {
        const scraperResponse = await apiClient.post('/scraper/scrape', {
          urls: [websiteUrl]
        });
        
        if (scraperResponse.data?.results?.[0]?.info) {
          scraperData = scraperResponse.data.results[0].info;
          console.log('🎯 Scraper data received:', scraperData);
          
          // Auto-fill from scraper
          if (scraperData.name) {
            setFormData(prev => ({ ...prev, client_name: scraperData.name }));
          }
          
          // Fill address
          if (scraperData.address) {
            const addr = scraperData.address;
            setFormData(prev => ({
              ...prev,
              client_address_line1: addr.line1 || prev.client_address_line1,
              client_address_line2: addr.line2 || prev.client_address_line2,
              client_address_city: addr.city || prev.client_address_city,
              client_address_state: addr.state || prev.client_address_state,
              client_address_zip_code: addr.pincode || prev.client_address_zip_code,
            }));
            console.log('✅ Address auto-filled from scraper');
          }
          
          // Fill contacts
          if (scraperData.email && scraperData.email.length > 0) {
            setFormData(prev => ({ ...prev, email_address: scraperData.email[0] }));
            console.log('✅ Email auto-filled from scraper:', scraperData.email[0]);
          }
          
          if (scraperData.phone && scraperData.phone.length > 0) {
            const phone = scraperData.phone[0];
            setPrimaryContactPhone(phone);
            setMainPhone(phone);
            console.log('✅ Phone auto-filled from scraper:', phone);
          }
          
          toast({
            title: '🔍 Scraper Complete',
            description: 'Website data extracted successfully',
          });
        }
      } catch (scraperError) {
        console.warn('⚠️ Scraper failed, continuing with AI enhancement only:', scraperError);
      }

      // Step 2: Enhance with AI for additional fields (non-blocking)
      // Run AI enhancement in background, don't block if it fails
      enhanceAccountData(websiteUrl, {
        client_name: formData.client_name || scraperData?.name,
        market_sector: formData.market_sector
      })
      .then((result) => {
        setAiSuggestions(result);
        setShowAISuggestions(true);

        const autoApplied: string[] = [];
        console.log('🤖 AI Enhancement Results:', result);
        
        Object.entries(result.enhanced_data || {}).forEach(([field, suggestion]: [string, any]) => {
          if (suggestion.confidence >= 0.6) {
            console.log(`✅ Auto-applying ${field}: ${suggestion.value} (confidence: ${suggestion.confidence})`);
            applySuggestion(field, suggestion.value);
            autoApplied.push(field);
          } else {
            console.log(`⚠️ Skipped ${field}: low confidence (${suggestion.confidence})`);
          }
        });

        if (autoApplied.length > 0) {
          setAppliedSuggestions(autoApplied);
          console.log(`📊 Auto-applied ${autoApplied.length} AI fields`);
          toast({
            title: '✨ AI Enhancement Complete',
            description: `Successfully enriched ${autoApplied.length} additional fields`,
          });
        }
      })
      .catch((aiError: any) => {
        console.warn('⚠️ AI Enhancement failed (non-blocking):', aiError);
        // Don't show error toast for timeout - scraper already worked
        if (!aiError.message?.includes('timeout') && !aiError.message?.includes('longer than expected')) {
          toast({
            title: '⚠️ AI Enhancement Unavailable',
            description: 'Scraper data loaded successfully. AI enhancement is temporarily unavailable.',
            variant: 'default',
          });
        }
      })
      .finally(() => {
        setIsAnalyzing(false);
      });

    } catch (e: any) {
      console.error('❌ Scraper error:', e);
      // Only show error if scraper failed completely
      if (!scraperData) {
        toast({
          title: '❌ Data Extraction Failed',
          description: 'Could not extract data from the website. Please fill in the fields manually.',
          variant: 'destructive',
        });
      }
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (field: string, value: any) => {
    console.log(`📝 Applying suggestion for field "${field}":`, value);
    
    switch (field) {
      // Company/Client name variations
      case 'company_name':
      case 'client_name':
      case 'name':
        if (value) setFormData(prev => ({ ...prev, client_name: value }));
        break;
        
      // Industry/Market sector variations
      case 'industry':
      case 'market_sector':
      case 'sector':
        if (value) setFormData(prev => ({ ...prev, market_sector: value }));
        break;
        
      // Client type
      case 'client_type':
      case 'tier':
        if (value) setFormData(prev => ({ ...prev, client_type: value }));
        break;
        
      // Hosting area
      case 'hosting_area':
      case 'region':
        if (value) setFormData(prev => ({ ...prev, hosting_area: value }));
        break;
        
      // Primary contact
      case 'primary_contact':
      case 'contact_name':
        if (typeof value === 'object') {
          if (value.name) setFormData(prev => ({ ...prev, primary_contact: value.name }));
          if (value.email) setFormData(prev => ({ ...prev, email_address: value.email }));
          if (value.phone) {
            setPrimaryContactPhone(value.phone);
            setMainPhone(value.phone);
          }
        } else if (value) {
          setFormData(prev => ({ ...prev, primary_contact: value }));
        }
        break;
        
      // Email
      case 'email':
      case 'email_address':
      case 'contact_email':
        if (value) setFormData(prev => ({ ...prev, email_address: value }));
        break;
        
      // Phone
      case 'phone':
      case 'phone_number':
      case 'contact_phone':
        if (value) {
          setPrimaryContactPhone(value);
          setMainPhone(value);
        }
        break;
        
      // Address (object or individual fields)
      case 'address':
        if (typeof value === 'object') {
          setFormData(prev => ({
            ...prev,
            client_address_line1: value.line1 || value.street || value.address || prev.client_address_line1,
            client_address_line2: value.line2 || prev.client_address_line2,
            client_address_city: value.city || prev.client_address_city,
            client_address_state: value.state || prev.client_address_state,
            client_address_zip_code: value.pincode || value.zip || value.zipcode || prev.client_address_zip_code
          }));
        }
        break;
        
      // Individual address fields
      case 'street_address':
      case 'address_line1':
      case 'line1':
        if (value) setFormData(prev => ({ ...prev, client_address_line1: value }));
        break;
        
      case 'address_line2':
      case 'line2':
        if (value) setFormData(prev => ({ ...prev, client_address_line2: value }));
        break;
        
      case 'city':
        if (value) setFormData(prev => ({ ...prev, client_address_city: value }));
        break;
        
      case 'state':
        if (value) setFormData(prev => ({ ...prev, client_address_state: value }));
        break;
        
      case 'zip_code':
      case 'zipcode':
      case 'zip':
      case 'postal_code':
        if (value) setFormData(prev => ({ ...prev, client_address_zip_code: value }));
        break;
        
      default:
        console.log(`⚠️ Unknown field "${field}" - skipping`);
    }
  };

  const handleClose = () => {
    setFormData({
      company_website: '',
      client_name: '',
      client_address_line1: '',
      client_address_line2: '',
      client_address_city: '',
      client_address_state: '',
      client_address_zip_code: '',
      primary_contact: '',
      email_address: '',
      phone: '',
      market_sector: '',
      client_type: '',
      hosting_area: '',
      msa_in_place: false,
      created_by: getUserName(),
      created_at: currentDate,
    });
    setPrimaryContactPhone('');
    setMainPhone('');
    setIsZipLoading(false);
    setZipAutoFilled(false);
    setZipError('');
    setAvailableCities([]);
    setShowAISuggestions(false);
    setAiSuggestions(null);
    setAppliedSuggestions([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = {
      ...formData,
      phone: mainPhone || formData.phone,
      primary_contact_phone: primaryContactPhone
    };
    onSubmit(submitData as any);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleZipCodeChange = async (zipCode: string) => {
    // Allow digits and hyphen, max 10 characters total
    let cleanedZip = zipCode.replace(/[^\d-]/g, '');
    
    // Auto-format: If user types 5 digits and continues, auto-add hyphen
    // e.g., "730015" becomes "73001-5"
    if (cleanedZip.length === 6 && !cleanedZip.includes('-')) {
      cleanedZip = cleanedZip.slice(0, 5) + '-' + cleanedZip.slice(5);
    }
    
    // Limit to 10 characters max (12345-6789)
    cleanedZip = cleanedZip.slice(0, 10);
    
    setFormData(prev => ({ ...prev, client_address_zip_code: cleanedZip }));
    
    setZipAutoFilled(false);
    setZipError('');

    // Extract just digits for validation
    const digitsOnly = cleanedZip.replace(/\D/g, '');

    // Show helpful hints but don't block typing
    if (digitsOnly.length > 0 && digitsOnly.length < 5) {
      setZipError('USA ZIP code needs at least 5 digits');
      setAvailableCities([]);
      return;
    }

    // Only trigger auto-lookup for valid complete formats
    const isValid5Digit = /^\d{5}$/.test(cleanedZip);
    const isValidZipPlus4 = /^\d{5}-\d{4}$/.test(cleanedZip);

    // Allow typing but only auto-fill when format is complete
    if (!isValid5Digit && !isValidZipPlus4) {
      setAvailableCities([]);
      return;
    }

    setIsZipLoading(true);
    
    try {
      const result = await lookupByZipCode(cleanedZip);
      
      if (result) {
        const stateFullName = STATE_ABBREVIATION_TO_NAME[result.stateCode] || result.stateCode;
        
        const cities = getCitiesByState(result.stateCode);
        setAvailableCities(cities);
        
        setFormData(prev => ({
          ...prev,
          client_address_city: result.city,
          client_address_state: stateFullName
        }));
        setZipAutoFilled(true);
        setZipError('');
      } else {
        setZipError('Invalid ZIP code or location not found');
        setZipAutoFilled(false);
        setAvailableCities([]);
      }
    } catch (error) {
      console.error('ZIP lookup error:', error);
      setZipError('Failed to lookup ZIP code');
      setZipAutoFilled(false);
      setAvailableCities([]);
    } finally {
      setIsZipLoading(false);
    }
  };

  const handleStateChange = (stateFullName: string) => {
    handleInputChange('client_address_state', stateFullName);
    
    const stateCode = Object.entries(STATE_ABBREVIATION_TO_NAME)
      .find(([_, fullName]) => fullName === stateFullName)?.[0];
    
    if (stateCode) {
      const cities = getCitiesByState(stateCode);
      setAvailableCities(cities);
      
      if (formData.client_address_city && !cities.includes(formData.client_address_city)) {
        handleInputChange('client_address_city', '');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .phone-input-custom {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .phone-input-custom .PhoneInputCountry {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          pointer-events: all;
        }
        .phone-input-custom .PhoneInputCountrySelect {
          border: none;
          background: transparent;
          padding: 0;
          margin: 0;
          cursor: pointer;
          font-size: 0;
        }
        .phone-input-custom .PhoneInputCountrySelect:focus {
          outline: none;
        }
        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.5em;
          height: 1.125em;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        .phone-input-custom .PhoneInputCountrySelectArrow {
          opacity: 0.5;
          width: 0.3em;
          height: 0.3em;
          margin-left: 2px;
        }
        .phone-input-custom .PhoneInputInput {
          padding-left: 68px !important;
          height: 48px;
        }
        .phone-input-custom input {
          width: 100%;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        
        <div 
          className="w-full max-w-[900px] p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="self-stretch flex justify-between items-center pb-2">
            <div>
              <h2 className="text-slate-800 text-3xl font-semibold font-['Outfit'] leading-tight">
                Create New Account
              </h2>
              <p className="text-gray-500 text-sm font-normal font-['Outfit'] mt-1">
                Fill in the details below to add a new account to your portfolio
              </p>
            </div>
            <button
              onClick={handleClose}
              className="size-9 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="size-5 text-gray-500" />
            </button>
          </div>

          
          <div className="self-stretch h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

          
          <form onSubmit={handleSubmit} className="self-stretch flex flex-col gap-6">
            
            <div className="self-stretch">
              <h3 className="text-gray-900 text-lg font-semibold font-['Outfit'] leading-tight mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Business Information
              </h3>
              
              
              <div className="self-stretch flex gap-5">
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                      Company Website<span className="text-red-600 ml-0.5">*</span>
                    </label>
                    <div className="px-2 py-0.5 bg-indigo-500 rounded-[999px] flex items-center gap-1">
                      <Sparkles className="size-3 text-white" />
                      <span className="text-white text-xs font-medium font-['Outfit'] leading-none">AI Enhanced</span>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={formData.company_website}
                    onChange={(e) => handleInputChange('company_website', e.target.value)}
                    onBlur={(e) => handleWebsiteAIEnhancement(e.target.value)}
                    className={`h-12 px-4 py-2.5 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all ${
                      isAnalyzing || isAILoading ? 'bg-blue-50 border-blue-300' : 
                      showAISuggestions ? 'bg-green-50 border-green-300' : 
                      'bg-white border-gray-300'
                    }`}
                    placeholder="https://company.com"
                    disabled={isAnalyzing || isAILoading}
                  />
                  {(isAnalyzing || isAILoading) && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>AI analyzing website...</span>
                    </div>
                  )}
                  {aiError && (
                    <span className="text-red-600 text-xs mt-1">AI enhancement failed: {aiError}</span>
                  )}
                  {backendErrors['company_website'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['company_website']}</span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Client Name<span className="text-red-600 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Megapolis"
                  />
                  {backendErrors['client_name'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['client_name']}</span>
                  )}
                </div>
              </div>
            </div>

            
            <div className="self-stretch">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 text-lg font-semibold font-['Outfit'] leading-tight flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="text-xs font-semibold text-blue-700">USA Only</span>
                </div>
              </div>
              
              
              <div className="self-stretch flex gap-5 mb-5">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Address 1<span className="text-red-600 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <PlacesAutocomplete
                      value={formData.client_address_line1}
                      onChange={handlePlaceSelect}
                      placeholder="Start typing address..."
                      className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  {backendErrors['client_address_line1'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['client_address_line1']}</span>
                  )}
                  <p className="text-xs text-gray-500">💡 Type to see address suggestions or enter manually</p>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Address 2 <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.client_address_line2}
                    onChange={(e) => handleInputChange('client_address_line2', e.target.value)}
                    className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
              </div>

              
              <div className="self-stretch mb-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                      Zip Code<span className="text-red-600 ml-0.5">*</span>
                    </label>
                    {isZipLoading && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-full">
                        <div className="animate-spin h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        <span className="text-xs font-medium text-indigo-600">Fetching location...</span>
                      </div>
                    )}
                    {zipAutoFilled && !isZipLoading && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full animate-fadeIn">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium text-green-600">Location found!</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.client_address_zip_code}
                      onChange={(e) => handleZipCodeChange(e.target.value)}
                      maxLength={10}
                      className={`h-12 px-4 py-2.5 pr-10 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-black text-sm font-normal font-['Outfit'] leading-tight placeholder:text-[#667085] focus:outline-none transition-all ${
                        zipAutoFilled 
                          ? 'bg-green-50 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100' 
                          : zipError 
                          ? 'bg-red-50 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                      }`}
                      placeholder="e.g., 90210 or 90210-1234"
                    />
                    {zipAutoFilled && !isZipLoading ? (
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 size-5" />
                    )}
                  </div>
                  {zipError && (
                    <span className="text-red-600 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {zipError}
                    </span>
                  )}
                  {backendErrors['client_address_zip_code'] && (
                    <span className="text-red-600 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {backendErrors['client_address_zip_code']}
                    </span>
                  )}
                  {!zipError && !backendErrors['client_address_zip_code'] && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-indigo-600 flex items-center gap-1">
                        <Sparkles className="size-3" />
                        Auto-fills city & state
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">Supports all USA ZIP codes</span>
                    </div>
                  )}
                </div>
              </div>

              
              <div className="self-stretch flex gap-5">
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                      City<span className="text-red-600 ml-0.5">*</span>
                    </label>
                    {zipAutoFilled && formData.client_address_city && (
                      <span className="text-xs text-green-600 flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-full">
                        ✨ Auto-filled
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={formData.client_address_city}
                      onChange={(e) => handleInputChange('client_address_city', e.target.value)}
                      disabled={availableCities.length === 0}
                      className={`h-12 px-4 py-2.5 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                        zipAutoFilled && formData.client_address_city
                          ? 'bg-green-50 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                          : 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: zipAutoFilled && formData.client_address_city ? 'right 2rem center' : 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: zipAutoFilled && formData.client_address_city ? '3.5rem' : '2.5rem',
                      }}
                    >
                      <option value="">
                        {availableCities.length > 0 ? 'Select City' : 'Enter ZIP code or select state first'}
                      </option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {zipAutoFilled && formData.client_address_city && (
                      <svg className="absolute right-8 top-1/2 -translate-y-1/2 text-green-500 size-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {backendErrors['client_address_city'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['client_address_city']}</span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                      State<span className="text-red-600 ml-0.5">*</span>
                    </label>
                    {zipAutoFilled && formData.client_address_state && (
                      <span className="text-xs text-green-600 flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-full">
                        ✨ Auto-filled
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.client_address_state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={isZipLoading}
                    className={`h-12 px-4 py-2.5 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      zipAutoFilled && formData.client_address_state
                        ? 'bg-green-50 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                        : 'bg-[#FAFAF8] border-[#E5E7EB] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {backendErrors['client_address_state'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['client_address_state']}</span>
                  )}
                </div>
              </div>
            </div>

            
            <div className="self-stretch">
              <h3 className="text-gray-900 text-lg font-semibold font-['Outfit'] leading-tight mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Contact Information
              </h3>
              
              
              <div className="self-stretch flex gap-5 mb-5">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Primary Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.primary_contact}
                    onChange={(e) => handleInputChange('primary_contact', e.target.value)}
                    className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Email Address<span className="text-red-600 ml-0.5">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email_address}
                    onChange={(e) => handleInputChange('email_address', e.target.value)}
                    className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="example@company.com"
                  />
                  {backendErrors['email_address'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['email_address']}</span>
                  )}
                </div>
              </div>

              
              <div className="self-stretch flex gap-5">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Primary Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={primaryContactPhone}
                    onChange={handlePrimaryPhoneChange}
                    placeholder="+1 555-555-5555"
                    maxLength={16}
                    className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all w-full"
                  />
                  <p className="text-xs text-gray-500">Format: +1 XXX-XXX-XXXX (13 digits total)</p>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Company Phone<span className="text-red-600 ml-0.5">*</span>
                  </label>
                  <input
                    type="tel"
                    value={mainPhone}
                    onChange={handleMainPhoneChange}
                    placeholder="+1 555-555-5555"
                    maxLength={16}
                    required
                    className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all w-full"
                  />
                  {backendErrors['phone'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['phone']}</span>
                  )}
                  <p className="text-xs text-gray-500">Format: +1 XXX-XXX-XXXX (13 digits total)</p>
                </div>
              </div>
            </div>

            
            <div className="self-stretch">
              <h3 className="text-gray-900 text-lg font-semibold font-['Outfit'] leading-tight mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Business Classification
              </h3>
              
              
              <div className="self-stretch flex gap-5 mb-5">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Client Market Sector<span className="text-red-600 ml-0.5">*</span>
                  </label>
                  <select
                    value={formData.market_sector}
                    onChange={(e) => handleInputChange('market_sector', e.target.value)}
                    className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="">Select Sector</option>
                    {MARKET_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                  {backendErrors['market_sector'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['market_sector']}</span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Client Type<span className="text-red-600 ml-0.5">*</span>
                  </label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => handleInputChange('client_type', e.target.value)}
                    className="h-12 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="">Select Type</option>
                    {CLIENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {CLIENT_TYPE_DISPLAY[type] || type}
                      </option>
                    ))}
                  </select>
                  {backendErrors['client_type'] && (
                    <span className="text-red-600 text-xs mt-1">{backendErrors['client_type']}</span>
                  )}
                </div>
              </div>

              
              <div className="self-stretch flex gap-5">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Hosting Area/Office <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <select
                    value={formData.hosting_area}
                    onChange={(e) => handleInputChange('hosting_area', e.target.value)}
                    className="h-12 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="">Select Area</option>
                    {HOSTING_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    MSA in Place
                  </label>
                  <select
                    value={formData.msa_in_place ? 'Yes' : 'No'}
                    onChange={(e) => handleInputChange('msa_in_place', e.target.value === 'Yes')}
                    className="h-12 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    {MSA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              
              <div className="self-stretch flex gap-5">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Created By
                  </label>
                  <input
                    type="text"
                    value={formData.created_by}
                    disabled
                    className="h-12 px-4 py-2.5 bg-gray-100 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-gray-600 text-sm font-normal font-['Outfit'] leading-tight cursor-not-allowed"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                    Date Created
                  </label>
                  <input
                    type="text"
                    value={formData.created_at}
                    disabled
                    className="h-12 px-4 py-2.5 bg-gray-100 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-gray-600 text-sm font-normal font-['Outfit'] leading-tight cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            
            {showAISuggestions && aiSuggestions && (
              <div className="self-stretch bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900">AI Suggestions</h3>
                      <p className="text-sm text-purple-700">
                        Found {Object.keys(aiSuggestions?.suggestions || {}).length} suggestions 
                        ({appliedSuggestions.length} auto-applied)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAISuggestions(false);
                      setAiSuggestions(null);
                    }}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Hide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(aiSuggestions?.suggestions || {}).map(([field, suggestion]: [string, any]) => (
                    <div
                      key={field}
                      className={`p-4 rounded-lg border-2 ${
                        appliedSuggestions.includes(field)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-purple-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 capitalize">
                            {field.replace('_', ' ')}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                            suggestion.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {(suggestion.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            applySuggestion(field, suggestion.value);
                            setAppliedSuggestions(prev => [...prev, field]);
                          }}
                          disabled={appliedSuggestions.includes(field)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            appliedSuggestions.includes(field)
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {appliedSuggestions.includes(field) ? 'Applied' : 'Apply'}
                        </button>
                      </div>

                      <div className="text-sm text-gray-700 mb-2">
                        {typeof suggestion.value === 'object' && suggestion.value !== null ? (
                          <div className="space-y-1">
                            {Object.entries(suggestion.value).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          String(suggestion.value || '')
                        )}
                      </div>

                      {suggestion.reasoning && (
                        <p className="text-xs text-gray-600 italic">
                          {suggestion.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {aiSuggestions.warnings && aiSuggestions.warnings.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {aiSuggestions.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            
            <div className="self-stretch flex justify-end items-center gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-300 text-gray-700 text-sm font-semibold font-['Outfit'] leading-tight hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-lg shadow-slate-300 text-white text-sm font-semibold font-['Outfit'] leading-tight hover:from-slate-900 hover:to-black hover:shadow-xl hover:shadow-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
