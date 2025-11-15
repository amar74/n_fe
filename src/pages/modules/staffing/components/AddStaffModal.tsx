import { useState, useEffect } from 'react';
import { X, Users, Calendar, Clock, DollarSign, Calculator, Save, TrendingUp } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  level: string;
  hourlyRate: number;
  skills: string[];
  experience?: string;
}

interface ProjectInfo {
  projectName: string;
  durationMonths: number;
  annualEscalationRate: number;
}

interface StaffMember {
  id: number;
  resourceId: string;
  resourceName: string;
  role: string;
  level: string;
  startMonth: number;
  endMonth: number;
  hoursPerWeek: number;
  hourlyRate: number;
  monthlyCost: number;
  totalCost: number;
  initialEscalationRate?: number;
  escalationRate?: number | null;
  escalationEffectiveMonth?: number;
}

interface Props {
  employee: Employee | null | undefined;
  projectInfo: ProjectInfo;
  editingStaff: StaffMember | null;
  onSave: (staff: StaffMember) => void;
  onClose: () => void;
}

export function AddStaffModal({ employee, projectInfo, editingStaff, onSave, onClose }: Props) {
  const [startMonth, setStartMonth] = useState(editingStaff?.startMonth || 1);
  const [endMonth, setEndMonth] = useState(editingStaff?.endMonth || projectInfo.durationMonths);
  const [hoursPerWeek, setHoursPerWeek] = useState(editingStaff?.hoursPerWeek || 40);
  const [hourlyRate, setHourlyRate] = useState(editingStaff?.hourlyRate || employee?.hourlyRate || 100);
  const [initialEscalationRate, setInitialEscalationRate] = useState<number>(
    editingStaff?.initialEscalationRate ??
      projectInfo.annualEscalationRate ??
      0
  );
  const [enableUpdatedEscalation, setEnableUpdatedEscalation] = useState(
    editingStaff?.escalationRate !== undefined &&
      editingStaff?.escalationRate !== null &&
      editingStaff?.escalationRate !== editingStaff?.initialEscalationRate
  );
  const [escalationRate, setEscalationRate] = useState<number | null>(
    editingStaff?.escalationRate ?? null
  );
  const [escalationEffectiveMonth, setEscalationEffectiveMonth] = useState(
    editingStaff?.escalationEffectiveMonth ?? startMonth
  );

  // Calculate costs
  const weeks_per_month = 4.33;
  const months_allocated = Math.max(1, endMonth - startMonth + 1);
  const monthly_cost = hoursPerWeek * weeks_per_month * hourlyRate;
  const total_cost = monthly_cost * months_allocated;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employee && !editingStaff) return;

    const effectiveMonth = enableUpdatedEscalation
      ? escalationEffectiveMonth
      : startMonth;

    const staffData: StaffMember = {
      id: editingStaff?.id || Date.now(),
      resourceId: employee?.id || editingStaff?.resourceId || '',
      resourceName: employee?.name || editingStaff?.resourceName || '',
      role: employee?.role || editingStaff?.role || '',
      level: employee?.level || editingStaff?.level || '',
      startMonth,
      endMonth,
      hoursPerWeek,
      hourlyRate,
      monthlyCost: Math.round(monthly_cost * 100) / 100,
      totalCost: Math.round(total_cost * 100) / 100,
      initialEscalationRate,
      escalationRate: enableUpdatedEscalation ? escalationRate ?? initialEscalationRate : null,
      escalationEffectiveMonth: enableUpdatedEscalation ? effectiveMonth : startMonth,
    };

    onSave(staffData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingStaff ? 'Edit' : 'Add'} Staff Member
                </h2>
                <p className="text-sm text-gray-600">
                  {employee?.name || editingStaff?.resourceName || 'Configure allocation details'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Employee Info */}
        {employee && (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Position</p>
                <p className="text-sm font-bold text-gray-900">{employee.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Level</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  employee.level === 'Senior' ? 'bg-purple-100 text-purple-700' :
                  employee.level === 'Mid' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {employee.level}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Experience</p>
                <p className="text-sm font-semibold text-gray-900">{employee.experience || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Base Rate</p>
                <p className="text-sm font-bold text-green-600">${employee.hourlyRate}/hr</p>
              </div>
            </div>
            
            {employee.skills.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Start Month */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Start Month
              </label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                required
              >
                {Array.from({ length: projectInfo.durationMonths }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>Month {month}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">When does this person start?</p>
            </div>

            {/* End Month */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                End Month
              </label>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                required
              >
                {Array.from({ length: projectInfo.durationMonths }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>Month {month}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">When does this person end?</p>
            </div>

            {/* Hours Per Week */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Hours Per Week
              </label>
              <input
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                min="1"
                max="168"
                step="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Standard: 40 hrs/week</p>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Hourly Rate ($)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Billable rate per hour</p>
            </div>

        {/* Escalation Settings */}
        <div className="col-span-2 p-5 rounded-xl border-2 border-blue-100 bg-blue-50/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Escalation Settings</h3>
              <p className="text-xs text-gray-600">
                Base escalation defaults to the project rate ({projectInfo.annualEscalationRate}%)
                but can be overridden per employee.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Base Escalation %
              </label>
              <input
                type="number"
                value={initialEscalationRate}
                min={0}
                step={0.1}
                onChange={(e) => setInitialEscalationRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium"
              />
              <p className="text-xs text-gray-500 mt-1">
                Applied from month {startMonth}. Leave empty to inherit project rate.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={enableUpdatedEscalation}
                  onChange={(e) => setEnableUpdatedEscalation(e.target.checked)}
                />
                Apply a different escalation rate mid-project
              </label>

              {enableUpdatedEscalation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">
                      Updated Escalation %
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={escalationRate ?? initialEscalationRate}
                      onChange={(e) => setEscalationRate(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">
                      Effective From Month
                    </label>
                    <select
                      value={escalationEffectiveMonth}
                      onChange={(e) => setEscalationEffectiveMonth(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                    >
                      {Array.from({ length: projectInfo.durationMonths }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          Month {month}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      New rate applies from this month onward.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
          </div>

          {/* Cost Summary */}
          <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: '#f0f0ff', borderWidth: '2px', borderColor: '#d0d0ff' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Cost Summary</h3>
                <p className="text-xs text-gray-600">Allocation period: {months_allocated} month(s)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1 font-semibold">Hours Per Month</p>
                <p className="text-xl font-bold text-blue-600">
                  {(hoursPerWeek * weeks_per_month).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{hoursPerWeek} hrs/week</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1 font-semibold">Monthly Cost</p>
                <p className="text-xl font-bold text-orange-600">
                  ${monthly_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">Per month</p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#161950' }}>
                <p className="text-xs text-white/80 mb-1 font-semibold">Total Cost</p>
                <p className="text-xl font-bold text-white">
                  ${(total_cost / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-white/70 mt-1">{months_allocated} months</p>
              </div>
            </div>

            {/* Detailed Calculation */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-600 font-medium mb-2">Calculation:</p>
              <div className="space-y-1 text-xs text-gray-700">
                <p>• Hours/Month: {hoursPerWeek} hrs/week × {weeks_per_month.toFixed(2)} weeks = {(hoursPerWeek * weeks_per_month).toFixed(0)} hrs</p>
                <p>• Monthly Cost: {(hoursPerWeek * weeks_per_month).toFixed(0)} hrs × ${hourlyRate}/hr = ${monthly_cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="font-semibold pt-1 border-t border-gray-300">• Total Cost: ${monthly_cost.toLocaleString(undefined, { maximumFractionDigits: 2 })} × {months_allocated} months = ${total_cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Validation Messages */}
          {startMonth > endMonth && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <X className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700 font-medium">
                Start month cannot be after end month
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 px-6 bg-white rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={startMonth > endMonth}
              className="flex-1 h-12 px-6 rounded-lg text-white font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#161950' }}
            >
              <Save className="w-5 h-5" />
              {editingStaff ? 'Update' : 'Add'} to Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

