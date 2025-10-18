import { memo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeliveryModelTabProps {
  opportunity: any;
}

const DeliveryModelTab = memo(({ opportunity }: DeliveryModelTabProps) => {
  const phases = [
    {
      title: 'Phase 1: Feasibility & Planning',
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-emerald-600',
      duration: '4 Months',
      by: 'HDR Engineering'
    },
    {
      title: 'Phase 2: Environmental Assessment',
      status: 'On-going',
      statusColor: 'bg-amber-50 text-amber-600',
      duration: '6 Months',
      by: 'AECOM'
    },
    {
      title: 'Phase 3: Preliminary Design',
      status: 'To start Q2 2026',
      statusColor: 'bg-gray-100 text-gray-500',
      duration: '8 Months',
      by: 'HDR Engineering'
    }
  ];

  const gapsAndNeeds = [
    'Need local environmental specialist familiar with Texas regulations',
    'Additional community engagement expertise required',
    'Specialized rail systems engineer for technical review'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Delivery Model</h2>
            <Button className="h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Add New</span>
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approach</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-gray-900 font-medium">Collaborative Design-Build Support</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Project Phases</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {phases.map((phase, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-base font-semibold text-gray-900 leading-tight">{phase.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${phase.statusColor}`}>
                        {phase.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Duration:</span> {phase.duration}
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        <span className="font-medium">By:</span> {phase.by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Identified Gaps & Needs</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {gapsAndNeeds.map((gap, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 leading-relaxed">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

DeliveryModelTab.displayName = 'DeliveryModelTab';

export default DeliveryModelTab;