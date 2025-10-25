import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Calendar, 
  Settings,
  Camera,
  Clock,
  MapPin,
  Phone,
  Globe,
  Edit,
  ChevronRight,
  Award,
  Activity,
  TrendingUp
} from 'lucide-react';

export default function ProfilePage() {
  const { user, backendUser } = useAuth();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = () => {
    const email = user?.email || '';
    // @rose11 - refactor needed
    const name = backendUser?.name || email.split('@')[0] || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'vendor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'super_admin':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Profile stats
  const stats = [
    {
      label: 'Active Projects',
      value: '8',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Completed Tasks',
      value: '124',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Team Members',
      value: '12',
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    }, 
  ];

  // Quick action links
  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: Edit,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/profile/settings',
    },
    {
      title: 'Organization Settings',
      description: 'Manage organization details',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/organization/settings',
    },
    {
      title: 'Security Settings',
      description: 'Password and authentication',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/profile/settings',
    },
    {
      title: 'Preferences',
      description: 'Customize your experience',
      icon: Settings,
      color: 'text-[#161950]',
      bgColor: 'bg-[#161950]/5',
      link: '/profile/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      
      <div className="relative bg-[#161950] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight leading-tight">My Profile</h1>
            <p className="text-white/95 text-lg font-medium leading-relaxed">Manage your account settings and preferences</p>
          </div>
            <Link to="/profile/settings">
              <Button className="bg-white text-[#161950] hover:bg-gray-100">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12">
        
        <Card className="mb-8 shadow-xl border border-gray-100">
          <CardContent className="p-0">
            
            <div className="p-8 pb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-[#161950] flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    {getInitials()}
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-100">
                    <Camera className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                      {backendUser?.name || user?.email?.split('@')[0] || 'User'}
                    </h2>
                    <Badge className={`${getRoleBadgeColor(backendUser?.role || 'member')} border`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {backendUser?.role || 'Member'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-base text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="tracking-tight">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="tracking-tight">Joined {formatDate(backendUser?.created_at)}</span>
                    </div>
                    {backendUser?.org_id && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="tracking-tight">Organization Member</span>
                      </div>
                    )}
                  </div>
                </div>

                
                <Link to="/profile/settings">
                  <Button variant="outline" size="lg" className="gap-2 border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            
            <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">{stat.value}</div>
                      <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="shadow-md border border-gray-100">
              <CardHeader className="border-b border-gray-100 bg-white">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2 tracking-tight leading-tight">
                  <User className="h-5 w-5 text-[#161950]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <p className="text-lg font-bold text-gray-900 tracking-tight">
                      {backendUser?.name || user?.email?.split('@')[0] || 'Not set'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <p className="text-lg font-bold text-gray-900 tracking-tight">{user?.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                    <p className="text-lg font-bold text-gray-900 capitalize tracking-tight">
                      {backendUser?.role || 'Member'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Status</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-base font-semibold text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-5 tracking-tight leading-tight">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.title} to={action.link}>
                      <Card className="shadow-md border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Icon className={`h-6 w-6 ${action.color}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-[#161950] transition-colors">
                                  {action.title}
                                </h4>
                                <p className="text-sm text-gray-600">{action.description}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#161950] group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          
          <div className="space-y-6">
            
            <Card className="shadow-md border border-gray-100">
              <CardHeader className="border-b border-gray-100 bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#161950]" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Organization</p>
                    <p className="text-base font-semibold text-gray-900">
                      {backendUser?.org_id ? 'Active Member' : 'No Organization'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(backendUser?.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(backendUser?.updated_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            
            <Card className="shadow-md border border-gray-100">
              <CardHeader className="border-b border-gray-100 bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#161950]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Profile viewed</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Organization updated</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Logged in</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            
            <Card className="shadow-md border border-gray-100 bg-[#161950] text-white">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-2">Need Help?</h4>
                <p className="text-white/90 text-sm mb-4">
                  Our support team is here to help you with any questions.
                </p>
                <Button variant="secondary" size="sm" className="w-full bg-white text-[#161950] hover:bg-gray-100">
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
