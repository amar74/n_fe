import { memo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinancialSummaryTabProps {
  opportunity: any;
}

const FinancialSummaryTab = memo(({ opportunity }: FinancialSummaryTabProps) => {
  const categories = [
    { name: 'Feasibility & Planning', amount: '$0.5M', percentage: '20%', color: 'bg-emerald-500' },
    { name: 'Environmental Assessment', amount: '$0.7M', percentage: '30%', color: 'bg-purple-500' },
    { name: 'Preliminary Design', amount: '$0.8M', percentage: '35%', color: 'bg-orange-500' },
    { name: 'Implementation Support', amount: '$0.4M', percentage: '15%', color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Budget Breakdown</h2>
            <Button className="h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Add New</span>
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 space-y-8">
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-emerald-600 mb-2">$2.4M</div>
                <div className="text-2xl font-medium text-gray-900">Total Project Value</div>
              </div>
              
              <div className="space-y-6">
                {categories.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full ${category.color}`}></div>
                      <span className="text-lg font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-lg font-medium text-gray-900">{category.amount} ({category.percentage})</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900 mb-2">$120k</div>
                  <div className="text-lg font-medium text-gray-500">Contingency (5%)</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">12.5%</div>
                  <div className="text-lg font-medium text-gray-500">Profit Margin</div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                <div className="absolute inset-0 w-full h-full bg-white rounded-full border-8 border-gray-200"></div>
                <div className="absolute inset-0 w-full h-full rounded-full" style={{
                  background: `conic-gradient(
                    #32D583 0deg 72deg,
                    #9B8AFB 72deg 180deg,
                    #FD853A 180deg 306deg,
                    #FDB022 306deg 360deg
                  )`
                }}></div>
                <div className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

FinancialSummaryTab.displayName = 'FinancialSummaryTab';

export default FinancialSummaryTab;