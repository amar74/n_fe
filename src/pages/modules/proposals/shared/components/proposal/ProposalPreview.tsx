import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  DollarSign,
  Calendar,
  Building2,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Download,
  Printer,
  X,
  Eye,
  Sparkles,
} from 'lucide-react';
interface ProposalSection {
  id: string;
  section_type: string;
  title: string;
  content?: string;
  page_count?: number;
  status?: string;
  ai_generated_percentage?: number;
  display_order?: number;
}

interface ProposalDocument {
  id: string;
  name: string;
  category: string;
  file_path?: string;
  external_url?: string;
  uploaded_at: string;
}

interface ProposalPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: {
    id: string;
    title: string;
    summary?: string;
    proposal_type?: string;
    status?: string;
    total_value?: number;
    currency?: string;
    estimated_cost?: number;
    expected_margin?: number;
    due_date?: string;
    submission_date?: string;
    account_name?: string;
    owner_name?: string;
    sections?: ProposalSection[];
    documents?: ProposalDocument[];
    ai_metadata?: any;
    created_at?: string;
    updated_at?: string;
  };
  onPrint?: () => void;
  onExportPDF?: () => void;
  onScheduleApproval?: () => void;
}

export default function ProposalPreview({
  open,
  onOpenChange,
  proposal,
  onPrint,
  onExportPDF,
  onScheduleApproval,
}: ProposalPreviewProps) {
  const formatCurrency = (amount?: number, currency: string = 'USD') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalPages = proposal.sections?.reduce((sum, section) => sum + (section.page_count || 0), 0) || 0;
  const designTheme = proposal.ai_metadata?.theme || 'Not selected';
  const coverLayout = proposal.ai_metadata?.coverLayout || 'Not selected';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Eye className="h-6 w-6 text-[#161950]" />
            Proposal Preview
          </DialogTitle>
          <DialogDescription>
            Review all proposal details before printing or scheduling for approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#161950] to-[#0f1440] rounded-xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold font-outfit mb-2">{proposal.title}</h2>
                {proposal.summary && (
                  <p className="text-white/90 text-sm font-outfit mt-2">{proposal.summary}</p>
                )}
              </div>
              <Badge className={`${getStatusColor(proposal.status)} text-sm font-semibold`}>
                {proposal.status?.replace('_', ' ') || 'Draft'}
              </Badge>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="bg-white rounded-xl border-2 border-[#161950]/20 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#161950]/10 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-[#161950]" />
              </div>
              <h3 className="text-xl font-bold font-outfit text-[#1A1A1A]">Financial Summary</h3>
            </div>
            {(proposal.total_value || proposal.estimated_cost || proposal.expected_margin) ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 font-outfit mb-1">Total Value</p>
                    <p className="text-2xl font-bold font-outfit text-[#161950]">
                      {formatCurrency(proposal.total_value, proposal.currency)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 font-outfit mb-1">Estimated Cost</p>
                    <p className="text-2xl font-bold font-outfit text-[#161950]">
                      {formatCurrency(proposal.estimated_cost, proposal.currency)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 font-outfit mb-1">Expected Margin</p>
                    <p className="text-2xl font-bold font-outfit text-[#161950]">
                      {proposal.expected_margin ? `${proposal.expected_margin}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 font-outfit mb-1">Currency</p>
                    <p className="text-2xl font-bold font-outfit text-[#161950]">
                      {proposal.currency || 'USD'}
                    </p>
                  </div>
                </div>
                {proposal.total_value && proposal.estimated_cost && (
                  <div className="mt-4 p-4 bg-[#161950]/5 rounded-lg border border-[#161950]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold font-outfit text-gray-700">Expected Profit:</span>
                      <span className="text-lg font-bold font-outfit text-[#161950]">
                        {formatCurrency(
                          proposal.total_value - proposal.estimated_cost,
                          proposal.currency
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 font-outfit">
                <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Financial information not yet configured</p>
              </div>
            )}
          </div>

          {/* Proposal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-[#161950]" />
                <h4 className="font-semibold font-outfit text-[#1A1A1A]">Client Information</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 font-outfit">Account</p>
                  <p className="font-medium font-outfit text-[#1A1A1A]">
                    {proposal.account_name || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-outfit">Proposal Owner</p>
                  <p className="font-medium font-outfit text-[#1A1A1A]">
                    {proposal.owner_name || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-[#161950]" />
                <h4 className="font-semibold font-outfit text-[#1A1A1A]">Important Dates</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 font-outfit">Due Date</p>
                  <p className="font-medium font-outfit text-[#1A1A1A]">
                    {formatDate(proposal.due_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-outfit">Submission Date</p>
                  <p className="font-medium font-outfit text-[#1A1A1A]">
                    {formatDate(proposal.submission_date) || 'Not submitted'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Design Configuration */}
          {(designTheme !== 'Not selected' || coverLayout !== 'Not selected') && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-[#161950]" />
                <h4 className="font-semibold font-outfit text-[#1A1A1A]">Design Configuration</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-outfit mb-1">Theme</p>
                  <Badge variant="outline" className="font-outfit">{designTheme}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-outfit mb-1">Cover Layout</p>
                  <Badge variant="outline" className="font-outfit">{coverLayout}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Sections Summary */}
          {proposal.sections && proposal.sections.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#161950]" />
                  <h4 className="font-semibold font-outfit text-[#1A1A1A]">Proposal Sections</h4>
                </div>
                <Badge variant="outline" className="font-outfit">
                  {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                </Badge>
              </div>
              <div className="space-y-3">
                {proposal.sections
                  .sort((a, b) => {
                    // Sort by section_type for consistent order
                    const order = ['contents', 'letter', 'executive_summary', 'qualifications', 'technical_approach'];
                    return (order.indexOf(a.section_type) || 999) - (order.indexOf(b.section_type) || 999);
                  })
                  .map((section) => (
                    <div
                      key={section.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold font-outfit text-[#1A1A1A] text-base">{section.title}</p>
                          <p className="text-xs text-gray-500 font-outfit mt-1 capitalize">
                            {section.section_type.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {section.page_count !== undefined && section.page_count !== null && (
                            <Badge variant="outline" className="font-outfit bg-white">
                              {section.page_count} {section.page_count === 1 ? 'page' : 'pages'}
                            </Badge>
                          )}
                          {section.status && (
                            <Badge
                              variant="outline"
                              className={`${
                                section.status === 'approved'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : section.status === 'in_review'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              } font-outfit`}
                            >
                              {section.status.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {section.content && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700 font-outfit line-clamp-3">
                            {section.content.substring(0, 200)}{section.content.length > 200 ? '...' : ''}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                        {section.ai_generated_percentage !== undefined && section.ai_generated_percentage !== null && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#161950]" />
                            <span className="text-xs text-gray-600 font-outfit">
                              {section.ai_generated_percentage}% AI Generated
                            </span>
                          </div>
                        )}
                        {section.display_order !== undefined && (
                          <span className="text-xs text-gray-500 font-outfit">
                            Order: {section.display_order}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {proposal.documents && proposal.documents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-[#161950]" />
                <h4 className="font-semibold font-outfit text-[#1A1A1A]">
                  Attached Documents ({proposal.documents.length})
                </h4>
              </div>
              <div className="space-y-2">
                {proposal.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#161950]" />
                      <div>
                        <p className="font-medium font-outfit text-sm text-[#1A1A1A]">{doc.name}</p>
                        <p className="text-xs text-gray-500 font-outfit">{doc.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-outfit text-xs">
                      {formatDateShort(doc.uploaded_at)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-outfit"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            {onExportPDF && (
              <Button
                variant="outline"
                onClick={onExportPDF}
                className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            )}
            {onPrint && (
              <Button
                variant="outline"
                onClick={onPrint}
                className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
            {onScheduleApproval && (
              <Button
                onClick={onScheduleApproval}
                className="font-outfit bg-[#161950] hover:bg-[#0f1440] text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Schedule for Approval
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

