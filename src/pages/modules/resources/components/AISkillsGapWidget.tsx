import { TrendingUp, AlertTriangle, Users, Briefcase, Sparkles, Target, CheckCircle2, Loader2 } from 'lucide-react';
import { useEmployeeAnalytics } from '@/hooks/useEmployees';

type SkillGap = {
  skill: string;
  required: number;
  available: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
};

type Employee = {
  id: string;
  name: string;
  skills?: string[];
  role?: string;
  job_title?: string;
};

type AISkillsGapWidgetProps = {
  totalEmployees: number;
  employees?: Employee[];
};

export function AISkillsGapWidget({ totalEmployees, employees = [] }: AISkillsGapWidgetProps) {
  // Fetch AI-powered skills gap analysis from backend
  const { skillsGap, isLoadingSkillsGap } = useEmployeeAnalytics();

  // Use backend AI analysis if available, otherwise fallback to client-side calculation
  const getSkillGaps = (): SkillGap[] => {
    // If backend data is available, use it (real AI analysis)
    if (skillsGap?.skill_gaps && skillsGap.skill_gaps.length > 0) {
      return skillsGap.skill_gaps.map((gap: any) => ({
        skill: gap.skill || 'Unknown',
        required: gap.required || 0,
        available: gap.available || 0,
        gap: gap.gap || 0,
        priority: (gap.priority || 'low') as 'high' | 'medium' | 'low',
      }));
    }

    // Fallback: Calculate real skill gaps from actual employee data (client-side)
    const calculateSkillGaps = (): SkillGap[] => {
    console.log('🔍 AI Skills Gap - Analyzing', employees.length, 'employees');
    
    if (!employees || employees.length === 0) {
      console.log('❌ No employees provided for analysis');
      return [];
    }

    // Extract all skills from employees
    const allSkills = employees.flatMap(emp => {
      const empSkills = emp.skills || [];
      console.log(`👤 ${emp.name}:`, empSkills.length, 'skills -', empSkills.join(', '));
      return empSkills;
    });
    
    const skillCounts: Record<string, number> = {};
    
    // Count each skill
    allSkills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
    
    console.log('📊 Skill Counts:', skillCounts);

    // Get top skills sorted by frequency
    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    console.log('🏆 Top 10 Skills:', topSkills);

    // Calculate gaps based on current team size and skill distribution
    const gaps: SkillGap[] = topSkills.map(([skill, available]) => {
      // AI logic: recommend 30% more capacity for high-demand skills
      const required = Math.ceil(available * 1.3);
      const gap = Math.max(0, required - available);
      
      // Determine priority based on gap size and current availability
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (gap >= 2) priority = 'high';
      else if (gap >= 1) priority = 'medium';
      
      console.log(`📈 ${skill}: Available=${available}, Required=${required} (30% buffer), Gap=${gap}, Priority=${priority}`);
      
      return {
        skill,
        required,
        available,
        gap,
        priority
      };
    });

    // If no skills, show empty state
    if (gaps.length === 0) {
      console.log('⚠️ No skills found in employee data');
      return [{
        skill: 'No skills data',
        required: 0,
        available: 0,
        gap: 0,
        priority: 'low'
      }];
    }

    console.log('✅ Skills Gap Analysis Complete:', gaps.length, 'skills analyzed');
    console.log('📊 Summary: Total Gap =', gaps.reduce((sum, g) => sum + g.gap, 0), '| Critical Gaps =', gaps.filter(g => g.priority === 'high').length);
    
      return gaps;
    };

    return calculateSkillGaps();
  };

  const skillGaps = getSkillGaps();
  const totalGap = skillGaps.reduce((sum, gap) => sum + gap.gap, 0);
  const criticalGaps = skillGaps.filter(g => g.priority === 'high');

  // Show loading state
  if (isLoadingSkillsGap) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6" style={{ color: '#161950' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Skills Gap Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Team vs. Project Demand</p>
            </div>
          </div>
        </div>
        <div className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Skills Gap...</h3>
          <p className="text-gray-600">
            AI is analyzing your team's skills and project requirements
          </p>
        </div>
      </div>
    );
  }

  if (skillGaps.length === 0 || skillGaps[0].skill === 'No skills data') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6" style={{ color: '#161950' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Skills Gap Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Team vs. Project Demand</p>
            </div>
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Skills Data Available</h3>
          <p className="text-gray-600 mb-6">
            Add employee skills during onboarding to see AI-powered skills gap analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6" style={{ color: '#161950' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Skills Gap Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">
                {skillsGap?.skill_gaps ? (
                  <>
                    <span className="font-semibold text-purple-600">AI-Powered</span> - Skills suggested based on active opportunities/projects
                  </>
                ) : (
                  'Analyzing opportunities to suggest required skills...'
                )}
              </p>
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-900">AI-Suggested Skills (Based on Active Projects)</h4>
          {skillsGap?.skill_gaps && (
            <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded">
              {skillsGap.skill_gaps.length} skills identified
            </span>
          )}
        </div>
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

      {totalGap > 0 && (
        <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">AI Hiring Recommendation</p>
              <p className="text-xs text-gray-600 mt-1">
                Based on your active opportunities/projects, AI recommends adding {totalGap} more {totalGap === 1 ? 'person' : 'people'} with the skills above to fulfill project requirements
              </p>
            </div>
            <a href="/module/resources/onboarding">
              <button className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md" style={{ backgroundColor: '#161950' }}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Start Hiring
                </div>
              </button>
            </a>
          </div>
        </div>
      )}
      
      {skillGaps.length > 0 && totalGap === 0 && (
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-bold text-gray-900">Team Capacity Sufficient</p>
              <p className="text-xs text-gray-600 mt-1">
                Based on current opportunities, your team has the required skills. No immediate hiring needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

