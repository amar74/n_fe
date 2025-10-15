import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Package, 
  FileSignature, 
  FolderKanban, 
  DollarSign, 
  ShoppingCart, 
  BarChart3, 
  StickyNote,
  ArrowRight,
  Building2,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Module cards data
const modules = [
  {
    name: 'Opportunities',
    description: 'Track and manage sales opportunities',
    icon: TrendingUp,
    path: '/module/opportunities',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    name: 'Accounts',
    description: 'Manage client accounts and relationships',
    icon: Users,
    path: '/module/accounts',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
  {
    name: 'Proposals',
    description: 'Create and track proposals',
    icon: FileText,
    path: '/module/proposals',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    name: 'Resources',
    description: 'Manage team and resources',
    icon: Package,
    path: '/module/resources',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    name: 'Contracts',
    description: 'Contract management and tracking',
    icon: FileSignature,
    path: '/module/contracts',
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
  },
  {
    name: 'Projects',
    description: 'Project planning and execution',
    icon: FolderKanban,
    path: '/module/projects',
    color: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    iconColor: 'text-pink-500',
  },
  {
    name: 'Finance',
    description: 'Financial tracking and reporting',
    icon: DollarSign,
    path: '/module/finance',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    name: 'Procurement',
    description: 'Procurement and purchasing',
    icon: ShoppingCart,
    path: '/module/procurement',
    color: 'bg-cyan-500',
    lightColor: 'bg-cyan-50',
    iconColor: 'text-cyan-500',
  },
  {
    name: 'KPIs',
    description: 'Key performance indicators',
    icon: BarChart3,
    path: '/module/kpis',
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    name: 'Notes',
    description: 'Team notes and documentation',
    icon: StickyNote,
    path: '/module/notes',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
];

// Analytics/Stats data
// @amar74.soft - refactor needed
const stats = [
  {
    title: 'Active Accounts',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Open Opportunities',
    value: '18',
    change: '+8%',
    trend: 'up',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Active Projects',
    value: '12',
    change: '+5%',
    trend: 'up',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'This Month Revenue',
    value: '$125K',
    change: '+15%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
];

function DashboardWelcome() {
  const { user, backendUser } = useAuth();
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  
  const userName = backendUser?.email?.split('@')[0] || 'User';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {greeting}, {displayName}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome back to your dashboard. Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                          {stat.value}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-gray-500">from last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Modules</h2>
            <p className="text-sm text-gray-500">Click on any module to get started</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.name}
                  to={module.path}
                  className="group"
                >
                  <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 ${module.lightColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-6 w-6 ${module.iconColor}`} />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#ED8A09] transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {module.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-[#ED8A09] opacity-0 group-hover:opacity-100 transition-opacity">
                        Open <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/module/accounts">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                    <Users className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">New Account</div>
                      <div className="text-xs text-gray-500">Create account</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/module/opportunities">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors">
                    <TrendingUp className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">New Opportunity</div>
                      <div className="text-xs text-gray-500">Track new lead</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/module/proposals">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors">
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">New Proposal</div>
                      <div className="text-xs text-gray-500">Create proposal</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/module/notes/create">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 transition-colors">
                    <StickyNote className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">New Note</div>
                      <div className="text-xs text-gray-500">Add documentation</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardWelcome);
