import { TrendingUp, AlertTriangle, Users, Briefcase, Sparkles, Target, CheckCircle2 } from 'lucide-react';

type SkillGap = {
  skill: string;
  required: number;
  available: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
};

type AISkillsGapWidgetProps = {
  totalEmployees: number;
};

export function AISkillsGapWidget({ totalEmployees }: AISkillsGapWidgetProps) {
  // Simulated AI analysis data
  const skillGaps: SkillGap[] = [
    { skill: 'React Developers', required: 5, available: 3, gap: 2, priority: 'high' },
    { skill: 'UI/UX Designers', required: 4, available: 2, gap: 2, priority: 'high' },
    { skill: 'DevOps Engineers', required: 3, available: 3, gap: 0, priority: 'low' },
    { skill: 'Backend Developers', required: 6, available: 5, gap: 1, priority: 'medium' },
    { skill: 'Product Managers', required: 2, available: 1, gap: 1, priority: 'medium' },
  ];

  const totalGap = skillGaps.reduce((sum, gap) => sum + gap.gap, 0);
  const criticalGaps = skillGaps.filter(g => g.priority === 'high');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6" style={{ color: '#161950' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Skills Gap Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Team vs. Project Demand</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-bold text-gray-900">{totalEmployees} Employees</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200">
        <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              Critical
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalGap}</p>
          <p className="text-sm text-gray-600 font-medium mt-1">Total Gap</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-amber-600" />
            <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
              High Priority
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{criticalGaps.length}</p>
          <p className="text-sm text-gray-600 font-medium mt-1">Critical Skills</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
              On Track
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {skillGaps.filter(g => g.gap === 0).length}
          </p>
          <p className="text-sm text-gray-600 font-medium mt-1">Fulfilled Roles</p>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Skills Breakdown</h4>
        {skillGaps.map((gap, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">{gap.skill}</span>
                {gap.priority === 'high' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    High Priority
                  </span>
                )}
                {gap.priority === 'medium' && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    Medium
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{gap.available}</span> / {gap.required}
                {gap.gap > 0 && (
                  <span className="ml-2 text-red-600 font-bold">
                    (-{gap.gap})
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    gap.gap === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    gap.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                    'bg-gradient-to-r from-amber-500 to-yellow-500'
                  }`}
                  style={{ width: `${(gap.available / gap.required) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">Need to hire more talent?</p>
            <p className="text-xs text-gray-600 mt-1">AI recommends filling {totalGap} positions for upcoming projects</p>
          </div>
          <button className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md" style={{ backgroundColor: '#161950' }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Start Hiring
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

