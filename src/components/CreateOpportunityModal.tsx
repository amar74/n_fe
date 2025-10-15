import { memo, useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Calendar, DollarSign, Building, Target, User, FileText, MapPin } from 'lucide-react';
import { accountsApi } from '../services/api/accountsApi';
import { AccountListItem } from '../types/accounts';
import { useAISuggestions } from '../hooks/useAISuggestions';

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
  projectValue: string;
  salesStage: string;
  marketSector: string;
  date: string;
  opportunityApprover: string;
  projectDescription: string;
}

export const CreateOpportunityModal = memo(({ isOpen, onClose, onSubmit }: CreateOpportunityModalProps) => {
  const [formData, setFormData] = useState<OpportunityFormData>({
    companyWebsite: '',
    opportunityName: '',
    selectedAccount: '',
    location: '',
    projectValue: '',
    salesStage: '',
    marketSector: '',
    date: '',
    opportunityApprover: '',
    projectDescription: '',
  });

  const [errors, setErrors] = useState<Partial<OpportunityFormData>>({});
  
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const [isAIEnhancing, setIsAIEnhancing] = useState(false);
  const [aiEnhancementError, setAiEnhancementError] = useState<string | null>(null);
  const [aiEnhancementResults, setAiEnhancementResults] = useState<any>(null);
  const [showEnhancementPanel, setShowEnhancementPanel] = useState(false);

  const { enhanceAccountData, enhanceOpportunityData, isLoading: isAILoading, error: aiError } = useAISuggestions({
    autoApply: true,
    confidenceThreshold: 0.7,
    onSuggestionReceived: (suggestion) => {
      const fieldMap: Record<string, keyof OpportunityFormData> = {
        'company_name': 'opportunityName',
        'client_name': 'opportunityName',
        'opportunity_name': 'opportunityName',
        'address': 'location',
        'location': 'location',
        'industry': 'marketSector',
        'market_sector': 'marketSector',
        'project_value': 'projectValue',
        'project_description': 'projectDescription',
        'sales_stage': 'salesStage'
      };

      suggestion.suggestions?.forEach((s: any) => {
        const field = fieldMap[s.field];
        if (field) setFormData(prev => ({ ...prev, [field]: s.value }));
      });
    },
    onError: (error) => setAiEnhancementError(error)
  });

  useEffect(() => {
    if (!isOpen) return;
    
    setIsAccountsLoading(true);
    accountsApi.listAccounts({ page: 1, size: 100 })
      .then(res => setAccounts(res.accounts || []))
      .catch(() => setAccountsError('Load failed'))
      .finally(() => setIsAccountsLoading(false));
  }, [isOpen]);

  const handleInputChange = (field: keyof OpportunityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
    } catch (err) {
      setAiEnhancementError('enhance failed. Please try again.');
    } finally {
      setIsAIEnhancing(false);
    }
  }, [formData.companyWebsite, formData.opportunityName, formData.location, formData.marketSector, formData.projectDescription, enhanceAccountData]);

  useEffect(() => {
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
  }, [formData.companyWebsite, isAIEnhancing, isAILoading, handleAIEnhancement]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        companyWebsite: '',
        opportunityName: '',
        selectedAccount: '',
        location: '',
        projectValue: '',
        salesStage: '',
        marketSector: '',
        date: '',
        opportunityApprover: '',
        projectDescription: '',
      });
      setErrors({});
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
      projectValue: '',
      salesStage: '',
      marketSector: '',
      date: '',
      opportunityApprover: '',
      projectDescription: '',
    });
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
                      {isAccountsLoading ? 'Loading accounts...' : 
                       accountsError ? 'Error loading accounts' :
                       accounts.length === 0 ? 'No accounts available' :
                       'Select Account'}
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
                      No accounts found. Please create an account first before creating opportunities.
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

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="Enter location"
                  />
                </div>
              </div>

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
            </div>
          </div>

          
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Opportunity Details</h3>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="w-1 h-6 bg-gradient-to-b from-amber-600 to-orange-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white ${
                      errors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Opportunity Approver
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.opportunityApprover}
                    onChange={(e) => handleInputChange('opportunityApprover', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400"
                    placeholder="Enter approver name"
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
                    {suggestion.value || 'No data available'}
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