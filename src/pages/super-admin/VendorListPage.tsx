import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';

interface Vendor {
  id: string;
  email: string;
  org_id: string | null;
  role: string;
  formbricks_user_id: string | null;
}

interface VendorListResponse {
  total_users: number;
  users: Vendor[];
}

export default function VendorListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // FIXME: this not working properly - harsh.pawar
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [createdVendor, setCreatedVendor] = useState<{
    email: string;
    password: string;
    userId: string;
    orgId?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organization_name: '',
  });

  const { data, isLoading, error } = useQuery<VendorListResponse>({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get<VendorListResponse>('/admin/user_list?limit=500');
      // Filter only vendors
      const filteredData = {
        total_users: response.data.users.filter(u => u.role === 'vendor').length,
        users: response.data.users.filter(u => u.role === 'vendor')
      };
      return filteredData;
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (vendorData: typeof formData) => {
      const response = await apiClient.post('/admin/create_new_user', {
        email: vendorData.email,
        password: vendorData.password,
        role: 'vendor',
        organization_name: vendorData.organization_name || undefined,
      });
      return { data: response.data, password: vendorData.password };
    },
    onSuccess: (result) => {
      setCreatedVendor({
        email: result.data.user.email,
        password: result.password,
        userId: result.data.user.id,
        orgId: result.data.user.org_id,
      });
      
      toast({
        title: 'Success',
        description: 'Vendor created successfully!',
      });
      
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-dashboard'] });
      
      setIsCreateDialogOpen(false);
      setFormData({ email: '', password: '', organization_name: '' });
      
      // Show credentials dialog
      setIsCredentialsDialogOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'create failed',
        variant: 'destructive',
      });
    },
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    createVendorMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading vendors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading vendors</div>
      </div>
    );
  }

  const vendors = data?.users || [];

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <button
                onClick={() => navigate('/super-admin/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Total Vendors: {data?.total_users || 0}
              </p>
            </div>
            <Button onClick={() => navigate('/super-admin/vendors/create')}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Vendor
            </Button>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new vendor.</p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Vendor
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Organization ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Onboarding Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {vendor.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vendor.email}</div>
                          <div className="text-sm text-gray-500">ID: {vendor.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vendor.org_id ? (
                          <span className="text-gray-600">{vendor.org_id.substring(0, 8)}...</span>
                        ) : (
                          <span className="text-gray-400 italic">No organization</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {vendor.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vendor.org_id ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ Onboarded
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          ⏳ Pending Setup
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/super-admin/vendors/${vendor.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Vendor</DialogTitle>
            <DialogDescription>
              Add a new vendor to the system. They will be able to login with the provided credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVendor}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vendor@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500">Minimum 8 characters</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="organization_name">Organization Name (Optional)</Label>
                <Input
                  id="organization_name"
                  type="text"
                  placeholder="Company ABC"
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  If not provided, will be auto-generated from email
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createVendorMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createVendorMutation.isPending}>
                {createVendorMutation.isPending ? 'Creating...' : 'Create Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vendor Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Save these credentials. You'll need to share them with the vendor.
            </DialogDescription>
          </DialogHeader>
          
          {createdVendor && (
            <div className="space-y-4 py-4">
              <Alert className="border-green-200 bg-green-50">
                <AlertTitle className="text-green-800">Important: Save These Credentials</AlertTitle>
                <AlertDescription className="text-green-700">
                  The password will not be shown again. Make sure to copy it now.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white p-2 rounded border text-sm font-mono break-all">
                      {createdVendor.userId}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(createdVendor.userId);
                        toast({ title: 'Copied!', description: 'User ID copied to clipboard' });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white p-2 rounded border text-sm font-mono break-all">
                      {createdVendor.email}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(createdVendor.email);
                        toast({ title: 'Copied!', description: 'Email copied to clipboard' });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white p-2 rounded border text-sm font-mono break-all">
                      {createdVendor.password}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(createdVendor.password);
                        toast({ title: 'Copied!', description: 'Password copied to clipboard' });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {createdVendor.orgId && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization ID
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white p-2 rounded border text-sm font-mono break-all">
                        {createdVendor.orgId}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(createdVendor.orgId!);
                          toast({ title: 'Copied!', description: 'Organization ID copied to clipboard' });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">Login Information</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Vendor can login at: <strong>{window.location.origin}/login</strong>
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        (Email functionality will be set up later to automatically send these credentials)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={() => {
                setIsCredentialsDialogOpen(false);
                setCreatedVendor(null);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
