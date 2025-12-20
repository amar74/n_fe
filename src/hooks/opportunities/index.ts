/**
 * Opportunities Module Hooks
 * 
 * All hooks related to opportunities, documents, ingestion, tabs, and analysis.
 */

export { 
  useOpportunities,
  useOpportunity,
  useCreateOpportunity,
  useUpdateOpportunity,
  useDeleteOpportunity,
  useUpdateOpportunityStage,
  useOpportunityPipeline,
  useOpportunityAnalytics,
  useOpportunityInsights,
  useOpportunityForecast,
  useOpportunitySearch
} from './useOpportunities';
export { 
  useOpportunityDocuments,
  useOpportunityDocument,
  useCreateOpportunityDocument,
  useUpdateOpportunityDocument,
  useDeleteOpportunityDocument,
  useUploadOpportunityDocument
} from './useOpportunityDocuments';
export { 
  useOpportunitySources,
  useMutateOpportunitySource,
  useOpportunityTemp,
  useMutateOpportunityTemp,
  useOpportunityAgents,
  useMutateOpportunityAgents,
  useOpportunityAgentRuns,
  useOpportunityIngestionKeys
} from './useOpportunityIngestion';
export {
  useOpportunityOverview,
  useUpdateOpportunityOverview,
  useOpportunityStakeholders,
  useCreateOpportunityStakeholder,
  useUpdateOpportunityStakeholder,
  useDeleteOpportunityStakeholder,
  useOpportunityDrivers,
  useCreateOpportunityDriver,
  useUpdateOpportunityDriver,
  useDeleteOpportunityDriver,
  useOpportunityCompetitors,
  useCreateOpportunityCompetitor,
  useUpdateOpportunityCompetitor,
  useDeleteOpportunityCompetitor,
  useOpportunityStrategies,
  useCreateOpportunityStrategy,
  useUpdateOpportunityStrategy,
  useDeleteOpportunityStrategy,
  useOpportunityDeliveryModel,
  useUpdateOpportunityDeliveryModel,
  useOpportunityTeamMembers,
  useCreateOpportunityTeamMember,
  useUpdateOpportunityTeamMember,
  useDeleteOpportunityTeamMember,
  useOpportunityReferences,
  useCreateOpportunityReference,
  useUpdateOpportunityReference,
  useDeleteOpportunityReference,
  useOpportunityFinancialSummary,
  useUpdateOpportunityFinancialSummary,
  useOpportunityRisks,
  useCreateOpportunityRisk,
  useUpdateOpportunityRisk,
  useDeleteOpportunityRisk,
  useOpportunityLegalChecklist,
  useCreateOpportunityLegalChecklistItem,
  useUpdateOpportunityLegalChecklistItem,
  useDeleteOpportunityLegalChecklistItem,
  useAllOpportunityTabData
} from './useOpportunityTabs';
export { useOpportunitiesAnalysis } from './useOpportunitiesAnalysis';
