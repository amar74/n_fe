import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Briefcase,
  Clock,
  Target,
  CheckCircle2,
  Edit,
  Download,
  Loader2
} from 'lucide-react';
import { useStaffPlanning } from '../../../hooks/useStaffPlanning';

const ViewStaffPlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useStaffPlanWithAllocations } = useStaffPlanning();
  
  const planId = Number(id);
  const isValidId = !isNaN(planId) && planId > 0;
  
  const { data: plan, isLoading, error, refetch } = useStaffPlanWithAllocations(isValidId ? planId : null);

  useEffect(() => {
    if (id && isValidId) {
      refetch();
    }
  }, [id, isValidId, refetch]);

  useEffect(() => {
    if (plan) {
      console.log('Loaded plan with allocations:', {
        planId: plan.id,
        projectName: plan.project_name,
        teamSize: plan.allocations?.length || 0,
        allocations: plan.allocations
      });
    }
  }, [plan]);

  // Handle invalid ID
  if (!isValidId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Invalid plan ID</p>
          <button 
            onClick={() => navigate('/staffing-plan')}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#161950' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#161950' }} />
          <p className="text-gray-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load plan details</p>
          <button 
            onClick={() => navigate('/staffing-plan')}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#161950' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.project_name}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/staffing-plan')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0f0ff' }}>
                    <Briefcase className="w-6 h-6" style={{ color: '#161950' }} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{plan.project_name}</h1>
                    <p className="text-gray-500 mt-1">Created {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  plan.status === 'active' ? 'bg-green-100 text-green-700' :
                  plan.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </span>
                
                <button 
                  onClick={handleExport}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                
                <Link
                  to={`/staffing-plan/edit/${plan.id}`}
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  style={{ backgroundColor: '#161950' }}
                >
                  <Edit className="w-4 h-4" />
                  Edit Plan
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0f0ff' }}>
                <Calendar className="w-5 h-5" style={{ color: '#161950' }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-2xl font-bold text-gray-900">{plan.duration_months} months</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0f0ff' }}>
                <Users className="w-5 h-5" style={{ color: '#161950' }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="text-2xl font-bold text-gray-900">{plan.allocations?.length || 0} members</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0f0ff' }}>
                <DollarSign className="w-5 h-5" style={{ color: '#161950' }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">${(plan.total_cost || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0f0ff' }}>
                <Target className="w-5 h-5" style={{ color: '#161950' }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-2xl font-bold text-gray-900">${(plan.total_price || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Financial Breakdown</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Total Labor Cost</span>
                <span className="font-bold text-gray-900">${(plan.total_cost || 0).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Overhead Rate</span>
                <span className="font-bold text-gray-900">{plan.overhead_rate}%</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Overhead Amount</span>
                <span className="font-bold text-gray-900">${((plan.total_cost || 0) * (plan.overhead_rate / 100)).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-bold text-gray-900">{plan.profit_margin}%</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Escalation Rate</span>
                <span className="font-bold text-gray-900">{plan.annual_escalation_rate}% annually</span>
              </div>
              
              <div className="flex justify-between items-center py-4 px-6 mt-4 rounded-lg" style={{ backgroundColor: '#f0f0ff' }}>
                <span className="font-bold text-gray-900">Total Project Price</span>
                <span className="text-2xl font-bold" style={{ color: '#161950' }}>${(plan.total_price || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Project Parameters</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Duration</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{plan.duration_months} months</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Start Date</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {plan.project_start_date ? new Date(plan.project_start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Annual Escalation</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{plan.annual_escalation_rate}% per year</p>
                </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Status</span>
                </div>
                <p className="text-lg font-bold text-gray-900 capitalize">{plan.status}</p>
              </div>
            </div>
          </div>
        </div>

        {plan.allocations && plan.allocations.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Team Allocations ({plan.allocations.length})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700" style={{ backgroundColor: '#f0f0ff' }}>Resource</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700" style={{ backgroundColor: '#f0f0ff' }}>Role</th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-gray-700" style={{ backgroundColor: '#f0f0ff' }}>Start Month</th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-gray-700" style={{ backgroundColor: '#f0f0ff' }}>End Month</th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-gray-700" style={{ backgroundColor: '#f0f0ff' }}>Hours/Week</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-gray-700" style={{ backgroundColor: '#f0f0ff' }}>Hourly Rate</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-gray-700" style={{ backgroundColor: '#f0f0ff' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.allocations.map((allocation: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-medium text-gray-900">{allocation.resource_name || 'N/A'}</span>
                          {allocation.level && (
                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              {allocation.level}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{allocation.role || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-900">Month {allocation.start_month}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-900">Month {allocation.end_month}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-900">{allocation.hours_per_week}h</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-gray-900">${allocation.hourly_rate}/hr</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-gray-900">${(allocation.total_cost || 0).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300" style={{ backgroundColor: '#f0f0ff' }}>
                    <td colSpan={6} className="py-4 px-4 text-right">
                      <span className="text-lg font-bold text-gray-900">Total Cost:</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-xl font-bold" style={{ color: '#161950' }}>
                        ${plan.allocations.reduce((sum: number, alloc: any) => sum + (alloc.total_cost || 0), 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Team Allocations</h2>
            </div>
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No team members allocated yet</p>
              <p className="text-sm text-gray-500 mb-4">Click "Edit Plan" to add team members to this project</p>
              <Link
                to={`/staffing-plan/edit/${plan.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#161950' }}
              >
                <Edit className="w-4 h-4" />
                Add Team Members
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStaffPlan;

