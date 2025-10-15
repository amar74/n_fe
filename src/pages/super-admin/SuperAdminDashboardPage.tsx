import { useSuperAdminVendors } from '@/hooks/useSuperAdminVendors';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const { dashboard, isDashboardLoading, stats, isStatsLoading } = useSuperAdminVendors();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/super-admin/login');
  };

  if (isDashboardLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const vendorStats = dashboard?.vendor_stats || stats;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {vendorStats?.total_vendors || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Vendors</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {vendorStats?.total_approved || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Vendors</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {vendorStats?.total_pending || 0}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected Vendors</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {vendorStats?.total_rejected || 0}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/super-admin/vendors')}
              className="h-auto py-4"
            >
              <div className="text-left">
                <div className="font-semibold">Manage Vendors</div>
                <div className="text-sm opacity-90 mt-1">View and manage all vendors</div>
              </div>
            </Button>
            <Button
              onClick={() => navigate('/super-admin/vendors/create')}
              className="h-auto py-4"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">Create New Vendor</div>
                <div className="text-sm opacity-90 mt-1">Add a new vendor to the system</div>
              </div>
            </Button>
            <Button
              onClick={() => navigate('/super-admin/vendors?status=pending')}
              className="h-auto py-4"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">Pending Approvals</div>
                <div className="text-sm opacity-90 mt-1">Review vendors awaiting approval</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
