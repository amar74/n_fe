// @author piyush.7492
import { memo, useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Plus, Scan, AlertCircle, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { 
  AIAnalysisProgressCard,
  OpportunityOverviewCard,
  AnalysisTabsCard,
  KeyAnalysisSummaryCard,
  OpportunitiesAnalyticsChart
} from './components';
import { useOpportunitiesAnalysis } from '@/hooks/opportunities';
import { opportunitiesApi } from '../../../services/api/opportunitiesApi';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

function AIAnalysisPage() {
  const { analytics, pipeline, opportunities, isLoading, isError, error } = useOpportunitiesAnalysis();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentOpportunityIndex, setCurrentOpportunityIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Data Collection & Validation');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentOpportunity = opportunities[currentOpportunityIndex] || opportunities[0];
  const opportunityId = searchParams.get('opportunityId') || currentOpportunity?.id;

  useEffect(() => {
    if (opportunityId && opportunities.length > 0) {
      const index = opportunities.findIndex(opp => opp.id === opportunityId);
      if (index !== -1) {
        setCurrentOpportunityIndex(index);
        setAnalysisProgress(0);
        setCurrentStep('Data Collection & Validation');
      }
    }
  }, [opportunityId, opportunities]);

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (oppId: string) => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setCurrentStep('Data Collection & Validation');
      
      // Simulate progress updates
      const progressSteps = [
        { progress: 16, step: 'Data Collection & Validation' },
        { progress: 33, step: 'Market Research & Trends' },
        { progress: 50, step: 'Competitor Analysis' },
        { progress: 66, step: 'Financial Viability Assessment' },
        { progress: 83, step: 'Risk & Opportunity Mapping' },
        { progress: 100, step: 'Strategic Recommendations' },
      ];
      
      let currentStepIndex = 0;
      const progressInterval = setInterval(() => {
        if (currentStepIndex < progressSteps.length) {
          const { progress, step } = progressSteps[currentStepIndex];
          setAnalysisProgress(progress);
          setCurrentStep(step);
          currentStepIndex++;
        } else {
          clearInterval(progressInterval);
        }
      }, 2000);
      
      try {
        const result = await opportunitiesApi.performComprehensiveAIAnalysis(oppId);
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setCurrentStep('Analysis Complete');
        setAiAnalysis(result);
        setIsAnalyzing(false);
        toast.success('AI Analysis completed successfully!');
        return result;
      } catch (error: any) {
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        toast.error(error?.response?.data?.detail || 'Failed to perform AI analysis');
        throw error;
      }
    },
  });

  // Trigger analysis when opportunity changes
  useEffect(() => {
    if (opportunityId && currentOpportunity && !isAnalyzing && !aiAnalysis) {
      // Auto-trigger analysis on page load if no analysis exists
      aiAnalysisMutation.mutate(opportunityId);
    }
  }, [opportunityId, currentOpportunity?.id]);

  const handleRunAnalysis = useCallback(() => {
    if (opportunityId) {
      setAiAnalysis(null);
      aiAnalysisMutation.mutate(opportunityId);
    }
  }, [opportunityId, aiAnalysisMutation]);

  const goToNextOpportunity = () => {
    if (currentOpportunityIndex < opportunities.length - 1) {
      setCurrentOpportunityIndex(currentOpportunityIndex + 1);
      setAnalysisProgress(0);
      setCurrentStep('Data Collection & Validation');
    }
  };

  const goToPreviousOpportunity = () => {
    if (currentOpportunityIndex > 0) {
      setCurrentOpportunityIndex(currentOpportunityIndex - 1);
      setAnalysisProgress(0);
      setCurrentStep('Data Collection & Validation');
    }
  };

  const opportunityData = currentOpportunity ? {
    projectName: currentOpportunity.project_name,
    projectValue: currentOpportunity.project_value 
      ? `$${(currentOpportunity.project_value / 1000000).toFixed(1)}M`
      : 'TBD',
    description: currentOpportunity.description || 'No description available',
    state: currentOpportunity.state || 'Not specified',
    marketSector: currentOpportunity.market_sector || 'Not specified',
    deadline: currentOpportunity.deadline 
      ? new Date(currentOpportunity.deadline).toLocaleDateString()
      : 'TBD',
    source: 'Internal System',
    matchScore: currentOpportunity.match_score || 0,
    analysisProgress: analysisProgress,
    isAnalyzing: analysisProgress < 100,
  } : {
    projectName: 'No opportunities available',
    projectValue: '$0',
    description: 'Create your first opportunity to see analysis',
    state: 'N/A',
    marketSector: 'N/A',
    deadline: 'N/A',
    source: 'N/A',
    matchScore: 0,
    analysisProgress: 0,
    isAnalyzing: false,
  };

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] font-['Inter']">
      <div className="flex flex-col w-full">
        
        <div className="px-8 pt-8 pb-6 bg-white flex justify-between items-end">
          
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center gap-2">
              <Link 
                to="/" 
                className="text-[#9CA3AF] text-sm font-medium font-['Inter'] hover:text-[#111827] transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              <Link 
                to="/module/opportunities" 
                className="text-[#9CA3AF] text-sm font-medium font-['Inter'] hover:text-[#111827] transition-colors"
              >
                Opportunity
              </Link>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              <span className="text-[#111827] text-sm font-medium font-['Inter']">
                AI Analysis
              </span>
              {currentOpportunity && (
                <>
                  <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[#6B7280] text-sm font-medium font-['Inter']">
                    {currentOpportunity.project_name}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-[#111827] text-[28px] font-bold font-['Inter'] tracking-tight">
              AI Opportunity Analysis
            </h1>
            <p className="text-[#6B7280] text-lg font-['Inter']">
              Comprehensive AI-powered analysis and insights for your opportunities
            </p>

            {opportunities.length > 1 && (
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousOpportunity}
                    disabled={currentOpportunityIndex === 0}
                    className="p-2 rounded-lg border border-[#D1D5DB] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#374151]" />
                  </button>
                  <span className="text-sm font-medium text-[#374151]">
                    {currentOpportunityIndex + 1} of {opportunities.length}
                  </span>
                  <button
                    onClick={goToNextOpportunity}
                    disabled={currentOpportunityIndex === opportunities.length - 1}
                    className="p-2 rounded-lg border border-[#D1D5DB] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-[#374151]" />
                  </button>
                </div>
                <div className="text-sm text-[#6B7280]">
                  Currently analyzing: <span className="font-semibold text-[#111827]">
                    {currentOpportunity?.project_name || 'No opportunity selected'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {opportunityId && (
              <button 
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || aiAnalysisMutation.isPending}
                className="h-10 px-4 py-2.5 bg-[#161950] rounded-lg flex items-center gap-2 hover:bg-[#0f1440] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing || aiAnalysisMutation.isPending ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-white stroke-[2] animate-spin" />
                    <span className="text-white text-sm font-semibold font-['Inter']">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5 text-white stroke-[2]" />
                    <span className="text-white text-sm font-semibold font-['Inter']">Run AI Analysis</span>
                  </>
                )}
              </button>
            )}
            
            <Link
              to="/module/opportunities?tab=source"
              className="h-10 px-4 py-2.5 bg-white rounded-lg border border-[#D1D5DB] flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Plus className="w-5 h-5 text-[#374151] stroke-[2]" />
              <span className="text-[#374151] text-sm font-semibold font-['Inter']">Create Opportunity</span>
            </Link>
          </div>
        </div>

        <div className="mx-8 my-6 flex flex-col gap-8">
          
          {isLoading && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-12 flex items-center justify-center">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950]"></div>
                <span className="text-[#374151] text-lg font-medium">Loading AI analysis data...</span>
              </div>
            </div>
          )}

          {isError && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold text-lg">Load failed data</h3>
                  <p className="text-red-600 text-sm mt-1">
                    {error?.message || 'An unexpected error occurred while loading opportunities data.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="space-y-8">
              
              {opportunities.length === 0 && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-8 text-center">
                  <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-[#6B7280]" />
                  </div>
                  <h3 className="text-[#111827] text-xl font-bold mb-2">No Opportunities Available</h3>
                  <p className="text-[#6B7280] text-base mb-6">
                    Create your first opportunity to start AI analysis
                  </p>
                  <Link
                    to="/module/opportunities?tab=source"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#161950] text-white rounded-xl font-semibold hover:bg-[#0f1440] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Opportunity
                  </Link>
                </div>
              )}

              {opportunities.length > 0 && opportunityId && !currentOpportunity && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-8 text-center">
                  <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-[#F59E0B]" />
                  </div>
                  <h3 className="text-[#111827] text-xl font-bold mb-2">Opportunity Not Found</h3>
                  <p className="text-[#6B7280] text-base mb-6">
                    The requested opportunity could not be found or may have been removed.
                  </p>
                  <Link
                    to="/module/opportunities?tab=source"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#161950] text-white rounded-xl font-semibold hover:bg-[#0f1440] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Back to Opportunities
                  </Link>
                </div>
              )}

              {opportunities.length > 0 && currentOpportunity && (
                <>
              
              <AIAnalysisProgressCard 
                progress={isAnalyzing || aiAnalysisMutation.isPending ? analysisProgress : (aiAnalysis ? 100 : 0)}
                isAnalyzing={isAnalyzing || aiAnalysisMutation.isPending}
                opportunityName={currentOpportunity?.project_name || 'Current Opportunity'}
                currentStep={currentStep}
                analysisSteps={[
                  'Data Collection & Validation',
                  'Market Research & Trends',
                  'Competitor Analysis',
                  'Financial Viability Assessment',
                  'Risk & Opportunity Mapping',
                  'Strategic Recommendations'
                ]}
              />
              
              {aiAnalysis && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">AI Analysis Results</h3>
                  {aiAnalysis.summary && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Win Probability:</span>
                          <span className="ml-2 font-bold">{aiAnalysis.summary.win_probability || 'N/A'}%</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Go/No-Go:</span>
                          <span className="ml-2 font-bold">{aiAnalysis.summary.go_no_go || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Strategic Value:</span>
                          <span className="ml-2 font-bold">{aiAnalysis.summary.strategic_value || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Fit Score:</span>
                          <span className="ml-2 font-bold">{aiAnalysis.summary.fit_score || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {aiAnalysis.competition_analysis && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Competition Analysis</h4>
                      <p className="text-sm text-gray-600 mb-2">{aiAnalysis.competition_analysis.market_landscape || 'N/A'}</p>
                      {aiAnalysis.competition_analysis.competitors && (
                        <div className="text-sm">
                          <span className="font-medium">Competitors identified: </span>
                          {aiAnalysis.competition_analysis.competitors.length}
                        </div>
                      )}
                    </div>
                  )}
                  {aiAnalysis.technical_analysis && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Technical Fit</h4>
                      <div className="text-sm">
                        <div className="mb-2">
                          <span className="font-medium">Fit Score: </span>
                          {aiAnalysis.technical_analysis.fit_score || 'N/A'}%
                        </div>
                        {aiAnalysis.technical_analysis.skill_match_percentage !== undefined && (
                          <div>
                            <span className="font-medium">Skill Match: </span>
                            {aiAnalysis.technical_analysis.skill_match_percentage}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {aiAnalysis.financial_analysis && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Financial Viability</h4>
                      <div className="text-sm grid grid-cols-2 gap-4">
                        {aiAnalysis.financial_analysis.projected_revenue && (
                          <div>
                            <span className="font-medium">Projected Revenue: </span>
                            ${aiAnalysis.financial_analysis.projected_revenue.toLocaleString()}
                          </div>
                        )}
                        {aiAnalysis.financial_analysis.profit_margin_percentage !== undefined && (
                          <div>
                            <span className="font-medium">Profit Margin: </span>
                            {aiAnalysis.financial_analysis.profit_margin_percentage}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {aiAnalysis.strategic_recommendations && (
                    <div>
                      <h4 className="font-semibold mb-2">Strategic Recommendations</h4>
                      <div className="text-sm">
                        <div className="mb-2">
                          <span className="font-medium">Decision: </span>
                          {aiAnalysis.strategic_recommendations.go_no_go_decision || 'N/A'}
                        </div>
                        {aiAnalysis.strategic_recommendations.decision_confidence !== undefined && (
                          <div className="mb-2">
                            <span className="font-medium">Confidence: </span>
                            {aiAnalysis.strategic_recommendations.decision_confidence}%
                          </div>
                        )}
                        {aiAnalysis.strategic_recommendations.recommended_strategies && (
                          <div className="mt-2">
                            <span className="font-medium">Key Strategies:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {aiAnalysis.strategic_recommendations.recommended_strategies.slice(0, 3).map((strategy: any, idx: number) => (
                                <li key={idx}>{strategy.strategy || strategy}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
                <OpportunityOverviewCard data={opportunityData} />
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
                <AnalysisTabsCard 
                  analytics={analytics}
                  pipeline={pipeline}
                  opportunities={opportunities}
                />
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
                <KeyAnalysisSummaryCard 
                  analytics={analytics}
                  pipeline={pipeline}
                />
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
                <OpportunitiesAnalyticsChart 
                  analytics={analytics}
                  pipeline={pipeline}
                />
              </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AIAnalysisPage);
