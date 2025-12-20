import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  FileText,
  Link as LinkIcon,
  Type,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/shared";
import { apiClient } from "@/services/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { proposalKeys, useProposals } from "@/hooks/proposals/useProposals";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  status: "uploading" | "completed" | "error";
  serverId?: string; // Server-side document ID
}

interface UploadTabProps {
  proposalId?: string;
  onSave?: () => void;
  onNext?: () => void;
  onCreateProposal?: () => Promise<string | null>;
}

export default function UploadTab({ proposalId, onSave, onNext, onCreateProposal }: UploadTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { useProposal } = useProposals();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [websiteLink, setWebsiteLink] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [savedFiles, setSavedFiles] = useState<UploadedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [fileMap, setFileMap] = useState<Map<string, File>>(new Map());

  // Fetch proposal data if proposalId is available
  const { data: proposal } = useProposal(proposalId, !!proposalId);

  // Load existing documents from proposal when proposal data is available
  useEffect(() => {
    if (proposal && proposal.documents) {
      const documents = proposal.documents || [];
      if (documents.length > 0) {
        const existingFiles: UploadedFile[] = documents.map((doc: any) => ({
          id: doc.id || Math.random().toString(36).substr(2, 9),
          name: doc.name || 'Unknown file',
          size: doc.extra_metadata?.file_size || 0,
          type: doc.extra_metadata?.content_type || 'application/octet-stream',
          category: doc.category || 'attachment',
          status: 'completed' as const,
          serverId: doc.id,
        }));
        setSavedFiles(existingFiles);
        console.log('[UploadTab] Loaded existing documents from proposal:', existingFiles);
      }
    }
  }, [proposal]);

  const documentCategories = {
    client: {
      title: "CLIENT DOCUMENTS",
      items: [
        {
          name: "RFP (client/project specific) with contract terms",
          obtained: true,
          source: "AI Web Research",
        },
        { name: "Addendums to RFP", obtained: false, source: "" },
        {
          name: "Past RFP(s) for similar services",
          obtained: true,
          source: "AI Web Research",
        },
        {
          name: "Available public data (EIR/EIS/presentations)",
          obtained: true,
          source: "AI Web Research",
        },
        {
          name: "Project Location (Google Maps)",
          obtained: true,
          source: "AI Web Research",
        },
        {
          name: "Client discussion notes and strategy",
          obtained: false,
          source: "",
        },
        { name: "Client Logo", obtained: true, source: "AI Web Research" },
        { name: "Project site pictures", obtained: false, source: "" },
        { name: "Team pictures at the site", obtained: false, source: "" },
        { name: "Award pictures with client", obtained: false, source: "" },
      ],
    },
    firm: {
      title: "FIRM DOCUMENTS",
      items: [
        { name: "Company Logo", obtained: true, source: "Pre-uploaded" },
        { name: "Past Proposals (Firm)", obtained: true, source: "Database" },
        {
          name: "Project data for qualifications section",
          obtained: true,
          source: "Database",
        },
        { name: "Past Awards", obtained: true, source: "Database" },
        { name: "References and quotes", obtained: false, source: "" },
        {
          name: "Graphics and design examples",
          obtained: true,
          source: "Database",
        },
        {
          name: "Text templates for sections",
          obtained: true,
          source: "Database",
        },
        {
          name: "Proposal design styles and themes",
          obtained: true,
          source: "Database",
        },
        {
          name: "Success stories and lessons learned",
          obtained: false,
          source: "",
        },
        { name: "Team/individual pictures", obtained: false, source: "" },
        { name: "Completed project photos", obtained: false, source: "" },
        { name: "Technical documentation", obtained: false, source: "" },
      ],
    },
    competition: {
      title: "COMPETITION ANALYSIS",
      items: [
        {
          name: "Past Proposals (Competition)",
          obtained: true,
          source: "AI Web Research",
        },
        {
          name: "List of competitors for this opportunity",
          obtained: true,
          source: "AI Web Research",
        },
        {
          name: "Competitor staffing information",
          obtained: false,
          source: "",
        },
        {
          name: "Competitor resumes and past performance",
          obtained: false,
          source: "",
        },
      ],
    },
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFiles = useCallback((files: FileList) => {
    if (!files || files.length === 0) {
      toast.error("No files selected");
      return;
    }

    console.log('[UploadTab] Processing files:', files.length);
    Array.from(files).forEach((file) => {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        category: selectedDocuments.length > 0 ? selectedDocuments[0] : "General",
        status: "uploading",
      };

      setUploadedFiles((prev) => [...prev, newFile]);
      setFileMap((prev) => new Map(prev).set(fileId, file));

      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: "completed" } : f,
          ),
        );
        toast.success(`${file.name} uploaded successfully. Click Save to store it.`);
      }, 1000);
    });
  }, [selectedDocuments, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );


  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[UploadTab] File input changed:', e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleWebsiteSubmit = () => {
    console.log('[UploadTab] Website submit clicked, URL:', websiteLink);
    if (!websiteLink.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(websiteLink.trim());
    } catch (e) {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Website: ${websiteLink}`,
      size: 0,
      type: "website",
      category: selectedDocuments.length > 0 ? selectedDocuments[0] : "General",
      status: "uploading",
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    setWebsiteLink("");

    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, status: "completed" } : f,
        ),
      );
      toast.success("Website content extracted and analyzed successfully.");
    }, 3000);
  };

  const handleTextSubmit = () => {
    if (!pastedText.trim()) {
      toast.error("Please paste some text content");
      return;
    }

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Text Content (${pastedText.substring(0, 30)}...)`,
      size: pastedText.length,
      type: "text",
      category: selectedDocuments.length > 0 ? selectedDocuments[0] : "General",
      status: "uploading",
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    setPastedText("");

    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, status: "completed" } : f,
        ),
      );
      toast.success("Text content processed and categorized successfully.");
    }, 1500);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setSavedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setFileMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  const toggleDocument = (document: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(document)
        ? prev.filter((d) => d !== document)
        : [...prev, document],
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(documentCategories).map(([key, category]) => (
          <div key={key} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="mb-4">
              <h4 className="text-[#1A1A1A] text-base font-semibold font-outfit mb-1">{category.title}</h4>
              <p className="text-gray-600 text-xs font-outfit">
                Select documents you're uploading from this category
              </p>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {category.items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    item.obtained 
                      ? "bg-[#161950]/5 border border-[#161950]/20" 
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mt-0.5">
                    <Checkbox
                      id={`${key}-${index}`}
                      checked={
                        selectedDocuments.includes(item.name) || item.obtained
                      }
                      onCheckedChange={() =>
                        !item.obtained && toggleDocument(item.name)
                      }
                      disabled={item.obtained}
                      className="data-[state=checked]:bg-[#161950] data-[state=checked]:border-[#161950]"
                    />
                    {item.obtained && (
                      <CheckCircle className="h-4 w-4 text-[#161950] flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`${key}-${index}`}
                      className={`text-sm font-outfit leading-5 cursor-pointer ${
                        item.obtained ? "text-[#1A1A1A] font-medium" : "text-[#1A1A1A]"
                      }`}
                    >
                      {item.name}
                    </Label>
                    {item.obtained && (
                      <div className="text-xs text-[#161950] mt-1.5 font-outfit font-medium">
                        ✓ Obtained via {item.source}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-4">
            <h4 className="text-[#1A1A1A] text-base font-semibold font-outfit mb-1 flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#161950]" />
              Upload Files
            </h4>
            <p className="text-gray-600 text-xs font-outfit">
              Drag & drop files or click to browse. Supports PDF, DOC, TXT, Images, Audio
            </p>
          </div>
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-[#161950] bg-[#161950]/5"
                  : "border-gray-300 hover:border-[#161950]/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drop files here</p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.md,.mp3,.png,.jpg,.jpeg"
              />
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => {
                  const fileInput = document.getElementById('file-upload');
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-4">
            <h4 className="text-[#1A1A1A] text-base font-semibold font-outfit mb-1 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-[#161950]" />
              Website Link
            </h4>
            <p className="text-gray-600 text-xs font-outfit">
              Add website URLs for content extraction and analysis
            </p>
          </div>
          <div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="website-link">Website URL</Label>
                <Input
                  id="website-link"
                  type="url"
                  placeholder="https://example.com"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                />
              </div>
              <Button
                onClick={handleWebsiteSubmit}
                disabled={!websiteLink.trim()}
                className="w-full bg-[#161950] hover:bg-[#0f1440] text-white"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Extract Content
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-4">
            <h4 className="text-[#1A1A1A] text-base font-semibold font-outfit mb-1 flex items-center gap-2">
              <Type className="h-5 w-5 text-[#161950]" />
              Paste Text
            </h4>
            <p className="text-gray-600 text-xs font-outfit">
              Paste text content directly for analysis and processing
            </p>
          </div>
          <div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paste-text">Text Content</Label>
                <Textarea
                  id="paste-text"
                  placeholder="Paste your text content here..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleTextSubmit}
                disabled={!pastedText.trim()}
                className="w-full bg-[#161950] hover:bg-[#0f1440] text-white"
              >
                <Type className="h-4 w-4 mr-2" />
                Process Text
              </Button>
            </div>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-4">
            <h4 className="text-[#1A1A1A] text-base font-semibold font-outfit mb-1">Uploaded Files</h4>
            <p className="text-gray-600 text-xs font-outfit">
              Files uploaded and processed by AI for proposal generation
            </p>
          </div>
          <div>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {file.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-[#161950]" />
                      )}
                      {file.status === "uploading" && (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#161950] border-t-transparent"></div>
                      )}
                      {file.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-[#161950]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium font-outfit text-sm text-[#1A1A1A] truncate">{file.name}</p>
                      <p className="text-xs font-outfit text-gray-500">
                        {formatFileSize(file.size)} • {file.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs"
                      >
                        {file.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {savedFiles.length > 0 && (
        <div className="bg-[#161950]/5 rounded-2xl border border-[#161950]/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-5 w-5 text-[#161950] flex-shrink-0" />
            <div>
              <p className="font-medium font-outfit text-[#161950] mb-1">Saved Files ({savedFiles.length})</p>
              <p className="text-sm font-outfit text-gray-600">
                The following files have been saved and uploaded to S3:
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {savedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#161950]/20"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#161950] flex-shrink-0" />
                  <div>
                    <p className="font-medium font-outfit text-sm text-[#1A1A1A]">{file.name}</p>
                    <p className="text-xs font-outfit text-gray-500">
                      {formatFileSize(file.size)} • {file.category}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs"
                >
                  Saved
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedFiles.length === 0 && uploadedFiles.filter((f) => f.status === "completed").length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="font-outfit text-sm text-[#1A1A1A] text-center">
            Save uploaded items before moving to the next step.
          </p>
        </div>
      )}

      <div className="bg-[#161950]/5 rounded-2xl border border-[#161950]/20 p-6">
        <div className="flex items-center gap-3">
          <div className="animate-pulse w-3 h-3 bg-[#161950] rounded-full flex-shrink-0"></div>
          <div>
            <p className="font-medium font-outfit text-[#161950] mb-1">AI Processing Active</p>
            <p className="text-sm font-outfit text-gray-600">
              Documents are being analyzed and information extracted for
              proposal generation. Results will appear in the Plan tab.
            </p>
          </div>
        </div>
      </div>

      {/* Save and Next Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          onClick={async () => {
            const completedFiles = uploadedFiles.filter((f) => f.status === "completed");
            if (completedFiles.length === 0) {
              toast.error("Please upload at least one file before saving.");
              return;
            }

            let actualProposalId = proposalId;
            
            // If proposal doesn't exist, create it first
            if (!actualProposalId || actualProposalId === 'create') {
              if (!onCreateProposal) {
                toast.error("Please create the proposal first before uploading files.");
                return;
              }
              
              toast.info("Creating proposal first...");
              const newProposalId = await onCreateProposal();
              if (!newProposalId) {
                toast.error("Failed to create proposal. Please try again.");
                return;
              }
              actualProposalId = newProposalId;
            }

            setIsSaving(true);
            try {
              const uploadPromises = completedFiles.map(async (file) => {
                const actualFile = fileMap.get(file.id);
                if (!actualFile) {
                  throw new Error(`File not found for ${file.name}`);
                }

                const formData = new FormData();
                formData.append('file', actualFile);
                formData.append('category', 'attachment');

                // DO NOT set Content-Type manually - browser will set it with boundary
                const response = await apiClient.post(
                  `/proposals/${actualProposalId}/documents/upload`,
                  formData
                );

                console.log('[UploadTab] Upload response for file:', file.name, response.data);
                
                // The API returns ProposalResponse with documents array
                // The newly uploaded document should be the last one in the array
                // (since we're uploading one at a time, it will be the most recent)
                const documents = response.data?.documents || [];
                console.log('[UploadTab] Documents array length:', documents.length, documents);
                
                let documentId: string | undefined;
                
                if (documents.length > 0) {
                  const lastDocument = documents[documents.length - 1];
                  console.log('[UploadTab] Last document:', lastDocument);
                  
                  if (lastDocument?.id) {
                    documentId = lastDocument.id;
                  }
                }
                
                // Always mark as saved if API call succeeded, even if we can't extract document ID
                const savedFile = { 
                  ...file, 
                  serverId: documentId || file.id, 
                  status: 'completed' as const 
                };
                
                console.log('[UploadTab] Saved file object:', savedFile);
                return savedFile;
              });

              const uploadedResults = await Promise.all(uploadPromises);
              
              console.log('[UploadTab] Upload results:', uploadedResults);
              console.log('[UploadTab] Setting savedFiles to:', uploadedResults);
              
              // Merge new uploads with existing saved files (avoid duplicates)
              setSavedFiles(prev => {
                const existingIds = new Set(prev.map(f => f.serverId || f.id));
                const newFiles = uploadedResults.filter(f => !existingIds.has(f.serverId || f.id));
                return [...prev, ...newFiles];
              });
              
              // Invalidate proposal query to refresh data and reload existing documents
              if (actualProposalId) {
                await queryClient.invalidateQueries({ queryKey: proposalKeys.detail(actualProposalId) });
                console.log('[UploadTab] Invalidated proposal query cache');
                
                // Reload proposal data to sync with server
                const updatedProposal = await queryClient.fetchQuery({
                  queryKey: proposalKeys.detail(actualProposalId),
                  queryFn: async () => {
                    const response = await apiClient.get(`/proposals/${actualProposalId}`);
                    return response.data;
                  },
                });
                
                // Update savedFiles with all documents from proposal
                if (updatedProposal?.documents) {
                  const allDocuments: UploadedFile[] = updatedProposal.documents.map((doc: any) => ({
                    id: doc.id || Math.random().toString(36).substr(2, 9),
                    name: doc.name || 'Unknown file',
                    size: doc.extra_metadata?.file_size || 0,
                    type: doc.extra_metadata?.content_type || 'application/octet-stream',
                    category: doc.category || 'attachment',
                    status: 'completed' as const,
                    serverId: doc.id,
                  }));
                  setSavedFiles(allDocuments);
                  console.log('[UploadTab] Updated savedFiles from proposal:', allDocuments);
                }
              }
              
              toast.success(`${completedFiles.length} file(s) saved successfully!`);
              onSave?.();
            } catch (error: any) {
              console.error('Error saving files:', error);
              console.error('Error response:', error.response?.data);
              console.error('Error status:', error.response?.status);
              
              // Handle validation errors (422) - detail is an array of error objects
              let errorMessage = 'Failed to save files. Please try again.';
              if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                console.error('Validation error detail (full):', JSON.stringify(detail, null, 2));
                
                if (Array.isArray(detail) && detail.length > 0) {
                  // Format validation errors nicely
                  const firstError = detail[0];
                  console.error('First validation error:', firstError);
                  errorMessage = firstError.msg || `${firstError.type}: ${firstError.loc?.join('.') || 'validation error'}`;
                } else if (typeof detail === 'string') {
                  errorMessage = detail;
                } else {
                  errorMessage = JSON.stringify(detail);
                }
              } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              toast.error(errorMessage);
              // Don't update savedFiles on error, but also don't prevent Next button if files were already saved
            } finally {
              setIsSaving(false);
            }
          }}
          variant="outline"
          disabled={isSaving || uploadedFiles.filter((f) => f.status === "completed").length === 0}
          className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={onNext}
          disabled={savedFiles.length === 0}
          className="font-outfit bg-[#161950] hover:bg-[#0f1440] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
