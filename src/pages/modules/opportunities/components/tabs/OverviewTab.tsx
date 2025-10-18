import { memo, useState } from 'react';
import { MapPin, Building, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, AddButton } from './shared';
import { TabProps } from './types';
import { useOpportunityOverview, useUpdateOpportunityOverview } from '@/hooks/useOpportunityTabs';
import { useOpportunityDocuments, useDeleteOpportunityDocument } from '@/hooks/useOpportunityDocuments';
import AddDocumentModal from '../modals/AddDocumentModal';
import { useToast } from '@/hooks/use-toast';

const OverviewTab = memo(({ opportunity }: TabProps) => {
  const { data: overviewData, isLoading: overviewLoading, refetch } = useOpportunityOverview(opportunity?.id || '');
  const updateOverviewMutation = useUpdateOpportunityOverview(opportunity?.id || '');
  const { data: documentsData, isLoading: documentsLoading } = useOpportunityDocuments(opportunity?.id || '');
  const deleteDocumentMutation = useDeleteOpportunityDocument(opportunity?.id || '');
  const { toast } = useToast();
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddDocument = () => {
    setIsAddDocumentModalOpen(true);
  };

  const handleDocumentAdded = () => {
    refetch(); // Refresh the overview data to show new documents
  };

  const handleViewDocument = (documentId: string, fileName: string) => {
    
    toast({
      title: "View Document",
      description: `Opening ${fileName}...`,
    });
  };

  const handleRemoveDocument = async (documentId: string, fileName: string) => {
    try {
      await deleteDocumentMutation.mutateAsync(documentId);
      toast({
        title: "Document Removed",
        description: `${fileName} has been removed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const truncateFileName = (fileName: string, maxWords: number = 2) => {
    const words = fileName.split(' ');
    if (words.length <= maxWords) {
      return fileName;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const project = {
    projectName: opportunity?.project_name,
    custom_id: opportunity?.custom_id,
    category: opportunity?.market_sector,
    description: overviewData?.project_description || opportunity?.description,
    location: opportunity?.state,
    client: opportunity?.client_name,
    startDate: opportunity?.expected_rfp_date,
    endDate: opportunity?.deadline,
    value: opportunity?.project_value,
    winProbability: 75,
    aiMatch: opportunity?.match_score,
    currentStage: opportunity?.stage,
    documents: overviewData?.documents_summary || {}
  };

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="text-lg font-semibold text-gray-900 mb-6">Key Metrics</div>
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="flex-1 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-4">Project Value</div>
                <div className="text-emerald-600 text-3xl font-medium">
                  {project.value ? formatCurrency(project.value) : 'N/A'}
                </div>
              </div>
              <div className="flex-1 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-4">Win Probability</div>
                <div className="text-amber-600 text-3xl font-medium">{project.winProbability}%</div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-1 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-4">Expected RFP</div>
                <div className="text-gray-900 text-3xl font-medium">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="flex-1 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-4">AI Match Score</div>
                <div className="text-emerald-600 text-3xl font-medium">
                  {project.aiMatch ? `${project.aiMatch}%` : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-1 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-4">Current Stage</div>
                <div className="text-gray-900 text-3xl font-medium">{project.currentStage || 'N/A'}</div>
              </div>
              <div className="flex-1 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-4">Documents Ready</div>
                <div className="flex items-end gap-3">
                  <div className="text-gray-900 text-3xl font-medium">{project.documents.length}</div>
                  <div className="text-sm text-gray-600">for proposals</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-3 mb-5">
              <div className="text-lg font-semibold text-gray-900">Project Description</div>
              <div className="h-px bg-black/10"></div>
            </div>
            <div className="text-lg font-medium text-gray-600 leading-relaxed mb-5">
              {project.description || 'No description available for this project.'}
            </div>
            <div className="h-px bg-black/10 mb-5"></div>
            <div className="inline-flex justify-start items-center gap-5">
              <div className="flex justify-start items-center gap-3">
                <MapPin className="w-6 h-6 text-black" />
                <div className="text-sm font-medium text-black">{project.location || 'N/A'}</div>
              </div>
              <div className="w-0.5 h-5 bg-gray-300"></div>
              <div className="flex justify-start items-center gap-3">
                <Building className="w-6 h-6 text-black" />
                <div className="text-sm font-medium text-black">{project.category || 'N/A'}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-3 mb-5">
              <div className="text-lg font-semibold text-gray-900">Project Scope</div>
              <div className="h-px bg-black/10"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {overviewData?.project_scope && overviewData.project_scope.length > 0 ? (
                overviewData.project_scope.map((scope: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 border-2 border-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-lg font-medium text-gray-600 leading-relaxed">{scope}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <div className="text-gray-500 text-lg">No project scope defined yet</div>
                  <div className="text-gray-400 text-sm mt-2">Add project scope items to get started</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900">Documents</div>
          <AddButton onClick={handleAddDocument}>Add Documents</AddButton>
        </div>
        
        {documentsData?.documents && documentsData.documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Document Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Document Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Document Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentsData.documents.map((doc, index: number) => (
                  <tr key={doc.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900" title={doc.original_name || doc.file_name || 'Unnamed Document'}>
                          {truncateFileName(doc.original_name || doc.file_name || 'Unnamed Document')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {doc.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {doc.purpose || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {doc.file_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleViewDocument(doc.id, doc.original_name || doc.file_name || 'Unnamed Document')}
                          className="h-8 px-3 bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-medium rounded-lg"
                        >
                          View Document
                        </Button>
                        <Button 
                          onClick={() => handleRemoveDocument(doc.id, doc.original_name || doc.file_name || 'Unnamed Document')}
                          disabled={deleteDocumentMutation.isPending}
                          className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg"
                        >
                          {deleteDocumentMutation.isPending ? 'Removing...' : 'Remove Document'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No documents uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">Upload documents to get started</p>
          </div>
        )}
        
        <div className="p-6 bg-white">
          <div className="p-6 bg-stone-50 rounded-2xl">
            <div className="text-lg font-semibold text-gray-900 mb-5">Document Organization & Proposal Integration</div>
            <div className="h-px bg-black/10 mb-5"></div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 border-2 border-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">
                  All uploaded files are automatically organized by category and purpose
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 border-2 border-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">
                  Documents marked as 'Available for Proposals' can be selected in the proposal module
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 border-2 border-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">
                  Images and plans will be available for visual elements in your proposals
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 border-2 border-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">
                  Reference documents can be cited and linked in proposal content
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AddDocumentModal
        isOpen={isAddDocumentModalOpen}
        onClose={() => setIsAddDocumentModalOpen(false)}
        opportunityId={opportunity?.id || ''}
        onDocumentAdded={handleDocumentAdded}
      />
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;