import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, MapPin, DollarSign, Calendar, Star, 
  Eye, ExternalLink, CheckCircle2, XCircle, Clock, 
  Loader2, Building2, Tag, FileText, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useOpportunityTemp, useMutateOpportunityTemp } from '@/hooks/useOpportunityIngestion';
import type { OpportunityTempResponse, TempStatus, OpportunityTempUpdate } from '@/types/opportunityIngestion';
import { formatCurrency } from '@/utils/opportunityUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CreateOpportunityModal, type OpportunityFormData } from '@/components/CreateOpportunityModal';

const statusConfig: Record<TempStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_review: { 
    label: 'Pending Review', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: <Clock className="w-3 h-3" />
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: <CheckCircle2 className="w-3 h-3" />
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: <XCircle className="w-3 h-3" />
  },
  promoted: { 
    label: 'Promoted', 
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: <CheckCircle2 className="w-3 h-3" />
  },
};

type PreviewDocument = {
  title?: string | null;
  url?: string | null;
  type?: string | null;
};

type PreviewContact = {
  name?: string | null;
  role?: string | null;
  organization?: string | null;
  email: string[];
  phone: string[];
};

type TempPreviewMeta = {
  summary?: string;
  description?: string;
  probability?: number | null;
  riskLevel?: string | null;
  expectedRfpDate?: string | null;
  deadline?: string | null;
  marketSector?: string | null;
  contacts: {
    emails: string[];
    phones: string[];
  };
  tags: string[];
  sourceUrl?: string | null;
  overview?: string | null;
  scopeSummary?: string | null;
  scopeItems: string[];
  documents: PreviewDocument[];
  enrichedContacts: PreviewContact[];
};

const extractLocationDetails = (opp: OpportunityTempResponse) => {
  const aiMetadata = (opp.ai_metadata ?? {}) as Record<string, any>;
  const rawPayload = (opp.raw_payload ?? {}) as Record<string, any>;
  const scrapedOpportunity = (aiMetadata.opportunity ?? rawPayload.opportunity ?? {}) as Record<string, any>;
  const candidate =
    scrapedOpportunity.location_details ??
    scrapedOpportunity.locationDetails ??
    (rawPayload.location_details as Record<string, any>) ??
    {};

  const parseFromText = (value?: string | null) => {
    if (!value) return { city: '', state: '' };
    const beforeDash = value.split(' - ')[0];
    const parts = beforeDash.split(',').map(part => part.trim()).filter(Boolean);
    if (parts.length === 0) return { city: '', state: '' };
    if (parts.length === 1) return { city: parts[0], state: '' };
    const state = parts.pop() ?? '';
    const city = parts.join(', ');
    return { city, state };
  };

  if (candidate.city || candidate.state) {
    return {
      city: candidate.city ?? '',
      state: candidate.state ?? '',
    };
  }

  return parseFromText(
    scrapedOpportunity.location ??
      rawPayload.location ??
      opp.location ??
      (aiMetadata.preview?.location as string | undefined)
  );
};

const formatLocationValue = (city?: string, state?: string) => {
  const parts = [city?.trim(), state?.trim()].filter(Boolean);
  return parts.join(', ');
};

const formatDateForInput = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
};

const getDisplayLocation = (opp: OpportunityTempResponse) => {
  const details = extractLocationDetails(opp);
  const formatted = formatLocationValue(details.city, details.state);
  return formatted || opp.location || null;
};

const extractPreviewMeta = (opp: OpportunityTempResponse): TempPreviewMeta => {
  const aiMetadata = (opp.ai_metadata ?? {}) as Record<string, any>;
  const preview = (aiMetadata.preview ?? {}) as Record<string, any>;
  const rawPayload = (opp.raw_payload ?? {}) as Record<string, any>;
  const scrapedOpportunity = (aiMetadata.opportunity ?? rawPayload.opportunity ?? {}) as Record<string, any>;

  const normalizedDocuments: PreviewDocument[] = Array.isArray(scrapedOpportunity.documents)
    ? scrapedOpportunity.documents.map((doc: any) => ({
        title: doc?.title ?? null,
        url: doc?.url ?? null,
        type: doc?.type ?? null,
      }))
    : [];

  const normalizedScopeItems = Array.isArray(scrapedOpportunity.scope_items)
    ? scrapedOpportunity.scope_items.filter((item: any) => typeof item === 'string' && item.trim().length > 0)
    : [];

  const normalizedContacts: PreviewContact[] = Array.isArray(scrapedOpportunity.contacts)
    ? scrapedOpportunity.contacts.map((contact: any) => ({
        name: contact?.name ?? null,
        role: contact?.role ?? null,
        organization: contact?.organization ?? null,
        email: Array.isArray(contact?.email)
          ? contact.email
          : contact?.email
            ? [String(contact.email)]
            : [],
        phone: Array.isArray(contact?.phone)
          ? contact.phone
          : contact?.phone
            ? [String(contact.phone)]
            : [],
      }))
    : [];

  return {
    summary: opp.ai_summary ?? preview.summary ?? preview.description ?? rawPayload.summary,
    description:
      preview.description ??
      rawPayload.description ??
      (Array.isArray(rawPayload.descriptionSections)
        ? rawPayload.descriptionSections.join('\n\n')
        : undefined),
    probability:
      preview.probability ??
      (typeof opp.match_score === 'number' ? opp.match_score : null) ??
      (typeof rawPayload.match_score === 'number' ? rawPayload.match_score : null),
    riskLevel:
      preview.riskLevel ??
      rawPayload.risk_level ??
      (typeof opp.risk_score === 'number'
        ? opp.risk_score >= 70
          ? 'High'
          : opp.risk_score >= 40
            ? 'Medium'
            : 'Low'
        : null),
    expectedRfpDate: preview.expectedRfpDate ?? rawPayload.expected_rfp_date ?? rawPayload.expectedRfpDate,
    deadline: preview.deadline ?? rawPayload.deadline,
    marketSector: preview.marketSector ?? rawPayload.market_sector ?? opp.tags?.join(', ') ?? null,
    contacts: {
      emails:
        (preview.contacts?.emails as string[]) ??
        aiMetadata.contacts?.emails ??
        rawPayload.contacts?.emails ??
        [],
      phones:
        (preview.contacts?.phones as string[]) ??
        aiMetadata.contacts?.phones ??
        rawPayload.contacts?.phones ??
        [],
    },
    tags: Array.isArray(opp.tags) ? opp.tags : Array.isArray(rawPayload.tags) ? rawPayload.tags : [],
    sourceUrl: rawPayload.source_url ?? rawPayload.sourceUrl ?? null,
    overview: scrapedOpportunity.overview ?? scrapedOpportunity.description ?? preview.summary ?? null,
    scopeSummary: scrapedOpportunity.scope_summary ?? scrapedOpportunity.scope ?? null,
    scopeItems: normalizedScopeItems,
    documents: normalizedDocuments,
    enrichedContacts: normalizedContacts,
  };
};

const formatOptionalDate = (input?: string | null) => {
  if (!input) return '—';
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return input;
  return parsed.toLocaleDateString();
};

export default function IngestionQueuePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TempStatus | 'all'>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityTempResponse | null>(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDraft, setCreateModalDraft] = useState<OpportunityTempResponse | null>(null);
  const [createModalDefaults, setCreateModalDefaults] = useState<Partial<OpportunityFormData>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'created_at' | 'match_score' | 'project_title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: tempOpportunities = [], isLoading } = useOpportunityTemp(
    statusFilter === 'all' ? undefined : statusFilter,
    200
  );
  const { promote, update, refresh } = useMutateOpportunityTemp();
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const previewMeta = useMemo(
    () => (selectedOpportunity ? extractPreviewMeta(selectedOpportunity) : null),
    [selectedOpportunity]
  );

  const filteredOpportunities = useMemo(() => {
    let filtered = tempOpportunities;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.project_title.toLowerCase().includes(query) ||
        opp.client_name?.toLowerCase().includes(query) ||
        opp.location?.toLowerCase().includes(query) ||
        opp.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Status filter (already handled by API, but double-check)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(opp => opp.status === statusFilter);
    }
    
    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;
      
      if (sortBy === 'created_at') {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      } else if (sortBy === 'match_score') {
        aVal = a.match_score ?? 0;
        bVal = b.match_score ?? 0;
      } else if (sortBy === 'project_title') {
        aVal = a.project_title.toLowerCase();
        bVal = b.project_title.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return filtered;
  }, [tempOpportunities, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select opportunities to approve');
      return;
    }
    
    try {
      const promises = Array.from(selectedIds).map(id => {
        const opp = tempOpportunities.find(o => o.id === id);
        if (opp) {
          return update.mutateAsync({
            id: opp.id,
            payload: { status: 'approved' as TempStatus },
          });
        }
      });
      await Promise.all(promises);
      toast.success(`${selectedIds.size} opportunities approved`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error('Failed to approve some opportunities');
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select opportunities to reject');
      return;
    }
    
    if (!confirm(`Are you sure you want to reject ${selectedIds.size} opportunities?`)) return;
    
    try {
      const promises = Array.from(selectedIds).map(id => {
        const opp = tempOpportunities.find(o => o.id === id);
        if (opp) {
          return update.mutateAsync({
            id: opp.id,
            payload: { status: 'rejected' as TempStatus },
          });
        }
      });
      await Promise.all(promises);
      toast.success(`${selectedIds.size} opportunities rejected`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error('Failed to reject some opportunities');
    }
  };

  const handleBulkPromote = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select opportunities to promote');
      return;
    }
    
    try {
      const promises = Array.from(selectedIds).map(id => {
        return promote.mutateAsync({ id });
      });
      await Promise.all(promises);
      toast.success(`${selectedIds.size} opportunities promoted`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error('Failed to promote some opportunities');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredOpportunities.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOpportunities.map(o => o.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleStatusChange = async (opp: OpportunityTempResponse, newStatus: TempStatus) => {
    try {
      await update.mutateAsync({
        id: opp.id,
        payload: { status: newStatus },
      });
      toast.success('Status updated');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRefreshOpportunity = async (opp: OpportunityTempResponse) => {
    const rawPayload = (opp.raw_payload ?? {}) as Record<string, unknown>;
    const hasSource = rawPayload.source_url || rawPayload.detail_url;
    if (!hasSource) {
      toast.error('Source link unavailable for this record.');
      return;
    }

    setRefreshingId(opp.id);
    try {
      const updated = await refresh.mutateAsync(opp.id);
      if (selectedOpportunity && selectedOpportunity.id === opp.id && updated) {
        setSelectedOpportunity(updated);
      }
    } catch (error) {
      // handled by mutation hook
    } finally {
      setRefreshingId(null);
    }
  };

  const openCreateModalForDraft = (opp: OpportunityTempResponse) => {
    setCreateModalDefaults(buildModalDefaultsFromDraft(opp));
    setCreateModalDraft(opp);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateModalDraft(null);
  };

  const handleCreateOpportunityFromModal = async (data: OpportunityFormData) => {
    if (!createModalDraft) return;
    const normalizedLocation = formatLocationValue(data.city, data.state) || data.location;
    
    // Parse project value to numeric if provided
    let budgetNumeric: number | undefined;
    if (data.projectValue) {
      const { parseProjectValue } = await import('@/utils/opportunityUtils');
      budgetNumeric = parseProjectValue(data.projectValue);
    }
    
    const updatePayload: OpportunityTempUpdate = {
      project_title: data.opportunityName || undefined,
      location: normalizedLocation || undefined,
      budget_text: data.projectValue || undefined,
      ...(budgetNumeric !== undefined && { project_value: budgetNumeric }),
      deadline: data.date ? new Date(`${data.date}T00:00:00Z`).toISOString() : undefined,
      tags: data.marketSector ? [data.marketSector] : undefined,
      // Ensure full description is saved - no truncation
      ai_summary: data.projectDescription ? data.projectDescription.trim() : undefined,
      source_url: data.companyWebsite || undefined,
    };

    try {
      await update.mutateAsync({ id: createModalDraft.id, payload: updatePayload });
      await promote.mutateAsync({ id: createModalDraft.id, accountId: data.selectedAccount || undefined });
      toast.success('Opportunity promoted successfully!');
      closeCreateModal();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to create opportunity. Please try again.';
      toast.error(message);
    }
  };

  const getSourceUrl = (opp: OpportunityTempResponse): string | null => {
    const rawPayload = opp.raw_payload as any;
    return (
      rawPayload?.source_url ||
      rawPayload?.sourceUrl ||
      rawPayload?.detail_url ||
      rawPayload?.detailUrl ||
      rawPayload?.company_website ||
      rawPayload?.companyWebsite ||
      rawPayload?.url ||
      null
    );
  };

  const getProjectValue = (opp: OpportunityTempResponse): number | null => {
    const rawPayload = opp.raw_payload as any;
    return rawPayload?.project_value_numeric || rawPayload?.project_value || null;
  };

const buildModalDefaultsFromDraft = (opp: OpportunityTempResponse): Partial<OpportunityFormData> => {
  const meta = extractPreviewMeta(opp);
  const location = extractLocationDetails(opp);
  const combinedLocation = formatLocationValue(location.city, location.state);
  const firstTag = meta.tags[0] ?? opp.tags?.[0] ?? '';
  const isoDate = formatDateForInput(meta.expectedRfpDate ?? meta.deadline ?? opp.deadline ?? null);
  const descriptionSections: string[] = [];
  const addSection = (value?: string | null) => {
    if (!value) return;
    const normalized = value.trim();
    if (!normalized) return;
    if (!descriptionSections.includes(normalized)) {
      descriptionSections.push(normalized);
    }
  };

  addSection(meta.overview);
  addSection(meta.description);
  if (meta.scopeSummary) {
    addSection(`Scope: ${meta.scopeSummary}`);
  }
  if (meta.scopeItems.length > 0) {
    addSection(`Scope Items:\n- ${meta.scopeItems.join('\n- ')}`);
  }
  addSection(meta.summary);
  addSection(opp.ai_summary);

  const fullDescription = descriptionSections.join('\n\n');
  const rawPayload = (opp.raw_payload ?? {}) as Record<string, any>;
  const scrapedOpportunity = (opp.ai_metadata?.opportunity ?? rawPayload.opportunity ?? {}) as Record<string, any>;
  const resolvedAddress =
    scrapedOpportunity?.location_details?.line1 ||
    scrapedOpportunity?.address ||
    combinedLocation ||
    rawPayload.location ||
    '';

  return {
    companyWebsite: meta.sourceUrl ?? ((opp.raw_payload as any)?.source_url ?? ''),
    opportunityName: opp.project_title ?? '',
    selectedAccount: '',
    location: combinedLocation,
    address: resolvedAddress,
    city: location.city ?? '',
    state: location.state ?? '',
    zipCode: '',
    projectValue: opp.budget_text ?? '',
    salesStage: '',
    marketSector: firstTag ?? '',
    date: isoDate,
    projectDescription: fullDescription || meta.description || meta.summary || opp.ai_summary || '',
  };
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Opportunity Ingestion Queue</h1>
          <p className="text-gray-600">
            Review and manage extracted opportunities from external sources
          </p>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title, client, location, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TempStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="promoted">Promoted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="match_score">Match Score</SelectItem>
                  <SelectItem value="project_title">Project Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32">
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                {selectedIds.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkApprove}
                disabled={update.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReject}
                disabled={update.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPromote}
                disabled={promote.isPending}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Promote Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{tempOpportunities.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-600">
              {tempOpportunities.filter(o => o.status === 'pending_review').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Approved</div>
            <div className="text-2xl font-bold text-blue-600">
              {tempOpportunities.filter(o => o.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Promoted</div>
            <div className="text-2xl font-bold text-green-600">
              {tempOpportunities.filter(o => o.status === 'promoted').length}
            </div>
          </div>
        </div>

        {/* Select All */}
        {filteredOpportunities.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredOpportunities.length && filteredOpportunities.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">
              Select All ({filteredOpportunities.length})
            </label>
          </div>
        )}

        {/* Opportunities List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#161950]" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search filters' : 'No extracted opportunities available yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.map((opp) => {
              const sourceUrl = getSourceUrl(opp);
              const projectValue = getProjectValue(opp);
              const displayLocation = getDisplayLocation(opp);
              const statusInfo = statusConfig[opp.status];
              const isSelected = selectedIds.has(opp.id);

              return (
                <div
                  key={opp.id}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Checkbox for bulk selection */}
                    <div className="flex items-start pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(opp.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {opp.project_title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            {opp.client_name && (
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{opp.client_name}</span>
                              </div>
                            )}
                            {displayLocation && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{displayLocation}</span>
                              </div>
                            )}
                            {projectValue && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{formatCurrency(projectValue)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={statusInfo.color}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                      </div>

                      {opp.ai_summary && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {opp.ai_summary}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {opp.tags?.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {opp.match_score !== null && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            Match: {opp.match_score}%
                          </Badge>
                        )}
                      </div>

                      {sourceUrl && (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#161950] hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View source
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {opp.status !== 'promoted' && (
                        <>
                          <Button
                            onClick={() => openCreateModalForDraft(opp)}
                            className="w-full bg-[#161950] hover:bg-[#1a1f6e]"
                            disabled={promote.isPending || update.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Create Opportunity
                          </Button>
                          <Select
                            value={opp.status}
                            onValueChange={(v) => handleStatusChange(opp, v as TempStatus)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending_review">Pending Review</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => handleRefreshOpportunity(opp)}
                        className="w-full"
                        disabled={refreshingId === opp.id || refresh.isPending}
                      >
                        <RefreshCw
                          className={`w-4 h-4 mr-2 ${refreshingId === opp.id ? 'animate-spin' : ''}`}
                        />
                        {refreshingId === opp.id ? 'Refreshing...' : 'Re-run AI'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedOpportunity(opp);
                          setPromoteModalOpen(true);
                        }}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>ID: {opp.temp_identifier}</span>
                      <span>
                        Created: {new Date(opp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Promote Modal */}
      <Dialog open={promoteModalOpen} onOpenChange={setPromoteModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Opportunity</DialogTitle>
            <DialogDescription>
              Review the extracted data and select an account to associate with this opportunity.
            </DialogDescription>
          </DialogHeader>

          {selectedOpportunity && (
            <div className="space-y-5">
              {/* Opportunity Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Project Title</Label>
                  <p className="text-gray-900">{selectedOpportunity.project_title}</p>
                </div>
                {selectedOpportunity.client_name && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Client</Label>
                    <p className="text-gray-900">{selectedOpportunity.client_name}</p>
                  </div>
                )}
                {selectedOpportunity.ai_summary && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Summary</Label>
                    <p className="text-gray-700 text-sm">{selectedOpportunity.ai_summary}</p>
                  </div>
                )}
                {getProjectValue(selectedOpportunity) && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Estimated Value</Label>
                    <p className="text-gray-900">{formatCurrency(getProjectValue(selectedOpportunity)!)}</p>
                  </div>
                )}
              </div>

              {previewMeta && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Probability
                      </Label>
                      <p className="text-base font-semibold text-gray-900">
                        {previewMeta.probability != null ? `${previewMeta.probability}%` : '—'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Risk Level
                      </Label>
                      <p className="text-base font-semibold text-gray-900">
                        {previewMeta.riskLevel ?? '—'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Expected RFP
                      </Label>
                      <p className="text-base font-semibold text-gray-900">
                        {formatOptionalDate(previewMeta.expectedRfpDate)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Deadline
                      </Label>
                      <p className="text-base font-semibold text-gray-900">
                        {formatOptionalDate(previewMeta.deadline)}
                      </p>
                    </div>
                  </div>

                  {previewMeta.marketSector && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Market Sector
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">{previewMeta.marketSector}</p>
                    </div>
                  )}

                  {(previewMeta.summary || previewMeta.description) && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      {previewMeta.summary && (
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            AI Summary
                          </Label>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                            {previewMeta.summary}
                          </p>
                        </div>
                      )}
                      {previewMeta.description && previewMeta.description !== previewMeta.summary && (
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Description
                          </Label>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                            {previewMeta.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {previewMeta.overview && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Project Overview
                      </Label>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                        {previewMeta.overview}
                      </p>
                    </div>
                  )}

                  {(previewMeta.scopeSummary || previewMeta.scopeItems.length > 0) && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Project Scope
                      </Label>
                      {previewMeta.scopeSummary && (
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {previewMeta.scopeSummary}
                        </p>
                      )}
                      {previewMeta.scopeItems.length > 0 && (
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                          {previewMeta.scopeItems.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {previewMeta.documents.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Documentation
                      </Label>
                      <div className="space-y-2">
                        {previewMeta.documents.map((doc, idx) => (
                          <a
                            key={`${doc.url ?? idx}-${idx}`}
                            href={doc.url ?? undefined}
                            target={doc.url ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 text-sm ${
                              doc.url ? 'text-[#161950] hover:underline' : 'text-gray-600'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            <div>
                              <p className="font-medium">
                                {doc.title || doc.type?.toUpperCase() || 'Document'}
                              </p>
                              {doc.type && (
                                <p className="text-xs text-gray-500">{doc.type.toUpperCase()}</p>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {(previewMeta.contacts.emails.length > 0 || previewMeta.contacts.phones.length > 0) && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Contacts
                      </Label>
                      {previewMeta.contacts.emails.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Emails
                          </span>
                          <p className="text-sm text-gray-700">{previewMeta.contacts.emails.join(', ')}</p>
                        </div>
                      )}
                      {previewMeta.contacts.phones.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Phones
                          </span>
                          <p className="text-sm text-gray-700">{previewMeta.contacts.phones.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {previewMeta.enrichedContacts.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Stakeholders & References
                      </Label>
                      <div className="space-y-3">
                        {previewMeta.enrichedContacts.map((contact, idx) => (
                          <div key={idx} className="rounded-md border border-gray-100 p-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {contact.name || 'Unnamed contact'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {[contact.role, contact.organization].filter(Boolean).join(' • ') || '—'}
                            </p>
                            {contact.email.length > 0 && (
                              <p className="text-xs text-gray-600 mt-1">
                                Emails: {contact.email.join(', ')}
                              </p>
                            )}
                            {contact.phone.length > 0 && (
                              <p className="text-xs text-gray-600">
                                Phones: {contact.phone.join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewMeta.tags.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Tags
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {previewMeta.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewMeta.sourceUrl && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Source Link
                      </Label>
                      <a
                        href={previewMeta.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#161950] hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {previewMeta.sourceUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPromoteModalOpen(false);
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (!selectedOpportunity) return;
                setPromoteModalOpen(false);
                openCreateModalForDraft(selectedOpportunity);
              }}
              className="bg-[#161950] hover:bg-[#1a1f6e]"
            >
              Open Creation Modal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateOpportunityModal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateOpportunityFromModal}
        initialValues={createModalDefaults}
        title="Review & Create Opportunity"
        description="These fields were auto-filled from the ingestion engine. Adjust anything before creating the opportunity."
        enableAutoEnhancement={false}
        requireAccount={false}
      />
    </div>
  );
}

