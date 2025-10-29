import { 
  Target, 
  Building2, 
  FileText, 
  Users, 
  FileCheck, 
  Calendar, 
  Calculator, 
  ShoppingCart, 
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import { NavigationItem } from './DashboardSidebar.types';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'opportunities',
    name: 'Opportunities',
    path: '/module/opportunities',
    icon: Target,
  },
  {
    id: 'accounts',
    name: 'Accounts',
    path: '/module/accounts',
    icon: Building2,
  },
  {
    id: 'proposals',
    name: 'Proposals',
    path: '/module/proposals',
    icon: FileText,
  },
  {
    id: 'resources',
    name: 'Resources',
    path: '/module/resources',
    icon: Users,
    children: [
      {
        id: 'resources-dashboard',
        name: 'Dashboard',
        path: '/module/resources',
        icon: Users,
      },
      {
        id: 'resources-onboarding',
        name: 'Onboarding',
        path: '/module/resources/onboarding',
        icon: Users,
      },
      {
        id: 'resources-search',
        name: 'Search',
        path: '/module/resources/search',
        icon: Users,
      },
      {
        id: 'resources-management',
        name: 'Management',
        path: '/module/resources/management',
        icon: Users,
      },
      {
        id: 'staff-planning',
        name: 'Staff Planning',
        path: '/staffing-plan',
        icon: FileText,
      },
    ],
  },
  {
    id: 'contracts',
    name: 'Contracts',
    path: '/module/contracts',
    icon: FileCheck,
  },
  {
    id: 'projects',
    name: 'Projects',
    path: '/module/projects',
    icon: Calendar,
  },
  {
    id: 'finance',
    name: 'Finance',
    path: '/module/finance',
    icon: Calculator,
  },
  {
    id: 'procurement',
    name: 'Procurements',
    path: '/module/procurement',
    icon: ShoppingCart,
  },
  {
    id: 'kpi',
    name: "KPI's",
    path: '/module/kpis',
    icon: BarChart3,
  },
  {
    id: 'survey',
    name: 'Survey',
    path: '/module/survey',
    icon: ClipboardList,
    children: [
      {
        id: 'account-survey',
        name: 'Account Survey',
        path: '/module/survey/account',
        icon: Building2,
      },
      {
        id: 'employee-survey',
        name: 'Employee Survey',
        path: '/module/survey/employee',
        icon: Users,
      },
    ],
  },
];
