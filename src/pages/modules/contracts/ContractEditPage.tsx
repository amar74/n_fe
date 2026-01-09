import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContracts } from '@/hooks/contracts';
import { useToast } from '@/hooks/shared';

export default function ContractEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useContract, updateContractMutation } = useContracts();
  
  const { data: contract, isLoading } = useContract(id, !!id);
  
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    document_type: '',
    contract_value: '',
    start_date: '',
    end_date: '',
    status: 'awaiting-review' as const,
    risk_level: 'medium' as const,
    red_clauses: '',
    amber_clauses: '',
    green_clauses: '',
    assigned_reviewer: '',
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        client_name: contract.client_name || '',
        project_name: contract.project_name || '',
        document_type: contract.document_type || '',
        contract_value: contract.contract_value ? contract.contract_value.toString() : '',
        start_date: contract.start_date ? contract.start_date.split('T')[0] : '',
        end_date: contract.end_date ? contract.end_date.split('T')[0] : '',
        status: contract.status || 'awaiting-review',
        risk_level: contract.risk_level || 'medium',
        red_clauses: contract.red_clauses?.toString() || '',
        amber_clauses: contract.amber_clauses?.toString() || '',
        green_clauses: contract.green_clauses?.toString() || '',
        assigned_reviewer: contract.assigned_reviewer || '',
      });
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    try {
      const contractValue = formData.contract_value 
        ? parseFloat(formData.contract_value.replace(/[^0-9.]/g, '')) 
        : undefined;

      const payload: any = {
        status: formData.status,
        risk_level: formData.risk_level,
      };

      if (formData.client_name) payload.client_name = formData.client_name;
      if (formData.project_name) payload.project_name = formData.project_name;
      if (formData.document_type) payload.document_type = formData.document_type;
      if (contractValue) payload.contract_value = contractValue;
      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.end_date) payload.end_date = formData.end_date;
      if (formData.assigned_reviewer) payload.assigned_reviewer = formData.assigned_reviewer;
      if (formData.red_clauses) payload.red_clauses = parseInt(formData.red_clauses);
      if (formData.amber_clauses) payload.amber_clauses = parseInt(formData.amber_clauses);
      if (formData.green_clauses) payload.green_clauses = parseInt(formData.green_clauses);

      await updateContractMutation.mutateAsync({ id, data: payload });
      toast.success('Contract updated successfully');
      navigate(`/module/contracts/${id}`);
    } catch (error: any) {
      console.error('Error updating contract:', error);
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || 'Failed to update contract';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center font-outfit">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-[#667085] font-outfit">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center font-outfit">
        <div className="text-center">
          <div className="p-4 bg-[#F9FAFB] rounded-full w-fit mx-auto mb-4">
            <FileCheck className="h-12 w-12 text-[#D0D5DD]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 font-outfit">Contract Not Found</h2>
          <p className="text-[#667085] mb-6 font-outfit">The contract you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate('/module/contracts')} 
            className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit"
          >
            Back to Contracts
          </Button>
        </div>
      </div>
    );
  }

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.contract_value && isNaN(parseFloat(formData.contract_value.replace(/[^0-9.]/g, '')))) {
      newErrors.contract_value = 'Contract value must be a valid number';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.red_clauses && (isNaN(Number(formData.red_clauses)) || Number(formData.red_clauses) < 0)) {
      newErrors.red_clauses = 'Must be a valid positive number';
    }

    if (formData.amber_clauses && (isNaN(Number(formData.amber_clauses)) || Number(formData.amber_clauses) < 0)) {
      newErrors.amber_clauses = 'Must be a valid positive number';
    }

    if (formData.green_clauses && (isNaN(Number(formData.green_clauses)) || Number(formData.green_clauses) < 0)) {
      newErrors.green_clauses = 'Must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/module/contracts/${id}`)}
              className="h-9 px-3 text-[#667085] hover:text-[#1A1A1A] hover:bg-[#F9FAFB] font-outfit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contract
            </Button>
            <div>
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">
                Edit Contract
              </h1>
              <p className="text-sm text-[#667085] font-outfit mt-1">
                {contract.contract_id || contract.id}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (validateForm()) {
            handleSubmit(e);
          }
        }} className="max-w-4xl">
          <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex justify-start items-start gap-6">
              <div className="flex-1 flex flex-col gap-1">
                <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-[#161950]" />
                  Edit Contract
                </h2>
                <p className="text-[#667085] text-sm font-normal font-outfit">
                  {contract.contract_id || contract.id}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="client_name" className="text-sm font-medium text-[#1A1A1A] font-outfit">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
                  />
                </div>

                <div>
                  <Label htmlFor="project_name" className="text-sm font-medium text-[#1A1A1A] font-outfit">Project Name</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
                  />
                </div>

                <div>
                  <Label htmlFor="document_type" className="text-sm font-medium text-[#1A1A1A] font-outfit">Document Type</Label>
                  <Input
                    id="document_type"
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
                  />
                </div>

                <div>
                  <Label htmlFor="contract_value" className="text-sm font-medium text-[#1A1A1A] font-outfit">Contract Value</Label>
                  <Input
                    id="contract_value"
                    type="text"
                    value={formData.contract_value}
                    onChange={(e) => {
                      setFormData({ ...formData, contract_value: e.target.value });
                      if (errors.contract_value) setErrors({ ...errors, contract_value: '' });
                    }}
                    className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] ${errors.contract_value ? 'border-[#D92D20]' : ''}`}
                  />
                  {errors.contract_value && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.contract_value}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="start_date" className="text-sm font-medium text-[#1A1A1A] font-outfit">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => {
                      setFormData({ ...formData, start_date: e.target.value });
                      if (errors.end_date) setErrors({ ...errors, end_date: '' });
                    }}
                    className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date" className="text-sm font-medium text-[#1A1A1A] font-outfit">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => {
                      setFormData({ ...formData, end_date: e.target.value });
                      if (errors.end_date) setErrors({ ...errors, end_date: '' });
                    }}
                    className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] ${errors.end_date ? 'border-[#D92D20]' : ''}`}
                  />
                  {errors.end_date && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.end_date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-[#1A1A1A] font-outfit">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awaiting-review">Awaiting Review</SelectItem>
                      <SelectItem value="in-legal-review">In Legal Review</SelectItem>
                      <SelectItem value="exceptions-approved">Exceptions Approved</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                      <SelectItem value="executed">Executed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="risk_level" className="text-sm font-medium text-[#1A1A1A] font-outfit">Risk Level</Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value: any) => setFormData({ ...formData, risk_level: value })}
                  >
                    <SelectTrigger className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assigned_reviewer" className="text-sm font-medium text-[#1A1A1A] font-outfit">Assigned Reviewer</Label>
                  <Input
                    id="assigned_reviewer"
                    value={formData.assigned_reviewer}
                    onChange={(e) => setFormData({ ...formData, assigned_reviewer: e.target.value })}
                    className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
                    placeholder="e.g., Sarah Johnson, Esq."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E5E7EB]">
                <div>
                  <Label htmlFor="red_clauses" className="text-sm font-medium text-[#1A1A1A] font-outfit">Red Clauses</Label>
                  <Input
                    id="red_clauses"
                    type="number"
                    min="0"
                    value={formData.red_clauses}
                    onChange={(e) => {
                      setFormData({ ...formData, red_clauses: e.target.value });
                      if (errors.red_clauses) setErrors({ ...errors, red_clauses: '' });
                    }}
                    className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] ${errors.red_clauses ? 'border-[#D92D20]' : ''}`}
                  />
                  {errors.red_clauses && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.red_clauses}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="amber_clauses" className="text-sm font-medium text-[#1A1A1A] font-outfit">Amber Clauses</Label>
                  <Input
                    id="amber_clauses"
                    type="number"
                    min="0"
                    value={formData.amber_clauses}
                    onChange={(e) => {
                      setFormData({ ...formData, amber_clauses: e.target.value });
                      if (errors.amber_clauses) setErrors({ ...errors, amber_clauses: '' });
                    }}
                    className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] ${errors.amber_clauses ? 'border-[#D92D20]' : ''}`}
                  />
                  {errors.amber_clauses && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.amber_clauses}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="green_clauses" className="text-sm font-medium text-[#1A1A1A] font-outfit">Green Clauses</Label>
                  <Input
                    id="green_clauses"
                    type="number"
                    min="0"
                    value={formData.green_clauses}
                    onChange={(e) => {
                      setFormData({ ...formData, green_clauses: e.target.value });
                      if (errors.green_clauses) setErrors({ ...errors, green_clauses: '' });
                    }}
                    className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] ${errors.green_clauses ? 'border-[#D92D20]' : ''}`}
                  />
                  {errors.green_clauses && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.green_clauses}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/module/contracts/${id}`)}
                  className="h-11 px-5 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] rounded-lg font-outfit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateContractMutation.isPending}
                  className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg shadow-sm font-outfit"
                >
                  {updateContractMutation.isPending ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

