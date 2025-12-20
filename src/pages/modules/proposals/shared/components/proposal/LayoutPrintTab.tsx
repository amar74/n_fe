import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Layout,
  Printer,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  Mail,
  FileText,
  Package,
  Clock,
  MapPin,
  FileCheck,
  Save,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/shared";
import ProposalPreview from "./ProposalPreview";
import { useProposals } from "@/hooks/proposals";

interface ProposalPage {
  id: string;
  section: string;
  pageNumber: number;
  title: string;
  preview: string;
  isCompliant: boolean;
  issues?: string[];
}

interface LayoutPrintTabProps {
  proposalId?: string;
  onSave?: () => void;
  onNext?: () => void;
}

export default function LayoutPrintTab({ proposalId, onSave, onNext }: LayoutPrintTabProps) {
  const { toast } = useToast();
  const { useProposal } = useProposals();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  
  // Fetch proposal data for preview
  const { data: proposal } = useProposal(proposalId, !!proposalId);
  const [printOptions, setPrintOptions] = useState({
    format: "digital",
    copies: 3,
    binding: "spiral",
    paper: "standard",
    doubleSided: true,
  });

  const proposalPages: ProposalPage[] = [
    {
      id: "cover",
      section: "Cover",
      pageNumber: 1,
      title: "Metro Transit Expansion Proposal",
      preview: "📄",
      isCompliant: true,
    },
    {
      id: "toc",
      section: "Table of Contents",
      pageNumber: 2,
      title: "Contents",
      preview: "📋",
      isCompliant: true,
    },
    {
      id: "letter-1",
      section: "Letter",
      pageNumber: 3,
      title: "Transmittal Letter - Page 1",
      preview: "✉️",
      isCompliant: true,
    },
    {
      id: "letter-2",
      section: "Letter",
      pageNumber: 4,
      title: "Transmittal Letter - Page 2",
      preview: "✉️",
      isCompliant: true,
    },
    {
      id: "exec-1",
      section: "Executive Summary",
      pageNumber: 5,
      title: "Executive Summary - Page 1",
      preview: "📊",
      isCompliant: true,
    },
    {
      id: "exec-2",
      section: "Executive Summary",
      pageNumber: 6,
      title: "Executive Summary - Page 2",
      preview: "📊",
      isCompliant: false,
      issues: ["Footer formatting inconsistent", "Page number alignment"],
    },
    {
      id: "qual-1",
      section: "Qualifications",
      pageNumber: 7,
      title: "Qualifications - Team Overview",
      preview: "👥",
      isCompliant: true,
    },
    {
      id: "qual-2",
      section: "Qualifications",
      pageNumber: 8,
      title: "Qualifications - Project Experience",
      preview: "🏗️",
      isCompliant: true,
    },
    {
      id: "tech-1",
      section: "Technical Approach",
      pageNumber: 9,
      title: "Technical Approach - Phase 1",
      preview: "⚙️",
      isCompliant: true,
    },
    {
      id: "tech-2",
      section: "Technical Approach",
      pageNumber: 10,
      title: "Technical Approach - Implementation",
      preview: "🔧",
      isCompliant: true,
    },
  ];

  const sectionSummary = [
    { section: "Cover & Contents", pages: 2, compliant: true },
    { section: "Letter", pages: 2, compliant: true },
    { section: "Executive Summary", pages: 2, compliant: false },
    { section: "Qualifications", pages: 2, compliant: true },
    { section: "Technical Approach", pages: 2, compliant: true },
  ];

  const totalPages = proposalPages.length;
  const compliantPages = proposalPages.filter((p) => p.isCompliant).length;

  const handlePageSelect = (pageId: string) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId],
    );
  };

  const handleSelectAll = () => {
    if (selectedPages.length === proposalPages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(proposalPages.map((p) => p.id));
    }
  };

  const handlePreview = () => {
    if (!proposal) {
      toast.error("Proposal data not available for preview");
      return;
    }
    setPreviewOpen(true);
  };

  const handlePrintFromPreview = () => {
    handlePrint();
    setPreviewOpen(false);
  };

  const handleExportPDFFromPreview = () => {
    handleExport("pdf");
    setPreviewOpen(false);
  };

  const handleScheduleApproval = () => {
    toast.success("Proposal scheduled for approval workflow.");
    setPreviewOpen(false);
    // Here you would typically call an API to submit for approval
    // For now, just show a success message
  };

  const handlePrint = () => {
    toast.info(`Printing ${selectedPages.length} pages with ${printOptions.binding} binding.`);
  };

  const handleExport = (format: string) => {
    toast.info(`Exporting to ${format.toUpperCase()}...`);
  };

  return (
    <>
      <ProposalPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        proposal={proposal ? {
          id: proposal.id,
          title: proposal.title || 'Untitled Proposal',
          summary: proposal.summary || undefined,
          proposal_type: proposal.proposal_type || undefined,
          status: proposal.status || 'draft',
          total_value: proposal.total_value || undefined,
          currency: proposal.currency || 'USD',
          estimated_cost: proposal.estimated_cost || undefined,
          expected_margin: proposal.expected_margin || undefined,
          due_date: proposal.due_date || undefined,
          submission_date: proposal.submission_date || undefined,
          account_name: proposal.account_name || undefined,
          owner_name: proposal.owner_name || undefined,
          sections: proposal.sections || [],
          documents: proposal.documents || [],
          ai_metadata: proposal.ai_metadata || undefined,
          created_at: proposal.created_at || undefined,
          updated_at: proposal.updated_at || undefined,
        } : {
          id: proposalId || '',
          title: 'Loading...',
          currency: 'USD',
        }}
        onPrint={handlePrintFromPreview}
        onExportPDF={handleExportPDFFromPreview}
        onScheduleApproval={handleScheduleApproval}
      />
      
      <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <Layout className="h-5 w-5 text-[#161950]" />
            Proposal Layout Compliance
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Final review of proposal formatting and compliance status
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="bg-[#161950]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-[#161950]" />
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
              {totalPages}
            </div>
            <p className="text-sm text-gray-600 font-outfit font-medium">Total Pages</p>
          </div>
          <div className="text-center p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
            <div className="bg-[#161950]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-[#161950]" />
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
              {compliantPages}
            </div>
            <p className="text-sm text-gray-600 font-outfit font-medium">Compliant</p>
          </div>
          <div className="text-center p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
            <div className="bg-[#161950]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-[#161950]" />
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
              {totalPages - compliantPages}
            </div>
            <p className="text-sm text-gray-600 font-outfit font-medium">Need Review</p>
          </div>
          <div className="text-center p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
            <div className="bg-[#161950]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileCheck className="h-6 w-6 text-[#161950]" />
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
              {Math.round((compliantPages / totalPages) * 100)}%
            </div>
            <p className="text-sm text-gray-600 font-outfit font-medium">Compliance</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#161950]" />
            Section Summary
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Overview of proposal sections and their compliance status
          </p>
        </div>
        <div className="space-y-3">
          {sectionSummary.map((section, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="bg-[#161950]/10 p-2.5 rounded-lg">
                  <FileText className="h-4 w-4 text-[#161950]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">
                    {section.section}
                  </h4>
                  <p className="text-sm text-gray-600 font-outfit">
                    {section.pages} {section.pages === 1 ? 'page' : 'pages'}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit"
              >
                {section.compliant ? (
                  <CheckCircle className="h-3 w-3 mr-1.5" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1.5" />
                )}
                <span className="font-outfit font-medium">
                  {section.compliant ? "Compliant" : "Issues"}
                </span>
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#161950]" />
              Page Layout Preview
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              Review individual pages and select for printing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              className="border-gray-200 hover:bg-gray-50"
            >
              {selectedPages.length === proposalPages.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            <Button 
              size="sm" 
              onClick={handlePreview}
              className="bg-[#161950] hover:bg-[#0f1440]"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview All
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {proposalPages.map((page) => {
            const isSelected = selectedPages.includes(page.id);
            return (
              <div
                key={page.id}
                className={`cursor-pointer rounded-xl border-2 transition-all p-4 hover:shadow-lg ${
                  isSelected
                    ? "border-[#161950] bg-[#161950]/5 shadow-md ring-2 ring-[#161950]/20"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                } ${!page.isCompliant ? "border-[#161950]/30 bg-[#161950]/5" : ""}`}
                onClick={() => handlePageSelect(page.id)}
              >
                <div className="relative mb-3">
                  <div className={`rounded-lg p-5 flex items-center justify-center border-2 ${
                    isSelected 
                      ? "bg-[#161950]/10 border-[#161950]/30" 
                      : "bg-gray-100 border-gray-200"
                  } ${!page.isCompliant ? "border-[#161950]/20 bg-[#161950]/5" : ""}`}>
                    <div className="text-5xl">{page.preview}</div>
                  </div>
                  {!page.isCompliant && (
                    <div className="absolute -top-2 -right-2 bg-[#161950] rounded-full p-1.5 shadow-lg border-2 border-white">
                      <AlertTriangle className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#161950] rounded-full p-1.5 shadow-lg border-2 border-white">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold font-outfit text-[#1A1A1A] mb-1.5">
                    Page {page.pageNumber}
                  </div>
                  <div className="text-xs text-gray-600 font-outfit truncate mb-2 min-h-[2rem]">
                    {page.title}
                  </div>
                  {page.issues && page.issues.length > 0 && (
                    <div className="mb-2">
                      <Badge
                        variant="outline"
                        className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-semibold cursor-help font-outfit"
                        title={page.issues.join(', ')}
                      >
                        <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                        {page.issues.length} issue{page.issues.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-100">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handlePageSelect(page.id)}
                      className="border-gray-300"
                    />
                    <span className="text-xs text-gray-500 font-outfit ml-2">
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-6">
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <Printer className="h-5 w-5 text-[#161950]" />
              Print Configuration
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              Configure printing options for physical submission
            </p>
          </div>
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] block mb-2">
                Output Format
              </Label>
              <Select
                value={printOptions.format}
                onValueChange={(value) =>
                  setPrintOptions((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger className="border-gray-200 font-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital Only</SelectItem>
                  <SelectItem value="print">Physical Print</SelectItem>
                  <SelectItem value="both">Digital + Print</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] block mb-2">
                Number of Copies
              </Label>
              <Select
                value={printOptions.copies.toString()}
                onValueChange={(value) =>
                  setPrintOptions((prev) => ({
                    ...prev,
                    copies: parseInt(value),
                  }))
                }
              >
                <SelectTrigger className="border-gray-200 font-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Copy</SelectItem>
                  <SelectItem value="3">3 Copies</SelectItem>
                  <SelectItem value="5">5 Copies</SelectItem>
                  <SelectItem value="10">10 Copies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] block mb-2">
                Binding Type
              </Label>
              <Select
                value={printOptions.binding}
                onValueChange={(value) =>
                  setPrintOptions((prev) => ({ ...prev, binding: value }))
                }
              >
                <SelectTrigger className="border-gray-200 font-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spiral">Spiral Binding</SelectItem>
                  <SelectItem value="comb">Comb Binding</SelectItem>
                  <SelectItem value="three-ring">3-Ring Binder</SelectItem>
                  <SelectItem value="perfect">Perfect Binding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] block mb-2">
                Paper Type
              </Label>
              <Select
                value={printOptions.paper}
                onValueChange={(value) =>
                  setPrintOptions((prev) => ({ ...prev, paper: value }))
                }
              >
                <SelectTrigger className="border-gray-200 font-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Paper</SelectItem>
                  <SelectItem value="recycled">Recycled Paper</SelectItem>
                  <SelectItem value="premium">Premium Paper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <Checkbox
                id="double-sided"
                checked={printOptions.doubleSided}
                onCheckedChange={(checked) =>
                  setPrintOptions((prev) => ({
                    ...prev,
                    doubleSided: checked as boolean,
                  }))
                }
                className="border-gray-300"
              />
              <Label htmlFor="double-sided" className="text-sm font-outfit text-[#1A1A1A] cursor-pointer">
                Double-sided printing
              </Label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-6">
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#161950]" />
              Submission Options
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              Choose how to submit your completed proposal
            </p>
          </div>
          <div className="space-y-3">
            <Button
              className="w-full justify-start border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              variant="outline"
              onClick={() => handleExport("pdf")}
            >
              <Download className="h-4 w-4 mr-2 text-[#161950]" />
              <span className="font-outfit">Export as PDF</span>
            </Button>

            <Button
              className="w-full justify-start border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              variant="outline"
              onClick={() => handleExport("docx")}
            >
              <FileText className="h-4 w-4 mr-2 text-[#161950]" />
              <span className="font-outfit">Export as Word Document</span>
            </Button>

            <Button
              className="w-full justify-start border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              variant="outline"
              onClick={() =>
                toast.success("Email with proposal attachment is ready.")
              }
            >
              <Mail className="h-4 w-4 mr-2 text-[#161950]" />
              <span className="font-outfit">Email to Client</span>
            </Button>

            <Button
              className="w-full justify-start border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
              variant="outline"
              onClick={handlePrint}
              disabled={selectedPages.length === 0}
            >
              <Printer className="h-4 w-4 mr-2 text-[#161950]" />
              <span className="font-outfit">
                Print Selected Pages ({selectedPages.length})
              </span>
            </Button>

            <div className="mt-6 p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-[#161950]/10 p-2.5 rounded-xl">
                  <Clock className="h-5 w-5 text-[#161950]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 uppercase tracking-wide">
                    Submission Deadline
                  </p>
                  <p className="text-base font-bold font-outfit text-[#161950] mb-2">
                    December 15, 2024 at 3:00 PM
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#161950]/20">
                    <MapPin className="h-4 w-4 text-[#161950]" />
                    <p className="text-sm text-gray-600 font-outfit">
                      Hand delivery to: City Hall, Room 215
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide mb-1">
                    Estimated Print Cost
                  </p>
                  <p className="text-lg font-bold font-outfit text-[#1A1A1A]">
                    ${(selectedPages.length * printOptions.copies * 0.15).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide mb-1">
                    Estimated File Size
                  </p>
                  <p className="text-lg font-bold font-outfit text-[#1A1A1A]">
                    {(selectedPages.length * 2.5).toFixed(1)} MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#161950]/5 rounded-2xl border border-[#161950]/20 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#161950]/10 p-3 rounded-xl">
            <CheckCircle className="h-6 w-6 text-[#161950]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold font-outfit text-[#1A1A1A] mb-1">
              Proposal Ready for Submission
            </p>
            <p className="text-sm text-gray-600 font-outfit">
              Layout review complete. {compliantPages} of {totalPages} pages
              are compliant. Ready for final submission.
            </p>
          </div>
        </div>
      </div>

      {/* Save and Next Buttons */}
      {(onSave || onNext) && (
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          {onSave && (
            <Button
              onClick={onSave}
              variant="outline"
              className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          {onNext && (
            <Button
              onClick={onNext}
              className="font-outfit bg-[#161950] hover:bg-[#0f1440] text-white"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
      </div>
    </>
  );
}
