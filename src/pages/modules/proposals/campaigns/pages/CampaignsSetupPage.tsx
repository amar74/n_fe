import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Megaphone,
  Building2,
  Search,
  CheckCircle2,
  Sparkles,
  Brain,
  Target,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function CampaignsSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProposal, isCreating } = useProposals();
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [campaignType, setCampaignType] = useState('social-media');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Fetch accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoadingAccounts(true);
      try {
        const response = await apiClient.get('/accounts/?page=1&size=100');
        setAccounts(response.data.items || []);
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
      (account.account_name || account.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account);
    toast.success(`Account "${account.account_name || account.client_name}" selected.`);
  };

  const handleContinue = async () => {
    if (!selectedAccount) {
      toast.error('Please select an account to continue');
      return;
    }

    try {
      const newCampaign = await createProposal({
        title: `Campaign for ${selectedAccount.account_name || selectedAccount.client_name}`,
        account_id: selectedAccount.id,
        proposal_type: 'campaign',
        status: 'draft',
      });
      
      navigate(`/module/proposals/campaigns/${newCampaign.id}/edit`);
      toast.success('Campaign created successfully');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    }
  };

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/module/proposals/campaigns')}
            className="font-outfit text-gray-600 hover:text-[#161950]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-outfit text-[#1A1A1A] mb-2 flex items-center gap-2">
              <Megaphone className="h-8 w-8 text-[#161950]" />
              Create New Campaign
            </h1>
            <p className="text-gray-600 font-outfit">
              Select account and campaign type to start with AI-powered content generation
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-[#161950] text-white rounded-full text-sm font-semibold font-outfit">
                1
              </div>
              <span className="ml-2 text-sm font-medium font-outfit text-[#161950]">Select Account</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-[#161950]/20 text-[#161950] rounded-full text-sm font-semibold font-outfit border-2 border-[#161950]">
                2
              </div>
              <span className="ml-2 text-sm font-medium font-outfit text-[#161950]">Campaign Development</span>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-4">Select Account</h3>
              <div className="flex items-center gap-3 mb-4">
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
                  filteredAccounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                      selectedAccount?.id === account.id
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
                              {account.account_name || account.client_name || 'Unknown Account'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 font-outfit">
                              <span>{account.account_type || 'Client'}</span>
                              <span>•</span>
                              <span>{account.city ? `${account.city}, ${account.state || ''}`.trim() : 'Unknown Location'}</span>
                            </div>
                            <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 mt-2 font-outfit">
                              85% Relationship
                            </Badge>
                          </div>
                        </div>
                        {selectedAccount?.id === account.id && (
                          <CheckCircle2 className="h-6 w-6 text-[#161950]" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No accounts found</div>
                )}
              </div>
            </div>

            {selectedAccount && (
              <div>
                <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-4">Campaign Type</h3>
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger className="font-outfit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="email">Email Marketing</SelectItem>
                    <SelectItem value="digital">Digital Marketing</SelectItem>
                    <SelectItem value="print">Print Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {selectedAccount && (
              <Card className="border-2 border-[#161950] bg-[#161950]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-outfit">
                    <Brain className="h-5 w-5 text-[#161950]" />
                    AI Content Generation
                  </CardTitle>
                  <CardDescription className="font-outfit">
                    AI will generate campaign content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-1">
                      Account Selected
                    </p>
                    <p className="text-sm text-gray-600 font-outfit">{selectedAccount.account_name || selectedAccount.client_name || 'Unknown Account'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-1">
                      Campaign Type
                    </p>
                    <p className="text-sm text-gray-600 font-outfit capitalize">{campaignType.replace('-', ' ')}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleContinue}
              disabled={!selectedAccount || isCreating}
              className="w-full bg-[#161950] hover:bg-[#0f1440] font-outfit"
            >
              {isCreating ? 'Creating...' : 'Continue to Campaign Development'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

