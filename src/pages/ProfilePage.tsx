import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Calendar, 
  Settings,
  Camera,
  Clock,
  Edit,
  ChevronRight,
  Activity,
  TrendingUp,
  Users,
  CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, backendUser } = useAuth();

  // Fetch profile statistics from backend
  const { data: profileStats, isLoading: statsLoading } = useQuery({
    queryKey: ['profileStats'],
    queryFn: async () => {
      const response = await apiClient.get('/profile/stats');
      return response.data;
    },
    enabled: !!user, // Only fetch if user is logged in
  });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLastLogin = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getInitials = () => {
    const email = user?.email || '';
    const name = backendUser?.name || (typeof email === 'string' ? email.split('@')[0] : '') || 'U';
    return String(name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-[#161950] text-white border-[#161950]';
      case 'vendor':
        return 'bg-[#161950] text-white border-[#161950]';
      case 'super_admin':
        return 'bg-[#161950] text-white border-[#161950]';
      default:
        return 'bg-[#161950] text-white border-[#161950]';
    }
  };

  // Profile stats - Dynamic data from backend API
  const stats = [
    {
      label: 'Active Projects',
      value: statsLoading ? '...' : String(profileStats?.active_projects || 0),
      icon: Activity,
      color: 'text-[#161950]',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Completed Tasks',
      value: statsLoading ? '...' : String(profileStats?.completed_tasks || 0),
      icon: CheckCircle2,
      color: 'text-[#161950]',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Team Members',
      value: statsLoading ? '...' : String(profileStats?.team_members || 0),
      icon: Users,
      color: 'text-[#161950]',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Performance',
      value: statsLoading ? '...' : `${profileStats?.performance || 0}%`,
      icon: TrendingUp,
      color: 'text-[#161950]',
      bgColor: 'bg-gray-100',
    },
  ];

  // Quick action links
  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: Edit,
      link: '/profile/settings',
    },
    {
      title: 'Organization Settings',
      description: 'Manage organization details',
      icon: Building2,
      link: '/organization/settings',
    },
    {
      title: 'Security Settings',
      description: 'Password and authentication',
      icon: Shield,
      link: '/profile/settings',
    },
    {
      title: 'Preferences',
      description: 'Customize your experience',
      icon: Settings,
      link: '/profile/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with dashboard theme */}
      <div className="relative bg-[#161950] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-3 tracking-tight !text-white" style={{ color: 'white' }}>
                My Profile
              </h1>
              <p className="text-lg !text-white" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Manage your account settings and preferences
              </p>
            </div>
            <Link to="/profile/settings">
              <Button className="bg-white text-[#161950] hover:bg-gray-100 font-semibold shadow-lg">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-16">
        {/* Main Profile Card */}
        <Card className="mb-8 shadow-2xl border-0 overflow-hidden bg-white">
          <CardContent className="p-0">
            {/* Profile Header */}
            <div className="p-10 bg-white">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  <div className="w-40 h-40 rounded-3xl bg-[#161950] flex items-center justify-center text-white font-bold text-5xl shadow-xl ring-4 ring-gray-100">
                    {getInitials()}
                  </div>
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all border-2 border-gray-200 group-hover:scale-110">
                    <Camera className="h-5 w-5 text-[#161950]" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <h2 className="text-4xl font-bold text-gray-900 tracking-tight break-words">
                        {String(backendUser?.name || (typeof user?.email === 'string' ? user.email.split('@')[0] : '') || 'User')}
                      </h2>
                      <Badge className={`${getRoleBadgeColor(String(backendUser?.role || 'member'))} border-0 px-4 py-1.5 text-sm font-semibold flex-shrink-0`}>
                        <Shield className="h-4 w-4 mr-1.5" />
                        {String(backendUser?.role || 'member').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="text-base font-medium break-all">{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="text-base font-medium">Joined {formatDate(backendUser?.created_at as string | undefined)}</span>
                      </div>
                      {backendUser?.org_id && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <span className="text-base font-medium">Organization Member</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Link to="/profile/settings">
                    <Button size="lg" className="bg-[#161950] text-white hover:bg-[#161950]/90 font-semibold px-8 shadow-lg">
                      <Edit className="h-5 w-5 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white px-10 py-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center group cursor-pointer">
                      <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-xl transition-all group-hover:scale-110`}>
                        <Icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                      <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="border-b-2 border-gray-100 bg-white pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#161950] rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <p className="text-xl font-bold text-gray-900">
                      {String(backendUser?.name || (typeof user?.email === 'string' ? user.email.split('@')[0] : '') || 'Not set')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <p className="text-xl font-bold text-gray-900">{user?.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</label>
                    <p className="text-xl font-bold text-gray-900 capitalize">
                      {String(backendUser?.role || 'Member')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Status</label>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <p className="text-xl font-bold text-gray-900">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.title} to={action.link}>
                      <Card className="shadow-lg border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group bg-white overflow-hidden">
                        <CardContent className="p-7">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-5">
                              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-[#161950] transition-all duration-300">
                                <Icon className="h-7 w-7 text-[#161950] group-hover:text-white transition-colors" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#161950] transition-colors">
                                  {action.title}
                                </h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{action.description}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-[#161950] group-hover:translate-x-2 transition-all flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Account Details & Activity */}
          <div className="space-y-8">
            {/* Account Details Card */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="border-b-2 border-gray-100 bg-white pb-6">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#161950] rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5 bg-white">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border-l-4 border-[#161950]">
                  <Building2 className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Organization</p>
                    <p className="text-base font-bold text-gray-900">
                      {backendUser?.org_id ? 'Active Member' : 'No Organization'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border-l-4 border-[#161950]">
                  <Calendar className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                    <p className="text-base font-bold text-gray-900">
                      {formatDate(backendUser?.created_at as string | undefined)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border-l-4 border-[#161950]">
                  <Clock className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Login</p>
                    <p className="text-base font-bold text-gray-900">
                      {formatLastLogin(backendUser?.updated_at as string | undefined)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="shadow-xl border-0 bg-[#161950] overflow-hidden !text-white" style={{ color: 'white' }}>
              <CardContent className="p-8 !text-white" style={{ color: 'white' }}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 !text-white" style={{ color: 'white' }} />
                  </div>
                  <h4 className="font-bold text-xl mb-3 !text-white" style={{ color: 'white !important' }}>
                    Need Assistance?
                  </h4>
                  <p className="text-sm leading-relaxed !text-white" style={{ color: 'rgba(255, 255, 255, 0.9) !important' }}>
                    Our dedicated support team is available 24/7 to help you with any questions or concerns.
                  </p>
                </div>
                <Button className="w-full bg-white text-[#161950] hover:bg-gray-100 font-bold shadow-lg py-6">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
