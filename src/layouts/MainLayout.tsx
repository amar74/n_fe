import { Outlet } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { useMyOrganization } from '@/hooks/useOrganizations';

// @author abhishek.softication
export default function MainLayout() {
  const { user, backendUser, isAuthenticated, initialAuthComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: organization, isLoading: isOrgLoading } = useMyOrganization();

  useEffect(() => {
    // Only handle redirects after initial auth is complete
    if (!initialAuthComplete) return;
    
    // If not authenticated, redirect to login
    if (!backendUser || !isAuthenticated) {
      navigate('/auth/login', { replace: true });
      return;
    }

    const currentPath = location.pathname;

    // If user doesn't have org_id and isn't already on org creation or auth pages
    if (
      (backendUser.org_id === null) &&
      !currentPath.startsWith('/organization/create') &&
      !currentPath.startsWith('/auth/')
    ) {
      navigate('/organization/create', { replace: true });
      return;
    }

    // If user has org_id but is on organization create page, redirect to dashboard
    // This handles the case where user just created an organization and should go to dashboard
    if (backendUser.org_id && currentPath.startsWith('/organization/create')) {
      navigate('/', { replace: true });
      return;
    }
    
    // If user has org_id and is not on profile update or org create page, check profile completion
    if (
      backendUser.org_id &&
      !currentPath.startsWith('/organization/update') &&
      !currentPath.startsWith('/organization/create') &&
      !currentPath.startsWith('/auth/')
    ) {
      // Wait for organization data to load
      if (isOrgLoading) return;
      
      // Only redirect to profile update if profile is significantly incomplete (< 50%)
      // This allows users with mostly complete profiles to access the dashboard
      if (organization && typeof organization.profile_completion === 'number' && organization.profile_completion < 50) {
        navigate('/organization/update', { replace: true });
        return;
      }
    }
  }, [backendUser, isAuthenticated, initialAuthComplete, organization, isOrgLoading, navigate, location.pathname]);

  // Show loading only during initial auth check
  if (!initialAuthComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user or not authenticated, will redirect in useEffect
  if (!backendUser || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <Toaster />
    </>
  );
}
