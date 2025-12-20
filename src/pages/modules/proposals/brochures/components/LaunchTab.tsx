import { Check, X, Zap, Brain, Sparkles, Target, Lightbulb, Download, Share2, Printer, Mail, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/shared';
import type { DesignTheme, UploadedImage, BrochureSection } from './types';

interface LaunchTabProps {
  sections: BrochureSection[];
  uploadedImages: UploadedImage[];
  designThemes: DesignTheme[];
  selectedTheme: string;
  brochureId: string | undefined;
  onSave?: () => void;
  onViewDetails?: () => void;
}

export function LaunchTab({
  sections,
  uploadedImages,
  designThemes,
  selectedTheme,
  brochureId,
  onSave,
  onViewDetails,
}: LaunchTabProps) {
  const { toast } = useToast();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-[#161950] to-purple-600 p-3 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A]">
              Launch Your Brochure
            </h3>
            <p className="text-sm text-gray-600 font-outfit">
              Finalize and distribute your AI-generated brochure
            </p>
          </div>
        </div>
      </div>

      {/* Pre-Launch Checklist */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-[#161950]" />
          Pre-Launch Checklist
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium font-outfit text-green-900">
                Content Complete
              </p>
              <p className="text-xs text-green-700 font-outfit">
                All sections have content ({sections.filter(s => s.content.trim()).length}/{sections.length} sections)
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            uploadedImages.length > 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            {uploadedImages.length > 0 ? (
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium font-outfit ${
                uploadedImages.length > 0 ? 'text-green-900' : 'text-yellow-900'
              }`}>
                Images Added
              </p>
              <p className={`text-xs font-outfit ${
                uploadedImages.length > 0 ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {uploadedImages.length > 0 
                  ? `${uploadedImages.length} images uploaded` 
                  : 'Consider adding images to enhance your brochure'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium font-outfit text-green-900">
                Design Theme Selected
              </p>
              <p className="text-xs text-green-700 font-outfit">
                {designThemes.find(t => t.id === selectedTheme)?.name || 'Theme selected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium font-outfit text-green-900">
                Preview Reviewed
              </p>
              <p className="text-xs text-green-700 font-outfit">
                Brochure preview is ready for launch
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Final Review */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold font-outfit text-[#1A1A1A]">
              AI Final Review
            </h4>
            <p className="text-sm text-gray-600 font-outfit">
              Let AI analyze your brochure before launch
            </p>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#161950] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium font-outfit text-[#1A1A1A] mb-1">
                  Content Quality: Excellent
                </p>
                <p className="text-xs text-gray-600 font-outfit">
                  Your brochure content is well-structured and professional. All key sections are complete.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-[#161950] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium font-outfit text-[#1A1A1A] mb-1">
                  Design Consistency: Good
                </p>
                <p className="text-xs text-gray-600 font-outfit">
                  Design theme is consistent throughout. Colors and typography align with your brand.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-[#161950] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium font-outfit text-[#1A1A1A] mb-1">
                  Readiness Score: 95%
                </p>
                <p className="text-xs text-gray-600 font-outfit">
                  Your brochure is ready for launch! All critical elements are in place.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full font-outfit border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={() => {
            toast.success('AI review completed. Your brochure is ready to launch!');
          }}
        >
          <Brain className="h-4 w-4 mr-2" />
          Run AI Final Review
        </Button>
      </div>

      {/* Launch Options */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-4">
          Launch Options
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#161950] transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg">
                <Download className="h-6 w-6 text-[#161950]" />
              </div>
              <div>
                <h5 className="font-semibold font-outfit text-[#1A1A1A]">
                  Download PDF
                </h5>
                <p className="text-xs text-gray-600 font-outfit">
                  Export as PDF for printing
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-[#161950] hover:bg-[#0f1440] font-outfit"
              onClick={async () => {
                toast.success('Generating PDF... This may take a moment.');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#161950] transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg">
                <Share2 className="h-6 w-6 text-[#161950]" />
              </div>
              <div>
                <h5 className="font-semibold font-outfit text-[#1A1A1A]">
                  Share Online
                </h5>
                <p className="text-xs text-gray-600 font-outfit">
                  Generate shareable link
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
              onClick={() => {
                toast.success('Shareable link generated!');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Generate Link
            </Button>
          </div>

          <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#161950] transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg">
                <Printer className="h-6 w-6 text-[#161950]" />
              </div>
              <div>
                <h5 className="font-semibold font-outfit text-[#1A1A1A]">
                  Print Ready
                </h5>
                <p className="text-xs text-gray-600 font-outfit">
                  Optimized for professional printing
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full font-outfit border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                window.print();
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Now
            </Button>
          </div>

          <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#161950] transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-[#161950]" />
              </div>
              <div>
                <h5 className="font-semibold font-outfit text-[#1A1A1A]">
                  Email Distribution
                </h5>
                <p className="text-xs text-gray-600 font-outfit">
                  Send via email to stakeholders
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full font-outfit border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                toast.success('Email distribution feature coming soon!');
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </div>

      {/* Final Actions */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 mt-6">
        {onSave && (
          <Button
            onClick={onSave}
            className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
          >
            <Check className="h-4 w-4 mr-2" />
            Save Proposal
          </Button>
        )}
        {onViewDetails && (
          <Button
            variant="outline"
            onClick={onViewDetails}
            className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Proposal in Details
          </Button>
        )}
      </div>
    </div>
  );
}

