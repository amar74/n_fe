import { memo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeamReferencesTabProps {
  opportunity: any;
}

const TeamReferencesTab = memo(({ opportunity }: TeamReferencesTabProps) => {
  const teamMembers = [
    {
      name: 'Jennifer Williams',
      designation: 'Project Manager',
      experience: '12 years experience',
      availability: '100% Available',
      availabilityColor: 'bg-emerald-50 text-emerald-600'
    },
    {
      name: 'Carlos Rodriguez',
      designation: 'Transportation Planner',
      experience: '8 years experience',
      availability: '80% Available',
      availabilityColor: 'bg-amber-50 text-amber-600'
    },
    {
      name: 'Amanda Foster',
      designation: 'Environmental Specialist',
      experience: '6 years experience',
      availability: '60% Available',
      availabilityColor: 'bg-red-50 text-red-600'
    },
    {
      name: 'Jennifer Williams',
      designation: 'Project Manager',
      experience: '12 years experience',
      availability: '100% Available',
      availabilityColor: 'bg-emerald-50 text-emerald-600'
    }
  ];

  const references = [
    {
      projectName: 'Capital Metro BRT Study',
      client: 'Capital Metro',
      year: '2022',
      status: 'Successful implementation, ahead of schedule',
      statusColor: 'bg-emerald-50 text-emerald-600',
      totalAmount: '$1.2M'
    },
    {
      projectName: 'San Antonio Streetcar Extension',
      client: 'VIA Metropolitan Transit',
      year: '2022',
      status: 'Exceeded ridership projections by 15%',
      statusColor: 'bg-emerald-50 text-emerald-600',
      totalAmount: '$1.8M'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Proposed Delivery Team</h2>
            <Button className="h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Add New</span>
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.experience}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.availabilityColor}`}>
                      {member.availability}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button size="sm" className="bg-indigo-950 hover:bg-indigo-900 text-white">
                      View Member
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Relevant Project References</h2>
            <Button className="h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Add New</span>
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Project Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Year</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {references.map((project, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.statusColor}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-semibold">{project.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button size="sm" className="bg-indigo-950 hover:bg-indigo-900 text-white">
                      View Project
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

TeamReferencesTab.displayName = 'TeamReferencesTab';

export default TeamReferencesTab;