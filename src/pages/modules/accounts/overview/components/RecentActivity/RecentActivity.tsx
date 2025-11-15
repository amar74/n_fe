import React from 'react';
import { FileText, Calendar, CheckCircle } from 'lucide-react';
import { RecentActivityItem } from '../../../AccountDetailsPage.types';

const iconMap = {
  FileText,
  Calendar,
  CheckCircle,
};

type RecentActivityProps = {
  activities: RecentActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white border border-[#f0f0f0] rounded-[28px] py-6 px-0 w-full h-full shadow-sm">
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="px-6">
          <h2 className="font-inter font-bold text-[#0f0901] text-[24px] leading-normal">
            Recent Activity
          </h2>
        </div>

        <div className="flex flex-col w-full">
          {activities.map((activity, index) => {
            const IconComponent = iconMap[activity.icon as keyof typeof iconMap];
            const isLast = index === activities.length - 1;
            
            return (
              <div
                key={activity.id}
                className={`flex items-start gap-3 px-6 py-4 w-full relative ${
                  !isLast ? 'border-b border-[#eaeaea]' : ''
                }`}
              >

                <div className="mt-1 flex-shrink-0">
                  <IconComponent 
                    className="h-4 w-4" 
                    style={{ color: activity.color || '#6c6c6c' }} 
                  />
                </div>

                
                <div className="flex flex-col gap-1 flex-1 min-w-0 h-full">
                  <h3 className="font-inter font-semibold text-[#0f0901] text-[16px] leading-snug break-words">
                    {activity.title}
                  </h3>
                  <span className="font-inter font-medium text-[#a7a7a7] text-[14px] leading-normal block break-words">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
