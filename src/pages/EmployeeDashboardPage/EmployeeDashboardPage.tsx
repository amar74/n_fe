/**
 * Employee Dashboard Page with RBAC (Role-Based Access Control)
 * 
 * Implements role-based module access according to RBAC documentation:
 * - Reference: docs/docs/security/rbac-entitlements.md
 * - RBAC Roles: platform_admin, org_admin, manager, contributor, viewer
 * 
 * Module access is determined by:
 * 1. Explicit user permissions (highest priority)
 * 2. RBAC role mapping from user.role and employee record
 * 3. Default viewer role (read-only)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ClipboardList,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  FileSignature,
  FolderKanban,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Layers,
  Sparkles,
  ArrowRight,
  Building2,
  Calendar,
  Target,
  Activity,
  Wallet,
  Receipt,
  PieChart as PieChartIcon,
  Briefcase,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

interface AssignedSurvey {
  id: string;
  title: string;
  description: string;
  status: string;
  is_completed: boolean;
  survey_link: string;
  distribution_id: string;
}

// All available modules with their permission requirements
const ALL_MODULES = [
  {
    name: 'Opportunities',
    description: 'Track and manage sales opportunities',
    icon: TrendingUp,
    path: '/module/opportunities',
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-50 to-blue-100',
    iconColor: 'text-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    permissionKey: 'opportunities',
    requiredPermission: 'view',
  },
  {
    name: 'Accounts',
    description: 'Manage client accounts and relationships',
    icon: Users,
    path: '/module/accounts',
    gradient: 'from-purple-500 to-purple-600',
    lightGradient: 'from-purple-50 to-purple-100',
    iconColor: 'text-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    permissionKey: 'accounts',
    requiredPermission: 'view',
  },
  {
    name: 'Proposals',
    description: 'Create and track proposals',
    icon: FileText,
    path: '/module/proposals',
    gradient: 'from-green-500 to-green-600',
    lightGradient: 'from-green-50 to-green-100',
    iconColor: 'text-green-600',
    hoverColor: 'hover:from-green-600 hover:to-green-700',
    permissionKey: 'proposals',
    requiredPermission: 'view',
  },
  {
    name: 'Resources',
    description: 'Manage team and resources',
    icon: Package,
    path: '/module/resources',
    gradient: 'from-orange-500 to-orange-600',
    lightGradient: 'from-orange-50 to-orange-100',
    iconColor: 'text-orange-600',
    hoverColor: 'hover:from-orange-600 hover:to-orange-700',
    permissionKey: 'resources',
    requiredPermission: 'view',
  },
  {
    name: 'Contracts',
    description: 'Contract management and tracking',
    icon: FileSignature,
    path: '/module/contracts',
    gradient: 'from-indigo-500 to-indigo-600',
    lightGradient: 'from-indigo-50 to-indigo-100',
    iconColor: 'text-indigo-600',
    hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
    permissionKey: 'contracts',
    requiredPermission: 'view',
  },
  {
    name: 'Projects',
    description: 'Project planning and execution',
    icon: FolderKanban,
    path: '/module/projects',
    gradient: 'from-pink-500 to-pink-600',
    lightGradient: 'from-pink-50 to-pink-100',
    iconColor: 'text-pink-600',
    hoverColor: 'hover:from-pink-600 hover:to-pink-700',
    permissionKey: 'projects',
    requiredPermission: 'view',
  },
  {
    name: 'Finance',
    description: 'Financial tracking and reporting',
    icon: DollarSign,
    path: '/module/finance',
    gradient: 'from-emerald-500 to-emerald-600',
    lightGradient: 'from-emerald-50 to-emerald-100',
    iconColor: 'text-emerald-600',
    hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
    permissionKey: 'finance',
    requiredPermission: 'view',
  },
  {
    name: 'Procurement',
    description: 'Procurement and purchasing',
    icon: ShoppingCart,
    path: '/module/procurement',
    gradient: 'from-cyan-500 to-cyan-600',
    lightGradient: 'from-cyan-50 to-cyan-100',
    iconColor: 'text-cyan-600',
    hoverColor: 'hover:from-cyan-600 hover:to-cyan-700',
    permissionKey: 'procurement',
    requiredPermission: 'view',
  },
  {
    name: 'KPIs',
    description: 'Key performance indicators',
    icon: BarChart3,
    path: '/module/kpis',
    gradient: 'from-red-500 to-red-600',
    lightGradient: 'from-red-50 to-red-100',
    iconColor: 'text-red-600',
    hoverColor: 'hover:from-red-600 hover:to-red-700',
    permissionKey: 'kpis',
    requiredPermission: 'view',
  },
  {
    name: 'Surveys',
    description: 'Client and employee surveys',
    icon: MessageSquare,
    path: '/module/surveys',
    gradient: 'from-violet-500 to-violet-600',
    lightGradient: 'from-violet-50 to-violet-100',
    iconColor: 'text-violet-600',
    hoverColor: 'hover:from-violet-600 hover:to-violet-700',
    permissionKey: 'surveys',
    requiredPermission: 'view',
  },
  {
    name: 'Attendance',
    description: 'Track your daily attendance and work hours',
    icon: Timer,
    path: '/employee/attendance',
    gradient: 'from-amber-500 to-amber-600',
    lightGradient: 'from-amber-50 to-amber-100',
    iconColor: 'text-amber-600',
    hoverColor: 'hover:from-amber-600 hover:to-amber-700',
    permissionKey: 'attendance',
    requiredPermission: 'view',
  },
  {
    name: 'Delivery Models',
    description: 'Delivery approach templates',
    icon: Layers,
    path: '/module/delivery-models',
    gradient: 'from-teal-500 to-teal-600',
    lightGradient: 'from-teal-50 to-teal-100',
    iconColor: 'text-teal-600',
    hoverColor: 'hover:from-teal-600 hover:to-teal-700',
    permissionKey: 'delivery_models',
    requiredPermission: 'view',
  },
  {
    name: 'AI Agentic',
    description: 'AI-powered assistant and automation',
    icon: Sparkles,
    path: '/module/ai-agentic',
    gradient: 'from-[#161950] to-[#1E2B5B]',
    lightGradient: 'from-[#161950]/10 to-[#1E2B5B]/10',
    iconColor: 'text-[#161950]',
    hoverColor: 'hover:from-[#1E2B5B] hover:to-[#161950]',
    permissionKey: 'ai_agentic',
    requiredPermission: 'view',
  },
];

interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  role: string | null;
  department: string | null;
  employee_number: string;
  status: string;
}

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const { backendUser } = useAuth();
  const [assignedSurveys, setAssignedSurveys] = useState<AssignedSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user's employee record
  const { data: employeeRecord, isLoading: employeeLoading } = useQuery<EmployeeRecord>({
    queryKey: ['employeeRecord', backendUser?.id],
    queryFn: async () => {
      if (!backendUser?.id) return null;
      try {
        const response = await apiClient.get('/resources/employees/me');
        return response.data;
      } catch (error: any) {
        // If employee record doesn't exist, that's okay - user might not be an employee
        if (error.response?.status === 404) {
          return null;
        }
        console.error('Error fetching employee record:', error);
        return null;
      }
    },
    enabled: !!backendUser?.id,
  });

  // Fetch user permissions
  const { data: userPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['userPermissions', backendUser?.id],
    queryFn: async () => {
      if (!backendUser?.id) return null;
      try {
        // Try the user-permissions endpoint first
        const response = await apiClient.get(`/api/user-permissions/${backendUser.id}`);
        return response.data;
      } catch (error) {
        // Fallback to resources endpoint
        try {
          const response = await apiClient.get(`/api/resources/users/${backendUser.id}/permissions`);
          return response.data;
        } catch (fallbackError) {
          console.error('Error fetching permissions:', fallbackError);
          return null;
        }
      }
    },
    enabled: !!backendUser?.id,
  });

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['employeeDashboardStats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/dashboard/stats');
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!backendUser,
  });

  useEffect(() => {
    loadAssignedSurveys();
  }, []);

  const loadAssignedSurveys = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/employee/surveys/assigned');
      setAssignedSurveys(response.data);
    } catch (error) {
      console.error('Error loading assigned surveys:', error);
      // Don't show error toast if endpoint doesn't exist
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSurvey = (survey: AssignedSurvey) => {
    navigate(`/employee/survey/${survey.id}`);
  };

  // Map user role to RBAC role according to RBAC documentation
  const rbacRole = useMemo(() => {
    if (!backendUser) return 'viewer';
    
    const userRole = backendUser.role?.toLowerCase() || '';
    
    if (userRole === 'admin' || userRole === 'vendor' || userRole === 'super_admin' || userRole === 'platform_admin' || userRole === 'org_admin') {
      return 'org_admin'; // Treated as org_admin for RBAC
    }

    if (['manager', 'contributor', 'viewer'].includes(userRole)) {
      return userRole;
    }
    if (employeeRecord) {
      const jobTitle = employeeRecord.job_title?.toLowerCase() || '';
      const department = employeeRecord.department?.toLowerCase() || '';

      if (jobTitle.includes('manager') || jobTitle.includes('lead') || jobTitle.includes('director')) {
        return 'manager';
      }

      // HR roles → RBAC 'contributor' (with HR scope per RBAC guide)
      if (department === 'hr' || jobTitle.includes('hr') || jobTitle.includes('human resources')) {
        return 'contributor'; // HR is contributor with HR scope
      }

      // Finance Manager → RBAC 'manager' (with finance scope)
      if (department === 'finance' || jobTitle.includes('finance') || jobTitle.includes('accountant')) {
        if (jobTitle.includes('manager')) {
          return 'manager'; // Finance Manager
        }
        return 'contributor'; // Finance employee
      }

      // Other employees → RBAC 'contributor' or 'viewer' based on job
      if (userRole === 'employee') {
        // Check if it's a read-only role
        if (jobTitle.includes('analyst') || jobTitle.includes('viewer') || jobTitle.includes('read-only')) {
          return 'viewer';
        }
        return 'contributor'; // Standard employee
      }
    }

    // Default: viewer (read-only access)
    return 'viewer';
  }, [backendUser, employeeRecord]);

  // Filter modules based on RBAC matrix (rbac-entitlements.md)
  const accessibleModules = useMemo(() => {
    if (!backendUser) return [];

    const userRole = backendUser.role?.toLowerCase() || '';
    
    // If user has an employee record, they're an employee - use RBAC filtering
    // Even if their user role is admin, if they're an employee, they should follow RBAC rules
    const isEmployee = !!employeeRecord;
    
    // Admin and vendor roles have access to all modules (bypass RBAC filtering)
    // BUT: Only if they're NOT employees (true platform/org admins)
    if (!isEmployee && (userRole === 'admin' || userRole === 'vendor' || userRole === 'super_admin' || userRole === 'platform_admin' || userRole === 'org_admin')) {
      return ALL_MODULES;
    }

    // RBAC-based module access according to rbac-entitlements.md
    // Based on: docs/docs/security/rbac-entitlements.md
    // Define this BEFORE checking explicit permissions so it can be used in the check
    const rbacModuleAccess: Record<string, string[]> = {
      // platform_admin / org_admin: All modules (full access)
      // ✓ All resources: read/write
      org_admin: [
        'opportunities', 'accounts', 'proposals', 'projects', 'contracts',
        'procurement', 'finance', 'resources', 'kpis', 'surveys',
        'delivery_models', 'ai_agentic', 'attendance'
      ],
      
      // manager: Most modules with write access (limited finance)
      manager: [
        'opportunities', 'accounts', 'proposals', 'projects', 'contracts',
        'procurement', 'finance', 'resources', 'kpis', 'surveys',
        'delivery_models', 'ai_agentic', 'attendance'
        // Note: Finance access is limited to owned projects only
      ],
      
      // contributor: Standard employee with view/create access (partial write)
      contributor: [
        'opportunities',  // View/create, assigned
        'accounts',       // View/create, assigned
        'proposals',      // View/create, assigned
        'projects',       // View/create, assigned
        'resources',      // View/create, assigned
        'surveys',        // Assigned surveys
        'kpis',           // View/create
        'attendance'      // Employee attendance tracking
        // Contracts: no dashboard access (partial write in context)
        // Procurement: no dashboard access (partial write in context)
        // Finance: excluded - no module access (only limited read)
        // Delivery Models: no dashboard access
        // AI Agentic: no dashboard access
      ],
      
      // viewer: Read-only access - LIMITED modules only
      viewer: [
        'opportunities',  // Read-only, assigned only
        'accounts',       // Read-only, assigned only
        'projects',       // Read-only, assigned only
        'resources',      // Own profile only
        'surveys',        // Assigned surveys only
        'attendance'      // Employee attendance tracking
        // Finance: no access
        // Contracts: no dashboard access (read-only in context)
        // Procurement: no dashboard access (read-only in context)
        // Proposals: no dashboard access (read-only in context)
        // KPIs: no dashboard access (read-only in context)
        // Delivery Models: no access
        // AI Agentic: no access
      ],
    };

    // If we have explicit user permissions with actual data, use them BUT respect RBAC limits
    // Explicit permissions should not override RBAC restrictions for employees
    if (userPermissions?.permissions && Object.keys(userPermissions.permissions).length > 0) {
      // Get RBAC-allowed modules first
      const rbacAllowedModules = rbacModuleAccess[rbacRole] || rbacModuleAccess.viewer;
      
      const filtered = ALL_MODULES.filter(module => {
        // First check if module is allowed by RBAC role - RBAC takes precedence
        if (!rbacAllowedModules.includes(module.permissionKey)) {
          return false; // Not allowed by RBAC, don't show even if explicit permission exists
        }
        
        // Then check explicit permissions (but RBAC already restricted the list)
        const modulePermissions = userPermissions.permissions[module.permissionKey as keyof typeof userPermissions.permissions];
        if (Array.isArray(modulePermissions) && modulePermissions.length > 0) {
          return modulePermissions.includes(module.requiredPermission);
        }
        
        // If no explicit permission but RBAC allows, show it (for employees, rely on RBAC)
        return true;
      });
      
      // Only use explicit permissions if we got actual results AND respect RBAC
      if (filtered.length > 0) {
        return filtered;
      }
    }

    // Use RBAC-based module access (fallback if no explicit permissions or explicit permissions didn't match)
    const allowedModules = rbacModuleAccess[rbacRole] || rbacModuleAccess.viewer;
    const filtered = ALL_MODULES.filter(module => allowedModules.includes(module.permissionKey));
    
    return filtered;
  }, [backendUser, userPermissions, rbacRole, employeeRecord]);

  const pendingSurveys = assignedSurveys.filter(s => !s.is_completed);
  const completedSurveys = assignedSurveys.filter(s => s.is_completed);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const userName = employeeRecord?.name || backendUser?.name || backendUser?.email?.split('@')[0] || 'Employee';
  const displayName = userName;
  
  const roleDisplayName = useMemo(() => {
    // Show job title if available
    if (employeeRecord?.job_title) {
      return employeeRecord.job_title;
    }
    
    // Map RBAC role to display name
    const rbacDisplayNames: Record<string, string> = {
      'org_admin': 'Organization Admin',
      'platform_admin': 'Platform Admin',
      'manager': 'Manager',
      'contributor': 'Contributor',
      'viewer': 'Viewer',
    };
    
    if (rbacRole && rbacDisplayNames[rbacRole]) {
      return rbacDisplayNames[rbacRole];
    }
    
    if (employeeRecord?.department) {
      return `${employeeRecord.department.charAt(0).toUpperCase() + employeeRecord.department.slice(1)} Employee`;
    }
    
    if (backendUser?.role) {
      return backendUser.role.charAt(0).toUpperCase() + backendUser.role.slice(1);
    }
    
    return 'Employee';
  }, [employeeRecord, backendUser, rbacRole]);

  // Employee stats
  const employeeStats = [
    {
      title: 'Assigned Surveys',
      value: assignedSurveys.length,
      icon: ClipboardList,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Pending Surveys',
      value: pendingSurveys.length,
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Completed Surveys',
      value: completedSurveys.length,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Accessible Modules',
      value: accessibleModules.length,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {greeting}, {displayName}! 👋
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {employeeRecord && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#161950] text-white font-semibold px-3 py-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {roleDisplayName}
                    </Badge>
                    {employeeRecord.department && (
                      <Badge variant="outline" className="border-gray-300 text-gray-700 px-3 py-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {employeeRecord.department}
                      </Badge>
                    )}
                    {employeeRecord.employee_number && (
                      <Badge variant="outline" className="border-gray-300 text-gray-700 px-3 py-1 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        ID: {employeeRecord.employee_number}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <Calendar className="h-4 w-4" />
              <span style={{ fontFamily: "'Outfit', sans-serif" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>My Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {employeeStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {stat.title}
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {stat.value}
                        </h3>
                      </div>
                      <div className={`p-4 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>My Modules</h2>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Modules you have access to based on your role and permissions
              </p>
            </div>
          </div>
          {(permissionsLoading || employeeLoading) ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950] mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Loading modules...</p>
            </div>
          ) : accessibleModules.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>No modules available</p>
                <p className="text-sm text-gray-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Contact your administrator to get access to modules
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {accessibleModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link
                    key={module.name}
                    to={module.path}
                    className="group"
                  >
                    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full overflow-hidden">
                      <div className={`h-1 bg-gradient-to-r ${module.gradient} ${module.hoverColor} transition-all duration-300`}></div>
                      <CardContent className="p-6">
                        <div className={`w-14 h-14 bg-gradient-to-br ${module.lightGradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                          <Icon className={`h-7 w-7 ${module.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#161950] transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {module.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {module.description}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-[#161950] opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          Open <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {assignedSurveys.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>My Surveys</h2>
            
            {pendingSurveys.length > 0 && (
              <div className="mb-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Pending Surveys ({pendingSurveys.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingSurveys.map((survey) => (
                        <div 
                          key={survey.id}
                          className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-2 border-orange-200 hover:border-orange-300 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{survey.title}</h3>
                            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{survey.description}</p>
                            <Badge className="bg-orange-100 text-orange-700">
                              Awaiting Response
                            </Badge>
                          </div>
                          <Button
                            onClick={() => handleTakeSurvey(survey)}
                            className="bg-[#161950] hover:bg-[#1E2B5B] ml-4"
                          >
                            Take Survey →
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {completedSurveys.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Completed Surveys ({completedSurveys.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedSurveys.map((survey) => (
                      <div 
                        key={survey.id}
                        className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{survey.title}</h3>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{survey.description}</p>
                          <Badge className="bg-green-100 text-green-700">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!loading && assignedSurveys.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>No surveys assigned</p>
              <p className="text-sm text-gray-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                You don't have any surveys assigned to you yet
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950] mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Loading surveys...</p>
          </div>
        )}
      </div>
    </div>
  );
}
