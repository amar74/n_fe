import { useMyOrganization } from '@/hooks/organization';
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
import { DepartmentManagement } from '@/pages/OrganizationSettingsPage/components/DepartmentManagement';
import { RoleManagement } from '@/pages/OrganizationSettingsPage/components/RoleManagement';
import { ChangeLogoDialog } from '@/pages/OrganizationSettingsPage/components/ChangeLogoDialog';
import { useState } from 'react';

export default function OrganizationSettingsPage() {
  const { data: organization, isLoading, error } = useMyOrganization();
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);

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
        
        <div className="relative max-w-7xl mx-auto px-1 sm:px-3 lg:px-4 py-10">
          <Link 
            to="/profile" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-all hover:gap-3 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-extrabold mb-3 tracking-tight leading-tight text-white drop-shadow-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Organization Settings
              </h1>
              <p className="text-white text-lg font-medium leading-relaxed drop-shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Manage your organization's information and team
              </p>
            </div>
            <Link to="/organization/update">
              <Button className="bg-white text-[#161950] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 h-12 px-6 font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 sm:px-3 lg:px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#161950]"></div>
                <CardHeader className="border-b border-gray-100/50 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="w-8 h-8 bg-gradient-to-br from-[#161950] to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    Organization Logo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6 group">
                      {organization.logo_url ? (
                        <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-gray-100 transition-transform group-hover:scale-105">
                          <img
                            src={organization.logo_url as string}
                            alt={`${organization.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-[#161950] via-blue-700 to-purple-700 flex items-center justify-center text-white font-bold text-5xl shadow-2xl ring-4 ring-gray-100 transition-transform group-hover:scale-105">
                          {getInitials(organization.name)}
                        </div>
                      )}
                      <button
                        onClick={() => setIsLogoDialogOpen(true)}
                        className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-xl flex items-center justify-center hover:from-[#161950] hover:to-blue-600 hover:scale-110 transition-all duration-200 border-4 border-white ring-2 ring-gray-100"
                        title="Change logo"
                      >
                        <Camera className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                    <h3 className="font-extrabold text-2xl text-gray-900 text-center mb-2 tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {organization.name}
                    </h3>
                    {organization.website && (
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium text-center mb-6 flex items-center justify-center gap-2 transition-colors"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        <Globe className="h-4 w-4" />
                        {organization.website}
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-2 border-[#161950] text-[#161950] hover:bg-gradient-to-r hover:from-[#161950] hover:to-blue-600 hover:text-white hover:border-transparent hover:shadow-lg transition-all duration-200 font-semibold"
                      onClick={() => setIsLogoDialogOpen(true)}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Logo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600"></div>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                          <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: "'Outfit', sans-serif" }}>Profile Completion</span>
                      </div>
                      <span className={`text-2xl font-extrabold ${getCompletionColor(Number(organization.profile_completion || 0))}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {Number(organization.profile_completion || 0)}%
                      </span>
                    </div>
                    <div className="relative flex-1 bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                          Number(organization.profile_completion || 0) === 100 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                            : Number(organization.profile_completion || 0) >= 70
                            ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                            : Number(organization.profile_completion || 0) >= 40
                            ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                            : 'bg-gradient-to-r from-red-400 to-red-500'
                        } shadow-lg`}
                        style={{ width: `${organization.profile_completion || 0}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    {Number(organization.profile_completion || 0) < 100 && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          Complete your organization profile to unlock all features
                        </p>
                      </div>
                    )}
                    {Number(organization.profile_completion || 0) === 100 && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700" style={{ fontFamily: "'Outfit', sans-serif" }}>Profile Complete!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>
                <CardHeader className="border-b border-gray-100/50 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div 
                          key={stat.label} 
                          className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white transition-all duration-200 border border-gray-100/50 hover:border-gray-200 hover:shadow-md group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                              <Icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: "'Outfit', sans-serif" }}>{stat.label}</span>
                          </div>
                          <span className="text-lg font-extrabold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>{String(stat.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-600"></div>
                <CardHeader className="border-b border-gray-100/50 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      const content = (
                        <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                          action.disabled 
                            ? 'opacity-50 cursor-not-allowed bg-gray-50/50' 
                            : 'bg-white/60 hover:bg-white hover:shadow-md cursor-pointer border border-gray-100/50 hover:border-gray-200 group'
                        }`}>
                          <div className={`w-10 h-10 ${action.bgColor} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                            <Icon className={`h-5 w-5 ${action.color}`} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 flex-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{action.label}</span>
                          {!action.disabled && (
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#161950] group-hover:translate-x-1 transition-all duration-200" />
                          )}
                        </div>
                      );
                      
                      return action.disabled ? (
                        <div key={action.label}>{content}</div>
                      ) : (
                        <Link key={action.label} to={action.link} className="block">
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
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#161950] via-blue-600 to-indigo-600"></div>
              <CardHeader className="border-b border-gray-100/50 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold tracking-tight leading-tight flex items-center gap-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#161950] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    Organization Information
                  </CardTitle>
                  <Link to="/organization/update">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100/50 hover:shadow-md transition-all duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <Building2 className="h-3.5 w-3.5" />
                      Organization Name
                    </label>
                    <p className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{organization.name}</p>
                  </div>
                  {organization.website && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-emerald-50/30 border border-green-100/50 hover:shadow-md transition-all duration-200">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <Globe className="h-3.5 w-3.5" />
                        Website
                      </label>
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2 group"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {organization.website}
                        <Globe className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </a>
                    </div>
                  )}
                  {organization.address && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-100/50 hover:shadow-md transition-all duration-200">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <MapPin className="h-3.5 w-3.5" />
                        Address
                      </label>
                      <p className="text-base font-semibold text-gray-900 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {organization.address.line1}
                        {organization.address.line2 && `, ${organization.address.line2}`}
                        {organization.address.city && `, ${organization.address.city}`}
                        {organization.address.state && `, ${organization.address.state}`}
                        {organization.address.pincode && ` ${organization.address.pincode}`}
                      </p>
                    </div>
                  )}
                  {organization.contact?.email && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100/50 hover:shadow-md transition-all duration-200">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </label>
                      <a 
                        href={`mailto:${organization.contact.email}`}
                        className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {organization.contact.email}
                        <Mail className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
                      </a>
                    </div>
                  )}
                  {organization.contact?.phone && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/50 to-cyan-50/30 border border-teal-100/50 hover:shadow-md transition-all duration-200">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <Phone className="h-3.5 w-3.5" />
                        Phone
                      </label>
                      <a 
                        href={`tel:${organization.contact.phone}`}
                        className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {organization.contact.phone}
                        <Phone className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <ExpenseCategoryManagement />

            <DepartmentManagement />

            <RoleManagement />

            {recentActivity && recentActivity.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-600"></div>
                <CardHeader className="border-b border-gray-100/50 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-2xl font-bold tracking-tight leading-tight flex items-center gap-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {recentActivity.map((activity: any) => {
                      const Icon = activity.icon;
                      return (
                        <div 
                          key={activity.id} 
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/60 border border-gray-100/50 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all duration-200 group"
                        >
                          <div className={`w-12 h-12 ${activity.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{activity.title}</p>
                            <p className="text-xs text-gray-500 font-medium mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{formatTimeAgo(activity.time)}</p>
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

      {organization && (
        <ChangeLogoDialog
          open={isLogoDialogOpen}
          onOpenChange={setIsLogoDialogOpen}
          organizationId={String(organization.id)}
          currentLogoUrl={organization.logo_url as string | null | undefined}
          organizationName={organization.name}
        />
      )}
    </div>
  );
}
