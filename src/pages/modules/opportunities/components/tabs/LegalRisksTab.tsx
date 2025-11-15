import { memo, useState } from 'react';
import { CheckCircle, AlertTriangle, Clock, Shield, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useOpportunityRisks,
  useOpportunityLegalChecklist,
  useCreateOpportunityRisk,
  useUpdateOpportunityRisk,
  useDeleteOpportunityRisk,
  useCreateOpportunityLegalChecklistItem,
  useUpdateOpportunityLegalChecklistItem,
  useDeleteOpportunityLegalChecklistItem,
} from '@/hooks/useOpportunityTabs';
import type { LegalChecklistItem, Risk } from '@/types/opportunityTabs';

interface LegalRisksTabProps {
  opportunity: any;
}

const impactBadge = (impact: string) => {
  if (!impact) return 'bg-gray-100 text-gray-600 border border-gray-200';
  if (impact.toLowerCase().includes('high')) return 'bg-red-50 text-red-600 border border-red-200';
  if (impact.toLowerCase().includes('medium')) return 'bg-amber-50 text-amber-600 border border-amber-200';
  return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
};

const probabilityBadge = (probability: string) => {
  if (!probability) return 'bg-gray-100 text-gray-600 border border-gray-200';
  if (probability.toLowerCase().includes('high')) return 'bg-red-50 text-red-600 border border-red-200';
  if (probability.toLowerCase().includes('medium')) return 'bg-amber-50 text-amber-600 border border-amber-200';
  return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
};

const checklistStatusMeta: Record<LegalChecklistItem['status'], { icon: typeof CheckCircle; container: string; chip: string; iconColor: string }> = {
  Complete: {
    icon: CheckCircle,
    container: 'bg-emerald-50 border border-emerald-200 text-emerald-900',
    chip: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-600',
  },
  'In progress': {
    icon: Clock,
    container: 'bg-amber-50 border border-amber-200 text-amber-900',
    chip: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-600',
  },
  Pending: {
    icon: Shield,
    container: 'bg-gray-50 border border-gray-200 text-gray-900',
    chip: 'bg-gray-100 text-gray-700',
    iconColor: 'text-gray-500',
  },
};

const categoryPills: Record<string, string> = {
  Environmental: 'bg-blue-50 text-blue-700',
  Political: 'bg-purple-50 text-purple-700',
  Technical: 'bg-indigo-50 text-indigo-700',
};

const LegalRisksTab = memo(({ opportunity }: LegalRisksTabProps) => {
  const opportunityId = opportunity?.id || '';
  const { data: risks = [], isLoading: risksLoading } = useOpportunityRisks(opportunityId);
  const { data: checklist = [], isLoading: checklistLoading } = useOpportunityLegalChecklist(opportunityId);
  const createRisk = useCreateOpportunityRisk(opportunityId);
  const updateRisk = useUpdateOpportunityRisk(opportunityId);
  const deleteRisk = useDeleteOpportunityRisk(opportunityId);
  const createLegalItem = useCreateOpportunityLegalChecklistItem(opportunityId);
  const updateLegalItem = useUpdateOpportunityLegalChecklistItem(opportunityId);
  const deleteLegalItem = useDeleteOpportunityLegalChecklistItem(opportunityId);

  const loading = risksLoading || checklistLoading;
  const hasRisks = risks.length > 0;
  const hasChecklist = checklist.length > 0;

  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [riskModalMode, setRiskModalMode] = useState<'create' | 'edit'>('create');
  const [activeRiskId, setActiveRiskId] = useState<string | null>(null);
  const [riskForm, setRiskForm] = useState({
    category: 'Environmental',
    risk_description: '',
    impact_level: 'High',
    probability: 'High',
    mitigation_strategy: '',
  });

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalMode, setLegalModalMode] = useState<'create' | 'edit'>('create');
  const [activeLegalId, setActiveLegalId] = useState<string | null>(null);
  const [legalForm, setLegalForm] = useState({
    item_name: '',
    status: 'Pending' as LegalChecklistItem['status'],
  });

  const resetRiskForm = () => {
    setRiskForm({
      category: 'Environmental',
      risk_description: '',
      impact_level: 'High',
      probability: 'High',
      mitigation_strategy: '',
    });
    setActiveRiskId(null);
    setRiskModalMode('create');
  };

  const resetLegalForm = () => {
    setLegalForm({ item_name: '', status: 'Pending' });
    setActiveLegalId(null);
    setLegalModalMode('create');
  };

  const openCreateRiskModal = () => {
    resetRiskForm();
    setRiskModalOpen(true);
  };

  const openEditRiskModal = (risk: Risk) => {
    setRiskModalMode('edit');
    setActiveRiskId(risk.id);
    setRiskForm({
      category: risk.category,
      risk_description: risk.risk_description,
      impact_level: risk.impact_level,
      probability: risk.probability,
      mitigation_strategy: risk.mitigation_strategy,
    });
    setRiskModalOpen(true);
  };

  const handleSaveRisk = async () => {
    if (
      !riskForm.risk_description.trim() ||
      !riskForm.mitigation_strategy.trim()
    ) {
      return;
    }

    if (riskModalMode === 'create') {
      await createRisk.mutateAsync(riskForm);
    } else if (activeRiskId) {
      await updateRisk.mutateAsync({ riskId: activeRiskId, data: riskForm });
    }

    setRiskModalOpen(false);
    resetRiskForm();
  };

  const handleDeleteRisk = async (riskId: string) => {
    if (confirm('Remove this risk from the opportunity?')) {
      await deleteRisk.mutateAsync(riskId);
    }
  };

  const openCreateLegalModal = () => {
    resetLegalForm();
    setLegalModalOpen(true);
  };

  const openEditLegalModal = (item: LegalChecklistItem) => {
    setLegalModalMode('edit');
    setActiveLegalId(item.id);
    setLegalForm({ item_name: item.item_name, status: item.status });
    setLegalModalOpen(true);
  };

  const handleSaveLegalItem = async () => {
    if (!legalForm.item_name.trim()) {
      return;
    }

    if (legalModalMode === 'create') {
      await createLegalItem.mutateAsync(legalForm);
    } else if (activeLegalId) {
      await updateLegalItem.mutateAsync({ itemId: activeLegalId, data: legalForm });
    }

    setLegalModalOpen(false);
    resetLegalForm();
  };

  const handleDeleteLegalItem = async (itemId: string) => {
    if (confirm('Remove this legal checklist item?')) {
      await deleteLegalItem.mutateAsync(itemId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-indigo-100/60 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-lg">
          <div className="px-6 py-6 border-b border-indigo-100/60">
            <h2 className="text-xl font-semibold text-gray-900">Risk Assessment &amp; Mitigations</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                size="sm"
                className="bg-indigo-950 hover:bg-indigo-900 text-white"
                onClick={openCreateRiskModal}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add risk
              </Button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-28 rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
                ))}
              </div>
            ) : hasRisks ? (
              <div className="space-y-4">
                {risks.map((risk: Risk) => (
                  <article
                    key={risk.id}
                    className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur px-5 py-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          <h3 className="text-base font-semibold text-gray-900 leading-snug">
                            {risk.risk_description}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={`w-fit border-transparent ${categoryPills[risk.category] || 'bg-slate-100 text-slate-600'}`}
                        >
                          {risk.category}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${impactBadge(risk.impact_level)}`}
                        >
                          {risk.impact_level} Impact
                        </span>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${probabilityBadge(risk.probability)}`}
                        >
                          {risk.probability} Probability
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-indigo-600"
                            onClick={() => openEditRiskModal(risk)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-600"
                            onClick={() => handleDeleteRisk(risk.id)}
                            disabled={deleteRisk.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                      <p className="text-sm font-semibold text-indigo-900">Mitigation Strategy</p>
                      <p className="mt-1 text-sm text-indigo-950/80">
                        {risk.mitigation_strategy || 'No mitigation strategy provided.'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center text-indigo-900/70">
                <p>No risks have been recorded for this opportunity yet.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={openCreateRiskModal}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add first risk
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100/60 bg-gradient-to-br from-white via-sky-50/30 to-white shadow-lg">
          <div className="px-6 py-6 border-b border-indigo-100/60">
            <h2 className="text-xl font-semibold text-gray-900">Legal Checklist</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                size="sm"
                className="bg-indigo-950 hover:bg-indigo-900 text-white"
                onClick={openCreateLegalModal}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add item
              </Button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-16 rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
                ))}
              </div>
            ) : hasChecklist ? (
              <div className="space-y-3">
                {checklist.map((item: LegalChecklistItem) => {
                  const statusMeta = checklistStatusMeta[item.status] ?? checklistStatusMeta.Pending;
                  const StatusIcon = statusMeta.icon;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-4 rounded-2xl px-5 py-4 shadow-sm transition-shadow hover:shadow-md ${statusMeta.container}`}
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${statusMeta.iconColor}`} />
                        <div className="text-sm font-semibold leading-tight">{item.item_name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`border-transparent ${statusMeta.chip}`}>{item.status}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-indigo-600"
                          onClick={() => openEditLegalModal(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-600"
                          onClick={() => handleDeleteLegalItem(item.id)}
                          disabled={deleteLegalItem.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-8 text-center text-sky-900/70">
                <p>Legal team has not created checklist items for this opportunity yet.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={openCreateLegalModal}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add checklist item
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={riskModalOpen}
        onOpenChange={(open) => {
          setRiskModalOpen(open);
          if (!open) resetRiskForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{riskModalMode === 'edit' ? 'Edit risk' : 'Add risk'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="risk-category">
                Category
              </label>
              <Select
                value={riskForm.category}
                onValueChange={(value) => setRiskForm((prev) => ({ ...prev, category: value as Risk['category'] }))}
              >
                <SelectTrigger id="risk-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {['Environmental', 'Political', 'Technical'].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="risk-description">
                Risk description
              </label>
              <Input
                id="risk-description"
                value={riskForm.risk_description}
                onChange={(event) => setRiskForm((prev) => ({ ...prev, risk_description: event.target.value }))}
                placeholder="Detail the identified risk"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="risk-mitigation">
                Mitigation strategy
              </label>
              <Textarea
                id="risk-mitigation"
                rows={3}
                value={riskForm.mitigation_strategy}
                onChange={(event) => setRiskForm((prev) => ({ ...prev, mitigation_strategy: event.target.value }))}
                placeholder="Describe how the team mitigates this risk"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="risk-impact">
                  Impact
                </label>
                <Select
                  value={riskForm.impact_level}
                  onValueChange={(value) => setRiskForm((prev) => ({ ...prev, impact_level: value as Risk['impact_level'] }))}
                >
                  <SelectTrigger id="risk-impact">
                    <SelectValue placeholder="Impact" />
                  </SelectTrigger>
                  <SelectContent>
                    {['High', 'Medium', 'Low'].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="risk-probability">
                  Probability
                </label>
                <Select
                  value={riskForm.probability}
                  onValueChange={(value) => setRiskForm((prev) => ({ ...prev, probability: value as Risk['probability'] }))}
                >
                  <SelectTrigger id="risk-probability">
                    <SelectValue placeholder="Probability" />
                  </SelectTrigger>
                  <SelectContent>
                    {['High', 'Medium', 'Low'].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRiskModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRisk}
              disabled={
                createRisk.isPending ||
                updateRisk.isPending ||
                !riskForm.risk_description.trim() ||
                !riskForm.mitigation_strategy.trim()
              }
            >
              {createRisk.isPending || updateRisk.isPending ? 'Saving…' : riskModalMode === 'edit' ? 'Save changes' : 'Add risk'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={legalModalOpen}
        onOpenChange={(open) => {
          setLegalModalOpen(open);
          if (!open) resetLegalForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{legalModalMode === 'edit' ? 'Edit checklist item' : 'Add checklist item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="legal-name">
                Item name
              </label>
              <Input
                id="legal-name"
                value={legalForm.item_name}
                onChange={(event) => setLegalForm((prev) => ({ ...prev, item_name: event.target.value }))}
                placeholder="e.g., Contract terms review"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="legal-status">
                Status
              </label>
              <Select
                value={legalForm.status}
                onValueChange={(value) => setLegalForm((prev) => ({ ...prev, status: value as LegalChecklistItem['status'] }))}
              >
                <SelectTrigger id="legal-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {['Pending', 'In progress', 'Complete'].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLegalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLegalItem}
              disabled={createLegalItem.isPending || updateLegalItem.isPending || !legalForm.item_name.trim()}
            >
              {createLegalItem.isPending || updateLegalItem.isPending
                ? 'Saving…'
                : legalModalMode === 'edit'
                ? 'Save changes'
                : 'Add item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

LegalRisksTab.displayName = 'LegalRisksTab';

export default LegalRisksTab;
