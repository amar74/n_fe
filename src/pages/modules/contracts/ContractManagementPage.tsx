import { useState } from 'react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Target,
  FileCheck,
  Zap,
  BookOpen,
  Settings,
  Brain,
} from 'lucide-react';
import { useContracts, contractKeys } from '@/hooks/contracts';
import { useClauseLibrary } from '@/hooks/contracts/useClauseLibrary';
import { useToast } from '@/hooks/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Contract } from '@/services/api/contractsApi';
import type { ClauseLibraryItem } from '@/services/api/clauseLibraryApi';
import {
  DashboardTab,
  ContractsTab,
  AIAnalysisTab,
  ClauseLibraryTab,
  WorkflowTab,
} from './components';

interface ContractAnalysis {
  clauseTitle: string;
  detectedText: string;
  riskLevel: 'green' | 'amber' | 'red';
  suggestedReplacement?: string;
  reasoning: string;
  location: string;
  category?: string;
}

export default function ContractManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [clauseSearchQuery, setClauseSearchQuery] = useState('');
  const [editingClause, setEditingClause] = useState<ClauseLibraryItem | null>(null);

  const { useContractsList, useContractAnalysis, analyzeContractMutation } = useContracts();
  const {
    useClauseLibraryList,
    useCategories,
    createClauseMutation,
    updateClauseMutation,
    deleteClauseMutation,
  } = useClauseLibrary();

  const { data: contractsData, isLoading } = useContractsList({
    page: 1,
    size: 100,
    search: searchQuery || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    risk_level: filterRisk !== 'all' ? filterRisk : undefined,
  });

  const contracts = contractsData?.items || [];

  const { data: clauseLibraryData, isLoading: isLoadingClauses } = useClauseLibraryList({
    page: 1,
    size: 100,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: clauseSearchQuery || undefined,
  });

  const clauseLibrary = clauseLibraryData?.items || [];
  const { data: categories = [] } = useCategories();

  // Fetch contract analysis from API when a contract is selected
  const { data: contractAnalysisData, isLoading: isLoadingAnalysis, refetch: refetchAnalysis } = useContractAnalysis(
    selectedContract?.id,
    !!selectedContract?.id
  );

  // Transform API analysis data to match component interface
  // The API returns ContractAnalysisResponse with analysis array
  const contractAnalysis: ContractAnalysis[] = React.useMemo(() => {
    console.log('contractAnalysisData:', contractAnalysisData);
    if (!contractAnalysisData?.analysis) {
      console.log('No analysis data found in contractAnalysisData');
      return [];
    }
    const mapped = contractAnalysisData.analysis.map((item: any) => ({
      clauseTitle: item.clauseTitle || item.title || 'Untitled Clause',
      detectedText: item.detectedText || item.text || '',
      riskLevel: (item.riskLevel === 'red' ? 'red' : item.riskLevel === 'amber' ? 'amber' : 'green') as 'red' | 'amber' | 'green',
      suggestedReplacement: item.suggestedReplacement || item.replacement,
      reasoning: item.reasoning || '',
      location: item.location || '',
      category: item.category || '',
    }));
    console.log('Mapped contractAnalysis:', mapped);
    return mapped;
  }, [contractAnalysisData]);

  const activeContracts = contracts.filter(
    (c: any) => c.status !== 'archived' && c.status !== 'executed'
  ).length;
  const highRiskContracts = contracts.filter(
    (c: any) => c.risk_level === 'high' && c.status !== 'archived'
  ).length;
  const pendingReviewContracts = contracts.filter(
    (c: any) => c.status === 'awaiting-review' || c.status === 'in-legal-review'
  ).length;
  const executedContracts = contracts.filter((c: any) => c.status === 'executed').length;

  const handleEditClause = (clause: ClauseLibraryItem) => {
    setEditingClause(clause);
  };

  const handleCreateClause = async (data: {
    title: string;
    category: string;
    clause_text: string;
    acceptable_alternatives: string[];
    fallback_positions: string[];
    risk_level: 'preferred' | 'acceptable' | 'fallback';
  }) => {
    await createClauseMutation.mutateAsync(data);
  };

  const handleUpdateClause = async (
    id: string,
    data: {
      title: string;
      category: string;
      clause_text: string;
      acceptable_alternatives: string[];
      fallback_positions: string[];
      risk_level: 'preferred' | 'acceptable' | 'fallback';
    }
  ) => {
    await updateClauseMutation.mutateAsync({ id, data });
    setEditingClause(null);
  };

  const handleDeleteClause = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this clause?')) {
      await deleteClauseMutation.mutateAsync(id);
    }
  };

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Contract Management</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">
                Contract Management
              </h1>
              <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                <Brain className="h-3 w-3 mr-1.5" />
                AI-Powered
              </Badge>
            </div>
           
          </div>
          <div className="flex items-start gap-3">
            <Button
              onClick={() => navigate('/module/contracts/create')}
              className="h-11 px-5 py-2 bg-[#161950] hover:bg-[#1E2B5B] rounded-lg flex items-center gap-2.5 shadow-sm font-outfit"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium font-outfit leading-normal">Create New Contract</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-1.5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1 h-auto p-0 font-outfit">
              <TabsTrigger
                value="dashboard"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-outfit text-sm font-medium data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#667085] data-[state=inactive]:hover:text-[#1A1A1A] data-[state=inactive]:hover:bg-gray-50"
              >
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger
                value="contracts"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-outfit text-sm font-medium data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#667085] data-[state=inactive]:hover:text-[#1A1A1A] data-[state=inactive]:hover:bg-gray-50"
              >
                <FileCheck className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">Contracts</span>
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-outfit text-sm font-medium data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#667085] data-[state=inactive]:hover:text-[#1A1A1A] data-[state=inactive]:hover:bg-gray-50"
              >
                <Zap className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">AI Analysis</span>
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-outfit text-sm font-medium data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#667085] data-[state=inactive]:hover:text-[#1A1A1A] data-[state=inactive]:hover:bg-gray-50"
              >
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">Clause Library</span>
              </TabsTrigger>
              <TabsTrigger
                value="workflow"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-outfit text-sm font-medium data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#667085] data-[state=inactive]:hover:text-[#1A1A1A] data-[state=inactive]:hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">Workflow</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <DashboardTab
              contracts={contracts}
              isLoading={isLoading}
              activeContracts={activeContracts}
              highRiskContracts={highRiskContracts}
              pendingReviewContracts={pendingReviewContracts}
              executedContracts={executedContracts}
              onContractSelect={setSelectedContract}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6 mt-6">
            <ContractsTab
              contracts={contracts}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              filterRisk={filterRisk}
              onFilterRiskChange={setFilterRisk}
              onContractSelect={(contract) => {
                setSelectedContract(contract);
                setActiveTab('analysis');
              }}
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6 mt-6">
            <AIAnalysisTab
              selectedContract={selectedContract}
              contractAnalysis={contractAnalysis}
              contractAnalysisData={contractAnalysisData}
              onTabChange={setActiveTab}
              isLoadingAnalysis={isLoadingAnalysis}
              onTriggerAnalysis={async (contractId) => {
                try {
                  const result = await analyzeContractMutation.mutateAsync(contractId);
                  console.log('Analysis result:', result);
                  // Wait a moment for backend to save, then refetch
                  setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: [...contractKeys.detail(contractId), 'analysis'] });
                    queryClient.invalidateQueries({ queryKey: contractKeys.detail(contractId) });
                    refetchAnalysis();
                  }, 3000); // Increased delay to match mutation handler
                } catch (error) {
                  // Error is handled by the mutation
                  console.error('Analysis error:', error);
                }
              }}
              isAnalyzing={analyzeContractMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="library" className="space-y-6 mt-6">
            <ClauseLibraryTab
              clauseLibrary={clauseLibrary}
              isLoadingClauses={isLoadingClauses}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              clauseSearchQuery={clauseSearchQuery}
              onSearchChange={setClauseSearchQuery}
              onEditClause={handleEditClause}
              onDeleteClause={handleDeleteClause}
              onCreateClause={handleCreateClause}
              onUpdateClause={handleUpdateClause}
              editingClause={editingClause}
              isCreating={createClauseMutation.isPending}
              isUpdating={updateClauseMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6 mt-6">
            <WorkflowTab selectedContract={selectedContract} onTabChange={setActiveTab} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
