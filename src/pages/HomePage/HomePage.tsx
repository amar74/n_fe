import { Outlet } from 'react-router-dom';
import { useHomePage } from './useHomePage';
import { memo } from 'react';

// @author amar74.soft
function HomePage() {
  const {
    user,
    isAuthLoading,
    isAuthenticated,
  } = useHomePage();

  // Show loading during auth initialization to prevent flicker
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (shouldn't happen, but safety check)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

    return (
      <div className="h-full bg-[#F5F3F2] font-inter">
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-full">
          
          <Outlet />
        </div>
      </div>
    );
}

export default memo(HomePage);