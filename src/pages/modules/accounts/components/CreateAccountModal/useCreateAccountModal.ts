import { useState, useCallback, useEffect, useRef } from 'react';
import { validateForm } from './CreateAccountModal.schema';
import { INITIAL_FORM_DATA, US_STATES, WEBSITE_ANALYSIS_DELAY } from './CreateAccountModal.constants';
import { UseCreateAccountModalReturn, UIAccountFormData, UIAddressData } from './CreateAccountModal.types';
import { AccountCreate } from '@/types/accounts';
import { scraperApi, ApiError } from '@/services/api/scraperApi';
import { useToast } from '@/hooks/use-toast';

export function useCreateAccountModal(
  onSubmit: (data: AccountCreate) => void,
  onClose: () => void,
  backendErrors: Record<string, string> = {}
): UseCreateAccountModalReturn {
  const { toast } = useToast();
  const [formData, setFormData] = useState<UIAccountFormData>(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentWebsiteRef = useRef<string>('');

  const handleInputChange = useCallback((field: string, value: string | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [validationErrors]);

  // will optimize later - jhalak32
  const handleAddressChange = useCallback((field: keyof UIAddressData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      client_address: {
        ...prev.client_address,
        [field]: value,
      }
    }));
    
    const errorKey = `client_address.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  }, [validationErrors]);

  const handlePlaceSelect = useCallback((value: string, placeDetails?: google.maps.places.PlaceResult) => {
    // Update Address Line 1 with the selected address
    handleAddressChange('line1', value);
    
    if (placeDetails?.address_components) {
      const components = placeDetails.address_components;
      
      const streetNumber = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('street_number'))?.long_name || '';
      const route = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('route'))?.long_name || '';
      const sublocality = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('sublocality'))?.long_name;
      const locality = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('locality'))?.long_name;
      const pincode = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('postal_code'))?.long_name;
      const city = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('administrative_area_level_3'))?.long_name;
      const stateComponent = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('administrative_area_level_1'))?.long_name;

      const line1Components = [streetNumber, route].filter(Boolean);
      const line1 = line1Components.join(' ');
      if (line1) {
        handleAddressChange('line1', line1);
      }
      
      const premise = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('premise'))?.long_name;
      // temp solution by abhishek.softication
      const subpremise = components.find((c: google.maps.GeocoderAddressComponent) => 
        c.types.includes('subpremise'))?.long_name;
      
      const line2Components = [subpremise, premise, sublocality].filter(Boolean);
      if (line2Components.length > 0) {
        handleAddressChange('line2', line2Components.join(', '));
      }
      
      const cityValue = city || locality;
      if (cityValue) {
        handleAddressChange('city', cityValue);
      }
      
      if (stateComponent) {
        const matchedState = US_STATES.find(state => 
          state.toLowerCase() === stateComponent.toLowerCase()
        );
        if (matchedState) {
          handleAddressChange('state', matchedState);
        }
      }
      
      if (pincode) {
        const numericPincode = parseInt(pincode, 10);
        if (!isNaN(numericPincode)) {
          handleAddressChange('pincode', numericPincode);
        }
      }

      console.debug('CreateAccountModal: Address components extracted:', {
        line1,
        line2: line2Components.join(', '),
        city: cityValue,
        state: stateComponent,
        pincode: pincode ? parseInt(pincode, 10) : null
      });
    }
  }, [handleAddressChange]);

  const analyzeWebsite = useCallback(async (website: string) => {
    if (!website || !website.includes('.')) return;

    // Prevent duplicate analysis of the same website
    if (currentWebsiteRef.current === website) {
      return;
    }

    currentWebsiteRef.current = website;
    setIsAnalyzing(true);

    try {
      const scrapeResult = await scraperApi.scraper([website]);
      const result = scrapeResult.results[0];

      if (result.error) {
        throw new Error(`Scraping failed: ${result.error}`);
      }

      const info = result.info;

      if (info?.address) {
        const { line1, line2, city, state, pincode } = info.address;
        
        // Update address fields
        if (line1) {
          handleAddressChange('line1', line1);
        }
        if (line2) {
          handleAddressChange('line2', line2);
        }
        if (city) {
          handleAddressChange('city', city);
        }
        if (state) {
          const matchedState = US_STATES.find(usState => 
            usState.toLowerCase() === state.toLowerCase()
          );
          if (matchedState) {
            handleAddressChange('state', matchedState);
          }
        }
        if (pincode) {
          const numericPincode = parseInt(pincode, 10);
          if (!isNaN(numericPincode)) {
            handleAddressChange('pincode', numericPincode);
          }
        }
      }

      if (info?.name) {
        handleInputChange('client_name', info.name);
      }

      setShowAISuggestions(true);
      toast({
        title: '🔍 Website Analysis Complete',
        description: 'We auto-filled fields using real data from the website.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Scraper Error',
          description: `API error: ${error.detail?.[0]?.msg || 'Unknown error'}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Analysis Failed',
          description: (error as Error).message || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [handleInputChange, handleAddressChange, toast]);

  const handleWebsiteChange = useCallback((value: string) => {
    handleInputChange('company_website', value);

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
  }, [handleInputChange, analyzeWebsite]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors({});
    setIsSubmitting(false);
    setIsAnalyzing(false);
    setShowAISuggestions(false);
    currentWebsiteRef.current = '';
    
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newValidationErrors = validateForm(formData);
    
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert UI form data to backend format - keep state field
      const backendFormData = {
        ...formData,
        client_address: {
          line1: formData.client_address.line1,
          line2: formData.client_address.line2,
          city: formData.client_address.city,
          state: formData.client_address.state, // Keep state field for database
          pincode: formData.client_address.pincode,
        },
      } as AccountCreate;
      await onSubmit(backendFormData);
      // resetForm();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  useEffect(() => {
    if (Object.keys(backendErrors).length > 0) {
      setValidationErrors(backendErrors);
    }
  }, [backendErrors]);

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  const errors = { ...validationErrors };

  return {
    formData,
    errors,
    isSubmitting,
    isAnalyzing,
    showAISuggestions,
    handleInputChange,
    handleAddressChange,
    handlePlaceSelect,
    handleWebsiteChange,
    handleSubmit,
    handleClose,
    resetForm,
  };
}
