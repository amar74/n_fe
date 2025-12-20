import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Building2,
  Search,
  CheckCircle2,
  Sparkles,
  Brain,
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

export default function InterviewsSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProposal, isCreating } = useProposals();
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [interviewFormat, setInterviewFormat] = useState('in-person');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

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

  const handleSchedule = async () => {
    if (!selectedAccount || !interviewDate || !interviewTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time for due_date
      const dueDate = interviewDate ? new Date(`${interviewDate}T${interviewTime}`).toISOString().split('T')[0] : null;
      
      const newInterview = await createProposal({
        title: `Interview with ${selectedAccount.account_name || selectedAccount.client_name}`,
        account_id: selectedAccount.id,
        proposal_type: 'interview',
        status: 'draft',
        due_date: dueDate,
      });
      
      navigate(`/module/proposals/interviews/${newInterview.id}/edit`);
      toast.success('Interview created successfully');
    } catch (error: any) {
      console.error('Error creating interview:', error);
      toast.error(error.response?.data?.detail || 'Failed to create interview');
    }
  };

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/module/proposals/interviews')}
            className="font-outfit text-gray-600 hover:text-[#161950]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-outfit text-[#1A1A1A] mb-2 flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-[#161950]" />
              Schedule Interview
            </h1>
            <p className="text-gray-600 font-outfit">
              Select account and schedule interview with AI preparation assistance
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
              <span className="ml-2 text-sm font-medium font-outfit text-[#161950]">Interview Details</span>
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
                <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-4">Interview Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="font-outfit text-[#1A1A1A] mb-2 block">Interview Format</Label>
                    <Select value={interviewFormat} onValueChange={setInterviewFormat}>
                      <SelectTrigger className="font-outfit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-outfit text-[#1A1A1A] mb-2 block">Date</Label>
                    <div className="relative">
                      <Input
                        ref={dateInputRef}
                        type="date"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="font-outfit pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                        style={{
                          colorScheme: 'light',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          dateInputRef.current?.showPicker?.();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-[#161950] cursor-pointer z-10 flex items-center justify-center"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="font-outfit text-[#1A1A1A] mb-2 block">Time</Label>
                    <div className="relative">
                      <Input
                        ref={timeInputRef}
                        type="time"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        className="font-outfit pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                        style={{
                          colorScheme: 'light',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          timeInputRef.current?.showPicker?.();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-[#161950] cursor-pointer z-10 flex items-center justify-center"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {selectedAccount && (
              <Card className="border-2 border-[#161950] bg-[#161950]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-outfit">
                    <Brain className="h-5 w-5 text-[#161950]" />
                    AI Preparation
                  </CardTitle>
                  <CardDescription className="font-outfit">
                    AI will prepare interview materials
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
                      Preparation Materials
                    </p>
                    <p className="text-sm text-gray-600 font-outfit">Will be generated</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleSchedule}
              disabled={!selectedAccount || !interviewDate || !interviewTime || isCreating}
              className="w-full bg-[#161950] hover:bg-[#0f1440] font-outfit"
            >
              {isCreating ? 'Creating...' : 'Schedule Interview'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

