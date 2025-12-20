import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useEffect } from 'react';
import { LogOut, Users, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/shared';

export default function SuperAdminLayout() {
  const { user, backendUser, isAuthenticated, initialAuthComplete, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!initialAuthComplete) return;

    // If not authenticated, redirect to super admin login
    if (!user || !isAuthenticated) {
      navigate('/super-admin/login', { replace: true });
      return;
    }

    // If user is not super_admin, redirect to vendor login
    if (backendUser?.role !== 'super_admin') {
      toast({
        title: 'Access Denied',
        description: 'Super admin access required',
        variant: 'destructive',
      });
      navigate('/auth/login', { replace: true });
      return;
    }
  }, [user, backendUser, isAuthenticated, initialAuthComplete, navigate, toast]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/super-admin/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: 'An error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  // Show loading only during initial auth check
  if (!initialAuthComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#161950]"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user or not authenticated, will redirect in useEffect
  if (!user || !isAuthenticated || backendUser?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#161950]"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    const email = user?.email || '';
    const name = backendUser?.name || email.split('@')[0] || 'SA';
    return String(name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const superAdminMenuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/super-admin/dashboard',
    },
    {
      icon: Users,
      label: 'Vendors',
      path: '/super-admin/vendors',
    },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/super-admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F5F3F2]">
      <div className="bg-white box-border flex flex-col gap-44 items-start justify-between overflow-clip pb-7 pt-0 px-0 rounded-br-[28px] rounded-tr-[28px] w-[260px] h-screen fixed left-0 shadow-sm">
        <div className="w-full pt-8 px-7">
          <h1 className="text-2xl font-bold text-[#161950]">Megapolis</h1>
          <p className="text-sm text-gray-500 mt-1">Super Admin Panel</p>
        </div>

        <div className="flex-1 flex flex-col gap-2 w-full overflow-y-auto">
          {superAdminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`box-border flex gap-3 h-[60px] items-center justify-start px-7 py-5 w-full transition-colors duration-200 hover:bg-gray-50 ${
                  isActive ? 'bg-white border-b-2 border-[#161950]' : ''
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-[#161950]' : 'text-[#6e6e6e]'}`} />
                <span className={`font-semibold text-[16px] ${
                  isActive ? 'text-[#161950]' : 'text-[#6e6e6e]'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="box-border flex gap-3 h-[60px] items-center justify-start px-7 py-5 w-full transition-colors duration-200 hover:bg-gray-50"
        >
          <LogOut className="w-6 h-6 text-[#161950]" />
          <span className="font-semibold text-[18px] text-[#161950]">Log-out</span>
        </button>
      </div>

      <div className="flex-1 ml-[260px] flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Super Admin Dashboard</h2>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 bg-[#161950] text-white">
              <AvatarFallback className="bg-[#161950] text-white font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{backendUser?.email}</span>
              <span className="text-xs text-[#161950] font-semibold">SUPER ADMIN</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}

