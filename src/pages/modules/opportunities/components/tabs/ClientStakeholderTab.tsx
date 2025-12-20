import { memo, useMemo, useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddButton } from './shared';
import { TabProps } from './types';
import { 
  useOpportunityStakeholders, 
  useCreateOpportunityStakeholder,
  useDeleteOpportunityStakeholder,
  useOpportunityDrivers,
  useCreateOpportunityDriver 
} from '@/hooks/opportunities';
import { Stakeholder, Driver } from '@/types/opportunityTabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/shared';

const ClientStakeholderTab = memo(({ opportunity }: TabProps) => {
  const { data: stakeholders = [], isLoading: stakeholdersLoading } = useOpportunityStakeholders(opportunity?.id || '');
  const { data: drivers = [], isLoading: driversLoading } = useOpportunityDrivers(opportunity?.id || '');
  const createStakeholderMutation = useCreateOpportunityStakeholder(opportunity?.id || '');
  const createDriverMutation = useCreateOpportunityDriver(opportunity?.id || '');
  const deleteStakeholderMutation = useDeleteOpportunityStakeholder(opportunity?.id || '');
  const [stakeholderDeletingId, setStakeholderDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const stakeholderInitialState = {
    name: '',
    designation: '',
    email: '',
    contact_number: '',
    influence_level: 'Medium' as Stakeholder['influence_level'],
  };

  const driverInitialState = {
    category: 'Political' as Driver['category'],
    description: '',
  };

  const [stakeholderForm, setStakeholderForm] = useState(stakeholderInitialState);
  const [driverForm, setDriverForm] = useState(driverInitialState);
  const [isStakeholderModalOpen, setIsStakeholderModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  const influenceLevelOptions: Array<{ value: Stakeholder['influence_level']; label: string; description: string }> = [
    { value: 'High', label: 'High Influence', description: 'Final approval or veto authority' },
    { value: 'Executive Sponsor', label: 'Executive Sponsor', description: 'C-level champion guiding vision' },
    { value: 'Economic Buyer', label: 'Economic Buyer', description: 'Controls commercial decisions' },
    { value: 'Technical Evaluator', label: 'Technical Evaluator', description: 'Owns solution validation' },
    { value: 'Project Champion', label: 'Project Champion', description: 'Day-to-day operational lead' },
    { value: 'Finance Approver', label: 'Finance Approver', description: 'Approves budget release' },
    { value: 'Operational Lead', label: 'Operational Lead', description: 'Ensures rollout and adoption' },
    { value: 'Medium', label: 'Medium Influence', description: 'Influences scope, timing, or selection' },
    { value: 'Low', label: 'Low Influence', description: 'Needs awareness; limited decision power' },
  ];

  const formatUSPhoneInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    let normalized = digits;
    if (normalized.startsWith('1')) {
      normalized = normalized.slice(1);
    }
    const clipped = normalized.slice(0, 10);
    const area = clipped.slice(0, 3);
    const central = clipped.slice(3, 6);
    const station = clipped.slice(6, 10);
    if (!area) return '';
    if (clipped.length <= 3) {
      return `(${area}`;
    }
    if (clipped.length <= 6) {
      return `(${area}) ${central}`;
    }
    return `(${area}) ${central}-${station}`;
  };

  const formatUSPhoneForSubmission = (raw: string) => {
    if (!raw) return undefined;
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    return null;
  };

  const formatPhoneForDisplay = (raw?: string | null) => {
    if (!raw) return '—';
    const digits = raw.replace(/\D/g, '');
    const normalized = digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits;
    if (normalized.length === 10) {
      const area = normalized.slice(0, 3);
      const central = normalized.slice(3, 6);
      const station = normalized.slice(6, 10);
      return `+1 (${area}) ${central}-${station}`;
    }
    return raw;
  };

  const handleAddStakeholder = () => {
    setStakeholderForm(stakeholderInitialState);
    setIsStakeholderModalOpen(true);
  };

  const handleAddDriver = () => {
    setDriverForm(driverInitialState);
    setIsDriverModalOpen(true);
  };

  const handleSubmitStakeholder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!opportunity?.id) return;

    const formattedPhone = formatUSPhoneForSubmission(stakeholderForm.contact_number);
    if (stakeholderForm.contact_number && !formattedPhone) {
      toast({
        title: 'Invalid U.S. number',
        description: 'Enter a valid 10-digit U.S. phone number. Example: (415) 555-1234',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createStakeholderMutation.mutateAsync({
        ...stakeholderForm,
        email: stakeholderForm.email || undefined,
        contact_number: formattedPhone,
      });
      setIsStakeholderModalOpen(false);
      setStakeholderForm(stakeholderInitialState);
      toast({
        title: 'Stakeholder added',
        description: `${stakeholderForm.name || 'Stakeholder'} has been added to this opportunity.`,
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to add stakeholder',
        description: error?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStakeholder = async (stakeholder: Stakeholder) => {
    if (!opportunity?.id) return;
    const confirmed = window.confirm(`Remove ${stakeholder.name} from this opportunity?`);
    if (!confirmed) return;
    try {
      setStakeholderDeletingId(stakeholder.id);
      await deleteStakeholderMutation.mutateAsync(stakeholder.id);
    } catch (error) {
      console.error('Failed to delete stakeholder', error);
    } finally {
      setStakeholderDeletingId(null);
    }
  };

  const handleSubmitDriver = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!opportunity?.id) return;

    try {
      await createDriverMutation.mutateAsync({
        category: driverForm.category,
        description: driverForm.description,
      });
      setIsDriverModalOpen(false);
      setDriverForm(driverInitialState);
      toast({
        title: 'Driver added',
        description: `Saved under ${driverForm.category} drivers.`,
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to add driver',
        description: error?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const politicalDrivers = useMemo(
    () => drivers.filter((driver: Driver) => driver.category === 'Political').map((driver: Driver) => driver.description),
    [drivers]
  );
  const technicalRequirements = useMemo(
    () => drivers.filter((driver: Driver) => driver.category === 'Technical').map((driver: Driver) => driver.description),
    [drivers]
  );
  const financialConstraints = useMemo(
    () => drivers.filter((driver: Driver) => driver.category === 'Financial').map((driver: Driver) => driver.description),
    [drivers]
  );

  if (stakeholdersLoading || driversLoading) {
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
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Key Stakeholders</h3>
            <AddButton onClick={handleAddStakeholder} />
          </div>
          <div className="h-px bg-black/10 mb-5"></div>
        </div>
        
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Stakeholder Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Contact Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Influence Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stakeholders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                      No stakeholders added yet. Use “Add New” to document key decision makers.
                    </td>
                  </tr>
                ) : (
                  stakeholders.map((stakeholder: Stakeholder) => (
                    <tr key={stakeholder.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stakeholder.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stakeholder.designation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stakeholder.email || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPhoneForDisplay(stakeholder.contact_number)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const level = stakeholder.influence_level;
                          const highSet = new Set<Stakeholder['influence_level']>(['High', 'Executive Sponsor', 'Economic Buyer']);
                          const mediumSet = new Set<Stakeholder['influence_level']>(['Medium', 'Project Champion', 'Finance Approver', 'Operational Lead', 'Technical Evaluator']);
                          const badgeClass = highSet.has(level)
                            ? 'bg-red-50 text-red-600'
                            : mediumSet.has(level)
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-green-50 text-green-600';
                          return (
                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
                              {level}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStakeholder(stakeholder)}
                          disabled={stakeholderDeletingId === stakeholder.id && deleteStakeholderMutation.isPending}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {stakeholderDeletingId === stakeholder.id && deleteStakeholderMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Delete stakeholder</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Client Drivers & Criteria</h3>
            <AddButton onClick={handleAddDriver} />
          </div>
          <div className="h-px bg-black/10 mb-5"></div>
        </div>
        
        <div className="px-6 pb-6">
          <div className="p-6 bg-stone-50 rounded-[20px] space-y-5">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Political Drivers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {politicalDrivers.length > 0 ? (
                  politicalDrivers.map((driver: string, index: number) => (
                    <div key={index} className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center">
                      <span className="text-sm text-gray-900">{driver}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-sm text-gray-500">
                    No political drivers documented yet.
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-px bg-black/10"></div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Technical Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {technicalRequirements.length > 0 ? (
                  technicalRequirements.map((requirement: string, index: number) => (
                    <div key={index} className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center">
                      <span className="text-sm text-gray-900">{requirement}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-sm text-gray-500">
                    No technical requirements specified.
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-px bg-black/10"></div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Financial Constraints</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {financialConstraints.length > 0 ? (
                  financialConstraints.map((constraint: string, index: number) => (
                    <div key={index} className="h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center">
                      <span className="text-sm text-gray-900">{constraint}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-sm text-gray-500">
                    No financial constraints captured yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isStakeholderModalOpen} onOpenChange={setIsStakeholderModalOpen}>
        <DialogContent className="max-w-2xl border border-indigo-100 bg-white/95 shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Stakeholders</p>
              <DialogTitle className="text-2xl font-semibold text-gray-900">Add Key Stakeholder</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              Capture stakeholders involved in the opportunity and track their influence.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitStakeholder} className="space-y-6">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
              <p className="mb-4 text-sm font-medium text-indigo-900">Identity</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 font-outfit">
                <div className="space-y-2">
                  <Label htmlFor="stakeholder-name" className="text-xs uppercase text-gray-500 tracking-wider">
                    Full Name
                  </Label>
                  <Input
                    id="stakeholder-name"
                    placeholder="Jane Cooper"
                    value={stakeholderForm.name}
                    onChange={(event) => setStakeholderForm({ ...stakeholderForm, name: event.target.value })}
                    required
                    className="h-11 rounded-lg border-gray-200 bg-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stakeholder-designation" className="text-xs uppercase text-gray-500 tracking-wider">
                    Designation
                  </Label>
                  <Input
                    id="stakeholder-designation"
                    placeholder="Chief Procurement Officer"
                    value={stakeholderForm.designation}
                    onChange={(event) => setStakeholderForm({ ...stakeholderForm, designation: event.target.value })}
                    required
                    className="h-11 rounded-lg border-gray-200 bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-inner">
              <p className="mb-4 text-sm font-medium text-gray-900">Contact Preferences</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 font-outfit">
                <div className="space-y-2">
                  <Label htmlFor="stakeholder-email" className="text-xs uppercase text-gray-500 tracking-wider">
                    Email
                  </Label>
                  <Input
                    id="stakeholder-email"
                    type="email"
                    placeholder="jane.cooper@example.com"
                    value={stakeholderForm.email}
                    onChange={(event) => setStakeholderForm({ ...stakeholderForm, email: event.target.value })}
                    className="h-11 rounded-lg border-gray-200 bg-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stakeholder-phone" className="text-xs uppercase text-gray-500 tracking-wider">
                    Contact Number
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                      +1
                    </span>
                    <Input
                      id="stakeholder-phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="(415) 555-1234"
                      value={stakeholderForm.contact_number}
                      onChange={(event) =>
                        setStakeholderForm({
                          ...stakeholderForm,
                          contact_number: formatUSPhoneInput(event.target.value),
                        })
                      }
                      className="h-11 rounded-lg border-gray-200 bg-white pl-12 text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Enter a valid U.S. number. Saved as +1XXXXXXXXXX.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs uppercase text-gray-500 tracking-wider">Influence Level</Label>
                  <Select
                    value={stakeholderForm.influence_level}
                    onValueChange={(value: Stakeholder['influence_level']) =>
                      setStakeholderForm({ ...stakeholderForm, influence_level: value })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white text-sm">
                      <SelectValue placeholder="Select influence level" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[280px]">
                      {influenceLevelOptions.map((option) => (
                        <SelectItem key={option.label} value={option.value}>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{option.label}</p>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => setIsStakeholderModalOpen(false)} className="h-11 px-5">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createStakeholderMutation.isPending}
                className="h-11 rounded-lg bg-indigo-950 px-6 text-sm font-semibold text-white shadow-lg hover:bg-indigo-900"
              >
                {createStakeholderMutation.isPending ? 'Saving...' : 'Save Stakeholder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDriverModalOpen} onOpenChange={setIsDriverModalOpen}>
        <DialogContent className="max-w-xl border border-emerald-100 bg-white/95 shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Client Criteria</p>
              <DialogTitle className="text-2xl font-semibold text-gray-900">Add Client Driver / Criteria</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              Document the client’s evaluation criteria to align our win strategy.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitDriver} className="space-y-6 font-outfit">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-gray-500 tracking-wider">Driver Category</Label>
                <Select
                  value={driverForm.category}
                  onValueChange={(value: Driver['category']) => setDriverForm({ ...driverForm, category: value })}
                >
                  <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Political">Political</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-inner">
              <div className="space-y-2">
                <Label htmlFor="driver-description" className="text-xs uppercase text-gray-500 tracking-wider">
                  Description
                </Label>
                <Textarea
                  id="driver-description"
                  placeholder="Describe the client driver or criteria..."
                  value={driverForm.description}
                  onChange={(event) => setDriverForm({ ...driverForm, description: event.target.value })}
                  rows={5}
                  className="rounded-lg border-gray-200 bg-white text-sm leading-relaxed"
                  required
                />
                <p className="text-xs text-gray-400">
                  Tip: include specific success measures, political sponsorship, or financial guardrails the client cares about.
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => setIsDriverModalOpen(false)} className="h-11 px-5">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDriverMutation.isPending}
                className="h-11 rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500"
              >
                {createDriverMutation.isPending ? 'Saving...' : 'Save Driver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ClientStakeholderTab.displayName = 'ClientStakeholderTab';

export default ClientStakeholderTab;