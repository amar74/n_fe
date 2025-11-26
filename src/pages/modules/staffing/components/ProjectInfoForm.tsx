import { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, TrendingUp, Building2, Clock, Target, Sparkles, Info, CheckCircle, ArrowUpRight, Brain, Lightbulb, X } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { useStaffPlanning } from '@/hooks/useStaffPlanning';

interface ProjectInfo {
  projectId?: string;  // UUID
  projectName: string;
  projectDescription: string;
  projectStartDate: string;
  durationMonths: number;
  overheadRate: number;
  profitMargin: number;
}

interface Props {
  initialData: ProjectInfo;
  onSubmit: (data: ProjectInfo) => void;
  isEditMode?: boolean;
}

export default function ProjectInfoForm({ initialData, onSubmit, isEditMode = false }: Props) {
  const [formData, setFormData] = useState<ProjectInfo>(initialData);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Fetch existing staff plans to check which projects already have plans
  const { useStaffPlansList } = useStaffPlanning();
  const { data: existingStaffPlans = [] } = useStaffPlansList();
  
  // Create sets of project names and project IDs that already have staff plans
  const projectNamesWithPlans = new Set(
    existingStaffPlans
      .map(plan => plan.project_name?.toLowerCase().trim())
      .filter(Boolean)
  );
  
  const projectIdsWithPlans = new Set(
    existingStaffPlans
      .map(plan => plan.project_id)
      .filter(Boolean)
  );
  
  // Helper function to check if an opportunity already has a staff plan
  const hasExistingPlan = (opp: any): boolean => {
    // Check by project_id if it's a valid UUID
    if (opp.id && typeof opp.id === 'string' && opp.id.length > 10) {
      return projectIdsWithPlans.has(opp.id);
    }
    // Check by project name (for mock opportunities with numeric IDs)
    return projectNamesWithPlans.has(opp.name?.toLowerCase().trim());
  };

  // Update form data when initialData changes (important for edit mode)
  useEffect(() => {
    console.log('ProjectInfoForm received initialData:', initialData);
    setFormData(initialData);
  }, [initialData]);

  // Mock opportunities - Replace with actual API call
  useEffect(() => {
    setOpportunities([
      {
        id: 1,
        name: 'High-Rise Construction - Downtown Plaza',
        description: 'Commercial high-rise building in downtown with 45 floors, mixed-use development',
        budget: 850000,
        startDate: '2025-02-01',
        location: 'New York, NY',
        estimatedDuration: 24
      },
      {
        id: 2,
        name: 'Bridge Infrastructure Development',
        description: 'Major bridge renovation and expansion project spanning 2.5 miles',
        budget: 1250000,
        startDate: '2025-03-15',
        location: 'San Francisco, CA',
        estimatedDuration: 36
      },
      {
        id: 3,
        name: 'Urban Planning - Smart City Initiative',
        description: 'City-wide urban development planning with IoT integration',
        budget: 620000,
        startDate: '2025-04-01',
        location: 'Austin, TX',
        estimatedDuration: 18
      },
      {
        id: 4,
        name: 'Airport Terminal Expansion',
        description: 'International terminal expansion with retail and dining facilities',
        budget: 1850000,
        startDate: '2025-05-01',
        location: 'Los Angeles, CA',
        estimatedDuration: 42
      }
    ]);
  }, []);

  const handleOpportunitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opportunityId = e.target.value;
    const opportunity = opportunities.find(o => String(o.id) === opportunityId);
    
    if (opportunity) {
      // Only set projectId if it's a valid UUID, otherwise leave it undefined
      // Mock opportunities have numeric IDs, so we don't set projectId for them
      setFormData({
        ...formData,
        projectId: undefined,  // Don't set projectId for mock opportunities (they have numeric IDs, not UUIDs)
        projectName: opportunity.name,
        projectDescription: opportunity.description || '',
        projectStartDate: opportunity.startDate || '',
        durationMonths: opportunity.estimatedDuration || 12
      });
      setIsAutoFilled(true);
      
      // Show success notification
      setTimeout(() => setIsAutoFilled(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectName || !formData.projectStartDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    onSubmit(formData);
  };

  const selectedOpportunity = opportunities.find(o => String(o.id) === String(formData.projectId));

  const handleGetAIRecommendations = async () => {
    setIsLoadingAI(true);
    setShowAIRecommendations(true);
    
    try {
      const response = await apiClient.post('/staff-planning/ai-project-parameters', {
        project_name: formData.projectName || 'New Project',
        project_description: formData.projectDescription,
        project_type: 'Infrastructure',
        project_value: selectedOpportunity?.budget || 500000
      });
      
      setAiRecommendations(response.data);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
      setAiRecommendations({
        analysis: 'Using industry-standard parameters for construction projects.',
        recommended_parameters: {
          duration_months: 24,
          overhead_rate: 25.0,
          profit_margin: 15.0
        },
        market_insights: [
          'Construction inflation trending at 3-4% annually',
          'Typical overhead: 20-30% for infrastructure projects'
        ]
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const applyAIRecommendations = () => {
    if (aiRecommendations?.recommended_parameters) {
      setFormData({
        ...formData,
        durationMonths: aiRecommendations.recommended_parameters.duration_months,
        overheadRate: aiRecommendations.recommended_parameters.overhead_rate,
        profitMargin: aiRecommendations.recommended_parameters.profit_margin
      });
      setShowAIRecommendations(false);
      alert('AI recommendations applied successfully!');
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left Column - Main Form */}
      <div className="flex-1 space-y-6">
      {/* Success Alert */}
      {isAutoFilled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-bold text-green-900">Project Details Auto-Filled!</p>
            <p className="text-xs text-green-700">Data has been automatically populated from the selected opportunity.</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-300">
        {/* Enhanced Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                Project Configuration
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Set up basic project information and financial parameters
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Step 1 of 4</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Opportunity Selection - Featured */}
          <div className={`mb-8 p-5 rounded-lg border-2 ${isEditMode ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: isEditMode ? '#6b7280' : '#161950' }}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-base font-bold text-gray-900 mb-1">
                  {isEditMode ? 'Project (Locked)' : 'Select Project (Opportunity) *'}
                </label>
                <p className="text-xs text-gray-600">
                  {isEditMode 
                    ? 'Project cannot be changed in edit mode. Create a new plan to select a different project.' 
                    : 'Choose from existing opportunities to auto-populate project details'}
                </p>
              </div>
            </div>
            
            {isEditMode ? (
              <div className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-200 text-sm font-medium text-gray-700 cursor-not-allowed">
                {formData.projectName || 'No project selected'}
              </div>
            ) : (
              <select
                onChange={handleOpportunitySelect}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm font-medium bg-white"
                defaultValue=""
              >
                <option value="" disabled>Choose a project from opportunities...</option>
                {opportunities.map(opp => {
                  const hasPlan = hasExistingPlan(opp);
                  return (
                    <option 
                      key={opp.id} 
                      value={opp.id}
                      disabled={hasPlan}
                      style={hasPlan ? { color: '#9ca3af', fontStyle: 'italic' } : {}}
                    >
                      {opp.name} • ${(opp.budget / 1000).toFixed(0)}K budget • {opp.location}
                      {hasPlan ? ' (Staff Plan Exists)' : ''}
                    </option>
                  );
                })}
              </select>
            )}
            
            {selectedOpportunity && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  <p className="text-xs font-bold text-gray-900">Auto-Filled Details</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600">Location: </span>
                    <span className="font-semibold text-gray-900">{selectedOpportunity.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget: </span>
                    <span className="font-semibold text-green-600">${selectedOpportunity.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Project Details */}
            <div className="space-y-6">
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Project Details
                </h3>

                {/* Project Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name * {isEditMode && <span className="text-xs text-gray-500">(Locked)</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="Enter project name"
                    className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm ${
                      isEditMode 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    disabled={isEditMode}
                    required
                  />
                </div>

                {/* Project Description */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Description {isEditMode && <span className="text-xs text-gray-500">(Locked)</span>}
                  </label>
                  <textarea
                    value={formData.projectDescription}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    placeholder="Enter detailed project description..."
                    rows={5}
                    className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none ${
                      isEditMode 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    disabled={isEditMode}
                  />
                  {!isEditMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.projectDescription.length}/500 characters
                    </p>
                  )}
                </div>

                {/* Project Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Project Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.projectStartDate}
                    onChange={(e) => setFormData({ ...formData, projectStartDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Financial Parameters */}
            <div className="space-y-6">
              <div className="p-5 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Financial Parameters
                </h3>

                {/* Duration */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Duration (Months) *
                  </label>
                  <input
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                    min="1"
                    max="120"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    required
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">Project timeline</p>
                    <p className="text-xs font-bold text-green-600">
                      {Math.ceil(formData.durationMonths / 12)} year(s)
                    </p>
                  </div>
                </div>

                {/* Overhead Rate */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-600" />
                    Overhead Rate (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.overheadRate}
                      onChange={(e) => setFormData({ ...formData, overheadRate: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm pr-12"
                      required
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-600">
                      %
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min(formData.overheadRate, 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold">{formData.overheadRate}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Typical range: 20-30%
                  </p>
                </div>

                {/* Profit Margin */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    Profit Margin (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.profitMargin}
                      onChange={(e) => setFormData({ ...formData, profitMargin: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm pr-12"
                      required
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-600">
                      %
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min(formData.profitMargin, 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold">{formData.profitMargin}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Typical range: 10-20%
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Quick Calculator Preview */}
          {formData.durationMonths && formData.overheadRate && formData.profitMargin && (
            <div className="mt-6 p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-gray-900">Quick Preview</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Duration</p>
                  <p className="text-lg font-bold text-blue-600">{formData.durationMonths}</p>
                  <p className="text-xs text-gray-500">months</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Overhead</p>
                  <p className="text-lg font-bold text-orange-600">{formData.overheadRate}%</p>
                  <p className="text-xs text-gray-500">on labor</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Profit Target</p>
                  <p className="text-lg font-bold text-green-600">{formData.profitMargin}%</p>
                  <p className="text-xs text-gray-500">margin</p>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-indigo-900 mb-2">
                  💡 How Auto-Fetch Works
                </h4>
                <ul className="text-xs text-indigo-700 space-y-1">
                  <li>• <strong>Select an opportunity</strong> from the dropdown to auto-populate project details</li>
                  <li>• <strong>Project name, description, and start date</strong> will be automatically filled</li>
                  <li>• <strong>Financial parameters</strong> can be adjusted manually or use default values</li>
                  <li>• <strong>Budget data</strong> from the opportunity helps estimate costs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="h-12 px-10 rounded-lg text-white text-base font-bold hover:opacity-90 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3"
              style={{ backgroundColor: '#161950' }}
            >
              Continue to Staff Planning
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
      </div>

      {/* Right Column - AI Recommendations Side Panel */}
      <div className="w-96 flex-shrink-0">
        <div className="sticky top-6 space-y-4">
          {/* AI Helper Card */}
          <div className="bg-white rounded-lg border-2 border-gray-300 p-5" style={{ borderColor: '#161950', backgroundColor: '#f0f5ff' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#161950' }}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-xs text-gray-600 mb-3">
                  AI can estimate project parameters based on market trends
                </p>
                <button 
                  onClick={handleGetAIRecommendations}
                  disabled={isLoadingAI || !formData.projectName}
                  className="w-full px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: '#161950' }}
                >
                  {isLoadingAI ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get Recommendations
                    </>
                  )}
                </button>
                {!formData.projectName && (
                  <p className="text-xs text-orange-600 mt-2">💡 Enter project name first</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Recommendations Panel */}
          {showAIRecommendations && aiRecommendations && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Parameter Recommendations</h3>
                  <p className="text-xs text-gray-600"> Based on market analysis & project scope</p>
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
            {/* AI Analysis */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8f9ff', borderWidth: '1px', borderColor: '#e0e7ff' }}>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aiRecommendations.analysis}
              </p>
            </div>

            {/* Recommended Parameters */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: '#161950' }} />
                Recommended Financial Parameters
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-gray-700">Duration</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {aiRecommendations.recommended_parameters.duration_months}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">months ({Math.ceil(aiRecommendations.recommended_parameters.duration_months / 12)} years)</p>
                  {aiRecommendations.rationale?.duration && (
                    <p className="text-xs text-gray-600 mt-2 italic">{aiRecommendations.rationale.duration}</p>
                  )}
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-semibold text-gray-700">Overhead Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {aiRecommendations.recommended_parameters.overhead_rate}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">of labor cost</p>
                  {aiRecommendations.rationale?.overhead && (
                    <p className="text-xs text-gray-600 mt-2 italic">{aiRecommendations.rationale.overhead}</p>
                  )}
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-gray-700">Profit Margin</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {aiRecommendations.recommended_parameters.profit_margin}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">target margin</p>
                  {aiRecommendations.rationale?.profit && (
                    <p className="text-xs text-gray-600 mt-2 italic">{aiRecommendations.rationale.profit}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Market Insights */}
            {aiRecommendations.market_insights?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Market Insights
                </h4>
                <div className="space-y-2">
                  {aiRecommendations.market_insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <p className="text-xs text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                These recommendations are based on industry standards and current market conditions
              </p>
              <button
                onClick={applyAIRecommendations}
                className="px-6 py-3 rounded-lg text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
                style={{ backgroundColor: '#161950' }}
              >
                <CheckCircle className="w-5 h-5" />
                Apply Recommendations
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
