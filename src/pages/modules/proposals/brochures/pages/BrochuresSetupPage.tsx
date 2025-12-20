import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Book,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  Brain,
  ArrowRight,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useProposals } from '@/hooks/proposals';
import { apiClient } from '@/services/api/client';

export default function BrochuresSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProposal, isCreating } = useProposals();
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [linkedOpportunities, setLinkedOpportunities] = useState<any[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null);
  const [brochureTitle, setBrochureTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoadingAccounts(true);
      try {
        const response = await apiClient.get('/accounts/?page=1&size=100');
        // API returns { accounts: [...], pagination: {...} }
        const accountsData = response.data.accounts || response.data.items || [];
        setAccounts(accountsData);
      } catch (error: any) {
        console.error('Error fetching accounts:', error);
        toast.error('Failed to load accounts');
      } finally {
        setIsLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, [toast]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account: any) =>
      (account.client_name || account.account_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const handleAccountSelect = async (account: any) => {
    setSelectedAccount(account);
    setSelectedOpportunity(null); // Reset opportunity selection when account changes
    setIsAnalyzing(true);
    
    // Reset brochure title - will be updated when opportunity is selected
    setBrochureTitle('');
    
    // Fetch opportunities for this account
    const accountId = account.account_id || account.id;
    if (accountId) {
      setIsLoadingOpportunities(true);
      try {
        const oppResponse = await apiClient.get(`/opportunities/by-account/${accountId}?page=1&size=100`);
        const opportunities = oppResponse.data.opportunities || oppResponse.data.items || [];
        setLinkedOpportunities(opportunities);
        
        // Simulate AI analysis (matching mystic-heaven pattern)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const accountName = account.client_name || account.account_name || 'Client';
        toast.success(`Account "${accountName}" selected. Found ${opportunities.length} opportunities.`);
      } catch (error: any) {
        console.error('Error fetching opportunities:', error);
        // Don't show error toast, just set empty array
        setLinkedOpportunities([]);
        const accountName = account.client_name || account.account_name || 'Client';
        toast.success(`Account "${accountName}" selected.`);
      } finally {
        setIsLoadingOpportunities(false);
        setIsAnalyzing(false);
      }
    } else {
      setLinkedOpportunities([]);
      setIsAnalyzing(false);
      toast.success(`Account "${account.client_name || account.account_name}" selected.`);
    }
  };

  const handleOpportunitySelect = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    
    // Auto-generate brochure title based on account and opportunity (matching mystic-heaven pattern)
    const accountName = selectedAccount?.client_name || selectedAccount?.account_name || 'Client';
    const oppName = opportunity.project_name || opportunity.title || 'Opportunity';
    setBrochureTitle(`${accountName} - ${oppName} - Service Capabilities Brochure`);
    
    toast.success(`Opportunity "${oppName}" selected.`);
  };

  const handleContinue = async () => {
    if (!selectedAccount) {
      toast.error('Please select an account to continue');
      return;
    }

    if (!selectedOpportunity) {
      toast.error('Please select an opportunity to continue');
      return;
    }

    try {
      // Use account_id (UUID) from API response, fallback to id for compatibility
      const accountId = selectedAccount.account_id || selectedAccount.id;
      if (!accountId) {
        toast.error('Invalid account ID');
        return;
      }

      // Use opportunity_id (UUID)
      const opportunityId = selectedOpportunity.id;
      if (!opportunityId) {
        toast.error('Invalid opportunity ID');
        return;
      }
      
      // Use auto-generated title or fallback (matching mystic-heaven pattern)
      const finalTitle = brochureTitle || `${selectedAccount.client_name || selectedAccount.account_name} - Service Capabilities Brochure`;
      
      const newBrochure = await createProposal({
        title: finalTitle,
        account_id: accountId,
        opportunity_id: opportunityId,
        proposal_type: 'brochure',
        status: 'draft',
      });
      
      navigate(`/module/proposals/brochures/${newBrochure.id}/edit`);
      toast.success('Brochure created successfully');
    } catch (error: any) {
      console.error('Error creating brochure:', error);
      toast.error(error.response?.data?.detail || 'Failed to create brochure');
    }
  };

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/module/proposals/brochures')}
            className="font-outfit text-gray-600 hover:text-[#161950]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-outfit text-[#1A1A1A] mb-2 flex items-center gap-2">
              <Book className="h-8 w-8 text-[#161950]" />
              Create New Brochure
            </h1>
            <p className="text-gray-600 font-outfit">
              Select a client account and AI will automatically link relevant opportunities
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold font-outfit ${
                selectedAccount ? 'bg-[#161950] text-white' : 'bg-[#161950] text-white'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium font-outfit text-[#161950]">Select Account</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold font-outfit ${
                selectedOpportunity ? 'bg-[#161950] text-white' : 'bg-[#161950]/20 text-[#161950] border-2 border-[#161950]'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium font-outfit text-[#161950]">Select Opportunity</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold font-outfit ${
                selectedOpportunity ? 'bg-[#161950]/20 text-[#161950] border-2 border-[#161950]' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium font-outfit text-gray-400">Brochure Development</span>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {!selectedAccount ? (
              <>
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-outfit"
                  />
                </div>

                <div className="space-y-3">
                  {isLoadingAccounts ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading accounts...</p>
                      </div>
                    </div>
                  ) : filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => {
                      const accountId = account.account_id || account.id;
                      return (
                      <Card
                        key={accountId}
                        className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                          selectedAccount?.account_id === accountId || selectedAccount?.id === accountId
                            ? 'border-[#161950] bg-[#161950]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAccountSelect(account)}
                      >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="bg-[#161950]/10 p-3 rounded-lg">
                              <Building2 className="h-6 w-6 text-[#161950]" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold font-outfit text-[#1A1A1A] mb-1">
                                {account.client_name || account.account_name || 'Unknown Account'}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 font-outfit">
                                <span>{account.client_type || account.account_type || 'Client'}</span>
                                <span>•</span>
                                <span>
                                  {account.client_address?.city 
                                    ? `${account.client_address.city}, ${account.client_address.state || ''}`.trim()
                                    : account.city 
                                    ? `${account.city}, ${account.state || ''}`.trim() 
                                    : 'Unknown Location'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                                  85% Relationship
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {(selectedAccount?.account_id === accountId || selectedAccount?.id === accountId) && (
                            <CheckCircle2 className="h-6 w-6 text-[#161950]" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">No accounts found</div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Show selected account with back option */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAccount(null);
                        setSelectedOpportunity(null);
                        setLinkedOpportunities([]);
                        setBrochureTitle('');
                      }}
                      className="font-outfit text-gray-600 hover:text-[#161950]"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Change Account
                    </Button>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#161950]" />
                      <span className="font-semibold font-outfit text-[#1A1A1A]">
                        {selectedAccount.client_name || selectedAccount.account_name || 'Unknown Account'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Show opportunities list */}
                <div>
                  <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-3">
                    Select an Opportunity
                  </h3>
                  {isLoadingOpportunities ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading opportunities...</p>
                      </div>
                    </div>
                  ) : linkedOpportunities.length > 0 ? (
                    <div className="space-y-3">
                      {linkedOpportunities.map((opp: any) => (
                        <Card
                          key={opp.id}
                          className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                            selectedOpportunity?.id === opp.id
                              ? 'border-[#161950] bg-[#161950]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleOpportunitySelect(opp)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="bg-[#161950]/10 p-3 rounded-lg">
                                  <Target className="h-5 w-5 text-[#161950]" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold font-outfit text-[#1A1A1A] mb-1">
                                    {opp.project_name || opp.title || 'Untitled Opportunity'}
                                  </h3>
                                  {opp.description && (
                                    <p className="text-sm text-gray-600 font-outfit line-clamp-2">
                                      {opp.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-outfit">
                                    {opp.stage && (
                                      <Badge variant="outline" className="font-outfit">
                                        {opp.stage}
                                      </Badge>
                                    )}
                                    {opp.project_value && (
                                      <span>
                                        {new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: opp.currency || 'USD',
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0
                                        }).format(opp.project_value)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {selectedOpportunity?.id === opp.id && (
                                <CheckCircle2 className="h-6 w-6 text-[#161950]" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No opportunities found for this account.</p>
                      <p className="text-sm text-gray-400">Please select a different account or create an opportunity first.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            {selectedAccount && (
              <div className="bg-[#161950]/5 rounded-2xl border-2 border-[#161950]/20 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#161950]/10 p-2 rounded-lg border border-[#161950]/20">
                    {isAnalyzing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#161950]"></div>
                    ) : (
                      <Brain className="h-5 w-5 text-[#161950]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold font-outfit text-[#1A1A1A]">
                      {isAnalyzing ? 'AI Analyzing...' : 'AI Auto-Linked'}
                    </h3>
                    <p className="text-xs text-gray-600 font-outfit">
                      {isAnalyzing 
                        ? 'Linking opportunities and analyzing account data...' 
                        : 'Automatically linked relevant information'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                        Account Selected
                      </p>
                      <CheckCircle2 className="h-4 w-4 text-[#161950]" />
                    </div>
                    <p className="text-sm text-gray-600 font-outfit">{selectedAccount.client_name || selectedAccount.account_name || 'Unknown Account'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit">
                        85% Relationship
                      </Badge>
                    </div>
                  </div>
                  {selectedOpportunity && (
                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                          Selected Opportunity
                        </p>
                        <CheckCircle2 className="h-4 w-4 text-[#161950]" />
                      </div>
                      <p className="text-sm text-gray-600 font-outfit font-medium">
                        {selectedOpportunity.project_name || selectedOpportunity.title || 'Untitled Opportunity'}
                      </p>
                      {selectedOpportunity.project_value && (
                        <p className="text-xs text-gray-500 font-outfit mt-1">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: selectedOpportunity.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(selectedOpportunity.project_value)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                        Opportunities
                      </p>
                      <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit">
                        {isLoadingOpportunities ? 'Loading...' : `${linkedOpportunities.length} Available`}
                      </Badge>
                    </div>
                    {isLoadingOpportunities ? (
                      <div className="text-xs text-gray-500 font-outfit">Loading opportunities...</div>
                    ) : linkedOpportunities.length > 0 ? (
                      <p className="text-xs text-gray-600 font-outfit">
                        {linkedOpportunities.length} opportunity{linkedOpportunities.length !== 1 ? 'ies' : ''} found. Select one to continue.
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 font-outfit">No opportunities linked</p>
                    )}
                  </div>
                  {brochureTitle && (
                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                          Brochure Title
                        </p>
                        <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit">
                          AI Generated
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 font-outfit font-medium">
                        {brochureTitle}
                      </p>
                    </div>
                  )}
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                        Qualifications
                      </p>
                      <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit">
                        Auto-Linked
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 font-outfit">
                      {selectedAccount.market_sector 
                        ? `${selectedAccount.market_sector} capabilities will be highlighted`
                        : 'Relevant qualifications will be included'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleContinue}
              disabled={!selectedAccount || !selectedOpportunity || isCreating || isAnalyzing}
              className="w-full bg-[#161950] hover:bg-[#0f1440] font-outfit disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating Brochure...' : isAnalyzing ? 'Analyzing...' : !selectedOpportunity ? 'Select an Opportunity First' : 'Continue to Brochure Development'}
              {!isCreating && !isAnalyzing && selectedOpportunity && <ArrowRight className="h-4 w-4 ml-2" />}
              {(isCreating || isAnalyzing) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              )}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

