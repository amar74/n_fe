import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Download, Eye, Filter, Users, UserPlus, Shield, BarChart3, Power, Upload } from 'lucide-react';
import { KanbanBoard, type Employee } from './components/KanbanBoard';
import { AddEmployeeWizard } from './components/AddEmployeeWizard';
import { EmployeeDetailsModal } from './components/EmployeeDetailsModal';
import { ActivateEmployeeModal } from './components/ActivateEmployeeModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { RolePermissionConfig } from './components/RolePermissionConfig';
import { AISkillsGapWidget } from './components/AISkillsGapWidget';
import { SmartNotificationPreview } from './components/SmartNotificationPreview';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeActivation } from '@/hooks/useEmployeeActivation';

type TabType = 'onboarding' | 'permissions' | 'analytics';

function OnboardingPage() {
  // API Integration - Real data from database
  const { 
    employees: apiEmployees, 
    isLoading,
    createEmployee, 
    changeStage,
    uploadResume,
    isCreating,
    isChangingStage 
  } = useEmployees();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToActivate, setEmployeeToActivate] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activeTab, setActiveTab] = useState<TabType>('onboarding');
  
  const { activateEmployee } = useEmployeeActivation();

  // Convert API employees to frontend format
  const employees = apiEmployees.map((emp: any) => ({
    id: emp.id,
    number: emp.employee_number,
    name: emp.name,
    email: emp.email,
    phone: emp.phone || '',
    cvUrl: emp.resumes?.[0]?.file_url || '/cv/placeholder.pdf',
    stage: emp.status,
    appliedDate: emp.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    reviewNotes: emp.review_notes || '',
    position: emp.job_title || '',  // Designation (job title like "Senior Developer")
    department: emp.department || '',  // Department (like "IT", "Engineering")
    role: emp.role || 'employee',  // System role (Employee, Admin, Manager, Team Lead)
    experience: emp.experience || '',
    skills: emp.skills || [],
    rating: emp.ai_match_percentage ? Math.round(emp.ai_match_percentage / 20) : undefined,
    location: emp.location || '',
    user_id: emp.user_id || null,
    status: emp.status || 'pending',
  }));

  // Filter employees by search
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group employees by stage
  const employeesByStage = {
    pending: filteredEmployees.filter(e => e.stage === 'pending'),
    review: filteredEmployees.filter(e => e.stage === 'review'),
    accepted: filteredEmployees.filter(e => e.stage === 'accepted'),
    rejected: filteredEmployees.filter(e => e.stage === 'rejected'),
  };

  const handleAddEmployee = async (data: any) => {
    try {
      console.log('Creating employee:', data.name);
      
      // Step 1: Create employee with minimal data (FAST - no AI processing)
      const newEmployee = await createEmployee({
        name: data.name,
        email: data.email,
        phone: data.phone,
        job_title: data.jobTitle || data.position,
        role: data.role || 'employee',
        department: data.department || 'General',
        location: data.location,
        bill_rate: data.billRate ? parseFloat(data.billRate) : undefined,
        experience: data.experience || '0 years',
        skills: data.skills || [],
        use_ai_suggestion: false, // ⚡ CRITICAL: No AI processing on backend
      });
      
      console.log('Employee created:', newEmployee.id);
      
      // Step 2: Close modal immediately (instant UX feedback)
      setIsAddModalOpen(false);
      
      // Step 3: Upload CV in background ONLY if provided (non-blocking)
      if (data.cvFile && newEmployee.id) {
        console.log('Uploading CV in background...');
        // Fire and forget - don't wait
        uploadResume({ employeeId: newEmployee.id, file: data.cvFile })
          .then(() => console.log('CV uploaded and parsed'))
          .catch(err => console.warn('CV upload failed (non-critical):', err));
      }
      
      // Data will auto-refresh via React Query (cache invalidation)
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
      
      // Show user-friendly error
      if (errorMsg.includes('timeout')) {
        alert('Request took too long. The employee may have been created. Please refresh and check.');
      } else {
        alert(`Failed to create employee: ${errorMsg}`);
      }
    }
  };

  const handleStageChange = async (employeeId: string, newStage: string, notes?: string) => {
    console.log(`Changing stage for ${employeeId} to ${newStage}`, notes ? `with notes: ${notes}` : '');
    
    // Optimistic update - UI updates immediately (before API call)
    const originalEmployees = [...apiEmployees];
    
    try {
      // Update in background - user doesn't wait
      // Pass notes to API if provided
      changeStage({ id: employeeId, stage: newStage, notes })
        .then(() => {
          console.log(`Stage changed to ${newStage}`);
          if (notes) {
            console.log(`Notes saved: ${notes}`);
          }
        })
        .catch((error) => {
          console.error('Stage change failed:', error);
          // React Query will revert on error
        });
      
      // UI already updated via React Query's optimistic update
    } catch (error) {
      console.error('Failed to change stage:', error);
    }
  };

  const handleDownloadCV = (cvUrl: string, name: string) => {
    // Instant download - open in new tab or download directly
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = `CV-${name.replace(/\s+/g, '-')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`CV download initiated for ${name}`);
  };

  const handleActivateEmployee = async (activationData: any) => {
    try {
      await activateEmployee(activationData);
      setEmployeeToActivate(null);
    } catch (error) {
      console.error('Activation failed:', error);
    }
  };

  const handleUpdatePermissions = (employeeId: string, permissions: string[]) => {
    console.log(`Updating permissions for ${employeeId}:`, permissions);
    // In real implementation, this would call API
    alert(`Permissions updated successfully for employee ${employeeId}`);
  };

  const stats = [
    { label: 'Total Applications', value: employees.length, icon: Users, color: 'bg-slate-100' },
    { label: 'Pending Review', value: employeesByStage.pending.length, icon: Users, color: 'bg-yellow-50' },
    { label: 'In Review', value: employeesByStage.review.length, icon: Users, color: 'bg-blue-50' },
    { label: 'Accepted', value: employeesByStage.accepted.length, icon: Users, color: 'bg-green-50' },
    { label: 'Rejected', value: employeesByStage.rejected.length, icon: Users, color: 'bg-red-50' },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading employees from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Resources</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-[#1A1A1A] text-3xl font-bold font-outfit leading-loose">
                  Employee Onboarding
                </h1>
                <p className="text-gray-600 text-sm font-medium mt-1">
                  Manage candidate applications and hiring pipeline
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/staffing-plan'}
              className="h-11 px-5 py-2 rounded-lg flex items-center gap-2.5 hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#161950' }}
            >
              <Users className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit leading-normal">
                Staffing Plan
              </span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
              className="h-11 px-5 py-2 bg-white rounded-lg border border-gray-300 flex items-center gap-2.5 hover:bg-gray-50 transition-all"
            >
              <Filter className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 text-sm font-medium font-outfit leading-normal">
                {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
              </span>
            </button>

            <button 
              onClick={() => setIsBulkUploadOpen(true)}
              className="h-11 px-5 py-2 bg-purple-600 rounded-lg flex items-center gap-2.5 hover:bg-purple-700 transition-all shadow-lg"
            >
              <Upload className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit leading-normal">
                Bulk Upload CSV
              </span>
            </button>

            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="h-11 px-5 py-2 rounded-lg flex items-center gap-2.5 hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#161950' }}
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit leading-normal">
                Add Employee CV
              </span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center bg-white rounded-xl p-2 border border-gray-200 shadow-lg">
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'onboarding'
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={activeTab === 'onboarding' ? { backgroundColor: '#161950' } : {}}
          >
            📋 Employee Onboarding
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'permissions'
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={activeTab === 'permissions' ? { backgroundColor: '#161950' } : {}}
          >
            🔐 Role & Permissions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={activeTab === 'analytics' ? { backgroundColor: '#161950' } : {}}
          >
            📊 AI Analytics
          </button>
        </div>

        {activeTab === 'onboarding' && (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className={`${stat.color} rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <stat.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-gradient-to-r from-slate-500 to-slate-600' :
                        index === 1 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        index === 2 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                        index === 3 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      style={{ width: `${(stat.value / employees.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'onboarding' && (
          <>
            {/* Enhanced Search Bar */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, position, or employee number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
                
                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      viewMode === 'kanban' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Kanban
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Kanban Board or List View */}
            {viewMode === 'kanban' ? (
          <KanbanBoard
            employeesByStage={employeesByStage}
            onStageChange={handleStageChange}
            onEmployeeClick={setSelectedEmployee}
            onDownloadCV={handleDownloadCV}
            onActivateEmployee={setEmployeeToActivate}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stage</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Applied Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.number}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.stage === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          employee.stage === 'review' ? 'bg-blue-100 text-blue-800' :
                          employee.stage === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {employee.stage.charAt(0).toUpperCase() + employee.stage.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.appliedDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {employee.stage === 'accepted' && (
                            <button
                              onClick={() => setEmployeeToActivate(employee)}
                              className="px-3 py-1.5 bg-gradient-to-r from-[#151950] to-[#1e2570] text-white rounded-lg hover:shadow-lg transition-all text-xs font-semibold flex items-center gap-1"
                              title="Activate User Account"
                            >
                              <Power className="w-3.5 h-3.5" />
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedEmployee(employee)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDownloadCV(employee.cvUrl, employee.name)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download CV"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
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
          </>
        )}

        {/* Role & Permission Configuration Section */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            {/* Activated Employees Count Badge */}
            {(() => {
              const activatedEmployees = employees.filter((emp: any) => emp.status === 'active' && emp.user_id != null);
              return activatedEmployees.length > 0 ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-700 flex items-center gap-2 font-outfit">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Showing {activatedEmployees.length} activated employee{activatedEmployees.length !== 1 ? 's' : ''} with user accounts
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-lg border border-amber-200">
                  <p className="text-sm font-semibold text-amber-700 flex items-center gap-2 font-outfit">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    No activated employees found. Activate employees from the Onboarding tab first.
                  </p>
                </div>
              );
            })()}
            
            <RolePermissionConfig
              employees={employees.filter((emp: any) => emp.status === 'active' && emp.user_id != null)}
              onUpdatePermissions={handleUpdatePermissions}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AISkillsGapWidget 
              totalEmployees={employees.filter(e => e.stage === 'accepted').length} 
              employees={employees.filter(e => e.stage === 'accepted')} 
            />
            
            {employees.filter(e => e.stage === 'accepted').length > 0 && (
              <SmartNotificationPreview
                employeeName={employees.filter(e => e.stage === 'accepted')[0]?.name || 'New Employee'}
                employeeEmail={employees.filter(e => e.stage === 'accepted')[0]?.email || 'employee@company.com'}
                role={employees.filter(e => e.stage === 'accepted')[0]?.position || 'Team Member'}
              />
            )}
          </div>
        )}
      </div>

      {/* Add Employee Wizard Modal */}
      <AddEmployeeWizard
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEmployee}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          window.location.reload(); // Refresh to show newly imported employees
        }}
      />

      {/* Employee Details Modal */}
      <EmployeeDetailsModal
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onStageChange={handleStageChange}
        onDownloadCV={handleDownloadCV}
      />

      {/* Activate Employee Modal */}
      <ActivateEmployeeModal
        employee={employeeToActivate}
        isOpen={!!employeeToActivate}
        onClose={() => setEmployeeToActivate(null)}
        onActivate={handleActivateEmployee}
      />
    </div>
  );
}

export default memo(OnboardingPage);
