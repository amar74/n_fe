import { useMyOrganization } from '@/hooks/useOrganizations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
  Camera
} from 'lucide-react';

export default function OrganizationSettingsPage() {
  const { data: organization, isLoading, error } = useMyOrganization();

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
      value: `${organization.profile_completion}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Team Members',
      value: '12',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Active Since',
      value: '2024',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Status',
      value: 'Active',
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
      link: '/organization',
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            to="/profile" 
            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight leading-tight">Organization Settings</h1>
              <p className="text-white/95 text-lg font-medium leading-relaxed">Manage your organization's information and team</p>
            </div>
            <Link to="/organization/update">
              <Button className="bg-white text-[#161950] hover:bg-gray-100">
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
                      <span className={`text-lg font-bold ${getCompletionColor(organization.profile_completion)}`}>
                        {organization.profile_completion}%
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`${getCompletionBgColor(organization.profile_completion)} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${organization.profile_completion}%` }}
                      ></div>
                    </div>
                    {organization.profile_completion < 100 && (
                      <p className="text-xs text-gray-600">
                        Complete your organization profile to unlock all features
                      </p>
                    )}
                    {organization.profile_completion === 100 && (
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
                          <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
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
                  const CardElement = action.disabled ? 'div' : Link;
                  const cardProps = action.disabled ? {} : { to: action.link };
                  
                  return (
                    <CardElement key={action.title} {...cardProps}>
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
                    </CardElement>
                  );
                })}
              </div>
            </div>

            
            <Card className="border border-gray-100 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight">
                  <Clock className="h-5 w-5 text-[#161950]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Organization settings viewed</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Organization details updated</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New team member added</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Organization created</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            
            <Card className="border border-gray-100 shadow-md bg-[#161950] text-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Need Help?</h4>
                    <p className="text-white/90 text-sm mb-4">
                      Our support team is here to help you manage your organization settings.
                    </p>
                    <Button variant="secondary" size="sm" className="bg-white text-[#161950] hover:bg-gray-100">
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
