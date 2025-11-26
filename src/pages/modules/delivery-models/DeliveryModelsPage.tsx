import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  CalendarClock,
  DollarSign,
  Save,
  FilePlus2,
  NotebookPen,
  ClipboardList,
  Clock3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateDeliveryModelTemplate,
  useDeleteDeliveryModelTemplate,
  useDeliveryModelTemplates,
  useUpdateDeliveryModelTemplate,
} from '@/hooks/useDeliveryModels';
import type { DeliveryModelTemplate, DeliveryModelTemplatePhase } from '@/types/deliveryModels';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = ['Not Started', 'In progress', 'On-going', 'Completed', 'Delayed', 'At Risk'];

const statusStyles: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-600',
  'In progress': 'bg-amber-50 text-amber-600',
  'On-going': 'bg-amber-50 text-amber-600',
  'Not Started': 'bg-gray-100 text-gray-500',
  Delayed: 'bg-red-100 text-red-600',
  'At Risk': 'bg-red-100 text-red-600',
};

const createUuid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const normalizeUuid = (value?: string | null) =>
  value && uuidRegex.test(value) ? value : createUuid();

const formatCurrency = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

const normalizeTimestamp = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const sanitizeString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const sanitizeNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const sanitizePhase = (phase: DeliveryModelTemplatePhase): DeliveryModelTemplatePhase => ({
  ...phase,
  phase_id: normalizeUuid(phase.phase_id as unknown as string),
  name: sanitizeString(phase.name, 'Untitled phase'),
  status: sanitizeString(phase.status, '') || null,
  duration: sanitizeString(phase.duration, ''),
  budget: sanitizeNumber(phase.budget),
  updated_by: sanitizeString(phase.updated_by, ''),
  description: sanitizeString(phase.description, ''),
  last_updated: normalizeTimestamp(phase.last_updated) ?? new Date().toISOString(),
});

const sanitizeTemplate = (template: DeliveryModelTemplate): DeliveryModelTemplate => ({
  ...template,
  approach: sanitizeString(template.approach, 'Untitled delivery model'),
  notes: sanitizeString(template.notes, ''),
  phases: (template.phases ?? []).map(sanitizePhase),
});

const extractErrorMessage = (error: any): string => {
  const detail = error?.response?.data?.detail ?? error?.message ?? error;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.msg) return item.msg;
        return JSON.stringify(item);
      })
      .filter(Boolean);
    return msgs.join('; ') || 'An unexpected error occurred.';
  }
  if (typeof detail === 'object' && detail !== null) {
    if (detail.msg) return detail.msg;
    if (detail.error?.message) return detail.error.message;
    return JSON.stringify(detail);
  }
  return 'An unexpected error occurred.';
};

const preparePhasesForPayload = (
  phases: DeliveryModelTemplatePhase[],
): DeliveryModelTemplatePhase[] => phases.map(sanitizePhase);

type PhaseFormState = {
  name: string;
  status: string;
  duration: string;
  budget: string;
  updated_by: string;
  description: string;
};

const defaultPhaseForm: PhaseFormState = {
  name: '',
  status: STATUS_OPTIONS[0],
  duration: '',
  budget: '',
  updated_by: '',
  description: '',
};

const DeliveryModelsPage = () => {
  const location = useLocation();
  const { data: templates = [], isLoading } = useDeliveryModelTemplates();
  const normalizedTemplates = useMemo(
    () => templates.map((template) => sanitizeTemplate(template)),
    [templates],
  );
  const createTemplateMutation = useCreateDeliveryModelTemplate();
  const updateTemplateMutation = useUpdateDeliveryModelTemplate();
  const deleteTemplateMutation = useDeleteDeliveryModelTemplate();
  const { toast } = useToast();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoForm, setInfoForm] = useState({ approach: '', notes: '' });
  const [phaseModal, setPhaseModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    phaseId?: string;
  }>({ open: false, mode: 'create' });
  const [phaseForm, setPhaseForm] = useState<PhaseFormState>(defaultPhaseForm);
  const [isPhaseSubmitting, setIsPhaseSubmitting] = useState(false);
  const [isInfoSubmitting, setIsInfoSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!normalizedTemplates.length) {
      setSelectedTemplateId(null);
      return;
    }
    if (
      !selectedTemplateId ||
      !normalizedTemplates.some((item) => item.id === selectedTemplateId)
    ) {
      setSelectedTemplateId(normalizedTemplates[0].id);
    }
  }, [normalizedTemplates, isLoading, selectedTemplateId]);

  useEffect(() => {
    if (isLoading) return;
    const params = new URLSearchParams(location.search);
    const templateIdFromQuery = params.get('templateId');
    if (
      templateIdFromQuery &&
      normalizedTemplates.some((item) => item.id === templateIdFromQuery)
    ) {
      setSelectedTemplateId(templateIdFromQuery);
    }
  }, [isLoading, location.search, normalizedTemplates]);

  const selectedTemplate: DeliveryModelTemplate | null = useMemo(() => {
    if (!normalizedTemplates.length || !selectedTemplateId) return null;
    return normalizedTemplates.find((item) => item.id === selectedTemplateId) ?? null;
  }, [normalizedTemplates, selectedTemplateId]);

  useEffect(() => {
    if (!selectedTemplate) {
      setInfoForm({ approach: '', notes: '' });
      return;
    }
    setInfoForm({
      approach: sanitizeString(selectedTemplate.approach, ''),
      notes: sanitizeString(selectedTemplate.notes, ''),
    });
  }, [selectedTemplate]);

  const totalBudget = useMemo(() => {
    if (!selectedTemplate) return 0;
    return selectedTemplate.phases.reduce((sum, phase) => sum + (phase.budget ?? 0), 0);
  }, [selectedTemplate]);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
  };

  const handleCreateTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const approach = (formData.get('approach') as string)?.trim();
    const notes = (formData.get('notes') as string)?.trim();

    if (!approach) {
      toast({
        title: 'Approach is required',
        description: 'Provide a name for the delivery model template.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const template = await createTemplateMutation.mutateAsync({
        approach,
        notes: notes || undefined,
        phases: [],
      });
      setShowCreateModal(false);
      setSelectedTemplateId(template.id);
      toast({
        title: 'Delivery model created',
        description: `${template.approach} is ready for configuration.`,
      });
      event.currentTarget.reset();
    } catch (error: any) {
      toast({
        title: 'Failed to create template',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    const confirmed = window.confirm(
      'Delete this delivery model template? This action cannot be undone.',
    );
    if (!confirmed) return;

    try {
      await deleteTemplateMutation.mutateAsync(selectedTemplate.id);
      toast({
        title: 'Template deleted',
        description: 'The delivery model has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to delete template',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const openInfoModal = () => {
    if (!selectedTemplate) return;
    setInfoForm({
      approach: selectedTemplate.approach,
      notes: selectedTemplate.notes ?? '',
    });
    setInfoModalOpen(true);
  };

  const handleSaveTemplateInfo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTemplate) return;
    const trimmedApproach = infoForm.approach.trim();
    if (!trimmedApproach) {
      toast({
        title: 'Approach is required',
        description: 'Provide a clear name for the delivery model.',
        variant: 'destructive',
      });
      return;
    }

    setIsInfoSubmitting(true);
    try {
      await updateTemplateMutation.mutateAsync({
        id: selectedTemplate.id,
        payload: {
          approach: trimmedApproach,
          notes: infoForm.notes.trim() || null,
          phases: preparePhasesForPayload(selectedTemplate.phases),
        },
      });
      toast({
        title: 'Template updated',
        description: 'The delivery model details were saved.',
      });
      setInfoModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Failed to update template',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsInfoSubmitting(false);
    }
  };

  const closePhaseModal = () => {
    setPhaseModal({ open: false, mode: 'create' });
    setPhaseForm(defaultPhaseForm);
    setIsPhaseSubmitting(false);
  };

  const openPhaseModal = (mode: 'create' | 'edit', phase?: DeliveryModelTemplatePhase) => {
    if (!selectedTemplate) return;
    if (mode === 'edit' && phase) {
      setPhaseForm({
        name: phase.name ?? '',
        status:
          phase.status && STATUS_OPTIONS.includes(phase.status) ? phase.status : STATUS_OPTIONS[0],
        duration: phase.duration ?? '',
        budget: phase.budget != null ? String(phase.budget) : '',
        updated_by: phase.updated_by ?? '',
        description: phase.description ?? '',
      });
      setPhaseModal({ open: true, mode: 'edit', phaseId: phase.phase_id });
      return;
    }
    setPhaseForm(defaultPhaseForm);
    setPhaseModal({ open: true, mode: 'create' });
  };

  const handleSavePhase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTemplate) return;

    const trimmedName = phaseForm.name.trim();
    if (!trimmedName) {
      toast({
        title: 'Phase name is required',
        description: 'Provide a clear name before saving this phase.',
        variant: 'destructive',
      });
      return;
    }

    const numericBudget = phaseForm.budget.trim()
      ? Number(phaseForm.budget.replace(/[,$]/g, ''))
      : null;
    const parsedBudget =
      typeof numericBudget === 'number' && Number.isFinite(numericBudget) ? numericBudget : null;

    setIsPhaseSubmitting(true);
    try {
      const basePhases = selectedTemplate.phases ?? [];
      const newPhase: DeliveryModelTemplatePhase = {
        phase_id:
          phaseModal.mode === 'edit' && phaseModal.phaseId
            ? normalizeUuid(phaseModal.phaseId)
            : createUuid(),
        name: trimmedName,
        status: phaseForm.status || null,
        duration: phaseForm.duration.trim() || null,
        budget: parsedBudget,
        updated_by: phaseForm.updated_by.trim() || null,
        description: phaseForm.description.trim() || null,
        last_updated: new Date().toISOString(),
      };

      const nextPhases =
        phaseModal.mode === 'edit' && phaseModal.phaseId
          ? basePhases.map((phase) =>
              phase.phase_id === phaseModal.phaseId ? newPhase : phase,
            )
          : [...basePhases, newPhase];

      await updateTemplateMutation.mutateAsync({
        id: selectedTemplate.id,
        payload: {
          approach: selectedTemplate.approach,
          notes: selectedTemplate.notes ?? null,
          phases: preparePhasesForPayload(nextPhases),
        },
      });

      toast({
        title: phaseModal.mode === 'edit' ? 'Phase updated' : 'Phase added',
        description:
          phaseModal.mode === 'edit'
            ? 'Your changes were saved to the delivery model.'
            : 'The new phase is now part of this delivery model.',
      });
      closePhaseModal();
    } catch (error: any) {
      toast({
        title: 'Failed to save phase',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
      setIsPhaseSubmitting(false);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!selectedTemplate) return;
    const confirmed = window.confirm('Delete this phase from the template?');
    if (!confirmed) return;

    try {
      const nextPhases = selectedTemplate.phases.filter((phase) => phase.phase_id !== phaseId);
      await updateTemplateMutation.mutateAsync({
        id: selectedTemplate.id,
        payload: {
          approach: selectedTemplate.approach,
          notes: selectedTemplate.notes ?? null,
          phases: preparePhasesForPayload(nextPhases),
        },
      });
      toast({
        title: 'Phase removed',
        description: 'The phase has been removed from this delivery model.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to remove phase',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Delivery Models</h1>
          <p className="mt-1 text-sm text-gray-600">
            Build a catalog of delivery approaches and reusable phases. Opportunity teams can import
            these templates and tailor them as needed.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-indigo-950 hover:bg-indigo-900">
          <Plus className="h-4 w-4" />
          New delivery model
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-3xl border border-gray-200 bg-white shadow-lg shadow-indigo-100/40">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#161950]">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Delivery Model</p>
                  <p className="text-xs text-gray-500">
                    List of all delivery models created by your team.
                  </p>
                </div>
              </div>
              {selectedTemplate && (
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-[#161950]">
                  <ClipboardList className="h-4 w-4" />
                  {selectedTemplate.phases.length} phase
                  {selectedTemplate.phases.length === 1 ? '' : 's'} selected
                </span>
              )}
            </div>
            <div className="p-6">
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              )}

              {!isLoading && !normalizedTemplates.length && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  No delivery models yet. Create your first template to get started.
                </div>
              )}

              {!isLoading && normalizedTemplates.length > 0 && (
                <div className="space-y-3">
                  {normalizedTemplates.map((template) => {
                    const budget = template.phases.reduce((sum, phase) => sum + (phase.budget ?? 0), 0);
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleSelectTemplate(template.id)}
                        className={cn(
                          'w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg',
                          template.id === selectedTemplateId
                            ? 'border-[#161950] shadow-md ring-1 ring-[#161950]/30'
                            : '',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{template.approach}</p>
                          {template.id === selectedTemplateId && (
                            <span className="rounded-full bg-[#161950]/5 px-3 py-1 text-xs font-medium text-[#161950]">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {template.phases.length} phase{template.phases.length === 1 ? '' : 's'}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600">
                            <DollarSign className="h-3.5 w-3.5" />
                            {formatCurrency(budget)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="space-y-5 lg:col-span-8">
          {selectedTemplate ? (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Template details</p>
                  <p className="text-xs text-gray-500">
                    View the approach summary and manage phases from here.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={openInfoModal}>
                    <Edit className="h-4 w-4" />
                    Edit info
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteTemplate}
                    disabled={deleteTemplateMutation.isPending}
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-lg font-semibold text-gray-900">
                      {sanitizeString(selectedTemplate.approach, 'Untitled delivery model')}
                    </p>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">Internal notes</p>
                      <p className="mt-1 text-gray-600">
                        {sanitizeString(selectedTemplate.notes, '').trim() ||
                          'No notes have been added yet.'}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Total phases</span>
                      <span className="font-semibold text-gray-900">
                        {selectedTemplate.phases.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Total budget</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(totalBudget)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last updated</span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(selectedTemplate.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Phases</p>
                    <p className="text-xs text-gray-500">
                      Add, edit, or remove phases to keep this template aligned to your methodology.
                    </p>
                  </div>
                  <Button size="sm" className="gap-2" onClick={() => openPhaseModal('create')}>
                    <Plus className="h-4 w-4" />
                    Add phase
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedTemplate.phases.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                      No phases defined yet. Use “Add phase” to capture the steps in this delivery model.
                    </div>
                  )}

                  {selectedTemplate.phases.map((phase) => (
                    <div key={phase.phase_id} className="rounded-xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {phase.name || 'Untitled phase'}
                            </p>
                            {phase.status && (
                              <span
                                className={cn(
                                  'rounded-full px-3 py-1 text-xs font-medium',
                                  statusStyles[phase.status] || 'bg-gray-100 text-gray-600',
                                )}
                              >
                                {phase.status}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Last updated {formatDate(phase.last_updated)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => openPhaseModal('edit', phase)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeletePhase(phase.phase_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarClock className="h-4 w-4 text-indigo-500" />
                          <span>{sanitizeString(phase.duration, '') || 'No duration specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <DollarSign className="h-4 w-4 text-indigo-500" />
                          <span>{formatCurrency(phase.budget ?? null)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Layers className="h-4 w-4 text-indigo-500" />
                          <span>{sanitizeString(phase.updated_by, '') || 'No owner recorded'}</span>
                        </div>
                      </div>

                      {sanitizeString(phase.description, '') && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                          {sanitizeString(phase.description, '')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
              Select a delivery model from the list or create a new template to begin.
            </div>
          )}
        </section>
      </div>

      <Dialog open={showCreateModal} onOpenChange={(open) => setShowCreateModal(open)}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border border-gray-100 p-0 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Create delivery model template</DialogTitle>
            <DialogDescription>
              Provide an approach name and optional notes for the new template.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTemplate} className="space-y-0">
            <div className="bg-gradient-to-r from-[#161950] via-[#1b1f7a] to-[#202188] px-8 py-6 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner shadow-indigo-900/20">
                  <FilePlus2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">New delivery model</h2>
                  <p className="text-sm text-white/80">
                    Give your delivery model a name. You can add notes and phases after it is created.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white px-8 py-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-gray-500">Approach name</Label>
                <Input name="approach" placeholder="Design-Build Support" required />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-gray-500">Notes (optional)</Label>
                <Textarea
                  name="notes"
                  placeholder="Describe where this model should be used."
                  className="min-h-[120px]"
                />
              </div>
            </div>

            <DialogFooter className="bg-gray-50 px-8 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                type="button"
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-[#161950] text-white shadow-lg shadow-indigo-200 hover:bg-[#101440]"
              >
                <Save className="h-4 w-4" />
                Create template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={infoModalOpen} onOpenChange={(open) => setInfoModalOpen(open)}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border border-gray-100 p-0 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Edit delivery model</DialogTitle>
            <DialogDescription>Update the delivery model approach and notes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTemplateInfo} className="space-y-0">
            <div className="bg-gradient-to-r from-[#161950] via-[#1b1f7a] to-[#202188] px-8 py-6 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner shadow-indigo-900/20">
                  <NotebookPen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Edit delivery model</h2>
                  <p className="text-sm text-white/80">
                    Update the template name and internal notes. Phases remain unchanged.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white px-8 py-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-gray-500">Approach name</Label>
                <Input
                  value={infoForm.approach}
                  onChange={(event) =>
                    setInfoForm((prev) => ({ ...prev, approach: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-gray-500">Notes</Label>
                <Textarea
                  value={infoForm.notes}
                  onChange={(event) => setInfoForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Add context, guardrails, or usage guidance for this template."
                  className="min-h-[140px]"
                />
              </div>
            </div>

            <DialogFooter className="bg-gray-50 px-8 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setInfoModalOpen(false)}
                type="button"
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInfoSubmitting}
                className="gap-2 bg-[#161950] text-white shadow-lg shadow-indigo-200 hover:bg-[#101440]"
              >
                <Save className="h-4 w-4" />
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={phaseModal.open} onOpenChange={(open) => (open ? null : closePhaseModal())}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border border-gray-100 p-0 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{phaseModal.mode === 'edit' ? 'Edit phase' : 'Add phase'}</DialogTitle>
            <DialogDescription>Capture the delivery model phase details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePhase} className="space-y-0">
            <div className="bg-gradient-to-r from-[#161950] via-[#1b1f7a] to-[#202188] px-8 py-6 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner shadow-indigo-900/20">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {phaseModal.mode === 'edit' ? 'Edit phase' : 'Add phase'}
                  </h2>
                  <p className="text-sm text-white/80">
                    Capture the details for this phase. Save each phase to keep the template up-to-date.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white px-8 py-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-gray-500">Phase name</Label>
                <Input
                  value={phaseForm.name}
                  onChange={(event) =>
                    setPhaseForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Phase 1: Feasibility & Planning"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-gray-500">Status</Label>
                  <Select
                    value={phaseForm.status}
                    onValueChange={(value) => setPhaseForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-gray-500">Duration</Label>
                  <Input
                    value={phaseForm.duration}
                    onChange={(event) =>
                      setPhaseForm((prev) => ({ ...prev, duration: event.target.value }))
                    }
                    placeholder="5 months"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-gray-500">Budget (USD)</Label>
                  <Input
                    value={phaseForm.budget}
                    onChange={(event) =>
                      setPhaseForm((prev) => ({ ...prev, budget: event.target.value }))
                    }
                    placeholder="60000"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-gray-500">Updated by</Label>
                  <Input
                    value={phaseForm.updated_by}
                    onChange={(event) =>
                      setPhaseForm((prev) => ({ ...prev, updated_by: event.target.value }))
                    }
                    placeholder="Delivery Operations"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-gray-500">Description</Label>
                <Textarea
                  value={phaseForm.description}
                  onChange={(event) =>
                    setPhaseForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Summarize objectives, milestones, and key deliverables for this phase."
                  className="min-h-[140px]"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-3 bg-gray-50 px-8 py-4">
              <Button variant="outline" onClick={closePhaseModal} type="button" className="border-gray-300 text-gray-700">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPhaseSubmitting}
                className="gap-2 bg-[#161950] text-white shadow-lg shadow-indigo-200 hover:bg-[#101440]"
              >
                <Save className="h-4 w-4" />
                Save phase
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryModelsPage;

