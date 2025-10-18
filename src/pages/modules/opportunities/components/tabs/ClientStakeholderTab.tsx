import { memo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, AddButton } from './shared';
import { TabProps } from './types';
import { 
  useOpportunityStakeholders, 
  useCreateOpportunityStakeholder,
  useOpportunityDrivers,
  useCreateOpportunityDriver 
} from '@/hooks/useOpportunityTabs';
import { Stakeholder, Driver } from '@/types/opportunityTabs';

const ClientStakeholderTab = memo(({ opportunity }: TabProps) => {
  const { data: stakeholders = [], isLoading: stakeholdersLoading } = useOpportunityStakeholders(opportunity?.id || '');
  const { data: drivers = [], isLoading: driversLoading } = useOpportunityDrivers(opportunity?.id || '');
  const createStakeholderMutation = useCreateOpportunityStakeholder(opportunity?.id || '');
  const createDriverMutation = useCreateOpportunityDriver(opportunity?.id || '');

  const handleAddStakeholder = () => {
    console.log('Add stakeholder clicked');
  };

  const handleAddDriver = () => {
    console.log('Add driver clicked');
  };

  const politicalDrivers = drivers.filter((driver: Driver) => driver.category === 'Political').map((driver: Driver) => driver.description);
  const technicalRequirements = drivers.filter((driver: Driver) => driver.category === 'Technical').map((driver: Driver) => driver.description);
  const financialConstraints = drivers.filter((driver: Driver) => driver.category === 'Financial').map((driver: Driver) => driver.description);

  if (stakeholdersLoading || driversLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Key Stakeholders</h3>
            <AddButton onClick={handleAddStakeholder} />
          </div>
          <div className="h-px bg-black/10 mb-5"></div>
        </div>
        
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Stakeholder Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Contact Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Influence Level
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stakeholders.map((stakeholder: Stakeholder, index: number) => (
                  <tr key={stakeholder.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stakeholder.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stakeholder.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stakeholder.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stakeholder.contact_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        stakeholder.influence_level === 'High' ? 'bg-red-50 text-red-600' :
                        stakeholder.influence_level === 'Medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {stakeholder.influence_level} Influence
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Client Drivers & Criteria</h3>
            <AddButton onClick={handleAddDriver} />
          </div>
          <div className="h-px bg-black/10 mb-5"></div>
        </div>
        
        <div className="px-6 pb-6">
          <div className="p-6 bg-stone-50 rounded-[20px] space-y-5">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Political Drivers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {politicalDrivers.map((driver: string, index: number) => (
                  <div key={index} className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <span className="text-sm text-gray-900">{driver}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="h-px bg-black/10"></div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Technical Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {technicalRequirements.map((requirement: string, index: number) => (
                  <div key={index} className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <span className="text-sm text-gray-900">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="h-px bg-black/10"></div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Financial Constraints</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {financialConstraints.map((constraint: string, index: number) => (
                  <div key={index} className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <span className="text-sm text-gray-900">{constraint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ClientStakeholderTab.displayName = 'ClientStakeholderTab';

export default ClientStakeholderTab;