import { FormEvent, memo, useMemo, useState } from 'react';
import { AddButton } from './shared';
import { TabProps } from './types';
import { 
  useOpportunityCompetitors, 
  useCreateOpportunityCompetitor,
  useOpportunityStrategies,
  useCreateOpportunityStrategy 
} from '@/hooks/useOpportunityTabs';
import { Competitor, Strategy } from '@/types/opportunityTabs';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CompetitionStrategyTab = memo(({ opportunity }: TabProps) => {
  const { data: competitors = [], isLoading: competitorsLoading } = useOpportunityCompetitors(opportunity?.id || '');
  const { data: strategies = [], isLoading: strategiesLoading } = useOpportunityStrategies(opportunity?.id || '');
  const createCompetitorMutation = useCreateOpportunityCompetitor(opportunity?.id || '');
  const createStrategyMutation = useCreateOpportunityStrategy(opportunity?.id || '');
  const { toast } = useToast();

  const competitorInitialState = useMemo(
    () => ({
      companyName: '',
      threatLevel: 'Medium' as 'High' | 'Medium' | 'Low',
      strengths: '',
      weaknesses: '',
    }),
    []
  );

  const strategyInitialState = useMemo(
    () => ({
      strategyText: '',
      priority: 3,
    }),
    []
  );

  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [competitorForm, setCompetitorForm] = useState(competitorInitialState);

  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [strategyForm, setStrategyForm] = useState(strategyInitialState);

  const handleAddCompetitor = () => {
    setCompetitorForm(competitorInitialState);
    setIsCompetitorModalOpen(true);
  };

  const handleAddStrategy = () => {
    setStrategyForm(strategyInitialState);
    setIsStrategyModalOpen(true);
  };

  const handleSubmitCompetitor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!opportunity?.id) return;

    const normalizedStrengths = competitorForm.strengths
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean);

    const normalizedWeaknesses = competitorForm.weaknesses
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!competitorForm.companyName.trim()) {
      toast({
        title: 'Missing company name',
        description: 'Please provide the competitor company name before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCompetitorMutation.mutateAsync({
        company_name: competitorForm.companyName.trim(),
        threat_level: competitorForm.threatLevel,
        strengths: normalizedStrengths,
        weaknesses: normalizedWeaknesses,
      });
      setIsCompetitorModalOpen(false);
      setCompetitorForm(competitorInitialState);
    } catch (error: any) {
      toast({
        title: 'Failed to add competitor',
        description: error?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitStrategy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!opportunity?.id) return;

    if (!strategyForm.strategyText.trim()) {
      toast({
        title: 'Missing strategy detail',
        description: 'Please describe the win strategy before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createStrategyMutation.mutateAsync({
        strategy_text: strategyForm.strategyText.trim(),
        priority: strategyForm.priority,
      });
      setIsStrategyModalOpen(false);
      setStrategyForm(strategyInitialState);
    } catch (error: any) {
      toast({
        title: 'Failed to add strategy',
        description: error?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (competitorsLoading || strategiesLoading) {
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
    <div>
  
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4 bg-white rounded-tl-2xl rounded-tr-2xl flex flex-col justify-start items-start gap-5 overflow-hidden">
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="inline-flex flex-col justify-start items-start gap-1">
                <div className="text-lg font-semibold text-gray-900">Competitive Analysis</div>
              </div>
              <AddButton onClick={handleAddCompetitor} />
            </div>
          </div>
          <div className="h-px bg-black/10"></div>
        </div>
        
        <div className="px-6 pb-3 flex flex-col justify-start items-start">
          {competitors.length === 0 && (
            <div className="w-full p-6 bg-stone-50 rounded-[20px] text-sm text-gray-500">
              No competitors captured yet. Use “Add New” to document competitive insights.
            </div>
          )}
          {competitors.map((competitor: Competitor, index: number) => (
            <div key={competitor.id || index} className="w-full p-6 bg-stone-50 rounded-[20px] flex flex-col justify-start items-start gap-5">
              <div className="w-full flex flex-col justify-start items-start gap-6">
                <div className="w-full flex flex-col sm:flex-row sm:justify-start sm:items-center gap-4 sm:gap-8">
                  <div className="text-2xl font-medium text-gray-900">{competitor.company_name}</div>
                  <div className={`w-24 h-7 px-2 py-0.5 rounded-full flex justify-center items-center ${
                    competitor.threat_level === 'High' ? 'bg-red-50 text-red-600' :
                    competitor.threat_level === 'Medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    <div className="text-xs font-medium">{competitor.threat_level} Threat</div>
                  </div>
                </div>
                
                <div className="w-full flex flex-col lg:flex-row justify-start items-start gap-6">
               
                  <div className="w-full lg:flex-1 p-7 bg-white rounded-[20px] flex flex-col justify-start items-start gap-3">
                    <div className="text-lg font-medium text-gray-900">Strengths</div>
                    <div className="w-full flex flex-col justify-start items-start gap-4">
                      {competitor.strengths?.map((strength: string, strengthIndex: number) => (
                        <div key={strengthIndex} className="w-full flex flex-col justify-start items-start gap-1.5">
                          <div className="w-full flex flex-col justify-start items-start gap-1.5">
                            <div className="w-full h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-start items-center gap-2 overflow-hidden">
                              <div className="flex-1 flex justify-start items-center gap-2">
                                <div className="flex-1 text-emerald-600 text-sm font-normal leading-tight">{strength}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full lg:flex-1 p-7 bg-white rounded-[20px] flex flex-col justify-start items-start gap-3">
                    <div className="text-lg font-medium text-gray-900">Weakness</div>
                    <div className="w-full flex flex-col justify-start items-start gap-4">
                      {competitor.weaknesses?.map((weakness: string, weaknessIndex: number) => (
                        <div key={weaknessIndex} className="w-full flex flex-col justify-start items-start gap-1.5">
                          <div className="w-full flex flex-col justify-start items-start gap-1.5">
                            <div className="w-full h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-start items-center gap-2 overflow-hidden">
                              <div className="flex-1 flex justify-start items-center gap-2">
                                <div className="flex-1 text-red-600 text-sm font-normal leading-tight">{weakness}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 mb-6 p-6 bg-white rounded-2xl border border-indigo-600 flex flex-col justify-center items-start gap-5">
        <div className="w-full flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-gray-900">Win Strategy</div>
          <AddButton onClick={handleAddStrategy}>Add Strategy</AddButton>
        </div>
        <div className="h-px bg-black/10"></div>
        
        {strategies.length === 0 && (
          <div className="text-sm text-gray-500">
            Capture the strategic moves that position us ahead of competitors.
          </div>
        )}
        {strategies.map((strategy: Strategy, index: number) => (
          <div key={strategy.id || index} className="inline-flex justify-start items-center gap-3.5">
            <div className="relative">
              <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 2.53125C11.3306 2.53125 9.2099 3.17456 7.40609 4.37982C5.60229 5.58508 4.1964 7.29816 3.3662 9.30244C2.536 11.3067 2.31878 13.5122 2.74202 15.6399C3.16525 17.7676 4.20992 19.7221 5.74393 21.2561C7.27794 22.7901 9.23238 23.8348 11.3601 24.258C13.4878 24.6812 15.6933 24.464 17.6976 23.6338C19.7018 22.8036 21.4149 21.3977 22.6202 19.5939C23.8255 17.7901 24.4688 15.6694 24.4688 13.5C24.4657 10.5918 23.3091 7.80369 21.2527 5.74731C19.1963 3.69094 16.4082 2.53432 13.5 2.53125ZM22.7422 12.6563H20.1952C20.0058 11.1705 19.3284 9.78976 18.2693 8.7307C17.2102 7.67163 15.8295 6.99423 14.3438 6.80484V4.25777C16.5036 4.45774 18.5256 5.40682 20.0594 6.94062C21.5932 8.47443 22.5423 10.4964 22.7422 12.6563ZM12.6563 12.6563H8.50922C8.68586 11.6206 9.17971 10.6654 9.92257 9.92257C10.6654 9.17971 11.6206 8.68585 12.6563 8.50922V12.6563ZM12.6563 14.3438V18.4908C11.6206 18.3142 10.6654 17.8203 9.92257 17.0774C9.17971 16.3346 8.68586 15.3794 8.50922 14.3438H12.6563ZM14.3438 14.3438H18.4908C18.3142 15.3794 17.8203 16.3346 17.0774 17.0774C16.3346 17.8203 15.3794 18.3142 14.3438 18.4908V14.3438ZM14.3438 12.6563V8.50922C15.3794 8.68585 16.3346 9.17971 17.0774 9.92257C17.8203 10.6654 18.3142 11.6206 18.4908 12.6563H14.3438ZM12.6563 4.25777V6.80484C11.1705 6.99423 9.78976 7.67163 8.7307 8.7307C7.67164 9.78976 6.99424 11.1705 6.80485 12.6563H4.25778C4.45775 10.4964 5.40682 8.47443 6.94063 6.94062C8.47443 5.40682 10.4964 4.45774 12.6563 4.25777ZM4.25778 14.3438H6.80485C6.99424 15.8295 7.67164 17.2102 8.7307 18.2693C9.78976 19.3284 11.1705 20.0058 12.6563 20.1952V22.7422C10.4964 22.5423 8.47443 21.5932 6.94063 20.0594C5.40682 18.5256 4.45775 16.5036 4.25778 14.3438ZM14.3438 22.7422V20.1952C15.8295 20.0058 17.2102 19.3284 18.2693 18.2693C19.3284 17.2102 20.0058 15.8295 20.1952 14.3438H22.7422C22.5423 16.5036 21.5932 18.5256 20.0594 20.0594C18.5256 21.5932 16.5036 22.5423 14.3438 22.7422Z" fill="#4A50CF"/>
              </svg>
            </div>
            <div className="text-black text-lg font-semibold leading-relaxed">{strategy.strategy_text}</div>
          </div>
        ))}
      </div>

      <Dialog open={isCompetitorModalOpen} onOpenChange={setIsCompetitorModalOpen}>
        <DialogContent className="max-w-2xl border border-indigo-100 bg-white/95 shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Competitive Intelligence</p>
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  Add Competitor Insight
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  Capture market positioning, strengths, and risks for this opportunity.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCompetitor} className="space-y-6 font-outfit">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-gray-500 tracking-wider">Company Name</Label>
                <Input
                  placeholder="MysticHeaven Consulting"
                  value={competitorForm.companyName}
                  onChange={(event) =>
                    setCompetitorForm((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                  className="h-11 rounded-lg border-gray-200 bg-white text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-gray-500 tracking-wider">Threat Level</Label>
                <Select
                  value={competitorForm.threatLevel}
                  onValueChange={(value: 'High' | 'Medium' | 'Low') =>
                    setCompetitorForm((prev) => ({ ...prev, threatLevel: value }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white text-sm">
                    <SelectValue placeholder="Select threat level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High Threat</SelectItem>
                    <SelectItem value="Medium">Medium Threat</SelectItem>
                    <SelectItem value="Low">Low Threat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-500 tracking-wider">Strengths</Label>
              <Textarea
                placeholder="List each strength on a new line"
                value={competitorForm.strengths}
                onChange={(event) =>
                  setCompetitorForm((prev) => ({ ...prev, strengths: event.target.value }))
                }
                rows={4}
                className="rounded-lg border-gray-200 bg-white text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-500 tracking-wider">Weaknesses</Label>
              <Textarea
                placeholder="List each weakness on a new line"
                value={competitorForm.weaknesses}
                onChange={(event) =>
                  setCompetitorForm((prev) => ({ ...prev, weaknesses: event.target.value }))
                }
                rows={4}
                className="rounded-lg border-gray-200 bg-white text-sm leading-relaxed"
              />
            </div>

            <DialogFooter className="mt-6 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => setIsCompetitorModalOpen(false)} className="h-11 px-5">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCompetitorMutation.isPending}
                className="h-11 rounded-lg bg-indigo-950 px-6 text-sm font-semibold text-white shadow-lg hover:bg-indigo-900"
              >
                {createCompetitorMutation.isPending ? 'Saving...' : 'Save Competitor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStrategyModalOpen} onOpenChange={setIsStrategyModalOpen}>
        <DialogContent className="max-w-xl border border-emerald-100 bg-white/95 shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Win Strategy</p>
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  Add Strategic Play
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  Document the strategic actions and prioritise them for the pursuit team.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitStrategy} className="space-y-6 font-outfit">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-500 tracking-wider">Strategy Detail</Label>
              <Textarea
                placeholder="Leverage Mystic-Heaven style executive briefings to secure sponsorship..."
                value={strategyForm.strategyText}
                onChange={(event) =>
                  setStrategyForm((prev) => ({ ...prev, strategyText: event.target.value }))
                }
                rows={4}
                className="rounded-lg border-gray-200 bg-white text-sm leading-relaxed"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-500 tracking-wider">Priority (1-10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={strategyForm.priority}
                onChange={(event) =>
                  setStrategyForm((prev) => ({
                    ...prev,
                    priority: Number(event.target.value) || 1,
                  }))
                }
                className="h-11 rounded-lg border-gray-200 bg-white text-sm"
              />
            </div>

            <DialogFooter className="mt-6 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => setIsStrategyModalOpen(false)} className="h-11 px-5">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createStrategyMutation.isPending}
                className="h-11 rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500"
              >
                {createStrategyMutation.isPending ? 'Saving...' : 'Save Strategy'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

CompetitionStrategyTab.displayName = 'CompetitionStrategyTab';

export default CompetitionStrategyTab;