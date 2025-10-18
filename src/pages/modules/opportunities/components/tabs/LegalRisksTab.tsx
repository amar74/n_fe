import { memo } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface LegalRisksTabProps {
  opportunity: any;
}

const LegalRisksTab = memo(({ opportunity }: LegalRisksTabProps) => {
  const risks = [
    {
      title: 'Endangered species habitat impact',
      category: 'Environmental',
      impact: 'High Impact',
      impactColor: 'bg-red-50 text-red-600',
      probability: 'Medium Probability',
      probabilityColor: 'bg-amber-50 text-amber-600',
      mitigation: 'Early biological surveys and habitat mitigation planning'
    },
    {
      title: 'Change in city council priorities',
      category: 'Political',
      impact: 'Medium Impact',
      impactColor: 'bg-amber-50 text-amber-600',
      probability: 'Low Probability',
      probabilityColor: 'bg-emerald-50 text-emerald-600',
      mitigation: 'Broad stakeholder engagement and phased approach'
    },
    {
      title: 'Utility relocation complexity',
      category: 'Technical',
      impact: 'Medium Impact',
      impactColor: 'bg-amber-50 text-amber-600',
      probability: 'Medium Probability',
      probabilityColor: 'bg-amber-50 text-amber-600',
      mitigation: 'Detailed utility coordination and early engagement'
    }
  ];

  const checklist = [
    {
      title: 'Contract Terms Review',
      status: 'Complete',
      statusColor: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-600',
      iconColor: 'bg-emerald-50 text-emerald-600',
      icon: CheckCircle
    },
    {
      title: 'Insurance Requirements',
      status: 'Complete',
      statusColor: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-600',
      iconColor: 'bg-emerald-50 text-emerald-600',
      icon: CheckCircle
    },
    {
      title: 'Liability Assessment',
      status: 'In progress',
      statusColor: 'bg-amber-50 text-amber-600',
      borderColor: 'border-amber-600',
      iconColor: 'bg-amber-50 text-amber-600',
      icon: Clock
    },
    {
      title: 'Intellectual Property Review',
      status: 'Pending',
      statusColor: 'bg-gray-100 text-gray-500',
      borderColor: 'border-gray-500',
      iconColor: 'bg-gray-100 text-gray-500',
      icon: Clock
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Risk Assessment & Mitigations</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {risks.map((risk, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <span className="text-base font-medium text-gray-900">{risk.title}</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600 w-fit">
                        {risk.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${risk.impactColor}`}>
                        {risk.impact}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${risk.probabilityColor}`}>
                        {risk.probability}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Mitigation Strategy</div>
                  <div className="text-base font-medium text-gray-900">{risk.mitigation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Legal Checklist</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {checklist.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className={`p-4 bg-white rounded-xl border-2 ${item.borderColor} flex justify-between items-center`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 p-1 rounded-2xl flex justify-center items-center ${item.iconColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="text-base font-medium text-gray-900">{item.title}</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LegalRisksTab.displayName = 'LegalRisksTab';

export default LegalRisksTab;