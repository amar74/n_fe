import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, Sparkles, Wand2, Target, Lightbulb, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/shared';
import { apiClient } from '@/services/api/client';
import type { DesignTheme } from './types';

interface DesignTabProps {
  brochureId: string | undefined;
  designThemes: DesignTheme[];
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  isEditMode: boolean;
  onNext: () => void;
  brochure?: any;
  onDesignSaved?: () => void;
}

export function DesignTab({
  brochureId,
  designThemes,
  selectedTheme,
  setSelectedTheme,
  isEditMode,
  onNext,
  brochure,
  onDesignSaved,
}: DesignTabProps) {
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState('#161950');
  const [layoutStyle, setLayoutStyle] = useState('modern');
  const [fontFamily, setFontFamily] = useState('outfit');
  const [pageSize, setPageSize] = useState('letter');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [hasLoadedMetadata, setHasLoadedMetadata] = useState(false);
  const previousThemeRef = useRef<string>(selectedTheme);

  // Load existing design preferences from brochure.ai_metadata (only once on mount or when brochure changes)
  useEffect(() => {
    if (hasLoadedMetadata) return; // Already loaded, don't run again
    
    if (brochure?.ai_metadata) {
      const metadata = brochure.ai_metadata;
      if (metadata.primaryColor) setPrimaryColor(metadata.primaryColor);
      if (metadata.layoutStyle) setLayoutStyle(metadata.layoutStyle);
      if (metadata.fontFamily) setFontFamily(metadata.fontFamily);
      if (metadata.pageSize) setPageSize(metadata.pageSize);
      if (metadata.theme) {
        setSelectedTheme(metadata.theme);
        previousThemeRef.current = metadata.theme;
        // Set primary color from theme
        const theme = designThemes.find(t => t.id === metadata.theme);
        if (theme && theme.colors.length > 0) {
          setPrimaryColor(theme.colors[0]);
        }
      }
      setHasLoadedMetadata(true);
    } else if (selectedTheme && designThemes.length > 0) {
      // Set primary color based on selected theme if no metadata exists
      const theme = designThemes.find(t => t.id === selectedTheme);
      if (theme && theme.colors.length > 0) {
        setPrimaryColor(theme.colors[0]);
      }
      previousThemeRef.current = selectedTheme;
      setHasLoadedMetadata(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brochure, designThemes]); // Only depend on brochure and designThemes to load once

  // Update primary color when theme changes (after initial load)
  useEffect(() => {
    if (hasLoadedMetadata && previousThemeRef.current !== selectedTheme) {
      const theme = designThemes.find(t => t.id === selectedTheme);
      if (theme && theme.colors.length > 0) {
        setPrimaryColor(theme.colors[0]);
        setHasUnsavedChanges(true);
      }
      previousThemeRef.current = selectedTheme;
    }
  }, [selectedTheme, designThemes, hasLoadedMetadata]);

  // Save design preferences to API
  const handleSaveDesign = async () => {
    if (!brochureId) {
      toast.error('Brochure ID is required');
      return;
    }

    setIsSaving(true);
    try {
      const designMetadata = {
        theme: selectedTheme,
        primaryColor: primaryColor,
        layoutStyle: layoutStyle,
        fontFamily: fontFamily,
        pageSize: pageSize,
      };

      await apiClient.put(`/proposals/${brochureId}`, {
        ai_metadata: {
          ...(brochure?.ai_metadata || {}),
          ...designMetadata,
        },
      });

      toast.success('Design preferences saved successfully');
      setHasUnsavedChanges(false);
      if (onDesignSaved) {
        onDesignSaved();
      }
    } catch (error: any) {
      console.error('[DesignTab] Error saving design preferences:', error);
      toast.error(error.response?.data?.detail || 'Failed to save design preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    setHasUnsavedChanges(true);
  };

  const handleLayoutStyleChange = (style: string) => {
    setLayoutStyle(style);
    setHasUnsavedChanges(true);
  };

  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    setHasUnsavedChanges(true);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(size);
    setHasUnsavedChanges(true);
  };

  const handleThemeSelect = (themeId: string) => {
    if (!isEditMode) return;
    setSelectedTheme(themeId);
    setHasUnsavedChanges(true);
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A]">
            Design Theme Selection
          </h3>
          {!isEditMode && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              View Mode - Editing Disabled
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 font-outfit">
          Choose a design theme that matches your brand and message
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {designThemes.map((theme) => (
          <div
            key={theme.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              isEditMode ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-75'
            } ${
              selectedTheme === theme.id
                ? 'border-[#161950] bg-[#161950]/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">
                  {theme.name}
                </h4>
                <p className="text-sm text-gray-600 font-outfit">
                  {theme.description}
                </p>
              </div>
              {selectedTheme === theme.id && (
                <Check className="h-5 w-5 text-[#161950] flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {theme.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-4">
          Customization Options
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="font-outfit text-[#1A1A1A] mb-2">Primary Color</Label>
            {isEditMode ? (
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="w-20 h-10 p-1 border-2 border-gray-200 rounded-lg cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="font-outfit"
                  placeholder="#161950"
                />
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ backgroundColor: primaryColor }}></div>
                <span>{primaryColor}</span>
              </div>
            )}
          </div>
          <div>
            <Label className="font-outfit text-[#1A1A1A] mb-2">Layout Style</Label>
            {isEditMode ? (
              <Select value={layoutStyle} onValueChange={handleLayoutStyleChange}>
                <SelectTrigger className="font-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit capitalize">
                {layoutStyle}
              </div>
            )}
          </div>
          <div>
            <Label className="font-outfit text-[#1A1A1A] mb-2">Font Family</Label>
            {isEditMode ? (
              <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                <SelectTrigger className="font-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outfit">Outfit</SelectItem>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="opensans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit capitalize">
                {fontFamily}
              </div>
            )}
          </div>
          <div>
            <Label className="font-outfit text-[#1A1A1A] mb-2">Page Size</Label>
            {isEditMode ? (
              <Select value={pageSize} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="font-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">Letter (8.5" x 11")</SelectItem>
                  <SelectItem value="a4">A4 (210mm x 297mm)</SelectItem>
                  <SelectItem value="legal">Legal (8.5" x 14")</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                {pageSize === 'letter' && "Letter (8.5\" x 11\")"}
                {pageSize === 'a4' && 'A4 (210mm x 297mm)'}
                {pageSize === 'legal' && "Legal (8.5\" x 14\")"}
                {!['letter', 'a4', 'legal'].includes(pageSize) && pageSize}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-1">
                AI Design Assistant
              </p>
              <p className="text-xs text-gray-600 font-outfit">
                Generate custom design variations based on your preferences
              </p>
            </div>
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                className="font-outfit border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </Button>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#161950]" />
            AI Design Recommendations
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium font-outfit text-blue-900 mb-1">
                    Theme Optimization
                  </p>
                  <p className="text-xs text-blue-700 font-outfit">
                    The selected theme works well for professional audiences. Consider using the Modern Blue theme for better brand alignment.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium font-outfit text-green-900 mb-1">
                    Color Harmony
                  </p>
                  <p className="text-xs text-green-700 font-outfit">
                    Your current color palette creates good visual hierarchy and readability.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium font-outfit text-purple-900 mb-1">
                    Layout Suggestion
                  </p>
                  <p className="text-xs text-purple-700 font-outfit">
                    Consider using a two-column layout for better content organization and visual balance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save and Next Buttons */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 mt-6">
        {hasUnsavedChanges && isEditMode && (
          <div className="text-sm text-amber-600 font-outfit flex items-center gap-2">
            <span>You have unsaved changes</span>
          </div>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {isEditMode && (
            <Button
              variant="outline"
              onClick={handleSaveDesign}
              disabled={isSaving || !hasUnsavedChanges}
              className="font-outfit"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Design
                </>
              )}
            </Button>
          )}
          <Button
            onClick={onNext}
            className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
          >
            Next: Images
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

