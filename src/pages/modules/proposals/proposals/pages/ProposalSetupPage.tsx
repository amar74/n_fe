import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Calendar,
  DollarSign,
  Brain,
  Target,
  Building2,
  Users,
  Search,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/shared';
import { useOpportunities } from '@/hooks/opportunities/useOpportunities';
import { apiClient } from '@/services/api/client';

interface Opportunity {
  id: number;
  name: string;
  client: string;
  value: string;
  stage: string;
  state: string;
  city: string;
  probability: number;
  aiMatchScore: number;
  deadline: string;
  marketSector: string;
  description: string;
}

interface Account {
  id: number;
  name: string;
  type: string;
  location: string;
  contacts: number;
  relationshipScore: number;
  lastActivity: string;
}

export default function ProposalSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null);
  const [linkedAccount, setLinkedAccount] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  // Fetch opportunities from API
  const { data: opportunitiesData, isLoading: isLoadingOpportunities } = useOpportunities({
    page: 1,
    size: 100,
  });

  const opportunities = useMemo(() => {
    return (opportunitiesData?.opportunities || []).map((opp: any) => ({
      id: opp.id,
      name: opp.project_name || opp.title || 'Untitled Opportunity',
      client: opp.account_name || 'Unknown Client',
      value: opp.estimated_value ? `$${(opp.estimated_value / 1000000).toFixed(1)}M` : '$0',
      stage: opp.stage || 'Proposal',
      state: opp.state || '',
      city: opp.city || '',
      probability: opp.win_probability || 50,
      aiMatchScore: 85,
      deadline: opp.submission_deadline || opp.due_date || '',
      marketSector: opp.market_sector || '',
      description: opp.description || '',
      account_id: opp.account_id,
    }));
  }, [opportunitiesData]);

  // Auto-link account when opportunity is selected
  useEffect(() => {
    if (selectedOpportunity?.account_id) {
      const fetchAccount = async () => {
        try {
          const response = await apiClient.get(`/accounts/${selectedOpportunity.account_id}`);
          const account = response.data;
          setLinkedAccount({
            id: account.id,
            name: account.account_name || account.client_name || selectedOpportunity.client,
            type: account.account_type || 'Client',
            location: `${account.city || ''}, ${account.state || ''}`.trim() || 'Unknown',
            contacts: 0,
            relationshipScore: 85,
            lastActivity: new Date().toISOString().split('T')[0],
          });
          toast.success(`AI Auto-Link Complete: Client account "${account.account_name || account.client_name}" has been automatically linked to this proposal.`);
        } catch (error) {
          console.debug('Could not fetch account:', error);
          setLinkedAccount(null);
        }
      };
      fetchAccount();
    } else {
      setLinkedAccount(null);
    }
  }, [selectedOpportunity, toast]);

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.marketSector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "all" || opp.stage.toLowerCase() === filterStage.toLowerCase();
    return matchesSearch && matchesStage;
  });

  const handleNext = () => {
    if (!selectedOpportunity) {
      toast.error("Please select an opportunity. You must select an opportunity from the pipeline to continue.");
      return;
    }

    navigate(`/proposals/create?opportunityId=${selectedOpportunity.id}&accountId=${selectedOpportunity.account_id || linkedAccount?.id}`);
  };


  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Back Button */}
        <div>
          <Link
            to="/proposals"
            className="inline-flex items-center p-2 text-gray-600 hover:text-[#161950] hover:bg-gray-50 rounded-lg transition-colors font-outfit"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Proposals</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-[#1A1A1A] flex items-center gap-3 font-outfit">
              <FileText className="h-8 w-8 text-[#161950]" />
              Create New Proposal
            </h2>
            <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          <p className="text-lg text-gray-600 font-outfit">
            Select an opportunity from your pipeline and AI will automatically link the client account
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-[#161950] text-white rounded-full text-sm font-semibold font-outfit">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-[#161950] font-outfit">Select Opportunity</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-[#161950]/20 text-[#161950] rounded-full text-sm font-semibold font-outfit border-2 border-[#161950]">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-[#161950] font-outfit">Proposal Development</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunity Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <div className="mb-6">
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#161950]" />
                  Pipeline Opportunities
                </h3>
                <p className="text-gray-600 text-sm font-outfit">
                  Select an opportunity from your pipeline to create a proposal
                </p>
              </div>
              <div>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-outfit border-gray-200 focus:border-[#161950] focus:ring-[#161950]"
                    />
                  </div>
                  <Select value={filterStage} onValueChange={setFilterStage}>
                    <SelectTrigger className="w-48 font-outfit border-gray-200 focus:border-[#161950] focus:ring-[#161950]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-outfit">All Stages</SelectItem>
                      <SelectItem value="proposal" className="font-outfit">Proposal</SelectItem>
                      <SelectItem value="negotiation" className="font-outfit">Negotiation</SelectItem>
                      <SelectItem value="research" className="font-outfit">Research</SelectItem>
                      <SelectItem value="qualification" className="font-outfit">Qualification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Opportunities List */}
                {isLoadingOpportunities ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading opportunities...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className={`bg-white rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                        selectedOpportunity?.id === opportunity.id
                          ? 'border-[#161950] bg-[#161950]/5'
                          : 'border-gray-200 hover:border-[#161950]'
                      } shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]`}
                      onClick={() => setSelectedOpportunity(opportunity)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg font-outfit text-[#1A1A1A]">{opportunity.name}</h4>
                              {selectedOpportunity?.id === opportunity.id && (
                                <CheckCircle2 className="h-5 w-5 text-[#161950]" />
                              )}
                            </div>
                            <p className="text-gray-600 mb-2 font-outfit">{opportunity.client}</p>
                            <p className="text-sm text-gray-500 mb-3 font-outfit">{opportunity.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm font-outfit">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-[#161950]" />
                                <span className="font-medium text-[#161950]">{opportunity.value}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">{opportunity.city}, {opportunity.state}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-[#161950]" />
                                <span className="text-gray-600">{opportunity.deadline}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                              <Brain className="h-3 w-3 mr-1" />
                              {opportunity.aiMatchScore}% Match
                            </Badge>
                            <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                              {opportunity.stage}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Progress value={opportunity.probability} className="w-16 h-2" />
                              <span className="text-xs font-medium font-outfit text-[#161950]">{opportunity.probability}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}

                {!isLoadingOpportunities && filteredOpportunities.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-outfit">No opportunities found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Auto-Linked Account */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <div className="mb-6">
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#161950]" />
                  AI Auto-Linked Account
                </h3>
                <p className="text-gray-600 text-sm font-outfit">
                  Client account automatically linked by AI
                </p>
              </div>
              <div>
                {linkedAccount ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#161950]/5 border border-[#161950]/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-[#161950]" />
                        <h4 className="font-semibold text-[#1A1A1A] font-outfit">{linkedAccount.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 font-outfit">{linkedAccount.type}</p>
                      <p className="text-sm text-gray-600 mb-3 font-outfit">{linkedAccount.location}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm font-outfit">
                        <div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-[#161950]" />
                            <span className="text-gray-600">{linkedAccount.contacts} Contacts</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-[#161950]" />
                            <span className="text-gray-600">{linkedAccount.relationshipScore}% Score</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#161950]/20">
                        <p className="text-xs text-gray-600 font-outfit">
                          Last Activity: {linkedAccount.lastActivity}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link to="/accounts" className="text-[#161950] hover:text-[#0f1440] text-sm underline font-outfit">
                        View Full Account Details →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm font-outfit">
                      Select an opportunity to automatically link the client account
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Button */}
            <div className="mt-6">
              <Button
                onClick={handleNext}
                disabled={!selectedOpportunity}
                className="w-full bg-[#161950] hover:bg-[#0f1440] h-11"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                Continue to Proposal Development
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

