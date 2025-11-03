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
  
  // Only fetch organization if user has an org_id (super admins may not have one)
  const hasOrgId = backendUser?.org_id !== null && backendUser?.org_id !== undefined;
  const { data: organization, isLoading: isOrgLoading, error: orgError, isError: isOrgError } = useMyOrganization(hasOrgId);

  useEffect(() => {
    // Only handle redirects after initial auth is complete
    if (!initialAuthComplete) return;
    
    // If not authenticated, redirect to login
    if (!backendUser || !isAuthenticated) {
      navigate('/auth/login', { replace: true });
      return;
    }

    const currentPath = location.pathname;

    // If user has org_id but organization doesn't exist (404 error), redirect to organization creation
    if (
      hasOrgId &&
      !isOrgLoading &&
      isOrgError &&
      (orgError as any)?.response?.status === 404 &&
      !currentPath.startsWith('/organization/create') &&
      !currentPath.startsWith('/auth/')
    ) {
      console.log('[MainLayout] User has org_id but organization not found (404). Redirecting to organization creation.');
      navigate('/organization/create', { replace: true });
      return;
    }

    // If user doesn't have org_id and isn't already on org creation or auth pages
    if (
      (backendUser.org_id === null) &&
      !currentPath.startsWith('/organization/create') &&
      !currentPath.startsWith('/auth/')
    ) {
      navigate('/organization/create', { replace: true });
      return;
    }

    // If user has org_id and organization exists, but is on organization create page, redirect to dashboard
    // This handles the case where user just created an organization and should go to dashboard
    if (backendUser.org_id && !isOrgLoading && organization && currentPath.startsWith('/organization/create')) {
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
      
      // If organization doesn't exist (404), don't check profile completion - will be handled by redirect above
      if (isOrgError) return;
      
      // Only redirect to profile update if profile is significantly incomplete (< 50%)
      // This allows users with mostly complete profiles to access the dashboard
      if (organization && typeof organization.profile_completion === 'number' && organization.profile_completion < 50) {
        navigate('/organization/update', { replace: true });
        return;
      }
    }
  }, [backendUser, isAuthenticated, initialAuthComplete, organization, isOrgLoading, isOrgError, orgError, hasOrgId, navigate, location.pathname]);

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
