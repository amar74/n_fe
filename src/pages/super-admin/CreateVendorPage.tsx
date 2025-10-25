import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { Eye, EyeOff, Key, Copy, Check, Phone, Mail, User, ArrowLeft } from 'lucide-react';

// Country codes for phone number
const COUNTRY_CODES = [
  { value: '+1', label: 'US (+1)', flag: '🇺🇸' },
  { value: '+91', label: 'IN (+91)', flag: '🇮🇳' },
  { value: '+44', label: 'UK (+44)', flag: '🇬🇧' },
  { value: '+61', label: 'AU (+61)', flag: '🇦🇺' },
  { value: '+86', label: 'CN (+86)', flag: '🇨🇳' },
];

export default function CreateVendorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+1');
  const [createdVendor, setCreatedVendor] = useState<{
    email: string;
    password: string;
    userId: string;
    orgId?: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format phone number (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Validate USA phone number
  const validateUSAPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedField(fieldId);
        toast.success(`${label} copied to clipboard`);
        setTimeout(() => setCopiedField(null), 2000);
      } catch (err) {
        toast.error('Failed to copy to clipboard');
      }
      document.body.removeChild(textArea);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.contact_number && !validateUSAPhone(formData.contact_number)) {
      newErrors.contact_number = 'Contact number must be a valid 10-digit USA phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createVendorMutation = useMutation({
    mutationFn: async (vendorData: typeof formData) => {
      const fullPhone = vendorData.contact_number ? `${countryCode} ${vendorData.contact_number}` : undefined;
      const response = await apiClient.post('/admin/create_new_user', {
        email: vendorData.email,
        password: vendorData.password,
        name: vendorData.name,
        contact_number: fullPhone,
        role: 'vendor',
      });
      return response.data;
    },
    onSuccess: (data) => {
      try {
        const vendorData = {
          email: formData.email,
          password: formData.password,
          userId: data?.user?.short_id || data?.short_id || 'unknown',
          orgId: data?.user?.org_id || data?.org_id || undefined,
        };
        setCreatedVendor(vendorData);
        setShowCredentials(true);
        toast.success('Vendor created successfully!');
      } catch (error) {
        toast.error('Vendor created but there was an issue displaying credentials. Please check vendor list.');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create vendor';
      
      // Check if error is due to existing email
      if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exist')) {
        setErrors({ email: 'This email is already registered in the system' });
        toast.error('Email already exists', {
          description: 'This email is already registered. Please use a different email address.',
        });
      } else {
        toast.error('Failed to create vendor', {
          description: errorMessage,
        });
      }
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    await createVendorMutation.mutateAsync(formData);
  };

  const handleCreateAnother = () => {
    setShowCredentials(false);
    setCreatedVendor(null);
    setFormData({
      name: '',
      email: '',
      contact_number: '',
      password: '',
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/super-admin')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Super Admin Dashboard</span>
        </button>

        {!showCredentials ? (
          <Card className="shadow-xl border-2 border-gray-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">Create New Vendor</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Add a new vendor to the system with their contact information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`${errors.name ? 'border-red-500 bg-red-50' : ''} h-11 transition-all`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="font-medium">⚠</span> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="vendor@company.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`${errors.email ? 'border-red-500 bg-red-50' : ''} h-11`}
                    />
                    {errors.email && errors.email.includes('already registered') && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <div className={`text-sm flex items-start gap-2 p-3 rounded-lg ${
                      errors.email.includes('already registered') 
                        ? 'bg-red-50 border border-red-200' 
                        : ''
                    }`}>
                      <span className="font-medium text-red-600">⚠</span>
                      <span className="text-red-600 flex-1">{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Contact Number with Country Code */}
                <div className="space-y-2">
                  <Label htmlFor="contact_number" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    Contact Number (USA)
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={countryCode}
                      onValueChange={setCountryCode}
                    >
                      <SelectTrigger className="w-32 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.value}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      id="contact_number"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.contact_number}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        const formatted = formatPhoneNumber(rawValue);
                        handleChange('contact_number', formatted);
                      }}
                      className={`${errors.contact_number ? 'border-red-500 bg-red-50' : ''} flex-1 h-11`}
                      maxLength={14}
                    />
                  </div>
                  {errors.contact_number && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="font-medium">⚠</span> {errors.contact_number}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Format: (XXX) XXX-XXXX (10 digits)</p>
                </div>

                {/* Password Field with Toggle */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-600" />
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`${errors.password ? 'border-red-500 bg-red-50' : ''} h-11 pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="font-medium">⚠</span> {errors.password}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={createVendorMutation.isPending}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {createVendorMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Vendor...
                      </span>
                    ) : (
                      'Create Vendor'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Success Screen with Credentials */
          <Card className="shadow-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">Vendor Created Successfully!</CardTitle>
                  <CardDescription className="text-green-50 text-base">
                    Save these credentials securely - they won't be shown again
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <Alert className="bg-yellow-50 border-2 border-yellow-300">
                <AlertTitle className="text-yellow-900 font-bold flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Important: Save These Credentials
                </AlertTitle>
                <AlertDescription className="text-yellow-800">
                  These credentials will not be displayed again. Please copy and save them in a secure location.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Vendor ID */}
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Vendor ID
                      </Label>
                      <p className="text-2xl font-bold text-gray-900 font-mono">{createdVendor?.userId}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdVendor?.userId || '', 'Vendor ID', 'vendorId')}
                      className="h-10 px-4 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                    >
                      {copiedField === 'vendorId' ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        Email Address
                      </Label>
                      <p className="text-lg font-semibold text-gray-900 break-all">{createdVendor?.email}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdVendor?.email || '', 'Email', 'email')}
                      className="h-10 px-4 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                    >
                      {copiedField === 'email' ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Password */}
                <div className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        Temporary Password
                      </Label>
                      <p className="text-lg font-semibold text-gray-900 font-mono">{createdVendor?.password}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdVendor?.password || '', 'Password', 'password')}
                      className="h-10 px-4 hover:bg-red-50 hover:border-red-300 transition-all"
                    >
                      {copiedField === 'password' ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleCreateAnother}
                  variant="outline"
                  className="flex-1 h-12 font-semibold hover:bg-gray-50"
                >
                  Create Another Vendor
                </Button>
                <Button
                  onClick={() => navigate('/super-admin/vendors')}
                  className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 font-semibold"
                >
                  View All Vendors
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
