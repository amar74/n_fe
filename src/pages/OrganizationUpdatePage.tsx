import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
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
  });

  // Use centralized hooks following Development.md patterns
  const organizationQuery = useMyOrganization();
  const { authState } = useAuth();
  const { updateOrganization, isUpdating } = useOrganizations();

  const organization = organizationQuery.data;
  const isLoading = organizationQuery.isLoading;
  const error = organizationQuery.error;

  const form = useForm<UpdateOrgFormData>({
    defaultValues: {
      name: '',
      website: '',
      address: {
        line1: '',
        line2: '',
        pincode: undefined,
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

  // Update form when organization data is loaded
  useEffect(() => {
    if (organization) {
      // Update both form and formData state
      const organizationData = {
        name: organization.name,
        website: organization.website || '',
        address: {
          line1: organization.address?.line1 || '',
          line2: organization.address?.line2 || '',
          city: organization.address?.city || '',
          state: organization.address?.state || '',
          pincode: organization.address?.pincode || undefined,
        },
        contact: {
          phone: organization.contact?.phone || '',
          email: organization.contact?.email || '',
        },
      };

      form.reset(organizationData);

      setFormData({
        organizationName: organization.name,
        website: organization.website || '',
        addressLine1: organization.address?.line1 || '',
        addressLine2: organization.address?.line2 || '',
        city: organization.address?.city || '',
        state: organization.address?.state || '',
        pincode: organization.address?.pincode?.toString() || '',
        email: organization.contact?.email || '',
        phone: organization.contact?.phone || '',
      });
    }
  }, [organization, form]);

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && authState.user && authState.user.role !== 'admin') {
      toast.error('Only administrators can edit organization details.');
      navigate('/organization');
    }
  }, [authState.user, isLoading, navigate, toast]);

  const onSubmit = async (data: UpdateOrgFormData) => {
    if (!organization) {
      toast.error('Organization data not loaded');
      return;
    }

    try {
      // Transform data to match the backend expected format
      const updateData: UpdateOrgFormData = {
        name: data.name?.trim(),
        website: data.website?.trim() || undefined,
        address: data.address
          ? {
              line1: data.address.line1?.trim(),
              line2: data.address.line2?.trim() || undefined,
              pincode: data.address.pincode || undefined,
            }
          : undefined,
        contact: data.contact
          ? {
              phone: data.contact.phone?.trim() || undefined,
              email: data.contact.email?.trim() || undefined,
            }
          : undefined,
      };

      await updateOrganization({ orgId: organization.id, data: updateData });

      toast.success('Organization updated successfully.');

      // Navigate back to organization page
      navigate('/organization');
    } catch (error: unknown) {
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
      const numValue = value ? parseInt(value) : undefined;
      form.setValue('address.pincode', numValue);
    } else if (field === 'email') {
      form.setValue('contact.email', value);
    } else if (field === 'phone') {
      form.setValue('contact.phone', value);
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

  // Error state or non-admin user
  if (error || !organization || !authState.user || authState.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F5F3F2] overflow-x-hidden">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="w-full max-w-[700px] mx-auto border border-red-200 bg-red-50 mt-8">
              <CardContent className="p-8 text-center">
                <div className="text-red-600 mb-4">
                  <h2 className="text-xl font-medium mb-2">
                    {authState.user?.role !== 'admin' ? 'Access Denied' : 'Organization Not Found'}
                  </h2>
                  <p className="text-sm">
                    {authState.user?.role !== 'admin'
                      ? 'Only administrators can edit organization details.'
                      : error?.message || 'Unable to load organization details'}
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/organization')}
                  className="bg-[#ED8A09] hover:bg-[#ED8A09]/90 text-white"
                >
                  Back to Organization
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
      {/* Main Content */}
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-8 flex flex-wrap gap-1 items-center">
            <House size={18} className="text-gray-700" />
            <CaretRight size={16} className="text-gray-700" />
            <span>Profile</span>
            <CaretRight size={16} className="text-gray-700" />
            <span>Organization Detail</span>
          </div>

          <Card className="w-full max-w-[700px] mx-auto rounded-2xl shadow-sm bg-white border border-gray-200">
            <CardContent className="p-8">
              {/* Title with subtitle */}
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

              {/* Form Fields */}
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col justify-start items-start gap-5">
                  {/* Row 1: Company Website + Organization Name */}
                  <div className="self-stretch flex justify-start items-start gap-5">
                    {/* Company Website */}
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
                              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Organization Name */}
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
                              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Address 1 + Address 2 */}
                  <div className="self-stretch flex justify-start items-start gap-5">
                    {/* Address 1 */}
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

                    {/* Address 2 */}
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

                  {/* Row 3: City + State + Zip Code */}
                  <div className="self-stretch flex justify-start items-start gap-5">
                    {/* City */}
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="city" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            City<span className="text-red-600">*</span>
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="city"
                              value={formData.city}
                              placeholder="City name"
                              onChange={e => {
                                field.onChange(e.target.value);
                                handleFormDataChange('city', e.target.value);
                              }}
                              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-gray-500 text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="state" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            State<span className="text-red-600">*</span>
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="state"
                              value={formData.state}
                              placeholder="Select State"
                              onChange={e => {
                                field.onChange(e.target.value);
                                handleFormDataChange('state', e.target.value);
                              }}
                              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-[#101828] text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Zip Code */}
                    <FormField
                      control={form.control}
                      name="address.pincode"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="pincode" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            Zip Code<span className="text-red-600">*</span>
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="pincode"
                              type="number"
                              value={formData.pincode}
                              placeholder="Postal code"
                              onChange={e => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : undefined);
                                handleFormDataChange('pincode', value);
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

                  {/* Row 4: Email + Phone */}
                  <div className="self-stretch flex justify-start items-center gap-5">
                    {/* Email */}
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
                              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="contact.phone"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col justify-start items-start gap-1.5">
                          <Label htmlFor="phone" className="justify-start text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                            Phone
                          </Label>
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
                              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-gray-300 text-gray-500 text-sm font-normal font-['Outfit'] leading-tight focus:border-indigo-500 focus:shadow-[0px_0px_0px_4px_rgba(70,95,255,0.12)] focus-visible:ring-0"
                              disabled={isSubmitting || isUpdating}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Action Buttons */}
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
