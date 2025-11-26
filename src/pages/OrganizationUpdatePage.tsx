import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  House,
  CaretRight,
  Calendar,
  ShieldCheckered,
  Buildings,
  Globe,
  MapPin,
  Envelope,
  Phone,
  Sparkle,
} from 'phosphor-react';
import { useToast } from '@/hooks/useToast';
import { useMyOrganization, useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/hooks/useAuth';
import type { UpdateOrgFormData } from '@/types/orgs';
import image from '@/assets/image.png';
import { lookupByZipCode, getCitiesByState } from '@/utils/addressUtils';

const organizationUpdateSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name is too long'),
  website: z.union([
    z.string().url('Please enter a valid URL (e.g., https://example.com)'),
    z.literal(''),
  ]).optional(),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.number().min(10000, 'Zip code must be 5 digits').max(99999, 'Zip code must be 5 digits'),
  }),
  contact: z.object({
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
  }),
});

// US States list
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const COUNTRY_CODES = [
  { value: '+1', label: 'US (+1)', flag: '🇺🇸' },
  { value: '+91', label: 'IN (+91)', flag: '🇮🇳' },
  { value: '+44', label: 'UK (+44)', flag: '🇬🇧' },
  { value: '+61', label: 'AU (+61)', flag: '🇦🇺' },
  { value: '+86', label: 'CN (+86)', flag: '🇨🇳' },
];

export default function OrganizationUpdatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
    phone: '',
    countryCode: '+1', // Default to USA
  });

  // Track available cities based on selected state
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Track if form has been initialized to prevent infinite loops
  const initializedOrgId = useRef<string | null>(null);

  const organizationQuery = useMyOrganization();
  const { authState } = useAuth();
  const { updateOrganization, isUpdating } = useOrganizations();

  const organization = organizationQuery.data;
  const isLoading = organizationQuery.isLoading;
  const error = organizationQuery.error;

  type OrganizationUpdateFormData = z.infer<typeof organizationUpdateSchema>;

  const form = useForm<OrganizationUpdateFormData>({
    resolver: zodResolver(organizationUpdateSchema),
    mode: 'onChange', // Validate on change to show errors immediately
    defaultValues: {
      name: '',
      website: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: 0, // Default to 0 for number field
      },
      contact: {
        phone: '',
        email: '',
      },
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  // Update form when organization data is loaded (only once per organization)
  useEffect(() => {
    if (organization && organization.id !== initializedOrgId.current) {
      // Mark this organization as initialized
      initializedOrgId.current = organization.id;
      
      // Update both form and formData state
      // Important: Keep state as string value (not undefined) for proper Select display
      const stateValue = organization.address?.state;
      const normalizedState = stateValue && stateValue.trim() !== '' ? stateValue : undefined;
      
      const organizationData = {
        name: organization.name,
        website: organization.website || '',
        address: {
          line1: organization.address?.line1 || '',
          line2: organization.address?.line2 || '',
          city: organization.address?.city || '',
          state: normalizedState, // Use normalized state value
          pincode: organization.address?.pincode || 0,
        },
        contact: {
          phone: organization.contact?.phone || '',
          email: organization.contact?.email || '',
        },
      };

      form.reset(organizationData);
      
      // Trigger validation after loading data to show any missing required fields
      setTimeout(() => {
        form.trigger();
      }, 100);

      const phoneNumber = organization.contact?.phone || '';
      let countryCode = '+1'; // Default to USA
      let phoneWithoutCode = phoneNumber;
      
      if (phoneNumber && phoneNumber.trim()) {
        if (phoneNumber.startsWith('+')) {
          const match = phoneNumber.match(/^(\+\d{1,3})\s?(.*)$/);
          if (match) {
            countryCode = match[1];
            phoneWithoutCode = match[2] || '';
          }
        } else {
          phoneWithoutCode = phoneNumber;
        }
      }

      setFormData({
        organizationName: organization.name,
        website: organization.website || '',
        addressLine1: organization.address?.line1 || '',
        addressLine2: organization.address?.line2 || '',
        city: organization.address?.city || '',
        state: normalizedState || '', // Use normalized state (empty string for display if no value)
        pincode: organization.address?.pincode?.toString() || '',
        email: organization.contact?.email || '',
        phone: phoneWithoutCode,
        countryCode: countryCode,
      });
      
      if (normalizedState) {
        // temp solution by rose11
        const cities = getCitiesByState(normalizedState);
        setAvailableCities(cities);
      }
    }
  }, [organization, form]);

  // Redirect unauthorized users (vendors and admins can edit, super_admins cannot)
  useEffect(() => {
    if (!isLoading && authState.user && authState.user.role) {
      const allowedRoles = ['vendor', 'admin'];
      if (!allowedRoles.includes(authState.user.role)) {
        toast.error('You do not have permission to edit organization details.');
        navigate('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.user, isLoading, navigate]); // Removed 'toast' to prevent infinite loop

  const onSubmit = async (data: OrganizationUpdateFormData) => {
    if (!organization) {
      toast.error('Organization data not loaded');
      return;
    }

    try {
      // Debug logs removed for performance

      let fullPhoneNumber: string | undefined = undefined;
      if (data.contact?.phone) {
        const phoneValue = data.contact.phone.trim();
        if (phoneValue.startsWith('+')) {
          fullPhoneNumber = phoneValue;
        } else if (phoneValue) {
          fullPhoneNumber = `${formData.countryCode} ${phoneValue}`;
        }
      }

      const stateValue = data.address?.state || formData.state || undefined;
      const cityValue = data.address?.city || formData.city || undefined;

      const updateData: any = {
        name: data.name?.trim(),
        website: data.website?.trim() || undefined,
        address: {
          line1: data.address?.line1?.trim(),
          line2: data.address?.line2?.trim() || undefined,
          city: cityValue?.trim(),  // Send directly - no conversion
          state: stateValue?.trim(),  // Send directly - no conversion
          pincode: data.address?.pincode,
        },
        contact: {
          email: data.contact?.email?.trim(),
          phone: fullPhoneNumber || undefined,
        },
      };

      await updateOrganization({ orgId: organization.id, data: updateData });

      const { data: updatedOrg } = await organizationQuery.refetch();
      
      // Show success message
      toast.success('Organization updated successfully!', {
        description: 'Your changes have been saved.',
      });

      // If profile is complete (100%), redirect to dashboard after a short delay
      if (updatedOrg?.profile_completion === 100) {
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000); // 1 second delay to show the success message
      }
      // Otherwise, stay on page so user can complete remaining fields
    } catch (err: unknown) {
      // Error handling is already done in the centralized hook
    }
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Also update the react-hook-form state
    if (field === 'organizationName') {
      form.setValue('name', value);
    } else if (field === 'website') {
      form.setValue('website', value);
    } else if (field === 'addressLine1') {
      form.setValue('address.line1', value);
    } else if (field === 'addressLine2') {
      form.setValue('address.line2', value);
    } else if (field === 'city') {
      form.setValue('address.city', value);
    } else if (field === 'state') {
      form.setValue('address.state', value);
    } else if (field === 'pincode') {
      const numValue = value ? parseInt(value) : 0;
      form.setValue('address.pincode', numValue);
    } else if (field === 'email') {
      form.setValue('contact.email', value);
    } else if (field === 'phone') {
      form.setValue('contact.phone', value);
    }
  };

  const handleZipCodeChange = (zipCode: string) => {
    // Update the ZIP code field
    handleFormDataChange('pincode', zipCode);
    
    if (zipCode.length === 5) {
      const result = lookupByZipCode(zipCode);
      if (result) {
        form.setValue('address.city', result.city);
        form.setValue('address.state', result.stateCode);
        
        // Update formData
        setFormData(prev => ({
          ...prev,
          city: result.city,
          state: result.stateCode,
          pincode: zipCode,
        }));
        
        const cities = getCitiesByState(result.stateCode);
        setAvailableCities(cities);
        
        // Show success toast
        toast.success('Address Auto-filled', {
          description: `${result.city}, ${result.stateCode} detected from ZIP code`,
        });
      }
    }
  };

  const handleStateChange = (stateCode: string) => {
    form.setValue('address.state', stateCode);
    handleFormDataChange('state', stateCode);
    
    const cities = getCitiesByState(stateCode);
    setAvailableCities(cities);
    
    const currentCity = form.getValues('address.city');
    if (currentCity && !cities.includes(currentCity)) {
      form.setValue('address.city', '');
      handleFormDataChange('city', '');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] overflow-x-hidden">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED8A09]"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state or unauthorized user (only vendors and admins can access)
  if (error || !organization || !authState.user || !authState.user.role || !['vendor', 'admin'].includes(authState.user.role)) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] overflow-x-hidden">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="w-full max-w-[700px] mx-auto border border-red-200 bg-red-50 mt-8">
              <CardContent className="p-8 text-center">
                <div className="text-red-600 mb-4">
                  <h2 className="text-xl font-medium mb-2">
                    {authState.user?.role && !['vendor', 'admin'].includes(authState.user.role) 
                      ? 'Access Denied' 
                      : 'Organization Not Found'}
                  </h2>
                  <p className="text-sm">
                    {authState.user?.role && !['vendor', 'admin'].includes(authState.user.role)
                      ? 'Only organization members can edit organization details.'
                      : error?.message || 'Unable to load organization details'}
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-[#ED8A09] hover:bg-[#ED8A09]/90 text-white"
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F2] overflow-x-hidden">
      
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-sm text-gray-500 mb-8 flex flex-wrap gap-1 items-center">
            <House size={18} className="text-gray-700" />
            <CaretRight size={16} className="text-gray-700" />
            <span>Profile</span>
            <CaretRight size={16} className="text-gray-700" />
            <span>Organization Detail</span>
          </div>

          <Card className="w-full max-w-[700px] mx-auto rounded-2xl shadow-sm bg-white border border-gray-200">
            <CardContent className="p-8">
              
              <div className="w-full mb-8">
                <div className="flex justify-start items-start gap-3">
                  <div className="flex-1 flex flex-col justify-start items-start gap-3">
                    <h1 className="text-center justify-start text-slate-800 text-4xl font-semibold font-['Outfit'] leading-10">
                      {organization.name}
                    </h1>
                    <div className="self-stretch flex justify-between items-start">
                      <Badge className="px-2.5 py-0.5 bg-emerald-500/10 rounded-[999px] flex justify-center items-center">
                        <span className="text-center justify-start text-emerald-500 text-sm font-medium font-['Outfit'] leading-tight">
                          Active Organization
                        </span>
                      </Badge>
                      <div className="flex justify-start items-center gap-3">
                        <span className="justify-start text-neutral-400 text-sm font-medium font-['Outfit']">
                          Created on
                        </span>
                        <div className="flex justify-start items-center gap-3">
                          <Calendar size={20} className="text-[#0F0901]" />
                          <span className="justify-start text-[#0F0901] text-sm font-medium font-['Outfit']">
                            {organization.created_at ? formatDate(organization.created_at) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col justify-start items-start gap-5">
                  
                  <div className="self-stretch flex justify-start items-start gap-5">
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem className="w-72 flex flex-col justify-start items-start gap-1.5">
                          <div className="flex justify-start items-start gap-3">
                            <Label htmlFor="website" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                              Company Website<span className="text-red-600">*</span>
                            </Label>
                            <Badge className="pl-1.5 pr-2 py-0.5 bg-indigo-500 rounded-[999px] flex justify-center items-center gap-1">
                              <Sparkle className="h-3 w-3 text-white" />
                              <span className="text-white text-xs font-medium font-['Outfit'] leading-none">AI Enhanced</span>
                            </Badge>
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              id="website"
                              value={formData.website}
                              placeholder="https://your-company.com"
                              onChange={e => {
                                field.onChange(e.target.value);
                                handleFormDataChange('website', e.target.value);
                              }}
                              className={`self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-black text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0 ${
                                form.formState.errors.website ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="orgName" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            Organization Name<span className="text-red-600">*</span>
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="orgName"
                              value={formData.organizationName}
                              placeholder="Enter organization name"
                              onChange={e => {
                                field.onChange(e.target.value);
                                handleFormDataChange('organizationName', e.target.value);
                              }}
                              className={`self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-black text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0 ${
                                form.formState.errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  
                  <div className="self-stretch flex justify-start items-start gap-5">
                    
                    <FormField
                      control={form.control}
                      name="address.line1"
                      render={({ field }) => (
                        <FormItem className="w-72 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="addressLine1" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            Address 1<span className="text-red-600">*</span>
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="addressLine1"
                              value={formData.addressLine1}
                              placeholder="Enter address"
                              onChange={e => {
                                field.onChange(e.target.value);
                                handleFormDataChange('addressLine1', e.target.value);
                              }}
                              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    
                    <FormField
                      control={form.control}
                      name="address.line2"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="addressLine2" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            Address 2
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="addressLine2"
                              value={formData.addressLine2}
                              placeholder="Address (optional)"
                              onChange={e => {
                                field.onChange(e.target.value);
                                handleFormDataChange('addressLine2', e.target.value);
                              }}
                              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-gray-500 text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  
                  <div className="self-stretch flex justify-start items-start gap-5">
                    
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="city" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            City<span className="text-red-600">*</span>
                          </Label>
                          <Select
                            key={field.value || 'no-city'}
                            value={field.value || undefined}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleFormDataChange('city', value);
                            }}
                            disabled={isSubmitting || isUpdating || availableCities.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className={`self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-[#101828] text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus:ring-0 ${
                                form.formState.errors.address?.city ? 'border-red-500' : 'border-gray-300'
                              }`}>
                                <SelectValue placeholder={availableCities.length > 0 ? "Select City" : "Select state first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 bg-white">
                              {availableCities.map((city) => (
                                <SelectItem key={city} value={city} className="font-outfit">
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="state" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            State<span className="text-red-600">*</span>
                          </Label>
                          <Select
                            key={field.value || 'no-state'}
                            value={field.value || undefined}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleStateChange(value);
                            }}
                            disabled={isSubmitting || isUpdating}
                          >
                            <FormControl>
                              <SelectTrigger className={`self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-[#101828] text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus:ring-0 ${
                                form.formState.errors.address?.state ? 'border-red-500' : 'border-gray-300'
                              }`}>
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 bg-white">
                              {US_STATES.map((state) => (
                                <SelectItem key={state.value} value={state.value} className="font-outfit">
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    
                    <FormField
                      control={form.control}
                      name="address.pincode"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="pincode" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            Zip Code<span className="text-red-600">*</span>
                            <span className="ml-2 text-xs text-blue-600 font-normal">✨ Auto-fills city & state</span>
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="pincode"
                              type="number"
                              value={formData.pincode}
                              placeholder="Enter 5-digit ZIP code"
                              maxLength={5}
                              onChange={e => {
                                const value = e.target.value.slice(0, 5);
                                field.onChange(value ? parseInt(value) : undefined);
                                handleZipCodeChange(value);
                              }}
                              className={`self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-gray-500 text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0 ${
                                form.formState.errors.address?.pincode ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  
                  <div className="self-stretch flex justify-start items-center gap-5">
                    
                    <FormField
                      control={form.control}
                      name="contact.email"
                      render={({ field }) => (
                        <FormItem className="w-72 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="email" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            Email address<span className="text-red-600">*</span>
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="email"
                              type="email"
                              value={formData.email}
                              placeholder="example@gmail.com"
                              onChange={e => {
                                field.onChange(e.target.value);
                                handleFormDataChange('email', e.target.value);
                              }}
                              className={`self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-black text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0 ${
                                form.formState.errors.contact?.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                              }`}
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    
                    <FormField
                      control={form.control}
                      name="contact.phone"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="phone" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            Phone
                          </Label>
                          <div className="self-stretch flex gap-2">
                            
                            <Select
                              value={formData.countryCode}
                              onValueChange={(value) => {
                                setFormData(prev => ({ ...prev, countryCode: value }));
                              }}
                              disabled={isSubmitting || isUpdating}
                            >
                              <SelectTrigger className="w-32 h-11 px-3 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-[#101828] text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus:ring-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {COUNTRY_CODES.map((country) => (
                                  <SelectItem key={country.value} value={country.value} className="font-outfit">
                                    <span className="flex items-center gap-2">
                                      <span>{country.flag}</span>
                                      <span>{country.value}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            
                            <FormControl>
                              <Input
                                {...field}
                                id="phone"
                                value={formData.phone}
                                placeholder="(555) 123 4567"
                                onChange={e => {
                                  field.onChange(e.target.value);
                                  handleFormDataChange('phone', e.target.value);
                                }}
                                className="flex-1 h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-gray-500 text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                                disabled={isSubmitting || isUpdating}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  
                  <div className="self-stretch flex justify-start items-start gap-5">
                    <div className="flex-1 flex flex-col justify-start items-start gap-5">
                      <Button
                        type="button"
                        variant="outline"
                        className="self-stretch px-5 py-3.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-indigo-950 text-indigo-950 text-sm font-medium font-['Outfit'] leading-tight hover:bg-gray-50"
                        onClick={() => navigate('/organization')}
                        disabled={isSubmitting || isUpdating}
                      >
                        Cancel
                      </Button>
                    </div>
                    <div className="flex-1 flex flex-col justify-start items-start gap-5">
                      <Button
                        type="submit"
                        className="self-stretch flex-1 px-4 py-3 bg-indigo-950 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#4361EE] text-white text-sm font-medium font-['Outfit'] leading-tight hover:bg-indigo-900"
                        disabled={isSubmitting || isUpdating}
                      >
                        {isSubmitting || isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
