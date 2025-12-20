import { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Loader2,
  Check,
  Share2,
  Download,
  Printer,
  Wand2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/shared';
import type { BrochureSection, UploadedImage } from './types';

interface PreviewTabProps {
  sections: BrochureSection[];
  uploadedImages: UploadedImage[];
  selectedTheme: string;
  opportunityData: any;
  brochure: any;
  aiGeneratedBrochure: any;
  setAiGeneratedBrochure: (brochure: any) => void;
  isGeneratingBrochure: boolean;
  setIsGeneratingBrochure: (value: boolean) => void;
  onNext: () => void;
  handleGenerateAIBrochure: () => Promise<void>;
}

export function PreviewTab({
  sections,
  uploadedImages,
  selectedTheme,
  opportunityData,
  brochure,
  aiGeneratedBrochure,
  setAiGeneratedBrochure,
  isGeneratingBrochure,
  setIsGeneratingBrochure,
  onNext,
  handleGenerateAIBrochure,
}: PreviewTabProps) {
  const { toast } = useToast();
  const [previewZoom, setPreviewZoom] = useState(100);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const currentSection = sections[currentPreviewPage];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A] mb-2">
            Brochure Preview
          </h3>
          <p className="text-sm text-gray-600 font-outfit">
            {aiGeneratedBrochure 
              ? 'AI-generated brochure ready for review' 
              : 'Generate your perfect brochure with AI or preview manually'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!aiGeneratedBrochure && (
            <Button
              onClick={handleGenerateAIBrochure}
              disabled={isGeneratingBrochure || !opportunityData}
              className="font-outfit bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isGeneratingBrochure ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
          {aiGeneratedBrochure && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="font-outfit"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-outfit"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-outfit"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAiGeneratedBrochure(null);
                  toast.info('Regenerating brochure...');
                }}
                className="font-outfit"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </>
          )}
        </div>
      </div>

      {/* AI Generation Prompt */}
      {!aiGeneratedBrochure && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-2">
                AI-Powered Brochure Generation
              </h4>
              <p className="text-sm text-gray-700 font-outfit mb-4">
                Let AI create a perfect, professional brochure tailored to your opportunity. Our AI will analyze:
              </p>
              <ul className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600 font-outfit">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Opportunity details & requirements
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Content sections & structure
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Design theme & preferences
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Images & visual assets
                </li>
              </ul>
              <Button
                onClick={handleGenerateAIBrochure}
                disabled={isGeneratingBrochure || !opportunityData}
                className="font-outfit bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isGeneratingBrochure ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI is creating your brochure...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Perfect Brochure Now
                  </>
                )}
              </Button>
              {!opportunityData && (
                <p className="text-xs text-yellow-600 mt-2 font-outfit">
                  Opportunity data is required to generate the brochure
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Generated Brochure Preview */}
      {aiGeneratedBrochure && (
        <div className="space-y-8">
          {/* Professional Cover Page */}
          {aiGeneratedBrochure.sections
            .filter((s: any) => s.type === 'cover')
            .map((coverSection: any, index: number) => {
              const primaryColor = aiGeneratedBrochure.design.primaryColor;
              const secondaryColor = aiGeneratedBrochure.design.secondaryColor || primaryColor;
              
              return (
                <div 
                  key={`cover-${index}`}
                  className="relative rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    background: aiGeneratedBrochure.cover.backgroundImage 
                      ? `linear-gradient(135deg, ${primaryColor}dd 0%, ${secondaryColor}dd 100%), url(${aiGeneratedBrochure.cover.backgroundImage})`
                      : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '700px',
                    aspectRatio: '16/9',
                  }}
                >
                  {/* Subtle background pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    {aiGeneratedBrochure.cover.backgroundImage && (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${aiGeneratedBrochure.cover.backgroundImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center p-12 relative z-10">
                    <div className="max-w-5xl mx-auto text-center text-white">
                      {/* Badge */}
                      <div className="mb-8">
                        <div 
                          className="inline-block px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider mb-8"
                          style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          Professional Service Capabilities
                        </div>
                      </div>
                      
                      {/* Main Title */}
                      <h1 className="text-6xl md:text-7xl font-bold font-outfit mb-8 leading-tight drop-shadow-lg">
                        {aiGeneratedBrochure.cover.title}
                      </h1>
                      
                      {/* Decorative Line */}
                      <div className="w-32 h-1 bg-white mx-auto mb-10 opacity-90"></div>
                      
                      {/* Subtitle */}
                      <p className="text-3xl md:text-4xl font-semibold font-outfit mb-6 opacity-95">
                        {aiGeneratedBrochure.cover.subtitle}
                      </p>
                      
                      {/* Tagline */}
                      <p className="text-xl md:text-2xl font-outfit opacity-90 mb-12 max-w-3xl mx-auto">
                        {aiGeneratedBrochure.cover.tagline}
                      </p>
                      
                      {/* Project Info */}
                      {(aiGeneratedBrochure.cover.projectValue || aiGeneratedBrochure.cover.deadline) && (
                        <div className="flex items-center justify-center gap-12 mt-16 pt-12 border-t border-white/30">
                          {aiGeneratedBrochure.cover.projectValue && (
                            <div className="text-center">
                              <div className="text-sm font-semibold opacity-90 mb-2 uppercase tracking-wide">Project Value</div>
                              <div className="text-3xl font-bold">{aiGeneratedBrochure.cover.projectValue}</div>
                            </div>
                          )}
                          {aiGeneratedBrochure.cover.deadline && (
                            <div className="text-center">
                              <div className="text-sm font-semibold opacity-90 mb-2 uppercase tracking-wide">Target Deadline</div>
                              <div className="text-3xl font-bold">{aiGeneratedBrochure.cover.deadline}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-white/70 text-sm font-outfit">
                    <div>Service Capabilities Brochure</div>
                    <div>{new Date().getFullYear()}</div>
                  </div>
                </div>
              );
            })}

          {/* Professional Brochure Sections */}
          {aiGeneratedBrochure.sections
            .filter((s: any) => s.type !== 'cover')
            .sort((a: any, b: any) => a.order - b.order)
            .map((section: any, index: number) => (
              <div 
                key={section.id || index}
                className="rounded-xl border border-gray-200 shadow-lg overflow-hidden"
                style={{ 
                  minHeight: '700px', 
                  aspectRatio: '16/9',
                  backgroundColor: section.backgroundColor || aiGeneratedBrochure.design.backgroundColor || '#FFFFFF',
                }}
              >
                {/* Section Header */}
                <div 
                  className="px-8 py-6 border-b-4"
                  style={{ 
                    backgroundColor: `${aiGeneratedBrochure.design.primaryColor}15`,
                    borderBottomColor: aiGeneratedBrochure.design.primaryColor,
                    borderBottomWidth: '4px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 font-outfit uppercase tracking-wide mb-1">
                        Section {index + 2} of {aiGeneratedBrochure.sections.filter((s: any) => s.type !== 'cover').length + 1}
                      </div>
                      <h2 
                        className="text-4xl font-bold font-outfit"
                        style={{ color: aiGeneratedBrochure.design.primaryColor }}
                      >
                        {section.title}
                      </h2>
                    </div>
                    <div 
                      className="w-16 h-1 rounded-full"
                      style={{ backgroundColor: aiGeneratedBrochure.design.primaryColor }}
                    ></div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-10 relative">
                  {/* Background Image */}
                  {section.imageIndex !== null && section.imageIndex !== undefined && uploadedImages[section.imageIndex] && (
                    <div 
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `url(${uploadedImages[section.imageIndex].url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  )}
                  
                  <div 
                    className={`max-w-5xl mx-auto relative z-10 ${
                      section.textAlign === 'center' ? 'text-center' : 
                      section.textAlign === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {/* Featured Image */}
                    {section.imageIndex !== null && section.imageIndex !== undefined && uploadedImages[section.imageIndex] && (
                      <div className={`mb-6 ${section.textAlign === 'center' ? 'flex justify-center' : section.textAlign === 'right' ? 'flex justify-end' : 'flex justify-start'}`}>
                        <img 
                          src={uploadedImages[section.imageIndex].url}
                          alt={uploadedImages[section.imageIndex].name}
                          className="max-w-md rounded-lg shadow-md object-cover"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    )}
                    
                    <div 
                      className="prose prose-xl max-w-none font-outfit text-lg leading-relaxed"
                      style={{ 
                        color: '#1A1A1A',
                        textAlign: section.textAlign || 'left',
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: (() => {
                          const content = section.content;
                          const primaryColor = aiGeneratedBrochure.design.primaryColor;
                          const lines = content.split('\n');
                          const result: string[] = [];
                          let inList = false;
                          let listType: 'ul' | 'ol' | null = null;
                          let currentPara: string[] = [];
                          
                          const textAlign = section.textAlign || 'left';
                          const alignClass = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left';
                          // Only justify for left/right aligned text, and only for paragraphs (not headings or lists)
                          const justifyClass = (textAlign === 'left' || textAlign === 'right') ? '' : '';
                          
                          const flushParagraph = () => {
                            if (currentPara.length > 0) {
                              const paraText = currentPara.join(' ').trim();
                              if (paraText) {
                                let formatted = paraText
                                  .replace(/\*\*(.+?)\*\*/g, `<strong class="font-bold" style="color: ${primaryColor}">$1</strong>`)
                                  .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic text-gray-700">$1</em>');
                                result.push(`<p class="mb-5 text-lg leading-relaxed ${alignClass}" style="text-align: ${textAlign}; line-height: 1.8;">${formatted}</p>`);
                              }
                              currentPara = [];
                            }
                          };
                          
                          const closeList = () => {
                            if (inList && listType) {
                              result.push(`</${listType}>`);
                              inList = false;
                              listType = null;
                            }
                          };
                          
                          lines.forEach((line) => {
                            const trimmed = line.trim();
                            
                            if (trimmed.startsWith('### ')) {
                              closeList();
                              flushParagraph();
                              const text = trimmed.replace(/^###\s+/, '').trim();
                              result.push(`<h3 class="text-3xl font-bold mt-8 mb-4 ${alignClass}" style="color: ${primaryColor}">${text}</h3>`);
                            } else if (trimmed.startsWith('## ')) {
                              closeList();
                              flushParagraph();
                              const text = trimmed.replace(/^##\s+/, '').trim();
                              result.push(`<h2 class="text-4xl font-bold mt-10 mb-6 ${alignClass}" style="color: ${primaryColor}">${text}</h2>`);
                            } else if (trimmed.startsWith('# ')) {
                              closeList();
                              flushParagraph();
                              const text = trimmed.replace(/^#\s+/, '').trim();
                              result.push(`<h1 class="text-5xl font-bold mt-12 mb-8 ${alignClass}" style="color: ${primaryColor}">${text}</h1>`);
                            } else if (/^\d+\.\s/.test(trimmed)) {
                              flushParagraph();
                              const text = trimmed.replace(/^\d+\.\s+/, '').trim();
                              if (!inList || listType !== 'ol') {
                                closeList();
                                const listAlignClass = textAlign === 'center' ? 'list-none' : '';
                                const listMarginClass = textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'mr-auto ml-auto' : 'ml-8';
                                result.push(`<ol class="list-decimal space-y-3 my-6 ${listMarginClass} ${listAlignClass} ${alignClass}" style="${textAlign === 'center' ? 'max-width: 80%;' : ''}">`);
                                inList = true;
                                listType = 'ol';
                              }
                              const formatted = text
                                .replace(/\*\*(.+?)\*\*/g, `<strong class="font-bold" style="color: ${primaryColor}">$1</strong>`)
                                .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic text-gray-700">$1</em>');
                              result.push(`<li class="text-lg leading-relaxed mb-2" style="line-height: 1.7;">${formatted}</li>`);
                            } else if (/^[-•]\s/.test(trimmed)) {
                              flushParagraph();
                              const text = trimmed.replace(/^[-•]\s+/, '').trim();
                              if (!inList || listType !== 'ul') {
                                closeList();
                                const listAlignClass = textAlign === 'center' ? 'list-none' : '';
                                const listMarginClass = textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'mr-auto ml-auto' : 'ml-8';
                                result.push(`<ul class="list-disc space-y-3 my-6 ${listMarginClass} ${listAlignClass} ${alignClass}" style="${textAlign === 'center' ? 'max-width: 80%;' : ''}">`);
                                inList = true;
                                listType = 'ul';
                              }
                              const formatted = text
                                .replace(/\*\*(.+?)\*\*/g, `<strong class="font-bold" style="color: ${primaryColor}">$1</strong>`)
                                .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic text-gray-700">$1</em>');
                              result.push(`<li class="text-lg leading-relaxed mb-2" style="line-height: 1.7;">${formatted}</li>`);
                            } else if (!trimmed) {
                              closeList();
                              flushParagraph();
                            } else {
                              if (inList) {
                                closeList();
                              }
                              currentPara.push(trimmed);
                            }
                          });
                          
                          closeList();
                          flushParagraph();
                          
                          return result.join('\n');
                        })()
                      }}
                    />
                  </div>
                </div>

                {/* Section Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600 font-outfit">
                    <div>{aiGeneratedBrochure.metadata.generatedAt ? new Date(aiGeneratedBrochure.metadata.generatedAt).toLocaleDateString() : ''}</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: aiGeneratedBrochure.design.primaryColor }}
                      ></div>
                      <span>{section.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Manual Preview (fallback) */}
      {!aiGeneratedBrochure && (
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPreviewPage(Math.max(0, currentPreviewPage - 1))}
                disabled={currentPreviewPage === 0}
                className="font-outfit"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium font-outfit text-[#1A1A1A]">
                Page {currentPreviewPage + 1} of {sections.length || 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPreviewPage(Math.min((sections.length || 1) - 1, currentPreviewPage + 1))}
                disabled={currentPreviewPage >= (sections.length || 1) - 1}
                className="font-outfit"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                className="font-outfit"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium font-outfit text-[#1A1A1A] min-w-[60px] text-center">
                {previewZoom}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                className="font-outfit"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[600px]">
            <div
              className="bg-white shadow-xl rounded-lg p-8 transition-transform"
              style={{
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'center',
                width: '8.5in',
                minHeight: '11in',
              }}
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold font-outfit text-[#161950] mb-4">
                  {currentSection?.title || 'Brochure Page'}
                </h2>
                <p className="text-gray-600 font-outfit whitespace-pre-wrap">
                  {currentSection?.content || 'Preview content will appear here'}
                </p>
                {uploadedImages.length > 0 && (
                  <div className="mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      {uploadedImages.slice(0, 2).map((img) => (
                        <img
                          key={img.id}
                          src={img.url}
                          alt={img.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
        <Button
          onClick={onNext}
          className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
        >
          Next: Launch
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

