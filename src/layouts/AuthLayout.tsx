import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function AuthLayout() {
  const { user, backendUser, isAuthenticated, initialAuthComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (backendUser && isAuthenticated && location.pathname === '/auth/login') {
      navigate('/');
    }
  }, [backendUser, isAuthenticated, location.pathname, navigate]);

  if (!initialAuthComplete) {
    return (
      <div className="w-fullmin-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Outlet />
    </div>
  );
}
