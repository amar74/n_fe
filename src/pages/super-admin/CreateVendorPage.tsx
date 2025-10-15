import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';

export default function CreateVendorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
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

    if (formData.contact_number && !/^\d{10}$/.test(formData.contact_number.replace(/\D/g, ''))) {
      newErrors.contact_number = 'Contact number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createVendorMutation = useMutation({
    mutationFn: async (vendorData: typeof formData) => {
      const response = await apiClient.post('/admin/create_new_user', {
        email: vendorData.email,
        password: vendorData.password,
        role: 'vendor',
      });
      return response.data;
    },
    onSuccess: (data) => {
      try {
        const vendorData = {
          email: formData.email,
          password: formData.password,
          userId: data?.user?.id || data?.id || 'unknown',
          orgId: data?.user?.org_id || data?.org_id || undefined,
        };
        setCreatedVendor(vendorData);
        setShowCredentials(true);
        toast({
          title: 'Success',
          description: 'Vendor created sucessfully!',
        });
      } catch (error) {
        toast({
          title: 'Warning',
          description: 'Vendor created but there was an issue displaying credentials. Please check vendor list.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      let errorMessage = 'create failed';
      let isEmailAlreadyRegistered = false;
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (detail.error?.message) {
          errorMessage = detail.error.message;
        } else if (detail.message) {
          errorMessage = detail.message;
        } else {
          errorMessage = JSON.stringify(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      // Make error more user-friendly and check if it's an email duplicate error
      if (errorMessage.toLowerCase().includes('already been registered') || 
          errorMessage.toLowerCase().includes('already registered') ||
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('duplicate')) {
        errorMessage = 'This email address is already registered. Please use a different email.';
        isEmailAlreadyRegistered = true;
      }
      
      if (isEmailAlreadyRegistered) {
        setErrors((prev) => ({
          ...prev,
          email: '⚠️ This email is already registered. Please use a different email address.',
        }));
      }
      
      toast({
        title: 'Error Creating Vendor',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createVendorMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied to clipboard` });
  };

  if (showCredentials && createdVendor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/super-admin/vendors')}
              className="mb-4"
            >
              ← Back to Vendors
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Created Successfully!</h1>
            <p className="text-gray-600 mt-2">Save these credentials. The password will not be shown again.</p>
          </div>

          
          <Alert className="border-green-200 bg-green-50 mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <AlertTitle className="text-green-800">Vendor Account Created</AlertTitle>
                <AlertDescription className="text-green-700">
                  The vendor account has been created successfully. Make sure to copy these credentials before leaving this page.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Vendor Credentials</CardTitle>
              <CardDescription>Copy and share these credentials with the vendor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white p-3 rounded border text-sm font-mono break-all">
                    {createdVendor.userId}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdVendor.userId, 'User ID')}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Login ID)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white p-3 rounded border text-sm font-mono break-all">
                    {createdVendor.email}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdVendor.email, 'Email')}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <label className="block text-sm font-medium text-yellow-800 mb-2">
                  🔑 Password (One-time view)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white p-3 rounded border text-sm font-mono break-all text-red-600 font-bold">
                    {createdVendor.password}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdVendor.password, 'Password')}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ This password will never be shown again. Make sure to copy it now!
                </p>
              </div>

              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Vendor Login Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Vendor login URL: <strong>{window.location.origin}/login</strong>
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      After first login, vendor will be guided to create their organization profile.
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Share these credentials securely with the vendor via email or secure messaging.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          
          <div className="mt-8 flex gap-4">
            <Button onClick={() => navigate('/super-admin/vendors')} size="lg">
              Go to Vendor List
            </Button>
            <Button onClick={() => {
              setShowCredentials(false);
              setCreatedVendor(null);
              setFormData({
                name: '',
                email: '',
                contact_number: '',
                password: '',
              });
            }} variant="outline" size="lg">
              Create Another Vendor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/super-admin/vendors')}
            className="mb-4"
          >
            ← Back to Vendors
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Vendor</h1>
          <p className="text-gray-600 mt-2">Create vendor account. Vendor will set up their organization on first login.</p>
        </div>

        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
            <CardDescription>Enter basic vendor details. Vendor will create organization after first login.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter vendor's full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              
              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vendor@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Use vendor's real email address. This will be their login ID.</p>
              </div>

              
              <div>
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  className={errors.contact_number ? 'border-red-500' : ''}
                />
                {errors.contact_number && (
                  <p className="text-sm text-red-500 mt-1">{errors.contact_number}</p>
                )}
              </div>

              
              <div>
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter a secure password (min 8 characters)"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
                      const numbers = '0123456789';
                      const special = '@#$%&*!';
                      const allChars = uppercase + lowercase + numbers + special;
                      
                      let password = '';
                      // Ensure at least one of each type
                      password += uppercase[Math.floor(Math.random() * uppercase.length)];
                      password += lowercase[Math.floor(Math.random() * lowercase.length)];
                      password += numbers[Math.floor(Math.random() * numbers.length)];
                      password += special[Math.floor(Math.random() * special.length)];
                      
                      // Fill the rest randomly (total 12 characters)
                      for (let i = 4; i < 12; i++) {
                        password += allChars[Math.floor(Math.random() * allChars.length)];
                      }
                      
                      // Shuffle the password
                      password = password.split('').sort(() => Math.random() - 0.5).join('');
                      
                      handleChange('password', password);
                      setShowPassword(true); // Show the generated password
                    }}
                    className="whitespace-nowrap"
                    title="Generate a secure password"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Generate
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Password will be shown only once after creation. Click "Generate" for a strong password.</p>
              </div>

              
              <Alert className="border-blue-200 bg-blue-50">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      After creating the vendor, you'll receive the complete credentials including user ID, email, and password. 
                      Make sure to copy and share them securely with the vendor.
                    </p>
                  </div>
                </div>
              </Alert>

              
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={createVendorMutation.isPending}
                  className="flex-1"
                >
                  {createVendorMutation.isPending ? 'Creating...' : 'Create Vendor'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/super-admin/vendors')}
                  disabled={createVendorMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
