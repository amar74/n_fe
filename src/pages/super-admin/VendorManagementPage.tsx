import { useState } from 'react';
import { useSuperAdminVendors, type Vendor } from '@/hooks/user-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import {
// @author guddy.tech
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function VendorManagementPage() {
  const navigate = useNavigate();
  const { 
    useVendorsList, 
    createVendor, 
    isCreating, 
    updateVendorStatus, 
    isUpdatingStatus, 
    deleteVendor, 
    isDeleting 
  } = useSuperAdminVendors();
  
  const { data: vendorsData, isLoading } = useVendorsList(0, 100);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    vendor_name: '',
    organisation: '',
    website: '',
    email: '',
    contact_number: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVendor(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        vendor_name: '',
        organisation: '',
        website: '',
        email: '',
        contact_number: '',
        password: '',
      });
    } catch (error) {
    }
  };

  // TODO: need to fix this - amar74.soft
  const handleStatusChange = async (vendorId: string, status: string) => {
    try {
      await updateVendorStatus({ vendorId, status });
    } catch (err) {
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor(vendorId);
      } catch (e) {
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading vendors...</div>
      </div>
    );
  }

  const vendors = vendorsData?.vendors || [];

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate('/super-admin/dashboard')}
                className="mb-2"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create New Vendor</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Vendor</DialogTitle>
                  <DialogDescription>
                    Add a new vendor to the system. An invitation email will be sent automatically.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateVendor} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Name *
                      </label>
                      <Input
                        name="vendor_name"
                        value={formData.vendor_name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organisation *
                      </label>
                      <Input
                        name="organisation"
                        value={formData.organisation}
                        onChange={handleInputChange}
                        required
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="vendor@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number *
                      </label>
                      <Input
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleInputChange}
                        required
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <Input
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password (Optional)
                    </label>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Leave blank to auto-generate"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If left blank, a random password will be generated and sent via email
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Vendor'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No vendors found. Create your first vendor to get started.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.vendor_name}</div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.organisation}</div>
                      {vendor.website && (
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Visit website
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.contact_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={vendor.status}
                        onValueChange={(value) => handleStatusChange(vendor.id, value)}
                        disabled={isUpdatingStatus}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteVendor(vendor.id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
