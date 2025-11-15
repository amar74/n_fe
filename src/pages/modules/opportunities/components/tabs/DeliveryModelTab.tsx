import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  Layers,
  CalendarClock,
  DollarSign,
  Loader2,
  ExternalLink,
  RotateCcw,
  NotebookPen,
  Save,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  useOpportunityDeliveryModel,
  useUpdateOpportunityDeliveryModel,
} from '@/hooks/useOpportunityTabs';
import { useDeliveryModelTemplates } from '@/hooks/useDeliveryModels';
import type {
  DeliveryModelData,
  DeliveryModelEntry,
  DeliveryModelPhase,
} from '@/types/opportunityTabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DeliveryModelTabProps {
  opportunity: any;
}

type DeliveryModelPhaseState = DeliveryModelPhase;
type DeliveryModelState = DeliveryModelEntry & {
  phases: DeliveryModelPhaseState[];
  templateId?: string | null;
};

const statusBadgeStyles: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-600',
  'In progress': 'bg-amber-50 text-amber-600',
  'On-going': 'bg-amber-50 text-amber-600',
  Pending: 'bg-gray-100 text-gray-500',
  'Not Started': 'bg-gray-100 text-gray-500',
  'At Risk': 'bg-red-100 text-red-600',
  Delayed: 'bg-red-100 text-red-600',
};

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 12);

const formatCurrency = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
};

const toNullableString = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const DeliveryModelTab = memo(({ opportunity }: DeliveryModelTabProps) => {
  const opportunityId = opportunity?.id || '';
  const { data: deliveryModel, isLoading, refetch } = useOpportunityDeliveryModel(opportunityId);
  const updateDeliveryModelMutation = useUpdateOpportunityDeliveryModel(opportunityId);
  const {
    data: templateCatalog = [],
    refetch: refetchTemplates,
  } = useDeliveryModelTemplates();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [models, setModels] = useState<DeliveryModelState[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [identifiedGaps, setIdentifiedGaps] = useState<string[]>([]);
  const [newGap, setNewGap] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingGaps, setIsSavingGaps] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const computeTotalBudget = useCallback(
    (phases: DeliveryModelPhaseState[]) =>
      phases.reduce((sum, phase) => sum + (phase.budget ?? 0), 0),
    [],
  );

  const normalizePhase = useCallback(
    (phase: DeliveryModelPhase, index: number, fallbackModelId: string): DeliveryModelPhaseState => {
      const phaseId = phase?.phase_id || `${fallbackModelId}-phase-${index}`;
      const budget =
        typeof phase?.budget === 'number'
          ? phase.budget
          : phase?.budget != null
          ? Number(phase.budget)
          : null;

      const responsible = (phase as unknown as { responsible?: string }).responsible;

      return {
        phase_id: phaseId,
        name: phase?.name ?? '',
        status: phase?.status ?? '',
        duration: phase?.duration ?? '',
        budget: Number.isFinite(budget) ? (budget as number) : null,
        updated_by: phase?.updated_by ?? (typeof responsible === 'string' ? responsible : ''),
        description: phase?.description ?? '',
        last_updated: phase?.last_updated ?? null,
      };
    },
    [],
  );

  const serializePhaseForTemplate = useCallback(
    (phase: DeliveryModelPhaseState) => ({
      phase_id: phase.phase_id,
      name: phase.name,
      status: phase.status ? phase.status : null,
      duration: phase.duration ? phase.duration : null,
      budget: phase.budget ?? null,
      updated_by: toNullableString(phase.updated_by),
      description: toNullableString(phase.description),
      last_updated: phase.last_updated ?? new Date().toISOString(),
    }),
    [],
  );

  const initializeFromResponse = useCallback(
    (response?: DeliveryModelData | null) => {
      if (!response) {
        setModels([]);
        setActiveModelId(null);
        setIdentifiedGaps([]);
        return { models: [] as DeliveryModelState[], activeId: null as string | null };
      }

      const incomingModels =
        Array.isArray(response.models) && response.models.length > 0 ? response.models : null;

      let normalizedModels: DeliveryModelState[] =
        incomingModels?.map((model) => {
          const modelId = model.model_id || createId();
          const normalizedPhases = (model.phases || []).map((phase, index) =>
            normalizePhase(phase, index, modelId),
          );
          const total_budget =
            model.total_budget != null
              ? Number(model.total_budget)
              : computeTotalBudget(normalizedPhases);
        const templateId =
          (model as { template_id?: string | null }).template_id ??
          (model as { templateId?: string | null }).templateId ??
          null;

        return {
            model_id: modelId,
            approach: model.approach ?? '',
            phases: normalizedPhases,
            is_active: model.is_active ?? response.active_model_id === modelId,
            total_budget,
            notes: model.notes ?? '',
            updated_by: model.updated_by ?? '',
            last_updated: model.last_updated ?? null,
          templateId,
          };
        }) ?? [];

      if (!normalizedModels.length) {
        const fallbackModelId = createId();
        const fallbackPhases = (response.key_phases || []).map((phase, index) =>
          normalizePhase(phase, index, fallbackModelId),
        );
        normalizedModels = [
          {
            model_id: fallbackModelId,
            approach: response.approach ?? '',
            phases: fallbackPhases,
            is_active: true,
            total_budget: computeTotalBudget(fallbackPhases),
            notes: '',
            updated_by: '',
            last_updated: null,
            templateId: null,
          },
        ];
      }

      const active =
        normalizedModels.find((model) => model.is_active) ?? normalizedModels[0] ?? null;

      normalizedModels = normalizedModels.map((model) => ({
        ...model,
        is_active: active ? model.model_id === active.model_id : model.is_active,
      }));

      setModels(normalizedModels);
      setActiveModelId(active?.model_id ?? null);
      setIdentifiedGaps(response.identified_gaps ?? []);
      return { models: normalizedModels, activeId: active?.model_id ?? null };
    },
    [computeTotalBudget, normalizePhase],
  );

  useEffect(() => {
    if (!isLoading) {
      initializeFromResponse(deliveryModel);
    }
  }, [deliveryModel, initializeFromResponse, isLoading]);

  const handleOpenTemplateModal = () => {
    if (!templateCatalog.length) {
      toast({
        title: 'No templates available',
        description: 'Create a delivery model in the catalog before importing.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedTemplateId((prev) => {
      if (prev && templateCatalog.some((template) => template.id === prev)) {
        return prev;
      }
      return templateCatalog[0]?.id ?? null;
    });

    setTemplateModalOpen(true);
  };

  const handleSyncFromDeliveryModels = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [opportunityResult, templateResult] = await Promise.all([refetch(), refetchTemplates()]);
      const latestOpportunity = opportunityResult.data ?? deliveryModel ?? null;
      const latestTemplates = templateResult.data ?? templateCatalog;

      if (!latestOpportunity) {
        toast({
          title: 'Unable to sync delivery model',
          description: 'No delivery model data found for this opportunity.',
          variant: 'destructive',
        });
        return;
      }

      const { models: baselineModels, activeId: baselineActiveId } = initializeFromResponse(
        latestOpportunity,
      );

      if (!baselineModels.length) {
        toast({
          title: 'Delivery model synced',
          description: 'Latest changes from the Delivery Models catalog are now reflected.',
        });
        return;
      }

      const now = new Date().toISOString();
      let updated = false;
      const syncedModels = baselineModels.map((model) => {
        if (!model.templateId) {
          return model;
        }
        const template = latestTemplates?.find((item) => item.id === model.templateId);
        if (!template) {
          return model;
        }

        const templatePhases = template.phases.map((phase, index) =>
          normalizePhase(
            {
              phase_id: phase.phase_id,
              name: phase.name,
              status: phase.status ?? '',
              duration: phase.duration ?? '',
              budget: phase.budget ?? null,
              updated_by: phase.updated_by ?? '',
              description: phase.description ?? '',
              last_updated: phase.last_updated ?? null,
            },
            index,
            model.model_id,
          ),
        );

        const hasDifference =
          JSON.stringify(templatePhases) !== JSON.stringify(model.phases);

        if (!hasDifference) {
          return model;
        }

        updated = true;
        return {
          ...model,
          phases: templatePhases,
          total_budget: computeTotalBudget(templatePhases),
          last_updated: now,
        };
      });

      if (!updated) {
        toast({
          title: 'Delivery model synced',
          description: 'Opportunity delivery model already reflects the latest template phases.',
        });
        return;
      }

      const sanitizedGaps = (latestOpportunity.identified_gaps ?? [])
        .map((gap) => gap.trim())
        .filter(Boolean);

      const serializedModels = syncedModels.map((model) => ({
        model_id: model.model_id,
        approach: (model.approach ?? '').trim(),
        phases: model.phases.map((phase) => ({
          ...phase,
          budget: phase.budget,
          updated_by: toNullableString(phase.updated_by),
          description: toNullableString(phase.description),
          last_updated: phase.last_updated ?? now,
        })),
        is_active: model.model_id === baselineActiveId,
        total_budget: computeTotalBudget(model.phases),
        notes: toNullableString(model.notes),
        updated_by: toNullableString(model.updated_by),
        last_updated: model.last_updated ?? now,
        template_id: model.templateId ?? null,
      }));

      const activeEntry =
        serializedModels.find((model) => model.is_active) ?? serializedModels[0] ?? null;

      await updateDeliveryModelMutation.mutateAsync({
        models: serializedModels,
        identified_gaps: sanitizedGaps,
        approach: activeEntry?.approach ?? '',
        key_phases: activeEntry?.phases ?? [],
      });

      const refreshedResult = await refetch();
      initializeFromResponse(refreshedResult.data ?? latestOpportunity ?? null);
      toast({
        title: 'Delivery model synced',
        description: 'Latest template phases have been applied to this opportunity.',
      });
    } catch (error: any) {
      toast({
        title: 'Unable to sync delivery model',
        description: error?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [
    computeTotalBudget,
    deliveryModel,
    initializeFromResponse,
    normalizePhase,
    refetch,
    refetchTemplates,
    templateCatalog,
    toast,
    updateDeliveryModelMutation,
  ]);

  const handleImportTemplate = useCallback(async () => {
    if (!selectedTemplateId) {
      setTemplateModalOpen(false);
      return;
    }

    const template = templateCatalog.find((item) => item.id === selectedTemplateId);
    if (!template) {
      setTemplateModalOpen(false);
      return;
    }

    setIsImporting(true);
    try {
      const opportunityResult = await refetch();
      const latestOpportunity = opportunityResult.data ?? deliveryModel ?? null;
      const templateResult = await refetchTemplates();
      const latestTemplates = templateResult.data ?? templateCatalog;
      const resolvedTemplate =
        latestTemplates?.find((item) => item.id === template.id) ?? template;

      const { models: baselineModels } = initializeFromResponse(latestOpportunity);
      const now = new Date().toISOString();
      const modelId = createId();

      const templatePhases = resolvedTemplate.phases.map((phase, index) =>
        normalizePhase(
          {
            phase_id: phase.phase_id,
            name: phase.name,
            status: phase.status ?? '',
            duration: phase.duration ?? '',
            budget: phase.budget ?? null,
            updated_by: phase.updated_by ?? '',
            description: phase.description ?? '',
            last_updated: phase.last_updated ?? null,
          },
          index,
          modelId,
        ),
      );

      const mergedModels: DeliveryModelState[] = [
        ...baselineModels.map((model) => ({
          ...model,
          is_active: false,
        })),
        {
          model_id: modelId,
          approach: resolvedTemplate.approach,
          phases: templatePhases,
          is_active: true,
          total_budget: computeTotalBudget(templatePhases),
          notes: resolvedTemplate.notes ?? '',
          updated_by: '',
          last_updated: now,
          templateId: resolvedTemplate.id,
        },
      ];

      const sanitizedGaps = (latestOpportunity?.identified_gaps ?? [])
        .map((gap) => gap.trim())
        .filter(Boolean);

      const serializedModels = mergedModels.map((model) => ({
        model_id: model.model_id,
        approach: (model.approach ?? '').trim(),
        phases: model.phases.map((phase) => ({
          ...phase,
          budget: phase.budget,
          updated_by: toNullableString(phase.updated_by),
          description: toNullableString(phase.description),
          last_updated: phase.last_updated ?? now,
        })),
        is_active: model.is_active,
        total_budget: computeTotalBudget(model.phases),
        notes: toNullableString(model.notes),
        updated_by: toNullableString(model.updated_by),
        last_updated: model.last_updated ?? now,
        template_id: model.templateId ?? null,
      }));

      const activeEntry =
        serializedModels.find((model) => model.is_active) ?? serializedModels[0] ?? null;

      await updateDeliveryModelMutation.mutateAsync({
        models: serializedModels,
        identified_gaps: sanitizedGaps,
        approach: activeEntry?.approach ?? '',
        key_phases: activeEntry?.phases ?? [],
      });

      const refreshedResult = await refetch();
      initializeFromResponse(refreshedResult.data ?? latestOpportunity ?? null);

      toast({
        title: 'Template imported',
        description: `${resolvedTemplate.approach} is now linked to this opportunity.`,
      });
      setTemplateModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Unable to import template',
        description: error?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  }, [
    computeTotalBudget,
    deliveryModel,
    initializeFromResponse,
    normalizePhase,
    refetch,
    refetchTemplates,
    selectedTemplateId,
    templateCatalog,
    toast,
    updateDeliveryModelMutation,
  ]);

  const activeModel = useMemo(
    () => models.find((model) => model.model_id === activeModelId) ?? null,
    [models, activeModelId],
  );

  const linkedTemplate = useMemo(() => {
    if (!activeModel?.templateId) return null;
    return templateCatalog.find((item) => item.id === activeModel.templateId) ?? null;
  }, [activeModel?.templateId, templateCatalog]);

  const handleSaveGaps = useCallback(async () => {
    if (!models.length) {
      toast({
        title: 'No delivery model available',
        description: 'Sync a delivery model before saving notes.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingGaps(true);
    const sanitizedGaps = identifiedGaps.map((gap) => gap.trim()).filter(Boolean);
    const now = new Date().toISOString();

    const serializedModels = models.map((model) => ({
      model_id: model.model_id,
      approach: (model.approach ?? '').trim(),
      phases: model.phases.map((phase) => ({
        ...phase,
        budget: phase.budget,
        updated_by: toNullableString(phase.updated_by),
        description: toNullableString(phase.description),
        last_updated: phase.last_updated ?? now,
      })),
      is_active: model.is_active,
      total_budget: computeTotalBudget(model.phases),
      notes: toNullableString(model.notes),
      updated_by: toNullableString(model.updated_by),
      last_updated: model.last_updated ?? now,
      template_id: model.templateId ?? null,
    }));

    const activeEntry =
      serializedModels.find((model) => model.is_active) ?? serializedModels[0] ?? null;

    try {
      await updateDeliveryModelMutation.mutateAsync({
        models: serializedModels,
        identified_gaps: sanitizedGaps,
        approach: activeEntry?.approach ?? '',
        key_phases: activeEntry?.phases ?? [],
      });
      toast({
        title: 'Notes saved',
        description: 'Gaps & implementation notes updated successfully.',
      });
      const refreshed = await refetch();
      initializeFromResponse(refreshed.data ?? deliveryModel ?? null);
    } catch (error: any) {
      toast({
        title: 'Unable to save notes',
        description: error?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingGaps(false);
    }
  }, [
    computeTotalBudget,
    deliveryModel,
    identifiedGaps,
    initializeFromResponse,
    models,
    refetch,
    toast,
    updateDeliveryModelMutation,
  ]);

  const handleAddGap = () => {
    const trimmed = newGap.trim();
    if (!trimmed) return;
    if (identifiedGaps.includes(trimmed)) {
      toast({
        title: 'Duplicate note',
        description: 'This note already exists.',
        variant: 'destructive',
      });
      return;
    }
    setIdentifiedGaps((prev) => [...prev, trimmed]);
    setNewGap('');
  };

  const handleRemoveGap = (index: number) => {
    setIdentifiedGaps((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDeleteModel = useCallback(
    async (modelId: string) => {
      if (!models.some((model) => model.model_id === modelId)) {
        return;
      }

      const remaining = models.filter((model) => model.model_id !== modelId);
      if (!remaining.length) {
        toast({
          title: 'Cannot remove delivery model',
          description: 'At least one delivery model must remain.',
          variant: 'destructive',
        });
        return;
      }

      const nextActiveId =
        remaining.find((model) => model.is_active)?.model_id ?? remaining[0].model_id;
      const now = new Date().toISOString();

      const serializedModels = remaining.map((model) => ({
        model_id: model.model_id,
        approach: (model.approach ?? '').trim(),
        phases: model.phases.map((phase) => ({
          ...phase,
          budget: phase.budget,
          updated_by: toNullableString(phase.updated_by),
          description: toNullableString(phase.description),
          last_updated: phase.last_updated ?? now,
        })),
        is_active: model.model_id === nextActiveId,
        total_budget: computeTotalBudget(model.phases),
        notes: toNullableString(model.notes),
        updated_by: toNullableString(model.updated_by),
        last_updated: model.last_updated ?? now,
        template_id: model.templateId ?? null,
      }));

      const activeEntry =
        serializedModels.find((model) => model.is_active) ?? serializedModels[0] ?? null;

      try {
        await updateDeliveryModelMutation.mutateAsync({
          models: serializedModels,
          identified_gaps: identifiedGaps.map((gap) => gap.trim()).filter(Boolean),
          approach: activeEntry?.approach ?? '',
          key_phases: activeEntry?.phases ?? [],
        });

        const refreshed = await refetch();
        initializeFromResponse(refreshed.data ?? deliveryModel ?? null);
        toast({
          title: 'Delivery model removed',
          description: 'The delivery model has been deleted from this opportunity.',
        });
      } catch (error: any) {
        toast({
          title: 'Unable to remove delivery model',
          description: error?.response?.data?.detail || 'Please try again.',
          variant: 'destructive',
        });
      }
    },
    [
      computeTotalBudget,
      deliveryModel,
      identifiedGaps,
      initializeFromResponse,
      models,
      refetch,
      toast,
      updateDeliveryModelMutation,
    ],
  );

  const handleSelectModel = (modelId: string) => {
    setActiveModelId(modelId);
  };

  const handleNavigateToTemplates = () => {
    if (!activeModel) {
      navigate('/module/delivery-models');
      return;
    }

    if (activeModel.templateId) {
      navigate(`/module/delivery-models?templateId=${activeModel.templateId}`);
      return;
    }

    navigate('/module/delivery-models');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="space-y-4 lg:col-span-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Delivery Models</p>
                <p className="text-xs text-gray-500">
                  Manage approaches and phase templates for this opportunity.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleOpenTemplateModal}
                className="bg-indigo-950 hover:bg-indigo-900"
                disabled={!templateCatalog.length || isImporting}
              >
                Import template
              </Button>
            </div>
            {templateCatalog.length === 0 && (
              <div className="mx-5 mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                No templates are available yet. Create delivery models from the Delivery Models module to sync them here.
              </div>
            )}
            <div className="space-y-3 p-5">
              {models.map((model) => (
                <div
                  key={model.model_id}
                  className={cn(
                    'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg',
                    model.model_id === activeModelId
                      ? 'border-[#161950] shadow-md ring-1 ring-[#161950]/30'
                      : '',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleSelectModel(model.model_id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          handleSelectModel(model.model_id);
                        }
                      }}
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {model.approach || 'Unnamed approach'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {model.phases.length} phase{model.phases.length === 1 ? '' : 's'} •{' '}
                        {formatCurrency(model.total_budget)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.is_active && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          Active template
                        </span>
                      )}
                      {!model.is_active && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteModel(model.model_id)}
                          className="text-gray-500 hover:text-red-600"
                          title="Remove delivery model"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!models.length && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  No delivery models are linked yet. Manage templates in the Delivery Models page and
                  use “Sync latest changes” to view them here.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-900">Gaps & implementation notes</p>
              <p className="text-xs text-gray-500">List one item per line.</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  value={newGap}
                  onChange={(event) => setNewGap(event.target.value)}
                  placeholder="Example: Need environmental permitting partner for phase 2"
                  className="sm:flex-1"
                />
                <Button type="button" onClick={handleAddGap} disabled={!newGap.trim()}>
                  Add note
                </Button>
              </div>
              {identifiedGaps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Saved notes
                  </p>
                  <ul className="space-y-2">
                    {identifiedGaps.map((gap, index) => (
                      <li
                        key={`${gap}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                      >
                        <span className="flex-1">{gap}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveGap(index)}
                          title="Remove note"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  Notes sync with the linked delivery model template.
                </span>
                <Button
                  onClick={handleSaveGaps}
                  disabled={isSavingGaps}
                  className="gap-2 bg-[#161950] text-white hover:bg-[#101440]"
                >
                  {isSavingGaps ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save notes
            </Button>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-5 lg:col-span-8">
          {activeModel ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-lg shadow-indigo-50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Active delivery model</p>
                  <p className="text-xs text-gray-500">
                    Configure the approach details and define the implementation phases.
                  </p>
                  {linkedTemplate && (
                    <p className="text-xs font-medium text-indigo-600">
                      Linked template: {linkedTemplate.approach}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleNavigateToTemplates}
                    className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Manage in delivery models
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSyncFromDeliveryModels}
                    disabled={isSyncing}
                    className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {isSyncing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Sync latest changes
                  </Button>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#161950] shadow-sm shadow-indigo-100">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Approach name</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {(activeModel.approach ?? '').trim() || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#161950] shadow-sm shadow-indigo-100">
                        <Pencil className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Updated by</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {(activeModel.updated_by ?? '').trim() || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#161950] shadow-sm shadow-indigo-100">
                        <NotebookPen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Notes (internal)</p>
                        <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                          {(activeModel.notes ?? '').trim() || 'No internal notes have been added yet.'}
                        </p>
                      </div>
                    </div>
          </div>
        </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                    <p className="text-sm font-semibold text-gray-900">Phases</p>
                    <p className="text-xs text-gray-500">
                      Track progress, budget, and responsible teams for each phase.
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>
                        {activeModel.phases.length} phase{activeModel.phases.length === 1 ? '' : 's'}
                      </span>
                      <span>
                        • Total budget{' '}
                        {formatCurrency(
                          activeModel.total_budget ?? computeTotalBudget(activeModel.phases),
                        )}
                      </span>
                    </div>
                  </div>
                <div className="flex flex-col items-start gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-end sm:text-right">
                  <span>Phases are managed from the Delivery Models catalog.</span>
                  <Button
                    variant="outline"
                    onClick={handleSyncFromDeliveryModels}
                    disabled={isSyncing}
                    className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {isSyncing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Sync latest changes
                  </Button>
              </div>
            </div>

                {activeModel.phases.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeModel.phases.map((phase) => (
                      <div
                        key={phase.phase_id}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                      <div className="flex items-start justify-between gap-3">
            <div>
                          <p className="text-sm font-semibold text-gray-900">{phase.name}</p>
                          {phase.duration && (
                            <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {phase.duration}
                            </p>
                          )}
                          {phase.updated_by && (
                            <p className="mt-1 text-xs text-gray-500">
                              Updated by <span className="font-medium text-gray-700">{phase.updated_by}</span>
                            </p>
                          )}
                        </div>
                        {phase.status && (
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-1 text-xs font-semibold',
                              statusBadgeStyles[phase.status] || 'bg-indigo-50 text-indigo-600',
                            )}
                          >
                            {phase.status}
                          </span>
                        )}
                      </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-gray-600">
                            <Layers className="h-3.5 w-3.5" />
                            {activeModel.phases.findIndex((p) => p.phase_id === phase.phase_id) + 1}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-green-600">
                            <DollarSign className="h-3.5 w-3.5" />
                            {formatCurrency(phase.budget)}
                          </span>
                      </div>
                        {phase.description && (
                          <p className="mt-3 text-sm text-gray-600">{phase.description}</p>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                  No phases available. Add phases from the Delivery Models page and sync to view them here.
                </div>
              )}
            </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-sm text-gray-500">
              Create a delivery model to begin tracking phases for this opportunity.
            </div>
          )}
        </section>
      </div>

      <Dialog open={templateModalOpen} onOpenChange={(open) => setTemplateModalOpen(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import delivery model</DialogTitle>
            <p className="text-sm text-gray-500">
              Copy a delivery model template from the catalog. Newly imported templates stay synced when you use
              “Sync latest changes”.
            </p>
          </DialogHeader>
          <div className="space-y-3">
            {templateCatalog.map((template) => {
              const totalBudget = template.phases.reduce(
                (sum, phase) => sum + (phase.budget ?? 0),
                0,
              );
              const isSelected = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={cn(
                    'w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md',
                    isSelected ? 'border-[#161950] ring-1 ring-[#161950]/30' : '',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{template.approach}</p>
                      {template.notes && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{template.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>{template.phases.length} phase{template.phases.length === 1 ? '' : 's'}</p>
                      <p className="font-semibold text-green-600">{formatCurrency(totalBudget)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setTemplateModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button
              onClick={handleImportTemplate}
              disabled={!selectedTemplateId || isImporting}
              className="gap-2 bg-indigo-950 hover:bg-indigo-900"
              type="button"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
              Import selected template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DeliveryModelTab.displayName = 'DeliveryModelTab';

export default DeliveryModelTab;