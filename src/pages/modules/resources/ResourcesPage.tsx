import { useState } from 'react';
import { Upload, Search, TrendingUp, BarChart3 } from 'lucide-react';
import OnboardingPage from './OnboardingPage';
import EmployeeSearchPage from './EmployeeSearchPage';
import ResourceOptimizationPage from './ResourceOptimizationPage';

type TabType = 'create' | 'search' | 'optimization' | 'analysis';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('create');

  const tabs = [
    { id: 'create' as TabType, label: 'Create/Upload', icon: Upload },
    { id: 'search' as TabType, label: 'Search', icon: Search },
    { id: 'optimization' as TabType, label: 'Resource Optimization', icon: TrendingUp },
    { id: 'analysis' as TabType, label: 'Competitor Analysis', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'create' && <OnboardingPage />}
        {activeTab === 'search' && <EmployeeSearchPage />}
        {activeTab === 'optimization' && <ResourceOptimizationPage />}
        {activeTab === 'analysis' && (
          <div className="p-8 text-center">
            <div className="bg-white rounded-2xl border border-gray-200 p-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Competitor Analysis</h2>
              <p className="text-gray-600">Coming Soon - Analyze competitor resources and market positioning</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

