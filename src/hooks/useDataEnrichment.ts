import { useState } from 'react';
import { apiClient, aiApiClient } from '@/services/api/client';

interface SuggestionOptions {
  autoApply?: boolean;
  confidenceThreshold?: number;
  onSuggestionReceived?: (suggestion: any) => void;
  onError?: (error: string) => void;
}

interface OrganizationNameSuggestion {
  suggested_name: string;
  confidence: number;
  alternatives: string[];
  source: string;
  reasoning?: string;
}

interface AccountEnhancement {
  enhanced_data: Record<string, {
    value: any;
    confidence: number;
    source: string;
    reasoning?: string;
    should_auto_apply: boolean;
  }>;
  processing_time_ms: number;
  warnings: string[];
  suggestions_applied: number;
}

interface AddressValidation {
  is_valid: boolean;
  issues: Array<{
    field: string;
    current_value?: string;
    suggested_value?: string;
    issue_type: string;
    confidence: number;
  }>;
  corrected_address: Record<string, string | null>;
  confidence: number;
}

interface IndustrySuggestion {
  suggested_industry: string;
  confidence: number;
  alternatives: string[];
  reasoning?: string;
}

export function useDataEnrichment(options: SuggestionOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clearError = () => setError(null);
  
  const suggestOrganizationName = async (
    websiteUrl: string, 
    context?: Record<string, string>
  ): Promise<OrganizationNameSuggestion> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/ai/suggest-organization-name', {
        website_url: websiteUrl,
        context: context || {}
      });
      
      const suggestion = response.data;
      
      if (options.autoApply && suggestion.confidence >= (options.confidenceThreshold || 0.8)) {
        options.onSuggestionReceived?.(suggestion);
      }
      
      return suggestion;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'get failed suggestion';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const enhanceAccountData = async (
    websiteUrl: string, 
    partialData: Record<string, any> = {},
    enhancementOptions: Record<string, boolean> = {}
  ): Promise<AccountEnhancement> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await aiApiClient.post('/ai/enhance-account-data', {
        company_website: websiteUrl,
        current_data: partialData, // Changed from partial_data to match backend schema
      });
      const result = response.data;
      
      if (!result || !result.enhanced_data) {
        throw new Error('Invalid response: missing enhanced_data');
      }
      
      const suggestions = result.enhanced_data;
      
      
      if (options.autoApply) {
        const autoAppliedSuggestions: any[] = [];
        
        Object.entries(suggestions).forEach(([field, suggestion]: [string, any]) => {
          if (suggestion.confidence >= (options.confidenceThreshold || 0.8)) {
            autoAppliedSuggestions.push({
              field,
              value: suggestion.value,
              confidence: suggestion.confidence
            });
          }
        });
        
        if (autoAppliedSuggestions.length > 0) {
          options.onSuggestionReceived?.({
            type: 'account_enhancement',
            suggestions: autoAppliedSuggestions,
            total_suggestions: Object.keys(suggestions).length
          });
        }
      }
      
      return {
        suggestions: suggestions,
        processing_time_ms: result.processing_time_ms,
        warnings: result.warnings || [],
        suggestions_applied: result.suggestions_applied || 0
      };
      
    } catch (err: any) {
      let errorMessage = 'enhance failed data';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Processing is taking longer than expected. Please try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateAddress = async (
    address: Record<string, string | null>,
    countryCode: string = 'US'
  ): Promise<AddressValidation> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/ai/validate-address', {
        address,
        country_code: countryCode
      });
      
      return response.data;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'validate failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const suggestIndustry = async (
    websiteUrl?: string,
    companyName?: string,
    description?: string
  ): Promise<IndustrySuggestion> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/ai/suggest-industry', {
        website_url: websiteUrl,
        company_name: companyName,
        description: description
      });
      
      const suggestion = response.data;
      
      if (options.autoApply && suggestion.confidence >= (options.confidenceThreshold || 0.8)) {
        options.onSuggestionReceived?.(suggestion);
      }
      
      return suggestion;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'suggest failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateContact = async (
    email?: string,
    phone?: string,
    name?: string
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/ai/validate-contact', {
        email,
        phone,
        name
      });
      
      return response.data;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'validate failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceOpportunityData = async (
    websiteUrl: string, 
    partialData: Record<string, any> = {}
  ): Promise<AccountEnhancement> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await aiApiClient.post('/ai/enhance-opportunity-data', {
        company_website: websiteUrl,
        current_data: partialData,
      });
      const result = response.data;
      
      if (!result || !result.enhanced_data) {
        throw new Error('Invalid response: missing enhanced_data');
      }
      
      const suggestions = result.enhanced_data;
      
      
      if (options.autoApply) {
        const autoAppliedSuggestions: any[] = [];
        
        Object.entries(suggestions).forEach(([field, suggestion]: [string, any]) => {
          if (suggestion.confidence >= (options.confidenceThreshold || 0.7)) {
            autoAppliedSuggestions.push({
              field,
              value: suggestion.value,
              confidence: suggestion.confidence
            });
          }
        });
        
        if (autoAppliedSuggestions.length > 0) {
          options.onSuggestionReceived?.({
            type: 'opportunity_enhancement',
            suggestions: autoAppliedSuggestions,
            total_suggestions: Object.keys(suggestions).length
          });
        }
      }
      
      return {
        enhanced_data: suggestions,
        processing_time_ms: result.processing_time_ms || 0,
        suggestions_applied: result.suggestions_applied || 0,
        warnings: result.warnings || []
      };
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Opportunity enhancement failed';
      setError(errorMsg);
      if (error.response?.status === 500) {
        return {
          enhanced_data: {
            opportunity_name: {
              value: 'AI-Enhanced Opportunity',
              confidence: 0.8,
              source: 'mock_data',
              reasoning: 'Mock data for development when API is unavailable',
              should_auto_apply: false
            },
            project_value: {
              value: '$2.5M',
              confidence: 0.6,
              source: 'mock_data',
              reasoning: 'Estimated based on typical project values',
              should_auto_apply: false
            },
            project_description: {
              value: 'This is a mock project description generated for development purposes when the AI API is unavailable.',
              confidence: 0.7,
              source: 'mock_data',
              reasoning: 'Generated mock description',
              should_auto_apply: false
            },
            location: {
              value: 'San Francisco, CA',
              confidence: 0.8,
              source: 'mock_data',
              reasoning: 'Common tech hub location',
              should_auto_apply: false
            },
            market_sector: {
              value: 'Technology',
              confidence: 0.7,
              source: 'mock_data',
              reasoning: 'Common sector for opportunities',
              should_auto_apply: false
            },
            sales_stage: {
              value: 'Qualification',
              confidence: 0.6,
              source: 'mock_data',
              reasoning: 'Typical early stage',
              should_auto_apply: false
            }
          },
          processing_time_ms: 1000,
          suggestions_applied: 0,
          warnings: ['AI API unavailable - showing mock data for development']
        };
      }
      
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkAIHealth = async (): Promise<any> => {
    try {
      const response = await apiClient.get('/ai/health');
      return response.data;
    } catch (err: any) {
      return { status: 'unavailable' };
    }
  };
  
  return {
    suggestOrganizationName,
    enhanceAccountData,
    enhanceOpportunityData,
    validateAddress,
    suggestIndustry,
    validateContact,
    checkAIHealth,
    
    isLoading,
    error,
    clearError,
    
    options
  };
}

export function useProgressiveEnhancement() {
  const [enhancementData, setEnhancementData] = useState<Record<string, any>>({});
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const { enhanceAccountData, isLoading } = useDataEnrichment({
    autoApply: false, // Manual control for progressive enhancement
    confidenceThreshold: 0.7
  });
  
  const enhanceWithContext = async (
    websiteUrl: string,
    currentFormData: Record<string, any>
  ) => {
    setIsEnhancing(true);
    
    try {
      const result = await enhanceAccountData(websiteUrl, currentFormData);
      
      setEnhancementData(result.enhanced_data);
      
      return result;
      
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const applySuggestion = (field: string) => {
    const suggestion = enhancementData[field];
    if (suggestion && suggestion.confidence >= 0.7) {
      return suggestion.value;
    }
    return null;
  };
  
  const getSuggestions = () => {
    return Object.entries(enhancementData).map(([field, suggestion]) => ({
      field,
      value: suggestion.value,
      confidence: suggestion.confidence,
      source: suggestion.source,
      reasoning: suggestion.reasoning,
      should_auto_apply: suggestion.should_auto_apply
    }));
  };
  
  const clearSuggestions = () => {
    setEnhancementData({});
  };
  
  return {
    enhanceWithContext,
    applySuggestion,
    getSuggestions,
    clearSuggestions,
    isEnhancing: isEnhancing || isLoading,
    hasSuggestions: Object.keys(enhancementData).length > 0
  };
}

export function useRealTimeValidation() {
  const [validationResults, setValidationResults] = useState<Record<string, any>>({});
  // TODO: need to fix this - harsh.pawar
  const [isValidating, setIsValidating] = useState(false);
  
  const { validateAddress, validateContact } = useDataEnrichment();
  
  const validateAddressRealTime = async (
    address: Record<string, string | null>,
    debounceMs: number = 1000
  ) => {
    setIsValidating(true);
    
    setTimeout(async () => {
      try {
        const result = await validateAddress(address);
        setValidationResults(prev => ({
          ...prev,
          address: result
        }));
      } catch (err) {
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);
  };
  
  const validateContactRealTime = async (
    email?: string,
    phone?: string,
    name?: string,
    debounceMs: number = 500
  ) => {
    setIsValidating(true);
    
    setTimeout(async () => {
      try {
        const result = await validateContact(email, phone, name);
        setValidationResults(prev => ({
          ...prev,
          contact: result
        }));
      } catch (err) {
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);
  };
  
  return {
    validateAddressRealTime,
    validateContactRealTime,
    validationResults,
    isValidating,
    clearValidationResults: () => setValidationResults({})
  };
}