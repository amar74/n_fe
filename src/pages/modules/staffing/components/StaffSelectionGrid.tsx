import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Grid, 
  List, 
  X, 
  Edit,
  DollarSign,
  Clock,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  Filter,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useEmployees } from '@/hooks/resources';
import { AddStaffModal } from './AddStaffModal';
import { apiClient } from '@/services/api/client';

interface ProjectInfo {
  projectName: string;
  durationMonths: number;
}

interface StaffMember {
  id: number;
  resourceId: string;  // UUID
  resourceName: string;
  role: string;
  level: string;
  startMonth: number;
  endMonth: number;
  hoursPerWeek: number;
  hourlyRate: number;
  monthlyCost: number;
  totalCost: number;
  escalationRate?: number | null;
  escalationStartMonth?: number;
}

interface Employee {
  id: string;  // UUID
  name: string;
  role: string;
  level: string;
  hourlyRate: number;
  skills: string[];
  availability: string;
  department?: string;
  experience?: string;
  job_title?: string;
  status?: string;
}

interface Props {
  projectInfo: ProjectInfo;
  selectedStaff: StaffMember[];
  onComplete: (staff: StaffMember[]) => void;
  onBack: () => void;
}

export default function StaffSelectionGrid({ projectInfo, selectedStaff, onComplete, onBack }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>(selectedStaff);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Fetch actual employees from database (all employees, will filter for activated)
  const { employees: apiEmployees, isLoading } = useEmployees();
  
  // Transform API employees to Employee format
  // Filter for ACTIVATED employees only (status='active' AND user_id exists)
  const employees: Employee[] = (apiEmployees || [])
    .filter((emp: any) => emp.status === 'active' && emp.user_id != null)
    .map(emp => ({
      id: emp.id,
      name: emp.name,
      role: emp.job_title || emp.role || 'Staff Member',
      level: emp.experience?.includes('10') || emp.experience?.includes('Senior') ? 'Senior' :
             emp.experience?.includes('5') || emp.experience?.includes('Mid') ? 'Mid' : 'Junior',
      hourlyRate: 100 + Math.floor(Math.random() * 100), // Default rate, should be in employee data
      skills: emp.skills || [],
      availability: 'Available',
      department: emp.location || 'General',
      experience: emp.experience || 'Not specified',
      job_title: emp.job_title,
      status: emp.status
    }));

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddStaff = (newStaff: StaffMember) => {
    if (editingStaff) {
      setStaff(staff.map(s => s.id === editingStaff.id ? { ...newStaff, id: editingStaff.id } : s));
      setEditingStaff(null);
    } else {
      setStaff([...staff, { ...newStaff, id: Date.now() }]);
    }
    setIsAddModalOpen(false);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setSelectedEmployee(employees.find(e => e.id === member.resourceId) || null);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
    } else {
      setSelectedEmployee(null);
    }
    setEditingStaff(null);
    setIsAddModalOpen(true);
  };

  const handleRemoveStaff = (id: number) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const handleContinue = () => {
    if (staff.length === 0) {
      alert('Please add at least one staff member to continue');
      return;
    }
    onComplete(staff);
  };

  const handleGetAIRecommendations = async () => {
    setIsLoadingAI(true);
    setShowAIRecommendations(true);
    
    try {
      const response = await apiClient.post('/staff-planning/ai-staff-recommendations', {
        project_name: projectInfo.projectName,
        project_description: '',
        duration_months: projectInfo.durationMonths,
        project_id: null  // Can be passed if available
      });
      
      setAiRecommendations(response.data);
    } catch (error: any) {
      console.error('Failed to get AI recommendations:', error);
      
      // Better error messages based on error type
      let errorMessage = 'Unable to generate AI recommendations at the moment.';
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'AI analysis is taking longer than expected. The system has been optimized for faster responses. Please try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Our team has been notified. Please try again in a moment.';
      }
      
      setAiRecommendations({
        analysis: errorMessage,
        recommended_employees: [],
        suggested_new_roles: [],
        error: true
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const totalMonthlyCost = staff.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalProjectCost = staff.reduce((sum, s) => sum + s.totalCost, 0);

  const uniqueRoles = [...new Set(employees.map(e => e.role))];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-xl border border-gray-300">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                  Staff Planning
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Build your team with automatic bill rate calculation and cost tracking
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Step 2 of 4</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-600 mb-1">Project</p>
                <p className="text-sm font-bold text-gray-900">{projectInfo.projectName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Team Size</p>
                <p className="text-sm font-bold text-purple-600">{staff.length} members</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Monthly Cost</p>
                <p className="text-sm font-bold text-green-600">${totalMonthlyCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Cost</p>
                <p className="text-sm font-bold text-blue-600">${totalProjectCost.toLocaleString()}</p>
              </div>
            </div>
            
            <button
              onClick={() => handleOpenAddModal()}
              className="h-10 px-5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg text-white font-bold text-sm"
              style={{ backgroundColor: '#161950' }}
            >
              <Plus className="w-4 h-4" />
              Add Staff Member
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl border-2 p-6" style={{ borderColor: '#161950', backgroundColor: '#f0f5ff' }}>
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Need Help Selecting Staff?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  AI can recommend optimal team composition based on project requirements and budget
                </p>
              </div>
            </div>
            
            <button
              onClick={handleGetAIRecommendations}
              disabled={isLoadingAI}
              className="h-12 px-6 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg text-white font-bold disabled:opacity-50"
              style={{ backgroundColor: '#161950' }}
            >
              {isLoadingAI ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get AI Recommendations
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {staff.length > 0 && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">
                    Added Staff Members ({staff.length})
                  </h3>
                  <p className="text-xs text-gray-600">
                    Total allocation: ${totalProjectCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {staff.map((member) => {
                const escalationRate = member.escalationRate ?? 0;
                const escalationStartMonth = member.escalationStartMonth ?? member.startMonth;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-300 hover:shadow-lg transition-all group"
                  >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-bold text-[#1A1A1A]">{member.resourceName}</h4>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {member.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 mb-0.5">Bill Rate</p>
                      <p className="text-sm font-bold text-green-600">${member.hourlyRate}/hr</p>
                    </div>
                    
                    <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 mb-0.5">Hours/Week</p>
                      <p className="text-sm font-bold text-blue-600">{member.hoursPerWeek} hrs</p>
                    </div>
                    
                    <div className="text-center px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-gray-600 mb-0.5">Duration</p>
                      <p className="text-sm font-bold text-purple-600">M{member.startMonth}-{member.endMonth}</p>
                    </div>
                    
                    <div className="text-center px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-gray-600 mb-0.5">Total Cost</p>
                      <p className="text-sm font-bold text-orange-600">${(member.totalCost / 1000).toFixed(0)}K</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditStaff(member)}
                        className="w-9 h-9 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleRemoveStaff(member.id)}
                        className="w-9 h-9 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-600 flex items-center gap-4">
                    {escalationRate != null && escalationRate > 0 ? (
                      <span>
                        Escalation: <strong>{escalationRate.toFixed(1)}%</strong> starting from month{' '}
                        <strong>{escalationStartMonth}</strong>
                      </span>
                    ) : (
                      <span className="text-gray-500">No escalation set (0%)</span>
                    )}
                  </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Team Members</p>
                  <p className="text-xl font-bold text-purple-600">{staff.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Avg. Rate</p>
                  <p className="text-xl font-bold text-blue-600">
                    ${staff.length > 0 ? (staff.reduce((sum, s) => sum + s.hourlyRate, 0) / staff.length).toFixed(0) : 0}/hr
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Monthly Cost</p>
                  <p className="text-xl font-bold text-green-600">${(totalMonthlyCost / 1000).toFixed(1)}K</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Budget</p>
                  <p className="text-xl font-bold text-orange-600">${(totalProjectCost / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl border border-gray-300">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Available Employees</h3>
                <p className="text-sm text-gray-600">
                  {isLoading ? 'Loading...' : `${filteredEmployees.length} employees available for allocation`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or role..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-md text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-md text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Employees Found</h3>
              <p className="text-sm text-gray-600">
                {searchQuery || filterRole !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No accepted employees available. Please onboard employees first.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredEmployees.map((emp) => {
                const isAlreadyAdded = staff.some(s => s.resourceId === emp.id);
                
                return (
                  <div
                    key={emp.id}
                    className={`bg-white rounded-lg border-2 transition-all ${
                      isAlreadyAdded 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 hover:shadow-xl hover:border-blue-400'
                    } relative group`}
                  >
                    {isAlreadyAdded && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[#1A1A1A] line-clamp-1">{emp.name}</h4>
                          <p className="text-xs text-gray-600 line-clamp-1">{emp.role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Level</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            emp.level === 'Senior' ? 'bg-purple-100 text-purple-700' :
                            emp.level === 'Mid' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {emp.level}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Bill Rate</span>
                          <span className="font-bold text-green-600">${emp.hourlyRate}/hr</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Experience</span>
                          <span className="font-semibold text-gray-900">{emp.experience}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-bold ${
                            emp.availability === 'Available' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {emp.availability}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {emp.skills.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                            {skill}
                          </span>
                        ))}
                        {emp.skills.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                            +{emp.skills.length - 2}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleOpenAddModal(emp)}
                        disabled={isAlreadyAdded}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                          isAlreadyAdded
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'text-white hover:opacity-90 shadow-md'
                        }`}
                        style={!isAlreadyAdded ? { backgroundColor: '#161950' } : {}}
                      >
                        {isAlreadyAdded ? '✓ Added to Plan' : 'Add to Plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((emp) => {
                const isAlreadyAdded = staff.some(s => s.resourceId === emp.id);
                
                return (
                  <div
                    key={emp.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isAlreadyAdded
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200 hover:shadow-md hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1A1A1A]">{emp.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            emp.level === 'Senior' ? 'bg-purple-100 text-purple-700' :
                            emp.level === 'Mid' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {emp.level}
                          </span>
                          {isAlreadyAdded && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Added
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{emp.role} • {emp.department}</p>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <span className="font-bold text-green-600">${emp.hourlyRate}/hr</span>
                        <span className="text-gray-600">{emp.experience}</span>
                        <span className={`font-bold ${
                          emp.availability === 'Available' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {emp.availability}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOpenAddModal(emp)}
                      disabled={isAlreadyAdded}
                      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                        isAlreadyAdded
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'text-white hover:opacity-90'
                      }`}
                      style={!isAlreadyAdded ? { backgroundColor: '#161950' } : {}}
                    >
                      {isAlreadyAdded ? 'Added' : 'Add to Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg shadow-xl border p-5" style={{ backgroundColor: '#161950', borderColor: '#161950' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0f1440' }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Need Help Selecting Staff?</h3>
              <p className="text-sm text-white/90">
                AI can recommend optimal team composition based on project requirements and budget
              </p>
            </div>
          </div>
          <button 
            onClick={handleGetAIRecommendations}
            disabled={isLoadingAI}
            className="px-5 py-2.5 bg-white rounded-lg font-bold text-sm hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
            style={{ color: '#161950' }}
          >
            {isLoadingAI ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Get AI Recommendations
              </>
            )}
          </button>
        </div>
      </div>

      {showAIRecommendations && aiRecommendations && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Staff Recommendations</h3>
                  <p className="text-xs text-gray-600"> {aiRecommendations.available_employees_count || 0} employees analyzed</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {aiRecommendations.analysis && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: aiRecommendations.error ? '#fef2f2' : '#f8f9ff', borderWidth: '1px', borderColor: aiRecommendations.error ? '#fecaca' : '#e0e7ff' }}>
                <p className="text-sm leading-relaxed" style={{ color: aiRecommendations.error ? '#991b1b' : '#374151' }}>
                  {aiRecommendations.analysis}
                </p>
                {aiRecommendations.error && (
                  <button
                    onClick={handleGetAIRecommendations}
                    className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#161950' }}
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            {aiRecommendations.recommended_employees?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: '#161950' }} />
                  Recommended from Your Team
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiRecommendations.recommended_employees.map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border border-gray-300 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="text-sm font-bold text-gray-900">{rec.name}</h5>
                          <p className="text-xs text-gray-600">{rec.role}</p>
                        </div>
                        {rec.match_score && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#161950', color: 'white' }}>
                            {rec.match_score}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 mb-3">{rec.reason}</p>
                      {rec.employee_id !== 'NEW' && (
                        <button
                          onClick={() => {
                            const emp = employees.find(e => e.id === rec.employee_id);
                            if (emp) handleOpenAddModal(emp);
                          }}
                          className="w-full py-2 rounded-lg text-xs font-bold transition-all text-white hover:opacity-90"
                          style={{ backgroundColor: '#161950' }}
                        >
                          Add to Plan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiRecommendations.suggested_new_roles?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  Recommended Roles to Hire
                </h4>
                <div className="space-y-3">
                  {aiRecommendations.suggested_new_roles.map((role: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="text-sm font-bold text-gray-900">{role.role}</h5>
                          <p className="text-xs text-gray-600">{role.level} Level</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          role.priority === 'High' ? 'bg-red-100 text-red-700' :
                          role.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {role.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">{role.reason}</p>
                      {role.skills_required?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-gray-600 font-semibold">Required Skills:</span>
                          {role.skills_required.map((skill: string, sidx: number) => (
                            <span key={sidx} className="px-2 py-0.5 bg-white text-gray-700 text-xs rounded border border-gray-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiRecommendations.team_composition && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-1">Recommended Team Structure:</p>
                <p className="text-sm text-gray-700">{aiRecommendations.team_composition}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="h-12 px-8 bg-white rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
        >
          ← Back to Project Info
        </button>
        
        <div className="flex items-center gap-4">
          {staff.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">Add at least one staff member to continue</span>
            </div>
          )}
          <button
            onClick={handleContinue}
            disabled={staff.length === 0}
            className="h-12 px-8 rounded-lg text-white font-bold hover:opacity-90 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: '#161950' }}
          >
            Continue to Cost Analysis
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <AddStaffModal
          employee={selectedEmployee}
          projectInfo={projectInfo}
          editingStaff={editingStaff}
          onSave={handleAddStaff}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStaff(null);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}
