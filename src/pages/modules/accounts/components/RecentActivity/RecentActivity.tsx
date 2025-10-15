import React from 'react';
import { RecentActivityItem } from '../../AccountDetailsPage.types';

type RecentActivityProps = {
  activities: RecentActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Define colors for each activity
  const activityColors = ['#16A34A', '#2563EB', '#9333EA']; // green, blue, purple

  return (
    <div className="w-full h-96 p-6 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] flex flex-col justify-start items-start gap-3.5">
      
      <div className="inline-flex justify-start items-start gap-5">
        <div className="justify-start text-slate-800 text-lg font-semibold font-['Outfit'] leading-7">
          Recent Activity
        </div>
      </div>

      
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-black/10"></div>

      
      <div className="self-stretch flex-1 flex flex-col justify-between items-start">
        {activities.slice(0, 3).map((activity, index) => {
          const isLast = index === activities.length - 1 || index === 2;
          const color = activityColors[index] || '#16A34A';

          return (
            <div
              key={activity.id}
              className={`self-stretch flex-1 px-6 py-5 inline-flex justify-start items-start gap-2 ${
                !isLast ? 'border-b border-gray-200' : ''
              }`}
            >
              
              <div className="relative">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="6" cy="10" r="6" fill={color}/>
                </svg>
              </div>

              
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                <div className="self-stretch justify-start text-slate-800 text-lg font-semibold font-['Outfit']">
                  {activity.title}
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-3">
                  <div className="w-full justify-start text-neutral-400 text-base font-medium font-['Outfit']">
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
