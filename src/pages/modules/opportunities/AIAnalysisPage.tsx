// @author piyush.7492
import { memo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Plus, Scan, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { 
  AIAnalysisProgressCard,
  OpportunityOverviewCard,
  AnalysisTabsCard,
  KeyAnalysisSummaryCard,
  OpportunitiesAnalyticsChart
} from './components';
import { useOpportunitiesAnalysis } from '../../../hooks/useOpportunitiesAnalysis';

function AIAnalysisPage() {
  const { analytics, pipeline, opportunities, isLoading, isError, error } = useOpportunitiesAnalysis();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentOpportunityIndex, setCurrentOpportunityIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Data Collection & Validation');

  const currentOpportunity = opportunities[currentOpportunityIndex] || opportunities[0];
  const opportunityId = searchParams.get('opportunityId');

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

  useEffect(() => {
    if (!currentOpportunity) return;

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        const increment = Math.random() * 15 + 5; // Random increment between 5-20
        const newProgress = Math.min(100, prev + increment);
        
        // Update current step based on progress
        if (newProgress < 16) setCurrentStep('Data Collection & Validation');
        else if (newProgress < 33) setCurrentStep('Market Research & Trends');
        else if (newProgress < 50) setCurrentStep('Competitor Analysis');
        else if (newProgress < 66) setCurrentStep('Financial Viability Assessment');
        else if (newProgress < 83) setCurrentStep('Risk & Opportunity Mapping');
        else if (newProgress < 100) setCurrentStep('Strategic Recommendations');
        else setCurrentStep('Analysis Complete');
        
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentOpportunityIndex]);

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
            
            <button 
              className="h-10 px-4 py-2.5 bg-[#161950] rounded-lg flex items-center gap-2 hover:bg-[#0f1440] transition-all shadow-sm"
            >
              <Plus className="w-5 h-5 text-white stroke-[2]" />
              <span className="text-white text-sm font-semibold font-['Inter']">Create Opportunity</span>
            </button>
            
            
            <button 
              className="h-10 px-4 py-2.5 bg-white rounded-lg border border-[#D1D5DB] flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Scan className="w-5 h-5 text-[#374151] stroke-[2]" />
              <span className="text-[#374151] text-sm font-semibold font-['Inter']">AI Proactive Scan</span>
            </button>
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
                progress={opportunityData.analysisProgress}
                isAnalyzing={opportunityData.isAnalyzing}
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
