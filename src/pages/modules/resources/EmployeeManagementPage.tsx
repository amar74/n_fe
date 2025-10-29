import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Eye, Filter, Users, TrendingUp, Clock, CheckCircle, DollarSign, Mail, Phone, MapPin, Briefcase, Award, Star, Plus } from 'lucide-react';

type Employee = {
  id: string;
  number: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  location: string;
  billRate: number;
  utilization: number;
  status: 'active' | 'on_bench' | 'on_leave';
  skills: string[];
  currentProjects: string[];
  photo?: string;
  startDate: string;
};

const mockEmployees: Employee[] = [
  {
    id: '1',
    number: 'EMP-001',
    name: 'Mike Johnson',
    email: 'mike.j@company.com',
    phone: '+1 234 567 8902',
    department: 'Engineering',
    role: 'DevOps Engineer',
    location: 'Austin, TX',
    billRate: 230,
    utilization: 95,
    status: 'active',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    currentProjects: ['Project Alpha', 'Project Beta'],
    startDate: '2024-01-15',
  },
  {
    id: '2',
    number: 'EMP-002',
    name: 'Sarah Anderson',
    email: 'sarah.a@company.com',
    phone: '+1 234 567 8903',
    department: 'Design',
    role: 'UI/UX Designer',
    location: 'New York, NY',
    billRate: 180,
    utilization: 88,
    status: 'active',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    currentProjects: ['Project Gamma'],
    startDate: '2024-02-20',
  },
  {
    id: '3',
    number: 'EMP-003',
    name: 'David Chen',
    email: 'david.c@company.com',
    phone: '+1 234 567 8904',
    department: 'Engineering',
    role: 'Senior Developer',
    location: 'San Francisco, CA',
    billRate: 220,
    utilization: 45,
    status: 'on_bench',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    currentProjects: [],
    startDate: '2023-11-10',
  },
  {
    id: '4',
    number: 'EMP-004',
    name: 'Emily Rodriguez',
    email: 'emily.r@company.com',
    phone: '+1 234 567 8905',
    department: 'Product',
    role: 'Product Manager',
    location: 'Remote',
    billRate: 250,
    utilization: 92,
    status: 'active',
    skills: ['Agile', 'Product Strategy', 'Roadmapping', 'Analytics'],
    currentProjects: ['Project Alpha', 'Project Delta'],
    startDate: '2024-03-05',
  },
];

function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'on_bench' | 'on_leave'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    onBench: employees.filter(e => e.status === 'on_bench').length,
    avgUtilization: Math.round(employees.reduce((sum, e) => sum + e.utilization, 0) / employees.length),
    monthlyBillable: employees.reduce((sum, e) => sum + (e.billRate * 160 * (e.utilization / 100)), 0),
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <Link to="/module/resources" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900 transition-colors">
                Resources
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-semibold font-outfit leading-tight">Employee Management</span>
            </div>
            
            <div>
              <h1 className="text-[#1A1A1A] text-3xl font-bold font-outfit leading-loose">
                Employee Management
              </h1>
              <p className="text-gray-600 text-sm font-medium mt-1">
                Track active employees, utilization, and performance metrics
              </p>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm font-medium text-gray-600">Total Employees</div>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-sm font-medium text-gray-600">Active</div>
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: '93%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.onBench}</div>
                <div className="text-sm font-medium text-gray-600">On Bench</div>
              </div>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600" style={{ width: '7%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.avgUtilization}%</div>
                <div className="text-sm font-medium text-gray-600">Avg Utilization</div>
              </div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600" style={{ width: `${stats.avgUtilization}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">${(stats.monthlyBillable / 1000).toFixed(0)}K</div>
                <div className="text-sm font-medium text-gray-600">Monthly Billable</div>
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, department, or employee number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterStatus === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('on_bench')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterStatus === 'on_bench' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                On Bench
              </button>
            </div>
          </div>
        </div>

        {/* Employee Directory */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Employee Directory</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredEmployees.length} employees found</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Utilization</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Bill Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center shadow-md">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{employee.number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{employee.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-semibold">{employee.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">{employee.utilization}%</span>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              employee.utilization >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                              employee.utilization >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                              'bg-gradient-to-r from-amber-500 to-orange-600'
                            }`}
                            style={{ width: `${employee.utilization}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">${employee.billRate}/hr</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        employee.status === 'active' ? 'bg-green-100 text-green-700' :
                        employee.status === 'on_bench' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {employee.status === 'on_bench' ? 'On Bench' : 
                         employee.status === 'on_leave' ? 'On Leave' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Assign Project">
                          <Briefcase className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Skills Matrix Preview */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Skills Matrix</h2>
              <p className="text-sm text-gray-600 mt-1">Top skills across your team</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              View Full Matrix
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Figma', 'Product Strategy', 'Agile', 'GraphQL', 'Kubernetes', 'UI/UX'].map((skill, idx) => {
              const count = employees.filter(e => e.skills.includes(skill)).length;
              return (
                <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">{skill}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                  <p className="text-sm text-gray-600">{selectedEmployee.role} • {selectedEmployee.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-300"
              >
                Close
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Location</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Bill Rate</p>
                      <p className="text-sm text-gray-900 font-semibold">${selectedEmployee.billRate}/hr</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-sm font-semibold rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Projects */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Current Projects</h3>
                {selectedEmployee.currentProjects.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEmployee.currentProjects.map((project, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">{project}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-amber-800">Available for Project Assignment</p>
                    <button className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
                      Assign to Project
                    </button>
                  </div>
                )}
              </div>

              {/* Utilization */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Utilization Metrics</h3>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-700">Current Utilization</span>
                    <span className="text-3xl font-bold text-gray-900">{selectedEmployee.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${
                        selectedEmployee.utilization >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                        selectedEmployee.utilization >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                        'bg-gradient-to-r from-amber-500 to-orange-600'
                      }`}
                      style={{ width: `${selectedEmployee.utilization}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Billable Hours/Month</p>
                      <p className="text-lg font-bold text-gray-900">{Math.round(160 * (selectedEmployee.utilization / 100))}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Monthly Value</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${((selectedEmployee.billRate * 160 * (selectedEmployee.utilization / 100)) / 1000).toFixed(1)}K
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(EmployeeManagementPage);

