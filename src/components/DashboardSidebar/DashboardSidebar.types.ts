import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
  children?: NavigationItem[];
}

export type DashboardSidebarProps = {
  className?: string;
}

export interface UseDashboardSidebarReturn {
  handleLogout: () => Promise<void>;
}
