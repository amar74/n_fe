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
  Target,
  FolderTree,
  Plus,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { ExpenseCategoryManagement } from '@/pages/OrganizationSettingsPage/components/ExpenseCategoryManagement';

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
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Organization</h2>
          <p className="text-gray-600">Unable to load organization data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Accounts', value: organization.total_accounts || 0, icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Active Opportunities', value: organization.active_opportunities || 0, icon: Target, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Team Members', value: organization.total_members || 0, icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const quickActions = [
    {
      label: 'View Accounts',
      icon: Building2,
      color: 'text-[#161950]',
      bgColor: 'bg-[#161950]/5',
      link: '/module/accounts',
      disabled: false,
    },
    {
      label: 'Manage Settings',
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

              
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight">
                    <Clock className="h-5 w-5 text-[#161950]" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      const content = (
                        <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}>
                          <div className={`w-8 h-8 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                            <Icon className={`h-4 w-4 ${action.color}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{action.label}</span>
                          {!action.disabled && <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />}
                        </div>
                      );
                      
                      return action.disabled ? (
                        <div key={action.label}>{content}</div>
                      ) : (
                        <Link key={action.label} to={action.link}>
                          {content}
                        </Link>
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
                <CardTitle className="text-2xl font-bold tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Organization Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-2 block" style={{ fontFamily: "'Outfit', sans-serif" }}>Organization Name</label>
                    <p className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{organization.name}</p>
                  </div>
                  {organization.website && (
                    <div>
                      <label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <Globe className="h-4 w-4" />
                        Website
                      </label>
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-blue-600 hover:underline"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {organization.website}
                      </a>
                    </div>
                  )}
                  {organization.address && (
                    <div>
                      <label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <MapPin className="h-4 w-4" />
                        Address
                      </label>
                      <p className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {organization.address.line1}
                        {organization.address.line2 && `, ${organization.address.line2}`}
                        {organization.address.city && `, ${organization.address.city}`}
                        {organization.address.state && `, ${organization.address.state}`}
                        {organization.address.pincode && ` ${organization.address.pincode}`}
                      </p>
                    </div>
                  )}
                  {organization.contact?.email && (
                    <div>
                      <label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <p className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{organization.contact.email}</p>
                    </div>
                  )}
                  {organization.contact?.phone && (
                    <div>
                      <label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <Phone className="h-4 w-4" />
                        Phone
                      </label>
                      <p className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{organization.contact.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            
            <ExpenseCategoryManagement />

            
            {recentActivity && recentActivity.length > 0 && (
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold tracking-tight leading-tight">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity: any) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
