import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Vendor {
  id: string;
  email: string;
  org_id: string | null;
  role: string;
  formbricks_user_id: string | null;
}

interface Address {
  id: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: number;
  org_id: string;
}

interface Contact {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  org_id?: string;
}

interface Organization {
  id: string;
  name: string;
  owner_id: string;
  website?: string;
  created_at: string;
  address_id?: string;
  contact_id?: string;
  address?: Address;
  contact?: Contact;
}

export default function VendorProfilePage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const { data: vendor, isLoading: isLoadingVendor } = useQuery<Vendor>({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/user_list`);
      const allUsers = response.data.users;
      const vendor = allUsers.find((u: Vendor) => u.id === vendorId);
      if (!vendor) throw new Error('Vendor not found');
      return vendor;
    },
    enabled: !!vendorId,
  });

  const { data: organization, isLoading: isLoadingOrg } = useQuery<Organization>({
    queryKey: ['organization', vendor?.org_id],
    queryFn: async () => {
      if (!vendor?.org_id) throw new Error('No organization');
      const response = await apiClient.get(`/orgs/${vendor.org_id}`);
      return response.data;
    },
    enabled: !!vendor?.org_id,
  });

  if (isLoadingVendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading vendor profile...</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Vendor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <button
                onClick={() => navigate('/super-admin/vendors')}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Vendors
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
              <p className="text-sm text-gray-600 mt-1">{vendor.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>Basic details about the vendor account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded mt-1">
                  {vendor.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="mt-1">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {vendor.role}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">🔒 Password Security</label>
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800 font-medium">
                        Password cannot be retrieved
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        For security, passwords are encrypted and cannot be viewed after account creation.
                        Passwords are only displayed once when creating a new vendor.
                      </p>
                      <p className="text-xs text-yellow-700 mt-2">
                        💡 <strong>Tip:</strong> If needed, you can reset the vendor's password through Supabase Auth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {vendor.formbricks_user_id && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Formbricks ID</label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded mt-1">
                    {vendor.formbricks_user_id}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Details about the vendor's organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendor.org_id ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Organization ID</label>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded mt-1">
                      {vendor.org_id}
                    </p>
                  </div>

                  {isLoadingOrg ? (
                    <div className="text-sm text-gray-500">Loading organization details...</div>
                  ) : organization ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Organization Name</label>
                        <p className="text-sm text-gray-900 mt-1">{organization.name}</p>
                      </div>

                      {organization.website && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Website</label>
                          <a
                            href={organization.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 mt-1 block"
                          >
                            {organization.website}
                          </a>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-500">Created At</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(organization.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Data Isolation</label>
                        <p className="text-sm text-gray-600 mt-1">
                          ✅ This vendor has complete data isolation. All their data is stored separately
                          and cannot be accessed by other vendors.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Organization details not available
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No organization assigned to this vendor
                </div>
              )}
            </CardContent>
          </Card>

          {vendor.org_id && organization?.address && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Address</CardTitle>
                <CardDescription>Physical address of the organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {organization.address.line1 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 1</label>
                    <p className="text-sm text-gray-900 mt-1">{organization.address.line1}</p>
                  </div>
                )}

                {organization.address.line2 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 2</label>
                    <p className="text-sm text-gray-900 mt-1">{organization.address.line2}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {organization.address.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      <p className="text-sm text-gray-900 mt-1">{organization.address.city}</p>
                    </div>
                  )}

                  {organization.address.state && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">State</label>
                      <p className="text-sm text-gray-900 mt-1">{organization.address.state}</p>
                    </div>
                  )}
                </div>

                {organization.address.pincode && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pincode</label>
                    <p className="text-sm text-gray-900 mt-1">{organization.address.pincode}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {vendor.org_id && organization?.contact && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Contact</CardTitle>
                <CardDescription>Primary contact information for the organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Name</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {organization.contact.name || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Email</label>
                  {organization.contact.email ? (
                    <a
                      href={`mailto:${organization.contact.email}`}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 block"
                    >
                      {organization.contact.email}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 italic mt-1">Not provided</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                  {organization.contact.phone ? (
                    <a
                      href={`tel:${organization.contact.phone}`}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 block"
                    >
                      {organization.contact.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 italic mt-1">Not provided</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Title/Position</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {organization.contact.title || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>Vendor account activity and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">Login Method</div>
                  <div className="text-lg font-semibold text-blue-900 mt-1">Supabase Auth</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-600">Access Level</div>
                  <div className="text-lg font-semibold text-green-900 mt-1">Full Admin</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Permissions</label>
                <p className="text-sm text-gray-600 mt-1">
                  Full administrative access to all modules within their organization including
                  accounts, opportunities, projects, and financial management.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Information</CardTitle>
              <CardDescription>Login and authentication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Login URL</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded mt-1">
                  {window.location.origin}/login
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Login Email</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Authentication Method</label>
                <p className="text-sm text-gray-600 mt-1">
                  Supabase Authentication with email and password
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Password Not Visible</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      For security reasons, passwords are not displayed. Vendor can reset their
                      password using the "Forgot Password" option on the login page.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
