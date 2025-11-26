import { useState, useEffect } from 'react';
import { X, Users, Calendar, Clock, DollarSign, Calculator, Save, TrendingUp, Plus, Trash2 } from 'lucide-react';

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
}

export interface EscalationPeriod {
  start_month: number;
  end_month: number;
  rate: number;
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
  escalationRate?: number | null;  // Deprecated - use escalationPeriods
  escalationStartMonth?: number;  // Deprecated - use escalationPeriods
  escalationPeriods?: EscalationPeriod[];  // New format
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
  // Escalation periods (new format)
  const [escalationPeriods, setEscalationPeriods] = useState<EscalationPeriod[]>(
    editingStaff?.escalationPeriods || []
  );
  
  // Backward compatibility: convert single rate to periods if needed
  useEffect(() => {
    if (!editingStaff?.escalationPeriods && editingStaff?.escalationRate !== null && editingStaff?.escalationRate !== undefined) {
      setEscalationPeriods([{
        start_month: editingStaff.escalationStartMonth || editingStaff.startMonth,
        end_month: editingStaff.endMonth,
        rate: editingStaff.escalationRate
      }]);
    }
  }, [editingStaff]);

  // Calculate costs
  const weeks_per_month = 4.33;
  const months_allocated = Math.max(1, endMonth - startMonth + 1);
  const base_monthly_cost = hoursPerWeek * weeks_per_month * hourlyRate;
  
  // Calculate total cost with escalation periods
  const calculateTotalCostWithEscalation = () => {
    let totalCost = 0;
    
    // Sort escalation periods by start_month
    const sortedPeriods = [...escalationPeriods].sort((a, b) => a.start_month - b.start_month);
    
    for (let month = startMonth; month <= endMonth; month++) {
      let multiplier = 1.0;
      
      if (sortedPeriods.length > 0) {
        // Process periods chronologically up to the current month
        for (const period of sortedPeriods) {
          const periodStart = period.start_month;
          const periodEnd = period.end_month;
          const periodRate = period.rate;
          
          // Skip periods that haven't started yet
          if (month < periodStart) {
            continue;
          }
          
          if (periodEnd < month) {
            // This period is completely in the past, apply full period escalation
            if (periodRate > 0) {
              const periodMonths = periodEnd - periodStart + 1;
              const monthlyRate = Math.pow(1 + periodRate / 100, 1 / 12);
              // Apply compounding for all months in this period
              multiplier *= Math.pow(monthlyRate, periodMonths);
            }
          } else {
            // Current month is within this period
            if (periodRate > 0) {
              const monthsInPeriodUpToMonth = month - periodStart + 1;
              const monthlyRate = Math.pow(1 + periodRate / 100, 1 / 12);
              // Apply compounding for months in this period up to current month
              multiplier *= Math.pow(monthlyRate, monthsInPeriodUpToMonth - 1);
            }
            // We've reached the current month, no need to process further periods
            break;
          }
        }
      }
      
      totalCost += base_monthly_cost * multiplier;
    }
    
    return totalCost;
  };
  
  const monthly_cost = base_monthly_cost;
  const total_cost = calculateTotalCostWithEscalation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employee && !editingStaff) return;

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
      escalationPeriods: escalationPeriods.length > 0 ? escalationPeriods : undefined,
      // Keep backward compatibility fields (convert periods to single rate if only one period)
      escalationRate: escalationPeriods.length === 1 ? escalationPeriods[0].rate : null,
      escalationStartMonth: escalationPeriods.length === 1 ? escalationPeriods[0].start_month : undefined,
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Escalation Periods</h3>
                <p className="text-xs text-gray-600">
                  Define multiple escalation periods with different rates (e.g., 3% for months 6-12, 8% for months 13-24).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const lastEnd = escalationPeriods.length > 0 
                  ? escalationPeriods[escalationPeriods.length - 1].end_month 
                  : startMonth;
                setEscalationPeriods([...escalationPeriods, {
                  start_month: Math.min(lastEnd + 1, endMonth),
                  end_month: endMonth,
                  rate: 0
                }]);
              }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
              style={{ backgroundColor: '#161950' }}
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          </div>

          {escalationPeriods.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              No escalation periods defined. Click "Add Period" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {escalationPeriods.map((period, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Start Month</label>
                    <select
                      value={period.start_month}
                      onChange={(e) => {
                        const updated = [...escalationPeriods];
                        updated[index].start_month = Number(e.target.value);
                        // Ensure start <= end
                        if (updated[index].start_month > updated[index].end_month) {
                          updated[index].end_month = updated[index].start_month;
                        }
                        setEscalationPeriods(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                    >
                      {Array.from({ length: projectInfo.durationMonths }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">End Month</label>
                    <select
                      value={period.end_month}
                      onChange={(e) => {
                        const updated = [...escalationPeriods];
                        updated[index].end_month = Number(e.target.value);
                        // Ensure start <= end
                        if (updated[index].start_month > updated[index].end_month) {
                          updated[index].start_month = updated[index].end_month;
                        }
                        setEscalationPeriods(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                    >
                      {Array.from({ length: projectInfo.durationMonths }, (_, i) => i + 1)
                        .filter(month => month >= period.start_month)
                        .map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rate (%)</label>
                    <input
                      type="number"
                      value={period.rate}
                      onChange={(e) => {
                        const updated = [...escalationPeriods];
                        updated[index].rate = Number(e.target.value);
                        setEscalationPeriods(updated);
                      }}
                      min={0}
                      max={100}
                      step={0.1}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEscalationPeriods(escalationPeriods.filter((_, i) => i !== index));
                      }}
                      className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  {total_cost >= 1000000 
                    ? `$${(total_cost / 1000000).toFixed(1)}M`
                    : total_cost >= 1000
                    ? `$${(total_cost / 1000).toFixed(1)}K`
                    : `$${total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                </p>
                <p className="text-xs text-white/80 mt-1">{months_allocated} months{escalationPeriods.length > 0 ? ' (with escalation)' : ''}</p>
              </div>
            </div>
            
            {/* Calculation Details */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <details className="cursor-pointer">
                <summary className="text-sm font-bold text-gray-700 mb-2">
                  Calculation
                </summary>
                <div className="mt-3 space-y-2 text-xs text-gray-600">
                  <p>Hours/Month: {hoursPerWeek} hrs/week × {weeks_per_month} weeks = {(hoursPerWeek * weeks_per_month).toFixed(0)} hrs</p>
                  <p>Monthly Cost: {(hoursPerWeek * weeks_per_month).toFixed(0)} hrs × ${hourlyRate}/hr = ${monthly_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  {escalationPeriods.length > 0 ? (
                    <>
                      <p className="font-semibold mt-2">Escalation Applied:</p>
                      {escalationPeriods.map((period, idx) => (
                        <p key={idx} className="ml-4">
                          • Months {period.start_month}-{period.end_month}: {period.rate}% annual rate (monthly compounding)
                        </p>
                      ))}
                      <p className="mt-2 font-semibold">
                        Total Cost: ${total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (with escalation)
                      </p>
                    </>
                  ) : (
                    <p>Total Cost: ${monthly_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {months_allocated} months = ${total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  )}
                </div>
              </details>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2"
              style={{ backgroundColor: '#161950' }}
            >
              <Save className="w-4 h-4" />
              {editingStaff ? 'Update' : 'Add to Plan'}
            </button>
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
        </form>
      </div>
    </div>
  );
}

