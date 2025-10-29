import { CheckCircle, Users, Calendar, DollarSign, TrendingUp, Save, Download, Sparkles, FileText, Target, BarChart3, AlertCircle } from 'lucide-react';

interface ProjectInfo {
  projectName: string;
  projectDescription?: string;
  durationMonths: number;
  overheadRate: number;
  profitMargin: number;
  annualEscalationRate: number;
}

interface StaffMember {
  resourceName: string;
  role: string;
  level: string;
  hourlyRate: number;
  totalCost: number;
  hoursPerWeek: number;
  startMonth: number;
  endMonth: number;
}

interface Props {
  projectInfo: ProjectInfo;
  staffMembers: StaffMember[];
  onSave: () => void;
  onExport: () => void;
  onBack: () => void;
}

export default function PlanSummary({ projectInfo, staffMembers, onSave, onExport, onBack }: Props) {
  // Calculate all financial metrics
  const totalLaborCost = staffMembers.reduce((sum, staff) => sum + staff.totalCost, 0);
  const overhead = totalLaborCost * (projectInfo.overheadRate / 100);
  const totalCost = totalLaborCost + overhead;
  const profit = totalCost * (projectInfo.profitMargin / 100);
  const totalPrice = totalCost + profit;
  
  const avgHourlyRate = staffMembers.length > 0 
    ? staffMembers.reduce((sum, s) => sum + s.hourlyRate, 0) / staffMembers.length 
    : 0;

  // Group staff by level
  const staffByLevel = staffMembers.reduce((acc, staff) => {
    acc[staff.level] = (acc[staff.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-300">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#151950' }}>
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                  Plan Summary
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive overview of your staffing plan • Review before saving
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Step 4 of 4</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Summary */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#151950' }}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">Project Summary</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-600 mb-2 font-semibold">Project Name</p>
              <p className="text-lg font-bold text-gray-900">{projectInfo.projectName}</p>
            </div>
            
            {projectInfo.projectDescription && (
              <div>
                <p className="text-xs text-gray-600 mb-2 font-semibold">Description</p>
                <p className="text-sm text-gray-700">{projectInfo.projectDescription}</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 mb-1">Team Size</p>
                <p className="text-lg font-bold text-purple-600">{staffMembers.length}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="text-lg font-bold text-blue-600">{projectInfo.durationMonths}</p>
                <p className="text-xs text-gray-500">months</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 mb-1">Avg Rate</p>
                <p className="text-lg font-bold text-orange-600">${avgHourlyRate.toFixed(0)}</p>
                <p className="text-xs text-gray-500">/hour</p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-blue-200">
              <p className="text-xs text-gray-600 mb-2 font-semibold">Total Project Value</p>
              <p className="text-4xl font-bold text-blue-600">
                ${(totalPrice / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Estimated total project cost including overhead and profit
              </p>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#151950' }}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">Financial Breakdown</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-semibold">Direct Labor Cost</span>
              </div>
              <span className="text-base font-bold text-gray-900">
                ${(totalLaborCost / 1000).toFixed(1)}K
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-semibold">Overhead ({projectInfo.overheadRate}%)</span>
              </div>
              <span className="text-base font-bold text-orange-600">
                ${(overhead / 1000).toFixed(1)}K
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b-2 border-gray-300">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-semibold">Total Cost</span>
              </div>
              <span className="text-base font-bold text-gray-900">
                ${(totalCost / 1000).toFixed(1)}K
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-semibold">Profit Margin ({projectInfo.profitMargin}%)</span>
              </div>
              <span className="text-base font-bold text-green-600">
                ${(profit / 1000).toFixed(1)}K
              </span>
            </div>
            
            <div className="flex items-center justify-between py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 -mx-4 mt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-base font-bold text-gray-900">Total Project Price</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                ${(totalPrice / 1000000).toFixed(2)}M
              </span>
            </div>

            {/* ROI Indicator */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700 font-semibold">Return on Investment (ROI)</span>
                <span className="text-lg font-bold text-green-600">
                  {((profit / totalCost) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Composition Table */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#151950' }}>
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Team Composition ({staffMembers.length} members)</h3>
                <p className="text-xs text-gray-600">
                  Senior: {staffByLevel['Senior'] || 0} • Mid: {staffByLevel['Mid'] || 0} • Junior: {staffByLevel['Junior'] || 0}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Total Labor Cost</p>
              <p className="text-lg font-bold text-green-600">${(totalLaborCost / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffMembers.map((staff, index) => (
              <div key={index} className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: '#151950' }}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{staff.resourceName}</h4>
                      <p className="text-sm text-gray-600">{staff.role}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    staff.level === 'Senior' ? 'bg-purple-100 text-purple-700' :
                    staff.level === 'Mid' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {staff.level}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Rate</p>
                    <p className="text-sm font-bold text-green-600">${staff.hourlyRate}/hr</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Hours</p>
                    <p className="text-sm font-bold text-blue-600">{staff.hoursPerWeek}/wk</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Period</p>
                    <p className="text-sm font-bold text-purple-600">M{staff.startMonth}-{staff.endMonth}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-semibold">Total Cost</span>
                  <span className="text-lg font-bold text-orange-600">
                    ${(staff.totalCost / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-5 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-1">{staffMembers.length}</p>
          <p className="text-xs text-gray-600 font-semibold">Team Members</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-5 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mb-1">{projectInfo.durationMonths}</p>
          <p className="text-xs text-gray-600 font-semibold">Months</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-5 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600 mb-1">${avgHourlyRate.toFixed(0)}</p>
          <p className="text-xs text-gray-600 font-semibold">Avg Rate/hr</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-5 text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600 mb-1">{projectInfo.overheadRate}%</p>
          <p className="text-xs text-gray-600 font-semibold">Overhead</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-5 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600 mb-1">{projectInfo.profitMargin}%</p>
          <p className="text-xs text-gray-600 font-semibold">Profit Margin</p>
        </div>
      </div>

      {/* Detailed Financial Breakdown */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#151950' }}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Complete Financial Breakdown
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {/* Labor */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Direct Labor Cost</p>
                  <p className="text-xs text-gray-600">{staffMembers.length} team members × duration</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ${(totalLaborCost / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-600">{((totalLaborCost / totalPrice) * 100).toFixed(1)}% of total</p>
              </div>
            </div>

            {/* Overhead */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Overhead Costs</p>
                  <p className="text-xs text-gray-600">{projectInfo.overheadRate}% of labor cost</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  ${(overhead / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-600">{((overhead / totalPrice) * 100).toFixed(1)}% of total</p>
              </div>
            </div>

            {/* Total Cost */}
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Total Project Cost</p>
                  <p className="text-xs text-gray-600">Labor + Overhead</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalCost / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            {/* Profit */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Profit</p>
                  <p className="text-xs text-gray-600">{projectInfo.profitMargin}% of total cost</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ${(profit / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-600">ROI: {((profit / totalCost) * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Total Price - Featured */}
            <div className="flex items-center justify-between p-6 rounded-xl shadow-xl" style={{ backgroundColor: '#151950' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Total Project Price</p>
                  <p className="text-xs text-white/80">Final client billing amount</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">
                  ${(totalPrice / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Save Banner */}
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-2xl border-2 border-green-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Ready to Save</h3>
              <p className="text-sm text-white/90">
                Your staffing plan is complete and ready to be saved or exported
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/80">
                <span>✓ {staffMembers.length} team members</span>
                <span>✓ {projectInfo.durationMonths} months duration</span>
                <span>✓ ${(totalPrice / 1000000).toFixed(2)}M total value</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              className="h-12 px-8 bg-white rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-all shadow-xl"
            >
              <Save className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-bold text-gray-700">Save Plan</span>
            </button>
            <button
              onClick={onExport}
              className="h-12 px-8 bg-white/20 border-2 border-white rounded-lg flex items-center gap-2 hover:bg-white/30 transition-all backdrop-blur-sm"
            >
              <Download className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="h-12 px-8 bg-white rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
        >
          ← Back to Cost Analysis
        </button>
        
        <div className="flex items-center gap-3 px-5 py-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="text-left">
            <p className="text-sm font-bold text-green-900">All Steps Completed</p>
            <p className="text-xs text-green-700">Ready to save your staffing plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
