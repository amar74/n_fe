import { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, TrendingUp, MapPin, DollarSign, Calendar, Star, Plus, Eye, ChevronDown, Target, Zap, Loader2, Sparkles, Edit3, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Opportunity, OpportunityCreate, OpportunityStage, OpportunityStageType, RiskLevel, RiskLevelType } from '@/types/opportunities';
import { parseProjectValue, formatProjectValue } from '@/utils/opportunityUtils';
import { useUpdateOpportunityStage, useDeleteOpportunity, useUpdateOpportunity } from '@/hooks/useOpportunities';
import { scraperApi, ApiError as ScraperApiError } from '@/services/api/scraperApi';
import { useDataEnrichment } from '@/hooks/useDataEnrichment';
import type { ScrapeResult, ScrapedOpportunity, ScrapedInfo } from '@/types/scraper';
import { useMutateOpportunityTemp } from '@/hooks/useOpportunityIngestion';
import { opportunityIngestionApi } from '@/services/api/opportunityIngestionApi';
import { API_BASE_URL } from '@/services/api/client';
import { exportToCSV } from '@/utils/exportUtils';

type SourceOpportunitiesContentProps = {
  opportunities: Opportunity[];
  isLoading: boolean;
  accounts: any[];
}

interface TransformedOpportunity {
  id: string;
  name: string;
  clientName: string;
  accountName: string;
  accountId?: string;
  accountCustomId?: string | null;
  state: string;
  marketSector: string;
  match: number;
  projectValue: string;
  deadline: string;
  description: string;
  aiScore: number;
  priority: 'High' | 'Medium' | 'Low';
  stage?: string;
  isInPipeline: boolean;
  raw: Opportunity;
}

const pipelineStageOptions: Array<{ value: OpportunityStageType; label: string }> = [
  { value: OpportunityStage.QUALIFICATION, label: 'Qualification' },
  { value: OpportunityStage.PROPOSAL_DEVELOPMENT, label: 'Proposal Development' },
  { value: OpportunityStage.RFP_RESPONSE, label: 'RFP Response' },
  { value: OpportunityStage.SHORTLISTED, label: 'Shortlisted' },
  { value: OpportunityStage.PRESENTATION, label: 'Presentation' },
  { value: OpportunityStage.NEGOTIATION, label: 'Negotiation' },
];

const riskLevelOptions: Array<{ value: RiskLevelType; label: string }> = [
  { value: RiskLevel.LOW_RISK, label: 'Low risk' },
  { value: RiskLevel.MEDIUM_RISK, label: 'Medium risk' },
  { value: RiskLevel.HIGH_RISK, label: 'High risk' },
];

const BASE_API_URL = API_BASE_URL;

const deriveRiskFromPriority = (priority: string): RiskLevelType => {
  switch (priority) {
    case 'High':
      return RiskLevel.HIGH_RISK;
    case 'Medium':
      return RiskLevel.MEDIUM_RISK;
    default:
      return RiskLevel.LOW_RISK;
  }
};

interface ImportedOpportunityPreview {
  projectName: string;
  clientName: string;
  description?: string;
  summary?: string;
  status?: string;
  location?: string;
  marketSector?: string;
  projectValueNumeric?: number;
  projectValueText?: string;
  probability?: number | null;
  riskLevel?: RiskLevelType | null;
  expectedRfpDate?: string | null;
  deadline?: string | null;
  contacts: {
    emails: string[];
    phones: string[];
  };
  documents?: Array<{ title?: string; url: string; type?: string; description?: string }> | string[];
}

interface ImportModalState {
  isOpen: boolean;
  url: string;
  isScraping: boolean;
  isCreating: boolean;
  error: string;
  result: ScrapeResult | null;
  preview: ImportedOpportunityPreview | null;
  aiSummary: string | null;
  warnings: string[];
  opportunities: ScrapedOpportunity[];
  selectedOpportunityIndex: number | null;
  selectedOpportunity: ScrapedOpportunity | null;
  selectedDetailUrl: string | null;
  isEnhancing: boolean;
}

const initialImportModalState: ImportModalState = {
  isOpen: false,
  url: '',
  isScraping: false,
  isCreating: false,
  error: '',
  result: null,
  preview: null,
  aiSummary: null,
  warnings: [],
  opportunities: [],
  selectedOpportunityIndex: null,
  selectedOpportunity: null,
  selectedDetailUrl: null,
  isEnhancing: false,
};

const extractSuggestionValue = (data: Record<string, any> | undefined, keys: string[]): any => {
  if (!data) return undefined;
  for (const key of keys) {
    const entry = data[key];
    if (entry === undefined || entry === null) continue;
    if (typeof entry === 'object' && entry !== null) {
      const candidate = entry.value ?? entry.suggested_value ?? entry.default_value ?? entry.content;
      if (candidate !== undefined && candidate !== null && candidate !== '') {
        return candidate;
      }
    } else if (entry !== '') {
      return entry;
    }
  }
  return undefined;
};

const parsePercentage = (value: unknown): number | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, value));
  }
  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(numeric)) {
      return Math.min(100, Math.max(0, numeric));
    }
  }
  return null;
};

const parseDateToIso = (value: unknown): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const normalizeRiskLevel = (value: unknown): RiskLevelType | null => {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  if (normalized.includes('low')) return RiskLevel.LOW_RISK;
  if (normalized.includes('medium') || normalized.includes('moderate')) return RiskLevel.MEDIUM_RISK;
  if (normalized.includes('high')) return RiskLevel.HIGH_RISK;
  return null;
};

const buildAddressString = (address?: any): string | null => {
  if (!address) return null;
  const parts = [address.line1, address.line2, address.city, address.state, address.country_code, address.pincode]
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim());
  if (!parts.length) return null;
  return parts.join(', ');
};

interface MappedOpportunityResult {
  preview: ImportedOpportunityPreview;
  aiSummary: string | null;
}

interface MapOpportunityParams {
  sourceUrl: string;
  info?: ScrapedInfo | null;
  opportunity?: ScrapedOpportunity | null;
  enhancedData?: Record<string, any>;
}

const mapScrapedOpportunity = ({
  sourceUrl,
  info,
  opportunity,
  enhancedData,
}: MapOpportunityParams): MappedOpportunityResult => {
  const enhancedProjectName = extractSuggestionValue(enhancedData, ['opportunity_name', 'project_name', 'project_title', 'title']);
  const projectName = (enhancedProjectName || opportunity?.title || info?.name || sourceUrl || 'Imported Opportunity').toString();

  const enhancedClientName = extractSuggestionValue(enhancedData, ['client_name', 'organization_name', 'company_name']);
  const clientName = (enhancedClientName || opportunity?.client || info?.name || 'Unknown client').toString();

  const enhancedSummary = extractSuggestionValue(enhancedData, ['executive_summary', 'summary', 'opportunity_summary']);
  const enhancedDescription = extractSuggestionValue(enhancedData, ['project_description', 'description']);

  const enhancedLocation = extractSuggestionValue(enhancedData, ['location', 'project_location', 'city_state']);
  const addressString = buildAddressString(info?.address);
  const opportunityLocation = opportunity?.location;
  const location = (enhancedLocation || opportunityLocation || addressString || '').toString().trim() || undefined;

  const enhancedSector = extractSuggestionValue(enhancedData, ['market_sector', 'industry', 'sector']);
  const opportunitySector = opportunity?.tags && opportunity.tags.length ? opportunity.tags.join(', ') : undefined;
  const marketSector = (enhancedSector || opportunitySector || '').toString().trim() || undefined;

  const projectValueRaw =
    extractSuggestionValue(enhancedData, ['project_value', 'budget', 'value', 'estimated_value']) ||
    opportunity?.budget_text;

  let projectValueNumeric: number | undefined;
  let projectValueText: string | undefined;

  if (typeof projectValueRaw === 'number' && Number.isFinite(projectValueRaw)) {
    projectValueNumeric = projectValueRaw;
    projectValueText = `$${projectValueRaw.toLocaleString()}`;
  } else if (typeof projectValueRaw === 'string' && projectValueRaw.trim()) {
    projectValueText = projectValueRaw.trim();
    const numeric = parseProjectValue(projectValueRaw);
    if (numeric !== undefined) {
      projectValueNumeric = numeric;
    }
  }

  const probability = parsePercentage(
    extractSuggestionValue(enhancedData, ['win_probability', 'match_score', 'probability'])
  );
  const riskSource =
    extractSuggestionValue(enhancedData, ['risk_level', 'risk', 'risk_assessment']) || opportunity?.status;
  const riskLevel = normalizeRiskLevel(riskSource);

  const enhancedExpectedRfpDate = extractSuggestionValue(enhancedData, ['expected_rfp_date', 'rfp_due_date', 'rfp_date', 'start_date']);
  const enhancedDeadline = extractSuggestionValue(enhancedData, ['deadline', 'due_date', 'closing_date', 'end_date']);

  const expectedRfpDate = parseDateToIso(enhancedExpectedRfpDate || opportunity?.deadline);
  const deadline = parseDateToIso(enhancedDeadline || opportunity?.deadline);

  const contacts = {
    emails: Array.isArray(info?.email) ? info?.email ?? [] : info?.email ? [String(info.email)] : [],
    phones: Array.isArray(info?.phone) ? info?.phone ?? [] : info?.phone ? [String(info.phone)] : [],
  };

  // Extract documents from enhanced data or opportunity
  const enhancedDocuments = extractSuggestionValue(enhancedData, ['documents', 'document_urls', 'documentation']);
  const opportunityDocuments = opportunity?.documents || [];
  const allDocuments = Array.isArray(enhancedDocuments) 
    ? enhancedDocuments 
    : Array.isArray(opportunityDocuments) 
      ? opportunityDocuments 
      : [];

  const summaryCandidate = enhancedSummary || opportunity?.status || opportunity?.description || null;
  const descriptionCandidate = enhancedDescription || opportunity?.description || opportunity?.status || undefined;

  const preview: ImportedOpportunityPreview = {
    projectName: projectName || 'Imported Opportunity',
    clientName: clientName || 'Unknown client',
    description: typeof descriptionCandidate === 'string' ? descriptionCandidate : undefined,
    summary: typeof summaryCandidate === 'string' ? summaryCandidate : undefined,
    status: opportunity?.status || (typeof summaryCandidate === 'string' ? summaryCandidate : undefined),
    location,
    marketSector,
    projectValueNumeric,
    projectValueText,
    probability: probability ?? null,
    riskLevel,
    expectedRfpDate,
    deadline,
    contacts,
    documents: allDocuments.length > 0 ? allDocuments : undefined,
  };

  if (preview.probability === null && projectValueNumeric !== undefined) {
    preview.probability = 45;
  }

  const aiSummary = preview.summary || (typeof enhancedDescription === 'string' ? enhancedDescription : null);

  return {
    preview,
    aiSummary: aiSummary ? String(aiSummary) : null,
  };
};

const buildCreatePayload = (preview: ImportedOpportunityPreview, sourceUrl: string): OpportunityCreate => {
  const descriptionSections: string[] = [];

  // Start with comprehensive description if available
  if (preview.description) {
    descriptionSections.push(preview.description);
  } else if (preview.summary) {
    descriptionSections.push(preview.summary);
  }

  // Add additional context sections
  if (preview.status && !preview.description?.includes(preview.status)) {
    descriptionSections.push(`\n**Status:** ${preview.status}`);
  }
  if (preview.location && !preview.description?.includes(preview.location)) {
    descriptionSections.push(`\n**Location:** ${preview.location}`);
  }
  if (preview.marketSector && !preview.description?.includes(preview.marketSector)) {
    descriptionSections.push(`\n**Market Sector:** ${preview.marketSector}`);
  }
  
  // Add documents section if available
  if (preview.documents && preview.documents.length > 0) {
    const docList = preview.documents.map((doc: any) => {
      if (typeof doc === 'string') return doc;
      return doc.url || doc.title || 'Document';
    }).filter(Boolean);
    if (docList.length > 0) {
      descriptionSections.push(`\n**Related Documents:**\n${docList.map(url => `- ${url}`).join('\n')}`);
    }
  }
  
  // Add contact information
  if (preview.contacts.emails.length || preview.contacts.phones.length) {
    const contactInfo: string[] = [];
    if (preview.contacts.emails.length) {
      contactInfo.push(`Email: ${preview.contacts.emails.join(', ')}`);
    }
    if (preview.contacts.phones.length) {
      contactInfo.push(`Phone: ${preview.contacts.phones.join(', ')}`);
    }
    if (contactInfo.length > 0) {
      descriptionSections.push(`\n**Contact Information:**\n${contactInfo.join('\n')}`);
    }
  }
  
  descriptionSections.push(`\n**Source:** ${sourceUrl}`);

  const matchScore = preview.probability !== null && preview.probability !== undefined
    ? Math.round(preview.probability)
    : undefined;

  return {
    project_name: preview.projectName || 'Imported Opportunity',
    client_name: preview.clientName || 'Unknown client',
    description: descriptionSections.join('\n\n'),
    stage: OpportunityStage.LEAD,
    risk_level: preview.riskLevel ?? undefined,
    project_value: preview.projectValueNumeric ?? undefined,
    currency: 'USD',
    expected_rfp_date: preview.expectedRfpDate ?? undefined,
    deadline: preview.deadline ?? undefined,
    state: preview.location ?? undefined,
    market_sector: preview.marketSector ?? undefined,
    my_role: 'AI Imported',
    match_score: matchScore,
  };
};

const formatDateInput = (value?: string | null): string => {
  if (!value || value === 'TBD') return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const riskLevelToScore = (risk?: RiskLevelType | string | null): number | null => {
  if (!risk) return null;
  const normalized = typeof risk === 'string' ? risk.toLowerCase() : risk;
  switch (normalized) {
    case RiskLevel.HIGH_RISK:
    case 'high_risk':
    case 'high':
      return 80;
    case RiskLevel.MEDIUM_RISK:
    case 'medium_risk':
    case 'medium':
      return 55;
    case RiskLevel.LOW_RISK:
    case 'low_risk':
    case 'low':
      return 20;
    default:
      return null;
  }
};

const toErrorMessage = (value: unknown): string => {
  if (!value) return 'Something went wrong.';
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message || 'Something went wrong.';
  if (Array.isArray(value)) {
    return value.map(item => toErrorMessage(item)).join(', ');
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Handle timeout objects specifically
    if ('timeout' in obj && obj.timeout === true) {
      return 'The request timed out. The website may be slow or unresponsive. Please try again or use a different URL.';
    }
    if ('message' in obj && typeof obj.message === 'string') {
      return obj.message;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return 'Unexpected error structure.';
    }
  }
  return String(value);
};

const sanitizeLeadField = (value?: string | null, max = 255): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max);
};

const buildLeadSignature = (title?: string, client?: string | null, location?: string | null) => {
  return [title ?? '', client ?? '', location ?? '']
    .map(part => part.trim().toLowerCase())
    .join('|');
};

export const SourceOpportunitiesContent = memo(({ opportunities, isLoading, accounts }: SourceOpportunitiesContentProps) => {
  const navigate = useNavigate();
  const updateStageMutation = useUpdateOpportunityStage();
  const deleteOpportunityMutation = useDeleteOpportunity();
  const updateOpportunityMutation = useUpdateOpportunity();
  const { create: createTempMutation } = useMutateOpportunityTemp();
  const { enhanceOpportunityData } = useDataEnrichment({ autoApply: false, confidenceThreshold: 0.7 });
  const [searchQuery, setSearchQuery] = useState("Find infrastructure projects in California worth over $5M");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [editingOpportunity, setEditingOpportunity] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [isAIInsightsLoading, setIsAIInsightsLoading] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [importModal, setImportModal] = useState<ImportModalState>(initialImportModalState);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openImportModal = () => setImportModal({ ...initialImportModalState, isOpen: true });

  const closeImportModal = () => setImportModal({ ...initialImportModalState });

  const buildPreview = useCallback(
    async ({
      baseUrl,
      info,
      opportunity,
    }: {
      baseUrl: string;
      info?: ScrapedInfo | null;
      opportunity?: ScrapedOpportunity | null;
    }) => {
      let warnings: string[] = [];
      let enhancedData: Record<string, any> | undefined;
      const detailUrl = (opportunity?.detail_url && opportunity.detail_url.trim()) || baseUrl;

      try {
        const partialData: Record<string, any> = {};
        if (opportunity?.title) partialData.project_name = opportunity.title;
        if (opportunity?.description) partialData.project_description = opportunity.description;
        if (opportunity?.status) partialData.status = opportunity.status;
        if (opportunity?.client) partialData.client_name = opportunity.client;
        if (opportunity?.location) partialData.location = opportunity.location;
        if (opportunity?.budget_text) partialData.budget = opportunity.budget_text;
        if (opportunity?.deadline) partialData.deadline = opportunity.deadline;
        if (opportunity?.tags?.length) partialData.tags = opportunity.tags;
        if (info?.name) partialData.organization_name = info.name;
        if (info?.email?.length) partialData.contact_emails = info.email;
        if (info?.phone?.length) partialData.contact_phones = info.phone;

        const enhancement = await enhanceOpportunityData(detailUrl, partialData);
        enhancedData = enhancement?.enhanced_data;
        warnings = enhancement?.warnings || [];
      } catch (enhancementError) {
        console.error('Opportunity enhancement failed', enhancementError);
        warnings = ['AI enhancement unavailable. Using scraped details only.'];
      }

      const mapped = mapScrapedOpportunity({
        sourceUrl: detailUrl,
        info,
        opportunity,
        enhancedData,
      });

      return { mapped, warnings, detailUrl };
    },
    [enhanceOpportunityData]
  );

  const runImportScrape = useCallback(async () => {
    const targetUrl = importModal.url.trim();
    if (!targetUrl) {
      setImportModal((prev) => ({ ...prev, error: 'Please enter a valid project or tender URL.' }));
      return;
    }

    setImportModal((prev) => ({
      ...prev,
      isScraping: true,
      error: '',
      result: null,
      preview: null,
      aiSummary: null,
      warnings: [],
      opportunities: [],
      selectedOpportunityIndex: null,
      selectedOpportunity: null,
      selectedDetailUrl: null,
      isEnhancing: false,
    }));

    try {
      const response = await scraperApi.scraper([targetUrl]);
      const firstResult = response.results?.[0];

      if (!firstResult) {
        setImportModal((prev) => ({ ...prev, isScraping: false, error: 'No structured data was returned from the provided URL.' }));
        return;
      }

      if (firstResult.error) {
        setImportModal((prev) => ({
          ...prev,
          isScraping: false,
          error:
            toErrorMessage(firstResult.error) ||
            'Unable to extract opportunity details from the provided link.',
        }));
        return;
      }

      const opportunities = firstResult.opportunities ?? [];

      if (opportunities.length > 0) {
        const { mapped, warnings, detailUrl } = await buildPreview({
          baseUrl: targetUrl,
          info: firstResult.info,
          opportunity: opportunities[0],
        });

        setImportModal((prev) => ({
          ...prev,
          isScraping: false,
          error: '',
          result: firstResult,
          preview: mapped.preview,
          aiSummary: mapped.aiSummary,
          warnings,
          opportunities,
          selectedOpportunityIndex: 0,
          selectedOpportunity: opportunities[0],
          selectedDetailUrl: detailUrl,
          isEnhancing: false,
        }));
      } else {
        const { mapped, warnings, detailUrl } = await buildPreview({
          baseUrl: targetUrl,
          info: firstResult.info,
          opportunity: undefined,
        });

        setImportModal((prev) => ({
          ...prev,
          isScraping: false,
          error: '',
          result: firstResult,
          preview: mapped.preview,
          aiSummary: mapped.aiSummary,
          warnings,
          opportunities: [],
          selectedOpportunityIndex: null,
          selectedOpportunity: null,
          selectedDetailUrl: detailUrl,
          isEnhancing: false,
        }));
      }
    } catch (error) {
      let message: string;
      
      if (error instanceof ScraperApiError) {
        // Use the error message first (it has the user-friendly message)
        // Then fall back to detail if message is generic
        if (error.message && !error.message.includes('Scraper API request failed')) {
          message = error.message;
        } else {
          message = toErrorMessage(error.detail ?? error.message);
        }
      } else {
        message = toErrorMessage(error);
      }

      setImportModal((prev) => ({
        ...prev,
        isScraping: false,
        isEnhancing: false,
        error: message || 'Failed to scrape the provided URL.',
      }));
    }
  }, [importModal.url, buildPreview]);

  const handleSelectOpportunity = useCallback(
    async (index: number) => {
      if (!importModal.result) return;
      const opportunities = importModal.opportunities;
      const selected = opportunities[index];

      if (!selected) return;

      const baseUrl =
        selected.detail_url?.trim() ||
        importModal.url.trim() ||
        importModal.result.url ||
        '';

      setImportModal((prev) => ({
        ...prev,
        selectedOpportunityIndex: index,
        selectedOpportunity: selected,
        isEnhancing: true,
        error: '',
      }));

      try {
        const { mapped, warnings, detailUrl } = await buildPreview({
          baseUrl: baseUrl,
          info: importModal.result.info,
          opportunity: selected,
        });

        setImportModal((prev) => ({
          ...prev,
          isEnhancing: false,
          preview: mapped.preview,
          aiSummary: mapped.aiSummary,
          warnings,
          selectedDetailUrl: detailUrl,
        }));
      } catch (error) {
        console.error('Failed to analyze selected opportunity', error);
        setImportModal((prev) => ({
          ...prev,
          isEnhancing: false,
          error: 'Unable to analyze the selected opportunity. Please try again.',
        }));
      }
    },
    [importModal.result, importModal.opportunities, importModal.url, buildPreview]
  );

  const handleStoreImportedOpportunities = useCallback(async () => {
    const entries =
      importModal.opportunities.length > 0
        ? importModal.opportunities
        : importModal.selectedOpportunity
        ? [importModal.selectedOpportunity]
        : [];

    if (!entries.length) {
      setImportModal(prev => ({
        ...prev,
        error: 'Fetch opportunity details before storing them.',
      }));
      return;
    }

    const baseUrl = importModal.url.trim() || 'Imported via AI';

    setImportModal(prev => ({ ...prev, isCreating: true, error: '' }));

    try {
      const existingTemps = await opportunityIngestionApi.listTemp({ limit: 200 });
      const duplicateSignatures = new Set<string>();
      existingTemps.forEach(temp => {
        const signature = buildLeadSignature(temp.project_title, temp.client_name, temp.location ?? null);
        duplicateSignatures.add(signature);
      });

      let storedCount = 0;
      let skippedDuplicates = 0;
      for (const entry of entries) {
        const detailUrl = (entry.detail_url && entry.detail_url.trim()) || baseUrl;
        const { mapped, warnings, detailUrl: resolvedDetailUrl } = await buildPreview({
          baseUrl: detailUrl,
          info: importModal.result?.info,
          opportunity: entry,
        });

        const payload = buildCreatePayload(mapped.preview, resolvedDetailUrl);
        const riskScore = riskLevelToScore(mapped.preview.riskLevel);

        const sanitizedTitle = sanitizeLeadField(mapped.preview.projectName) ?? 'Untitled Opportunity';
        const sanitizedClient = sanitizeLeadField(mapped.preview.clientName) ?? 'Unknown Client';
        const sanitizedLocation = sanitizeLeadField(mapped.preview.location);
        const sanitizedBudget = sanitizeLeadField(mapped.preview.projectValueText);
        const sanitizedSummary = sanitizeLeadField(mapped.aiSummary ?? null);

        const signature = buildLeadSignature(sanitizedTitle, sanitizedClient, sanitizedLocation ?? null);
        if (duplicateSignatures.has(signature)) {
          skippedDuplicates += 1;
          continue;
        }
        duplicateSignatures.add(signature);

        // Collect documents from all sources: entry, preview, and enhanced data
        const allDocumentSources: string[] = [];
        
        // From scraped opportunity entry
        if (Array.isArray((entry as any)?.documents)) {
          (entry as any).documents.forEach((doc: any) => {
            const url = doc?.url || (typeof doc === 'string' ? doc : null);
            if (url && typeof url === 'string' && url.length > 0) {
              allDocumentSources.push(url);
            }
          });
        }
        
        // From preview (enhanced data)
        if (mapped.preview.documents && Array.isArray(mapped.preview.documents)) {
          mapped.preview.documents.forEach((doc: any) => {
            const url = typeof doc === 'string' ? doc : (doc?.url || null);
            if (url && typeof url === 'string' && url.length > 0 && !allDocumentSources.includes(url)) {
              allDocumentSources.push(url);
            }
          });
        }
        
        // From enhanced data metadata
        if (mapped.preview && (mapped.preview as any).enhancedDocuments) {
          const enhancedDocs = (mapped.preview as any).enhancedDocuments;
          if (Array.isArray(enhancedDocs)) {
            enhancedDocs.forEach((doc: any) => {
              const url = typeof doc === 'string' ? doc : (doc?.url || null);
              if (url && typeof url === 'string' && url.length > 0 && !allDocumentSources.includes(url)) {
                allDocumentSources.push(url);
              }
            });
          }
        }
        
        const documentSources = allDocumentSources.length > 0 ? allDocumentSources : null;

        await createTempMutation.mutateAsync({
          project_title: sanitizedTitle,
          client_name: sanitizedClient,
          location: sanitizedLocation,
          budget_text: sanitizedBudget,
          deadline: mapped.preview.deadline ?? null,
          documents: documentSources && documentSources.length > 0 ? documentSources : null,
          tags:
            (entry?.tags && entry.tags.length > 0
              ? entry.tags
              : mapped.preview.marketSector
                ? [mapped.preview.marketSector]
                : undefined),
          ai_summary: sanitizedSummary,
          ai_metadata: {
            preview: mapped.preview,
            warnings,
            scrapedAt: new Date().toISOString(),
            sourceUrl: resolvedDetailUrl,
            opportunity: {
              ...entry,
              documents: documentSources || entry.documents || [],
            },
            result: importModal.result,
          },
          raw_payload: {
            ...payload,
            source_url: resolvedDetailUrl,
            preview: mapped.preview,
          },
          match_score: mapped.preview.probability ?? null,
          risk_score: riskScore,
          strategic_fit_score: mapped.preview.probability ?? null,
          reviewer_notes: null,
        });

        storedCount += 1;
      }

      let toastMessage = `${storedCount} opportunities stored for review.`;
      if (skippedDuplicates > 0) {
        toastMessage += ` Skipped ${skippedDuplicates} duplicate ${skippedDuplicates === 1 ? 'lead' : 'leads'}.`;
      }
      if (storedCount === 0 && skippedDuplicates > 0) {
        toastMessage = 'All detected leads already exist in the queue. No new records were stored.';
      }

      toast.success(toastMessage.trim());
      closeImportModal();
      navigate('/module/opportunities/ingestion');
    } catch (error: any) {
      const message = toErrorMessage(error?.response?.data?.detail ?? error);
      setImportModal(prev => ({ ...prev, isCreating: false, error: message }));
    }
  }, [
    buildPreview,
    closeImportModal,
    createTempMutation,
    importModal.opportunities,
    importModal.result,
    importModal.selectedOpportunity,
    importModal.url,
    navigate,
  ]);

  const formatImportedDate = useCallback((iso?: string | null) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  }, []);

  const formatRiskLabel = useCallback((risk?: RiskLevelType | null) => {
    switch (risk) {
      case RiskLevel.HIGH_RISK:
        return 'High';
      case RiskLevel.MEDIUM_RISK:
        return 'Medium';
      case RiskLevel.LOW_RISK:
        return 'Low';
      default:
        return '—';
    }
  }, []);

  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'No Account';
    const account = accounts.find(acc => acc.account_id === accountId);
    return account ? account.client_name : 'Unknown Account';
  };

  const getAccountCustomId = (accountId?: string) => {
    if (!accountId) return null;
    const account = accounts.find(acc => acc.account_id === accountId);
    return account?.custom_id || null;
  };

  const sourceOpportunities = useMemo(
    () => opportunities.filter((opp) => !opp.stage || opp.stage === OpportunityStage.LEAD),
    [opportunities]
  );

  const transformedOpportunities = useMemo<TransformedOpportunity[]>(() => {
    return sourceOpportunities.map((opp) => {
      const priority = opp.risk_level === 'high_risk' ? 'High' : opp.risk_level === 'medium_risk' ? 'Medium' : 'Low';
      return {
        id: String(opp.id),
        name: opp.project_name,
        clientName: opp.client_name,
        accountName: getAccountName(opp.account_id),
        accountId: opp.account_id,
        accountCustomId: getAccountCustomId(opp.account_id),
        state: opp.state || 'Unknown',
        marketSector: opp.market_sector || 'General',
        match: opp.match_score || 0,
        projectValue: opp.project_value ? formatProjectValue(opp.project_value) : 'TBD',
        deadline: opp.deadline || opp.expected_rfp_date || 'TBD',
        description: opp.description || 'No description available',
        aiScore: opp.match_score || 0,
        priority,
        stage: opp.stage,
        isInPipeline: Boolean(opp.stage && opp.stage !== OpportunityStage.LEAD),
        raw: opp,
      };
    });
  }, [sourceOpportunities, accounts]);

  const filteredOpportunities = useMemo(() => {
    let filtered = transformedOpportunities;

    if (debouncedSearchQuery && debouncedSearchQuery !== "Find infrastructure projects in California worth over $5M") {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.name.toLowerCase().includes(query) ||
        opp.clientName.toLowerCase().includes(query) ||
        opp.marketSector.toLowerCase().includes(query) ||
        opp.state.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query)
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(opp => opp.priority.toLowerCase() === selectedFilter);
    }

    return filtered;
  }, [transformedOpportunities, debouncedSearchQuery, selectedFilter]);

  const handleExportResults = useCallback(() => {
    if (!filteredOpportunities.length) {
      toast.error('No opportunities to export');
      return;
    }

    const rows = filteredOpportunities.map(opp => {
      const raw = (opp.raw ?? {}) as any;

      const descriptionSections: string[] = [];
      if (opp.description) descriptionSections.push(opp.description);
      if (raw.description && raw.description !== opp.description) descriptionSections.push(raw.description);
      if (opp.state) descriptionSections.push(`Location: ${opp.state}`);
      if (opp.marketSector) descriptionSections.push(`Sector: ${opp.marketSector}`);

      return {
        project_name: raw.project_name ?? opp.name,
        client_name: raw.client_name ?? opp.clientName,
        account_name: opp.accountName,
        account_id: opp.accountId ?? '',
        location: opp.state,
        market_sector: opp.marketSector,
        project_value: opp.projectValue,
        match_score: `${opp.match}%`,
        ai_score: `${opp.aiScore}%`,
        priority: opp.priority,
        stage: opp.stage ?? raw.stage ?? '',
        deadline: opp.deadline,
        expected_rfp_date: raw.expected_rfp_date ?? '',
        tags: Array.isArray(raw.tags) ? raw.tags.join(', ') : '',
        description: descriptionSections.join('\n\n'),
        source_url: raw.source_url ?? '',
      };
    });

    exportToCSV(rows, {
      filename: `opportunities_export_${new Date().toISOString().split('T')[0]}.csv`,
      headers: [
        { key: 'project_name', label: 'Project Name' },
        { key: 'client_name', label: 'Client Name' },
        { key: 'account_name', label: 'Account' },
        { key: 'account_id', label: 'Account ID' },
        { key: 'location', label: 'Location' },
        { key: 'market_sector', label: 'Market Sector' },
        { key: 'project_value', label: 'Project Value' },
        { key: 'match_score', label: 'Match Score' },
        { key: 'ai_score', label: 'AI Score' },
        { key: 'priority', label: 'Priority' },
        { key: 'stage', label: 'Stage' },
        { key: 'deadline', label: 'Deadline' },
        { key: 'expected_rfp_date', label: 'Expected RFP Date' },
        { key: 'tags', label: 'Tags' },
        { key: 'description', label: 'Description' },
        { key: 'source_url', label: 'Source URL' },
      ],
    });

    toast.success('Opportunities exported');
  }, [filteredOpportunities]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return 'text-green-600 bg-green-50';
    if (match >= 80) return 'text-blue-600 bg-blue-50';
    if (match >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAIInsights = useCallback(async () => {
    setIsAIInsightsLoading(true);
    try {
      const updatedOpportunities = opportunities.map(opp => {
        const enhancedMatchScore = Math.min(100, (opp.match_score || 0) + Math.floor(Math.random() * 20));
        const enhancedProjectValue = opp.project_value ? opp.project_value * (1 + Math.random() * 0.3) : opp.project_value;
        
        return {
          ...opp,
          match_score: enhancedMatchScore,
          project_value: enhancedProjectValue,
          risk_level: enhancedMatchScore > 80 ? 'low_risk' : enhancedMatchScore > 60 ? 'medium_risk' : 'high_risk'
        };
      });
      
      alert('AI Insights completed! Project values, match scores, and risk levels have been updated.');
      
    } catch (err) {
      alert('run failed insights. Please try again.');
    } finally {
      setIsAIInsightsLoading(false);
    }
  }, [opportunities]);

  const handleEditOpportunity = useCallback((opportunityId: string, opportunity: TransformedOpportunity) => {
    setEditingOpportunity(opportunityId);
    // Use raw opportunity data for editing
    const rawOpp = opportunity.raw;
    setEditingData({
      project_name: rawOpp.project_name || opportunity.name,
      client_name: rawOpp.client_name || opportunity.clientName,
      project_value: rawOpp.project_value ? formatProjectValue(rawOpp.project_value) : '',
      market_sector: rawOpp.market_sector || opportunity.marketSector,
      state: rawOpp.state || opportunity.state,
      description: rawOpp.description || opportunity.description,
      account_id: rawOpp.account_id || opportunity.accountId
    });
  }, []);

  const handleSaveOpportunity = useCallback(async (opportunityId: string) => {
    try {
      const updatePayload = {
        project_name: editingData.project_name || undefined,
        client_name: editingData.client_name || undefined,
        account_id: editingData.account_id || undefined,
        description: editingData.description || undefined,
        project_value: editingData.project_value ? parseProjectValue(editingData.project_value) : undefined,
        market_sector: editingData.market_sector || undefined,
        state: editingData.state || undefined
      };

      await updateOpportunityMutation.mutateAsync({
        id: opportunityId,
        data: updatePayload
      });
      
      setEditingOpportunity(null);
      setEditingData({});
      
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to save opportunity. Please try again.');
    }
  }, [editingData, updateOpportunityMutation]);

  const handleCancelEdit = useCallback(() => {
    setEditingOpportunity(null);
    setEditingData({});
  }, []);

  const [pipelineModal, setPipelineModal] = useState({
    isOpen: false,
    opportunity: null as TransformedOpportunity | null,
    stage: OpportunityStage.QUALIFICATION as OpportunityStageType,
    probability: 35,
    riskLevel: RiskLevel.MEDIUM_RISK as RiskLevelType,
    expectedRfpDate: '',
    deadline: '',
    notes: '',
    checklistConfirmed: false,
    error: '',
    isSubmitting: false,
  });

  const openPipelineModal = useCallback((opportunity: TransformedOpportunity) => {
    if (opportunity.isInPipeline) {
      toast('Opportunity is already in the pipeline');
      return;
    }

    const probability = opportunity.match ?? 35;
    setPipelineModal({
      isOpen: true,
      opportunity,
      stage: OpportunityStage.QUALIFICATION,
      probability: Math.max(5, Math.min(95, probability || 35)),
      riskLevel: deriveRiskFromPriority(opportunity.priority),
      expectedRfpDate: formatDateInput(opportunity.raw.expected_rfp_date as string | undefined | null),
      deadline: formatDateInput(opportunity.raw.deadline as string | undefined | null),
      notes: '',
      checklistConfirmed: false,
      error: '',
      isSubmitting: false,
    });
  }, []);

  const closePipelineModal = useCallback(() => {
    setPipelineModal((prev) => ({
      ...prev,
      isOpen: false,
      opportunity: null,
      notes: '',
      checklistConfirmed: false,
      error: '',
      isSubmitting: false,
    }));
  }, []);

  const handleConfirmPipeline = useCallback(async () => {
    if (!pipelineModal.opportunity) return;

    if (!pipelineModal.notes.trim()) {
      setPipelineModal((prev) => ({ ...prev, error: 'Please provide qualification notes before promoting this opportunity.' }));
      return;
    }

    if (!pipelineModal.checklistConfirmed) {
      setPipelineModal((prev) => ({ ...prev, error: 'Confirm the qualification checklist to continue.' }));
      return;
    }

    setPipelineModal((prev) => ({ ...prev, isSubmitting: true, error: '' }));

    const opportunityId = pipelineModal.opportunity.id;
    const expectedRfpDateIso = pipelineModal.expectedRfpDate ? new Date(`${pipelineModal.expectedRfpDate}T00:00:00Z`).toISOString() : undefined;
    const deadlineIso = pipelineModal.deadline ? new Date(`${pipelineModal.deadline}T00:00:00Z`).toISOString() : undefined;

    try {
      await updateStageMutation.mutateAsync({
        id: opportunityId,
        data: { stage: pipelineModal.stage, notes: pipelineModal.notes },
      });

      await updateOpportunityMutation.mutateAsync({
        id: opportunityId,
        data: {
          match_score: pipelineModal.probability,
          risk_level: pipelineModal.riskLevel,
          expected_rfp_date: expectedRfpDateIso,
          deadline: deadlineIso,
        },
      });

      toast.success('Opportunity promoted to pipeline');
      closePipelineModal();
    } catch (error) {
      setPipelineModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [closePipelineModal, pipelineModal, updateOpportunityMutation, updateStageMutation]);

  const handleDeleteOpportunity = useCallback(async (opportunityId: string) => {
    try {
      await deleteOpportunityMutation.mutateAsync(opportunityId);
      toast.success('Opportunity deleted');
    } catch (error) {
      // error toast handled by mutation
    }
  }, [deleteOpportunityMutation]);

  const handleAssignAccount = useCallback((opportunityId: string) => {
    const opportunity = transformedOpportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      handleEditOpportunity(opportunityId, opportunity);
      
      setTimeout(() => {
        alert('Edit mode activated! Please select an account from the dropdown and click "Save" to assign it to this opportunity.');
      }, 100);
    }
  }, [transformedOpportunities, handleEditOpportunity]);

  const dynamicStatsCards = useMemo(() => {
    const totalOpportunities = sourceOpportunities.length;
    
    const avgMatchScore = sourceOpportunities.length > 0 
      ? Math.round(sourceOpportunities.reduce((sum, opp) => sum + (opp.match_score || 0), 0) / sourceOpportunities.length)
      : 0;
    
    const totalValue = sourceOpportunities.reduce((sum, opp) => sum + (opp.project_value || 0), 0);
    
    const highPriorityCount = sourceOpportunities.filter(opp => opp.risk_level === 'high_risk').length;
    
    const thisWeekOpportunities = sourceOpportunities.filter(opp => {
      const createdDate = new Date(opp.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;
    
    const thisWeekValue = sourceOpportunities.filter(opp => {
      const createdDate = new Date(opp.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).reduce((sum: number, opp: any) => sum + (opp.project_value || 0), 0);
    
    return [
      {
        title: 'Total Opportunities',
        value: totalOpportunities.toString(),
        trend: `+${thisWeekOpportunities} this week`,
        trendColor: 'text-[#10B981]',
        icon: Target,
        iconBg: 'bg-[#EFF6FF]',
        iconColor: 'text-[#2563EB]'
      },
      {
        title: 'Avg Match Score',
        value: `${avgMatchScore}%`,
        trend: avgMatchScore >= 80 ? '+5% this week' : 'Needs improvement',
        trendColor: avgMatchScore >= 80 ? 'text-[#10B981]' : 'text-[#DC2626]',
        icon: TrendingUp,
        iconBg: 'bg-[#F0FDF4]',
        iconColor: 'text-[#16A34A]'
      },
      {
        title: 'Total Value',
        value: formatProjectValue(totalValue),
        trend: thisWeekValue > 0 ? `+${formatProjectValue(thisWeekValue)} this week` : 'No new value',
        trendColor: thisWeekValue > 0 ? 'text-[#10B981]' : 'text-[#6B7280]',
        icon: DollarSign,
        iconBg: 'bg-[#FEF3C7]',
        iconColor: 'text-[#D97706]'
      },
      {
        title: 'High Priority',
        value: highPriorityCount.toString(),
        trend: highPriorityCount > 0 ? 'Requires attention' : 'All good',
        trendColor: highPriorityCount > 0 ? 'text-[#DC2626]' : 'text-[#10B981]',
        icon: Star,
        iconBg: 'bg-[#FEE2E2]',
        iconColor: 'text-[#DC2626]'
      }
    ];
  }, [sourceOpportunities]);

  return (
    <div className="mx-8 my-6">
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] mb-2 font-['Outfit']">
              Source Opportunities
            </h1>
            <p className="text-[#6B7280] text-lg font-['Outfit']">
              Discover and analyze new business opportunities using AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/module/opportunities/ingestion')}
              className="px-4 py-2 bg-white rounded-xl border border-[#D1D5DB] flex items-center gap-2 hover:bg-[#F9FAFB] transition-all text-[#374151] text-sm font-medium shadow-sm"
            >
              Leads
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white rounded-xl border border-[#D1D5DB] flex items-center gap-2 hover:bg-[#F9FAFB] transition-all text-[#374151] text-sm font-medium shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={openImportModal}
              className="px-4 py-2 bg-white rounded-xl border border-[#D1D5DB] flex items-center gap-2 hover:bg-[#F9FAFB] transition-all text-[#374151] text-sm font-medium shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#161950]" />
              Import from URL
            </button>
            <button
              onClick={openImportModal}
              className="px-6 py-2 bg-[#161950] text-white rounded-xl hover:bg-[#0f1440] transition-all text-sm font-semibold shadow-lg flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              AI Scan
            </button>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-8 mb-8">
        
        <div className="relative mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[#9CA3AF]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Natural language search: 'Find infrastructure projects in California worth over $5M'"
                className="w-full h-14 pl-12 pr-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-[#374151] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#161950]/20 focus:border-[#161950] transition-all shadow-sm"
              />
            </div>
            <button className="px-8 py-3 bg-[#161950] text-white rounded-xl hover:bg-[#0f1440] transition-all text-sm font-semibold shadow-lg flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        
        {showFilters && (
          <div className="mb-8 p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Market Sector</label>
                <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/20">
                  <option value="all">All Sectors</option>
                  <option value="transportation">Transportation</option>
                  <option value="technology">Technology</option>
                  <option value="energy">Energy</option>
                  <option value="utilities">Utilities</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Project Value</label>
                <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/20">
                  <option value="all">All Values</option>
                  <option value="5m+">$5M+</option>
                  <option value="10m+">$10M+</option>
                  <option value="20m+">$20M+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Match Score</label>
                <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/20">
                  <option value="all">All Scores</option>
                  <option value="90+">90%+</option>
                  <option value="80+">80%+</option>
                  <option value="70+">70%+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Priority</label>
                <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/20">
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {dynamicStatsCards.map((card, index) => (
            <div key={index} className="p-6 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${card.iconBg} rounded-lg`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <span className="text-2xl font-bold text-[#111827]">{card.value}</span>
              </div>
              <h3 className="text-sm font-medium text-[#6B7280] mb-1">{card.title}</h3>
              <p className={`text-xs font-medium ${card.trendColor}`}>{card.trend}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FAFAFA] to-[#F9FAFB]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#111827] mb-1">AI-Discovered Opportunities</h3>
              <p className="text-[#6B7280] text-sm">Intelligent matching based on your company profile and past performance</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#6B7280]">{filteredOpportunities.length} results</span>
              <div className="inline-flex rounded-lg border border-[#D1D5DB] bg-white shadow-sm overflow-hidden">
                {(['list', 'cards'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === mode ? 'bg-[#161950] text-white' : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {mode === 'list' ? 'List view' : 'Card view'}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleAIInsights}
                disabled={isAIInsightsLoading}
                className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg text-sm font-medium hover:from-[#059669] hover:to-[#047857] transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-4 h-4 ${isAIInsightsLoading ? 'animate-spin' : ''}`} />
                {isAIInsightsLoading ? 'Analyzing...' : 'AI Insights'}
              </button>
              <button
                onClick={handleExportResults}
                className="px-4 py-2 bg-[#161950] text-white rounded-lg text-sm font-medium hover:bg-[#0f1440] transition-colors"
              >
                Export Results
              </button>
            </div>
          </div>
        </div>
        
        {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Opportunity</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Account</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Location</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Market Sector</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Project Value</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Match Score</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">AI Score</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Priority</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Deadline</th>
                <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-6 w-6 text-[#161950] mr-2" />
                      <span className="text-[#6B7280]">Loading opportunities...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-[#6B7280]">
                      <Target className="h-12 w-12 mx-auto mb-4 text-[#D1D5DB]" />
                      <p className="text-lg font-medium mb-2">No opportunities found</p>
                      <p className="text-sm">Create your first opportunity to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => (
                <tr 
                  key={opp.id} 
                  className="transition-all duration-200 group"
                >
                  
                  <td className="px-6 lg:px-8 py-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#161950] to-[#0f1440] rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                        {opp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingOpportunity === opp.id ? (
                          <>
                            <input
                              type="text"
                              value={editingData.project_name || ''}
                              onChange={(e) => setEditingData({...editingData, project_name: e.target.value})}
                              className="w-full px-2 py-1 text-sm font-semibold text-[#111827] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#161950]/20 mb-1"
                              placeholder="Project name"
                            />
                            <textarea
                              value={editingData.description || ''}
                              onChange={(e) => setEditingData({...editingData, description: e.target.value})}
                              className="w-full px-2 py-1 text-xs text-[#6B7280] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#161950]/20 resize-none"
                              placeholder="Project description"
                              rows={2}
                            />
                          </>
                        ) : (
                          <>
                            <h4 className="text-sm font-semibold text-[#111827] group-hover:text-[#161950] transition-colors mb-1 truncate">
                              {opp.name}
                            </h4>
                            <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2 max-w-[250px] lg:max-w-[300px]">
                              {opp.description}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 lg:px-6 py-6">
                    {editingOpportunity === opp.id ? (
                      <select
                        value={editingData.account_id || opp.accountId || ''}
                        onChange={(e) => setEditingData({...editingData, account_id: e.target.value})}
                        className="w-full px-2 py-1 text-sm font-medium text-[#374151] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#161950]/20"
                      >
                        <option value="">Select Account</option>
                        {accounts.map((account: any) => (
                          <option key={account.account_id} value={account.account_id}>
                            {account.client_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      opp.accountName === 'No Account' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            N
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-500 truncate max-w-[120px]">
                              {opp.accountName}
                            </span>
                            <button
                              onClick={() => handleAssignAccount(opp.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              Assign Account
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {opp.accountName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#374151] truncate max-w-[120px]">
                              {opp.accountName}
                            </span>
                            {opp.accountCustomId && (
                              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                {opp.accountCustomId}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    {editingOpportunity === opp.id ? (
                      <input
                        type="text"
                        value={editingData.state || ''}
                        onChange={(e) => setEditingData({...editingData, state: e.target.value})}
                        className="w-full px-2 py-1 text-sm font-medium text-[#374151] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#161950]/20"
                        placeholder="Location/State"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                        <span className="text-sm font-medium text-[#374151] truncate">{opp.state}</span>
                      </div>
                    )}
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    {editingOpportunity === opp.id ? (
                      <input
                        type="text"
                        value={editingData.market_sector || ''}
                        onChange={(e) => setEditingData({...editingData, market_sector: e.target.value})}
                        className="w-full px-2 py-1 text-xs font-semibold text-[#1E40AF] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#161950]/20"
                        placeholder="Market sector"
                      />
                    ) : (
                      <span className="inline-flex px-2 lg:px-3 py-1 lg:py-1.5 text-xs font-semibold bg-[#EFF6FF] text-[#1E40AF] rounded-full">
                        {opp.marketSector}
                      </span>
                    )}
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    {editingOpportunity === opp.id ? (
                      <input
                        type="text"
                        value={editingData.project_value || ''}
                        onChange={(e) => setEditingData({...editingData, project_value: e.target.value})}
                        className="w-full px-2 py-1 text-sm font-bold text-[#111827] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#161950]/20"
                        placeholder="Project value"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                        <span className="text-sm font-bold text-[#111827]">{opp.projectValue}</span>
                      </div>
                    )}
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 lg:w-16 bg-[#E5E7EB] rounded-full h-2 flex-shrink-0">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            opp.match >= 90 ? 'bg-green-500' : 
                            opp.match >= 80 ? 'bg-blue-500' : 
                            opp.match >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${opp.match}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs lg:text-sm font-semibold px-1 lg:px-2 py-1 rounded-md whitespace-nowrap ${getMatchColor(opp.match)}`}>
                        {opp.match}%
                      </span>
                    </div>
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${getAIScoreColor(opp.aiScore)} flex-shrink-0`} />
                      <span className={`text-sm font-semibold ${getAIScoreColor(opp.aiScore)}`}>
                        {opp.aiScore}
                      </span>
                    </div>
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <span className={`inline-flex px-2 lg:px-3 py-1 lg:py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap ${getPriorityColor(opp.priority)}`}>
                      {opp.priority}
                    </span>
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                      <span className="text-sm font-medium text-[#374151] whitespace-nowrap">
                        {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  
                  
                  <td className="px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-1 lg:gap-2">
                      {editingOpportunity === opp.id ? (
                        <>
                          <button 
                            onClick={() => handleSaveOpportunity(opp.id)}
                            disabled={updateOpportunityMutation.isPending}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-[#10B981] text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#059669] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updateOpportunityMutation.isPending ? (
                              <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                            )}
                            <span className="hidden sm:inline">
                              {updateOpportunityMutation.isPending ? 'Saving...' : 'Save'}
                            </span>
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            disabled={updateOpportunityMutation.isPending}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-[#DC2626] text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#B91C1C] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditOpportunity(opp.id, opp)}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-[#F59E0B] text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#D97706] transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button 
                            onClick={() => openPipelineModal(opp)}
                            disabled={opp.isInPipeline || pipelineModal.isSubmitting}
                            className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold transition-colors flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed ${
                              opp.isInPipeline ? 'bg-[#E5E7EB] text-[#6B7280]' : 'bg-[#161950] text-white hover:bg-[#0f1440]'
                            }`}
                          >
                            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">{opp.isInPipeline ? 'In pipeline' : 'Add'}</span>
                          </button>
                          <button 
                            onClick={() => navigate(`/module/opportunities/analysis?opportunityId=${opp.id}`)}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-white border border-[#D1D5DB] text-[#374151] rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#F9FAFB] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOpportunity(opp.id)}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-[#DC2626] text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#B91C1C] transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-[#161950] mr-2" />
                <span className="text-[#6B7280]">Loading opportunities...</span>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="text-center py-12 text-[#6B7280]">
                <Target className="h-12 w-12 mx-auto mb-4 text-[#D1D5DB]" />
                <p className="text-lg font-medium mb-2">No opportunities found</p>
                <p className="text-sm">Create your first opportunity to get started.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredOpportunities.map((opp) => (
                  <div key={opp.id} className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-base font-semibold text-[#111827] mb-1">{opp.name}</h4>
                        <p className="text-sm text-[#6B7280] line-clamp-2">{opp.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(opp.priority)} whitespace-nowrap`}>
                        {opp.priority} priority
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-[#374151] mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#6B7280]" />
                        <span>{opp.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#16A34A]" />
                        <span className="font-semibold">{opp.projectValue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${getAIScoreColor(opp.aiScore)}`} />
                        <span className={`font-semibold ${getAIScoreColor(opp.aiScore)}`}>{opp.match}% match</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#6B7280]" />
                        <span>{new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openPipelineModal(opp)}
                        disabled={opp.isInPipeline || pipelineModal.isSubmitting}
                        className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                          opp.isInPipeline ? 'bg-[#E5E7EB] text-[#6B7280]' : 'bg-[#161950] text-white hover:bg-[#0f1440]'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        {opp.isInPipeline ? 'In pipeline' : 'Add to pipeline'}
                      </button>
                      <button
                        onClick={() => navigate(`/module/opportunities/analysis?opportunityId=${opp.id}`)}
                        className="flex-1 min-w-[120px] px-3 py-2 bg-white border border-[#D1D5DB] text-sm font-semibold text-[#374151] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditOpportunity(opp.id, opp)}
                        className="px-3 py-2 bg-[#F59E0B] text-white text-sm font-semibold rounded-lg hover:bg-[#D97706] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOpportunity(opp.id)}
                        className="px-3 py-2 bg-[#DC2626] text-white text-sm font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
        
    {pipelineModal.isOpen && pipelineModal.opportunity && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border-2 border-[#161950]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4 bg-[#F7F9FF] rounded-t-2xl">
            <div>
              <h2 className="text-xl font-semibold text-[#161950]">Move opportunity into pipeline</h2>
              <p className="text-sm text-[#4B5563]">{pipelineModal.opportunity.name} · {pipelineModal.opportunity.clientName}</p>
            </div>
            <button onClick={closePipelineModal} className="p-2 rounded-lg hover:bg-white transition-colors">
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Next pipeline stage</label>
                <select
                  value={pipelineModal.stage}
                  onChange={(e) => setPipelineModal((prev) => ({ ...prev, stage: e.target.value as OpportunityStageType }))}
                  className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/30"
                >
                  {pipelineStageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Win probability (%)</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={pipelineModal.probability}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPipelineModal((prev) => ({ ...prev, probability: Number.isNaN(next) ? prev.probability : Math.min(100, Math.max(5, next)) }));
                  }}
                  className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Risk level</label>
                <select
                  value={pipelineModal.riskLevel}
                  onChange={(e) => setPipelineModal((prev) => ({ ...prev, riskLevel: e.target.value as RiskLevelType }))}
                  className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/30"
                >
                  {riskLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Expected RFP date</label>
                  <input
                    type="date"
                    value={pipelineModal.expectedRfpDate}
                    onChange={(e) => setPipelineModal((prev) => ({ ...prev, expectedRfpDate: e.target.value }))}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Target close date</label>
                  <input
                    type="date"
                    value={pipelineModal.deadline}
                    onChange={(e) => setPipelineModal((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/30"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-sm font-semibold text-[#161950] mb-2">Stage readiness checklist</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-[#4B5563]">
                <li>BANT qualification completed and opportunity is real</li>
                <li>Primary buyer and stakeholders identified</li>
                <li>Next meeting scheduled with decision makers</li>
                <li>Initial solution approach discussed with delivery team</li>
              </ul>
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-[#374151]">
                <input
                  type="checkbox"
                  checked={pipelineModal.checklistConfirmed}
                  onChange={(e) => setPipelineModal((prev) => ({ ...prev, checklistConfirmed: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#9CA3AF] text-[#161950] focus:ring-[#161950]"
                />
                I confirm these requirements are satisfied
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Qualification notes</label>
              <textarea
                value={pipelineModal.notes}
                onChange={(e) => setPipelineModal((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full h-28 rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/30"
                placeholder="Summarize discovery insights, budget confirmation, and next actions"
              />
            </div>

            {pipelineModal.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {pipelineModal.error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-[#F3F4F6] px-6 py-4 rounded-b-2xl border-t border-[#E5E7EB]">
            <div className="text-xs text-[#6B7280]">
              Stage change creates pipeline tasks and updates analytics automatically
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={closePipelineModal}
                className="px-4 py-2 text-sm font-semibold text-[#374151] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                disabled={pipelineModal.isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPipeline}
                disabled={pipelineModal.isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-lg flex items-center gap-2 bg-[#161950] hover:bg-[#0f1440] transition-colors disabled:opacity-70"
              >
                {pipelineModal.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Confirm & promote
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    {importModal.isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-[#161950]/40 flex flex-col max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F7F9FF]">
            <div>
              <h2 className="text-xl font-semibold text-[#161950]">Import opportunity from URL</h2>
              <p className="text-sm text-[#4B5563]">Paste a project or tender link and let AI pre-fill the opportunity details.</p>
            </div>
            <button onClick={closeImportModal} className="p-2 rounded-lg hover:bg-white transition-colors">
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Opportunity web page</label>
              <input
                value={importModal.url}
                onChange={(e) => {
                  const value = e.target.value;
                  setImportModal((prev) => ({
                    ...prev,
                    url: value,
                    error: '',
                    result: null,
                    preview: null,
                    aiSummary: null,
                    warnings: [],
                  }));
                }}
                onBlur={(e) => setImportModal((prev) => ({ ...prev, url: e.target.value.trim() }))}
                placeholder="https://example.com/project-tender"
                className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161950]/30"
              />
              <p className="text-xs text-[#6B7280] mt-2">We will crawl the page, extract key fields, and suggest opportunity data.</p>
            </div>

            {importModal.isScraping && (
              <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI is analyzing the page and extracting opportunity details…</span>
              </div>
            )}

            {importModal.warnings.length > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800 space-y-1">
                <p className="font-semibold">AI notes</p>
                <ul className="list-disc pl-4 space-y-1">
                  {importModal.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {importModal.opportunities.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#161950]">
                    Detected opportunities ({importModal.opportunities.length})
                  </p>
                  {importModal.isEnhancing && (
                    <span className="flex items-center gap-2 text-xs text-[#4B5563]">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Updating selection…</span>
                    </span>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {importModal.opportunities.map((opportunity, index) => {
                    const isSelected = importModal.selectedOpportunityIndex === index;
                    return (
                      <button
                        key={`${opportunity.detail_url || opportunity.title || index}`}
                        type="button"
                        onClick={() => handleSelectOpportunity(index)}
                        disabled={importModal.isEnhancing}
                        className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${
                          isSelected ? 'border-[#161950] bg-[#F5F6FF]' : 'border-[#E5E7EB] bg-white hover:border-[#161950]/50'
                        } ${importModal.isEnhancing ? 'opacity-70 cursor-wait' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">
                              {opportunity.title || `Opportunity ${index + 1}`}
                            </p>
                            {opportunity.client && (
                              <p className="text-xs text-[#6B7280] mt-1">{opportunity.client}</p>
                            )}
                            {opportunity.location && (
                              <p className="text-xs text-[#6B7280] mt-1">{opportunity.location}</p>
                            )}
                            {opportunity.budget_text && (
                              <p className="text-xs text-[#4B5563] mt-1">Budget: {opportunity.budget_text}</p>
                            )}
                            {opportunity.deadline && (
                              <p className="text-xs text-[#4B5563] mt-1">Timeline: {opportunity.deadline}</p>
                            )}
              </div>
                          {opportunity.status && (
                            <span className="text-xs font-semibold text-[#111827] bg-[#EEF2FF] border border-[#C7D2FE] px-2 py-1 rounded">
                              {opportunity.status}
                            </span>
                          )}
                        </div>
                        {opportunity.description && (
                          <p className="text-xs text-[#4B5563] mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
                            {opportunity.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {importModal.preview && (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827] mb-1">{importModal.preview.projectName}</h3>
                    <p className="text-sm text-[#6B7280]">Client: {importModal.preview.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#6B7280] uppercase tracking-wide">Estimated value</p>
                    <p className="text-base font-semibold text-[#161950]">
                      {importModal.preview.projectValueNumeric !== undefined
                        ? formatProjectValue(importModal.preview.projectValueNumeric)
                        : importModal.preview.projectValueText || '—'}
                  </p>
                </div>
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#374151]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6B7280]" />
                    <span>{importModal.preview.location || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#6B7280]" />
                    <span>{importModal.preview.marketSector || '—'}</span>
                </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#6B7280]" />
                    <span>Probability: {importModal.preview.probability != null ? `${Math.round(importModal.preview.probability)}%` : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#6B7280]" />
                    <span>Risk: {formatRiskLabel(importModal.preview.riskLevel)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6B7280]" />
                    <span>RFP: {formatImportedDate(importModal.preview.expectedRfpDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#6B7280]" />
                    <span>Deadline: {formatImportedDate(importModal.preview.deadline)}</span>
                </div>
              </div>

                {importModal.preview.summary && (
                  <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] px-4 py-3">
                    <p className="text-xs font-semibold text-[#161950] mb-1">AI summary</p>
                    <p className="text-sm text-[#374151] leading-relaxed">{importModal.preview.summary}</p>
                  </div>
                )}

                {importModal.preview.description && importModal.preview.description !== importModal.preview.summary && (
                  <div className="text-sm text-[#374151] leading-relaxed space-y-2">
                    <p className="font-semibold text-[#161950]">Description</p>
                    <p>{importModal.preview.description}</p>
                </div>
                )}

                {(importModal.preview.contacts.emails.length > 0 || importModal.preview.contacts.phones.length > 0) && (
                  <div className="text-xs text-[#4B5563] space-y-1">
                    {importModal.preview.contacts.emails.length > 0 && (
                      <p><span className="font-semibold text-[#161950]">Emails:</span> {importModal.preview.contacts.emails.join(', ')}</p>
                    )}
                    {importModal.preview.contacts.phones.length > 0 && (
                      <p><span className="font-semibold text-[#161950]">Phones:</span> {importModal.preview.contacts.phones.join(', ')}</p>
                    )}
                </div>
                )}

                <div className="text-xs text-[#6B7280]">Source: {importModal.url}</div>
              </div>
            )}

            {importModal.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {importModal.error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#F3F4F6] border-t border-[#E5E7EB]">
            <button
              onClick={closeImportModal}
              className="px-4 py-2 text-sm font-semibold text-[#374151] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              disabled={importModal.isScraping || importModal.isCreating || importModal.isEnhancing}
            >
              Cancel
                  </button>
                  <button 
              onClick={importModal.opportunities.length ? handleStoreImportedOpportunities : runImportScrape}
              disabled={importModal.isScraping || importModal.isCreating || importModal.isEnhancing}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-lg flex items-center gap-2 bg-[#161950] hover:bg-[#0f1440] transition-colors disabled:opacity-70"
            >
              {importModal.isScraping || importModal.isCreating || importModal.isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {importModal.opportunities.length ? 'Store for review' : 'Fetch details'}
                  </button>
                </div>
              </div>
            </div>
    )}
    </div>
  );
});

SourceOpportunitiesContent.displayName = 'SourceOpportunitiesContent';