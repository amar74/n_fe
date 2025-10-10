import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Target, 
  Star, 
  BarChart3, 
  FileText, 
  DollarSign 
} from 'lucide-react';
import { TabType } from '../../AccountDetailsPage.types';
import { ACCOUNT_DETAILS_TABS } from '../../AccountDetailsPage.constants';

const iconMap = {
  LayoutDashboard,
  Users,
  UserCheck,
  Target,
  Star,
  BarChart3,
  FileText,
  DollarSign,
};

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="w-full h-11 p-0.5 bg-[#FAFAF8] rounded-lg outline outline-1 outline-[#E5E7EB] inline-flex justify-start items-center overflow-x-auto">
      {ACCOUNT_DETAILS_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 self-stretch px-3 py-2.5 rounded-md flex justify-center items-center gap-2.5 min-w-fit
              ${isActive 
                ? 'bg-indigo-950 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]' 
                : ''
              }
            `}
          >
            <span className={`justify-start text-sm font-medium font-['Outfit'] leading-tight ${isActive ? 'text-white' : 'text-[#667085]'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
