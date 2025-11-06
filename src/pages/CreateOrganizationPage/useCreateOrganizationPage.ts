import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDataEnrichment } from '@/hooks/useDataEnrichment';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/services/api/client';
import { authApi } from '@/services/api/authApi';
import { authManager } from '@/services/auth/AuthManager';
import { CreateOrgFormData } from '@/types/orgs';
import { FORM_DEFAULT_VALUES, WEBSITE_ANALYSIS_DELAY } from './CreateOrganizationPage.constants';
import { CreateOrganizationSchema, CreateOrganizationFormData } from './CreateOrganizationPage.schema';

// @author amar74.soft
export function useCreateOrganizationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, initialAuthComplete, isAuthenticated } = useAuth();
  const { createOrganization, isCreating: isSubmitting } = useOrganizations();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);

  const { enhanceAccountData, isLoading: isAILoading, error: aiError } = useDataEnrichment({
    autoApply: true,
    confidenceThreshold: 0.6,  // Lowered from 0.85 for better auto-apply
    onSuggestionReceived: (suggestion) => {
      console.log('🤖 AI Organization Enhancement received:', suggestion);
      console.log('Full suggestion object:', JSON.stringify(suggestion, null, 2));
      
      // Apply each suggestion to the form with logging
      let appliedCount = 0;
      if (suggestion.suggestions && Array.isArray(suggestion.suggestions)) {
        suggestion.suggestions.forEach((suggestionItem: any) => {
          if (suggestionItem.value) {
            console.log(`✅ Applying ${suggestionItem.field}: ${suggestionItem.value} (confidence: ${suggestionItem.confidence})`);
            applySuggestion(suggestionItem.field, suggestionItem.value);
            appliedCount++;
          }
        });
        console.log(`📊 Auto-applied ${appliedCount}/${suggestion.suggestions.length} organization fields`);
      } else {
        console.log('⚠️ No suggestions array in response');
      }
    },
    onError: (error) => {
      console.error('❌ AI Organization Enhancement Error:', error);
    }
  });
  
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentWebsiteRef = useRef<string>('');

  const form = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: {
      ...FORM_DEFAULT_VALUES,
      contact: {
        email: user?.email || '',
        phone: '',
      },
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const websiteValue = watch('website');

  // Apply AI suggestion to form fields
  const applySuggestion = useCallback((field: string, value: any) => {
    switch (field) {
      case 'company_name':
        setValue('name', value, { shouldValidate: true });
        break;
        
      case 'primary_contact':
        if (typeof value === 'object') {
          if (value.email) {
            setValue('contact.email', value.email, { shouldValidate: true });
          }
          if (value.phone) {
            setValue('contact.phone', value.phone, { shouldValidate: true });
          }
        }
        break;
        
      case 'address':
        if (typeof value === 'object') {
          if (value.line1 || value.street) {
            setValue('address.line1', value.line1 || value.street, { shouldValidate: true });
          }
          if (value.line2) {
            setValue('address.line2', value.line2, { shouldValidate: true });
          }
          if (value.city) {
            setValue('address.city', value.city, { shouldValidate: true });
          }
          if (value.state) {
            setValue('address.state', value.state, { shouldValidate: true });
          }
          if (value.pincode || value.zip) {
            setValue('address.pincode', Number(value.pincode || value.zip), { shouldValidate: true });
          }
        }
        break;
        
      case 'industry':
        break;
        
      // Legacy field names for backward compatibility
      case 'client_address':
        if (typeof value === 'object') {
          setValue('address', {
            line1: value.line1 || '',
            line2: value.line2 || '',
            city: value.city || '',
            pincode: value.pincode ? Number(value.pincode) : undefined,
          }, { shouldValidate: true });
        }
        break;
        
      case 'email':
      case 'contact_email':
        setValue('contact.email', value, { shouldValidate: true });
        break;
        
      case 'phone':
      case 'contact_phone':
        setValue('contact.phone', value, { shouldValidate: true });
        break;
      
      case 'company_size':
        // Store company size if needed (no form field for this currently)
        console.log('Company size:', value);
        break;
        
      default:
        console.log(`⚠️ Unknown field "${field}" - skipping`);
    }
  }, [setValue]);

  const analyzeWebsite = useCallback(async (website: string) => {
    if (!website || !website.includes('.')) return;

    // Prevent duplicate analysis of the same website
    if (currentWebsiteRef.current === website) {
      return;
    }

    currentWebsiteRef.current = website;
    setIsAnalyzing(true);
    setShowAISuggestions(false);
    setAiSuggestions(null);
    setAppliedSuggestions([]);

    try {
      // Call AI enhancement API
      const result = await enhanceAccountData(website, {
        client_name: form.getValues('name'),
        market_sector: 'Organization'
      });
      setAiSuggestions(result);
      setShowAISuggestions(true);

      const autoApplied: string[] = [];
      console.log('📥 Processing AI suggestions for organization:', result);
      
      // Lower threshold (0.6 instead of 0.85) for better auto-apply
      Object.entries(result.suggestions).forEach(([field, suggestion]: [string, any]) => {
        if (suggestion.confidence >= 0.6 && suggestion.value) {
          console.log(`✅ Auto-applying ${field}: ${suggestion.value} (confidence: ${suggestion.confidence})`);
          applySuggestion(field, suggestion.value);
          autoApplied.push(field);
        } else {
          console.log(`⚠️ Skipped ${field}: ${!suggestion.value ? 'empty value' : `low confidence (${suggestion.confidence})`}`);
        }
      });

      if (autoApplied.length > 0) {
        setAppliedSuggestions(autoApplied);
        toast({
          title: '🎉 AI Enhancement Complete',
          description: `Auto-filled ${autoApplied.length} fields with data from your website.`,
        });
        console.log(`📊 Auto-applied fields: ${autoApplied.join(', ')}`);
      } else {
        toast({
          title: '🔍 AI Analysis Complete',
          description: 'AI suggestions available but below confidence threshold. Check suggestions panel.',
        });
        console.log('⚠️ No fields met confidence threshold for auto-apply');
      }

    } catch (error) {
      let errorMessage = 'analyze failed';
      
      if (aiError) {
        errorMessage = aiError;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'AI Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [enhanceAccountData, applySuggestion, toast, form, aiError]);

  const handleWebsiteChange = useCallback((value: string) => {
    setValue('website', value, { shouldValidate: true });

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    if (value !== currentWebsiteRef.current) {
      setShowAISuggestions(false);
    }

    if (value.includes('.') && value.length > 5) {
      analysisTimeoutRef.current = setTimeout(() => {
        analyzeWebsite(value);
      }, WEBSITE_ANALYSIS_DELAY);
    }
  }, [setValue, analyzeWebsite]);

  const handleSubmitForm = useCallback(async (data: CreateOrganizationFormData) => {
    // Cancel any pending AI analysis when submitting
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = null;
    }
    
    // Add protocol to website if missing
    let website = data.website;
    if (website && website.trim() && !website.startsWith('http')) {
      website = `https://${website}`;
    }

    try {
      const organizationData: CreateOrgFormData = {
        name: data.name.trim(),
        address:
          data.address?.line1 || data.address?.line2 || data.address?.city || data.address?.pincode
            ? {
                line1: data.address.line1?.trim() || '',
                line2: data.address.line2?.trim() || undefined,
                city: data.address.city?.trim() || undefined,
                pincode: data.address.pincode || undefined,
              }
            : undefined,
        website: website?.trim() || undefined,
        contact:
          data.contact?.email || data.contact?.phone
            ? {
                email: data.contact.email?.trim() || undefined,
                phone: data.contact.phone?.trim() || undefined,
              }
            : undefined,
      };

      await createOrganization(organizationData);
      
      try {
        const updatedUserData = await authApi.getMe();
        authManager.setAuthState(true, updatedUserData);
        localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
        
        // Navigate to organization settings after creation
        navigate('/organization/settings', { replace: true });
      } catch (error) {
        window.location.href = '/organization/settings';
      }
    } catch (error) {
      // Error handling is done in the centralized hook
    }
  }, [createOrganization, navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      delete apiClient.defaults.headers.common['Authorization'];
      navigate('/auth/login', { replace: true });
    } catch (error) {
      // Still navigate to login even if sign out fails
      navigate('/auth/login', { replace: true });
    }
  }, [navigate]);

  // Event listeners for suggestions panel
  useEffect(() => {
    const handleHideSuggestions = () => {
      setShowAISuggestions(false);
    };

    const handleApplySuggestion = (event: CustomEvent) => {
      const { field, suggestion } = event.detail;
      if (!appliedSuggestions.includes(field)) {
        setAppliedSuggestions(prev => [...prev, field]);
      }
    };

    window.addEventListener('hideAISuggestions', handleHideSuggestions as EventListener);
    window.addEventListener('applySuggestion', handleApplySuggestion as EventListener);

    return () => {
      window.removeEventListener('hideAISuggestions', handleHideSuggestions as EventListener);
      window.removeEventListener('applySuggestion', handleApplySuggestion as EventListener);
    };
  }, [appliedSuggestions]);

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Form state
    form,
    control,
    errors,
    websiteValue,
    isSubmitting,
    isAnalyzing: isAnalyzing || isAILoading,
    showAISuggestions,
    aiSuggestions,
    appliedSuggestions,
    user,

    // Auth state
    isAuthLoading: !initialAuthComplete,
    isAuthenticated,

    handleSubmit: handleSubmit(handleSubmitForm),
    handleWebsiteChange,
    handleSignOut,
    applySuggestion,
  };
}
export default useCreateOrganizationPage;