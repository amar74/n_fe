import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, Calendar, DollarSign, Building, Target, User, FileText, MapPin } from 'lucide-react';
import { accountsApi } from '../services/api/accountsApi';
import { AccountListItem } from '../types/accounts';
import { useDataEnrichment } from '../hooks/useDataEnrichment';
import { useAuth } from '../hooks/useAuth';
import { loadGoogleMaps } from '@/lib/google-maps-loader';

type CreateOpportunityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OpportunityFormData) => void;
}

interface OpportunityFormData {
  companyWebsite: string;
  opportunityName: string;
  selectedAccount: string;
  location: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  projectValue: string;
  salesStage: string;
  marketSector: string;
  date: string;
  opportunityApprover: string;
  projectDescription: string;
}

export const CreateOpportunityModal = memo(({ isOpen, onClose, onSubmit }: CreateOpportunityModalProps) => {
  const { user } = useAuth();
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<OpportunityFormData>({
    companyWebsite: '',
    opportunityName: '',
    selectedAccount: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    projectValue: '',
    salesStage: '',
    marketSector: '',
    date: new Date().toISOString().split('T')[0], // Current date
    opportunityApprover: String(user?.name || user?.email || ''), // Current user
    projectDescription: '',
  });

  const [errors, setErrors] = useState<Partial<OpportunityFormData>>({});

  // Update opportunityApprover when user data loads or changes
  useEffect(() => {
    const userName = (user as any)?.name;
    const userEmail = user?.email || '';
    
    let approverName = '';
    if (userName && userName.trim()) {
      approverName = userName;
    } else if (userEmail) {
      approverName = userEmail;
    }
    
    if (approverName) {
      setFormData(prev => ({
        ...prev,
        opportunityApprover: approverName
      }));
    }
  }, [user]);
  
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const [isAIEnhancing, setIsAIEnhancing] = useState(false);
  const [aiEnhancementError, setAiEnhancementError] = useState<string | null>(null);
  const [aiEnhancementResults, setAiEnhancementResults] = useState<any>(null);
  const [showEnhancementPanel, setShowEnhancementPanel] = useState(false);
  const [isZipLookupLoading, setIsZipLookupLoading] = useState(false);
  const [hasAIRun, setHasAIRun] = useState(false); // Track if AI has already run

  const { enhanceAccountData, enhanceOpportunityData, isLoading: isAILoading, error: aiError } = useDataEnrichment({
    autoApply: true,
    confidenceThreshold: 0.7,
    onSuggestionReceived: (suggestion) => {
      // Only apply suggestions if AI hasn't run yet (prevents overwriting user selections)
      if (hasAIRun) return;
      
      console.log('🤖 AI Suggestions received:', suggestion);
      
      const fieldMap: Record<string, keyof OpportunityFormData> = {
        // Company/Client names
        'company_name': 'opportunityName',
        'client_name': 'opportunityName',
        'opportunity_name': 'opportunityName',
        
        // Location fields
        'address': 'location',
        'location': 'location',
        'city': 'city',
        'state': 'state',
        'zip_code': 'zipCode',
        'zipcode': 'zipCode',
        
        // Industry/Market sector
        'industry': 'marketSector',
        'market_sector': 'marketSector',
        
        // Project details
        'project_value': 'projectValue',
        'project_description': 'projectDescription',
        'description': 'projectDescription',
        
        // Sales stage
        'sales_stage': 'salesStage',
        'stage': 'salesStage'
      };

      if (suggestion.suggestions && Array.isArray(suggestion.suggestions)) {
        suggestion.suggestions.forEach((s: any) => {
          const targetField = fieldMap[s.field];
          if (targetField) {
            console.log(`✅ Applying ${s.field} → ${targetField}: ${s.value}`);
            setFormData(prev => ({ ...prev, [targetField]: s.value }));
          } else {
            console.log(`⚠️ No mapping for field: ${s.field}`);
          }
        });
      } else {
        console.log('⚠️ No suggestions array in response');
      }
    },
    onError: (error) => setAiEnhancementError(error)
  });

  useEffect(() => {
    if (!isOpen) return;
    
    setIsAccountsLoading(true);
    accountsApi.listAccounts({ page: 1, size: 100 })
      .then(res => {
        // Filter to show only approved accounts
        const approvedAccounts = (res.accounts || []).filter(account => 
          (account as any).approval_status === 'approved'
        );
        console.log(`[CreateOpportunity] Loaded ${approvedAccounts.length} approved accounts out of ${res.accounts?.length || 0} total`);
        setAccounts(approvedAccounts);
      })
      .catch(() => setAccountsError('Load failed'))
      .finally(() => setIsAccountsLoading(false));
  }, [isOpen]);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      if (!isOpen || !addressInputRef.current) return;
      
      try {
        await loadGoogleMaps({ libraries: ['places'] });
        
        // Verify Google Maps API and Places library are fully loaded
        if (
          addressInputRef.current && 
          typeof (window as any).google !== 'undefined' &&
          (window as any).google?.maps?.places?.Autocomplete
        ) {
          const autocomplete = new (window as any).google.maps.places.Autocomplete(addressInputRef.current, {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address'],
            types: ['address'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.address_components) return;

            let street = '';
            let city = '';
            let state = '';
            let zipCode = '';

            place.address_components.forEach((component: any) => {
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

            setFormData(prev => ({
              ...prev,
              address: street || place.formatted_address || '',
              city: city,
              state: state,
              zipCode: zipCode,
              location: `${city}, ${state}`,
            }));
          });
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    initAutocomplete();
  }, [isOpen]);

  // Auto-fetch city and state from ZIP code
  const fetchLocationFromZip = async (zipCode: string) => {
    if (zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) return;

    setIsZipLookupLoading(true);

    try {
      // Use Google Geocoding API
      if (typeof (window as any).google !== 'undefined') {
        const geocoder = new (window as any).google.maps.Geocoder();
        
        geocoder.geocode({ address: zipCode }, (results: any, status: any) => {
          setIsZipLookupLoading(false);
          
          if (status === 'OK' && results[0]) {
            let city = '';
            let state = '';

            results[0].address_components.forEach((component: any) => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
              }
            });

            if (city && state) {
              setFormData(prev => ({
                ...prev,
                city: city,
                state: state,
                location: `${city}, ${state}`,
              }));
              
              // Show success toast
              console.log(`✓ Found: ${city}, ${state}`);
            }
          } else {
            console.error('ZIP code not found');
          }
        });
      } else {
        setIsZipLookupLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch location from ZIP:', error);
      setIsZipLookupLoading(false);
    }
  };

  const handleInputChange = (field: keyof OpportunityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Auto-fetch city and state when ZIP code is entered
    if (field === 'zipCode' && value.length === 5 && /^\d{5}$/.test(value)) {
      fetchLocationFromZip(value);
    }
  };

  const handleAIEnhancement = useCallback(async () => {
    if (!formData.companyWebsite) {
      setAiEnhancementError('Please enter a company website first');
      return;
    }

    setIsAIEnhancing(true);
    setAiEnhancementError(null);

    try {
      const partialData = {
        client_name: formData.opportunityName,
        address: formData.location,
        industry: formData.marketSector,
        project_description: formData.projectDescription,
      };

      const result = await enhanceOpportunityData(formData.companyWebsite, partialData);
      
      setAiEnhancementResults(result);
      setShowEnhancementPanel(true);
      setHasAIRun(true); // Mark AI as completed
    } catch (err) {
      setAiEnhancementError('enhance failed. Please try again.');
    } finally {
      setIsAIEnhancing(false);
    }
  }, [formData.companyWebsite, formData.opportunityName, formData.location, formData.marketSector, formData.projectDescription, enhanceOpportunityData]);

  useEffect(() => {
    // Only run AI enhancement once - don't run if it already ran
    if (hasAIRun) return;
    
    if (formData.companyWebsite && formData.companyWebsite.trim() && 
        !formData.companyWebsite.includes('xyz.com') && 
        !isAIEnhancing && !isAILoading) {
      
      const urlPattern = /^https?:\/\/.+/;
      if (urlPattern.test(formData.companyWebsite)) {
        const timeoutId = setTimeout(() => {
          handleAIEnhancement();
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [formData.companyWebsite, isAIEnhancing, isAILoading, hasAIRun, handleAIEnhancement]);

  const validateForm = (): boolean => {
    const newErrors: Partial<OpportunityFormData> = {};

    if (!formData.companyWebsite.trim()) {
      newErrors.companyWebsite = 'Company Website is required';
    } else if (!/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i.test(formData.companyWebsite)) {
      newErrors.companyWebsite = 'Please enter a valid website URL';
    }
    
    if (!formData.opportunityName.trim()) {
      newErrors.opportunityName = 'Opportunity Name is required';
    }
    
    if (!formData.selectedAccount.trim()) {
      newErrors.selectedAccount = 'Account selection is required';
    } else if (formData.selectedAccount === '') {
      newErrors.selectedAccount = 'Please select a valid account from the dropdown';
    } else if (accounts.length === 0 && !isAccountsLoading) {
      newErrors.selectedAccount = 'No accounts available. Please create an account first.';
    }
    
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Combine address fields into location for submission
      const locationData = {
        ...formData,
        location: `${formData.city}, ${formData.state}`.replace(/^,\s*/, '') || formData.address,
      };
      
      onSubmit(locationData);
      setFormData({
        companyWebsite: '',
        opportunityName: '',
        selectedAccount: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        projectValue: '',
        salesStage: '',
        marketSector: '',
        date: new Date().toISOString().split('T')[0],
        opportunityApprover: String(user?.name || user?.email || ''),
        projectDescription: '',
      });
      setErrors({});
      setHasAIRun(false); // Reset AI flag for next time
      onClose();
    } else {
    }
  };

  const handleClose = () => {
    setErrors({});
    setFormData({
      companyWebsite: '',
      opportunityName: '',
      selectedAccount: '',
      location: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      projectValue: '',
      salesStage: '',
      marketSector: '',
      date: new Date().toISOString().split('T')[0],
      opportunityApprover: String(user?.name || user?.email || ''),
      projectDescription: '',
    });
    setHasAIRun(false); // Reset AI flag for next time
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl my-8 max-h-[calc(100vh-4rem)] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        <div className="relative px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Opportunity</h2>
                <p className="text-gray-600 text-sm font-medium mt-1">AI-powered opportunity creation and management</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto">
          <form id="opportunity-form" onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Company Website <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white ${
                    errors.companyWebsite ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="https://company.com"
                />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {aiEnhancementResults && (
                  <button
                    type="button"
                    onClick={() => setShowEnhancementPanel(!showEnhancementPanel)}
                    className="flex items-center gap-1 px-2 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition-all duration-200"
                  >
                    <Sparkles className="w-3 h-3" />
                    {showEnhancementPanel ? 'Hide Results' : 'Show Results'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAIEnhancement}
                  disabled={isAIEnhancing || isAILoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium rounded-md shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Sparkles className={`w-3 h-3 ${(isAIEnhancing || isAILoading) ? 'animate-spin' : ''}`} />
                  {isAIEnhancing || isAILoading ? 'Enhancing...' : 'AI Enhanced'}
                </button>
              </div>
              </div>
              {errors.companyWebsite && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.companyWebsite}
                </p>
              )}
              {aiEnhancementError && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {aiEnhancementError}
                </p>
              )}
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Opportunity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.opportunityName}
                  onChange={(e) => handleInputChange('opportunityName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white ${
                    errors.opportunityName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter opportunity name"
                />
                {errors.opportunityName && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.opportunityName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Select Account <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Required)</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.selectedAccount}
                    onChange={(e) => handleInputChange('selectedAccount', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white appearance-none cursor-pointer ${
                      errors.selectedAccount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={isAccountsLoading}
                  >
                    <option value="">
                      {isAccountsLoading ? 'Loading approved accounts...' : 
                       accountsError ? 'Error loading accounts' :
                       accounts.length === 0 ? 'No approved accounts available' :
                       'Select Approved Account'}
                    </option>
                    {accounts.map((account) => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.client_name}
                      </option>
                    ))}
                  </select>
                </div>
                {accounts.length === 0 && !isAccountsLoading && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm flex items-center gap-2">
                      <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                      No approved accounts found. Only approved accounts can be used for opportunities. Please create and approve an account first.
                    </p>
                  </div>
                )}
                {errors.selectedAccount && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.selectedAccount}
                  </p>
                )}
              </div>
            </div>

            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Address (Google Maps Autocomplete) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400 ${
                      errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Start typing address..."
                  />
                </div>
                {errors.address && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="State"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    ZIP Code
                    {isZipLookupLoading && (
                      <span className="ml-2 text-xs text-blue-600 italic">(Looking up...)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400"
                      placeholder="Enter ZIP code"
                      maxLength={5}
                    />
                    {isZipLookupLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 italic">Auto-fills city and state</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Project Value
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.projectValue}
                    onChange={(e) => handleInputChange('projectValue', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="$ X.XM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Market Sector
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.marketSector}
                    onChange={(e) => handleInputChange('marketSector', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400 appearance-none cursor-pointer"
                  >
                    <option value="">Select Sector</option>
                    <option value="transportation">Transportation</option>
                    <option value="technology">Technology</option>
                    <option value="energy">Energy</option>
                    <option value="utilities">Utilities</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="healthcare">Healthcare</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Opportunity Details</h3>
            </div>

            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Sales Stage
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.salesStage}
                  onChange={(e) => handleInputChange('salesStage', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400 appearance-none cursor-pointer"
                >
                  <option value="">Select Stage</option>
                  <option value="prospecting">Prospecting</option>
                  <option value="qualification">Qualification</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              </div>
            </div>
          </div>

          
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-600 to-orange-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Date <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Current Date)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Opportunity Approver
                  <span className="text-xs text-gray-500 ml-2">(Logged in user)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.opportunityApprover}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Loading user..."
                  />
                </div>
              </div>
            </div>

            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Project Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400 resize-none"
                  placeholder="Brief Project Description"
                />
              </div>
            </div>
          </div>

          
          {showEnhancementPanel && aiEnhancementResults && (
            <div className="mt-8 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">AI Enhancement Results</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {aiEnhancementResults.suggestions_applied || 0} Applied
                </span>
              </div>
              <button
                onClick={() => setShowEnhancementPanel(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiEnhancementResults.enhanced_data && Object.entries(aiEnhancementResults.enhanced_data).map(([field, suggestion]: [string, any]) => (
                <div
                  key={field}
                  className={`p-3 rounded-lg border ${
                    suggestion.should_auto_apply 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 capitalize">
                      {field.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        suggestion.should_auto_apply 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {suggestion.should_auto_apply ? 'Applied' : 'Suggested'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(suggestion.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-900 mb-2">
                    {typeof suggestion.value === 'object' && suggestion.value !== null 
                      ? JSON.stringify(suggestion.value) 
                      : (suggestion.value || 'No data available')}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <div className="mb-1">
                      <span className="font-medium">Source:</span> {suggestion.source}
                    </div>
                    <div>
                      <span className="font-medium">Reasoning:</span> {suggestion.reasoning}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {aiEnhancementResults.warnings && aiEnhancementResults.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {aiEnhancementResults.warnings.map((warning: string, index: number) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              Processing time: {aiEnhancementResults.processing_time_ms || 0}ms
            </div>
            </div>
          )}
          </form>
        </div>

        
        <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="font-medium">All fields marked with * are required</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="opportunity-form"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Create Opportunity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CreateOpportunityModal.displayName = 'CreateOpportunityModal';