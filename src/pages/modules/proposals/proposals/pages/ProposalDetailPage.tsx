import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Printer, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProposals } from '@/hooks/proposals';
import ProposalPreview from '@/pages/modules/proposals/shared/components/proposal/ProposalPreview';
import { useState } from 'react';

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useProposal } = useProposals();
  const [previewOpen, setPreviewOpen] = useState(true);
  
  const { data: proposal, isLoading } = useProposal(id, !!id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h2>
          <p className="text-gray-600 mb-6">The proposal you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/proposals')}>
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export PDF functionality to be implemented');
  };

  const handleScheduleApproval = () => {
    navigate(`/proposals/${id}/edit?tab=schedule`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/proposals')}
                className="font-outfit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Proposals
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-outfit">
                  {proposal.title || 'Proposal Details'}
                </h1>
                <p className="text-sm text-gray-600 font-outfit mt-1">
                  View proposal details and preview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/proposals/${id}/edit`)}
                className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Proposal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Using ProposalPreview as modal but keeping it open */}
      <ProposalPreview
        open={previewOpen}
        onOpenChange={(open) => {
          if (!open) {
            navigate('/proposals');
          }
        }}
        proposal={proposal}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onScheduleApproval={handleScheduleApproval}
      />
    </div>
  );
}

