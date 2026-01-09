import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  XCircle,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Zap,
} from 'lucide-react';
import type { Contract } from '@/services/api/contractsApi';
import { getClauseRiskColor } from './utils';

interface ContractAnalysis {
  clauseTitle: string;
  detectedText: string;
  riskLevel: 'green' | 'amber' | 'red';
  suggestedReplacement?: string;
  reasoning: string;
  location: string;
  category?: string;
}

interface AIAnalysisTabProps {
  selectedContract: Contract | null;
  contractAnalysis: ContractAnalysis[];
  contractAnalysisData?: any;
  onTabChange: (tab: string) => void;
  isLoadingAnalysis?: boolean;
  onTriggerAnalysis?: (contractId: string) => void;
  isAnalyzing?: boolean;
}

export function AIAnalysisTab({
  selectedContract,
  contractAnalysis,
  contractAnalysisData,
  onTabChange,
  isLoadingAnalysis = false,
  onTriggerAnalysis,
  isAnalyzing = false,
}: AIAnalysisTabProps) {
  if (!selectedContract) {
    return (
      <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-[#E5E7EB] text-center">
        <div className="p-4 bg-[#F9FAFB] rounded-full w-fit mx-auto mb-4">
          <Zap className="h-12 w-12 text-[#D0D5DD]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2 font-outfit">
          No Contract Selected
        </h3>
        <p className="text-[#667085] mb-4 font-outfit">
          Select a contract from the Contracts tab to view AI-powered analysis
        </p>
        <Button
          onClick={() => onTabChange('contracts')}
          className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit"
        >
          Browse Contracts
        </Button>
      </div>
    );
  }

  const executiveSummary = contractAnalysisData?.executive_summary;
  
  // Debug logging
  React.useEffect(() => {
    console.log('AIAnalysisTab - contractAnalysisData:', contractAnalysisData);
    console.log('AIAnalysisTab - contractAnalysis:', contractAnalysis);
    console.log('AIAnalysisTab - executiveSummary:', executiveSummary);
    console.log('AIAnalysisTab - selectedContract:', selectedContract);
  }, [contractAnalysisData, contractAnalysis, executiveSummary, selectedContract]);

  // Parse executive summary into structured sections
  const parseExecutiveSummary = (summary: string) => {
    if (!summary) return null;
    
    const sections: { [key: string]: string[] } = {
      contractOverview: [],
      keyFinancialTerms: [],
      criticalActionItems: [],
      aiRecommendation: [],
    };
    
    let currentSection = '';
    const lines = summary.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const lowerLine = trimmed.toLowerCase();
      
      // Check for section headers (more flexible matching)
      if (lowerLine.includes('contract overview')) {
        currentSection = 'contractOverview';
        continue;
      } else if (lowerLine.includes('key financial terms') || lowerLine.includes('financial terms')) {
        currentSection = 'keyFinancialTerms';
        continue;
      } else if (lowerLine.includes('critical action items') || lowerLine.includes('action items')) {
        currentSection = 'criticalActionItems';
        continue;
      } else if (lowerLine.includes('ai recommendation') || lowerLine.includes('recommendation')) {
        currentSection = 'aiRecommendation';
        continue;
      }
      
      // Process content based on current section
      if (currentSection) {
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          sections[currentSection].push(trimmed.substring(1).trim());
        } else if (currentSection === 'contractOverview' || currentSection === 'aiRecommendation') {
          // For text sections, accumulate lines
          if (sections[currentSection].length === 0) {
            sections[currentSection].push(trimmed);
          } else {
            sections[currentSection][sections[currentSection].length - 1] += ' ' + trimmed;
          }
        } else {
          sections[currentSection].push(trimmed);
        }
      } else {
        // If no section detected yet, treat as contract overview
        if (sections.contractOverview.length === 0) {
          sections.contractOverview.push(trimmed);
        } else {
          sections.contractOverview[sections.contractOverview.length - 1] += ' ' + trimmed;
        }
      }
    }
    
    // Return null if no content was parsed
    const hasContent = Object.values(sections).some(section => section.length > 0);
    return hasContent ? sections : null;
  };

  const summarySections = executiveSummary ? parseExecutiveSummary(executiveSummary) : null;

  return (
    <div className="space-y-6">
      {summarySections && (
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#161950]/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-[#161950]" />
            </div>
            <h3 className="text-[#1A1A1A] text-lg font-semibold font-outfit">AI Executive Summary</h3>
          </div>
          
          <div className="space-y-5">
            {summarySections.contractOverview.length > 0 && (
              <div>
                <h4 className="text-[#1A1A1A] font-semibold font-outfit mb-2">Contract Overview:</h4>
                <p className="text-[#667085] text-sm leading-relaxed font-outfit">
                  {summarySections.contractOverview.join(' ')}
                </p>
              </div>
            )}
            
            {summarySections.keyFinancialTerms.length > 0 && (
              <div>
                <h4 className="text-[#1A1A1A] font-semibold font-outfit mb-2">Key Financial Terms:</h4>
                <ul className="list-none space-y-1.5">
                  {summarySections.keyFinancialTerms.map((term, idx) => (
                    <li key={idx} className="text-[#667085] text-sm font-outfit flex items-start gap-2">
                      <span className="text-[#161950] mt-1.5">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {summarySections.criticalActionItems.length > 0 && (
              <div>
                <h4 className="text-[#1A1A1A] font-semibold font-outfit mb-2">Critical Action Items:</h4>
                <ul className="list-none space-y-1.5">
                  {summarySections.criticalActionItems.map((item, idx) => (
                    <li key={idx} className="text-[#667085] text-sm font-outfit flex items-start gap-2">
                      <span className="text-[#161950] mt-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {summarySections.aiRecommendation.length > 0 && (
              <div>
                <h4 className="text-[#1A1A1A] font-semibold font-outfit mb-2">AI Recommendation:</h4>
                <p className="text-[#667085] text-sm leading-relaxed font-outfit">
                  {summarySections.aiRecommendation.join(' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!summarySections && executiveSummary && (
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#161950]/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-[#161950]" />
            </div>
            <h3 className="text-[#1A1A1A] text-lg font-semibold font-outfit">AI Executive Summary</h3>
          </div>
          <div className="p-4 bg-[#F9FAFB] rounded-lg">
            <p className="text-[#667085] text-sm leading-relaxed font-outfit whitespace-pre-line">
              {executiveSummary}
            </p>
          </div>
        </div>
      )}
      
      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
                AI Analysis: {selectedContract.project_name || 'Contract'}
              </h2>
              <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                <Brain className="h-3 w-3 mr-1.5" />
                Contextual Risk Assessment
              </Badge>
            </div>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              Risk assessment benchmarked against firm's insurance policy and legal playbook
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="text-3xl font-bold text-[#D92D20] mb-2 font-outfit">
              {contractAnalysisData?.red_clauses ?? selectedContract.red_clauses ?? 0}
            </div>
            <p className="text-sm text-[#1A1A1A] font-medium font-outfit">High Risk Clauses</p>
            <p className="text-xs text-[#667085] font-outfit mt-1">Require immediate attention</p>
          </div>
          <div className="text-center p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="text-3xl font-bold text-[#DC6803] mb-2 font-outfit">
              {contractAnalysisData?.amber_clauses ?? selectedContract.amber_clauses ?? 0}
            </div>
            <p className="text-sm text-[#1A1A1A] font-medium font-outfit">Medium Risk Clauses</p>
            <p className="text-xs text-[#667085] font-outfit mt-1">Need review and consideration</p>
          </div>
          <div className="text-center p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="text-3xl font-bold text-[#039855] mb-2 font-outfit">
              {contractAnalysisData?.green_clauses ?? selectedContract.green_clauses ?? 0}
            </div>
            <p className="text-sm text-[#1A1A1A] font-medium font-outfit">Low Risk Clauses</p>
            <p className="text-xs text-[#667085] font-outfit mt-1">Acceptable as written</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
                Detailed Clause Analysis
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#D92D20] rounded-full"></div>
                  <span className="text-xs text-[#667085] font-outfit">Red</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#DC6803] rounded-full"></div>
                  <span className="text-xs text-[#667085] font-outfit">Amber</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#039855] rounded-full"></div>
                  <span className="text-xs text-[#667085] font-outfit">Green</span>
                </div>
              </div>
            </div>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              RAG (Red/Amber/Green) reporting system provides color-coded risk guidance for negotiations
            </p>
          </div>
        </div>
        {isLoadingAnalysis || isAnalyzing ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
              <p className="text-[#667085] font-outfit">
                {isAnalyzing ? 'Running AI analysis... This may take a moment.' : 'Loading AI analysis...'}
              </p>
            </div>
          </div>
        ) : contractAnalysis.length === 0 && !executiveSummary ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="p-4 bg-[#F9FAFB] rounded-full">
              <Brain className="w-12 h-12 text-[#D0D5DD]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">No Analysis Available</h3>
            <p className="text-[#667085] font-outfit text-center max-w-sm">
              This contract hasn't been analyzed yet. Click the button below to run AI analysis.
            </p>
            {onTriggerAnalysis && selectedContract?.id && (
              <Button
                onClick={() => onTriggerAnalysis(selectedContract.id)}
                disabled={isAnalyzing}
                className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit mt-4"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
            )}
          </div>
        ) : contractAnalysis.length > 0 ? (
          <div className="flex flex-col gap-4">
            {contractAnalysis.map((analysis, index) => (
            <div
              key={index}
              className={`p-5 border-2 rounded-2xl bg-white ${
                analysis.riskLevel === 'red'
                  ? 'border-[#D92D20] bg-[#FEF3F2]'
                  : analysis.riskLevel === 'amber'
                    ? 'border-[#DC6803] bg-[#FFFAEB]'
                    : 'border-[#039855] bg-[#ECFDF3]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {analysis.riskLevel === 'red' && (
                    <XCircle className="h-5 w-5 text-[#D92D20]" />
                  )}
                  {analysis.riskLevel === 'amber' && (
                    <AlertCircle className="h-5 w-5 text-[#DC6803]" />
                  )}
                  {analysis.riskLevel === 'green' && (
                    <CheckCircle className="h-5 w-5 text-[#039855]" />
                  )}
                  <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit">{analysis.clauseTitle}</h3>
                </div>
                <Badge className={`${getClauseRiskColor(analysis.riskLevel)} text-xs font-outfit`}>
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm text-[#667085] font-outfit">{analysis.location}</p>
                {analysis.category && (
                  <>
                    <span className="text-[#667085]">•</span>
                    <Badge variant="outline" className="text-xs font-outfit border-[#E5E7EB] text-[#667085]">
                      {analysis.category}
                    </Badge>
                  </>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-[#1A1A1A] font-outfit">Current Language:</h4>
                  <div className="bg-white p-3 rounded-lg border border-[#E5E7EB] text-sm italic text-[#667085] font-outfit">
                    "{analysis.detectedText}"
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-[#1A1A1A] font-outfit">AI Risk Assessment:</h4>
                  <p className="text-sm text-[#1A1A1A] font-outfit">{analysis.reasoning}</p>
                </div>
                {analysis.suggestedReplacement && (
                  <div>
                    <h4 className="font-medium mb-2 text-[#1A1A1A] font-outfit">Suggested Replacement:</h4>
                    <div className="bg-[#ECFDF3] p-3 rounded-lg border border-[#039855]/20 text-sm text-[#039855] font-outfit">
                      "{analysis.suggestedReplacement}"
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="h-9 px-4 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit">
                        Accept Suggestion
                      </Button>
                      <Button size="sm" variant="outline" className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] rounded-lg font-outfit">
                        Modify
                      </Button>
                      <Button size="sm" variant="outline" className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] rounded-lg font-outfit">
                        Add to Exceptions
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>
        ) : executiveSummary ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="p-4 bg-[#F9FAFB] rounded-full">
              <Brain className="w-8 h-8 text-[#D0D5DD]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit">Analysis in Progress</h3>
            <p className="text-[#667085] font-outfit text-center max-w-sm text-sm">
              Executive summary is available, but detailed clause analysis is still being processed.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

