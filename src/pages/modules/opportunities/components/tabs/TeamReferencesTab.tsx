import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Clock, Building, ArrowUpRight, Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  useOpportunityTeamMembers,
  useOpportunityReferences,
  useCreateOpportunityTeamMember,
  useUpdateOpportunityTeamMember,
  useCreateOpportunityReference,
  useDeleteOpportunityTeamMember,
  useDeleteOpportunityReference,
} from '@/hooks/useOpportunityTabs';
import { useAccountTeam } from '@/hooks/useAccountTeam';
import type { TeamMember, Reference } from '@/types/opportunityTabs';

interface TeamReferencesTabProps {
  opportunity: any;
}

const availabilityBadge = (availability: string) => {
  if (!availability) return 'bg-gray-100 text-gray-600';
  const numeric = parseInt(availability, 10);
  if (!Number.isNaN(numeric)) {
    if (numeric >= 90) return 'bg-emerald-50 text-emerald-600';
    if (numeric >= 70) return 'bg-amber-50 text-amber-600';
    return 'bg-red-50 text-red-600';
  }
  return 'bg-indigo-50 text-indigo-600';
};

const referenceStatusBadge = (status: string) => {
  if (!status) return 'bg-gray-100 text-gray-600';
  if (status.toLowerCase().includes('success')) return 'bg-emerald-50 text-emerald-600';
  if (status.toLowerCase().includes('progress')) return 'bg-amber-50 text-amber-600';
  return 'bg-indigo-50 text-indigo-600';
};

const formatCurrency = (amount?: string | number | null) => {
  if (!amount) return '—';
  const parsed = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(parsed)) return amount.toString();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(parsed);
};

const deriveAvailabilityFromStatus = (status?: string | null) => {
  if (!status) return '';
  const normalized = status.toLowerCase();
  if (normalized === 'active') return '100%';
  if (normalized.includes('%')) return status;
  return status.replace(/\bstatus\b/i, '').trim() || status;
};

const TeamReferencesTab = memo(({ opportunity }: TeamReferencesTabProps) => {
  const opportunityId = opportunity?.id || '';
  const accountId = opportunity?.account_id || '';
  const { data: opportunityTeamMembers = [], isLoading: opportunityTeamLoading } = useOpportunityTeamMembers(opportunityId);
  const { data: references = [], isLoading: referencesLoading } = useOpportunityReferences(opportunityId);
  const { teamMembers: accountTeamMembers = [], isLoading: accountTeamLoading } = useAccountTeam(accountId);
  const createTeamMember = useCreateOpportunityTeamMember(opportunityId);
  const updateTeamMember = useUpdateOpportunityTeamMember(opportunityId);
  const deleteTeamMember = useDeleteOpportunityTeamMember(opportunityId);
  const createReference = useCreateOpportunityReference(opportunityId);
  const deleteReference = useDeleteOpportunityReference(opportunityId);

  const isTeamLoading = opportunityTeamLoading;
  const isReferencesLoading = referencesLoading;
  const hasTeam = opportunityTeamMembers.length > 0;
  const hasReferences = references.length > 0;

  const assignedNames = useMemo(
    () =>
      new Set(
        opportunityTeamMembers
          .map((member) => member.name?.trim().toLowerCase())
          .filter((name): name is string => Boolean(name)),
      ),
    [opportunityTeamMembers],
  );

  const numericAvailabilities = useMemo(
    () =>
      opportunityTeamMembers
        .map((member) => parseInt(member.availability ?? '', 10))
        .filter((value) => !Number.isNaN(value)),
    [opportunityTeamMembers],
  );

  const averageAvailability = numericAvailabilities.length
    ? Math.round(
        numericAvailabilities.reduce((sum, value) => sum + value, 0) / numericAvailabilities.length,
      )
    : null;

  const uniqueRoles = useMemo(() => {
    const roleSet = new Set<string>();
    opportunityTeamMembers.forEach((member) => {
      if (member.designation) roleSet.add(member.designation);
    });
    return Array.from(roleSet);
  }, [opportunityTeamMembers]);

  const matchedAccountTeamMembers = useMemo(() => {
    return opportunityTeamMembers.map((member) => {
      const accountMember = accountTeamMembers.find((acctMember) =>
        acctMember.employee?.name?.trim().toLowerCase() === member.name?.trim().toLowerCase(),
      );

      return {
        opportunityMember: member,
        accountMember,
      };
    });
  }, [accountTeamMembers, opportunityTeamMembers]);

  const totalMonthlyPayout = useMemo(() => {
    const DEFAULT_MONTHLY_HOURS = 160;

    return matchedAccountTeamMembers.reduce((sum, pairing) => {
      const hourlyRate = pairing.accountMember?.employee?.bill_rate;
      if (!hourlyRate) {
        return sum;
      }

      const availabilityMatch = pairing.opportunityMember.availability || '100';
      const availability = Number(availabilityMatch.toString().replace(/[^0-9.]/g, ''));
      const availabilityRatio = Number.isNaN(availability) ? 1 : Math.min(Math.max(availability / 100, 0), 1);

      return sum + hourlyRate * DEFAULT_MONTHLY_HOURS * availabilityRatio;
    }, 0);
  }, [matchedAccountTeamMembers]);

  const accountTeamOptions = useMemo(
    () =>
      (accountTeamMembers || [])
        .filter((member) => member.employee)
        .map((member) => ({
          value: member.employee_id,
          label: member.employee?.name ?? 'Unnamed employee',
          subtitle: member.role_in_account || member.employee?.job_title || 'No role specified',
          availability: deriveAvailabilityFromStatus(member.employee?.status),
          experience: member.employee?.experience || '',
          employee: member.employee,
        })),
    [accountTeamMembers],
  );

  const availableAccountTeamOptions = useMemo(
    () =>
      accountTeamOptions.filter(
        (option) => !assignedNames.has(option.label.trim().toLowerCase()),
      ),
    [accountTeamOptions, assignedNames],
  );

  const disableTeamSelection =
    !accountId || accountTeamLoading || availableAccountTeamOptions.length === 0;

  const handleSelectAccountEmployee = (employeeId: string) => {
    const selectedOption = accountTeamOptions.find((option) => option.value === employeeId);
    if (!selectedOption) {
      setTeamForm({
        employeeId,
        name: '',
        designation: '',
        experience: '',
        availability: '',
      });
      return;
    }

    setTeamForm({
      employeeId,
      name: selectedOption.employee?.name ?? '',
      designation: selectedOption.subtitle || 'Team member',
      experience: selectedOption.experience || 'Not provided',
      availability: selectedOption.availability || '100%',
    });
  };

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamModalState, setTeamModalState] = useState<{ mode: 'create' | 'edit'; memberId: string | null }>({
    mode: 'create',
    memberId: null,
  });
  const [referenceModalOpen, setReferenceModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({
    employeeId: '',
    name: '',
    designation: '',
    experience: '',
    availability: '',
  });
  const [referenceForm, setReferenceForm] = useState({
    project_name: '',
    client: '',
    year: '',
    status: '',
    total_amount: '',
  });

  const resetTeamForm = () =>
    setTeamForm({
      employeeId: '',
      name: '',
      designation: '',
      experience: '',
      availability: '',
    });

  const resetReferenceForm = () =>
    setReferenceForm({
      project_name: '',
      client: '',
      year: '',
      status: '',
      total_amount: '',
    });

  const openCreateTeamModal = () => {
    resetTeamForm();
    setTeamModalState({ mode: 'create', memberId: null });
    setTeamModalOpen(true);
  };

  const openEditTeamModal = (member: TeamMember) => {
    setTeamModalState({ mode: 'edit', memberId: member.id });
    setTeamForm({
      employeeId: '',
      name: member.name,
      designation: member.designation,
      experience: member.experience,
      availability: member.availability,
    });
    setTeamModalOpen(true);
  };

  const handleSaveTeamMember = async () => {
    if (
      !teamForm.name.trim() ||
      !teamForm.designation.trim() ||
      !teamForm.experience.trim() ||
      !teamForm.availability.trim()
    ) {
      return;
    }

    if (teamModalState.mode === 'create') {
      if (!teamForm.employeeId) {
        return;
      }

      await createTeamMember.mutateAsync({
        name: teamForm.name,
        designation: teamForm.designation,
        experience: teamForm.experience,
        availability: teamForm.availability,
      });
    } else if (teamModalState.memberId) {
      await updateTeamMember.mutateAsync({
        memberId: teamModalState.memberId,
        data: {
          name: teamForm.name,
          designation: teamForm.designation,
          experience: teamForm.experience,
          availability: teamForm.availability,
        },
      });
    }

    resetTeamForm();
    setTeamModalOpen(false);
  };

  const isSavingTeam = teamModalState.mode === 'edit' ? updateTeamMember.isPending : createTeamMember.isPending;

  const handleDeleteTeamMember = async (memberId: string) => {
    await deleteTeamMember.mutateAsync(memberId);
  };

  const handleCreateReference = async () => {
    if (!referenceForm.project_name.trim() || !referenceForm.client.trim()) {
      return;
    }
    await createReference.mutateAsync(referenceForm);
    resetReferenceForm();
    setReferenceModalOpen(false);
  };

  const handleDeleteReference = async (referenceId: string) => {
    await deleteReference.mutateAsync(referenceId);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-lg">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Proposed Delivery Team</h2>
              <p className="text-sm text-gray-600">
                Pull the core delivery squad from the linked account or refine their availability inline.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="h-10 px-4 rounded-lg flex items-center gap-2 text-indigo-950 border-indigo-100 hover:bg-indigo-50"
                onClick={openCreateTeamModal}
              >
                <Plus className="h-4 w-4" />
                Add team member
              </Button>
              <Button
                asChild
                className="h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2"
              >
                <Link to="/module/resources/management">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Open resource manager</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/70 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Team size</p>
                <p className="text-lg font-semibold text-gray-900">{opportunityTeamMembers.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Distinct roles</p>
                <p className="text-lg font-semibold text-gray-900">{uniqueRoles.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Avg availability</p>
                <p className="text-lg font-semibold text-gray-900">
                  {averageAvailability != null ? `${averageAvailability}%` : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Monthly payout estimate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalMonthlyPayout > 0 ? formatCurrency(totalMonthlyPayout) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isTeamLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-14 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ) : hasTeam ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Availability</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {opportunityTeamMembers.map((member: TeamMember) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.experience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availabilityBadge(member.availability)}`}
                      >
                        {member.availability || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditTeamModal(member)}
                        >
                          <Pencil className="h-4 w-4 text-gray-400 hover:text-indigo-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTeamMember(member.id)}
                          disabled={deleteTeamMember.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No team members have been assigned to this opportunity yet.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-white via-indigo-50/20 to-white shadow-lg">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Relevant Project References</h2>
              <p className="text-sm text-gray-600">
                Portfolio wins that reinforce credibility for this opportunity.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="h-10 px-4 rounded-lg flex items-center gap-2 text-indigo-950 border-indigo-100 hover:bg-indigo-50"
                onClick={() => setReferenceModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add reference
              </Button>
              <Button
                asChild
                className="h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2"
              >
                <Link to="/module/projects">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Open project library</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isReferencesLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="h-14 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ) : hasReferences ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {references.map((project: Reference) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${referenceStatusBadge(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-semibold">
                      {formatCurrency(project.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReference(project.id)}
                        disabled={deleteReference.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No project references have been recorded yet.
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={teamModalOpen}
        onOpenChange={(open) => {
          setTeamModalOpen(open);
          if (!open) {
            resetTeamForm();
            setTeamModalState({ mode: 'create', memberId: null });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {teamModalState.mode === 'edit' ? 'Edit Team Member' : 'Add New Team Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {teamModalState.mode === 'create' && (
              <div className="space-y-1.5">
                <Label htmlFor="team-member">Select from account team</Label>
                <Select
                  value={teamForm.employeeId}
                  onValueChange={handleSelectAccountEmployee}
                  disabled={disableTeamSelection}
                >
                  <SelectTrigger id="team-member">
                    <SelectValue
                      placeholder={
                        !accountId
                          ? 'Link this opportunity to an account to pull the roster'
                          : accountTeamLoading
                          ? 'Loading account team members...'
                          : 'Choose an account team member'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccountTeamOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{option.label}</span>
                          <span className="text-xs text-gray-500">{option.subtitle}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {accountId && !accountTeamLoading && availableAccountTeamOptions.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    All account team members are already assigned to this opportunity.
                  </p>
                ) : null}
                {!accountId && (
                  <p className="text-xs text-amber-600">
                    This opportunity is not linked to an account. Associate an account to enable team selection.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="team-name">Name</Label>
                <Input
                  id="team-name"
                  value={teamForm.name}
                  readOnly={teamModalState.mode === 'create'}
                  placeholder="Select an account team member"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team-role">Designation</Label>
                <Input
                  id="team-role"
                  value={teamForm.designation}
                  onChange={(event) =>
                    setTeamForm((prev) => ({ ...prev, designation: event.target.value }))
                  }
                  placeholder="Project Manager"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team-experience">Experience</Label>
                <Input
                  id="team-experience"
                  value={teamForm.experience}
                  onChange={(event) =>
                    setTeamForm((prev) => ({ ...prev, experience: event.target.value }))
                  }
                  placeholder="10 years"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team-availability">Availability</Label>
                <Input
                  id="team-availability"
                  value={teamForm.availability}
                  onChange={(event) =>
                    setTeamForm((prev) => ({ ...prev, availability: event.target.value }))
                  }
                  placeholder="100%"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetTeamForm();
                setTeamModalOpen(false);
                setTeamModalState({ mode: 'create', memberId: null });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTeamMember}
              disabled={
                isSavingTeam ||
                (teamModalState.mode === 'create' && !teamForm.employeeId) ||
                !teamForm.name.trim() ||
                !teamForm.designation.trim() ||
                !teamForm.experience.trim() ||
                !teamForm.availability.trim()
              }
            >
              {isSavingTeam
                ? 'Saving…'
                : teamModalState.mode === 'edit'
                ? 'Save changes'
                : 'Add member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={referenceModalOpen}
        onOpenChange={(open) => {
          setReferenceModalOpen(open);
          if (!open) {
            resetReferenceForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project Reference</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="reference-project">Project name</Label>
                <Input
                  id="reference-project"
                  value={referenceForm.project_name}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({ ...prev, project_name: event.target.value }))
                  }
                  placeholder="Megapolis Central Station"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference-client">Client</Label>
                <Input
                  id="reference-client"
                  value={referenceForm.client}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({ ...prev, client: event.target.value }))
                  }
                  placeholder="City of Megapolis"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference-year">Year</Label>
                <Input
                  id="reference-year"
                  value={referenceForm.year}
                  onChange={(event) => setReferenceForm((prev) => ({ ...prev, year: event.target.value }))}
                  placeholder="2023"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference-status">Status</Label>
                <Input
                  id="reference-status"
                  value={referenceForm.status}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                  placeholder="Completed successfully"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference-amount">Total amount</Label>
                <Input
                  id="reference-amount"
                  value={referenceForm.total_amount}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({ ...prev, total_amount: event.target.value }))
                  }
                  placeholder="500000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetReferenceForm();
                setReferenceModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateReference}
              disabled={
                createReference.isPending ||
                !referenceForm.project_name.trim() ||
                !referenceForm.client.trim()
              }
            >
              {createReference.isPending ? 'Saving…' : 'Add reference'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

TeamReferencesTab.displayName = 'TeamReferencesTab';

export default TeamReferencesTab;