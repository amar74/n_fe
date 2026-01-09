import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, FileCheck, FileText, CheckCircle, Upload, X, File, Brain, Loader2, Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useContracts } from '@/hooks/contracts';
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';
import { useAccountDetail } from '@/hooks/accounts/useAccounts';
import { useOpportunity } from '@/hooks/opportunities';
import { contractsApi } from '@/services/api/contractsApi';

export default function ContractCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { createContractMutation, createFromProposalMutation } = useContracts();
  const { useProposal, useProposalsList } = useProposals();
  
  // Check if creating from proposal
  const proposalId = searchParams.get('proposalId');
  const { data: proposal } = useProposal(proposalId || undefined, !!proposalId);

  // Fetch accepted/approved proposals for selection
  // Note: We'll fetch all and filter client-side since API might not support multiple status filters
  const { data: proposalsData, isLoading: isLoadingProposals } = useProposalsList({
    page: 1,
    size: 100,
  });
  
  // Filter for accepted proposals (approved or won status)
  const acceptedProposals = (proposalsData?.items || proposalsData || []).filter((p: any) => 
    p.status === 'approved' || p.status === 'won' || p.status === 'Accepted'
  );
  
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    document_type: '',
    account_id: '',
    account_name: '',
    contract_value: '',
    start_date: '',
    end_date: '',
    status: 'awaiting-review' as const,
    risk_level: 'medium' as const,
    opportunity_id: '',
    proposal_id: proposalId || '',
  });
  
  // Fetch account details when account_id is available
  const { accountDetail } = useAccountDetail(formData.account_id || '');
  
  // Fetch opportunity details when opportunity_id is available
  const { data: opportunity } = useOpportunity(formData.opportunity_id || undefined);
  
  // Determine if fields should be auto-filled and non-editable
  const isProposalSelected = !!formData.proposal_id;
  const isOpportunityLinked = !!formData.opportunity_id;
  const isAutoFilled = isProposalSelected || isOpportunityLinked;
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);

  // Pre-populate from proposal if available
  useEffect(() => {
    if (proposal) {
      // Get project name from proposal - check multiple possible fields
      const proposalProjectName = proposal.name || 
                                   proposal.title || 
                                   proposal.proposal_number ||
                                   proposal.project_name ||
                                   `Project from ${proposal.account_name || proposal.client || 'Proposal'}`;
      
      setFormData(prev => ({
        ...prev,
        project_name: proposalProjectName,
        account_id: proposal.account_id || prev.account_id,
        opportunity_id: proposal.opportunity_id || prev.opportunity_id,
        contract_value: proposal.total_value || proposal.value ? String(proposal.total_value || proposal.value) : prev.contract_value,
        proposal_id: proposal.id || prev.proposal_id,
        // Don't set client_name here - will be set from account detail
      }));
    }
  }, [proposal]);
  
  // Update client_name from account detail when account is fetched
  useEffect(() => {
    if (accountDetail?.client_name) {
      setFormData(prev => ({
        ...prev,
        client_name: accountDetail.client_name,
      }));
    }
  }, [accountDetail]);
  
  // Update fields from opportunity when opportunity is fetched
  useEffect(() => {
    if (opportunity) {
      const updates: any = {};
      
      // Map opportunity risk_level (low_risk, medium_risk, high_risk) to contract risk_level (low, medium, high)
      if (opportunity.risk_level) {
        let mappedRiskLevel = 'medium'; // default
        if (opportunity.risk_level === 'low_risk') {
          mappedRiskLevel = 'low';
        } else if (opportunity.risk_level === 'medium_risk') {
          mappedRiskLevel = 'medium';
        } else if (opportunity.risk_level === 'high_risk') {
          mappedRiskLevel = 'high';
        }
        updates.risk_level = mappedRiskLevel;
      }
      
      // Update client_name and project_name from opportunity if not already set from proposal
      if (!isProposalSelected) {
        if (opportunity.client_name) {
          updates.client_name = opportunity.client_name;
        }
        if (opportunity.project_name) {
          updates.project_name = opportunity.project_name;
        }
        if (opportunity.account_id) {
          updates.account_id = opportunity.account_id;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...updates,
        }));
      }
    }
  }, [opportunity, isProposalSelected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // If creating from proposal, use the special endpoint
      if (proposalId && formData.proposal_id) {
        const newContract = await createFromProposalMutation.mutateAsync({
          proposalId: formData.proposal_id,
          autoAnalyze: true,
        });
        navigate(`/module/contracts/${newContract.id}`);
        return;
      }

      // Otherwise, create manually
      const contractValue = formData.contract_value 
        ? parseFloat(formData.contract_value.replace(/[^0-9.]/g, '')) 
        : undefined;

      // Prepare payload - ensure proper types
      const payload: any = {
        client_name: formData.client_name.trim(),
        project_name: formData.project_name.trim(),
        document_type: formData.document_type,
        status: formData.status,
        risk_level: formData.risk_level,
        currency: 'USD',
      };

      // Only include optional fields if they have valid values
      // UUIDs should be valid UUID strings or omitted - don't send empty strings
      if (formData.account_id && formData.account_id.trim() !== '') {
        payload.account_id = formData.account_id;
      }
      
      if (contractValue && !isNaN(contractValue) && contractValue > 0) {
        payload.contract_value = contractValue;
      }
      
      // Handle dates - only send if they have valid values, otherwise omit
      if (formData.start_date && formData.start_date.trim() !== '') {
        payload.start_date = formData.start_date;
      }
      
      if (formData.end_date && formData.end_date.trim() !== '') {
        payload.end_date = formData.end_date;
      }
      
      if (formData.opportunity_id && formData.opportunity_id.trim() !== '') {
        payload.opportunity_id = formData.opportunity_id;
      }
      
      if (formData.proposal_id && formData.proposal_id.trim() !== '') {
        payload.proposal_id = formData.proposal_id;
      }
      
      console.log('Creating contract with payload:', JSON.stringify(payload, null, 2));

      // Create contract first
      const newContract = await createContractMutation.mutateAsync(payload);
      
      // Upload document if there are uploaded files
      if (uploadedFiles.length > 0) {
        try {
          const firstFile = uploadedFiles[0];
          await contractsApi.uploadDocument(newContract.id, firstFile);
          toast.success('Contract document uploaded successfully!');
        } catch (uploadError: any) {
          console.error('Error uploading document:', uploadError);
          toast.error('Contract created but document upload failed. You can upload it later.');
        }
      }
      
      navigate(`/module/contracts/${newContract.id}`);
    } catch (error: any) {
      console.error('Error creating contract:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract error message from response
      let errorMessage = 'Failed to create contract. Please try again.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  const extractContractDetails = useCallback(async (file: File) => {
    setIsExtracting(true);
    try {
      // Call actual API for extraction
      const extractedData = await contractsApi.extractDocument(file);
      
      setExtractedData(extractedData);
      
      // Auto-populate form with extracted data (only if fields are empty or not set from proposal)
      setFormData(prev => ({
        ...prev,
        client_name: prev.client_name || extractedData.client_name || '',
        project_name: prev.project_name || extractedData.project_name || '',
        contract_value: prev.contract_value || extractedData.contract_value || '',
        start_date: prev.start_date || extractedData.start_date || '',
        end_date: prev.end_date || extractedData.end_date || '',
        document_type: prev.document_type || extractedData.document_type || '',
        risk_level: prev.risk_level || (extractedData.risk_level as any) || 'medium',
      }));
      
      toast.success('Contract details extracted successfully!');
    } catch (error: any) {
      console.error('Error extracting contract details:', error);
      toast.error(error.message || 'Failed to extract contract details. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  }, [toast]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const newFiles: File[] = [];
    
    Array.from(files).forEach((file) => {
      if (!allowedFileTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type. Please upload PDF, DOC, DOCX, JPEG, or PNG files.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB. Please choose a smaller file.`);
        return;
      }

      newFiles.push(file);
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added successfully`);
      
      // Trigger AI extraction for the first file (contract document)
      if (newFiles.length > 0 && (newFiles[0].type === 'application/pdf' || newFiles[0].type.includes('document'))) {
        await extractContractDetails(newFiles[0]);
      }
    }
  }, [toast, extractContractDetails]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    // Clear extracted data if removing the first file (the one that was analyzed)
    if (index === 0) {
      setExtractedData(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.client_name?.trim()) {
      newErrors.client_name = 'Client name is required';
    }
    
    if (!formData.project_name?.trim()) {
      newErrors.project_name = 'Project name is required';
    }
    
    if (!formData.document_type) {
      newErrors.document_type = 'Document type is required';
    }

    if (formData.contract_value && isNaN(parseFloat(formData.contract_value.replace(/[^0-9.]/g, '')))) {
      newErrors.contract_value = 'Contract value must be a valid number';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return (
    <div className="w-full bg-[#F5F3F2] font-outfit pb-6">
      <div className="flex flex-col w-full p-6 gap-6">
        <div>
          <Link
            to="/module/contracts"
            className="inline-flex items-center p-2 text-[#667085] hover:text-[#1A1A1A] hover:bg-[#F9FAFB] rounded-lg transition-colors font-outfit"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Contracts</span>
          </Link>
        </div>

        <div className="w-full mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-gradient-to-br from-[#161950] to-[#1E2B5B] rounded-xl shadow-md">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-lg font-bold text-[#1A1A1A] font-outfit tracking-tight">
                      Upload Contract Document
                    </Label>
                    <p className="text-sm text-[#667085] font-outfit mt-1 font-medium">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                </div>
                
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                    isDragActive
                      ? 'border-[#161950] bg-gradient-to-br from-[#F0F4FF] to-[#E0E7FF] shadow-lg scale-[1.02]'
                      : uploadedFiles.length > 0
                      ? 'border-[#039855] bg-gradient-to-br from-[#F0FDF4] to-[#D1FAE5] shadow-md'
                      : 'border-[#D0D5DD] bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5] hover:border-[#161950]/40 hover:bg-gradient-to-br hover:from-[#F8F9FF] hover:to-[#F0F4FF] hover:shadow-md'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {isExtracting ? (
                        <div className="p-4 bg-white rounded-2xl shadow-lg">
                          <Loader2 className="w-10 h-10 text-[#161950] animate-spin" />
                        </div>
                      ) : uploadedFiles.length > 0 ? (
                        <div className="p-4 bg-white rounded-2xl shadow-lg">
                          <div className="p-2 bg-[#039855]/10 rounded-full">
                            <FileCheck className="w-10 h-10 text-[#039855]" />
                          </div>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-2xl transition-all ${isDragActive ? 'bg-white shadow-lg scale-110' : ''}`}>
                          <div className={`p-3 rounded-xl ${isDragActive ? 'bg-gradient-to-br from-[#161950] to-[#1E2B5B]' : 'bg-[#F9FAFB]'}`}>
                            <Upload className={`w-10 h-10 ${isDragActive ? 'text-white' : 'text-[#667085]'}`} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className={`text-base font-bold font-outfit tracking-tight ${
                        isDragActive ? 'text-[#161950]' : uploadedFiles.length > 0 ? 'text-[#039855]' : 'text-[#1A1A1A]'
                      }`}>
                        {isExtracting
                          ? 'AI Extracting Details...'
                          : isDragActive
                          ? 'Drop File Here'
                          : uploadedFiles.length > 0
                          ? 'Document Uploaded Successfully'
                          : 'Drag & Drop or Click to Upload'}
                      </p>
                      {uploadedFiles.length === 0 && !isExtracting && (
                        <p className="text-sm text-[#667085] font-outfit font-medium">
                          Upload your contract document to get started
                        </p>
                      )}
                      {uploadedFiles.length > 0 && !isExtracting && (
                        <p className="text-sm text-[#039855] font-outfit font-medium flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Ready for AI processing
                        </p>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="contract-document-upload"
                    />
                    {uploadedFiles.length === 0 && !isExtracting && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 px-6 border-2 border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white rounded-xl font-outfit font-semibold shadow-sm transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Browse Files
                      </Button>
                    )}
                  </div>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-col gap-3 mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#1A1A1A] font-outfit">
                        Uploaded Files
                      </p>
                      <Badge variant="outline" className="bg-[#F0FDF4] text-[#039855] border-[#039855]/30 font-outfit font-semibold">
                        {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}
                      </Badge>
                    </div>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FAFAFA] to-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#161950]/30 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-gradient-to-br from-[#161950] to-[#1E2B5B] rounded-lg shadow-sm">
                            <File className="h-5 w-5 text-white flex-shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1A1A1A] font-outfit truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-[#667085] font-outfit font-medium mt-0.5">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                            if (index === 0) {
                              setExtractedData(null);
                            }
                          }}
                          className="h-9 w-9 p-0 hover:bg-gradient-to-br hover:from-[#FEF2F2] hover:to-[#FEE2E2] hover:text-[#DC2626] flex-shrink-0 rounded-lg transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 p-5 bg-gradient-to-br from-[#F0F4FF] via-[#F5F7FF] to-[#FAFBFF] rounded-2xl border-2 border-[#E0E7FF] shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-[#161950] to-[#1E2B5B] rounded-xl shadow-md">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#1A1A1A] font-outfit tracking-tight">
                        AI-Powered Features
                      </h4>
                      <p className="text-xs text-[#667085] font-outfit font-medium mt-0.5">
                        Automatically activated upon upload
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#E0E7FF]/50 backdrop-blur-sm">
                      <div className="p-1.5 bg-[#039855]/10 rounded-lg mt-0.5">
                        <Sparkles className="h-4 w-4 text-[#039855]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1A1A1A] font-outfit mb-1">
                          Automated Data Extraction
                        </p>
                        <p className="text-xs text-[#667085] font-outfit leading-relaxed">
                          AI analyzes your contract document and extracts key information including client details, dates, values, and terms automatically.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#E0E7FF]/50 backdrop-blur-sm">
                      <div className="p-1.5 bg-[#039855]/10 rounded-lg mt-0.5">
                        <FileCheck className="h-4 w-4 text-[#039855]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1A1A1A] font-outfit mb-1">
                          Auto-Population
                        </p>
                        <p className="text-xs text-[#667085] font-outfit leading-relaxed">
                          Client name, project name, dates, and contract value are automatically populated in the form to save you time.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#E0E7FF]/50 backdrop-blur-sm">
                      <div className="p-1.5 bg-[#F59E0B]/10 rounded-lg mt-0.5">
                        <Brain className="h-4 w-4 text-[#F59E0B]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1A1A1A] font-outfit mb-1">
                          Risk Assessment & Clause Identification
                        </p>
                        <p className="text-xs text-[#667085] font-outfit leading-relaxed">
                          Instant analysis of contract clauses with risk level identification and recommendations for review.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {extractedData && (
                <div className="p-6 bg-gradient-to-br from-[#F0FDF4] via-[#ECFDF5] to-[#D1FAE5] rounded-2xl border-2 border-[#86EFAC] shadow-lg">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-gradient-to-br from-[#039855] to-[#10B981] rounded-xl shadow-md">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-lg font-bold text-[#1A1A1A] font-outfit flex items-center gap-2 tracking-tight">
                        AI Extracted Details
                        <Badge variant="outline" className="bg-white text-[#039855] border-[#039855]/30 text-xs font-bold px-2 py-0.5">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI POWERED
                        </Badge>
                      </Label>
                      <p className="text-sm text-[#059669] font-outfit mt-1 font-semibold">
                        Automatically extracted from document
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {extractedData.client_name && (
                      <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/50 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-[#667085] font-outfit font-semibold mb-2 uppercase tracking-wide">Client Name</p>
                        <p className="text-base font-bold text-[#1A1A1A] font-outfit">{extractedData.client_name}</p>
                      </div>
                    )}
                    {extractedData.project_name && (
                      <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/50 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-[#667085] font-outfit font-semibold mb-2 uppercase tracking-wide">Project Name</p>
                        <p className="text-base font-bold text-[#1A1A1A] font-outfit">{extractedData.project_name}</p>
                      </div>
                    )}
                    {extractedData.contract_value && (
                      <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/50 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-[#667085] font-outfit font-semibold mb-2 uppercase tracking-wide">Contract Value</p>
                        <p className="text-xl font-bold text-[#039855] font-outfit">
                          ${parseFloat(extractedData.contract_value).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {(extractedData.start_date || extractedData.end_date) && (
                      <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/50 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-[#667085] font-outfit font-semibold mb-2 uppercase tracking-wide">Contract Period</p>
                        <p className="text-base font-bold text-[#1A1A1A] font-outfit">
                          {extractedData.start_date && new Date(extractedData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {extractedData.end_date && new Date(extractedData.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                    {extractedData.document_type && (
                      <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/50 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-[#667085] font-outfit font-semibold mb-2 uppercase tracking-wide">Document Type</p>
                        <p className="text-base font-bold text-[#1A1A1A] font-outfit">{extractedData.document_type}</p>
                      </div>
                    )}
                    <div className="p-4 bg-gradient-to-r from-[#039855] to-[#10B981] rounded-xl border-2 border-[#86EFAC] shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm text-white font-outfit font-bold">
                          Details automatically filled in form below
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isExtracting && (
                <div className="p-5 bg-gradient-to-br from-[#F0F4FF] via-[#E0E7FF] to-[#F5F7FF] rounded-2xl border-2 border-[#161950]/20 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Loader2 className="h-6 w-6 text-[#161950] animate-spin" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-[#1A1A1A] font-outfit tracking-tight">AI Processing</p>
                      <p className="text-sm text-[#667085] font-outfit font-medium mt-1">
                        Extracting contract details from document...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (validateForm()) {
                  handleSubmit(e);
                }
              }} className="w-full">
              <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex justify-start items-start gap-6">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-[#161950]" />
                    Create New Contract
                  </h2>
                  {proposal && (
                    <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                      <FileText className="h-3 w-3 mr-1.5" />
                      From Proposal
                    </Badge>
                  )}
                </div>
                <p className="text-[#667085] text-sm font-normal font-outfit">
                  {proposal 
                    ? `Creating contract from proposal: ${proposal.name || proposal.id}`
                    : 'Fill in the contract details below'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6">

              <div className="w-full p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#F0F4FF] rounded-lg">
                    <FileText className="h-5 w-5 text-[#161950]" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="proposal_select" className="text-base font-semibold text-[#1A1A1A] font-outfit">
                      Select Accepted Proposal
                    </Label>
                    <p className="text-xs text-[#667085] font-outfit mt-0.5">
                      Optional • Auto-populate contract details from approved/won proposals
                    </p>
                  </div>
                </div>
                <Select
                  value={formData.proposal_id}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setFormData(prev => ({ ...prev, proposal_id: '' }));
                      return;
                    }
                    if (value === 'none') {
                      // Clear proposal selection
                      setFormData(prev => ({
                        ...prev,
                        proposal_id: '',
                        // Keep other fields as user might have entered them
                      }));
                      return;
                    }
                    
                    const selectedProposal = acceptedProposals.find((p: any) => p.id === value);
                    if (selectedProposal) {
                      // Get project name from proposal - check multiple possible fields in priority order
                      const proposalProjectName = selectedProposal.title || 
                                                   selectedProposal.name || 
                                                   selectedProposal.proposal_number ||
                                                   selectedProposal.project_name ||
                                                   `Project from ${selectedProposal.account_name || selectedProposal.client || 'Proposal'}`;
                      
                      setFormData(prev => ({
                        ...prev,
                        proposal_id: selectedProposal.id,
                        project_name: proposalProjectName, // Always update project name from proposal
                        account_id: selectedProposal.account_id || prev.account_id,
                        account_name: selectedProposal.account_name || selectedProposal.client || prev.account_name,
                        opportunity_id: selectedProposal.opportunity_id || prev.opportunity_id,
                        contract_value: selectedProposal.total_value ? String(selectedProposal.total_value) : prev.contract_value,
                        // Don't set client_name here - will be set from account detail
                      }));
                      toast.success(`Project name "${proposalProjectName}" auto-filled from proposal`);
                    } else {
                      setFormData(prev => ({ ...prev, proposal_id: value }));
                    }
                  }}
                  disabled={!!proposalId} // Disable if coming from URL
                >
                  <SelectTrigger className={`h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm ${proposalId ? 'bg-[#F9FAFB]' : 'bg-white'}`}>
                    <SelectValue placeholder={isLoadingProposals ? "Loading proposals..." : "Select an approved proposal"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="none">
                      <span className="text-[#667085]">None - Create contract manually</span>
                    </SelectItem>
                    {acceptedProposals.length === 0 ? (
                      <SelectItem value="no-proposals" disabled>
                        {isLoadingProposals ? "Loading..." : "No approved/won proposals available"}
                      </SelectItem>
                    ) : (
                      acceptedProposals.map((prop: any) => (
                        <SelectItem key={prop.id} value={prop.id}>
                          <div className="flex flex-col py-1">
                            <span className="font-medium text-[#1A1A1A]">{prop.name || prop.title || prop.proposal_number || prop.id}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[#667085]">
                                Client: {prop.account_name || prop.client || 'Unknown'}
                              </span>
                              {prop.opportunity_id && (
                                <>
                                  <span className="text-xs text-[#667085]">•</span>
                                  <span className="text-xs text-[#667085]">Opportunity Linked</span>
                                </>
                              )}
                              {prop.total_value && (
                                <>
                                  <span className="text-xs text-[#667085]">•</span>
                                  <span className="text-xs text-[#039855] font-medium">
                                    ${(prop.total_value / 1000000).toFixed(2)}M
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {proposalId && (
                  <p className="text-xs text-[#667085] font-outfit mt-2 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Proposal pre-selected from URL: {proposal?.name || proposal?.id || proposalId}
                  </p>
                )}
                {formData.proposal_id && !proposalId && (
                  <p className="text-xs text-[#039855] font-outfit mt-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Proposal selected - Contract details will be populated from this proposal
                  </p>
                )}
              </div>

              <div className="w-full p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#F0F4FF] rounded-lg">
                    <FileCheck className="h-5 w-5 text-[#161950]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A1A] font-outfit">Contract Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="client_name" className="text-sm font-medium text-[#1A1A1A] font-outfit">
                    Client Name *
                    {isAutoFilled && (
                      <span className="text-xs text-[#039855] font-normal ml-2">
                        {isProposalSelected ? "(Account name from proposal)" : "(From opportunity)"}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => {
                      setFormData({ ...formData, client_name: e.target.value });
                      if (errors.client_name) setErrors({ ...errors, client_name: '' });
                    }}
                    required
                    disabled={isAutoFilled}
                    readOnly={isAutoFilled}
                    className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm ${errors.client_name ? 'border-[#D92D20]' : ''} ${isAutoFilled ? 'bg-[#F0FDF4] border-[#86EFAC] cursor-not-allowed' : 'bg-white'}`}
                    placeholder={isAutoFilled ? "Auto-filled from linked source" : "Enter client name"}
                  />
                  {isAutoFilled && formData.client_name && (
                    <p className="text-xs text-[#039855] font-outfit mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Client name auto-filled {isProposalSelected ? "from proposal account" : "from opportunity"}
                    </p>
                  )}
                  {errors.client_name && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.client_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="project_name" className="text-sm font-medium text-[#1A1A1A] font-outfit">
                    Project Name *
                    {isAutoFilled && (
                      <span className="text-xs text-[#039855] font-normal ml-2">
                        {isProposalSelected ? "(Auto-filled from proposal)" : "(From opportunity)"}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => {
                      setFormData({ ...formData, project_name: e.target.value });
                      if (errors.project_name) setErrors({ ...errors, project_name: '' });
                    }}
                    required
                    disabled={isAutoFilled}
                    readOnly={isAutoFilled}
                    className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm ${errors.project_name ? 'border-[#D92D20]' : ''} ${isAutoFilled ? 'bg-[#F0FDF4] border-[#86EFAC] cursor-not-allowed' : 'bg-white'}`}
                    placeholder={isAutoFilled ? "Auto-filled from linked source" : "Enter project name"}
                  />
                  {isAutoFilled && formData.project_name && (
                    <p className="text-xs text-[#039855] font-outfit mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Project name auto-filled {isProposalSelected ? "from proposal" : "from opportunity"}
                    </p>
                  )}
                  {errors.project_name && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.project_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="document_type" className="text-sm font-medium text-[#1A1A1A] font-outfit">Document Type *</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(value) => {
                      setFormData({ ...formData, document_type: value });
                      if (errors.document_type) setErrors({ ...errors, document_type: '' });
                    }}
                  >
                    <SelectTrigger className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm bg-white ${errors.document_type ? 'border-[#D92D20]' : ''}`}>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional Services Agreement">
                        Professional Services Agreement
                      </SelectItem>
                      <SelectItem value="Construction Contract">
                        Construction Contract
                      </SelectItem>
                      <SelectItem value="Design-Build Agreement">
                        Design-Build Agreement
                      </SelectItem>
                      <SelectItem value="Technology Services Agreement">
                        Technology Services Agreement
                      </SelectItem>
                      <SelectItem value="Consulting Services Agreement">
                        Consulting Services Agreement
                      </SelectItem>
                      <SelectItem value="Master Services Agreement">
                        Master Services Agreement
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.document_type && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.document_type}</p>
                  )}
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
                    className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm bg-white ${errors.contract_value ? 'border-[#D92D20]' : ''}`}
                    placeholder="e.g., 2500000"
                  />
                  {errors.contract_value && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.contract_value}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="start_date" className="text-sm font-medium text-[#1A1A1A] font-outfit">Start Date</Label>
                  <div className="relative mt-2">
                    <Input
                      ref={startDateInputRef}
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => {
                        setFormData({ ...formData, start_date: e.target.value });
                        if (errors.end_date) setErrors({ ...errors, end_date: '' });
                      }}
                      className="h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm bg-white pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        startDateInputRef.current?.showPicker?.();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085] hover:text-[#161950] cursor-pointer z-10 flex items-center justify-center bg-transparent border-0 p-0"
                      aria-label="Open date picker"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="end_date" className="text-sm font-medium text-[#1A1A1A] font-outfit">End Date</Label>
                  <div className="relative mt-2">
                    <Input
                      ref={endDateInputRef}
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => {
                        setFormData({ ...formData, end_date: e.target.value });
                        if (errors.end_date) setErrors({ ...errors, end_date: '' });
                      }}
                      className={`h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm bg-white pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${errors.end_date ? 'border-[#D92D20]' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        endDateInputRef.current?.showPicker?.();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085] hover:text-[#161950] cursor-pointer z-10 flex items-center justify-center bg-transparent border-0 p-0"
                      aria-label="Open date picker"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  </div>
                  {errors.end_date && (
                    <p className="text-xs text-[#D92D20] font-outfit mt-1">{errors.end_date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-[#1A1A1A] font-outfit">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awaiting-review">Awaiting Review</SelectItem>
                      <SelectItem value="in-legal-review">In Legal Review</SelectItem>
                      <SelectItem value="exceptions-approved">
                        Exceptions Approved
                      </SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                      <SelectItem value="executed">Executed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="risk_level" className="text-sm font-medium text-[#1A1A1A] font-outfit">
                    Risk Level
                    {formData.opportunity_id && (
                      <span className="text-xs text-[#039855] font-normal ml-2">(Auto-filled from opportunity)</span>
                    )}
                  </Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, risk_level: value })
                    }
                    disabled={!!formData.opportunity_id}
                  >
                    <SelectTrigger className={`mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] shadow-sm ${formData.opportunity_id ? 'bg-[#F0FDF4] border-[#86EFAC] cursor-not-allowed' : 'bg-white'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.opportunity_id && formData.risk_level && (
                    <p className="text-xs text-[#039855] font-outfit mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Risk level auto-filled from opportunity
                    </p>
                  )}
                </div>
              </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/module/contracts')}
                  className="h-11 px-6 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] hover:border-[#D0D5DD] rounded-lg font-outfit font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createContractMutation.isPending}
                  className="h-11 px-6 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg shadow-sm font-outfit font-medium"
                >
                  {createContractMutation.isPending ? (
                    'Creating...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Contract
                    </>
                  )}
                </Button>
              </div>
              </div>
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

