import { useHomePage } from './useHomePage';
import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardWelcome } from './components/DashboardWelcome';
import { useEmployeeRole } from '@/hooks/useEmployeeRole';

// @author amar74.soft
function HomePage() {
  const navigate = useNavigate();
  const {
    user,
    isAuthLoading,
    isAuthenticated,
  } = useHomePage();

  // Check if user should see employee dashboard - MUST be called before any conditional logic
  const { shouldSeeEmployeeDashboard, isLoading: isEmployeeRoleLoading } = useEmployeeRole();

  // Redirect employees to their dashboard - MUST be called before any conditional returns
  useEffect(() => {
    // Only redirect if auth and role check are complete, user is authenticated, and should redirect
    if (!isAuthLoading && !isEmployeeRoleLoading && isAuthenticated && shouldSeeEmployeeDashboard) {
      navigate('/employee/dashboard', { replace: true });
    }
  }, [shouldSeeEmployeeDashboard, navigate, isAuthLoading, isEmployeeRoleLoading, isAuthenticated]);

  // Determine if we should show the dashboard content
  const shouldShowDashboard = !isAuthLoading && !isEmployeeRoleLoading && isAuthenticated && !shouldSeeEmployeeDashboard;

  // Always render DashboardWelcome to ensure hooks are called consistently
  // Conditionally show loading/redirect states as overlay
  return (
    <>
      {(isAuthLoading || isEmployeeRoleLoading) && (
        <div className="fixed inset-0 bg-[#F9FAFB] flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="text-gray-600 text-sm">Loading dashboard...</p>
          </div>
        </div>
      )}

      {!isAuthenticated && !isAuthLoading && !isEmployeeRoleLoading && (
        <div className="fixed inset-0 bg-[#F9FAFB] flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="text-gray-600 text-sm">Redirecting...</p>
          </div>
        </div>
      )}

      {shouldSeeEmployeeDashboard && !isAuthLoading && !isEmployeeRoleLoading && (
        <div className="fixed inset-0 bg-[#F9FAFB] flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="text-gray-600 text-sm">Redirecting to employee dashboard...</p>
          </div>
        </div>
      )}

      <div className={`h-full bg-[#F5F3F2] font-outfit ${shouldShowDashboard ? '' : 'hidden'}`}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-full">
          <DashboardWelcome />
        </div>
      </div>
    </>
  );
}

export default memo(HomePage);