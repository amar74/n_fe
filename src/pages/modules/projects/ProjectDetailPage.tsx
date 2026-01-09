import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FolderKanban, Calendar, DollarSign, User, AlertTriangle, CheckCircle, Clock, Building2, FileText, Users, ShoppingCart, BarChart3, Eye, Download, MapPin, Phone, Mail, Globe, UserCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { useProjects } from '@/hooks/projects';
import { useToast } from '@/hooks/shared';
import { getStatusColor, getPhaseColor, formatCurrency, formatDate } from './components/utils';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useProject } = useProjects();
  const { toast } = useToast();
  
  const { data: project, isLoading } = useProject(id, !!id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center font-outfit">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-[#667085] font-outfit">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center font-outfit">
        <div className="text-center">
          <div className="p-4 bg-[#F9FAFB] rounded-full w-fit mx-auto mb-4">
            <FolderKanban className="h-12 w-12 text-[#D0D5DD]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 font-outfit">Project Not Found</h2>
          <p className="text-[#667085] mb-6 font-outfit">The project you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate('/module/projects')} 
            className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  // Calculate budget variance
  const budgetVariance = project.budget?.total_allocated && project.budget?.total_spent
    ? ((project.budget.total_spent / project.budget.total_allocated) * 100 - 100).toFixed(1)
    : '0.0';

  // Calculate completion percentage (mock - would come from actual milestones/deliverables)
  const completionPercentage = project.milestones
    ? Math.round(
        (project.milestones.filter((m: any) => m.status === 'completed').length /
          project.milestones.length) *
          100
      )
    : 0;

  // Mock data for tabs (would come from API)
  const contractInfo = {
    contractNumber: project.contract_id || project.id,
    value: project.contract_value || project.budget?.total_allocated || 0,
    signedDate: project.start_date || '',
    expiryDate: project.end_date || '',
    paymentTerms: 'Net 30 Days',
    deliverables: project.deliverables?.map((d: any) => d.title) || [],
    amendments: 0,
    status: project.status === 'completed' ? 'Active' : 'Active',
  };

  const clientInfo = {
    name: project.account_name || 'Unknown Client',
    contactPerson: project.team?.client_contacts?.[0]?.name || 'N/A',
    email: 'contact@client.com',
    phone: '+1 (555) 000-0000',
    address: 'Client Address',
    website: 'www.client.com',
    industry: 'Infrastructure',
    relationship: 'Premium Client',
    accountManager: project.team?.project_manager || 'N/A',
  };

  // Mock staff members (would come from API)
  const staffMembers = project.team?.team_size
    ? Array.from({ length: Math.min(project.team.team_size, 5) }, (_, i) => ({
        id: `staff-${i}`,
        name: `Team Member ${i + 1}`,
        role: i === 0 ? 'Project Manager' : i === 1 ? 'Technical Lead' : 'Team Member',
        billRate: 150 + i * 10,
        hoursThisMonth: 160 - i * 5,
        totalHours: 1200 + i * 100,
        utilization: 85 + i * 2,
        startDate: project.start_date || '',
      }))
    : [];

  // Mock procurement expenses (would come from API)
  const procurementExpenses: any[] = [];

  const totalStaffCost = staffMembers.reduce((sum, staff) => sum + (staff.billRate * staff.hoursThisMonth), 0);
  const totalProcurementCost = procurementExpenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
  const actualCost = (project.budget?.total_spent || 0) + totalStaffCost + totalProcurementCost;

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-green-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/module/projects')}
            className="mb-4 text-[#667085] hover:text-[#1A1A1A] font-outfit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 font-outfit">
                {project.title}
              </h1>
              <div className="flex items-center space-x-6 text-[#667085] mb-4 font-outfit">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{project.account_name || 'No account'}</span>
                </div>
                {project.team?.project_manager && (
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span>PM: {project.team.project_manager}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(project.status)} text-xs font-outfit`}>
                    {project.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {project.phase && (
                    <Badge className={`${getPhaseColor(project.phase)} text-xs font-outfit`}>
                      {project.phase?.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 ml-6">
              <Button
                variant="outline"
                onClick={() => navigate(`/module/projects/${project.id}/edit`)}
                className="font-outfit"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#667085] font-outfit">Project Budget</p>
                  <p className="text-2xl font-bold text-blue-600 font-outfit">
                    {formatCurrency(project.budget?.total_allocated || project.contract_value || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#667085] font-outfit">Actual Cost</p>
                  <p className="text-2xl font-bold text-purple-600 font-outfit">
                    {formatCurrency(actualCost)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#667085] font-outfit">Budget Variance</p>
                  <p className={`text-2xl font-bold font-outfit ${parseFloat(budgetVariance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {parseFloat(budgetVariance) > 0 ? '+' : ''}{budgetVariance}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#667085] font-outfit">Completion</p>
                  <p className="text-2xl font-bold text-green-600 font-outfit">{completionPercentage}%</p>
                  <ProgressBar value={completionPercentage} className="mt-2" />
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-white rounded-2xl border border-[#E5E7EB] p-1.5 font-outfit">
            <TabsTrigger value="overview" className="flex items-center space-x-2 font-outfit">
              <Eye className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="contract" className="flex items-center space-x-2 font-outfit">
              <FileText className="h-4 w-4" />
              <span>Contract</span>
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center space-x-2 font-outfit">
              <Building2 className="h-4 w-4" />
              <span>Client</span>
            </TabsTrigger>
            <TabsTrigger value="staffing" className="flex items-center space-x-2 font-outfit">
              <Users className="h-4 w-4" />
              <span>Staffing</span>
            </TabsTrigger>
            <TabsTrigger value="procurement" className="flex items-center space-x-2 font-outfit">
              <ShoppingCart className="h-4 w-4" />
              <span>Procurement</span>
            </TabsTrigger>
            <TabsTrigger value="financials" className="flex items-center space-x-2 font-outfit">
              <BarChart3 className="h-4 w-4" />
              <span>Financials</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-[#E5E7EB] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-outfit text-[#1A1A1A]">Project Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Start Date:</span>
                    <span className="font-medium text-[#1A1A1A]">{formatDate(project.start_date)}</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">End Date:</span>
                    <span className="font-medium text-[#1A1A1A]">{formatDate(project.end_date)}</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Current Phase:</span>
                    {project.phase && (
                      <Badge className={`${getPhaseColor(project.phase)} text-xs font-outfit`}>
                        {project.phase?.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Status:</span>
                    <Badge className={`${getStatusColor(project.status)} text-xs font-outfit`}>
                      {project.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#E5E7EB] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-outfit text-[#1A1A1A]">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Team Size:</span>
                    <span className="font-medium text-[#1A1A1A]">{project.team?.team_size || 0} members</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Monthly Staff Cost:</span>
                    <span className="font-medium text-[#1A1A1A]">{formatCurrency(totalStaffCost)}</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Total Procurement:</span>
                    <span className="font-medium text-[#1A1A1A]">{formatCurrency(totalProcurementCost)}</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Remaining Budget:</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatCurrency((project.budget?.total_allocated || 0) - actualCost)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {project.milestones && project.milestones.length > 0 && (
              <Card className="border border-[#E5E7EB] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-outfit text-[#1A1A1A]">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.milestones.map((milestone: any) => (
                      <div key={milestone.id} className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#1A1A1A] font-outfit">{milestone.title}</h4>
                          <Badge
                            className={
                              milestone.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : milestone.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {milestone.status}
                          </Badge>
                        </div>
                        {milestone.due_date && (
                          <p className="text-sm text-[#667085] font-outfit">
                            Due: {formatDate(milestone.due_date)}
                          </p>
                        )}
                        {milestone.completed_date && (
                          <p className="text-sm text-green-600 font-outfit">
                            Completed: {formatDate(milestone.completed_date)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {project.deliverables && project.deliverables.length > 0 && (
              <Card className="border border-[#E5E7EB] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-outfit text-[#1A1A1A]">Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.deliverables.map((deliverable: any) => (
                      <div key={deliverable.id} className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#1A1A1A] font-outfit">{deliverable.title}</h4>
                          <Badge
                            className={
                              deliverable.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : deliverable.status === 'testing'
                                ? 'bg-blue-100 text-blue-800'
                                : deliverable.status === 'in_development'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {deliverable.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        {deliverable.progress !== undefined && (
                          <div className="mt-2">
                            <ProgressBar value={deliverable.progress} className="h-2" />
                            <p className="text-xs text-[#667085] mt-1 font-outfit">{deliverable.progress}% complete</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {project.risks && project.risks.length > 0 && (
              <Card className="border border-[#E5E7EB] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-outfit text-[#1A1A1A]">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.risks.map((risk: any) => (
                      <div key={risk.id} className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#1A1A1A] font-outfit">{risk.description}</h4>
                          <div className="flex gap-2">
                            {risk.probability && (
                              <Badge
                                className={
                                  risk.probability === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : risk.probability === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {risk.probability} probability
                              </Badge>
                            )}
                            {risk.impact && (
                              <Badge
                                className={
                                  risk.impact === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : risk.impact === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {risk.impact} impact
                              </Badge>
                            )}
                          </div>
                        </div>
                        {risk.mitigation && (
                          <p className="text-sm text-[#667085] font-outfit mt-2">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contract" className="space-y-6">
            <Card className="border border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-outfit text-[#1A1A1A]">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Contract Information</span>
                </CardTitle>
                <CardDescription className="font-outfit">
                  Complete contract details and terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Contract Number</label>
                      <p className="text-lg font-medium text-[#1A1A1A] font-outfit">{contractInfo.contractNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Contract Value</label>
                      <p className="text-lg font-bold text-green-600 font-outfit">{formatCurrency(contractInfo.value)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Payment Terms</label>
                      <p className="text-lg font-medium text-[#1A1A1A] font-outfit">{contractInfo.paymentTerms}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Amendments</label>
                      <p className="text-lg font-medium text-[#1A1A1A] font-outfit">{contractInfo.amendments} amendments</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Signed Date</label>
                      <p className="text-lg font-medium text-[#1A1A1A] font-outfit">{formatDate(contractInfo.signedDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Expiry Date</label>
                      <p className="text-lg font-medium text-[#1A1A1A] font-outfit">{formatDate(contractInfo.expiryDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Status</label>
                      <Badge className={`${getStatusColor(contractInfo.status.toLowerCase())} text-xs font-outfit`}>
                        {contractInfo.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {contractInfo.deliverables.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-[#667085] font-outfit">Deliverables</label>
                    <div className="mt-2 space-y-2">
                      {contractInfo.deliverables.map((deliverable, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-[#1A1A1A] font-outfit">{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client" className="space-y-6">
            <Card className="border border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-outfit text-[#1A1A1A]">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <span>Client Information</span>
                </CardTitle>
                <CardDescription className="font-outfit">
                  Client details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Organization</label>
                      <p className="text-lg font-bold text-[#1A1A1A] font-outfit">{clientInfo.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Industry</label>
                      <p className="text-lg font-medium text-[#1A1A1A] font-outfit">{clientInfo.industry}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Relationship Level</label>
                      <Badge className="bg-yellow-100 text-yellow-800 font-outfit">{clientInfo.relationship}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Account Manager</label>
                      <p className="text-lg font-medium text-[#1A1A1A] font-outfit">{clientInfo.accountManager}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Primary Contact</label>
                      <p className="text-lg font-medium text-[#1A1A1A] font-outfit">{clientInfo.contactPerson}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-[#667085]" />
                        <a href={`mailto:${clientInfo.email}`} className="text-blue-600 hover:underline font-outfit">
                          {clientInfo.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-[#667085]" />
                        <a href={`tel:${clientInfo.phone}`} className="text-blue-600 hover:underline font-outfit">
                          {clientInfo.phone}
                        </a>
                      </div>
                    </div>
                    {clientInfo.website && (
                      <div>
                        <label className="text-sm font-medium text-[#667085] font-outfit">Website</label>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-[#667085]" />
                          <a 
                            href={`https://${clientInfo.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline font-outfit"
                          >
                            {clientInfo.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="text-sm font-medium text-[#667085] font-outfit">Address</label>
                  <p className="text-lg font-medium text-[#1A1A1A] mt-1 font-outfit">{clientInfo.address}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staffing" className="space-y-6">
            <Card className="border border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-outfit text-[#1A1A1A]">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Project Team</span>
                </CardTitle>
                <CardDescription className="font-outfit">
                  Current team members and their utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {staffMembers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-outfit">
                      <thead>
                        <tr className="border-b border-[#E5E7EB]">
                          <th className="text-left p-3 text-[#1A1A1A]">Team Member</th>
                          <th className="text-left p-3 text-[#1A1A1A]">Role</th>
                          <th className="text-right p-3 text-[#1A1A1A]">Bill Rate</th>
                          <th className="text-right p-3 text-[#1A1A1A]">This Month</th>
                          <th className="text-right p-3 text-[#1A1A1A]">Total Hours</th>
                          <th className="text-right p-3 text-[#1A1A1A]">Utilization</th>
                          <th className="text-left p-3 text-[#1A1A1A]">Start Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffMembers.map((staff) => (
                          <tr key={staff.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                            <td className="p-3 font-medium text-[#1A1A1A]">{staff.name}</td>
                            <td className="p-3 text-[#667085]">{staff.role}</td>
                            <td className="p-3 text-right font-medium text-[#1A1A1A]">{formatCurrency(staff.billRate)}/hr</td>
                            <td className="p-3 text-right text-[#667085]">{staff.hoursThisMonth} hrs</td>
                            <td className="p-3 text-right text-[#667085]">{staff.totalHours} hrs</td>
                            <td className="p-3 text-right">
                              <span className={`font-medium font-outfit ${getUtilizationColor(staff.utilization)}`}>
                                {staff.utilization}%
                              </span>
                            </td>
                            <td className="p-3 text-[#667085]">{formatDate(staff.startDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#E5E7EB] bg-[#F9FAFB]">
                          <td className="p-3 font-bold text-[#1A1A1A]" colSpan={2}>Team Totals</td>
                          <td className="p-3 text-right font-bold text-[#1A1A1A]">
                            {formatCurrency(staffMembers.reduce((sum, staff) => sum + staff.billRate, 0) / staffMembers.length)}/hr avg
                          </td>
                          <td className="p-3 text-right font-bold text-[#1A1A1A]">
                            {staffMembers.reduce((sum, staff) => sum + staff.hoursThisMonth, 0)} hrs
                          </td>
                          <td className="p-3 text-right font-bold text-[#1A1A1A]">
                            {staffMembers.reduce((sum, staff) => sum + staff.totalHours, 0)} hrs
                          </td>
                          <td className="p-3 text-right font-bold text-[#1A1A1A]">
                            {Math.round(staffMembers.reduce((sum, staff) => sum + staff.utilization, 0) / staffMembers.length)}% avg
                          </td>
                          <td className="p-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#667085] font-outfit">
                    No team members assigned yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="procurement" className="space-y-6">
            <Card className="border border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-outfit text-[#1A1A1A]">
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                  <span>Procurement & Expenses</span>
                </CardTitle>
                <CardDescription className="font-outfit">
                  Project-related purchases and expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {procurementExpenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-outfit">
                      <thead>
                        <tr className="border-b border-[#E5E7EB]">
                          <th className="text-left p-3 text-[#1A1A1A]">Description</th>
                          <th className="text-left p-3 text-[#1A1A1A]">Vendor</th>
                          <th className="text-left p-3 text-[#1A1A1A]">Category</th>
                          <th className="text-right p-3 text-[#1A1A1A]">Amount</th>
                          <th className="text-left p-3 text-[#1A1A1A]">Date</th>
                          <th className="text-left p-3 text-[#1A1A1A]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {procurementExpenses.map((expense: any) => (
                          <tr key={expense.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                            <td className="p-3 font-medium text-[#1A1A1A]">{expense.description}</td>
                            <td className="p-3 text-[#667085]">{expense.vendor}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="font-outfit">{expense.category}</Badge>
                            </td>
                            <td className="p-3 text-right font-medium text-[#1A1A1A]">{formatCurrency(expense.amount)}</td>
                            <td className="p-3 text-[#667085]">{formatDate(expense.date)}</td>
                            <td className="p-3">
                              <Badge className={`${getStatusColor(expense.status)} text-xs font-outfit`}>
                                {expense.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#E5E7EB] bg-[#F9FAFB]">
                          <td className="p-3 font-bold text-[#1A1A1A]" colSpan={3}>Total Procurement</td>
                          <td className="p-3 text-right font-bold text-lg text-[#1A1A1A]">{formatCurrency(totalProcurementCost)}</td>
                          <td className="p-3" colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#667085] font-outfit">
                    No procurement expenses recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-[#E5E7EB] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-outfit text-[#1A1A1A]">Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Original Budget:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(project.budget?.total_allocated || 0)}</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Spent to Date:</span>
                    <span className="font-bold text-purple-600">{formatCurrency(actualCost)}</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Remaining Budget:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((project.budget?.total_allocated || 0) - actualCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-outfit">
                    <span className="text-[#667085]">Budget Variance:</span>
                    <span className={`font-bold ${parseFloat(budgetVariance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {parseFloat(budgetVariance) > 0 ? '+' : ''}{budgetVariance}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={project.budget?.total_allocated ? (actualCost / project.budget.total_allocated) * 100 : 0} 
                    className="mt-4"
                  />
                  <p className="text-xs text-[#667085] text-center font-outfit">
                    {project.budget?.total_allocated
                      ? ((actualCost / project.budget.total_allocated) * 100).toFixed(1)
                      : 0}% of budget used
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-[#E5E7EB] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-outfit text-[#1A1A1A]">Cost Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Labor Costs:</span>
                    <span className="font-medium text-[#1A1A1A]">{formatCurrency(totalStaffCost)}</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Procurement:</span>
                    <span className="font-medium text-[#1A1A1A]">{formatCurrency(totalProcurementCost)}</span>
                  </div>
                  <div className="flex justify-between font-outfit">
                    <span className="text-[#667085]">Overhead (25%):</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatCurrency((totalStaffCost + totalProcurementCost) * 0.25)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-outfit">
                    <span className="text-[#667085]">Total Project Cost:</span>
                    <span className="font-bold text-lg text-[#1A1A1A]">{formatCurrency(actualCost)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {project.health && (
              <Card className="border border-[#E5E7EB] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-outfit text-[#1A1A1A]">Project Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {project.health.overall_score !== undefined && (
                      <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                        <label className="text-sm text-[#667085] font-outfit">Overall Score</label>
                        <p className="text-2xl font-bold text-[#1A1A1A] font-outfit mt-1">
                          {project.health.overall_score}/10
                        </p>
                      </div>
                    )}
                    {project.health.schedule_health && (
                      <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                        <label className="text-sm text-[#667085] font-outfit">Schedule Health</label>
                        <p className="text-2xl font-bold text-[#1A1A1A] font-outfit mt-1 capitalize">
                          {project.health.schedule_health.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                    {project.health.budget_health && (
                      <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                        <label className="text-sm text-[#667085] font-outfit">Budget Health</label>
                        <p className="text-2xl font-bold text-[#1A1A1A] font-outfit mt-1 capitalize">
                          {project.health.budget_health.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
