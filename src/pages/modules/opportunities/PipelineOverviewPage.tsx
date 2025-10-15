import { memo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOpportunity } from '@/hooks/useOpportunity';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Building, 
  FileText, 
  Plus,
  Eye,
  Trash2,
  Bot
} from 'lucide-react';

type TabType = 'overview' | 'client' | 'competition' | 'delivery' | 'team' | 'financial' | 'legal';

interface Document {
  id: string;
  name: string;
  category: string;
  purpose: string;
  type: string;
}

function PipelineOverviewPage() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { data: opportunity, isLoading, error } = useOpportunity(opportunityId);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-950"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Opportunity</h2>
          <p className="text-gray-600 mb-4">There was an error loading the opportunity data.</p>
          <p className="text-sm text-gray-500 mb-4">Error: {error.message || 'Unknown error'}</p>
          <button
            onClick={() => navigate('/module/opportunities')}
            className="px-4 py-2 bg-indigo-950 text-white rounded-lg hover:bg-indigo-800"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Opportunity Not Found</h2>
          <p className="text-gray-600 mb-4">The opportunity you're looking for doesn't exist or has been removed.</p>
          <p className="text-sm text-gray-500 mb-4">ID: {opportunityId}</p>
          <button
            onClick={() => navigate('/module/opportunities')}
            className="px-4 py-2 bg-indigo-950 text-white rounded-lg hover:bg-indigo-800"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  const formattedOpportunity = {
    id: opportunity.id,
    projectName: opportunity.project_name,
    category: opportunity.market_sector || 'General',
    stage: opportunity.stage,
    aiMatch: opportunity.match_score || 0,
    projectValue: opportunity.project_value || 0,
    winProbability: 75,
    expectedRfp: opportunity.expected_rfp_date ? new Date(opportunity.expected_rfp_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'TBD',
    location: 'Austin, TX', // This would need to be added to the API
    type: opportunity.market_sector || 'General',
    description: opportunity.description || 'No description available.',
    scope: [
      'Transit corridor feasibility analysis',
      'Station location planning and design',
      'Community engagement and public outreach',
      'Environmental impact assessment',
      'Multi-modal connectivity planning',
      'Financial analysis and funding strategies'
    ]
  };

  const documents: Document[] = [
    {
      id: '1',
      name: 'Primary Contact',
      category: 'Documents & Reports',
      purpose: 'Project Reference',
      type: 'Pdf'
    },
    {
      id: '2',
      name: 'Secondary Contact',
      category: 'Documents & Reports',
      purpose: 'Project Reference',
      type: 'Pdf'
    }
  ];

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview & Scope' },
    { id: 'client' as TabType, label: 'Client & Stakeholder' },
    { id: 'competition' as TabType, label: 'Competition & Strategy' },
    { id: 'delivery' as TabType, label: 'Delivery Model' },
    { id: 'team' as TabType, label: 'Team & References' },
    { id: 'financial' as TabType, label: 'Financial Summary' },
    { id: 'legal' as TabType, label: 'Legal & Risks' }
  ];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(value / 1000000) + ' M';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-[#212140] w-full h-12 flex items-center px-8">
        <div className="mx-auto max-w-[1392px] w-full flex items-center gap-4 mt-10">
          <button 
            onClick={() => navigate('/module/opportunities')}
            className="w-8 h-8 bg-[#212140] border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-white text-sm font-medium">Pipeline management (Overview & Scope)</span>
        </div>
      </div>

      
      <div className="bg-[#212140]">
        <div className="mx-auto max-w-[1392px] px-8 py-10 flex items-end justify-between gap-6">
          <div className="flex-1 flex flex-col gap-5">
            <h2 className="text-3xl font-bold text-white leading-tight">
              {formattedOpportunity.projectName}
            </h2>
            <div className="flex items-center gap-4 text-white text-lg">
              <span className="text-white font-medium">{opportunity.custom_id || `OPP-${opportunity.id?.slice(-6).toUpperCase() || 'UNKNOWN'}`}</span>
              <span className="w-px h-6 bg-white/40 rounded" />
              <span className="text-white font-medium">{formattedOpportunity.category}</span>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <span className="px-4 py-2 bg-[#212140] border border-white/20 text-white text-sm font-medium rounded-lg">
                proposal
              </span>
              <span className="px-4 py-2 bg-[#212140] border border-white/20 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI Match : {formattedOpportunity.aiMatch}%
              </span>
            </div>
          </div>
          
          <div className="text-right pb-1">
            <div className="text-4xl font-bold text-[#66BB6A] leading-tight">
              {formatCurrency(formattedOpportunity.projectValue)}
            </div>
            <div className="text-white text-lg font-medium">Project Value</div>
            <div className="text-white text-xl font-medium mt-2">
              {formattedOpportunity.winProbability}% Win Probability
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-[#F3F4F6] border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="mx-auto max-w-[1392px]">
            <div className="w-full h-11 p-0.5 bg-[#F3F4F6] rounded-lg border border-gray-200 inline-flex justify-start items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 self-stretch px-4 py-2.5 rounded-md text-sm font-medium inline-flex justify-center items-center gap-2.5 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#212140] text-white shadow-sm'
                      : 'text-[#667085] hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      
      <div className="px-8 py-8">
        {activeTab === 'overview' && (
          <div className="mx-auto max-w-[1392px]">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-8">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-6">
                  
                  <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-gray-200">
                    <div className="text-sm text-[#667085] mb-3">Project Value</div>
                    <div className="text-[#66BB6A] text-2xl font-bold">{formatCurrency(formattedOpportunity.projectValue)}</div>
                  </div>
                  
                  <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-gray-200">
                    <div className="text-sm text-[#667085] mb-3">Win Probability</div>
                    <div className="text-[#0F172A] text-2xl font-bold">{formattedOpportunity.winProbability}%</div>
                  </div>
                  
                  <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-gray-200">
                    <div className="text-sm text-[#667085] mb-3">Expected RFP</div>
                    <div className="text-[#0F172A] text-2xl font-bold">{formattedOpportunity.expectedRfp}</div>
                  </div>
                  
                  <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-gray-200">
                    <div className="text-sm text-[#667085] mb-3">AI Match Score</div>
                    <div className="text-[#0F172A] text-2xl font-bold">{formattedOpportunity.aiMatch}%</div>
                  </div>
                  
                  <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-gray-200">
                    <div className="text-sm text-[#667085] mb-3">Current Stage</div>
                    <div className="text-[#0F172A] text-2xl font-bold">proposal</div>
                  </div>
                  
                  <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-gray-200">
                    <div className="text-sm text-[#667085] mb-3">Total Opportunities</div>
                    <div className="flex items-end gap-2">
                      <div className="text-[#0F172A] text-2xl font-bold">0</div>
                      <div className="text-sm text-[#667085]">for proposals</div>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="space-y-8">
                
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="flex flex-col gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-[#0F172A]">Project Description</h3>
                    <div className="h-px w-full bg-black/10" />
                  </div>
                  <div className="text-[#374151] text-base leading-relaxed mb-6">
                    {formattedOpportunity.description}
                  </div>
                  <div className="h-px w-full bg-black/10 mb-5" />
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#6B7280]" />
                      <span className="font-medium text-[#374151]">{formattedOpportunity.location}</span>
                    </div>
                    <div className="w-px h-4 bg-[#D9D9D9]" />
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-[#6B7280]" />
                      <span className="font-medium text-[#374151]">{formattedOpportunity.type}</span>
                    </div>
                  </div>
                </div>

                
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="flex flex-col gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-[#0F172A]">Project Scope</h3>
                    <div className="h-px w-full bg-black/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-5">
                      {formattedOpportunity.scope.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="w-1.5 h-1.5 bg-[#212140] rounded-full mt-2 flex-shrink-0" />
                          <div className="text-[#374151] text-sm leading-relaxed">{item}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-5">
                      {formattedOpportunity.scope.slice(3).map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="w-1.5 h-1.5 bg-[#212140] rounded-full mt-2 flex-shrink-0" />
                          <div className="text-[#374151] text-sm leading-relaxed">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-[#0F172A]">Client Contact</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#212140] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a35] transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Documents
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-medium text-[#667085]">Document Name</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[#667085]">Document Category</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[#667085]">Document Purpose</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[#667085]">Document Type</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-[#667085]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-gray-100">
                        <td className="py-5 px-6 text-sm text-[#0F172A] font-medium">{doc.name}</td>
                        <td className="py-5 px-6 text-sm text-[#667085]">{doc.category}</td>
                        <td className="py-5 px-6 text-sm text-[#667085]">{doc.purpose}</td>
                        <td className="py-5 px-6 text-sm text-[#667085]">{doc.type}</td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-[#212140] text-white text-xs font-medium rounded-lg hover:bg-[#1a1a35] transition-colors">
                              View Document
                            </button>
                            <button className="px-4 py-2 bg-white border border-[#212140] text-[#212140] text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                              Remove Document
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-8">
                Document Organization & Proposal Integration
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-[#212140] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-[#374151] text-sm leading-relaxed">
                    All uploaded files are automatically organized by category and purpose
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-[#212140] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-[#374151] text-sm leading-relaxed">
                    Documents marked as "Available for Proposals" can be selected in the proposal module
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-[#212140] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-[#374151] text-sm leading-relaxed">
                    Images and plans will be available for visual elements in your proposals
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-[#212140] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-[#374151] text-sm leading-relaxed">
                    Reference documents can be cited and linked in proposal content
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {tabs.find(t => t.id === activeTab)?.label} Content
            </h3>
            <p className="text-gray-600">
              This section will be implemented based on the Figma design.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PipelineOverviewPage);