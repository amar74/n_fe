import { memo, useEffect, useMemo, useState, useCallback } from 'react';
import { MapPin, Building, FileText, Download, Pencil, Plus, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, AddButton } from './shared';
import { TabProps } from './types';
import { useOpportunityOverview, useUpdateOpportunityOverview } from '@/hooks/useOpportunityTabs';
import { useOpportunityDocuments, useDeleteOpportunityDocument } from '@/hooks/useOpportunityDocuments';
import AddDocumentModal from '../modals/AddDocumentModal';
import { useToast } from '@/hooks/use-toast';
import { opportunityDocumentsApi } from '@/services/api/opportunityDocumentsApi';
import type { OpportunityDocument } from '@/services/api/opportunityDocumentsApi';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { sanitizeBasicHtml } from '@/lib/sanitize-html';
import { Textarea } from '@/components/ui/textarea';
import { scraperApi } from '@/services/api/scraperApi';

const OverviewTab = memo(({ opportunity }: TabProps) => {
  const { data: overviewData, isLoading: overviewLoading, refetch } = useOpportunityOverview(opportunity?.id || '');
  const updateOverviewMutation = useUpdateOpportunityOverview(opportunity?.id || '');
  const {
    data: documentsData,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useOpportunityDocuments(opportunity?.id || '');
  const deleteDocumentMutation = useDeleteOpportunityDocument(opportunity?.id || '');
  const { toast } = useToast();

  const parseNumericValue = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '');
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const formatCurrency = (value: unknown) => {
    const parsed = parseNumericValue(value);
    if (parsed === null) {
      return 'N/A';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parsed);
  };

  const keyMetrics = overviewData?.key_metrics ?? {};
  const documentsSummary = overviewData?.documents_summary ?? {};

  const projectValueDisplay = formatCurrency(keyMetrics.project_value ?? opportunity?.project_value);
  const winProbabilityValue = parseNumericValue(keyMetrics.win_probability ?? (keyMetrics.winProbability as unknown));
  const winProbabilityDisplay = winProbabilityValue !== null ? `${winProbabilityValue}%` : 'N/A';
  const aiMatchValue = parseNumericValue(keyMetrics.ai_match_score ?? opportunity?.match_score);
  const aiMatchDisplay = aiMatchValue !== null ? `${aiMatchValue}%` : 'N/A';
  const expectedRfpDate = keyMetrics.expected_rfp_date ?? opportunity?.expected_rfp_date ?? null;
  const expectedRfpDisplay = expectedRfpDate ? new Date(expectedRfpDate).toLocaleDateString() : 'N/A';
  const currentStage = keyMetrics.current_stage ?? opportunity?.stage ?? 'N/A';

  const metricsChartData = useMemo(() => {
    const entries: Array<{ label: string; value: number; fill: string }> = [];
    const projectValueNumeric = parseNumericValue(keyMetrics.project_value ?? opportunity?.project_value);
    if (projectValueNumeric !== null) {
      entries.push({ label: 'Project Value', value: projectValueNumeric, fill: '#6366f1' });
    }
    if (winProbabilityValue !== null) {
      entries.push({ label: 'Win Probability', value: Math.min(Math.max(winProbabilityValue, 0), 100), fill: '#f59e0b' });
    }
    if (aiMatchValue !== null) {
      entries.push({ label: 'AI Match', value: Math.min(Math.max(aiMatchValue, 0), 100), fill: '#10b981' });
    }
    return entries;
  }, [aiMatchValue, keyMetrics.project_value, opportunity?.project_value, winProbabilityValue]);

  const chartYAxisDomain = useMemo(() => {
    const hasProjectValueBar = metricsChartData.some((item) => item.label === 'Project Value');
    if (!hasProjectValueBar) {
      return [0, 100];
    }
    const maxValue = Math.max(...metricsChartData.map((item) => item.value));
    return [0, maxValue * 1.1];
  }, [metricsChartData]);

  const totalUploadedDocuments = typeof documentsSummary.total_uploaded === 'number'
    ? documentsSummary.total_uploaded
    : documentsData?.documents?.length ?? 0;

  const proposalReadyDocuments = typeof documentsSummary.available_for_proposal === 'number'
    ? documentsSummary.available_for_proposal
    : null;

  const projectDescriptionRaw = useMemo(() => {
    return overviewData?.project_description ?? opportunity?.description ?? '';
  }, [overviewData?.project_description, opportunity?.description]);

  const projectLocation = keyMetrics.location ?? opportunity?.state ?? 'N/A';
  const projectSector = keyMetrics.market_sector ?? opportunity?.market_sector ?? 'N/A';
  const scopeItems = useMemo(
    () =>
      (overviewData?.project_scope ?? [])
        .filter((item): item is string => Boolean(item && item.trim()))
        .map((item) => item.trim()),
    [overviewData?.project_scope],
  );
  const hasProjectDescription = Boolean(projectDescriptionRaw && projectDescriptionRaw.trim());
  const sanitizedProjectDescription = useMemo(
    () => (hasProjectDescription ? sanitizeBasicHtml(projectDescriptionRaw) : ''),
    [hasProjectDescription, projectDescriptionRaw],
  );
  const summarySourceUrl =
    Array.isArray(documentsSummary?.sources) && documentsSummary.sources.length > 0
      ? documentsSummary.sources.find((item: any) => item?.url)?.url
      : undefined;
  const sourceUrl =
    (keyMetrics?.source_url as string | undefined) ??
    (keyMetrics?.sourceUrl as string | undefined) ??
    (keyMetrics?.detail_url as string | undefined) ??
    (keyMetrics?.detailUrl as string | undefined) ??
    (keyMetrics?.company_website as string | undefined) ??
    (keyMetrics?.companyWebsite as string | undefined) ??
    (summarySourceUrl as string | undefined);

  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<OpportunityDocument | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(projectDescriptionRaw);
  const [scopeDraft, setScopeDraft] = useState<string[]>(scopeItems);
  const [newScopeItem, setNewScopeItem] = useState('');
  const [isAISuggestingOverview, setIsAISuggestingOverview] = useState(false);

  useEffect(() => {
    setDescriptionDraft(projectDescriptionRaw);
    setScopeDraft(scopeItems);
  }, [projectDescriptionRaw, scopeItems]);

  const handleAddDocument = () => {
    setIsAddDocumentModalOpen(true);
  };

  const handleDocumentAdded = () => {
    refetch(); // Refresh the overview data to show new documents
    refetchDocuments();
  };

  const handleOpenDocument = async (doc: OpportunityDocument | null) => {
    if (!doc) return;
    const fileName = doc?.original_name || doc?.file_name || 'document';

    if (doc?.file_url) {
      window.open(doc.file_url, '_blank', 'noopener,noreferrer');
      toast({
        title: "Opening document",
        description: `Opening ${fileName}`,
      });
      return;
    }

    if (!doc?.id || !opportunity?.id) {
      toast({
        title: "Document unavailable",
        description: "We could not locate this document on the server.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await opportunityDocumentsApi.downloadDocument(opportunity.id, doc.id);
      const blob = new Blob(
        [response.data],
        { type: response.headers['content-type'] || doc?.file_type || 'application/octet-stream' }
      );
      const url = window.URL.createObjectURL(blob);

      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast({
        title: "Document ready",
        description: `Opening ${fileName}`,
      });

      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error: any) {
      console.error('Error downloading document', error);
      toast({
        title: "Download failed",
        description: error?.response?.data?.detail || 'Unable to open this document. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = (doc: OpportunityDocument) => {
    setSelectedDocument(doc);
    setIsDocumentModalOpen(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || Number.isNaN(bytes)) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
  };

  const formattedDocumentDates = useMemo(() => {
    if (!selectedDocument) {
      return {
        uploadedAt: null,
        updatedAt: null,
        uploadDate: null,
      };
    }
    return {
      uploadedAt: selectedDocument.uploaded_at ? new Date(selectedDocument.uploaded_at) : null,
      updatedAt: selectedDocument.updated_at ? new Date(selectedDocument.updated_at) : null,
      uploadDate: selectedDocument.upload_date ? new Date(selectedDocument.upload_date) : null,
    };
  }, [selectedDocument]);

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

  const openOverviewModal = () => {
    setDescriptionDraft(projectDescriptionRaw);
    setScopeDraft([...scopeItems]);
    setNewScopeItem('');
    setIsOverviewModalOpen(true);
  };

  const handleAddScopeDraft = () => {
    if (!newScopeItem.trim()) return;
    setScopeDraft((prev) => [...prev, newScopeItem.trim()]);
    setNewScopeItem('');
  };

  const handleRemoveScopeDraft = (index: number) => {
    setScopeDraft((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveOverview = async () => {
    const cleanedScope = scopeDraft.map((item) => item.trim()).filter(Boolean);
    const cleanedDescription = sanitizeBasicHtml(descriptionDraft || '');

    await updateOverviewMutation.mutateAsync({
      project_description: cleanedDescription,
      project_scope: cleanedScope,
    });
    await refetch();
    setIsOverviewModalOpen(false);
  };

  const handleOpenSourceLink = useCallback(() => {
    if (!sourceUrl) {
      toast({
        title: 'Source unavailable',
        description: 'No source link is stored for this opportunity.',
        variant: 'destructive',
      });
      return;
    }
    window.open(sourceUrl, '_blank', 'noopener,noreferrer');
  }, [sourceUrl, toast]);

  const handleOverviewAISuggestion = useCallback(async () => {
    if (!sourceUrl) {
      toast({
        title: 'Source unavailable',
        description: 'No source link is stored for this opportunity.',
        variant: 'destructive',
      });
      return;
    }

    setIsAISuggestingOverview(true);
    try {
      const response = await scraperApi.scraper([sourceUrl]);
      const opportunities = response.results.flatMap((result) => result.opportunities ?? []);
      const candidate = opportunities[0];

      if (!candidate) {
        toast({
          title: 'No insights found',
          description: 'The AI scraper did not return any structured data for this link.',
          variant: 'destructive',
        });
        return;
      }

      const descriptionSections: string[] = [];
      const addSection = (value?: string | null) => {
        if (!value) return;
        const trimmed = value.trim();
        if (!trimmed) return;
        if (!descriptionSections.includes(trimmed)) {
          descriptionSections.push(trimmed);
        }
      };

      addSection(candidate.overview);
      addSection(candidate.description);
      if (candidate.scope_summary) {
        addSection(`Scope Summary: ${candidate.scope_summary}`);
      }
      if (candidate.scope_items && candidate.scope_items.length > 0) {
        addSection(`Scope Items:\n- ${candidate.scope_items.join('\n- ')}`);
      }

      if (descriptionSections.length) {
        setDescriptionDraft(descriptionSections.join('\n\n'));
      }

      if (candidate.scope_items && candidate.scope_items.length > 0) {
        const normalizedScope = candidate.scope_items
          .map((item) => (item ? item.trim() : ''))
          .filter(Boolean);
        if (normalizedScope.length) {
          setScopeDraft(normalizedScope);
        }
      }

      toast({
        title: 'AI suggestion applied',
        description: 'Project overview has been updated with the latest scraped data.',
      });
    } catch (error: any) {
      const message =
        error?.detail ||
        error?.message ||
        'Unable to fetch AI suggestions. Please try again later.';
      toast({
        title: 'AI suggestion failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsAISuggestingOverview(false);
    }
  }, [sourceUrl, toast]);

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
        <Card className="p-6 space-y-8">
          <div>
            <div className="text-lg font-semibold text-gray-900">Key Metrics</div>
            <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-600 mb-2">Project Value</div>
                <div className="text-emerald-600 text-2xl font-semibold">{projectValueDisplay}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-600 mb-2">Win Probability</div>
                <div className="text-amber-600 text-2xl font-semibold">{winProbabilityDisplay}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-600 mb-2">Expected RFP</div>
                <div className="text-gray-900 text-2xl font-semibold">{expectedRfpDisplay}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-600 mb-2">AI Match Score</div>
                <div className="text-emerald-600 text-2xl font-semibold">{aiMatchDisplay}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-600 mb-2">Current Stage</div>
                <div className="text-gray-900 text-2xl font-semibold capitalize">{currentStage}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-600 mb-2">Documents Ready</div>
                <div className="text-gray-900 text-2xl font-semibold">
                  {proposalReadyDocuments !== null ? proposalReadyDocuments : totalUploadedDocuments}
                </div>
                <div className="text-xs text-gray-500">
                  {proposalReadyDocuments !== null ? 'ready for proposals' : 'uploaded'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600">Analytics Snapshot</div>
                <div className="text-lg font-semibold text-gray-900">Probability & Match</div>
              </div>
              <div className="text-xs text-gray-400">Scale 0 - 100%</div>
            </div>
            {metricsChartData.length ? (
              <div className="w-full h-60">
                <ResponsiveContainer>
                  <BarChart data={metricsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#4b5563' }} />
                    <YAxis domain={chartYAxisDomain as any} tick={{ fontSize: 12, fill: '#4b5563' }} hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                      formatter={(value: number, _name: string, payload: any) => {
                        if (payload.payload.label === 'Project Value') {
                          return [formatCurrency(value), ''];
                        }
                        return [`${value.toFixed(1)}%`, ''];
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                      {metricsChartData.map((entry, index) => (
                        <Cell key={`cell-${entry.label}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-60 items-center justify-center text-sm text-gray-500">
                Probability analytics will appear once metrics are captured.
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-3 mb-5">
              <div className="text-lg font-semibold text-gray-900">Project Description</div>
              <div className="h-px bg-black/10"></div>
            </div>
            <div className="flex items-start justify-between gap-6 mb-5">
              <div className="flex-1 text-lg font-medium text-gray-600 leading-relaxed">
                {hasProjectDescription ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: sanitizedProjectDescription }}
                  />
                ) : (
                  <div className="text-gray-500">No description available for this project.</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {sourceUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenSourceLink}
                    className="gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Project source
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-indigo-600"
                  onClick={openOverviewModal}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!sourceUrl && (
              <p className="text-xs text-gray-400 -mt-3 mb-4">
                Add a source link during lead ingestion to auto-populate this description and enable AI suggestions.
              </p>
            )}
            <div className="h-px bg-black/10 mb-5"></div>
            <div className="inline-flex justify-start items-center gap-5">
              <div className="flex justify-start items-center gap-3">
                <MapPin className="w-6 h-6 text-black" />
                <div className="text-sm font-medium text-black">{projectLocation}</div>
              </div>
              <div className="w-0.5 h-5 bg-gray-300"></div>
              <div className="flex justify-start items-center gap-3">
                <Building className="w-6 h-6 text-black" />
                <div className="text-sm font-medium text-black">{projectSector}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-3 mb-5">
              <div className="text-lg font-semibold text-gray-900">Project Scope</div>
              <div className="h-px bg-black/10"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scopeItems.length > 0 ? (
                scopeItems.map((scope: string, index: number) => (
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
            <div className="mt-6 text-right">
              <Button variant="outline" onClick={openOverviewModal}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit project overview
              </Button>
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
                          onClick={() => handleViewDocument(doc)}
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

      <Dialog
        open={isOverviewModalOpen}
        onOpenChange={(open) => {
          setIsOverviewModalOpen(open);
          if (!open) {
            setDescriptionDraft(projectDescriptionRaw);
            setScopeDraft([...scopeItems]);
            setNewScopeItem('');
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit project overview</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {sourceUrl && (
              <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Project source</p>
                    <p className="text-sm text-gray-800 break-all">{sourceUrl}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenSourceLink}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(sourceUrl)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  This link was captured during ingestion. AI suggestions reuse this exact URL.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700" htmlFor="project-description">
                  Project description
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOverviewAISuggestion}
                  disabled={isAISuggestingOverview || !sourceUrl}
                  className="gap-1 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAISuggestingOverview ? 'Fetching…' : 'AI Suggestion'}
                </Button>
              </div>
              {!sourceUrl && (
                <p className="text-xs text-gray-400">
                  Add a source link during ingestion to enable AI-powered suggestions.
                </p>
              )}
              <RichTextEditor
                value={descriptionDraft}
                onChange={setDescriptionDraft}
                placeholder="Summarize the opportunity scope, objectives, and context"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Project scope</label>
              <div className="space-y-3">
                {scopeDraft.length > 0 ? (
                  scopeDraft.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-center gap-3">
                      <Input
                        value={item}
                        onChange={(event) => {
                          const updated = [...scopeDraft];
                          updated[index] = event.target.value;
                          setScopeDraft(updated);
                        }}
                        placeholder="Project scope item"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => handleRemoveScopeDraft(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500">
                    Add scope items to outline key delivery components.
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Input
                    value={newScopeItem}
                    onChange={(event) => setNewScopeItem(event.target.value)}
                    placeholder="New scope item"
                  />
                  <Button onClick={handleAddScopeDraft} disabled={!newScopeItem.trim()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOverviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveOverview}
              disabled={updateOverviewMutation.isPending}
            >
              {updateOverviewMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDocumentModalOpen}
        onOpenChange={(open) => {
          setIsDocumentModalOpen(open);
          if (!open) setSelectedDocument(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {selectedDocument?.original_name || selectedDocument?.file_name || 'Document Details'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Review metadata and open the document in a separate tab.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Category</div>
                <div className="font-medium text-gray-900">{selectedDocument?.category || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Purpose</div>
                <div className="font-medium text-gray-900">{selectedDocument?.purpose || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">File Type</div>
                <div className="font-medium text-gray-900">{selectedDocument?.file_type || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">File Size</div>
                <div className="font-medium text-gray-900">{formatFileSize(selectedDocument?.file_size)}</div>
              </div>
              <div>
                <div className="text-gray-500">Uploaded At</div>
                <div className="font-medium text-gray-900">
                  {formattedDocumentDates.uploadedAt?.toLocaleString() || '—'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Last Updated</div>
                <div className="font-medium text-gray-900">
                  {formattedDocumentDates.updatedAt?.toLocaleString() || '—'}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Description</div>
                <div className="font-medium text-gray-900">
                  {selectedDocument?.description || '—'}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDocumentModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handleOpenDocument(selectedDocument)} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Open in New Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;