import { useState } from 'react';
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

interface ProjectInfo {
  projectName: string;
  durationMonths: number;
}

interface StaffMember {
  id: number;
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

interface Employee {
  id: number;
  name: string;
  role: string;
  level: string;
  hourlyRate: number;
  skills: string[];
  availability: string;
  department?: string;
  experience?: string;
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

  // Enhanced mock employees
  const employees: Employee[] = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Project Manager',
      level: 'Senior',
      hourlyRate: 150,
      skills: ['Project Management', 'Leadership', 'Budget Planning'],
      availability: 'Available',
      department: 'Management',
      experience: '12 years'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Civil Engineer',
      level: 'Mid',
      hourlyRate: 125,
      skills: ['Structural Design', 'AutoCAD', 'Site Planning'],
      availability: 'Available',
      department: 'Engineering',
      experience: '7 years'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Construction Manager',
      level: 'Senior',
      hourlyRate: 140,
      skills: ['Construction Management', 'Safety', 'Quality Control'],
      availability: 'Limited',
      department: 'Operations',
      experience: '15 years'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      role: 'Architect',
      level: 'Mid',
      hourlyRate: 130,
      skills: ['Architectural Design', 'Revit', '3D Modeling'],
      availability: 'Available',
      department: 'Design',
      experience: '8 years'
    },
    {
      id: 5,
      name: 'Robert Brown',
      role: 'Electrical Engineer',
      level: 'Junior',
      hourlyRate: 100,
      skills: ['Electrical Systems', 'Circuit Design', 'AutoCAD Electrical'],
      availability: 'Available',
      department: 'Engineering',
      experience: '4 years'
    },
    {
      id: 6,
      name: 'Emily Davis',
      role: 'Structural Engineer',
      level: 'Senior',
      hourlyRate: 145,
      skills: ['Structural Analysis', 'ETABS', 'Steel Design'],
      availability: 'Available',
      department: 'Engineering',
      experience: '10 years'
    },
    {
      id: 7,
      name: 'David Martinez',
      role: 'Quality Assurance',
      level: 'Mid',
      hourlyRate: 110,
      skills: ['Quality Control', 'ISO Standards', 'Inspection'],
      availability: 'Available',
      department: 'Quality',
      experience: '6 years'
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      role: 'Environmental Specialist',
      level: 'Senior',
      hourlyRate: 135,
      skills: ['Environmental Assessment', 'Compliance', 'Sustainability'],
      availability: 'Limited',
      department: 'Environmental',
      experience: '11 years'
    }
  ];

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

  const totalMonthlyCost = staff.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalProjectCost = staff.reduce((sum, s) => sum + s.totalCost, 0);

  const uniqueRoles = [...new Set(employees.map(e => e.role))];

  return (
    <div className="space-y-6">
      {/* Header Card with Summary */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-300">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#151950' }}>
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

        {/* Project Summary Bar */}
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
              onClick={() => setIsAddModalOpen(true)}
              className="h-10 px-5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg text-white font-bold text-sm"
              style={{ backgroundColor: '#151950' }}
            >
              <Plus className="w-4 h-4" />
              Add Staff Member
            </button>
          </div>
        </div>
      </div>

      {/* Added Staff Members */}
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
              {staff.map((member) => (
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
                </div>
              ))}
            </div>

            {/* Cost Summary */}
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

      {/* Available Employees */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-300">
        {/* Search & Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Available Employees</h3>
                <p className="text-sm text-gray-600">
                  {filteredEmployees.length} employees available for allocation
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
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

              {/* Role Filter */}
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
              
              {/* View Toggle */}
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

        {/* Employees Grid/List */}
        <div className="p-6">
          {viewMode === 'grid' ? (
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
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[#1A1A1A] line-clamp-1">{emp.name}</h4>
                          <p className="text-xs text-gray-600 line-clamp-1">{emp.role}</p>
                        </div>
                      </div>
                      
                      {/* Details */}
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
                      
                      {/* Skills */}
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
                      
                      {/* Action Button */}
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        disabled={isAlreadyAdded}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                          isAlreadyAdded
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'text-white hover:opacity-90 shadow-md'
                        }`}
                        style={!isAlreadyAdded ? { backgroundColor: '#151950' } : {}}
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
                      onClick={() => setIsAddModalOpen(true)}
                      disabled={isAlreadyAdded}
                      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                        isAlreadyAdded
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'text-white hover:opacity-90'
                      }`}
                      style={!isAlreadyAdded ? { backgroundColor: '#151950' } : {}}
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

      {/* AI Suggestion Banner */}
      <div className="rounded-lg shadow-xl border p-5" style={{ backgroundColor: '#151950', borderColor: '#151950' }}>
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
          <button className="px-5 py-2.5 bg-white rounded-lg font-bold text-sm hover:bg-gray-100 transition-all shadow-lg" style={{ color: '#151950' }}>
            Get AI Recommendations
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
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
            style={{ backgroundColor: '#151950' }}
          >
            Continue to Cost Analysis
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add/Edit Staff Modal - Will be imported */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <p className="text-center text-gray-600">Add Staff Form will be rendered here</p>
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingStaff(null);
              }}
              className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
