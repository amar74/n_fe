import { memo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Filter, Users, TrendingUp, Clock, CheckCircle, DollarSign, Mail, Phone, MapPin, Briefcase, Award, Star, Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useRoles } from '@/hooks/useRoles';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlacesAutocomplete } from '@/components/ui/places-autocomplete';
import { loadGoogleMaps } from '@/lib/google-maps-loader';

type Employee = {
  id: string;
  employee_number: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
  job_title?: string;
  location?: string;
  bill_rate?: number;
  status: string;
  skills?: string[];
  created_at: string;
};

function EmployeeManagementPage() {
  const navigate = useNavigate();
  // Fetch only accepted and active employees
  const { employees: allEmployees, isLoading, updateEmployee, deleteEmployee, isUpdating, isDeleting } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'accepted'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Filter to show only ACTIVE employees (with user accounts) - this is the "Active Employee Page"
  const employees: Employee[] = (allEmployees as any[] || []).filter((emp: any) => 
    emp.status === 'active' && emp.user_id != null
  );

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employee_number.toLowerCase().includes(searchQuery.toLowerCase());
    // Remove filterStatus check since we only show active employees now
    return matchesSearch;
  });

  const stats = {
    total: employees.length,
    active: employees.length, // All employees here are active
    avgBillRate: employees.length > 0 
      ? Math.round(employees.reduce((sum, e) => sum + (e.bill_rate || 0), 0) / employees.length)
      : 0,
    monthlyBillable: employees.reduce((sum, e) => sum + ((e.bill_rate || 0) * 160), 0),
  };

  const handleDelete = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await deleteEmployee(employeeId);
      toast.success('Employee deleted successfully');
      if (selectedEmployee?.id === employeeId) {
        setSelectedEmployee(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete employee');
    }
  };

  const handleStatusChange = async (employeeId: string, newStatus: string) => {
    try {
      await updateEmployee({ id: employeeId, data: { status: newStatus } });
      toast.success('Employee status updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleExport = () => {
    if (employees.length === 0) {
      toast.error('No employees to export');
      return;
    }

    try {
      // CSV Headers
      const headers = [
        'Employee Number',
        'Name',
        'Email',
        'Phone',
        'Department',
        'Role',
        'Job Title',
        'Location',
        'Bill Rate',
        'Status',
        'Skills',
        'Joined Date'
      ];

      // CSV Rows
      const rows = employees.map(emp => [
        emp.employee_number,
        emp.name,
        emp.email,
        emp.phone || 'N/A',
        emp.department || 'N/A',
        emp.role || 'N/A',
        emp.job_title || 'N/A',
        emp.location || 'N/A',
        emp.bill_rate ? `$${emp.bill_rate}/hr` : 'N/A',
        emp.status,
        (emp.skills || []).join('; '),
        new Date(emp.created_at).toLocaleDateString()
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success(`Exported ${employees.length} employees successfully`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export employees');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
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
              <span className="text-[#344054] text-sm font-semibold font-outfit leading-tight">Active Employees</span>
            </div>
            
            <div>
              <h1 className="text-[#1A1A1A] text-3xl font-bold font-outfit leading-loose">
                Active Employees
              </h1>
              <p className="text-gray-600 text-sm font-medium mt-1">
                Manage activated employee accounts - view profiles, credentials, CV, and project assignments
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={employees.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              title={employees.length === 0 ? 'No employees to export' : 'Export to CSV'}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <Link to="/module/resources/onboarding">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
                <Plus className="w-5 h-5" />
                Add Employee
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Employees</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-4">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Active Now</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-1.5 mt-4">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: stats.total > 0 ? `${(stats.active / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">${stats.avgBillRate}</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Avg Rate/Hour</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <DollarSign className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-1.5 mt-4">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">${(stats.monthlyBillable / 1000).toFixed(0)}K</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Monthly Value</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <TrendingUp className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-4">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600" style={{ width: '75%' }}></div>
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
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg">
              <p className="text-sm font-semibold text-green-700">
                Showing {stats.active} activated employee{stats.active !== 1 ? 's' : ''} with user accounts
              </p>
            </div>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Employees Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'No active employees match your search.' 
                : 'No activated employees yet. Accept and activate employees from the Onboarding page first.'}
            </p>
            <Link to="/module/resources/onboarding">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5 inline mr-2" />
                Onboard Employee
              </button>
            </Link>
          </div>
        ) : (
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
                            <span className="text-blue-600 font-bold text-lg">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{employee.employee_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">{employee.email}</span>
                          </div>
                          {employee.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium">{employee.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {employee.department ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {employee.department}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 font-semibold">
                          {employee.role || employee.job_title || 'Not assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          ${employee.bill_rate ? employee.bill_rate.toFixed(0) : 'N/A'}/hr
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          employee.status === 'active' ? 'bg-green-100 text-green-700' :
                          employee.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/module/resources/management/profile/${employee.id}`)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => setEditingEmployee(employee)}
                            className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group"
                            title="Edit Employee"
                          >
                            <Edit className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                          </button>
                          {employee.status === 'accepted' && (
                            <button
                              onClick={() => handleStatusChange(employee.id, 'active')}
                              disabled={isUpdating}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 group"
                              title="Activate Employee"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(employee.id)}
                            disabled={isDeleting}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 group"
                            title="Delete Employee"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {employees.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Skills Matrix</h2>
                <p className="text-sm text-gray-600 mt-1">Top skills across your team</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(() => {
                const allSkills = employees.flatMap(e => e.skills || []);
                const skillCounts = allSkills.reduce((acc: any, skill) => {
                  acc[skill] = (acc[skill] || 0) + 1;
                  return acc;
                }, {});
                const topSkills = Object.entries(skillCounts)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 12);
                
                return topSkills.length > 0 ? topSkills.map(([skill, count]: any, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-600 font-medium mt-1">{skill}</p>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500 text-sm">No skills data available</p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEmployee(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-blue-600 font-bold text-2xl">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                    <p className="text-sm text-gray-600">
                      {selectedEmployee.role || selectedEmployee.job_title || 'Employee'} 
                      {selectedEmployee.department && ` • ${selectedEmployee.department}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Close
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedEmployee.status === 'accepted' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedEmployee.id, 'active');
                      setSelectedEmployee(null);
                    }}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate Employee
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedEmployee.id);
                    setSelectedEmployee(null);
                  }}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Employee
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
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
                  {selectedEmployee.phone && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.location && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.location}</p>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.bill_rate && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Bill Rate</p>
                        <p className="text-sm text-gray-900 font-semibold">${selectedEmployee.bill_rate.toFixed(0)}/hr</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
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
              )}

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Employment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Employee Number</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedEmployee.employee_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Status</p>
                      <p className="text-sm text-gray-900 font-semibold capitalize">{selectedEmployee.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Joined Date</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {new Date(selectedEmployee.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {selectedEmployee.bill_rate && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Monthly Capacity</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          ${((selectedEmployee.bill_rate * 160) / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={async (updatedData) => {
            try {
              await updateEmployee({ id: editingEmployee.id, data: updatedData });
              toast.success('Employee updated successfully');
              setEditingEmployee(null);
            } catch (error: any) {
              toast.error(error.response?.data?.detail || 'Failed to update employee');
            }
          }}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}

// Contractor-specific skills for builders, interior designers, and material suppliers
const SKILLS_OPTIONS = [
  // Construction & Building Skills
  'General Construction', 'Residential Construction', 'Commercial Construction', 'Industrial Construction',
  'Framing & Carpentry', 'Concrete Work', 'Masonry & Stonework', 'Roofing & Waterproofing',
  'Electrical Installation', 'Plumbing Installation', 'HVAC Installation', 'Drywall & Plastering',
  'Flooring Installation', 'Painting & Finishing', 'Tile & Stone Installation', 'Insulation & Weatherproofing',
  
  // Interior Design Skills
  'Interior Design', 'Space Planning', 'Color Consultation', 'Furniture Selection',
  'Kitchen Design', 'Bathroom Design', 'Lighting Design', 'Material Selection',
  '3D Rendering & Visualization', 'CAD Design', 'Design Consultation', 'Styling & Staging',
  
  // Material Supply & Logistics
  'Material Procurement', 'Supply Chain Management', 'Inventory Management', 'Vendor Relations',
  'Quality Control & Inspection', 'Material Sourcing', 'Logistics Coordination', 'Cost Estimation',
  'Material Specifications', 'Delivery Management', 'Supplier Negotiation', 'Material Testing',
  
  // Project Management & Business
  'Project Management', 'Site Supervision', 'Quality Assurance', 'Safety Management',
  'Budget Planning', 'Cost Control', 'Contract Management', 'Client Relations',
  'Team Leadership', 'Subcontractor Management', 'Permit & Code Compliance', 'Risk Management',
];

function EditEmployeeModal({ 
  employee, 
  onClose, 
  onSave, 
  isUpdating 
}: { 
  employee: Employee; 
  onClose: () => void; 
  onSave: (data: any) => Promise<void>; 
  isUpdating: boolean;
}) {
  // Fetch departments and roles
  const { allRoles, isLoading: isLoadingRoles } = useRoles();
  const {
    data: departments = [],
    isLoading: isLoadingDepartments,
  } = useQuery({
    queryKey: ['organization', 'departments'],
    queryFn: async () => {
      const response = await apiClient.get('/departments');
      return response.data || [];
    },
  });

  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone || '',
    job_title: employee.job_title || '',
    role: employee.role || '',
    department: employee.department || '',
    location: employee.location || '',
    bill_rate: employee.bill_rate || 0,
    skills: (employee.skills || []).join(', '),
  });

  const [phoneError, setPhoneError] = useState('');
  const [skillsSuggestions, setSkillsSuggestions] = useState<string[]>([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const skillsInputRef = useRef<HTMLInputElement>(null);
  const skillsDropdownRef = useRef<HTMLDivElement>(null);

  // USA phone number formatting
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 11);
    
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 1) return `+${limitedNumber}`;
    if (limitedNumber.length <= 4) return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1)}`;
    if (limitedNumber.length <= 7) return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1, 4)}-${limitedNumber.slice(4)}`;
    return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1, 4)}-${limitedNumber.slice(4, 7)}-${limitedNumber.slice(7, 11)}`;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) {
      setPhoneError('');
      return true;
    }
    if (cleaned.length < 10) {
      setPhoneError('Phone number must be at least 10 digits');
      return false;
    }
    if (cleaned.length > 11) {
      setPhoneError('Phone number must not exceed 11 digits');
      return false;
    }
    if (cleaned.length === 11 && !cleaned.startsWith('1')) {
      setPhoneError('Invalid country code. USA numbers should start with 1');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
    validatePhoneNumber(formatted);
  };

  // Skills autocomplete
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, skills: value });
    
    // Get the last skill being typed
    const skillsArray = value.split(',').map(s => s.trim());
    const lastSkill = skillsArray[skillsArray.length - 1];
    
    if (lastSkill && lastSkill.length > 0) {
      const filtered = SKILLS_OPTIONS.filter(skill =>
        skill.toLowerCase().includes(lastSkill.toLowerCase()) &&
        !skillsArray.slice(0, -1).includes(skill)
      );
      setSkillsSuggestions(filtered.slice(0, 5));
      setShowSkillsDropdown(filtered.length > 0);
    } else {
      setShowSkillsDropdown(false);
    }
  };

  const handleSkillSelect = (skill: string) => {
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    const lastIndex = skillsArray.length - 1;
    
    if (lastIndex >= 0 && skillsArray[lastIndex] && !skillsArray[lastIndex].includes(skill)) {
      skillsArray[lastIndex] = skill;
    } else {
      skillsArray.push(skill);
    }
    
    setFormData({ ...formData, skills: skillsArray.join(', ') });
    setShowSkillsDropdown(false);
    if (skillsInputRef.current) {
      skillsInputRef.current.focus();
    }
  };

  // Close skills dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        skillsDropdownRef.current &&
        !skillsDropdownRef.current.contains(event.target as Node) &&
        skillsInputRef.current &&
        !skillsInputRef.current.contains(event.target as Node)
      ) {
        setShowSkillsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle location change from Google Maps
  const handleLocationChange = (value: string, placeDetails?: google.maps.places.PlaceResult) => {
    if (placeDetails && placeDetails.address_components) {
      let city = '';
      let state = '';
      
      placeDetails.address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
      });
      
      const location = city && state ? `${city}, ${state}` : value;
      setFormData({ ...formData, location });
    } else {
      setFormData({ ...formData, location: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number before submitting
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      toast.error('Please enter a valid USA phone number');
      return;
    }
    
    await onSave({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      job_title: formData.job_title || undefined,
      role: formData.role || undefined,
      department: formData.department || undefined,
      location: formData.location || undefined,
      bill_rate: formData.bill_rate || undefined,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl flex items-center justify-center">
                <Edit className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Employee</h2>
                <p className="text-sm text-gray-600">{employee.name} • {employee.employee_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (USA)</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+1 555-123-4567"
                  className={`border-gray-300 ${phoneError ? 'border-red-500' : ''}`}
                />
                {phoneError && (
                  <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select role</option>
                {isLoadingRoles ? (
                  <option>Loading roles...</option>
                ) : (
                  allRoles.map((role: any) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select department</option>
                {isLoadingDepartments ? (
                  <option>Loading departments...</option>
                ) : (
                  departments.map((dept: any) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (USA)</Label>
              <PlacesAutocomplete
                value={formData.location}
                onChange={handleLocationChange}
                placeholder="Enter city, state or address"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bill_rate">Bill Rate ($/hour)</Label>
              <Input
                id="bill_rate"
                type="number"
                value={formData.bill_rate}
                onChange={(e) => setFormData({ ...formData, bill_rate: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <div className="relative">
                <Input
                  ref={skillsInputRef}
                  id="skills"
                  value={formData.skills}
                  onChange={handleSkillsChange}
                  onFocus={() => {
                    const lastSkill = formData.skills.split(',').pop()?.trim() || '';
                    if (lastSkill) {
                      const filtered = SKILLS_OPTIONS.filter(skill =>
                        skill.toLowerCase().includes(lastSkill.toLowerCase()) &&
                        !formData.skills.split(',').map(s => s.trim()).includes(skill)
                      );
                      setSkillsSuggestions(filtered.slice(0, 5));
                      setShowSkillsDropdown(filtered.length > 0);
                    }
                  }}
                  placeholder="React, TypeScript, Node.js"
                  className="border-gray-300"
                />
                {showSkillsDropdown && skillsSuggestions.length > 0 && (
                  <div
                    ref={skillsDropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                  >
                    {skillsSuggestions.map((skill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSkillSelect(skill)}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none text-sm"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Separate multiple skills with commas. Start typing for suggestions.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(EmployeeManagementPage);

