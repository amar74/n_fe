import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useOpportunityDeliveryModel,
  useOpportunityFinancialSummary,
  useOpportunityTeamMembers,
} from '@/hooks/opportunities';
import { useAccountTeam } from '@/hooks/accounts';
import type { DeliveryModelEntry, DeliveryModelPhase, FinancialSummaryData } from '@/types/opportunityTabs';

interface FinancialSummaryTabProps {
  opportunity: any;
}

const palette = [
  { className: 'bg-emerald-500', color: '#10b981' },
  { className: 'bg-indigo-500', color: '#6366f1' },
  { className: 'bg-orange-500', color: '#f97316' },
  { className: 'bg-amber-500', color: '#f59e0b' },
  { className: 'bg-purple-500', color: '#8b5cf6' },
  { className: 'bg-teal-500', color: '#14b8a6' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const deriveAvailabilityMultiplier = (availability: string | number | null | undefined) => {
  if (typeof availability === 'number' && Number.isFinite(availability)) {
    return Math.min(Math.max(availability / 100, 0), 1);
  }

  if (typeof availability === 'string') {
    const parsed = Number(availability.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(parsed)) {
      return Math.min(Math.max(parsed / 100, 0), 1);
    }
  }

  return 1;
};

const buildPhaseCategories = (model: DeliveryModelEntry | null) => {
  if (!model) return [];

  const phases = model.phases ?? [];
  const total = phases.reduce((sum, phase) => sum + Number(phase?.budget ?? 0), 0);

  return phases
    .map((phase, index) => {
      const amount = Number(phase?.budget ?? 0);
      return {
        name: phase?.name || `Phase ${index + 1}`,
        amount,
        percentage: total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0,
        colorIndex: index,
      };
    })
    .filter((item) => item.amount > 0);
};

const FinancialSummaryTab = memo(({ opportunity }: FinancialSummaryTabProps) => {
  const opportunityId = opportunity?.id || '';

  const { data: financialSummary, isLoading: isFinancialLoading } =
    useOpportunityFinancialSummary(opportunityId);
  const { data: deliveryModelData, isLoading: isDeliveryModelLoading } =
    useOpportunityDeliveryModel(opportunityId);
  const { data: opportunityTeamMembers = [], isLoading: isOpportunityTeamLoading } =
    useOpportunityTeamMembers(opportunityId);
  const opportunityAccountId: string = opportunity?.account_id || '';
  const {
    teamMembers: accountTeamMembers = [],
    isLoading: isAccountTeamLoading,
  } = useAccountTeam(opportunityAccountId);

  const financialData: FinancialSummaryData | undefined = financialSummary;
  const deliveryModels = deliveryModelData?.models ?? [];

  const activeModel: DeliveryModelEntry | null = useMemo(() => {
    if (deliveryModels.length) {
      return deliveryModels.find((model) => model.is_active) ?? deliveryModels[0];
    }

    if ((deliveryModelData?.key_phases?.length ?? 0) > 0) {
      const fallbackPhases = (deliveryModelData?.key_phases as DeliveryModelPhase[]) ?? [];
      return {
        model_id: 'fallback',
        approach: deliveryModelData?.approach ?? 'Active delivery model',
        phases: fallbackPhases,
        is_active: true,
        total_budget: fallbackPhases.reduce(
          (sum, phase) => sum + Number(phase?.budget ?? 0),
          0,
        ),
        notes: null,
        updated_by: null,
        last_updated: null,
      };
    }

    return null;
  }, [deliveryModelData?.approach, deliveryModelData?.key_phases, deliveryModels]);

  const phaseCategories = useMemo(() => buildPhaseCategories(activeModel), [activeModel]);

  const fallbackCategories =
    financialData?.budget_categories?.map((category, index) => ({
      name: category.name,
      amount: Number(category.amount ?? 0),
      percentage: Number(category.percentage ?? 0),
      colorIndex: index,
    })) ?? [];

  const categories = phaseCategories.length ? phaseCategories : fallbackCategories;
  const totalBudget = phaseCategories.length
    ? phaseCategories.reduce((sum, category) => sum + category.amount, 0)
    : Number(financialData?.total_project_value ?? 0);

  const contingency = financialData?.contingency_percentage ?? 0;
  const profitMargin = financialData?.profit_margin_percentage ?? 0;

  const hasFinancialSummary =
    !!financialData &&
    ((financialData.total_project_value ?? 0) > 0 ||
      (financialData.contingency_percentage ?? 0) > 0 ||
      (financialData.profit_margin_percentage ?? 0) > 0 ||
      (financialData.budget_categories?.length ?? 0) > 0);

  const contingencyAmount =
    hasFinancialSummary && totalBudget ? totalBudget * (contingency / 100) : null;

  const isLoading = isFinancialLoading || isDeliveryModelLoading;
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const activeCategory =
    hoveredCategory != null && categories[hoveredCategory] ? categories[hoveredCategory] : null;
  const canManage = Boolean(activeModel);
  const activeTemplateId = (activeModel as { templateId?: string | null } | null)?.templateId;
  const manageHref = activeTemplateId
    ? `/module/delivery-models?templateId=${activeTemplateId}`
    : '/module/delivery-models';

  const TEAM_MONTHLY_HOURS = 160;
  const teamBudgetRows = useMemo(() => {
    if (!opportunityTeamMembers.length || !accountTeamMembers.length) {
      return [];
    }

    return opportunityTeamMembers.map((member) => {
      const matchedAccountMember = accountTeamMembers.find((acctMember) =>
        acctMember.employee?.name?.trim().toLowerCase() === member.name?.trim().toLowerCase(),
      );

      const hourlyRate = Number(matchedAccountMember?.employee?.bill_rate ?? 0);
      if (!hourlyRate) {
        return null;
      }

      const availabilityMultiplier = deriveAvailabilityMultiplier(member.availability);
      const monthlyCost = hourlyRate * TEAM_MONTHLY_HOURS * availabilityMultiplier;

      return {
        id: member.id,
        name: member.name,
        designation: member.designation,
        availability: member.availability || '100%',
        hourlyRate,
        monthlyCost,
      };
    }).filter((row): row is NonNullable<typeof row> => Boolean(row));
  }, [accountTeamMembers, opportunityTeamMembers]);

  const totalMonthlyTeamBudget = teamBudgetRows.reduce((sum, row) => sum + row.monthlyCost, 0);
  const isTeamBudgetLoading = isOpportunityTeamLoading || isAccountTeamLoading;
  const hasTeamBudget = teamBudgetRows.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Budget Breakdown</h2>
            <Button
              asChild
              className="h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2"
              disabled={!canManage}
            >
              <Link to={manageHref}>
                <Layers className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
                  {canManage ? 'Manage delivery model' : 'No delivery model linked'}
                </span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-10 bg-gray-100 w-32 rounded" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-12 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="flex-1 space-y-8 w-full">
                <div className="text-center lg:text-left">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {totalBudget ? formatCurrency(totalBudget) : '—'}
                  </div>
                  <div className="text-2xl font-medium text-gray-900">Total Project Budget</div>
                  {activeModel?.approach ? (
                    <div className="mt-2 text-sm text-gray-500">
                      Linked delivery model: <span className="font-medium text-gray-700">{activeModel.approach}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-amber-600">
                      No delivery model is linked yet. Use &ldquo;Manage delivery model&rdquo; to configure phases and budgets.
                    </div>
                  )}
                </div>

                {categories.length > 0 ? (
                  <div className="space-y-4">
                    {categories.map((category, index) => (
                      <div
                        key={`${category.name}-${category.colorIndex}`}
                        className="space-y-2 rounded-xl transition-colors"
                        onMouseEnter={() => setHoveredCategory(index)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                            className={`h-3 w-3 rounded-full ${
                              palette[category.colorIndex % palette.length].className
                            }`}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {category.name}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${
                              palette[category.colorIndex % palette.length].className
                            }`}
                            style={{
                              width: `${Math.max(Math.min(category.percentage, 100), 4)}%`,
                              opacity: hoveredCategory === index ? 1 : 0.7,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
                    No budget breakdown is available for this opportunity.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {contingencyAmount != null ? formatCurrency(contingencyAmount) : '—'}
                    </div>
                    <div className="text-lg font-medium text-gray-500">
                      Contingency
                      {hasFinancialSummary ? ` (${contingency.toFixed(1)}%)` : ' (not provided)'}
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {hasFinancialSummary ? `${profitMargin.toFixed(1)}%` : '—'}
                    </div>
                    <div className="text-lg font-medium text-gray-500">
                      Profit Margin{hasFinancialSummary ? '' : ' (not provided)'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                  <div className="absolute inset-0 w-full h-full bg-white rounded-full border-8 border-gray-200" />
                  <div
                    className="absolute inset-0 w-full h-full rounded-full"
                    style={{
                      background: (() => {
                        if (!categories.length) {
                          return 'conic-gradient(#6366f1 0deg 360deg)';
                        }

                        const segments = categories.map((category, index) => {
                          const start = categories
                            .slice(0, index)
                            .reduce((sum, cat) => sum + Number(cat.percentage || 0), 0);
                          const end = start + Number(category.percentage || 0);
                          const { color } = palette[index % palette.length];
                          return `${color} ${start * 3.6}deg ${end * 3.6}deg`;
                        });

                        return `conic-gradient(${segments.join(', ')})`;
                      })(),
                    }}
                  />
                  <div className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm uppercase tracking-wide text-gray-400">Budget Spread</div>
                      {activeCategory ? (
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-gray-900">
                            {activeCategory.name}
                          </div>
                          <div className="text-sm font-medium text-gray-600">
                            {activeCategory.percentage.toFixed(1)}% • {formatCurrency(activeCategory.amount)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-semibold text-gray-900">
                          {categories.length ? `${categories.length} Categories` : 'No Data'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-100 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Team Budget Summary</h2>
            <p className="text-sm text-gray-500">
              Monthly cost projection based on account team bill rates and delivery-model availability.
            </p>
          </div>
        </div>

        <div className="p-6">
          {isTeamBudgetLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-40 bg-gray-100 rounded" />
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          ) : hasTeamBudget ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                <div>
                  <div className="text-4xl font-bold text-indigo-600">
                    {formatCurrency(totalMonthlyTeamBudget)}
                  </div>
                  <div className="text-sm text-gray-500">Projected monthly spend (team)</div>
                </div>
                <div className="text-sm text-gray-500">
                  Assumes {TEAM_MONTHLY_HOURS} billable hours / FTE. Availability adjusts per member.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Team Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Availability
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Hourly Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Monthly Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamBudgetRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {row.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{row.designation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{row.availability}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {formatCurrency(row.hourlyRate)}<span className="text-xs text-gray-400">/hr</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                          {formatCurrency(row.monthlyCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
              Team billing data is not available. Ensure account team members have bill rates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FinancialSummaryTab.displayName = 'FinancialSummaryTab';

export default FinancialSummaryTab;

