import { useState, useEffect } from 'react';
import { X, Users, DollarSign, Calendar, Clock, Target, TrendingUp, Sparkles, Info } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  role: string;
  level: string;
  hourlyRate: number;
  skills: string[];
  availability: string;
}

interface ProjectInfo {
  durationMonths: number;
}

interface StaffMember {
  resourceId: number;
  resourceName: string;
  role: string;
  level: string;
  startMonth: number;
  endMonth: number;
  hoursPerWeek: number;
  hourlyRate: number;
  monthlyCost: number;
  totalCost: number;
}

interface Props {
  employees: Employee[];
  projectInfo: ProjectInfo;
  onAdd: (staff: StaffMember) => void;
  onClose: () => void;
  editData?: StaffMember | null;
}

export default function AddStaffForm({ employees, projectInfo, onAdd, onClose, editData }: Props) {
  const [formData, setFormData] = useState({
    resourceId: editData?.resourceId || 0,
    resourceName: editData?.resourceName || '',
    role: editData?.role || '',
    level: editData?.level || '',
    startMonth: editData?.startMonth || 1,
    endMonth: editData?.endMonth || projectInfo.durationMonths,
    hoursPerWeek: editData?.hoursPerWeek || 40,
    hourlyRate: editData?.hourlyRate || 0
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (editData) {
      const employee = employees.find(emp => emp.id === editData.resourceId);
      if (employee) {
        setSelectedEmployee(employee);
      }
    }
  }, [editData, employees]);

  const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = parseInt(e.target.value);
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        ...formData,
        resourceId: employee.id,
        resourceName: employee.name,
        role: employee.role,
        level: employee.level,
        hourlyRate: employee.hourlyRate
      });
    }
  };

  // Calculate costs in real-time
  const calculateCosts = () => {
    const durationMonths = formData.endMonth - formData.startMonth + 1;
    const weeksPerMonth = 4.33; // Average weeks per month
    const monthlyCost = formData.hoursPerWeek * weeksPerMonth * formData.hourlyRate;
    const totalCost = monthlyCost * durationMonths;
    
    return { monthlyCost, totalCost, durationMonths };
  };

  const { monthlyCost, totalCost, durationMonths } = calculateCosts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resourceId) {
      alert('Please select an employee');
      return;
    }
    
    if (formData.startMonth > formData.endMonth) {
      alert('Start month must be before end month');
      return;
    }
    
    onAdd({
      ...formData,
      monthlyCost,
      totalCost
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                  {editData ? 'Edit Staff Member' : 'Add Staff Member'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enter staff member details • Bill rates and costs are calculated automatically
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center transition-all border border-gray-300"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Select Employee from Database *
            </label>
            <select
              onChange={handleEmployeeSelect}
              value={formData.resourceId || ''}
              className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium bg-white"
              required
            >
              <option value="" disabled>Choose an employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} • {emp.role} ({emp.level}) • ${emp.hourlyRate}/hr • {emp.availability}
                </option>
              ))}
            </select>
            
            {selectedEmployee && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Selected Employee</p>
                    <p className="text-sm font-bold text-gray-900">{selectedEmployee.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedEmployee.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Auto-Filled Details
                </h3>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Role *
                  </label>
                  <div className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-blue-50 text-sm font-semibold text-blue-700">
                    {formData.role || 'Will be auto-filled'}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Level *
                  </label>
                  <div className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-blue-50 text-sm font-semibold text-blue-700">
                    {formData.level || 'Will be auto-filled'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-green-600" />
                    Automatic Bill Rate
                  </label>
                  <div className="w-full px-4 py-3 rounded-lg border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                    <p className="text-2xl font-bold text-green-600">
                      ${formData.hourlyRate.toFixed(2)}<span className="text-sm text-gray-600">/hr</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  Allocation Details
                </h3>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                    Hours per Week *
                  </label>
                  <input
                    type="number"
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseFloat(e.target.value) })}
                    min="1"
                    max="168"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-semibold"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Standard: 40 hrs/week • Max: 168 hrs/week
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Start Month *
                    </label>
                    <input
                      type="number"
                      value={formData.startMonth}
                      onChange={(e) => setFormData({ ...formData, startMonth: parseInt(e.target.value) })}
                      min="1"
                      max={projectInfo.durationMonths}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      End Month *
                    </label>
                    <input
                      type="number"
                      value={formData.endMonth}
                      onChange={(e) => setFormData({ ...formData, endMonth: parseInt(e.target.value) })}
                      min={formData.startMonth}
                      max={projectInfo.durationMonths}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Timeline Allocation</span>
                    <span className="text-xs font-bold text-orange-600">{durationMonths} months</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                      style={{
                        left: `${((formData.startMonth - 1) / projectInfo.durationMonths) * 100}%`,
                        width: `${(durationMonths / projectInfo.durationMonths) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Month 1</span>
                    <span>Month {projectInfo.durationMonths}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {formData.resourceId > 0 && (
            <div className="mt-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Real-Time Cost Preview</h4>
                  <p className="text-xs text-gray-600">Automatically calculated based on your inputs</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-md border border-gray-200">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Monthly Cost</p>
                  <p className="text-xl font-bold text-green-600">${monthlyCost.toFixed(0)}</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-md border border-gray-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Duration</p>
                  <p className="text-xl font-bold text-blue-600">{durationMonths}</p>
                  <p className="text-xs text-gray-500">months</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-md border border-gray-200">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Total Hours</p>
                  <p className="text-xl font-bold text-purple-600">{(formData.hoursPerWeek * 4.33 * durationMonths).toFixed(0)}</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-md">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs text-white/90 mb-1">Total Cost</p>
                  <p className="text-xl font-bold text-white">${(totalCost / 1000).toFixed(1)}K</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <h5 className="text-xs font-bold text-gray-700 mb-3">Cost Breakdown Formula</h5>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <strong className="text-gray-900">Monthly Cost:</strong> {formData.hoursPerWeek} hrs/week × 4.33 weeks × ${formData.hourlyRate}/hr = 
                    <span className="font-bold text-green-600"> ${monthlyCost.toFixed(2)}</span>
                  </p>
                  <p>
                    <strong className="text-gray-900">Total Cost:</strong> ${monthlyCost.toFixed(2)}/month × {durationMonths} months = 
                    <span className="font-bold text-orange-600"> ${totalCost.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-indigo-900 mb-2">
                  💡 Quick Tips
                </h4>
                <ul className="text-xs text-indigo-700 space-y-1">
                  <li>• <strong>Select an employee</strong> and their details will auto-populate</li>
                  <li>• <strong>Adjust allocation period</strong> using start and end months</li>
                  <li>• <strong>Set working hours</strong> (40 hrs/week is standard full-time)</li>
                  <li>• <strong>Costs update in real-time</strong> as you change values</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 px-6 bg-white rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {editData ? 'Update Staff Member' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
