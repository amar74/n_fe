import { useMyOrganization } from '@/hooks/useOrganizations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { 
  Building2, 
  Users, 
  Settings, 
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Phone,
  Edit,
  ChevronRight,
  TrendingUp,
  Award,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Target
} from 'lucide-react';

export default function OrganizationSettingsPage() {
  const { data: organization, isLoading, error } = useMyOrganization();

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['orgRecentActivity'],
    queryFn: async () => {
      const [accountsRes, opportunitiesRes] = await Promise.all([
        apiClient.get('/accounts?page=1&page_size=3').catch(() => ({ data: { accounts: [] } })),
        apiClient.get('/opportunities?page=1&page_size=3').catch(() => ({ data: { opportunities: [] } })),
      ]);
      
      const activities = [];
      
      // Add recent accounts
      if (accountsRes.data?.accounts) {
        accountsRes.data.accounts.forEach((account: any) => {
          activities.push({
            id: account.account_id,
            type: 'account',
            title: `New account: ${account.client_name}`,
            time: new Date(account.created_at),
            icon: Building2,
            color: 'bg-blue-500',
          });
        });
      }
      
      // Add recent opportunities
      if (opportunitiesRes.data?.opportunities) {
        opportunitiesRes.data.opportunities.forEach((opp: any) => {
          activities.push({
            id: opp.id,
            type: 'opportunity',
            title: `New opportunity: ${opp.project_name}`,
            time: new Date(opp.created_at),
            icon: Target,
            color: 'bg-green-500',
          });
        });
      }
      
      // Sort by time (most recent first) and take top 5
      return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
    },
    enabled: !!organization,
  });

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-600';
    if (percentage >= 70) return 'bg-blue-600';
    if (percentage >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950]"></div>
          <p className="text-gray-600">Loading organization settings...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load organization settings.</p>
          <Link to="/">
            <Button className="bg-[#161950] hover:bg-[#161950]/90">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Profile Complete',
      value: `${organization.profile_completion || 0}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Team Members',
      value: String(organization.team_members_count || 0),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Active Since',
      value: organization.created_at ? new Date(organization.created_at).getFullYear().toString() : 'N/A',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Status',
      value: organization.status || 'Active',
      icon: CheckCircle,
      color: 'text-[#161950]',
      bgColor: 'bg-[#161950]/5',
    },
  ];

  const quickActions = [
    {
      title: 'Edit Organization',
      description: 'Update organization details and information',
      icon: Edit,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/organization/update',
    },
    {
      title: 'Manage Team',
      description: 'Add or remove team members and set permissions',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/module/resources/management',
    },
    {
      title: 'Security Settings',
      description: 'Configure security and access controls',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/organization/settings',
      disabled: true,
    },
    {
      title: 'General Settings',
      description: 'Organization-wide settings and preferences',
      icon: Settings,
      color: 'text-[#161950]',
      bgColor: 'bg-[#161950]/5',
      link: '/organization/settings',
      disabled: true,
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
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link 
            to="/profile" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-all hover:gap-3 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-extrabold mb-3 tracking-tight leading-tight text-white drop-shadow-lg">
                Organization Settings
              </h1>
              <p className="text-white text-lg font-medium leading-relaxed drop-shadow-md">
                Manage your organization's information and team
              </p>
            </div>
            <Link to="/organization/update">
              <Button className="bg-white text-[#161950] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 h-12 px-6 font-semibold">
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight">
                    <Building2 className="h-5 w-5 text-[#161950]" />
                    Organization Logo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-2xl bg-[#161950] flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                        {getInitials(organization.name)}
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-100">
                        <Camera className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    <h3 className="font-extrabold text-2xl text-gray-900 text-center mb-1 tracking-tight leading-tight">
                      {organization.name}
                    </h3>
                    {organization.website && (
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline text-center mb-4"
                      >
                        {organization.website}
                      </a>
                    )}
                    <Link to="/organization/update" className="w-full">
                      <Button variant="outline" size="sm" className="w-full border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Logo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              
              <Card className="border border-gray-100 shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Profile Completion</span>
                      <span className={`text-lg font-bold ${getCompletionColor(Number(organization.profile_completion || 0))}`}>
                        {Number(organization.profile_completion || 0)}%
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`${getCompletionBgColor(Number(organization.profile_completion || 0))} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${organization.profile_completion || 0}%` }}
                      ></div>
                    </div>
                    {Number(organization.profile_completion || 0) < 100 && (
                      <p className="text-xs text-gray-600">
                        Complete your organization profile to unlock all features
                      </p>
                    )}
                    {Number(organization.profile_completion || 0) === 100 && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Profile Complete!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight">
                    <TrendingUp className="h-5 w-5 text-[#161950]" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                              <Icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{String(stat.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="border border-gray-100 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight">
                  <Building2 className="h-5 w-5 text-[#161950]" />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Organization Name</label>
                    <p className="text-base font-semibold text-gray-900 tracking-tight">{organization.name}</p>
                  </div>

                  
                  {organization.website && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Website
                      </label>
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline tracking-tight transition-colors block"
                      >
                        {organization.website}
                      </a>
                    </div>
                  )}

                  
                  {organization.contact?.email && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </label>
                      <p className="text-base font-semibold text-gray-900 tracking-tight">{organization.contact.email}</p>
                    </div>
                  )}

                  
                  {organization.contact?.phone && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Phone
                      </label>
                      <p className="text-base font-semibold text-gray-900 tracking-tight">{organization.contact.phone}</p>
                    </div>
                  )}

                  
                  {organization.address && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        Address
                      </label>
                      <p className="text-base font-semibold text-gray-900 leading-relaxed tracking-tight">
                        {organization.address.line1}
                        {organization.address.line2 && `, ${organization.address.line2}`}
                        <br />
                        {organization.address.city && `${organization.address.city}, `}
                        {organization.address.state && `${organization.address.state} `}
                        {organization.address.pincode}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-5 tracking-tight leading-tight">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const cardContent = (
                    <Card className={`border border-gray-100 shadow-md transition-all duration-200 ${
                      action.disabled 
                        ? 'opacity-60 cursor-not-allowed' 
                        : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                    } group`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center ${
                              action.disabled ? '' : 'group-hover:scale-110'
                            } transition-transform`}>
                              <Icon className={`h-6 w-6 ${action.color}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-gray-900 mb-1 ${
                                action.disabled ? '' : 'group-hover:text-[#161950]'
                              } transition-colors`}>
                                {action.title}
                                {action.disabled && (
                                  <Badge className="ml-2 bg-gray-100 text-gray-600 text-xs">
                                    Coming Soon
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                          </div>
                          {!action.disabled && (
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#161950] group-hover:translate-x-1 transition-all" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                  
                  return action.disabled ? (
                    <div key={action.title}>
                      {cardContent}
                    </div>
                  ) : (
                    <Link key={action.title} to={action.link}>
                      {cardContent}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-5 tracking-tight leading-tight">Recent Activity</h3>
              <Card className="border border-gray-100 shadow-md">
                <CardContent className="p-6">
                  {!recentActivity || recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No recent activity</p>
                      <p className="text-xs text-gray-400 mt-1">Start by creating accounts or opportunities</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-2 h-2 ${activity.color} rounded-full mt-2 flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            
            <Card className="border-2 border-white/20 shadow-2xl bg-gradient-to-br from-[#161950] via-[#1e2563] to-[#2a3175] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
              
              <CardContent className="p-7 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                    <Settings className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl mb-2 text-white">Need Help?</h4>
                    <p className="text-white text-sm mb-4 leading-relaxed">
                      Our support team is here to help you manage your organization settings.
                    </p>
                    <Button variant="secondary" size="sm" className="bg-white text-[#161950] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
