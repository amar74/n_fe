import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Edit3,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileCheck,
  Scale,
  Save,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/shared";

interface ProposalSection {
  id: string;
  name: string;
  content: string;
  isLocked: boolean;
  isCompliant: boolean;
  score: number;
  suggestions: string[];
  wordCount: number;
  pageCount: number;
  pageLimit?: number;
}

interface DetailRefineTabProps {
  onSave?: () => void;
  onNext?: () => void;
}

export default function DetailRefineTab({ onSave, onNext }: DetailRefineTabProps) {
  // will optimize later - guddy.tech
  const { toast } = useToast();
  const [sections, setSections] = useState<ProposalSection[]>([
    {
      id: "executive-summary",
      name: "Executive Summary",
      content:
        "Megapolis Advisory brings unparalleled expertise in urban transit planning to the Metro Transit Expansion project. Our team has successfully delivered over 50 transit projects exceeding $100M in value, with a proven track record of on-time, on-budget delivery.\n\nOur approach leverages cutting-edge AI-powered traffic modeling, sustainable design principles, and extensive stakeholder engagement to ensure project success. We understand the City of Springfield's commitment to environmental sustainability and will integrate green infrastructure throughout the project.\n\nKey differentiators include our proprietary transit optimization algorithms, local partnerships with minority-owned businesses, and our team's 200+ combined years of transit experience.",
      isLocked: false,
      isCompliant: true,
      score: 85,
      suggestions: [
        "Add specific metrics about project outcomes",
        "Include client testimonial or reference",
        "Highlight unique technological advantages",
      ],
      wordCount: 156,
      pageCount: 2,
      pageLimit: 4,
    },
    {
      id: "qualifications",
      name: "Qualifications",
      content:
        "Megapolis Advisory has been at the forefront of transportation infrastructure development for over two decades. Our portfolio includes:\n\n• Metro Rail System, Denver: $2.4B project delivered 6 months ahead of schedule\n• Bus Rapid Transit, Portland: Award-winning sustainable design\n• Multimodal Hub, Austin: Integrated 5 transportation modes\n\nOur team holds over 50 professional engineering licenses across 12 states, with specialized certifications in transit planning, environmental assessment, and project management. We maintain partnerships with leading technology providers and have developed proprietary tools for traffic simulation and route optimization.",
      isLocked: false,
      isCompliant: false,
      score: 78,
      suggestions: [
        "Add specific team member qualifications",
        "Include more recent project examples",
        "Address RFP's minimum experience requirements",
        "Add professional certifications details",
      ],
      wordCount: 132,
      pageCount: 5,
      pageLimit: 8,
    },
    {
      id: "technical-approach",
      name: "Technical Approach",
      content:
        "Our technical approach combines proven methodologies with innovative solutions:\n\nPhase 1: Comprehensive Analysis\n- Traffic pattern analysis using AI-powered modeling\n- Environmental impact assessment\n- Stakeholder engagement and community input\n\nPhase 2: Design Development\n- Sustainable infrastructure design\n- Integration with existing transportation networks\n- Smart city technology implementation\n\nPhase 3: Implementation\n- Phased construction to minimize disruption\n- Real-time monitoring and quality control\n- Community communication and updates\n\nOur approach prioritizes sustainability, community engagement, and technological innovation while ensuring compliance with all federal and state regulations.",
      isLocked: true,
      isCompliant: true,
      score: 92,
      suggestions: [],
      wordCount: 167,
      pageCount: 8,
      pageLimit: 12,
    },
  ]);

  const [contractExceptions, setContractExceptions] = useState([
    {
      id: 1,
      clause: "Liquidated Damages (Section 15.3)",
      issue: "Daily penalty rate exceeds industry standard",
      recommendation: "Request cap at 5% of contract value",
      accepted: false,
    },
    {
      id: 2,
      clause: "Intellectual Property (Section 8.2)",
      issue: "Broad IP assignment to client",
      recommendation: "Limit to project-specific developments only",
      accepted: true,
    },
    {
      id: 3,
      clause: "Insurance Requirements (Section 12.1)",
      issue: "Professional liability coverage amount",
      recommendation: "Standard $2M coverage instead of $5M",
      accepted: false,
    },
  ]);

  const [overallScore, setOverallScore] = useState(85);

  const handleContentChange = (sectionId: string, newContent: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content: newContent,
              wordCount: newContent.split(/\s+/).length,
            }
          : section,
      ),
    );
  };

  const toggleLock = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, isLocked: !section.isLocked }
          : section,
      ),
    );
    toast.success(`Section ${sections.find((s) => s.id === sectionId)?.isLocked ? "unlocked" : "locked"} successfully.`);
  };

  const handleAISuggestion = (sectionId: string, suggestion: string) => {
    toast.success(`AI suggestion applied: ${suggestion}`);
  };

  const handleExceptionToggle = (exceptionId: number) => {
    setContractExceptions((prev) =>
      prev.map((ex) =>
        ex.id === exceptionId ? { ...ex, accepted: !ex.accepted } : ex,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Compliance Score Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#161950]" />
            Proposal Compliance & Score
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Overall proposal assessment based on RFP criteria
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">
              {overallScore}%
            </div>
            <p className="text-sm text-gray-600 font-outfit">Overall Score</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">
              {sections.filter((s) => s.isCompliant).length}
            </div>
            <p className="text-sm text-gray-600 font-outfit">Compliant Sections</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">
              {sections.filter((s) => !s.isCompliant).length}
            </div>
            <p className="text-sm text-gray-600 font-outfit">Need Attention</p>
          </div>
        </div>
        <Progress value={overallScore} className="h-2" />
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <div className="cursor-pointer hover:bg-gray-50 transition-colors p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A]">
                          {section.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-outfit">
                          {section.wordCount} words • {section.pageCount} pages
                          {section.pageLimit && ` (max ${section.pageLimit})`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit"
                      >
                        {section.isCompliant ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {section.isCompliant ? "Compliant" : "Issues"}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Score: {section.score}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLock(section.id);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {section.isLocked ? (
                          <Lock className="h-4 w-4 text-[#161950]" />
                        ) : (
                          <Unlock className="h-4 w-4 text-[#161950]" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-6 space-y-4">
                  <div>
                    <Textarea
                      value={section.content}
                      onChange={(e) =>
                        handleContentChange(section.id, e.target.value)
                      }
                      disabled={section.isLocked}
                      rows={8}
                      className="font-mono text-sm border-gray-200"
                    />
                  </div>

                  {section.suggestions.length > 0 && (
                    <div className="bg-[#161950]/5 border border-[#161950]/20 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold font-outfit text-[#1A1A1A] flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#161950]" />
                          AI Suggestions for Improvement
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {section.suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#161950]/20"
                          >
                            <span className="text-sm text-gray-700 font-outfit">{suggestion}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleAISuggestion(section.id, suggestion)
                              }
                              className="border-gray-200 hover:bg-gray-50"
                            >
                              Apply
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Layout
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Enhance
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleLock(section.id)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      {section.isLocked ? (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Lock
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>

      {/* Contract Exceptions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#161950]" />
            Contract Exceptions & Legal Review
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            AI-identified contract issues and recommended exceptions
          </p>
        </div>
        <div className="space-y-4">
          {contractExceptions.map((exception) => (
            <div key={exception.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm font-outfit text-[#1A1A1A] mb-2">
                    {exception.clause}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2 font-outfit">
                    <strong>Issue:</strong> {exception.issue}
                  </p>
                  <p className="text-sm text-[#161950] font-outfit">
                    <strong>Recommendation:</strong> {exception.recommendation}
                  </p>
                </div>
                <div className="ml-4">
                  <Button
                    size="sm"
                    variant={exception.accepted ? "default" : "outline"}
                    onClick={() => handleExceptionToggle(exception.id)}
                    className={exception.accepted ? "bg-[#161950] hover:bg-[#0f1440]" : "border-gray-200"}
                  >
                    {exception.accepted ? "Accepted" : "Accept"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-[#161950]/5 rounded-lg border border-[#161950]/20">
          <p className="text-sm text-gray-600 font-outfit">
            <strong>Legal Review Status:</strong> 2 of 3 exceptions accepted.
            Review remaining items with legal counsel before final submission.
          </p>
        </div>
      </div>

      {/* Ready Status */}
      <div className="bg-[#161950]/5 rounded-2xl border border-[#161950]/20 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-[#161950]" />
          <div>
            <p className="font-semibold text-[#1A1A1A] font-outfit">
              Proposal Ready for Next Phase
            </p>
            <p className="text-sm text-gray-600 font-outfit">
              All sections reviewed and compliance issues addressed. Ready to
              proceed to Layout/Print tab.
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
  );
}
